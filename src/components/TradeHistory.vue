<script setup>
import { useTradesStore } from '@/stores/trades'

const trades = useTradesStore()

const scale    = (v) => v / 1e8
const fmtAmt   = (v) => scale(v).toFixed(6)
const fmtPrice = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(scale(v))
const fmtTotal = (a, p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(scale(a) * scale(p))
const fmtDate  = (ts) => new Date(ts * 1000).toLocaleString('en-US', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
})

const coinColors = { ETH: '#7b68ee', BTC: '#f7931a', SOL: '#14f195', BNB: '#f3ba2f' }
function coinColor(sym) { return coinColors[sym] ?? '#6080a0' }
</script>

<template>
  <div class="history-card">
    <!-- Header -->
    <div class="history-header">
      <span class="section-label">
        <i class="pi pi-list" style="font-size:.7rem" />
        TRADE HISTORY
      </span>
      <span class="trade-count">{{ trades.totalTrades }} transactions</span>
    </div>

    <!-- Empty state -->
    <div v-if="!trades.sortedTrades.length" class="empty-state">
      <i class="pi pi-inbox" style="font-size:1.8rem; color:#1a2a3a; display:block; margin-bottom:10px" />
      No trades found for this address
    </div>

    <!-- Trade rows -->
    <div v-else class="trade-list">
      <div
        v-for="(trade, i) in trades.sortedTrades"
        :key="i"
        class="trade-row"
        :class="{ 'trade-buy': trade.is_buy, 'trade-sell': !trade.is_buy }"
      >
        <!-- Side indicator bar -->
        <div class="side-bar" :class="trade.is_buy ? 'bar-buy' : 'bar-sell'" />

        <!-- Type pill -->
        <div class="trade-type">
          <span class="type-pill" :class="trade.is_buy ? 'pill-buy' : 'pill-sell'">
            <i :class="trade.is_buy ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" style="font-size:.5rem" />
            {{ trade.is_buy ? 'BUY' : 'SELL' }}
          </span>
        </div>

        <!-- Symbol -->
        <div class="trade-symbol">
          <span
            class="sym-badge"
            :style="{ color: coinColor(trade.symbol), borderColor: coinColor(trade.symbol) + '30', background: coinColor(trade.symbol) + '12' }"
          >{{ trade.symbol }}</span>
        </div>

        <!-- Amount -->
        <div class="trade-col">
          <span class="col-label">Amount</span>
          <span class="col-val num">{{ fmtAmt(trade.amount) }}</span>
        </div>

        <!-- Price -->
        <div class="trade-col">
          <span class="col-label">Price</span>
          <span class="col-val num">{{ fmtPrice(trade.price) }}</span>
        </div>

        <!-- Total -->
        <div class="trade-col">
          <span class="col-label">Total</span>
          <span class="col-val num bold" :class="trade.is_buy ? 'clr-green' : 'clr-red'">
            {{ fmtTotal(trade.amount, trade.price) }}
          </span>
        </div>

        <!-- Date -->
        <div class="trade-date">{{ fmtDate(trade.timestamp) }}</div>
      </div>
    </div>

    <!-- Last TX footer -->
    <div v-if="trades.lastTxHash" class="tx-footer">
      <span class="tx-tag">LAST TX</span>
      <code class="tx-hash">{{ trades.lastTxHash }}</code>
      <a
        :href="`https://sepolia.etherscan.io/tx/${trades.lastTxHash}`"
        target="_blank"
        rel="noopener"
        class="tx-link"
      >
        <i class="pi pi-external-link" style="font-size:.7rem" />
        Etherscan
      </a>
    </div>
  </div>
</template>

<style scoped>
.history-card {
  background:    var(--card-bg);
  border:        1px solid var(--card-border);
  border-radius: 12px;
  overflow:      hidden;
  box-shadow:    var(--card-shadow);
  transition:    background 0.2s, border-color 0.2s;
}

.history-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  padding:         14px 18px 12px;
  border-bottom:   1px solid var(--divider);
}

