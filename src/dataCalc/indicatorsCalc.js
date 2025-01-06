const technicalIndicators = require('technicalindicators'); // Библиотека для технических индикаторов
const logger = require('../logging/logger'); // Модуль логирования (предположим, что у вас есть файл logger.js)
const ss = require('simple-statistics'); // Библиотека для статистических вычислений
const indicatorSettings = require('../config/indicatorSettings'); // Модуль с настройками индикаторов

// Функция для расчёта индикаторов с настройками, включая расчёт VWAP
async function indicatorsCalc(candles, volumes) {
    if (!candles || candles.length === 0 || !volumes || volumes.length === 0) {
        logger.error('Нет данных для расчёта индикаторов.');
        return null; // Возвращаем null в случае отсутствия данных
    }

    const closePrices = candles.map((candle) => candle[4]);
    const highPrices = candles.map((candle) => candle[2]);
    const lowPrices = candles.map((candle) => candle[3]);

    try {
        // Рассчёт индикатора ATR
        logger.info('Расчёт индикатора ATR начат.');
        const atr = technicalIndicators.ATR.calculate({
            high: highPrices,
            low: lowPrices,
            close: closePrices,
            period: indicatorSettings.atr.period,
        });
        if (atr && atr.length > 0) {
            logger.info(`ATR: ${atr.slice(-1)[0]}`); // Логирование последнего значения ATR
        } else {
            logger.warn('ATR: Невозможно рассчитать значение ATR.');
        }

        // Рассчёт индикатора EMA 14
        logger.info('Расчёт индикатора EMA 14 начат.');
        const ema14 = technicalIndicators.EMA.calculate({
            values: closePrices,
            period: indicatorSettings.ema.shortPeriod,
        });
        if (ema14 && ema14.length > 0) {
            logger.info(`EMA 14: ${ema14.slice(-1)[0]}`); // Логирование последнего значения EMA 14
        } else {
            logger.warn('EMA 14: Невозможно рассчитать значение EMA 14.');
        }

        // Рассчёт индикатора EMA 200
        logger.info('Расчёт индикатора EMA 200 начат.');
        const ema200 = technicalIndicators.EMA.calculate({
            values: closePrices,
            period: indicatorSettings.ema.longPeriod,
        });
        if (ema200 && ema200.length > 0) {
            logger.info(`EMA 200: ${ema200.slice(-1)[0]}`); // Логирование последнего значения EMA 200
        } else {
            logger.warn('EMA 200: Невозможно рассчитать значение EMA 200.');
        }

        // Рассчёт линии Боллинджера
        logger.info('Расчёт индикатора Bollinger Bands начат.');
        const bollingerBands = technicalIndicators.BollingerBands.calculate({
            period: indicatorSettings.bollingerBands.period,
            values: closePrices,
            stdDev: indicatorSettings.bollingerBands.stdDev,
        });
        if (bollingerBands && bollingerBands.length > 0) {
            logger.info(`Bollinger Bands: Upper: ${bollingerBands.slice(-1)[0]?.upper}, Lower: ${bollingerBands.slice(-1)[0]?.lower}`); // Логирование верхней и нижней линии Боллинджера
        } else {
            logger.warn('Bollinger Bands: Невозможно рассчитать значение Bollinger Bands.');
        }

        // Рассчёт VWAP (Volume Weighted Average Price)
        logger.info('Расчёт индикатора VWAP начат.');
        const vwap = [];
        for (let i = indicatorSettings.vwap.period - 1; i < closePrices.length; i++) {
            const sliceClosePrices = closePrices.slice(i - indicatorSettings.vwap.period + 1, i + 1);
            const sliceVolumes = volumes.slice(i - indicatorSettings.vwap.period + 1, i + 1);
        
            const validVolumes = sliceVolumes.filter(v => !isNaN(v) && v !== null && v !== undefined);
            const validClosePrices = sliceClosePrices.filter(price => !isNaN(price) && price !== null && price !== undefined);

            if (validVolumes.length > 0 && validClosePrices.length > 0) {
                const vwapValue = validClosePrices.reduce((sum, price, index) => sum + price * validVolumes[index], 0) / 
                    validVolumes.reduce((sum, vol) => sum + vol, 0);
            
                // Проверка на пустое значение или ошибочные данные
                if (vwapValue && !isNaN(vwapValue)) {
                    vwap.push(vwapValue);
                } else {
                    logger.warn(`VWAP: Неверные данные для расчёта на период ${i}`);
                }
            }
        }
        
        // После цикла
        if (vwap.length > 0) {
            const lastVWAP = vwap[vwap.length - 1];
            logger.info(`Последнее значение VWAP: ${lastVWAP}`);
        } else {
            logger.warn('VWAP: Не удалось рассчитать ни одного значения.');
        }

        // Рассчёт свечей Хайканаши
        logger.info('Расчёт свечей Heikin Ashi начат.');
        const heikinAshi = candles.map((candle, index) => {
            const close = candle[4];
            const open = index === 0 ? (candle[1] + close) / 2 : (candles[index - 1][1] + candles[index - 1][4]) / 2;
            const high = Math.max(candle[2], open, close);
            const low = Math.min(candle[3], open, close);
            return [candle[0], open, high, low, close];
        });
        logger.info(`Heikin Ashi: ${heikinAshi.slice(-1)[0][4]}`); // Логирование последней свечи Хайканаши

        // Рассчёт линейной регрессии (для тренда)
        logger.info('Расчёт линейной регрессии начат.');
        const regressionData = candles.map((candle, index) => [index, candle[4]]);
        logger.info(`Данные для линейной регрессии: ${JSON.stringify(regressionData)}`);

        // Проверка на достаточность данных для линейной регрессии
        if (regressionData.length < 2) {
            logger.error('Недостаточно данных для расчёта линейной регрессии.');
            return { atr, ema14, ema200, bollingerBands, vwap, heikinAshi, regression: null };
        }

        let regression;
        try {
            // Используем simple-statistics для расчёта линейной регрессии
            const regressionResult = ss.linearRegression(regressionData);
            const slope = regressionResult.m;
            const intercept = regressionResult.b;
            regression = { slope, intercept };
            logger.info(`Linear Regression: Slope: ${slope}, Intercept: ${intercept}`);
        } catch (error) {
            logger.error(`Ошибка при расчете линейной регрессии: ${error.message}`);
            regression = null;
        }

        logger.info(`Индикаторы для ${candles[0][0]} успешно рассчитаны.`);
        return { atr, ema14, ema200, bollingerBands, vwap, heikinAshi, regression };
    } catch (error) {
        logger.error(`Ошибка при расчёте индикаторов: ${error.message}`);
        return null;
    }
}

// Экспортируем функцию для использования в других файлах
module.exports = { indicatorsCalc };
