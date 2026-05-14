<script setup>
import { computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { useTradesStore } from '@/stores/trades'

const portfolio = usePortfolioStore()
const trades    = useTradesStore()

const pnlPositive = computed(() => portfolio.totalPnl >= 0)
const pnlSign     = computed(() => pnlPositive.value ? '+' : '')

function fmtUSD(val, compact = false) {
  if (compact && Math.abs(val) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      notation: 'compact', maximumFractionDigits: 2,
    }).format(val || 0)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0)
}
</script>

<template>
  <div class="metric-grid">

    <!-- Total Portfolio Value -->
    <div class="metric-card accent-teal">
      <div class="mc-top">
        <span class="mc-label">Portfolio Value</span>
        <i class="pi pi-chart-line mc-icon" style="color:#00c9a0" />
      </div>
      <div class="mc-value num">{{ fmtUSD(portfolio.totalValue) }}</div>
      <div class="mc-sub">Total assets under tracking</div>
    </div>

    <!-- Total P&L -->
    <div class="metric-card" :class="pnlPositive ? 'accent-green' : 'accent-red'">
      <div class="mc-top">
        <span class="mc-label">Unrealised P&amp;L</span>
        <i class="pi" :class="pnlPositive ? 'pi-arrow-up-right' : 'pi-arrow-down-right'"
           :style="{ color: pnlPositive ? '#22c55e' : '#f87171' }" />
      </div>
      <div class="mc-value num" :class="pnlPositive ? 'clr-green' : 'clr-red'">
        {{ pnlSign }}{{ fmtUSD(portfolio.totalPnl) }}
      </div>
      <div class="mc-sub" :class="pnlPositive ? 'clr-green-dim' : 'clr-red-dim'">
        {{ pnlSign }}{{ portfolio.totalPnlPercent.toFixed(2) }}%  return on cost
      </div>
    </div>

    <!-- Trades -->
    <div class="metric-card accent-purple">
      <div class="mc-top">
        <span class="mc-label">Transactions</span>
        <i class="pi pi-send mc-icon" style="color:#818cf8" />
      </div>
      <div class="mc-value num">{{ trades.totalTrades }}</div>
      <div class="mc-sub">On-chain trades recorded</div>
    </div>

    <!-- Assets held -->
    <div class="metric-card accent-blue">
      <div class="mc-top">
        <span class="mc-label">Open Positions</span>
        <i class="pi pi-th-large mc-icon" style="color:#60a5fa" />
      </div>
      <div class="mc-value num">{{ portfolio.totalAssets }}</div>
      <div class="mc-sub">Unique assets in portfolio</div>
    </div>

  </div>
</template>

<style scoped>
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

/* Base card */
.metric-card {
  background:    var(--card-bg);
  border:        1px solid var(--card-border);
  border-radius: 12px;
  padding:       18px 20px 16px;
  position:      relative;
  overflow:      hidden;
  transition:    border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.metric-card::before {
  content:      '';
  position:     absolute;
  top:          0; left: 0; right: 0;
  height:       2px;
  border-radius:12px 12px 0 0;
}

/* Accent colours */
.accent-teal::before   { background: linear-gradient(90deg, #00c9a0, #00e0c0); }
.accent-green::before  { background: linear-gradient(90deg, #22c55e, #4ade80); }
.accent-red::before    { background: linear-gradient(90deg, #f87171, #fb923c); }
.accent-purple::before { background: linear-gradient(90deg, #818cf8, #a78bfa); }
.accent-blue::before   { background: linear-gradient(90deg, #60a5fa, #93c5fd); }

.metric-card:hover {
  border-color: var(--text-muted);
  box-shadow:   var(--card-shadow);
}

/* Content */
.mc-top {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  margin-bottom:   10px;
}

.mc-label {
  font-size:      0.62rem;
  font-weight:    700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color:          var(--label);
}

.mc-icon {
  font-size: 0.85rem;
  opacity:   0.7;
}

.mc-value {
  font-size:      1.7rem;
  font-weight:    700;
  letter-spacing: -0.04em;
  color:          var(--text-primary);
  line-height:    1;
  margin-bottom:  8px;
}

.mc-sub {
  font-size: 0.68rem;
  color:     var(--text-dim);
  line-height: 1.4;
}

/* P&L colours */
.clr-green     { color: #22c55e !important; }
.clr-red       { color: #f87171 !important; }
.clr-green-dim { color: rgba(34, 197, 94, 0.45) !important; }
.clr-red-dim   { color: rgba(248, 113, 113, 0.45) !important; }

/* Monospace */
.num {
  font-family:         'SF Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 900px) { .metric-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .metric-grid { grid-template-columns: 1fr; } }
</style>
