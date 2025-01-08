# Market Scanner

**Market Scanner** is a web application designed to display and filter market data related to stocks, cryptocurrencies, or other financial assets. It allows users to view real-time signals (BUY/SELL), stop-loss, and take-profit values, with the ability to filter and paginate through large datasets.

## Features

- **Market Data Display**: View market data in a table with columns for Ticker, Timestamp, Signal, Stop Loss, and Take Profit.
- **Filters**: Filter the data by ticker symbol or signal type.
- **Pagination**: Paginate the data to improve navigation through large datasets.
- **Responsive Design**: The app is fully responsive and adjusts its layout on smaller screens.
- **Styling**: The app uses Bootstrap and custom CSS for a clean, modern look.

## Technologies

- **HTML5**: Structure and content of the web page.
- **CSS3**: Custom styles for layout, table, pagination, and other UI elements.
- **JavaScript**: Dynamic functionality, including sorting, filtering, and pagination.
- **FontAwesome**: For including icons (e.g., GitHub and Telegram links in the footer).
- **Fetch API**: For retrieving market data from a remote API.

---

# Data Fetching Module

This module is used to retrieve market data from an exchange via an API.

## Market Data Source

We utilize [ccxt](https://github.com/ccxt/ccxt), a universal library for interacting with various cryptocurrency exchanges.

Currently, the data is fetched from **Bybit**, but the library supports over 100 exchanges, allowing you to switch to another one easily by modifying the configuration.

### Data We Retrieve:

1. **OHLCV (Candlestick Data)**  
   - `Timestamp`: Time of the candle opening.  
   - `Open`: Opening price.  
   - `High`: Highest price.  
   - `Low`: Lowest price.  
   - `Close`: Closing price.  
   - `Volume`: Trading volume.  

   **Note:** We fetch the **latest 200 hourly candles** by default. This includes open, high, low, close, and volume data for the last 200 hours.

2. **Available Trading Pairs (Symbols)**  
   - We filter pairs ending with `/USDT`.

3. **Parameters and Settings:**  
   - Timeframes: `1m`, `5m`, `1h`, `1d`, etc.  
   - Maximum number of candles: 200 (Bybit API limit).

### API Keys

Accessing data requires registering on Bybit and obtaining API keys. Ensure they are properly configured in the application.

### Configuration Example:

Make sure the following is set up in your `exchange` file:

```javascript
const ccxt = require('ccxt');
const exchange = new ccxt.bybit({
    apiKey: 'YOUR_API_KEY',
    secret: 'YOUR_SECRET_KEY'
});
module.exports = exchange;
```

# Indicators Calculated in the Code

## 1.1 ATR (Average True Range)
**Purpose:** ATR measures market volatility, showing how much the price of an asset changes over a given period.  
**How it's calculated:**  
The `technicalIndicators.ATR.calculate` method is used in the code to calculate ATR based on data for the high, low, and close prices.  
The `period` parameter specifies the period over which to calculate the ATR. This value is passed through the settings in `indicatorSettings.atr.period`.  
ATR shows the average magnitude of price fluctuations over a period, which can be useful for risk assessment and determining potential entry/exit points.

## 1.2 EMA (Exponential Moving Average)
**Purpose:** EMA is an indicator that gives more weight to recent prices compared to older ones, helping to identify the current trend.  
**How it's calculated:**  
Two EMA values are calculated in the code: EMA 14 (for a short period) and EMA 200 (for a long period).  
The `technicalIndicators.EMA.calculate` method is used, which takes a list of close prices (`closePrices`) and the period for calculation.  
This helps to determine the direction of the trend: if the short EMA (14) is above the long EMA (200), it may indicate an uptrend.

## 1.3 Bollinger Bands
**Purpose:** The Bollinger Bands indicator defines a price range around the moving average, taking into account the standard deviation.  
**How it's calculated:**  
The `technicalIndicators.BollingerBands.calculate` method is used to calculate the upper and lower Bollinger Bands. The `period` and `stdDev` parameters are taken from the settings (`indicatorSettings.bollingerBands`).  
Bollinger Bands indicate overbought and oversold zones:  
- A price at the upper band may signal a potential reversal (SELL).
- A price at the lower band may signal a potential reversal upward (BUY).

## 1.4 VWAP (Volume Weighted Average Price)
**Purpose:** VWAP calculates the average price of an asset, weighted by volume, helping to understand the true price.  
**How it's calculated:**  
For each period, the volume-weighted average price is calculated using the closing price and trading volume. This calculation occurs in a loop.  
If the result is valid, it is added to the `vwap` array, and the last VWAP value is logged at the end.  
VWAP can serve as a benchmark for determining the average price of an asset for the day, and crossing the price with VWAP can be a signal for trading.

## 1.5 Heikin Ashi Candles
**Purpose:** Heikin Ashi candles use a modification of traditional candles to smooth fluctuations and make trends easier to spot.  
**How it's calculated:**  
For each candle, the open, close, high, and low are calculated based on the data from previous candles.  
These candles help to determine if there is a trend and make it easier to identify the direction of market movement.

## 1.6 Linear Regression
**Purpose:** Linear regression is used to identify the trend (slope of the line), which helps to determine the direction of market movement.  
**How it's calculated:**  
The `simple-statistics` library and the `ss.linearRegression` function are used for the calculation, which takes the close data and indices.  
After calculating the linear regression, we get two values: `slope` (the slope) and `intercept` (the intercept). If the slope is positive, it indicates an uptrend; if negative, a downtrend.
