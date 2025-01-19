const { fetchOHLCV } = require('../dataFetch/dataFetch'); // Импортируем функцию для получения OHLCV
const { indicatorsCalc } = require('../dataCalc/indicatorsCalc'); // Импортируем функцию для расчёта индикаторов
const { analyzeSignals } = require('../dataCalc/analyzeSignals'); // Импортируем функцию для анализа сигналов
const { calculateStopLossTakeProfit } = require('../dataCalc/takeProfitStopLoss'); // Импортируем функцию для стоп-лосса и тейк-профита
const logger = require('../logging/logger'); // Логирование
const { saveSignals } = require('../db/saveSignals');// Импортируем функцию для сохранения сигнала

async function processSignal(symbol) {
    try {
        // Получаем данные OHLCV и volumes
        const { ohlcv, volumes } = await fetchOHLCV(symbol);

        // Рассчитываем индикаторы
        const indicators = await indicatorsCalc(ohlcv, volumes);

        // Анализируем сигналы
        const { signal, atr, volatilityFilter, vwap } = analyzeSignals(symbol, indicators, ohlcv.map(c => c[4]));

        // Проверка на наличие сигнала
        if (!signal || signal === 'NO_SIGNAL') {
            logger.warn(`Нет сигнала для ${symbol}`);
            return;
        }

        // Проверка на наличие ATR
        if (!atr) {
            logger.warn(`ATR не найден для ${symbol}`);
            return;
        }

        // Проверка на наличие волатильности
        if (!volatilityFilter) {
            logger.info(`Сигнал для ${symbol} отклонён из-за низкой волатильности.`);
            return;
        }

        // Логируем использование VWAP
        logger.info(`Последний VWAP для ${symbol}: ${vwap}`);

        // Получаем последнюю цену закрытия из ohlcv
        const lastClosePrice = ohlcv.length > 0 ? ohlcv[ohlcv.length - 1][4] : null;
        if (lastClosePrice === null) {
            logger.error(`Нет данных о последней цене закрытия для ${symbol}`);
            return;
        }

        // Расчёт стоп-лосса и тейк-профита
        const stopLossTakeProfit = calculateStopLossTakeProfit(signal, lastClosePrice, atr);
        logger.info(`Сигнал: ${signal}, StopLoss: ${stopLossTakeProfit.stopLoss}, TakeProfit: ${stopLossTakeProfit.takeProfit}`);

        // Проверка на наличие массива volumes и его длины
        if (!Array.isArray(volumes) || volumes.length === 0) {
            logger.warn(`Массив volumes пуст или не определён, сигнал для ${symbol} не сохранён.`);
            return;
        }

        // Получаем последний элемент массива volumes
        const lastVolume = volumes[volumes.length - 1];

        // Сохраняем сигнал с последним объёмом и последней ценой закрытия
        await saveSignals(symbol, signal, stopLossTakeProfit.stopLoss, stopLossTakeProfit.takeProfit, lastClosePrice, lastVolume);
        logger.info(`Сигнал для ${symbol} сохранён успешно.`);
    } catch (error) {
        logger.error(`Ошибка обработки сигнала для ${symbol}: ${error.message}\n${error.stack}`);
    }
}

module.exports = { processSignal };

