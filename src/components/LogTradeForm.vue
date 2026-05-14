<script setup>
import { ref, computed } from 'vue'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import { useToast } from 'primevue/usetoast'
import { useTradesStore } from '@/stores/trades'
import { usePortfolioStore } from '@/stores/portfolio'

const toast     = useToast()
const trades    = useTradesStore()
const portfolio = usePortfolioStore()

const coinOptions = ['ETH', 'BTC', 'SOL', 'BNB']

const selectedType = ref('buy')
const selectedCoin = ref('ETH')
const amount       = ref(null)
const price        = ref(null)
const submitting   = ref(false)
const formError    = ref('')

const isBuy = computed(() => selectedType.value === 'buy')

async function handleSubmit() {
  formError.value = ''
  if (!amount.value || amount.value <= 0) { formError.value = 'Enter a valid amount'; return }
  if (!price.value  || price.value  <= 0) { formError.value = 'Enter a valid price';  return }

  submitting.value = true
  try {
    const data = await trades.recordTrade({
      wallet: portfolio.address,
      symbol: selectedCoin.value,
      amount: amount.value,
      price:  price.value,
      is_buy: isBuy.value,
    })
    toast.add({
      severity: 'success',
      summary:  'Trade Recorded',
      detail:   `TX: ${data.tx_hash ?? 'pending'}`,
      life:     5000,
    })
    amount.value = null
    price.value  = null
    await portfolio.loadPortfolio(portfolio.address)
  } catch (err) {
    toast.add({
      severity: 'error',
      summary:  'Trade Failed',
      detail:   err?.response?.data?.message ?? err.message ?? 'Could not record trade',
      life:     5000,
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="form-card">
    <!-- Card header -->
    <div class="form-card-header">
      <span class="section-label">
        <i class="pi pi-pencil" style="font-size:.7rem" />
        LOG TRADE
      </span>
      <span class="form-sub">writes to Sepolia via go-ethereum</span>
    </div>

    <div class="form-body">
      <!-- Buy / Sell toggle -->
      <div class="type-row">
        <button
          class="type-btn buy"
          :class="{ active: isBuy }"
          @click="selectedType = 'buy'"
        >
          <i class="pi pi-arrow-up" />
          BUY
        </button>
        <button
          class="type-btn sell"
          :class="{ active: !isBuy }"
          @click="selectedType = 'sell'"
        >
          <i class="pi pi-arrow-down" />
          SELL
        </button>
      </div>

      <!-- Fields -->
      <div class="fields-grid">
        <!-- Asset -->
        <div class="field">
          <label class="field-label">Asset</label>
          <Select
            v-model="selectedCoin"
            :options="coinOptions"
            placeholder="Select"
            class="field-input"
            fluid
          />
        </div>

        <!-- Amount -->
        <div class="field">
          <label class="field-label">Amount</label>
          <InputNumber
            v-model="amount"
            :min="0"
            :min-fraction-digits="0"
            :max-fraction-digits="8"
            placeholder="0.00000000"
            class="field-input"
            fluid
          />
        </div>

        <!-- Price -->
        <div class="field">
          <label class="field-label">Price (USD)</label>
          <InputNumber
            v-model="price"
            mode="currency"
            currency="USD"
            locale="en-US"
            :min="0"
            placeholder="$0.00"
            class="field-input"
            fluid
          />
        </div>

        <!-- Total preview -->
        <div class="field">
          <label class="field-label">Total</label>
          <div class="total-preview num">
            {{ amount && price
                ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(amount * price)
                : '—' }}
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="formError" class="form-error">
        <i class="pi pi-exclamation-triangle" />
        {{ formError }}
      </div>

      <!-- Submit -->
      <button
        class="submit-btn"
        :class="isBuy ? 'submit-buy' : 'submit-sell'"
        :disabled="submitting"
        @click="handleSubmit"
      >
        <span v-if="submitting" class="spin-wrap">
          <i class="pi pi-spin pi-spinner" />
          Broadcasting…
        </span>
        <span v-else>
          <i :class="isBuy ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" />
          {{ isBuy ? 'Record Buy On-Chain' : 'Record Sell On-Chain' }}
          <i class="pi pi-send" />
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.form-card {
  background:    var(--card-bg);
  border:        1px solid var(--card-border);
  border-radius: 12px;
  overflow:      hidden;
  box-shadow:    var(--card-shadow);
  transition:    background 0.2s, border-color 0.2s;
}

.form-card-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  padding:         14px 20px 12px;
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

.form-sub {
  font-size:  0.62rem;
  color:      var(--text-dim);
  font-style: italic;
}

.form-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Buy / Sell toggle */
.type-row {
  display: flex;
  gap:     8px;
}

.type-btn {
  flex:           1;
  border-radius:  8px;
  cursor:         pointer;
  font-size:      0.72rem;
  font-weight:    800;
  letter-spacing: 0.1em;
  padding:        10px 0;
  border:         1px solid var(--btn-border);
  background:     var(--btn-bg);
  color:          var(--btn-color);
  transition:     all 0.15s;
  display:        flex;
  align-items:    center;
  justify-content:center;
  gap:            7px;
}
.type-btn:hover       { border-color: var(--text-muted); color: var(--text-sec); }
.type-btn.buy.active  {
  background: rgba(34,197,94,.1);
  border-color: #22c55e;
  color: #22c55e;
  box-shadow: 0 0 16px rgba(34,197,94,.12);
}
.type-btn.sell.active {
  background: rgba(248,113,113,.1);
  border-color: #f87171;
  color: #f87171;
  box-shadow: 0 0 16px rgba(248,113,113,.12);
}

/* Fields */
.fields-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.field {
  display:        flex;
  flex-direction: column;
  gap:            6px;
}

.field-label {
  font-size:      0.62rem;
  font-weight:    700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color:          var(--label);
}

.field-input { width: 100%; }

.total-preview {
  background:    var(--total-bg);
  border:        1px solid var(--input-border);
  border-radius: 8px;
  padding:       9px 14px;
  font-family:   'SF Mono', ui-monospace, monospace;
  font-size:     0.82rem;
  color:         var(--text-muted);
  min-height:    38px;
  display:       flex;
  align-items:   center;
}

/* Error */
.form-error {
  display:     flex;
  align-items: center;
  gap:         7px;
  font-size:   0.75rem;
  color:       #f87171;
  padding:     8px 12px;
  background:  rgba(248,113,113,.07);
  border:      1px solid rgba(248,113,113,.18);
  border-radius:7px;
}

/* Submit button */
.submit-btn {
  width:          100%;
  border-radius:  9px;
  border:         none;
  cursor:         pointer;
  font-size:      0.75rem;
  font-weight:    800;
  letter-spacing: 0.08em;
  padding:        13px 0;
  transition:     all 0.15s;
  display:        flex;
  align-items:    center;
  justify-content:center;
  gap:            9px;
}
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.submit-buy {
  background: #22c55e;
  color:      #060a10;
  box-shadow: 0 0 0 0 rgba(34,197,94,0);
}
.submit-buy:hover:not(:disabled) {
  background: #1aaf52;
  box-shadow: 0 0 20px rgba(34,197,94,.3);
}

.submit-sell {
  background: #f87171;
  color:      #060a10;
}
.submit-sell:hover:not(:disabled) {
  background: #ef5252;
  box-shadow: 0 0 20px rgba(248,113,113,.3);
}

.spin-wrap { display: flex; align-items: center; gap: 8px; }

.num {
  font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 600px) {
  .fields-grid { grid-template-columns: 1fr; }
}
</style>
