const database = {
      signals: [],

      init() {
                console.log('Database initialized');
                this.signals = [
                  { id: 1, symbol: 'NAS100', action: 'BUY', result: 'Success', timestamp: new Date(Date.now() - 3600000) },
                  { id: 2, symbol: 'BTC/USD', action: 'SELL', result: 'Success', timestamp: new Date(Date.now() - 1800000) }
                          ];
      },

      saveSignal(signal) {
                const id = this.signals.length + 1;
                this.signals.push({ id, ...signal });
                console.log('Signal saved to database');
      },

      getSignals() {
                return this.signals;
      }
};

export default database;
