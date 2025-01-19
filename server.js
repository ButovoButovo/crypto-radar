// Файл server.js
// Запуск сервера
const logger = require('./src/logging/logger');
const { fetchAllSymbols} = require('./src/dataFetch/dataFetch'); // Подключение функций из dataFetch.js
const { processSignal } = require('./src/utils/processSignal');
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // Подключение к SQLite

const app = express();
const PORT = 3000;

// Открываем базу данных signals.db
const dbPath = path.join(__dirname, 'signals.db'); // Путь к базе данных
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        logger.error(`Ошибка при подключении к базе данных: ${err.message}`);
    } else {
        logger.info('Подключение к базе данных успешно установлено.');
    }
});

let symbols = []; // Список символов будет заполняться динамически
const data = {};  // Для хранения данных для визуализации

// Функция для обновления списка торговых пар
async function updateSymbols() {
    try {
        logger.info('Обновление списка торговых пар с USDT...');
        symbols = await fetchAllSymbols(); // Получаем список символов с USDT
        logger.info(`Получено ${symbols.length} торговых пар.`);
    } catch (error) {
        logger.error(`Ошибка при обновлении списка торговых пар: ${error.message}`);
    }
}

// Функция для обработки всех символов
async function monitorMarkets() {
    try {
        logger.info('Запуск мониторинга рынков...');
        if (symbols.length === 0) {
            logger.warn('Список символов пуст. Пожалуйста, обновите список.');
            return;
        }
        for (const symbol of symbols) {
            logger.info(`Обработка символа: ${symbol}`);
            const signalData = await processSignal(symbol); // Замените на свою логику получения данных
            // Пример данных для визуализации, нужно адаптировать под вашу логику
            data[symbol] = {
                time: Date.now(),
                signal: signalData,  // Здесь можно хранить сигналы или другие данные
            };
        }
        logger.info('Мониторинг завершён.');
    } catch (error) {
        logger.error(`Ошибка в мониторинге рынков: ${error.message}`);
    }
}

// Периодическое обновление списка торговых пар
const updateSymbolsInterval = 10 * 60 * 1000; // Обновляем список каждые 10 минут
setInterval(async () => {
    await updateSymbols();
}, updateSymbolsInterval);

// Периодическое выполнение мониторинга
const monitoringInterval = 20 * 1000; // 600 секунд
setInterval(async () => {
    await monitorMarkets();
}, monitoringInterval);

// Маршрут для получения данных из базы данных для визуализации
app.get('/api/market-data/bybit', (req, res) => {
    const query = `
        WITH RankedSignals AS ( 
            SELECT symbol, signal, stop_loss, take_profit, last_close_price, volumes, timestamp,
                ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY timestamp DESC) AS row_num
            FROM signals
        )
        SELECT symbol, signal, stop_loss, take_profit, last_close_price, volumes, timestamp
        FROM RankedSignals
        WHERE row_num = 1;
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            logger.error(`Ошибка при выполнении запроса: ${err.message}`);
            res.status(500).json({ error: 'Ошибка при получении данных' });
            return;
        }
        res.json(rows); // Отправляем данные в формате JSON
    });
});

// Статические файлы (например, для подключения CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Главная страница с визуализацией
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Запускаем сервер и обновляем список символов при старте
app.listen(PORT, async () => {
    logger.info(`Сервер запущен на порту ${PORT}`);
    await updateSymbols(); // Обновляем символы перед началом мониторинга
});
