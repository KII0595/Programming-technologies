require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📚 API доступно по адресу: http://localhost:${PORT}/api/tasks`);
  console.log(`🌐 Режим: ${process.env.NODE_ENV || 'development'}`);
});

// Обработка неожиданных ошибок
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
