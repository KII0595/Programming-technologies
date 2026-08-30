# Отчет по лабораторной работе №3  
## Основы Git: локальный и удалённый репозитории, ветки и слияние

**Дата:** 2025-12-28  
**Семестр:** 2 курс, 1 полугодие (3 семестр)  
**Группа:** ПИН-б-о-24-1  
**Дисциплина:** Технологии программирования  
**Студент:** Кочкарев Ислам Ильясович  

---

### Цель работы
Освоить базовые операции с Git: настройку, создание репозитория, коммиты, работу с ветками, слияние и публикацию на GitHub через SSH. Все действия выполнить через командную строку в среде **Windows 10**.

### Ход выполнения

### 1. Настройка Git и SSH
Глобальная конфигурация:

```powershell
git config --global user.name "Александр Куйбышев"
git config --global user.email "aks1de1337@yandex.ru"
```

Сгенерирован SSH-ключ (ed25519) с passphrase и добавлен в GitHub. Проверка подключения успешна.

---

### 2. Создание проекта и репозитория

В PowerShell (Windows 10):
```powershell
mkdir python-git-lab3
cd python-git-lab3
git init
```

---

### 3. Основной файл проекта

Создан файл temperature.py — конвертер температуры между Цельсиями и Фаренгейтами.
Файл temperature.py:

```python
def c_to_f(celsius):
    return (celsius * 9/5) + 32

def f_to_c(fahrenheit):
    return (fahrenheit - 32) * 5/9

if __name__ == "__main__":
    print("Конвертер температуры")
    try:
        temp = float(input("Введите температуру: "))
        unit = input("Единица (C или F): ").strip().upper()
        
        if unit == "C":
            print(f"{temp}°C = {c_to_f(temp):.2f}°F")
        elif unit == "F":
            print(f"{temp}°F = {f_to_c(temp):.2f}°C")
        else:
            print("Неизвестная единица")
    except ValueError:
        print("Некорректное число")
```

Добавление и коммит:
```powershell
git add temperature.py
git commit -m "Добавлен конвертер температуры"
```

---

### 4. Работа с веткой

Создана ветка feature/kelvin для добавления поддержки Кельвинов.
```powershell
git checkout -b feature/kelvin
```

Добавлены функции:
```python
def c_to_k(celsius):
    return celsius + 273.15

def k_to_c(kelvin):
    return kelvin - 273.15
```

И расширен основной блок:
```python
elif unit == "K":
            print(f"{temp} K = {k_to_c(temp):.2f}°C")
            print(f"{temp} K = {c_to_f(k_to_c(temp)):.2f}°F")
```

Коммит:
```powershell
git add temperature.py
git commit -m "Добавлена поддержка Кельвинов"
```

Слияние:
```powershell
git checkout main
git merge feature/kelvin
```

---

### 5. Публикация на GitHub

Создан репозиторий python-git-lab3 на GitHub.
```powershell
git remote add origin git@github.com:KII0595/python-git-lab3.git
git push -u origin main
git push origin feature/kelvin
```

---

### 6. Дополнительно

Добавлен .gitignore для исключения временных файлов Windows.
.gitignore:
```text
#Windows
Thumbs.db
Desktop.ini

# Python
__pycache__/
*.pyc
```

Коммит и push:
```powershell
git add .gitignore
git commit -m "Добавлен .gitignore"
git push
```

### Результаты

Программа temperature.py корректно конвертирует температуру в трёх единицах.

Репозиторий синхронизирован с GitHub, история коммитов чистая.

Ссылка на репозиторий: https://github.com/KII0595/python-git-lab3

### Скриншоты (в папке report)

git-setup.png
Настройка Git, генерация SSH-ключа, инициализация репозитория и первый коммит с temperature.py.

branch-merge.png
Создание ветки feature/kelvin, добавление функций Кельвина, коммит и слияние в main.

github-push.png
Подключение remote, push изменений, содержимое репозитория на GitHub и запуск python temperature.py в PowerShell.

### Выводы

Лабораторная работа позволила освоить ключевые команды Git в среде Windows 10 через PowerShell.

Настроен безопасный доступ по SSH, создан и опубликован репозиторий с ветвлением.

Практика показала важность фиксации изменений через коммиты и изоляции новых функций в отдельных ветках.

Полученные навыки будут применяться в дальнейших проектах для эффективного управления кодом.

Работа выполнена полностью через командную строку без GUI-инструментов. README.md не создавался.
