from gigachat import GigaChat
from gigachat.models import Chat, Messages, MessagesRole
from utils import get_credentials, get_model_name


class AIAssistant:
    def __init__(self):
        self.client = GigaChat(
            credentials=get_credentials(),
            model=get_model_name(),
            verify_ssl_certs=False
        )

    def send_prompt(self, prompt: str, temperature: float = 0.7) -> str:
        """Отправляет промпт в GigaChat и возвращает очищенный ответ."""
        messages = Messages(
            role=MessagesRole.USER,
            content=prompt
        )
        
        chat = Chat(
            messages=[messages],
            temperature=temperature,
            max_tokens=3000
        )

        response = self.client.chat(chat)
        text = response.choices[0].message.content

        # Очистка от markdown-обрамления
        if text.startswith("```python"):
            text = text.split("```python")[1]
        if text.startswith("```"):
            text = text.split("```")[1]
        if text.endswith("```"):
            text = text.rsplit("```", 1)[0]

        return text.strip()
