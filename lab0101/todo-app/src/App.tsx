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
