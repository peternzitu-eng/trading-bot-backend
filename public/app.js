document.addEventListener('DOMContentLoaded', () => {
    const sentimentTicker = document.getElementById('sentiment-ticker');
    const tradingMode = document.getElementById('trading-mode');
    const signalsTableBody = document.querySelector('#signals-table tbody');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat');

    async function updateDashboard() {
        try {
            const [statusRes, sentimentRes, signalsRes] = await Promise.all([
                fetch('/api/status'),
                fetch('/api/sentiment'),
                fetch('/api/signals')
            ]);
            const status = await statusRes.json();
            const sentiment = await sentimentRes.json();
            const signals = await signalsRes.json();

            if (tradingMode) {
                tradingMode.textContent = status.mode;
                tradingMode.className = 'mode-badge ' + (status.mode.includes('LIVE') ? 'LIVE' : 'Simulation');
            }
            if (sentimentTicker) {
                sentimentTicker.innerHTML = sentiment.watchlist.map(item => 
                    '<span>' + item.symbol + ': <strong class="' + item.sentiment.toLowerCase() + '">' + item.sentiment + '</strong></span>'
                ).join(' | ');
            }
            if (signalsTableBody) {
                signalsTableBody.innerHTML = signals.map(sig => 
                    '<tr onclick="showSignalDeepDive(\'' + sig.symbol + '\', ' + sig.price + ')">' +
                    '<td>' + new Date(sig.timestamp).toLocaleTimeString() + '</td>' +
                    '<td>' + sig.symbol + '</td>' +
                    '<td class="' + sig.action.toLowerCase() + '">' + sig.action + '</td>' +
                    '<td>' + sig.price + '</td>' +
                    '<td><span class="status-pill ' + (sig.result?.status?.toLowerCase() || 'pending') + '">' + (sig.result?.status || 'Pending') + '</span></td>' +
                    '</tr>'
                ).join('');
            }
        } catch (error) { console.error('Update Error:', error); }
    }

    async function sendChatMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        appendMessage('user', message);
        chatInput.value = '';
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await response.json();
            appendMessage('ai', data.response);
        } catch (error) { appendMessage('ai', 'Error connecting to AI assistant.'); }
    }

    function appendMessage(role, text) {
        if (!chatMessages) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ' + role;
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    window.showSignalDeepDive = (symbol, price) => {
        const modal = document.getElementById('chart-modal');
        const container = document.getElementById('chart-container');
        if (modal && container) {
            modal.style.display = 'block';
            container.innerHTML = '<div class="placeholder-chart"><h3>' + symbol + ' Deep-Dive</h3><p>Entry Price: ' + price + '</p><p>Analysis: Price swept liquidity at session low before reversing. Entry confirmed on 1m MSB.</p></div>';
        }
    };

    const closeModal = document.querySelector('.close-modal');
    if (closeModal) closeModal.onclick = () => { document.getElementById('chart-modal').style.display = 'none'; };
    if (sendChatBtn) sendChatBtn.onclick = sendChatMessage;
    if (chatInput) chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendChatMessage(); };

    updateDashboard();
    setInterval(updateDashboard, 5000);
});
