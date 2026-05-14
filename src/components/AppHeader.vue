<script setup>
import { RouterLink } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import WalletDropdown from '@/components/WalletDropdown.vue'

const { isDark, toggle } = useTheme()
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Left: brand (links back to home) -->
      <RouterLink to="/" class="header-brand">
        <svg class="brand-icon" viewBox="0 0 24 24" fill="none">
          <path d="M3 17L9 11L13 15L21 7" stroke="#00c9a0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17 7H21V11" stroke="#00c9a0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="brand-name">TZETRADE</span>
        <span class="network-badge">
          <span class="network-dot"></span>
          Sepolia
        </span>
      </RouterLink>

      <!-- Right: status + wallet dropdown + theme toggle -->
      <div class="header-right">
        <div class="price-ticker">
          <span class="ticker-label">ETH</span>
          <span class="ticker-value">$3,200.00</span>
          <span class="ticker-change positive">+2.34%</span>
        </div>
        <div class="separator"></div>
        <div class="status-pill">
          <span class="live-dot"></span>
          <span class="live-text">LIVE</span>
        </div>
        <div class="separator"></div>
        <!-- MetaMask-style wallet dropdown -->
        <div class="wallet-anchor">
          <WalletDropdown />
        </div>
        <button
          class="theme-toggle"
          @click="toggle"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 200;
  background: var(--header-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--header-border);
  height: 52px;
  transition: background 0.2s, border-color 0.2s;
}

.header-inner {
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Brand */
.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.brand-name {
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  background: linear-gradient(90deg, #00c9a0 0%, #00e0b5 60%, #7af9dc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.network-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(129, 140, 248, 0.08);
  border: 1px solid rgba(129, 140, 248, 0.18);
  border-radius: 20px;
  padding: 2px 9px 2px 6px;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #818cf8;
}

.network-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #818cf8;
  box-shadow: 0 0 6px #818cf8;
}

/* Right cluster */
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.price-ticker {
  display: flex;
  align-items: center;
  gap: 7px;
}

.ticker-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--label);
}

.ticker-value {
  font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-sec);
  letter-spacing: -0.01em;
}

.ticker-change {
  font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
}
.ticker-change.positive { color: #22c55e; }
.ticker-change.negative { color: #f87171; }

.separator {
  width: 1px;
  height: 18px;
  background: var(--header-border);
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.14);
  border-radius: 20px;
  padding: 3px 10px 3px 7px;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

.live-text {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #22c55e;
}

/* Theme toggle button */
.theme-toggle {
  background:    none;
  border:        1px solid var(--header-border);
  border-radius: 8px;
  color:         var(--text-muted);
  cursor:        pointer;
  padding:       6px 8px;
  font-size:     0.8rem;
  line-height:   1;
  display:       flex;
  align-items:   center;
  justify-content: center;
  transition:    all 0.15s;
}
.theme-toggle:hover {
  border-color: #00c9a0;
  color:        #00c9a0;
  background:   rgba(0, 201, 160, 0.08);
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2); }
  50%       { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.08); }
}

.wallet-anchor {
  position: relative;
}

@media (max-width: 600px) {
  .price-ticker { display: none; }
  .separator    { display: none; }
}
</style>
