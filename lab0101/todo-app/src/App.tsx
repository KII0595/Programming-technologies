import React, { useState } from 'react';
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Добавить
          </button>
        </div>

        {/* Список задач */}
        <div className="space-y-3">
          {tasks.map(task => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="h-5 w-5 text-blue-600"
                />

                <span
                  className={`${task.completed
                    ? 'line-through text-gray-500'
                    : 'text-gray-800'
                    }`}
                >
                  {task.text}
                </span>
              </div>

              <button
                onClick={() => removeTask(task.id)}
                className="px-3 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
              >
                Удалить
              </button>
            </div>
          ))}

          {/* Пустой список */}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Список задач пуст</p>
              <p className="text-sm">Добавьте первую задачу!</p>
            </div>
          )}
        </div>

        {/* Статистика */}
        <div className="mt-6 pt-4 border-t space-y-2">
          <p className="text-gray-600">
            Всего задач: {tasks.length}
          </p>

          <p className="text-gray-600">
            Выполнено: {completedTasks}
          </p>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all"
              style={{
                width: tasks.length
                  ? `${(completedTasks / tasks.length) * 100}%`
                  : '0%'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
