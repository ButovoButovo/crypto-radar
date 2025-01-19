// Файл dataFetch.js
// Извлечение данных
const exchange = require('../api/bybit'); // Путь должен быть таким
const logger = require('../logging/logger'); // Исправленный путь

// Функция для получения данных свечей и объёмов торгов
async function fetchOHLCV(symbol, timeframe = '1h', limit = 200) {
    try {
        logger.info(`Запрос OHLCV данных для ${symbol}, timeframe: ${timeframe}, limit: ${limit}`);
        
        // Получаем данные OHLCV от API
        const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);
        
        // Проверка на пустые или некорректные данные
        if (!ohlcv || ohlcv.length === 0) {
            logger.warn(`Нет данных OHLCV для ${symbol} с таймфреймом ${timeframe}`);
            return { ohlcv: [], volumes: [] }; // Возвращаем пустые массивы в случае ошибки
        }

        // Дополнительная проверка на корректную структуру данных
        for (let i = 0; i < ohlcv.length; i++) {
            if (ohlcv[i].length !== 6) {
                logger.error(`Некорректные данные OHLCV для свечи ${i}: ${JSON.stringify(ohlcv[i])}`);
                throw new Error(`Некорректные данные OHLCV для свечи ${i}`);
            }
        }

        // Извлечение объемов (если структура данных правильная)
        const volumes = ohlcv.map(candle => candle[5]);

        logger.debug(JSON.stringify(volumes));

        logger.info(`Данные OHLCV для ${symbol} успешно получены.`);
        return { ohlcv, volumes };
    } catch (error) {
        // Логируем ошибку с подробностями
        logger.error(`Ошибка получения данных OHLCV для ${symbol} с таймфреймом ${timeframe}: ${error.message}`);
        throw error; // Прокидываем ошибку дальше
    }
}

// Функция для получения всех доступных торговых пар с суффиксом USDT
async function fetchAllSymbols() {
    try {
        logger.info('Запрос доступных торговых пар с суффиксом USDT.');
        
        // Получаем все доступные рынки через API
        const markets = await exchange.loadMarkets();
        
        // Фильтруем только пары, заканчивающиеся на /USDT
        const symbols = Object.keys(markets).filter(symbol => symbol.endsWith('/USDT'));
        
        if (symbols.length === 0) {
            logger.warn('Не найдено торговых пар с USDT.');
        } else {
            logger.info(`Найдено ${symbols.length} торговых пар с USDT.`);
        }
        
        return symbols;
    } catch (error) {
        logger.error(`Ошибка при получении торговых пар: ${error.message}`);
        return []; // Возвращаем пустой массив в случае ошибки
    }
}

module.exports = { fetchOHLCV, fetchAllSymbols };
