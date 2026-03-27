const strategyEngine = {
      status: 'Idle',
      lastSignal: null,
      config: {
                nySessionStart: '13:30', // UTC
                nySessionEnd: '20:00',   // UTC
                riskPerTrade: 0.01,
                scalingSteps: 3
      },

      getStatus() {
                return this.status;
      },

      async processSignal(signal) {
                console.log('Processing signal for ' + signal.symbol);
                this.status = 'Analyzing';

          // Step 1: Validation
          if (!signal.symbol || !signal.action || !signal.price) {
                        throw new Error('Invalid signal data');
          }

          // Step 2: NY Session Check
          const isNYSession = this.checkSession();
                console.log('NY Session Active: ' + isNYSession);

          // Step 3: Unified Scaling Logic
          const executionPlan = this.calculateExecution(signal);

          this.lastSignal = { ...signal, plan: executionPlan };
                this.status = 'Ready';

          return {
                        status: 'Executed',
                        pair: signal.symbol,
                        action: signal.action,
                        plan: executionPlan
          };
      },

      checkSession() {
                const now = new Date();
                const time = now.getUTCHours() + ':' + now.getUTCMinutes();
                return true; // Simplified for demo
      },

      calculateExecution(signal) {
                const entry = signal.price;
                return [
                  { step: 1, lot: 0.01, price: entry },
                  { step: 2, lot: 0.02, price: entry * 0.998 },
                  { step: 3, lot: 0.04, price: entry * 0.995 }
                          ];
      }
};

export default strategyEngine;
