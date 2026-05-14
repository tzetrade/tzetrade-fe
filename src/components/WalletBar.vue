<script setup>
import { ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import { usePortfolioStore } from '@/stores/portfolio'
import { useTradesStore } from '@/stores/trades'

const portfolio   = usePortfolioStore()
const tradesStore = useTradesStore()
const localAddress = ref(portfolio.address)

// Stay in sync when the active wallet changes externally (e.g. WalletDropdown switch)
watch(() => portfolio.address, addr => { localAddress.value = addr })

async function handleLoad() {
  const addr = localAddress.value.trim()
  if (!addr) return
  portfolio.address = addr
  await Promise.all([
    portfolio.loadPortfolio(addr),
    tradesStore.loadTrades(addr),
  ])
}
</script>

<template>
  <div class="wallet-bar">
    <div class="input-wrapper">
      <i class="pi pi-wallet input-icon" />
      <InputText
        v-model="localAddress"
        placeholder="Enter wallet address  0x…"
        class="wallet-input"
        :disabled="portfolio.loading"
        @keyup.enter="handleLoad"
        fluid
      />
    </div>

    <Button
      label="Load Portfolio"
      icon="pi pi-arrow-right"
      icon-pos="right"
      :loading="portfolio.loading"
      :disabled="portfolio.loading"
      @click="handleLoad"
      class="load-btn"
    />

    <ProgressSpinner
      v-if="portfolio.loading"
      style="width: 26px; height: 26px; flex-shrink: 0"
      strokeWidth="3"
    />
  </div>
</template>

<style scoped>
.wallet-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-wrapper {
  position: relative;
  flex: 1;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 0.8rem;
  pointer-events: none;
  z-index: 1;
}

.wallet-input {
  width: 100%;
  padding-left: 34px !important;
  font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace !important;
  font-size: 0.78rem !important;
  letter-spacing: 0.02em !important;
}

.load-btn {
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .wallet-bar  { flex-direction: column; align-items: stretch; }
  .load-btn    { width: 100%; justify-content: center; }
}
</style>
