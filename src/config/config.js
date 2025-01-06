//Файл config.js

const dotenv = require('dotenv');

// Загрузка переменных окружения
dotenv.config();

// Проверка наличия API ключей
const { API_KEY, SECRET_KEY } = process.env;
if (!API_KEY || !SECRET_KEY) {
    console.error('API ключи отсутствуют. Убедитесь, что переменные окружения установлены.');
    process.exit(1);
}