.section-label {
  display:        flex;
  align-items:    center;
  gap:            7px;
  font-size:      0.65rem;
  font-weight:    700;
  letter-spacing: 0.12em;
  color:          var(--label);
}

.trade-count {
  font-size:   0.62rem;
  font-weight: 600;
  color:       var(--text-dim);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding:    48px 20px;
  font-size:  0.8rem;
  color:      var(--text-dim);
}

/* Trade rows */
.trade-list { padding: 4px 0; }

.trade-row {
  display:         grid;
  grid-template-columns: 3px auto auto 1fr 1fr 1fr auto;
  align-items:     center;
  gap:             0 14px;
  padding:         10px 18px 10px 0;
  border-bottom:   1px solid var(--row-border);
  transition:      background 0.1s;
}
.trade-row:last-child { border-bottom: none; }
.trade-row:hover      { background: var(--row-hover); }

/* Left accent bar */
.side-bar {
  width:         3px;
  height:        100%;
  min-height:    36px;
  border-radius: 0 2px 2px 0;
}
.bar-buy  { background: linear-gradient(to bottom, #22c55e, rgba(34,197,94,.3)); }
.bar-sell { background: linear-gradient(to bottom, #f87171, rgba(248,113,113,.3)); }

/* Type pill */
.type-pill {
  display:        inline-flex;
  align-items:    center;
  gap:            4px;
  border-radius:  5px;
  font-size:      0.58rem;
  font-weight:    800;
  letter-spacing: 0.1em;
  padding:        3px 8px;
  white-space:    nowrap;
}
.pill-buy  { background: rgba(34,197,94,.1);   color: #22c55e; border: 1px solid rgba(34,197,94,.18); }
.pill-sell { background: rgba(248,113,113,.1); color: #f87171; border: 1px solid rgba(248,113,113,.18); }

/* Symbol badge */
.sym-badge {
  display:        inline-flex;
  align-items:    center;
  justify-content:center;
  border-radius:  5px;
  border:         1px solid;
  font-size:      0.62rem;
  font-weight:    800;
  letter-spacing: 0.06em;
  padding:        2px 8px;
  white-space:    nowrap;
}

/* Column */
.trade-col  { display: flex; flex-direction: column; gap: 1px; }
.col-label  { font-size: 0.58rem; color: var(--text-dim); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.col-val    { font-size: 0.78rem; color: var(--text-sec); }
.col-val.bold { color: var(--text-primary); font-weight: 700; }

/* Date */
.trade-date {
  font-size:   0.68rem;
  color:       var(--text-muted);
  text-align:  right;
  white-space: nowrap;
}

/* Colors */
.clr-green { color: #22c55e !important; }
.clr-red   { color: #f87171 !important; }

.num {
  font-family:          'SF Mono', 'Fira Code', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing:       -0.01em;
}

/* TX footer */
.tx-footer {
  display:     flex;
  align-items: center;
  gap:         12px;
  padding:     12px 18px;
  border-top:  1px solid var(--row-border);
  flex-wrap:   wrap;
}

.tx-tag {
  font-size:      0.58rem;
  font-weight:    800;
  letter-spacing: 0.12em;
  color:          var(--text-dim);
  background:     var(--tx-tag-bg);
  border:         1px solid var(--btn-border);
  border-radius:  4px;
  padding:        2px 7px;
  white-space:    nowrap;
}

.tx-hash {
  font-family:   'SF Mono', ui-monospace, monospace;
  font-size:     0.7rem;
  color:         var(--tx-hash);
  flex:          1;
  min-width:     0;
  overflow:      hidden;
  text-overflow: ellipsis;
  white-space:   nowrap;
}

.tx-link {
  display:        inline-flex;
  align-items:    center;
  gap:            5px;
  font-size:      0.68rem;
  font-weight:    700;
  color:          #00c9a0;
  text-decoration:none;
  white-space:    nowrap;
  transition:     opacity 0.15s;
}
.tx-link:hover { opacity: 0.75; }

@media (max-width: 720px) {
  .trade-row { grid-template-columns: 3px auto auto 1fr auto; }
  .trade-col:nth-child(4),
  .trade-col:nth-child(5) { display: none; }
}
</style>
