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

initializeDataFile();

// GET /api/tasks
router.get('/', async (req, res, next) => {
  try {
    const { category, completed, priority, sortBy, page = 1, limit = 10 } = req.query;
    const data = await readData();
    let tasks = [...data.tasks];

    // Фильтрация
    if (category) tasks = tasks.filter(t => t.category === category);
    if (completed !== undefined) {
      const isCompleted = completed === 'true';
      tasks = tasks.filter(t => t.completed === isCompleted);
    }
    if (priority) tasks = tasks.filter(t => t.priority === parseInt(priority));

    // Сортировка
    if (sortBy) {
      const order = sortBy.startsWith('-') ? -1 : 1;
      const field = sortBy.replace('-', '');
      tasks.sort((a, b) => {
        if (field === 'dueDate') return order * (new Date(a.dueDate) - new Date(b.dueDate));
        if (field === 'priority') return order * (a.priority - b.priority);
        if (field === 'createdAt') return order * (new Date(a.createdAt) - new Date(b.createdAt));
        return 0;
      });
    }

    // Пагинация
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = tasks.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      count: tasks.length,
      page: parseInt(page),
      limit: parseInt(limit),
      data: paginated
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id
router.get('/:id', validateId, async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const data = await readData();
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ success: false, error: 'Задача не найдена' });
    
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks
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

// PUT /api/tasks/:id
router.put('/:id', validateId, validateUpdateTask, async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;
    const data = await readData();
    
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return res.status(404).json({ success: false, error: 'Задача не найдена' });
    
    data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updates, updatedAt: new Date().toISOString() };
    await writeData(data);
    
    res.json({
      success: true,
      message: 'Задача успешно обновлена',
      data: data.tasks[taskIndex]
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tasks/:id/complete
router.patch('/:id/complete', validateId, async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const data = await readData();
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ success: false, error: 'Задача не найдена' });
    
    task.completed = true;
    task.updatedAt = new Date().toISOString();
    await writeData(data);
    
    res.json({ success: true, message: 'Задача отмечена как выполненная', data: task });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', validateId, async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const data = await readData();
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return res.status(404).json({ success: false, error: 'Задача не найдена' });
    
    data.tasks.splice(taskIndex, 1);
    await writeData(data);
    
    res.json({ success: true, message: 'Задача успешно удалена' });
  } catch (error) {
    next(error);
  }
});

// Stats
router.get('/stats/summary', async (req, res, next) => {
  try {
    const data = await readData();
    const tasks = data.tasks;
    const now = new Date();
    
    const stats = {
      total: tasks.length,
      completed: 0,
      pending: 0,
      overdue: 0,
      byCategory: {},
      byPriority: {1:0, 2:0, 3:0, 4:0, 5:0}
    };
    
    tasks.forEach(task => {
      if (task.completed) stats.completed++;
      else stats.pending++;
      
      if (!task.completed && task.dueDate && new Date(task.dueDate) < now) stats.overdue++;
      
      stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1;
      stats.byPriority[task.priority]++;
    });
    
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// Search
router.get('/search/text', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Поисковый запрос должен содержать минимум 2 символа' });
    }
    
    const data = await readData();
    const searchTerm = q.toLowerCase().trim();
    const results = data.tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) || 
      (task.description && task.description.toLowerCase().includes(searchTerm))
    );
    
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
