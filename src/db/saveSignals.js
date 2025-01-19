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

// Функция для инициализации базы данных
const initDB = () => {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            logger.error(`Ошибка подключения к базе данных: ${err.message}`);
            throw err;
        }
        logger.info('Подключение к базе данных успешно установлено.');
    });
    return db;
};

// Функция для создания таблицы
const createSignalsTable = (db) => {
    const query = `
    CREATE TABLE IF NOT EXISTS signals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        signal TEXT NOT NULL,
        stop_loss REAL,
        last_close_price REAL,
        take_profit REAL,
        volumes TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `;
    return runQuery(db, query, []);
};

// Функция для сохранения сигнала в базу данных
async function saveSignals(symbol, signals, stopLoss, takeProfit, lastClosePrice, volumes) {
    let db;
    try {
        // Инициализация базы данных и создание таблицы, если требуется
        db = initDB();
        await createSignalsTable(db);

        // Запрос на добавление сигнала
        const query = `INSERT INTO signals (symbol, signal, stop_loss, take_profit, last_close_price, volumes) VALUES (?, ?, ?, ?, ?, ?);`;
        await runQuery(db, query, [symbol, JSON.stringify(signals), stopLoss, takeProfit, lastClosePrice, JSON.stringify(volumes)]);

        logger.info(`Сигнал для ${symbol} успешно сохранён в базу данных.`);
    } catch (err) {
        logger.error(`Ошибка при обработке сигнала для ${symbol}: ${err.message}`);
    } finally {
        if (db) {
            await new Promise((resolve, reject) => {
                db.close((err) => {
                    if (err) {
                        logger.error(`Ошибка закрытия базы данных: ${err.message}`);
                        return reject(err);
                    }
                    logger.info('Соединение с базой данных закрыто.');
                    resolve();
                });
            });
        }
    }
}

module.exports = { saveSignals };
