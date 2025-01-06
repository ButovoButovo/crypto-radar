const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const logger = require('../logging/logger'); // Логирование

const dbPath = path.join(__dirname, '../../signals.db');

// Функция для выполнения SQL-запросов
const runQuery = (db, query, params) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) {
                return reject(err);
            }
            resolve(this);
        });
    });
};

// Функция для инициализации базы данных и создания таблицы
const initDB = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                logger.error(`Ошибка подключения к базе данных: ${err.message}`);
                return reject(err);
            }
            logger.info('Подключение к базе данных успешно установлено.');
        });

        const createSignalsTable = `
            CREATE TABLE IF NOT EXISTS signals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                signal TEXT NOT NULL,
                stop_loss REAL,
                take_profit REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `;

        db.run(createSignalsTable, (err) => {
            if (err) {
                logger.error(`Ошибка создания таблицы: ${err.message}`);
                return reject(err);
            }
            logger.info('Таблица сигналов успешно создана или уже существует.');
            resolve(db); // Возвращаем объект базы данных для дальнейшего использования
        });
    });
};

// Функция для сохранения сигнала в базу данных
async function saveSignals(symbol, signals, stopLoss, takeProfit) {
    let db;
    try {
        // Инициализация базы данных и получение соединения
        db = await initDB();

        // Запрос на добавление сигнала
        const query = `INSERT INTO signals (symbol, signal, stop_loss, take_profit) VALUES (?, ?, ?, ?);`;
        await runQuery(db, query, [symbol, JSON.stringify(signals), stopLoss, takeProfit]);

        logger.info(`Сигнал для ${symbol} успешно сохранён в базу данных.`);
    } catch (err) {
        logger.error(`Ошибка при обработке сигнала для ${symbol}: ${err.message}`);
    } finally {
        if (db) {
            // Ожидаем закрытия базы данных только после выполнения всех операций
            db.close((err) => {
                if (err) {
                    logger.error(`Ошибка закрытия базы данных: ${err.message}`);
                } else {
                    logger.info('Соединение с базой данных закрыто.');
                }
            });
        }
    }
}

module.exports = { saveSignals };  // Экспортируем функцию для использования в других файлах
