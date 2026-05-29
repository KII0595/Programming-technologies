import os
from dotenv import load_dotenv

load_dotenv()

def get_credentials() -> str:
    """Возвращает credentials для GigaChat."""
    creds = os.getenv("GIGACHAT_CREDENTIALS")
    if not creds:
        raise ValueError("Не найдены GIGACHAT_CREDENTIALS в .env файле")
    return creds

def get_model_name() -> str:
    """Возвращает название используемой модели."""
    return os.getenv("GIGACHAT_MODEL", "GigaChat")
