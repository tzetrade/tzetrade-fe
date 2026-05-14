<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import WalletBar from '@/components/WalletBar.vue'
import MetricCards from '@/components/MetricCards.vue'
import TradingViewChart from '@/components/TradingViewChart.vue'
import HoldingsTable from '@/components/HoldingsTable.vue'
import PnlChart from '@/components/PnlChart.vue'
import LogTradeForm from '@/components/LogTradeForm.vue'
import TradeHistory from '@/components/TradeHistory.vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { useTradesStore }    from '@/stores/trades'
import { useWalletStore }    from '@/stores/wallet'

const portfolio   = usePortfolioStore()
const tradesStore = useTradesStore()
const walletStore = useWalletStore()
const activeCoin  = ref('ETH')

onMounted(async () => {
  // Init wallet store first so the active address is set before loading portfolio
  await walletStore.init()
  const addr = walletStore.active?.address ?? portfolio.address
  portfolio.address = addr
  await Promise.all([
    portfolio.loadPortfolio(addr),
    tradesStore.loadTrades(addr),
  ])
})
</script>

<template>
  <div class="app-shell">
    <AppHeader />

    <main class="main-content">

      <!-- Wallet bar -->
      <section class="section-row">
        <WalletBar />
      </section>

      <!-- API offline notice -->
      <div v-if="portfolio.apiOffline" class="offline-banner">
        <i class="pi pi-wifi" style="font-size:.8rem" />
        API offline — start your Go server &nbsp;·&nbsp; showing mock data
      </div>

      <!-- Metric cards -->
      <section class="section-row">
        <MetricCards />
      </section>

      <!-- Price chart -->
      <section class="section-row">
        <TradingViewChart v-model:active-coin="activeCoin" />
      </section>

      <!-- Two-column layout: Holdings + Performance side by side on large screens -->
      <section class="section-row two-col" v-if="portfolio.holdings.length">
        <div class="col-wide">
          <HoldingsTable v-model:active-coin="activeCoin" />
        </div>
        <div class="col-narrow" v-if="portfolio.pnl.length">
          <PnlChart />
        </div>
      </section>

      <!-- Log trade + History side by side -->
      <section class="section-row two-col">
        <div class="col-narrow">
          <LogTradeForm />
        </div>
        <div class="col-wide">
          <TradeHistory />
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--dash-bg);
  transition: background 0.2s;
}

.main-content {
  padding: 20px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Offline banner */
.offline-banner {
  display:       flex;
  align-items:   center;
  gap:           10px;
  background:    rgba(250,204,21,.05);
  border:        1px solid rgba(250,204,21,.16);
  border-radius: 8px;
  padding:       10px 16px;
  font-size:     0.78rem;
  color:         #facc15;
}

/* Two-column layout */
.two-col {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 16px;
  align-items: start;
}

.col-wide, .col-narrow { min-width: 0; }

@media (max-width: 1100px) {
  .two-col { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .main-content { padding: 14px 12px 48px; gap: 12px; }
}
</style>
