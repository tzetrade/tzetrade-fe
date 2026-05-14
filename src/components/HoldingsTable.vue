<script setup>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ProgressBar from 'primevue/progressbar'
import { usePortfolioStore } from '@/stores/portfolio'

const emit      = defineEmits(['update:activeCoin'])
const portfolio = usePortfolioStore()

const coinMeta = {
  ETH: { color: '#7b68ee', glow: 'rgba(123,104,238,.18)', bg: 'rgba(123,104,238,.08)' },
  BTC: { color: '#f7931a', glow: 'rgba(247,147,26,.18)',  bg: 'rgba(247,147,26,.08)'  },
  SOL: { color: '#14f195', glow: 'rgba(20,241,149,.18)',  bg: 'rgba(20,241,149,.08)'  },
  BNB: { color: '#f3ba2f', glow: 'rgba(243,186,47,.18)',  bg: 'rgba(243,186,47,.08)'  },
}
const defaultMeta = { color: '#6080a0', glow: 'rgba(96,128,160,.18)', bg: 'rgba(96,128,160,.08)' }

function meta(sym) { return coinMeta[sym] ?? defaultMeta }

function allocPct(holding) {
  if (!portfolio.totalValue) return 0
  return (holding.value_usd / portfolio.totalValue) * 100
}

const fmtUSD = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0)

const fmtAmt = (v, dp = 6) => Number(v || 0).toFixed(dp)

function onRowClick(e) { emit('update:activeCoin', e.data.symbol) }
</script>

<template>
  <div class="table-card">
    <div class="table-header">
      <span class="section-label">
        <i class="pi pi-briefcase" style="font-size:.7rem" />
        HOLDINGS
      </span>
      <span class="asset-count">{{ portfolio.holdings.length }} assets</span>
    </div>

    <DataTable
      :value="portfolio.mergedHoldings"
      row-hover
      class="holdings-dt"
      empty-message="No holdings — load a wallet to begin"
      @row-click="onRowClick"
    >
      <!-- Asset -->
      <Column header="Asset" style="min-width:140px">
        <template #body="{ data }">
          <div class="asset-cell">
            <span
              class="coin-badge"
              :style="{ background: meta(data.symbol).bg, color: meta(data.symbol).color,
                        boxShadow: `0 0 10px ${meta(data.symbol).glow}` }"
            >{{ data.symbol }}</span>
          </div>
        </template>
      </Column>

      <!-- Amount -->
      <Column header="Amount" style="min-width:110px">
        <template #body="{ data }">
          <span class="num-cell">{{ fmtAmt(data.amount) }}</span>
        </template>
      </Column>

      <!-- Avg Buy -->
      <Column header="Avg Buy" style="min-width:110px">
        <template #body="{ data }">
          <span class="num-cell muted">{{ fmtUSD(data.avg_buy_price) }}</span>
        </template>
      </Column>

      <!-- Current Price -->
      <Column header="Current Price" style="min-width:120px">
        <template #body="{ data }">
          <span class="num-cell">{{ fmtUSD(data.current_price) }}</span>
        </template>
      </Column>

      <!-- Value -->
      <Column header="Value (USD)" style="min-width:120px">
        <template #body="{ data }">
          <span class="num-cell bold">{{ fmtUSD(data.value_usd) }}</span>
        </template>
      </Column>

      <!-- P&L -->
      <Column header="P&amp;L" style="min-width:160px">
        <template #body="{ data }">
          <div class="pnl-cell">
            <span class="pnl-usd num-cell" :class="data.pnl_usd >= 0 ? 'clr-green' : 'clr-red'">
              {{ data.pnl_usd >= 0 ? '+' : '' }}{{ fmtUSD(data.pnl_usd) }}
            </span>
            <span class="pnl-pct num-cell" :class="data.pnl_percent >= 0 ? 'clr-green-dim' : 'clr-red-dim'">
              {{ data.pnl_percent >= 0 ? '+' : '' }}{{ Number(data.pnl_percent || 0).toFixed(2) }}%
            </span>
          </div>
        </template>
      </Column>

      <!-- Allocation -->
      <Column header="Allocation" style="min-width:140px">
        <template #body="{ data }">
          <ProgressBar
            :value="allocPct(data)"
            :show-value="false"
            class="alloc-bar"
            :pt="{ value: { style: { background: meta(data.symbol).color } } }"
          />
          <span class="alloc-pct">{{ allocPct(data).toFixed(1) }}%</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.table-card {
  background:    var(--card-bg);
  border:        1px solid var(--card-border);
  border-radius: 12px;
  overflow:      hidden;
  box-shadow:    var(--card-shadow);
  transition:    background 0.2s, border-color 0.2s;
}

.table-header {
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

.asset-count {
  font-size:   0.65rem;
  color:       var(--text-dim);
  font-weight: 600;
}

/* Coin badge */
.coin-badge {
  display:        inline-flex;
  align-items:    center;
  justify-content:center;
  border-radius:  6px;
  font-size:      0.62rem;
  font-weight:    800;
  letter-spacing: 0.06em;
  padding:        3px 9px;
  cursor:         pointer;
  transition:     all 0.15s;
}
.coin-badge:hover { filter: brightness(1.15); }

/* Number cells */
.num-cell {
  font-family:          'SF Mono', 'Fira Code', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  font-size:            0.8rem;
  color:                var(--text-sec);
  letter-spacing:       -0.01em;
}
.num-cell.muted { color: var(--text-muted); }
.num-cell.bold  { color: var(--text-primary); font-weight: 700; }

/* P&L */
.pnl-cell { display: flex; flex-direction: column; gap: 2px; }
.pnl-usd  { font-size: 0.8rem; font-weight: 700; }
.pnl-pct  { font-size: 0.68rem; }

.clr-green     { color: #22c55e !important; }
.clr-red       { color: #f87171 !important; }
.clr-green-dim { color: rgba(34,197,94,.55) !important; }
.clr-red-dim   { color: rgba(248,113,113,.55) !important; }

/* Allocation */
.alloc-bar { height: 4px !important; margin-bottom: 5px; }
.alloc-pct {
  font-family:          'SF Mono', ui-monospace, monospace;
  font-size:            0.62rem;
  color:                var(--label);
  font-variant-numeric: tabular-nums;
}

/* Override datatable internals */
:deep(.holdings-dt .p-datatable-tbody > tr > td:first-child) { padding-left: 18px !important; }
:deep(.holdings-dt .p-datatable-thead > tr > th:first-child)  { padding-left: 18px !important; }
</style>
