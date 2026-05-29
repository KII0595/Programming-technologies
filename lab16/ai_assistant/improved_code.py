from typing import List, Dict, Any
import time


def validate_email(email: str) -> bool:
    """Проверяет корректность email-адреса."""
    if not isinstance(email, str) or not email or len(email) > 254:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        return False
    
    domain = email.split('@')[1]
    return len(domain.split('.')) >= 2


def sort_dicts_by_key(items: List[Dict[str, Any]], key: str, descending: bool = False) -> List[Dict[str, Any]]:
    """Сортирует список словарей по заданному ключу."""
    if not items:
        return []
    return sorted(items, key=lambda item: item.get(key, 0), reverse=descending)


def measure_execution_time(func):
    """Декоратор, измеряющий и выводящий время выполнения функции."""
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start
        print(f"Время выполнения {func.__name__}: {duration:.6f} сек.")
        return result
    return wrapper
