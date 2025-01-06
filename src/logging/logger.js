//Файл logger.js
const winston = require('winston');
const { format } = winston;
const DailyRotateFile = require('winston-daily-rotate-file');  // Импортируем модуль для ротации логов

// Настройка логирования
const logger = winston.createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
        new winston.transports.Console(),
        // Ротация файлов логов каждый день
        new DailyRotateFile({
            filename: 'logs/crypto_signals-%DATE%.log',  // Шаблон для имени файла
            datePattern: 'YYYY-MM-DD',  // Формат даты в имени файла
            zippedArchive: true,  // Сжимать старые файлы логов
            maxSize: '5000m',  // Максимальный размер файла до ротации (например, 20 MB)
            maxFiles: '14d'  // Хранить логи за последние 14 дней
        })
    ]
});

module.exports = logger;

