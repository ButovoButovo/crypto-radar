// analyzeSignals.js
const logger = require('../logging/logger'); // Модуль логирования (предположим, что у вас есть файл logger.js)

const VOLATILITY_THRESHOLD = 0.01; // Константа для порога волатильности

// Функция для анализа сигналов
function analyzeSignals(symbol, indicators, closePrices) {
    // Проверка наличия данных
    if (closePrices.length === 0 || indicators.atr.length === 0 || indicators.ema14.length === 0 || indicators.ema200.length === 0 || !indicators.bollingerBands.length || !indicators.vwap.length) {
        logger.error(`[${symbol}] Недостаточно данных для анализа сигналов.`);
        return { signal: 'NO_SIGNAL', atr: null, volatilityFilter: false, vwap: false };
    }

    const latestClose = closePrices[closePrices.length - 1];
    const lastATR = indicators.atr[indicators.atr.length - 1];
    const lastEMA14 = indicators.ema14[indicators.ema14.length - 1];
    const lastEMA200 = indicators.ema200[indicators.ema200.length - 1];
    const bollingerUpper = indicators.bollingerBands[indicators.bollingerBands.length - 1]?.upper;
    const bollingerLower = indicators.bollingerBands[indicators.bollingerBands.length - 1]?.lower;
    const vwap = indicators.vwap[indicators.vwap.length - 1];

    // Логирование значений
    logger.info(`[${symbol}] Цена закрытия: ${latestClose}, ATR: ${lastATR}, EMA14: ${lastEMA14}, EMA200: ${lastEMA200}, VWAP: ${vwap}`);
    logger.info(`[${symbol}] Линии Боллинджера: Верхняя ${bollingerUpper}, Нижняя ${bollingerLower}`);

    // Проверка на волатильность
    const volatilityFilter = lastATR > (latestClose * VOLATILITY_THRESHOLD);
    logger.info(`[${symbol}] Волатильность: ${volatilityFilter ? 'Пройдена' : 'Отклонена'}`);

    // Фильтрация по VWAP
    const vwapFilter = latestClose > vwap;
    logger.info(`[${symbol}] Фильтр VWAP: ${vwapFilter ? 'Выше VWAP' : 'Ниже VWAP'}`);

    // Сигнал по тренду
    let signal = 'NO_SIGNAL';

    // Логика для EMA
    if (lastEMA14 > lastEMA200) {
        if (latestClose > lastEMA14 && vwapFilter) {
            signal = 'BUY';
            logger.info(`[${symbol}] Сигнал BUY по EMA14 > EMA200 и VWAP.`);
        }
    } else if (lastEMA14 < lastEMA200) {
        if (latestClose < lastEMA14 && !vwapFilter) {
            signal = 'SELL';
            logger.info(`[${symbol}] Сигнал SELL по EMA14 < EMA200 и VWAP.`);
        }
    }

    // Логика для линий Боллинджера
    if (latestClose > bollingerUpper) {
        signal = 'SELL';
        logger.info(`[${symbol}] Сигнал SELL по пробою верхней линии Боллинджера.`);
    } else if (latestClose < bollingerLower) {
        signal = 'BUY';
        logger.info(`[${symbol}] Сигнал BUY по пробою нижней линии Боллинджера.`);
    }

    // Логика для линейной регрессии с улучшенной проверкой
    const regression = indicators.regression;
    const regressionSlope = regression?.slope;

    if (regressionSlope === undefined || regression === null) {
        logger.error(`[${symbol}] Наклон линейной регрессии неопределен или regression объект отсутствует.`);
        return { signal: 'NO_SIGNAL', atr: lastATR, volatilityFilter: false, vwap: false };
    }
    logger.info(`[${symbol}] Наклон линейной регрессии: ${regressionSlope}`);

    // Логика на основе наклона линейной регрессии
    if (regressionSlope > 0) {
        if (signal === 'BUY') {
            logger.info(`[${symbol}] Тренд подтвержден линейной регрессией (восходящий).`);
        } else {
            signal = 'BUY';
            logger.info(`[${symbol}] Линейная регрессия указывает на восходящий тренд, сигнал изменен на BUY.`);
        }
    } else if (regressionSlope < 0) {
        if (signal === 'SELL') {
            logger.info(`[${symbol}] Тренд подтвержден линейной регрессией (нисходящий).`);
        } else {
            signal = 'SELL';
            logger.info(`[${symbol}] Линейная регрессия указывает на нисходящий тренд, сигнал изменен на SELL.`);
        }
    }

    // Итоговый сигнал
    logger.info(`[${symbol}] Итоговый сигнал: ${signal}`);
    return { signal, atr: lastATR, volatilityFilter, vwap };
}

module.exports = { analyzeSignals };


