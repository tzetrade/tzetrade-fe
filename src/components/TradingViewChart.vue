<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useTheme } from '@/composables/useTheme'

const props = defineProps({
  activeCoin: { type: String, default: 'ETH' },
})
const emit = defineEmits(['update:activeCoin'])

const { isDark } = useTheme()
const chartRef   = ref(null)
const localCoin  = ref(props.activeCoin)

const coins = [
  { id: 'ETH', color: '#7b68ee', glow: 'rgba(123,104,238,.25)' },
  { id: 'BTC', color: '#f7931a', glow: 'rgba(247,147,26,.25)'  },
  { id: 'SOL', color: '#14f195', glow: 'rgba(20,241,149,.25)'  },
  { id: 'BNB', color: '#f3ba2f', glow: 'rgba(243,186,47,.25)'  },
]

const symbolMap = {
  ETH: 'BINANCE:ETHUSD',
  BTC: 'BINANCE:BTCUSD',
  SOL: 'BINANCE:SOLUSD',
  BNB: 'BINANCE:BNBUSD',
}

function loadTVScript() {
  return new Promise((resolve) => {
    if (window.TradingView) return resolve()
    const s   = document.createElement('script')
    s.src     = 'https://s3.tradingview.com/tv.js'
    s.onload  = resolve
    s.onerror = resolve
    document.head.appendChild(s)
  })
}

function initChart() {
  if (!chartRef.value || !window.TradingView) return
  chartRef.value.innerHTML = ''
  const id = 'tv_' + Date.now()
  const el = document.createElement('div')
  el.id    = id
  chartRef.value.appendChild(el)
  // eslint-disable-next-line no-new
  new window.TradingView.widget({
    container_id:        id,
    symbol:              symbolMap[localCoin.value] ?? 'BINANCE:ETHUSD',
    interval:            'D',
    theme:               isDark.value ? 'dark' : 'light',
    style:               '1',
    locale:              'en',
    toolbar_bg:          isDark.value ? '#0f1623' : '#ffffff',
    allow_symbol_change: true,
    save_image:          false,
    hide_top_toolbar:    false,
    withdateranges:      true,
    width:               '100%',
    height:              420,
  })
}

watch(localCoin, (val) => {
  emit('update:activeCoin', val)
  nextTick(initChart)
})
watch(() => props.activeCoin, (val) => {
  if (val !== localCoin.value) localCoin.value = val
})
watch(isDark, () => nextTick(initChart))
onMounted(async () => {
  await loadTVScript()
  initChart()
})
</script>

<template>
  <div class="chart-card">
    <!-- Coin selector -->
    <div class="chart-toolbar">
      <div class="chart-title">
        <i class="pi pi-chart-bar" style="font-size:.75rem" />
        <span>MARKETS</span>
      </div>
      <div class="coin-tabs">
        <button
          v-for="coin in coins"
          :key="coin.id"
          class="coin-btn"
          :class="{ active: localCoin === coin.id }"
          :style="localCoin === coin.id
            ? { borderColor: coin.color, color: coin.color, background: coin.glow }
            : {}"
          @click="localCoin = coin.id"
        >
          {{ coin.id }}
        </button>
      </div>
    </div>

    <!-- Widget mount point -->
    <div ref="chartRef" class="chart-host" />
  </div>
</template>

<style scoped>
.chart-card {
  background:    var(--card-bg);
  border:        1px solid var(--card-border);
  border-radius: 12px;
  overflow:      hidden;
  box-shadow:    var(--card-shadow);
}

.chart-toolbar {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  padding:         14px 18px 12px;
  border-bottom:   1px solid var(--divider);
}

.chart-title {
  display:        flex;
  align-items:    center;
  gap:            7px;
  font-size:      0.65rem;
  font-weight:    700;
  letter-spacing: 0.12em;
  color:          var(--label);
}

.coin-tabs {
  display: flex;
  gap:     6px;
}

.coin-btn {
  background:     var(--btn-bg);
  border:         1px solid var(--btn-border);
  border-radius:  7px;
  color:          var(--btn-color);
  cursor:         pointer;
  font-size:      0.7rem;
  font-weight:    800;
  letter-spacing: 0.06em;
  padding:        5px 14px;
  transition:     all 0.15s;
}
.coin-btn:hover {
  border-color: var(--text-muted);
  color:        var(--text-sec);
}

.chart-host {
  width:  100%;
  height: 420px;
}
</style>
