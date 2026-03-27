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

app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'Ready' });
});

app.get('/api/status', (req, res) => {
      res.json({
                mode: process.env.TRADING_MODE === 'LIVE' ? 'LIVE Trading' : 'Simulation',
                engineStatus: strategyEngine.getStatus(),
                lastUpdate: new Date()
      });
});

app.get('/api/sentiment', (req, res) => {
      res.json({
                watchlist: [
                  { symbol: 'NAS100', sentiment: 'Bullish', value: 75 },
                  { symbol: 'BTC/USD', sentiment: 'Bullish', value: 82 },
                  { symbol: 'SPX500', sentiment: 'Bearish', value: 45 }
                          ]
      });
});

app.get('/api/signals', (req, res) => {
      res.json(database.getSignals());
});

app.post('/api/webhook/tradingview', async (req, res) => {
      try {
                const result = await strategyEngine.processSignal(req.body);
                database.saveSignal({ ...req.body, result, timestamp: new Date() });
                res.status(200).json({ status: 'success', result });
      } catch (error) {
                res.status(500).json({ status: 'error', message: error.message });
      }
});

app.listen(PORT, () => {
      console.log('Trading Bot Engine running on port ' + PORT);
});
