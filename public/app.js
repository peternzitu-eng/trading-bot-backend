async function update() {
    try {
        const [stats, sent, signals] = await Promise.all([
            fetch('/api/status').then(r => r.json()),
            fetch('/api/sentiment').then(r => r.json()),
            fetch('/api/signals').then(r => r.json())
        ]);
        const modeEl = document.getElementById('trading-mode');
        if (modeEl) {
            modeEl.textContent = stats.mode;
            modeEl.className = 'status-badge ' + (stats.mode.includes('LIVE') ? 'live' : 'sim');
        }
        const tickerEl = document.getElementById('sentiment-ticker');
        if (tickerEl) tickerEl.textContent = sent.watchlist.map(s => s.symbol + ':' + s.sentiment).join(' | ');
        const tbody = document.querySelector('#signals tbody');
        if (tbody) tbody.innerHTML = signals.map(s => '<tr><td>' + s.symbol + '</td><td>' + s.action + '</td><td>' + (s.price || 'N/A') + '</td><td>' + s.result + '</td></tr>').join('');
    } catch (e) { console.error(e); }
}
setInterval(update, 5000);
window.onload = update;
