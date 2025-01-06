//Файл bybit.js
// Подключение к бирже
const ccxt = require('ccxt');
const logger = require('../logging/logger'); // Исправленный путь

let exchange;

try {
    // Инициализация подключения к бирже Bybit
    exchange = new ccxt.bybit({
        apiKey: process.env.API_KEY,
        secret: process.env.SECRET_KEY,
        enableRateLimit: true,
    });

    logger.info('Подключение к API Bybit успешно выполнено.');
} catch (error) {
    logger.error('Ошибка при подключении к API Bybit:', error.message);
    if (error.stack) {
        logger.error('Stack trace:', error.stack);
    }
}

module.exports = exchange; // Экспортируем объект
