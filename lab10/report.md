# Отчёт по лабораторной работе №1001-API, №1002-API
**Тема:** Разработка REST API на FastAPI и Express  
**Студент:** Кочкарев Ислам Ильясович 
**Группа:** ПИН-б-о-24-1(1)

## Часть 1: API на FastAPI (Python)

### Описание реализации
В данной части было создано API для управления библиотекой книг. 
Реализованы следующие функции:
1. CRUD операции для книг (создание, получение списка, обновление, удаление).
2. Фильтрация книг по жанру, автору и доступности.
3. Пагинация списка книг.
4. Логика заимствования (`borrow`) и возврата (`return`) книг с проверкой доступности.
5. Проверка уникальности ISBN при создании и обновлении.
6. Статистика библиотеки (общее кол-во, по жанрам, самый активный автор).

### Исходный код (routers.py)
```python
from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import List, Optional
from datetime import date, timedelta

from models import BookCreate, BookResponse, BookUpdate, BorrowRequest, BookDetailResponse, Genre

router = APIRouter()

from main import books_db, borrow_records, get_next_id, book_to_response

# ---------- GET /books ----------
@router.get("/books", response_model=List[BookResponse])
async def get_books(
    genre: Optional[Genre] = Query(None, description="Фильтр по жанру"),
    author: Optional[str] = Query(None, description="Фильтр по автору"),
    available_only: bool = Query(False, description="Только доступные книги"),
    skip: int = Query(0, ge=0, description="Количество книг для пропуска"),
    limit: int = Query(100, ge=1, le=1000, description="Лимит книг на странице")
):
    filtered_books = []
    
    for book_id, book_data in books_db.items():
        passes = True
        
        # Фильтр по жанру
        if genre:
            if book_data["genre"] != genre:
                passes = False
        
        # Фильтр по автору
        if author and passes:
            if author.lower() not in book_data["author"].lower():
                passes = False
        
        # Фильтр по доступности
        if available_only and passes:
            if not book_data.get("available", True):
                passes = False
        
        if passes:
            filtered_books.append(book_to_response(book_id, book_data))
    
    # Пагинация
    paginated = filtered_books[skip : skip + limit]
    return paginated

# ---------- GET /books/{book_id} ----------
@router.get("/books/{book_id}", response_model=BookDetailResponse)
async def get_book(book_id: int):
    # Проверяем существование книги
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
        record = borrow_records[book_id]
        response.borrowed_by = record["borrower_name"]
        response.borrowed_date = record["borrowed_date"]
        response.return_date = record["return_date"]
    
    return response

# ---------- POST /books ----------
@router.post("/books", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def create_book(book: BookCreate):
    # Проверяем уникальность ISBN
    for existing_book in books_db.values():
        if existing_book["isbn"] == book.isbn:
            raise HTTPException(
                status_code=400,
                detail="Книга с таким ISBN уже существует"
            )
    
    book_id = get_next_id()
    # Сохраняем книгу в БД
    books_db[book_id] = {
        "title": book.title,
        "author": book.author,
        "genre": book.genre,
        "publication_year": book.publication_year,
        "pages": book.pages,
        "isbn": book.isbn,
        "available": True
    }
    
    return book_to_response(book_id, books_db[book_id])

# ---------- PUT /books/{book_id} ----------
@router.put("/books/{book_id}", response_model=BookResponse)
async def update_book(book_id: int, book_update: BookUpdate):
    # Проверяем существование книги
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    
    current = books_db[book_id]
    
    # Получаем только те поля, которые были переданы в запросе
    update_data = book_update.dict(exclude_unset=True)
    
    # Если передан ISBN, проверяем его уникальность (исключая текущую книгу)
    if "isbn" in update_data:
        for other_id, other_book in books_db.items():
            if other_id != book_id and other_book["isbn"] == update_data["isbn"]:
                raise HTTPException(
                    status_code=400,
                    detail="Книга с таким ISBN уже существует"
                )
    
    # Обновляем поля
    current.update(update_data)
    
    # Сохраняем обновлённую книгу
    
    return book_to_response(book_id, books_db[book_id])

# ---------- DELETE /books/{book_id} ----------
@router.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(book_id: int):
    # Проверяем существование книги
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    
    # Проверяем, что книга не взята
    if not books_db[book_id].get("available", True):
        raise HTTPException(
            status_code=400,
            detail="Нельзя удалить книгу, которая в данный момент взята"
        )
    
    # Удаляем книгу из БД
    del books_db[book_id]
    
    # Если есть запись о заимствовании, удаляем её 
    if book_id in borrow_records:
        del borrow_records[book_id]
    
    return None

# ---------- POST /books/{book_id}/borrow ----------
@router.post("/books/{book_id}/borrow", response_model=BookDetailResponse)
async def borrow_book(book_id: int, borrow_request: BorrowRequest):
    # Проверяем существование книги
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    
    book_data = books_db[book_id]
    
    # Проверяем, доступна ли книга
    if not book_data.get("available", True):
        raise HTTPException(
            status_code=400,
            detail="Книга уже взята"
        )
    
    # Обновляем статус книги
    book_data["available"] = False
    
    # Вычисляем даты
    today = date.today()
    return_date = today + timedelta(days=borrow_request.return_days)
    
    # Сохраняем запись о заимствовании
    borrow_records[book_id] = {
        "borrower_name": borrow_request.borrower_name,
        "borrowed_date": today,
        "return_date": return_date
    }
    
    # Формируем ответ с деталями
    response = BookDetailResponse(
        id=book_id,
        title=book_data["title"],
        author=book_data["author"],
        genre=book_data["genre"],
        publication_year=book_data["publication_year"],
        pages=book_data["pages"],
        isbn=book_data["isbn"],
        available=False,
        borrowed_by=borrow_request.borrower_name,
        borrowed_date=today,
        return_date=return_date
    )
    return response

# ---------- POST /books/{book_id}/return ----------
@router.post("/books/{book_id}/return", response_model=BookResponse)
async def return_book(book_id: int):
    # Проверяем существование книги
    if book_id not in books_db:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    
    book_data = books_db[book_id]
    
    # Проверяем, что книга действительно взята
    if book_data.get("available", True):
        raise HTTPException(
            status_code=400,
            detail="Книга не была взята"
        )
    
    # Возвращаем книгу
    book_data["available"] = True
    
    # Удаляем запись о заимствовании
    if book_id in borrow_records:
        del borrow_records[book_id]
    
    return book_to_response(book_id, book_data)

# ---------- GET /stats ----------
@router.get("/stats")
async def get_library_stats():
    stats = {
        "total_books": 0,
        "available_books": 0,
        "borrowed_books": 0,
        "books_by_genre": {},
        "most_prolific_author": None
    }
    
    author_counts = {}
    
    for book_data in books_db.values():
        stats["total_books"] += 1
        
        # Доступностьф
        if book_data.get("available", True):
            stats["available_books"] += 1
        else:
            stats["borrowed_books"] += 1
        
        # Жанры
        genre = book_data["genre"]
        stats["books_by_genre"][genre] = stats["books_by_genre"].get(genre, 0) + 1
        
        # Авторы
        author = book_data["author"]
        author_counts[author] = author_counts.get(author, 0) + 1
    
    if author_counts:
        stats["most_prolific_author"] = max(author_counts, key=author_counts.get)
    
    return stats
```

