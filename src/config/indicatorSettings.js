//indicatorSettings.js
const dotenv = require('dotenv');

// Загрузка переменных окружения
dotenv.config();

const indicatorSettings = {
    bollingerBands: {
        period: parseInt(process.env.BOLLINGER_BANDS_PERIOD, 10),
        stdDev: parseFloat(process.env.BOLLINGER_BANDS_STDDEV),
    },
    atr: {
        period: parseInt(process.env.ATR_PERIOD, 10),
    },
    ema: {
        shortPeriod: parseInt(process.env.EMA_SHORT_PERIOD, 10),
        longPeriod: parseInt(process.env.EMA_LONG_PERIOD, 10),
    },
    linearRegression: {
        period: parseInt(process.env.LINEAR_REGRESSION_PERIOD, 10),
    },
    vwap: {
        period: parseInt(process.env.VWAP_PERIOD, 10),
    }
};

// Экспортируем объект с настройками
module.exports = indicatorSettings;

