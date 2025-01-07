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
