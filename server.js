import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import strategyEngine from './strategyEngine.js';
import database from './database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

database.init();

// API Health
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Ready' });
});

// Bot Status & Configuration
app.get('/api/status', (req, res) => {
    res.json({
        mode: process.env.TRADING_MODE === 'LIVE' ? 'LIVE Trading' : 'Simulation',
        engineStatus: strategyEngine.getStatus(),
        lastUpdate: new Date(),
        version: 'v2.1.0'
    });
});

// Market Sentiment Data
app.get('/api/sentiment', (req, res) => {
    res.json({
        watchlist: [
            { symbol: 'NAS100', sentiment: 'Bullish', value: 75, trend: 'up' },
            { symbol: 'BTC/USD', sentiment: 'Bullish', value: 82, trend: 'up' },
            { symbol: 'SPX500', sentiment: 'Bearish', value: 45, trend: 'down' },
            { symbol: 'GOLD', sentiment: 'Neutral', value: 50, trend: 'sideways' }
        ]
    });
});

// Signal History & Analysis
app.get('/api/signals', (req, res) => {
    res.json(database.getSignals());
});

// AI Chat Assistance
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    try {
        const response = "I've analyzed the market for your query. Based on the current 1H liquidity sweeps and NY session volume, NAS100 is looking long biased above the 18200 level. Avoid shorts until we see a change of character on the 15m timeframe.";
        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: 'AI Assistant currently offline' });
    }
});

// TradingView Webhook
app.post('/api/webhook/tradingview', async (req, res) => {
    try {
        const signalData = req.body;
        const result = await strategyEngine.processSignal(signalData);
        database.saveSignal({
            ...signalData,
            result,
            timestamp: new Date()
        });
        res.status(200).json({ status: 'success', result });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.listen(PORT, () => {
    console.log('Trading Bot Engine (Unified 3-Step) running on port ' + PORT);
});