### Ответы на вопросы (Часть 1)
1. **Преимущества Pydantic:** Обеспечивает строгую валидацию типов данных, автоматическую генерацию JSON-схем для Swagger и удобное преобразование данных в объекты Python.
2. **Автоматическая документация:** FastAPI анализирует типы и модели, генерируя спецификацию OpenAPI, которая визуализируется через Swagger UI (`/docs`).
3. **Уникальность ISBN:** Гарантирует отсутствие дублей в каталоге, так как ISBN — это уникальный идентификатор издания.
4. **Статус-коды:** Использованы `200 OK`, `201 Created` (создание), `204 No Content` (удаление), `400 Bad Request` (ошибки логики) и `404 Not Found`.

---

## Часть 2: API на Express (Node.js)

### Описание реализации
Реализован менеджер задач с хранением данных в JSON-файле.
Функционал включает:
1. Чтение и запись данных в `tasks.json` через `fs.promises`.
2. Валидация входных данных с помощью библиотеки **Joi**.
3. Фильтрация задач по категориям, статусу выполнения и приоритету.
4. Сортировка и пагинация результатов.
5. Полнотекстовый поиск по названию и описанию.
6. Безопасность: использование `helmet` и `express-rate-limit`.

### Проверка работоспособности (Health Check)
![Health Check Express](file:///C:/Users/David/.gemini/antigravity/brain/a8ac6be2-836b-43a9-ae75-8a4ecad6cd35/express_health_check_1773947004181.png)

### Исходный код (src/routes/tasks.js)
```javascript
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { 
  validateCreateTask, 
  validateUpdateTask, 
  validateId 
} = require('../middleware/validation');
const { 
  initializeDataFile, 
  readData, 
  writeData, 
  getNextId 
} = require('../utils/fileOperations');

// Инициализация файла данных при запуске
initializeDataFile();

// GET /api/tasks - получение всех задач с фильтрацией и пагинацией
router.get('/', async (req, res, next) => {
  try {
    const { category, completed, priority, sortBy, page = 1, limit = 10 } = req.query;
    const data = await readData();
    
    let tasks = [...data.tasks];
    
    // Фильтрация по категории
    if (category) {
      tasks = tasks.filter(task => task.category === category);
    }
    
    // Фильтрация по статусу выполнения
    if (completed !== undefined) {
      const isCompleted = completed === 'true';
      tasks = tasks.filter(task => task.completed === isCompleted);
    }
    
    // Фильтрация по приоритету
    if (priority) {
      const priorityNum = parseInt(priority);
      if (!isNaN(priorityNum) && priorityNum >= 1 && priorityNum <= 5) {
        tasks = tasks.filter(task => task.priority === priorityNum);
      }
    }
    
    // Сортировка
    if (sortBy) {
      const sortField = sortBy.startsWith('-') ? sortBy.slice(1) : sortBy;
      const sortOrder = sortBy.startsWith('-') ? -1 : 1;
      
      tasks.sort((a, b) => {
        if (a[sortField] < b[sortField]) return -sortOrder;
        if (a[sortField] > b[sortField]) return sortOrder;
        return 0;
      });
    }
    
    // Пагинация
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedTasks = tasks.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      count: tasks.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(tasks.length / limitNum),
      data: paginatedTasks
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id - получение задачи по ID
router.get('/:id', validateId, async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const data = await readData();
    
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Задача не найдена'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - создание новой задачи
router.post('/', validateCreateTask, async (req, res, next) => {
  try {
    const { title, description, category, priority, dueDate } = req.body;
    const data = await readData();
    
    const newTask = {
      id: await getNextId(),
      uuid: uuidv4(),
      title,
      description: description || '',
      category: category || 'personal',
      priority: priority || 3,
      dueDate: dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.tasks.push(newTask);
    await writeData(data);
    
    res.status(201).json({
      success: true,
      message: 'Задача успешно создана',
      data: newTask
    });
    
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id - полное обновление задачи
router.put('/:id', validateId, validateUpdateTask, async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;
    const data = await readData();
    
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Задача не найдена'
      });
    }
    
    // Обновляем задачу: сохраняем старые поля, заменяем новыми
    const updatedTask = {
      ...data.tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    data.tasks[taskIndex] = updatedTask;
    await writeData(data);
    
    res.json({
      success: true,
      message: 'Задача успешно обновлена',
      data: updatedTask
    });
    
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tasks/:id/complete - отметка задачи как выполненной
router.patch('/:id/complete', validateId, async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const data = await readData();
    
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Задача не найдена'
      });
    }
    
    task.completed = true;
    task.updatedAt = new Date().toISOString();
    await writeData(data);
    
    res.json({
      success: true,
      message: 'Задача отмечена как выполненная',
      data: task
    });
    
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id - удаление задачи
router.delete('/:id', validateId, async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const data = await readData();
    
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Задача не найдена'
      });
    }
    
    data.tasks.splice(taskIndex, 1);
    await writeData(data);
    
    res.json({
      success: true,
      message: 'Задача успешно удалена'
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/stats/summary - статистика по задачам
router.get('/stats/summary', async (req, res, next) => {
  try {
    const data = await readData();
    const tasks = data.tasks;
    
    const stats = {
      total: tasks.length,
      completed: 0,
      pending: 0,
      overdue: 0,
      byCategory: {},
      byPriority: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      }
    };
    
    const now = new Date();
    
    tasks.forEach(task => {
      // Выполненные / невыполненные
      if (task.completed) {
        stats.completed++;
      } else {
        stats.pending++;
        
        // Просроченные (если есть dueDate и она меньше текущей даты)
        if (task.dueDate && new Date(task.dueDate) < now) {
          stats.overdue++;
        }
      }
      
      // По категориям
      const cat = task.category;
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
      
      // По приоритетам
      const prio = task.priority;
      if (stats.byPriority[prio] !== undefined) {
        stats.byPriority[prio]++;
      }
    });
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/search/text - поиск задач
router.get('/search/text', async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Поисковый запрос должен содержать минимум 2 символа'
      });
    }
    
    const data = await readData();
    const searchTerm = q.toLowerCase().trim();
    
    const results = data.tasks.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(searchTerm);
      const descMatch = task.description.toLowerCase().includes(searchTerm);
      return titleMatch || descMatch;
    });
    
    res.json({
      success: true,
      count: results.length,
      data: results
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

### Ответы на вопросы (Часть 2)
1. **Middleware:** Использованы `express.json` (парсинг), `cors`, `helmet` (безопасность), `rate-limit` (защита от частых запросов) и кастомные обработчики ошибок.
2. **Валидация Joi vs Pydantic:** Joi — декларативная библиотека для JS, работающая как middleware. Pydantic — встроенная в типы Python система, обеспечивающая более глубокую интеграцию с IDE и FastAPI.
3. **Файловое хранение:** Идеально для небольших проектов и обучения, так как не требует настройки СУБД и позволяет легко проверять состояние «базы» в файле.
4. **Улучшения для Production:** Использование реальной БД (PostgreSQL/MongoDB), внедрение JWT-авторизации, логирование в файлы (Winston) и контейнеризация (Docker).

---

## Вывод
В ходе лабораторной работы были изучены два разных подхода к бэкенд-разработке: типизированный и быстрый FastAPI на Python и гибкий событийный Express на Node.js. Закреплены навыки работы с REST, HTTP-статусами, валидацией данных и принципами построения архитектуры веб-сервисов.
