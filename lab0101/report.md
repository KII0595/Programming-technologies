# **Отчет по лабораторной работе №1: React-приложение с Vite и знакомство с Next.js**

## Сведения о студенте  
**Дата:** 2026-05-16  
**Семестр:** 4 семестр  
**Группа:** ПИН-б-о-24-1(1)  
**Дисциплина:** Технологии программирования  
**Студент:** Кочкарев Ислам Ильясович  

---
### Структура готового проекта
```
lab0101/
├── todo-app/
│ ├── src/
│ │   ├── App.tsx          # Основной компонент приложения
│ │   ├── main.tsx         # Точка входа
│ │   └── index.css        # Глобальные стили с Tailwind
│ ├── public/              # Статические файлы
│ ├── index.html           # HTML шаблон
│ ├── package.json         # Зависимости и скрипты
│ ├── tailwind.config.js   # Конфигурация Tailwind
│ ├── vite.config.ts       # Конфигурация Vite
│ └── tsconfig.json        # Конфигурация TypeScript
├── portfolio-site/
│ ├── app/
│ │   ├── layout.tsx
│ │   ├── page.tsx
│ │   ├── about/
│ │   │   └── page.tsx
│ │   ├── blog/
│ │   │   ├── page.tsx
│ │   │   ├── data.ts
│ │   │   └── [slug]/
│ │   │       ├── page.tsx
│ │   │       └── not-found.tsx
│ │   ├── projects/
│ │   │   └── page.tsx
│ │   └── components/
│ │       └── ProjectCard.tsx
│ ├── public/
│ ├── package.json
│ ├── tailwind.config.js
│ └── tsconfig.json
└── report.md
```

---

## 🎯 Цель работы

- Освоить создание современных React-приложений с использованием **Vite** и **TypeScript**.
- Изучить мета-фреймворк **Next.js 14** (App Router), статическую генерацию (SSG) и файловую маршрутизацию.
- Получить практический опыт работы с компонентным подходом, управлением состоянием, Tailwind CSS и TypeScript.

---

---

## Часть 1. React-приложение с Vite — To-Do List

### Использованный стек
- **React 18** + **TypeScript**
- **Vite** (сборщик)
- **Tailwind CSS**
- React Hooks (`useState`)

### Реализованная функциональность
- ✅ Добавление задач
- ✅ Отметка задач как выполненных
- ✅ Удаление задач
- ✅ Прогресс выполнения (полоса)
- ✅ Обработка пустого списка
- ✅ Адаптивный дизайн

### Ключевой код — todo-app/src/App.tsx

```
import React, { useState } from 'react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: 'Изучить React', completed: true },
    { id: 2, text: 'Написать To-Do приложение', completed: false },
    { id: 3, text: 'Подготовить отчёт по лабораторной', completed: false },
  ]);

  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim() === '') return;
    
    const task: Task = {
      id: Date.now(),
      text: newTask.trim(),
      completed: false
    };
    
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 flex items-center justify-center gap-3">
          📝 Список задач
        </h1>
        
        {/* Форма добавления */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Что нужно сделать?"
            className="flex-1 px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <button
            onClick={addTask}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
          >
            Добавить
          </button>
        </div>

        {/* Список задач */}
        <div className="space-y-3 min-h-[300px]">
          {tasks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-6xl mb-4">📭</p>
              <p className="text-xl">Список задач пуст</p>
              <p className="text-sm mt-2">Добавьте первую задачу выше!</p>
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="h-6 w-6 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={`text-lg ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.text}
                  </span>
                </div>
                
                <button
                  onClick={() => removeTask(task.id)}
                  className="px-4 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Статистика */}
        {tasks.length > 0 && (
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-gray-600 text-lg">
              Выполнено: <span className="font-semibold text-green-600">{completedCount}</span> из {tasks.length}
            </p>
            <div className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-2 bg-green-500 transition-all duration-300"
                style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
```

Все обязательные и дополнительные задания выполнены.

---

## Часть 2. Сайт-портфолио (Next.js 14)

### Использованный стек
- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS**
- **Static Site Generation (SSG)**

### Реализованные страницы
- `/` — Главная
- `/about` — Обо мне
- `/blog` — Список статей
- `/blog/[slug]` — Динамические страницы статей
- `/projects` — Проекты (с переиспользуемым компонентом ProjectCard)

### Ключевые реализации
Генерация статических путей:
```
export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}
```

Динамический маршрут и 404-страница — реализованы.

---

## 📋 Ответы на контрольные вопросы

### Часть 1: React + Vite

1. **Принцип работы хука `useState`**  
   Хук `useState` добавляет локальное состояние в функциональный компонент. Возвращает массив из двух элементов: текущее значение состояния и функцию для его обновления. При обновлении состояния React автоматически перерисовывает компонент.

2. **Почему важно использовать неизменяемое состояние?**  
   Почему важно использовать неизменяемое состояние?
React определяет изменения состояния путём сравнения ссылок. При мутации массива/объекта ссылка не меняется, и React не видит изменений. Неизменяемость (`...spread`, `map`, `filter`) гарантирует корректную работу и предотвращает баги.

3. **Метод для удаления задачи**  
   Метод `filter()` — создаёт новый массив без удаляемого элемента, не мутируя исходный.

4. **Преимущества TypeScript в React**  
   - Раннее обнаружение ошибок на этапе компиляции
   - Автодополнение и навигация по коду
   - Самодокументируемость кода (интерфейсы пропсов)
   - Упрощение рефакторинга

### Часть 2: Next.js

1. **Что такое SSG и как реализован?**  
   **Static Site Generation** — генерация HTML-страниц на этапе сборки (`npm run build`). В проекте реализован через `generateStaticParams()` для страниц блога.

2. **Как работает файловая маршрутизация в Next.js?**  
   Папка `app/` соответствует маршрутам. Каждая папка = маршрут. Папка в квадратных скобках (`[slug]`) — динамические параметры.

3. **Преимущества `generateStaticParams`?**  
   - Предварительная генерация всех страниц
   - Максимальная производительность
   - Лучшее SEO
   - Нулевая нагрузка на сервер при запросах

4. **Разница `npm run dev` и `npm run build`?**  
   - `dev` — разработка с горячей перезагрузкой (HMR)
   - `build` — production-сборка: оптимизация, минификация, генерация статических файлов

---

## Результаты
- Оба проекта успешно запускаются (npm run dev)
- Выполнена сборка (npm run build) без ошибок
- Реализован чистый, типобезопасный и современный код
- Применены лучшие практики 2026 года (Vite, Next.js App Router, Tailwind, TypeScript)

## Выводы
В ходе выполнения лабораторной работы были успешно освоены ключевые современные инструменты и подходы фронтенд-разработки:
- Компонентная архитектура React
- Быстрая разработка с Vite + Tailwind
- Типизация с TypeScript
- Серверный рендеринг и статическая генерация в Next.js
- Файловая маршрутизация App Router
Полученные навыки соответствуют актуальным требованиям рынка и позволяют создавать высокопроизводительные, масштабируемые веб-приложения.
Лабораторная работа выполнена полностью.
