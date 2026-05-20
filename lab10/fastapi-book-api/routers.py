from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date, timedelta
from collections import defaultdict

from models import BookCreate, BookResponse, BookUpdate, BorrowRequest, BookDetailResponse, Genre

router = APIRouter()

from main import books_db, borrow_records, get_next_id, book_to_response

@router.get("/books", response_model=List[BookResponse])
async def get_books(
    genre: Optional[Genre] = Query(None, description="Фильтр по жанру"),
    author: Optional[str] = Query(None, description="Фильтр по автору"),
    available_only: bool = Query(False, description="Только доступные книги"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    filtered_books = []
    for book_id, book_data in books_db.items():
        if genre and book_data["genre"] != genre:
            continue
        if author and author.lower() not in book_data["author"].lower():
            continue
        if available_only and not book_data.get("available", True):
            continue
        filtered_books.append(book_to_response(book_id, book_data))
    
    # Пагинация
    return filtered_books[skip : skip + limit]


@router.get("/books/{book_id}", response_model=BookDetailResponse)
async def get_book(book_id: int):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    
    book_data = books_db[book_id]
    response = BookDetailResponse(
        id=book_id,
        title=book_data["title"],
        author=book_data["author"],
        genre=book_data["genre"],
        publication_year=book_data["publication_year"],
        pages=book_data["pages"],
        isbn=book_data["isbn"],
        available=book_data.get("available", True)
    )
    
    if book_id in borrow_records:
        rec = borrow_records[book_id]
        response.borrowed_by = rec["borrower_name"]
        response.borrowed_date = rec["borrowed_date"]
        response.return_date = rec["return_date"]
    
    return response


@router.post("/books", response_model=BookResponse, status_code=201)
async def create_book(book: BookCreate):
    for b in books_db.values():
        if b["isbn"] == book.isbn:
            raise HTTPException(status_code=400, detail="Книга с таким ISBN уже существует")
    
    book_id = get_next_id()
    books_db[book_id] = {**book.model_dump(), "available": True}
    return book_to_response(book_id, books_db[book_id])


@router.put("/books/{book_id}", response_model=BookResponse)
async def update_book(book_id: int, book_update: BookUpdate):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    
    current = books_db[book_id]
    update_data = book_update.model_dump(exclude_unset=True)
    
    if "isbn" in update_data:
        for bid, b in books_db.items():
            if bid != book_id and b["isbn"] == update_data["isbn"]:
                raise HTTPException(status_code=400, detail="ISBN уже используется")
    
    current.update(update_data)
    return book_to_response(book_id, current)


@router.delete("/books/{book_id}", status_code=204)
async def delete_book(book_id: int):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    if not books_db[book_id].get("available", True):
        raise HTTPException(status_code=400, detail="Нельзя удалить взятую книгу")
    
    del books_db[book_id]
    borrow_records.pop(book_id, None)
    return None


@router.post("/books/{book_id}/borrow", response_model=BookDetailResponse)
async def borrow_book(book_id: int, borrow_request: BorrowRequest):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    if not books_db[book_id].get("available", True):
        raise HTTPException(status_code=400, detail="Книга уже взята")
    
    books_db[book_id]["available"] = False
    borrow_records[book_id] = {
        "borrower_name": borrow_request.borrower_name,
        "borrowed_date": date.today(),
        "return_date": date.today() + timedelta(days=borrow_request.return_days)
    }
    return await get_book(book_id)


@router.post("/books/{book_id}/return", response_model=BookResponse)
async def return_book(book_id: int):
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    if books_db[book_id].get("available", True):
        raise HTTPException(status_code=400, detail="Книга уже доступна")
    
    books_db[book_id]["available"] = True
    borrow_records.pop(book_id, None)
    return book_to_response(book_id, books_db[book_id])


@router.get("/stats")
async def get_library_stats():
    total = len(books_db)
    available = sum(1 for b in books_db.values() if b.get("available", True))
    borrowed = total - available
    
    books_by_genre = defaultdict(int)
    author_count = defaultdict(int)
    
    for book in books_db.values():
        books_by_genre[book["genre"]] += 1
        author_count[book["author"]] += 1
    
    most_prolific = max(author_count.items(), key=lambda x: x[1]) if author_count else None
    
    return {
        "total_books": total,
        "available_books": available,
        "borrowed_books": borrowed,
        "books_by_genre": dict(books_by_genre),
        "most_prolific_author": most_prolific[0] if most_prolific else None
    }
