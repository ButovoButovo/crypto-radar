// takeProfitStopLoss.js

function calculateStopLossTakeProfit(signal, entryPrice, atr) {
    const stopLoss = signal === 'BUY' ? entryPrice - atr : entryPrice + atr;
    const takeProfit = signal === 'BUY' ? entryPrice + atr : entryPrice - atr;
    return { stopLoss, takeProfit };
}

// Экспортируем функцию
module.exports = { calculateStopLossTakeProfit };
