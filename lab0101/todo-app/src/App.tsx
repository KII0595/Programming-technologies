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
            className="flex-grow px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          <button
            onClick={addTask}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium whitespace-nowrap"
          >
            Добавить
          </button>
        </div>

        {/* Список задач */}
        <div className="space-y-3 mb-8">
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
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="h-6 w-6 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={`${task.completed ? 'line-through text-gray-400' : 'text-gray-800'} text-lg`}>
                    {task.text}
                  </span>
                </div>
                
                <button
                  onClick={() => removeTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Статистика */}
        {tasks.length > 0 && (
          <div className="pt-6 border-t">
            <div className="flex justify-between mb-3 text-gray-600">
              <p>Всего задач: <span className="font-semibold">{tasks.length}</span></p>
              <p>Выполнено: <span className="font-semibold text-green-600">{completedCount}</span></p>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
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
