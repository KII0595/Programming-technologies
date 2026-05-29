import re
from typing import List, Dict, Any
import time


def is_valid_email(email: str) -> bool:
    """Проверяет, является ли строка корректным email-адресом."""
    if not isinstance(email, str) or len(email) > 254:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        return False
    
    # Дополнительная проверка домена
    domain = email.split('@')[1]
    if len(domain.split('.')) < 2:
        return False
        
    return True


def sort_by_key(data: List[Dict[str, Any]], key: str, reverse: bool = False) -> List[Dict[str, Any]]:
    """Сортирует список словарей по указанному ключу."""
    if not data or not isinstance(data, list):
        return []
    return sorted(data, key=lambda x: x.get(key, 0), reverse=reverse)


def timing_decorator(func):
    """Декоратор для замера времени выполнения функции."""
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        execution_time = end_time - start_time
        print(f"Функция '{func.__name__}' выполнена за {execution_time:.6f} секунд")
        return result
    return wrapper
