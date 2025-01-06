const { fetchOHLCV } = require('../dataFetch/dataFetch'); // Импортируем функцию для получения OHLCV
const { indicatorsCalc } = require('../dataCalc/indicatorsCalc'); // Импортируем функцию для расчёта индикаторов
const { analyzeSignals } = require('../dataCalc/analyzeSignals'); // Импортируем функцию для анализа сигналов
const { calculateStopLossTakeProfit } = require('../dataCalc/takeProfitStopLoss'); // Импортируем функцию для стоп-лосса и тейк-профита
const logger = require('../logging/logger'); // Логирование
const { saveSignals } = require('../db/saveSignals');// Импортируем функцию для сохранения сигнала

async function processSignal(symbol) {
    try {
        // Получаем данные OHLCV и объемы
        const { ohlcv, volumes } = await fetchOHLCV(symbol);
        
        // Рассчитываем индикаторы
        const indicators = await indicatorsCalc(ohlcv, volumes);
        
        // Анализируем сигналы
        const { signal, atr, volatilityFilter, vwap } = analyzeSignals(symbol, indicators, ohlcv.map(candle => candle[4]));

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

        // Добавляем фильтрацию по волатильности
        if (!volatilityFilter) {
            logger.info(`Сигнал для ${symbol} отклонён из-за низкой волатильности.`);
            return;
        }

        // Логируем использование VWAP
        logger.info(`Последний VWAP для ${symbol}: ${vwap}`);

        // Проверка на наличие последней цены закрытия
        const lastClosePrice = ohlcv.length > 0 ? ohlcv[ohlcv.length - 1][4] : null;

        if (lastClosePrice === null) {
            logger.error(`Ошибка: нет данных о последней цене закрытия для ${symbol}`);
            return;
        }

        // Расчёт стоп-лосса и тейк-профита
        const stopLossTakeProfit = calculateStopLossTakeProfit(signal, lastClosePrice, atr);

        // Логируем сигнал и параметры
        logger.info(`Обрабатываем сигнал для ${symbol}. Сигнал: ${signal}, StopLoss: ${stopLossTakeProfit.stopLoss}, TakeProfit: ${stopLossTakeProfit.takeProfit}`);

        // Сохранение сигнала
        try {
            saveSignals(symbol, signal, stopLossTakeProfit.stopLoss, stopLossTakeProfit.takeProfit);
            logger.info(`Сигнал для ${symbol} сохранён успешно.`);
        } catch (saveError) {
            logger.error(`Ошибка при сохранении сигнала для ${symbol}: ${saveError.message}`);
        }
        
    } catch (error) {
        logger.error(`Ошибка обработки сигнала ${symbol}: ${error.message}`);
    }
}

module.exports = { processSignal };

