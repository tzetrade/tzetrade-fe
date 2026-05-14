<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'

const portfolio = usePortfolioStore()
const activeTab = ref('portfolio')
const animated  = ref(false)
const MAX_H     = 160

const coinMeta = {
  ETH: { color: '#7b68ee', glow: '0 4px 20px rgba(123,104,238,.4)' },
  BTC: { color: '#f7931a', glow: '0 4px 20px rgba(247,147,26,.4)'  },
  SOL: { color: '#14f195', glow: '0 4px 20px rgba(20,241,149,.4)'  },
  BNB: { color: '#f3ba2f', glow: '0 4px 20px rgba(243,186,47,.4)'  },
}
const defaultMeta = { color: '#6080a0', glow: '0 4px 20px rgba(96,128,160,.3)' }

function meta(sym) { return coinMeta[sym] ?? defaultMeta }

const fmtUSD = (v) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(v || 0)

function triggerAnim() {
  animated.value = false
  nextTick(() => requestAnimationFrame(() => { animated.value = true }))
}

function barH(value, maxValue) {
  if (!animated.value || !maxValue) return 0
  return Math.max(6, (Math.abs(value) / maxValue) * MAX_H)
}

function portfolioBarH(h) {
  const max = Math.max(...portfolio.holdings.map(x => x.value_usd), 1)
  return barH(h.value_usd, max)
}
function pnlBarH(p) {
  const max = Math.max(...portfolio.pnl.map(x => Math.abs(x.pnl_usd)), 1)
  return barH(p.pnl_usd, max)
}
function allocBarH(h) {
  const total = portfolio.totalValue
  return total ? barH((h.value_usd / total) * 100, 100) : 0
}
function allocPct(h) {
  if (!portfolio.totalValue) return '0.0'
  return ((h.value_usd / portfolio.totalValue) * 100).toFixed(1)
}

watch(activeTab, triggerAnim)
onMounted(() => requestAnimationFrame(() => requestAnimationFrame(() => { animated.value = true })))
</script>

<template>
  <div class="chart-card">
    <!-- Header + tabs -->
    <div class="chart-header">
      <span class="section-label">
        <i class="pi pi-chart-bar" style="font-size:.7rem" />
        PERFORMANCE
      </span>
      <div class="tab-row">
        <button
          v-for="tab in [
            { id:'portfolio',  label:'Portfolio Value' },
            { id:'pnl',        label:'P&amp;L by Asset'  },
            { id:'allocation', label:'Allocation %'    },
          ]"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
          v-html="tab.label"
        />
      </div>
    </div>

    <!-- Chart panels -->
    <div class="chart-body">

      <!-- Portfolio Value -->
      <div v-if="activeTab === 'portfolio'" class="bar-chart">
        <div v-for="h in portfolio.holdings" :key="h.symbol" class="bar-item">
          <span class="bar-val">{{ fmtUSD(h.value_usd) }}</span>
          <div
            class="bar"
            :style="{
              height:    portfolioBarH(h) + 'px',
              background: meta(h.symbol).color,
              boxShadow:  portfolioBarH(h) > 10 ? meta(h.symbol).glow : 'none',
            }"
          />
          <span class="bar-lbl">{{ h.symbol }}</span>
        </div>
      </div>

      <!-- P&L by Asset -->
      <div v-if="activeTab === 'pnl'" class="bar-chart">
        <div v-for="p in portfolio.pnl" :key="p.symbol" class="bar-item">
          <span class="bar-val" :class="p.pnl_usd >= 0 ? 'clr-green' : 'clr-red'">
            {{ p.pnl_usd >= 0 ? '+' : '' }}{{ fmtUSD(p.pnl_usd) }}
          </span>
          <div
            class="bar"
            :style="{
              height:     pnlBarH(p) + 'px',
              background: meta(p.symbol).color,
              boxShadow:  pnlBarH(p) > 10 ? meta(p.symbol).glow : 'none',
              opacity:    p.pnl_usd < 0 ? 0.45 : 1,
            }"
          />
          <span class="bar-lbl">{{ p.symbol }}</span>
        </div>
      </div>

      <!-- Allocation % -->
      <div v-if="activeTab === 'allocation'" class="bar-chart">
        <div v-for="h in portfolio.holdings" :key="h.symbol" class="bar-item">
          <span class="bar-val">{{ allocPct(h) }}%</span>
          <div
            class="bar"
            :style="{
              height:    allocBarH(h) + 'px',
              background: meta(h.symbol).color,
              boxShadow:  allocBarH(h) > 10 ? meta(h.symbol).glow : 'none',
            }"
          />
          <span class="bar-lbl">{{ h.symbol }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.chart-card {
  background:    var(--card-bg);
  border:        1px solid var(--card-border);
  border-radius: 12px;
  overflow:      hidden;
  box-shadow:    var(--card-shadow);
  transition:    background 0.2s, border-color 0.2s;
}

.chart-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  padding:         14px 18px 0;
  border-bottom:   1px solid var(--divider);
  flex-wrap:       wrap;
  gap:             10px;
}

.section-label {
  display:        flex;
  align-items:    center;
  gap:            7px;
  font-size:      0.65rem;
  font-weight:    700;
  letter-spacing: 0.12em;
  color:          var(--label);
  padding-bottom: 14px;
}

.tab-row {
  display: flex;
  gap:     2px;
}

.tab-btn {
  background:     transparent;
  border:         none;
  border-bottom:  2px solid transparent;
  color:          var(--btn-color);
  cursor:         pointer;
  font-size:      0.7rem;
  font-weight:    700;
  letter-spacing: 0.05em;
  padding:        10px 16px 12px;
  margin-bottom:  -1px;
  transition:     color 0.15s;
  white-space:    nowrap;
}
.tab-btn:hover  { color: var(--text-sec); }
.tab-btn.active { color: #00c9a0; border-bottom-color: #00c9a0; }

/* Bar chart */
.chart-body {
  padding: 24px 28px 20px;
}

.bar-chart {
  display:     flex;
  align-items: flex-end;
  gap:         32px;
  height:      210px;
}

.bar-item {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  flex:           1;
  gap:            8px;
}

.bar {
  width:         100%;
  max-width:     72px;
  border-radius: 5px 5px 0 0;
  transition:    height .55s cubic-bezier(.4,0,.2,1), box-shadow .55s ease;
  min-height:    6px;
}

.bar-val {
  font-family:          'SF Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  font-size:            0.68rem;
  font-weight:          700;
  color:                var(--text-muted);
  text-align:           center;
  min-height:           1rem;
  line-height:          1.2;
}

.bar-lbl {
  font-size:      0.65rem;
  font-weight:    800;
  letter-spacing: 0.08em;
  color:          var(--label);
  text-align:     center;
}

.clr-green { color: #22c55e !important; }
.clr-red   { color: #f87171 !important; }
</style>
