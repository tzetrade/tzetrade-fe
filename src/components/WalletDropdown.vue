<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ethers } from 'ethers'
import { useWalletStore }    from '@/stores/wallet'
import { usePortfolioStore } from '@/stores/portfolio'
import { useTradesStore }    from '@/stores/trades'

const walletStore = useWalletStore()
const portfolio   = usePortfolioStore()
const tradesStore = useTradesStore()

// storeToRefs keeps each property as a reactive ref so the trigger button
// re-renders immediately when activeId changes
const { active: activeWallet, wallets, activeId, balanceLoading, balanceError, txPending, lastTxHash, lastTxError } = storeToRefs(walletStore)

// ── Panel state ───────────────────────────────────────────────────────────
const isOpen     = ref(false)
const panel      = ref(null)
const triggerBtn = ref(null)

// views: main | wallets | send | receive | txSuccess |
//        confirmKey | privateKey | confirmPhrase | passphrase | addWallet
const view = ref('main')

// ── Send ──────────────────────────────────────────────────────────────────
const sendTo     = ref('')
const sendAmount = ref('')
const sendError  = ref('')

// ── Add wallet ────────────────────────────────────────────────────────────
const newName    = ref('')
const importKey  = ref('')
const importMode = ref('create') // 'create' | 'key' | 'phrase'
const addError   = ref('')
const addLoading = ref(false)

// ── Confirm reveal ────────────────────────────────────────────────────────
const confirmPIN = ref('')
const pinError   = ref('')

// ── Copy toast ────────────────────────────────────────────────────────────
const copiedField  = ref('')
const toastLabel   = ref('')
const toastVisible = ref(false)
let toastTimer = null

// ── Back-nav map ──────────────────────────────────────────────────────────
const backTarget = computed(() => {
  if (view.value === 'addWallet')                         return 'wallets'
  if (view.value === 'privateKey')                        return 'confirmKey'
  if (view.value === 'passphrase')                        return 'confirmPhrase'
  if (['send', 'receive', 'txSuccess'].includes(view.value)) return 'main'
  return 'main'
})

const titleMap = {
  main:          'My Wallet',
  wallets:       'Switch Account',
  send:          'Send ETH',
  receive:       'Receive',
  txSuccess:     'Transaction Sent',
  confirmKey:    'Private Key',
  privateKey:    'Private Key',
  confirmPhrase: 'Recovery Phrase',
  passphrase:    'Recovery Phrase',
  addWallet:     'Add Account',
}

// ── Toggle + outside click ────────────────────────────────────────────────
function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) resetState()
}

function resetState() {
  view.value    = 'main'
  sendTo.value  = ''
  sendAmount.value = ''
  sendError.value  = ''
  confirmPIN.value = ''
  pinError.value   = ''
}

function handleOutside(e) {
  if (
    panel.value      && !panel.value.contains(e.target) &&
    triggerBtn.value && !triggerBtn.value.contains(e.target)
  ) isOpen.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutside)
})
onUnmounted(() => document.removeEventListener('mousedown', handleOutside))

// ── Switch wallet ─────────────────────────────────────────────────────────
async function switchWallet(id) {
  await walletStore.switchWallet(id)
  portfolio.address = walletStore.active.address
  view.value = 'main'
  await Promise.all([
    portfolio.loadPortfolio(walletStore.active.address),
    tradesStore.loadTrades(walletStore.active.address),
  ])
}

// ── Send ──────────────────────────────────────────────────────────────────
async function handleSend() {
  sendError.value = ''
  if (!ethers.isAddress(sendTo.value.trim())) {
    sendError.value = 'Invalid Ethereum address'
    return
  }
  const amt = parseFloat(sendAmount.value)
  if (!amt || amt <= 0) {
    sendError.value = 'Enter a valid amount'
    return
  }
  if (amt > parseFloat(walletStore.active?.balance ?? '0')) {
    sendError.value = 'Insufficient balance'
    return
  }
  try {
    await walletStore.sendETH(sendTo.value.trim(), sendAmount.value)
    view.value = 'txSuccess'
  } catch (e) {
    sendError.value = walletStore.lastTxError ?? e.message?.slice(0, 100) ?? 'Transaction failed'
  }
}

async function pasteAddress() {
  try {
    sendTo.value = await navigator.clipboard.readText()
  } catch { /* clipboard access denied */ }
}

// ── Confirm → reveal ──────────────────────────────────────────────────────
function openConfirm(target) {
  confirmPIN.value = ''
  pinError.value   = ''
  view.value       = target === 'key' ? 'confirmKey' : 'confirmPhrase'
}

function checkPIN(target) {
  if (confirmPIN.value.length > 0) {
    pinError.value = ''
    view.value     = target
  } else {
    pinError.value = 'Enter a password to confirm'
  }
}

// ── Add wallet ────────────────────────────────────────────────────────────
async function submitAddWallet() {
  addError.value = ''
  if (!newName.value.trim()) { addError.value = 'Enter a name'; return }
  addLoading.value = true
  try {
    if (importMode.value === 'key') {
      if (!importKey.value.trim()) { addError.value = 'Enter a private key'; return }
      await walletStore.importFromKey(newName.value.trim(), importKey.value.trim())
    } else if (importMode.value === 'phrase') {
      if (!importKey.value.trim()) { addError.value = 'Enter your recovery phrase'; return }
      await walletStore.importFromPhrase(newName.value.trim(), importKey.value.trim())
    } else {
      await walletStore.createWallet(newName.value.trim())
    }
    newName.value   = ''
    importKey.value = ''
    view.value      = 'wallets'
  } catch (e) {
    addError.value = e.message ?? 'Failed'
  } finally {
    addLoading.value = false
  }
}

// ── Copy to clipboard ─────────────────────────────────────────────────────
const copyLabels = { address: 'Address', privkey: 'Private Key', phrase: 'Recovery Phrase' }

async function copy(text, field) {
  if (!text) return
  await navigator.clipboard.writeText(text)
  copiedField.value  = field
  toastLabel.value   = copyLabels[field] ?? 'Text'
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false; copiedField.value = '' }, 2200)
}

// ── Helpers ───────────────────────────────────────────────────────────────
function truncate(addr) {
  if (!addr) return ''
  return addr.slice(0, 6) + '…' + addr.slice(-4)
}

function truncateTx(hash) {
  if (!hash) return ''
  return hash.slice(0, 10) + '…' + hash.slice(-8)
}

function jazzicon(addr) {
  const n = parseInt((addr || '0x0').slice(2, 10), 16) || 0
  return `hsl(${n % 360},70%,55%)`
}

// Format address as grouped chunks for the receive view
function formatAddressChunks(addr) {
  if (!addr) return []
  const body = addr.slice(2) // strip 0x
  const chunks = []
  for (let i = 0; i < body.length; i += 4) chunks.push(body.slice(i, i + 4))
  return chunks
}
</script>

<template>
  <!-- ── Trigger button ────────────────────────────────────────────────── -->
  <button
    ref="triggerBtn"
    class="wallet-trigger"
    :class="{ active: isOpen }"
    @click="toggle"
  >
    <span
      class="trigger-avatar"
      :style="{ background: jazzicon(activeWallet?.address ?? '0x0') }"
    >
      {{ activeWallet?.name?.slice(0, 1) ?? '?' }}
    </span>
    <span class="trigger-info">
      <span class="trigger-name">{{ activeWallet?.name ?? 'Wallet' }}</span>
      <span class="trigger-addr">{{ truncate(activeWallet?.address ?? '') }}</span>
    </span>
    <svg class="trigger-chevron" :class="{ flipped: isOpen }" viewBox="0 0 16 16" fill="none">
      <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>

  <!-- ── Dropdown panel ────────────────────────────────────────────────── -->
  <Transition name="drop">
    <div v-if="isOpen" ref="panel" class="wallet-panel">

      <!-- Top bar -->
      <div class="panel-topbar">
        <button v-if="view !== 'main'" class="back-btn" @click="view = backTarget">
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span v-else class="back-spacer"></span>
        <span class="panel-title">{{ titleMap[view] }}</span>
        <button class="close-btn" @click="isOpen = false">
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- MAIN                                                          -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-if="view === 'main'" class="panel-body">
        <div class="identity-block">
          <div class="big-avatar" :style="{ background: jazzicon(activeWallet?.address ?? '0x0') }">
            {{ activeWallet?.name?.slice(0, 1) ?? '?' }}
            <span class="avatar-ring"></span>
          </div>
          <div class="identity-name">{{ activeWallet?.name }}</div>
          <button class="address-pill" @click="copy(activeWallet?.address, 'address')">
            <span class="mono">{{ truncate(activeWallet?.address ?? '') }}</span>
            <svg v-if="copiedField !== 'address'" viewBox="0 0 16 16" fill="none" width="12" height="12">
              <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
              <path d="M3 11V3h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
            <svg v-else viewBox="0 0 16 16" fill="none" width="12" height="12">
              <path d="M3 8l4 4 6-6" stroke="#00c9a0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Balance -->
        <div class="balance-card">
          <div class="balance-eth">
            <span v-if="balanceLoading" class="balance-spin"></span>
            <template v-else>{{ activeWallet?.balance ?? '0.0000' }} ETH</template>
          </div>
          <div v-if="balanceError" class="balance-rpc-error">
            <svg viewBox="0 0 16 16" fill="none" width="11"><path d="M8 5v4M8 11v.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/></svg>
            RPC error — tap refresh to retry
          </div>
          <div v-else class="balance-sub">Sepolia Testnet · Test ETH only</div>
          <div class="network-tag">
            <span class="net-dot"></span>Sepolia
          </div>
          <button class="refresh-btn" @click="walletStore.refreshBalance()" :disabled="balanceLoading" title="Refresh balance">
            <svg viewBox="0 0 16 16" fill="none" width="12" height="12"
              :style="{ animation: balanceLoading ? 'spin 1s linear infinite' : 'none' }">
              <path d="M14 8A6 6 0 1 1 8 2M14 2v4h-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Quick actions -->
        <div class="quick-actions">
          <button class="qa-btn" @click="view = 'receive'">
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
              <path d="M10 3v14M5 12l5 5 5-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Receive</span>
          </button>
          <button class="qa-btn" @click="view = 'send'">
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
              <path d="M10 17V3M5 8l5-5 5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Send</span>
          </button>
          <button class="qa-btn" @click="view = 'wallets'">
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
              <circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.6"/>
              <path d="M10 6v4l2.5 2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            <span>Accounts</span>
          </button>
        </div>

        <!-- Security -->
        <div class="section-label">Security</div>
        <div class="menu-list">
          <button class="menu-item danger" @click="openConfirm('key')">
            <span class="menu-icon">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <path d="M7 10a3 3 0 1 0 6 0 3 3 0 0 0-6 0zm3-3V4m4.24 2.76-2.12 2.12M16 10h3M4 10H1m2.76 4.24 2.12-2.12M7 13.24l-2.12 2.12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="menu-text">Show Private Key</span>
            <span class="menu-badge warn">Sensitive</span>
            <svg class="menu-arrow" viewBox="0 0 16 16" fill="none" width="12"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </button>
          <button class="menu-item danger" :class="{ disabled: !activeWallet?.mnemonic }" @click="activeWallet?.mnemonic && openConfirm('phrase')">
            <span class="menu-icon">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <path d="M4 6h12M4 10h8M4 14h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="menu-text">Show Recovery Phrase</span>
            <span v-if="activeWallet?.mnemonic" class="menu-badge warn">Sensitive</span>
            <span v-else class="menu-badge muted">Not available</span>
            <svg class="menu-arrow" viewBox="0 0 16 16" fill="none" width="12"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </button>
        </div>

        <!-- Account -->
        <div class="section-label" style="margin-top:12px">Account</div>
        <div class="menu-list">
          <button class="menu-item" @click="view = 'wallets'">
            <span class="menu-icon">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <circle cx="10" cy="7" r="3" stroke="currentColor" stroke-width="1.5"/>
                <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="menu-text">Manage Accounts</span>
            <svg class="menu-arrow" viewBox="0 0 16 16" fill="none" width="12"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </button>
          <button class="menu-item" @click="view = 'addWallet'; importMode = 'create'">
            <span class="menu-icon">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M10 7v6M7 10h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="menu-text">Add / Import Account</span>
            <svg class="menu-arrow" viewBox="0 0 16 16" fill="none" width="12"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- SEND ETH                                                      -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-else-if="view === 'send'" class="panel-body">
        <div class="send-network">
          <span class="net-dot"></span>Sepolia Testnet · Test ETH only
        </div>

        <label class="field-label">To</label>
        <div class="addr-input-row">
          <input
            v-model="sendTo"
            class="pin-input"
            placeholder="0x..."
            style="padding-right:60px"
          />
          <button class="addr-paste-btn" @click="pasteAddress">Paste</button>
        </div>

        <label class="field-label">Amount</label>
        <div class="amount-row">
          <input
            v-model="sendAmount"
            class="pin-input amount-input"
            type="number"
            min="0"
            step="0.001"
            placeholder="0.0"
          />
          <span class="amount-unit">ETH</span>
          <button
            class="max-btn"
            @click="sendAmount = activeWallet?.balance ?? '0'"
          >MAX</button>
        </div>

        <div class="send-available">
          Available:
          <span class="mono">{{ activeWallet?.balance ?? '0.0000' }} ETH</span>
        </div>

        <p v-if="sendError" class="pin-error">{{ sendError }}</p>

        <button
          class="confirm-btn send-btn"
          :disabled="txPending || !sendTo || !sendAmount"
          @click="handleSend"
        >
          <span v-if="txPending" class="btn-spinner"></span>
          {{ txPending ? 'Sending…' : 'Send ETH' }}
        </button>

        <p v-if="txPending && lastTxHash" class="tx-pending-note">
          Waiting for confirmation…
          <a :href="`https://sepolia.etherscan.io/tx/${lastTxHash}`" target="_blank" class="etherscan-link">
            {{ truncateTx(lastTxHash) }} ↗
          </a>
        </p>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- RECEIVE                                                        -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-else-if="view === 'receive'" class="panel-body">
        <div class="receive-label">Your Sepolia address</div>

        <div class="receive-address-box">
          <div class="receive-addr-chunks">
            <span class="receive-prefix mono">0x</span>
            <span
              v-for="(chunk, i) in formatAddressChunks(activeWallet?.address)"
              :key="i"
              class="mono addr-chunk"
            >{{ chunk }}</span>
          </div>
        </div>

        <button class="copy-btn" @click="copy(activeWallet?.address, 'address')">
          <svg viewBox="0 0 16 16" fill="none" width="13">
            <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M3 11V3h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          {{ copiedField === 'address' ? 'Copied!' : 'Copy Address' }}
        </button>

        <div class="receive-note">
          Share this address to receive ETH on the Sepolia testnet.
          Do not send mainnet ETH to this address.
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- TX SUCCESS                                                     -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-else-if="view === 'txSuccess'" class="panel-body">
        <div class="tx-success-wrap">
          <div class="tx-success-icon">
            <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
              <circle cx="20" cy="20" r="19" stroke="#00c9a0" stroke-width="1.5" stroke-dasharray="120" stroke-dashoffset="0" class="tx-circle"/>
              <path d="M12 20l6 6 10-12" stroke="#00c9a0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="tx-check"/>
            </svg>
          </div>
          <div class="tx-success-title">Transaction Confirmed</div>
          <div class="tx-success-sub">Your ETH has been sent</div>
        </div>

        <div class="tx-hash-box">
          <span class="tx-hash-label">TX HASH</span>
          <span class="mono tx-hash-val">{{ truncateTx(lastTxHash) }}</span>
          <button class="tx-hash-copy" @click="copy(lastTxHash, 'address')" title="Copy TX hash">
            <svg viewBox="0 0 16 16" fill="none" width="12">
              <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
              <path d="M3 11V3h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <a
          :href="`https://sepolia.etherscan.io/tx/${lastTxHash}`"
          target="_blank"
          class="etherscan-btn"
        >
          <svg viewBox="0 0 16 16" fill="none" width="14">
            <path d="M4 12L12 4M12 4H7M12 4v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          View on Sepolia Etherscan
        </a>

        <button class="confirm-btn" style="background:#0a1828;color:#8ea8c8;border:1px solid #182336" @click="view = 'main'">
          Done
        </button>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- SWITCH WALLETS                                                 -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-else-if="view === 'wallets'" class="panel-body">
        <div class="wallet-list">
          <button
            v-for="w in wallets"
            :key="w.id"
            class="wallet-row"
            :class="{ active: w.id === activeId }"
            @click="switchWallet(w.id)"
          >
            <span class="wr-avatar" :style="{ background: jazzicon(w.address) }">
              {{ w.name.slice(0, 1) }}
            </span>
            <span class="wr-info">
              <span class="wr-name">{{ w.name }}</span>
              <span class="wr-addr mono">{{ truncate(w.address) }}</span>
            </span>
            <span class="wr-bal">
              <span class="wr-eth">{{ w.balance }} ETH</span>
              <span class="wr-net">Sepolia</span>
            </span>
            <span v-if="w.id === activeId" class="wr-check">
              <svg viewBox="0 0 16 16" fill="none" width="14">
                <path d="M3 8l4 4 6-6" stroke="#00c9a0" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </span>
          </button>
        </div>
        <button class="add-wallet-btn" @click="view = 'addWallet'; importMode = 'create'">
          <svg viewBox="0 0 16 16" fill="none" width="14">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          Add / Import Account
        </button>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- CONFIRM → PRIVATE KEY                                         -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-else-if="view === 'confirmKey'" class="panel-body">
        <div class="confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" width="30" height="30">
            <path d="M12 9v4M12 16.5v.5" stroke="#f87171" stroke-width="2" stroke-linecap="round"/>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#f87171" stroke-width="1.8"/>
          </svg>
        </div>
        <p class="confirm-warning">Never share your private key. Anyone who has it can steal your funds.</p>
        <label class="field-label">Confirm with your password</label>
        <input v-model="confirmPIN" type="password" placeholder="Password" class="pin-input" @keyup.enter="checkPIN('privateKey')"/>
        <p v-if="pinError" class="pin-error">{{ pinError }}</p>
        <button class="confirm-btn" @click="checkPIN('privateKey')">Reveal Private Key</button>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- PRIVATE KEY                                                    -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-else-if="view === 'privateKey'" class="panel-body">
        <div class="sensitive-banner">
          <svg viewBox="0 0 20 20" fill="none" width="16"><path d="M10 2a5 5 0 00-5 5v2H4a1 1 0 00-1 1v7a1 1 0 001 1h12a1 1 0 001-1v-7a1 1 0 00-1-1h-1V7a5 5 0 00-5-5zm0 2a3 3 0 013 3v2H7V7a3 3 0 013-3z" fill="#f87171"/></svg>
          Keep this secret. Never share with anyone.
        </div>
        <div class="key-box">
          <span class="mono key-text">{{ activeWallet?.privateKey }}</span>
        </div>
        <button class="copy-btn" @click="copy(activeWallet?.privateKey, 'privkey')">
          <svg viewBox="0 0 16 16" fill="none" width="13"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M3 11V3h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          {{ copiedField === 'privkey' ? 'Copied!' : 'Copy to Clipboard' }}
        </button>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- CONFIRM → RECOVERY PHRASE                                     -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-else-if="view === 'confirmPhrase'" class="panel-body">
        <div class="confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" width="30" height="30">
            <path d="M12 9v4M12 16.5v.5" stroke="#f87171" stroke-width="2" stroke-linecap="round"/>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#f87171" stroke-width="1.8"/>
          </svg>
        </div>
        <p class="confirm-warning">Your recovery phrase gives full access to your wallet. Never share it with anyone.</p>
        <label class="field-label">Confirm with your password</label>
        <input v-model="confirmPIN" type="password" placeholder="Password" class="pin-input" @keyup.enter="checkPIN('passphrase')"/>
        <p v-if="pinError" class="pin-error">{{ pinError }}</p>
        <button class="confirm-btn" @click="checkPIN('passphrase')">Reveal Recovery Phrase</button>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- RECOVERY PHRASE                                                -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-else-if="view === 'passphrase'" class="panel-body">
        <div class="sensitive-banner">
          <svg viewBox="0 0 20 20" fill="none" width="16"><path d="M10 2a5 5 0 00-5 5v2H4a1 1 0 00-1 1v7a1 1 0 001 1h12a1 1 0 001-1v-7a1 1 0 00-1-1h-1V7a5 5 0 00-5-5zm0 2a3 3 0 013 3v2H7V7a3 3 0 013-3z" fill="#f87171"/></svg>
          Write these words down and store them safely offline.
        </div>
        <div class="phrase-grid">
          <div
            v-for="(word, i) in activeWallet?.mnemonic?.split(' ') ?? []"
            :key="i"
            class="phrase-chip"
          >
            <span class="phrase-num">{{ i + 1 }}</span>
            <span class="phrase-word">{{ word }}</span>
          </div>
        </div>
        <button class="copy-btn" @click="copy(activeWallet?.mnemonic, 'phrase')">
          <svg viewBox="0 0 16 16" fill="none" width="13"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M3 11V3h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          {{ copiedField === 'phrase' ? 'Copied!' : 'Copy to Clipboard' }}
        </button>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- ADD / IMPORT WALLET                                            -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-else-if="view === 'addWallet'" class="panel-body">
        <div class="tab-row">
          <button :class="['tab-btn', importMode === 'create' && 'tab-active']" @click="importMode = 'create'">Create New</button>
          <button :class="['tab-btn', importMode === 'key'    && 'tab-active']" @click="importMode = 'key'">Private Key</button>
          <button :class="['tab-btn', importMode === 'phrase' && 'tab-active']" @click="importMode = 'phrase'">Phrase</button>
        </div>

        <label class="field-label">Account Name</label>
        <input v-model="newName" type="text" placeholder="e.g. Trading Account" class="pin-input"/>

        <template v-if="importMode === 'key'">
          <label class="field-label">Private Key</label>
          <textarea v-model="importKey" class="key-textarea" placeholder="Paste your private key (0x…)"></textarea>
        </template>

        <template v-if="importMode === 'phrase'">
          <label class="field-label">Recovery Phrase</label>
          <textarea v-model="importKey" class="key-textarea" placeholder="word1 word2 word3 … (12 or 24 words)"></textarea>
        </template>

        <p v-if="addError" class="pin-error">{{ addError }}</p>

        <button class="confirm-btn" @click="submitAddWallet" :disabled="addLoading || !newName.trim()">
          <span v-if="addLoading" class="btn-spinner"></span>
          {{ addLoading ? 'Creating…' : importMode === 'create' ? 'Create Account' : 'Import Account' }}
        </button>
      </div>

    </div>
  </Transition>

  <!-- ── Copy toast ─────────────────────────────────────────────────────── -->
  <Transition name="toast">
    <div v-if="toastVisible" class="copy-toast">
      <span class="toast-check">
        <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
          <path d="M3 8l4 4 6-6" stroke="#00c9a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="toast-text">{{ toastLabel }} copied!</span>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Trigger ──────────────────────────────────────────────────────────── */
.wallet-trigger {
  display:     flex;
  align-items: center;
  gap:         8px;
  background:  var(--btn-bg, rgba(10,17,32,.7));
  border:      1px solid var(--card-border, #182336);
  border-radius: 10px;
  padding:     5px 10px 5px 6px;
  cursor:      pointer;
  transition:  all 0.15s;
  color:       var(--text-sec, #8ea8c8);
  position:    relative;
}
.wallet-trigger:hover,
.wallet-trigger.active {
  border-color: #00c9a0;
  background:   rgba(0,201,160,.06);
  color:        #00c9a0;
}

.trigger-avatar {
  width:  28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .72rem; font-weight: 800; color: #fff; flex-shrink: 0;
}

.trigger-info { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
.trigger-name { font-size: .68rem; font-weight: 700; line-height: 1.1; color: var(--text-primary, #d8eaff); }
.trigger-addr { font-size: .6rem; font-family: 'SF Mono','Fira Code',ui-monospace,monospace; color: var(--text-muted, #3a5070); line-height: 1.1; }

.trigger-chevron { width: 14px; height: 14px; flex-shrink: 0; transition: transform .2s; color: currentColor; }
.trigger-chevron.flipped { transform: rotate(180deg); }

/* ── Panel ────────────────────────────────────────────────────────────── */
.wallet-panel {
  position:      absolute;
  top:           calc(100% + 10px);
  right:         0;
  width:         320px;
  background:    var(--card-bg, #0f1623);
  border:        1px solid var(--card-border, #182336);
  border-radius: 16px;
  box-shadow:    0 20px 60px rgba(0,0,0,.7), 0 0 0 1px rgba(0,201,160,.06);
  z-index:       9999;
  overflow:      hidden;
}

.drop-enter-active { transition: opacity .18s ease, transform .18s cubic-bezier(.34,1.56,.64,1); }
.drop-leave-active { transition: opacity .14s ease, transform .14s ease; }
.drop-enter-from   { opacity: 0; transform: translateY(-8px) scale(.97); }
.drop-leave-to     { opacity: 0; transform: translateY(-6px) scale(.97); }

/* ── Top bar ──────────────────────────────────────────────────────────── */
.panel-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--card-border, #182336);
  background: rgba(0,0,0,.15);
}
.panel-title { font-size: .7rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted, #3a5070); }
.back-spacer { width: 22px; }

.back-btn, .close-btn {
  background: none; border: none; cursor: pointer;
  color: var(--text-muted, #3a5070); padding: 4px; border-radius: 6px;
  display: flex; transition: all .15s;
}
.back-btn:hover, .close-btn:hover { color: var(--text-sec, #8ea8c8); background: rgba(255,255,255,.05); }

/* ── Panel body ───────────────────────────────────────────────────────── */
.panel-body {
  padding: 16px;
  display: flex; flex-direction: column; gap: 10px;
  max-height: 500px; overflow-y: auto; overflow-x: hidden;
}
.panel-body::-webkit-scrollbar       { width: 4px; }
.panel-body::-webkit-scrollbar-track { background: transparent; }
.panel-body::-webkit-scrollbar-thumb { background: var(--card-border, #182336); border-radius: 4px; }

/* ── Identity block ───────────────────────────────────────────────────── */
.identity-block { display: flex; flex-direction: column; align-items: center; gap: 6px; padding-bottom: 4px; }

.big-avatar {
  width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; font-weight: 900; color: #fff;
  position: relative; box-shadow: 0 0 0 3px rgba(0,0,0,.4);
}
.avatar-ring {
  position: absolute; inset: -3px; border-radius: 50%;
  border: 2px solid rgba(0,201,160,.35);
  animation: ring-pulse 3s ease-in-out infinite;
}
@keyframes ring-pulse { 0%,100% { opacity:.35; transform:scale(1); } 50% { opacity:.7; transform:scale(1.04); } }

.identity-name { font-size: .85rem; font-weight: 700; color: var(--text-primary, #d8eaff); }

.address-pill {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.04); border: 1px solid var(--card-border, #182336);
  border-radius: 20px; padding: 4px 10px; cursor: pointer;
  color: var(--text-muted, #3a5070); font-size: .7rem; transition: all .15s;
}
.address-pill:hover { border-color: #00c9a0; color: #00c9a0; }

/* ── Balance card ─────────────────────────────────────────────────────── */
.balance-card {
  position: relative;
  background: linear-gradient(135deg, rgba(0,201,160,.08) 0%, rgba(0,0,0,0) 60%);
  border: 1px solid rgba(0,201,160,.12); border-radius: 12px;
  padding: 14px 16px 12px; text-align: center;
}
.balance-eth {
  font-size: 1.5rem; font-weight: 800; color: var(--text-primary, #d8eaff);
  font-family: 'SF Mono','Fira Code',ui-monospace,monospace; letter-spacing: -.02em;
  display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 36px;
}
.balance-sub      { font-size: .62rem; color: var(--text-muted, #3a5070); margin-top: 2px; }
.balance-rpc-error {
  display:     flex;
  align-items: center;
  gap:         5px;
  font-size:   .62rem;
  color:       #f87171;
  margin-top:  2px;
}
.network-tag  {
  display: inline-flex; align-items: center; gap: 5px; margin-top: 8px;
  background: rgba(129,140,248,.08); border: 1px solid rgba(129,140,248,.15);
  border-radius: 20px; padding: 2px 10px;
  font-size: .62rem; font-weight: 700; letter-spacing: .06em; color: #818cf8;
}
.net-dot { width: 5px; height: 5px; border-radius: 50%; background: #818cf8; box-shadow: 0 0 6px #818cf8; }

.refresh-btn {
  position: absolute; top: 10px; right: 10px;
  background: none; border: none; cursor: pointer;
  color: var(--text-muted, #3a5070); padding: 4px; border-radius: 6px;
  display: flex; transition: color .15s;
}
.refresh-btn:hover:not(:disabled) { color: #00c9a0; }
.refresh-btn:disabled { opacity: .4; cursor: not-allowed; }

.balance-spin {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid rgba(0,201,160,.2); border-top-color: #00c9a0;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Quick actions ────────────────────────────────────────────────────── */
.quick-actions { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
.qa-btn {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  background: rgba(255,255,255,.03); border: 1px solid var(--card-border, #182336);
  border-radius: 10px; padding: 10px 6px 8px; cursor: pointer;
  color: var(--text-sec, #8ea8c8); font-size: .62rem; font-weight: 700; letter-spacing: .05em;
  transition: all .15s;
}
.qa-btn:hover { border-color: #00c9a0; color: #00c9a0; background: rgba(0,201,160,.06); }

/* ── Section label ────────────────────────────────────────────────────── */
.section-label { font-size: .58rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--text-muted, #3a5070); padding: 0 2px; }

/* ── Menu list ────────────────────────────────────────────────────────── */
.menu-list { display: flex; flex-direction: column; gap: 2px; }
.menu-item {
  display: flex; align-items: center; gap: 10px;
  background: none; border: none; border-radius: 8px; padding: 9px 10px;
  cursor: pointer; color: var(--text-sec, #8ea8c8); font-size: .78rem;
  width: 100%; text-align: left; transition: all .15s;
}
.menu-item:hover  { background: rgba(255,255,255,.04); color: var(--text-primary, #d8eaff); }
.menu-item.danger:hover { background: rgba(248,113,113,.06); color: #f87171; }
.menu-item.disabled { opacity: .4; cursor: not-allowed; }
.menu-item.disabled:hover { background: none; color: var(--text-sec, #8ea8c8); }

.menu-icon {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; background: rgba(255,255,255,.04); border-radius: 7px; flex-shrink: 0;
}
.menu-text  { flex: 1; }
.menu-badge { font-size: .55rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; border-radius: 4px; padding: 2px 6px; }
.menu-badge.warn  { background: rgba(248,113,113,.1); color: #f87171; border: 1px solid rgba(248,113,113,.18); }
.menu-badge.muted { background: rgba(255,255,255,.04); color: var(--text-muted, #3a5070); border: 1px solid rgba(255,255,255,.08); }
.menu-arrow { color: var(--text-muted, #3a5070); flex-shrink: 0; }

/* ── Send view ────────────────────────────────────────────────────────── */
.send-network {
  display: flex; align-items: center; gap: 6px;
  background: rgba(129,140,248,.06); border: 1px solid rgba(129,140,248,.12);
  border-radius: 8px; padding: 7px 12px;
  font-size: .65rem; font-weight: 700; color: #818cf8; letter-spacing: .04em;
}
.send-network .net-dot { background: #818cf8; box-shadow: 0 0 6px #818cf8; }

.addr-input-row { position: relative; }
.addr-paste-btn {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  background: rgba(0,201,160,.1); border: 1px solid rgba(0,201,160,.2);
  border-radius: 6px; color: #00c9a0; font-size: .62rem; font-weight: 700;
  padding: 3px 8px; cursor: pointer; transition: background .15s;
}
.addr-paste-btn:hover { background: rgba(0,201,160,.18); }

.amount-row { display: flex; align-items: center; gap: 6px; }
.amount-input { flex: 1; }
.amount-unit  { font-size: .75rem; font-weight: 700; color: var(--text-muted, #3a5070); flex-shrink: 0; }
.max-btn {
  background: rgba(0,201,160,.08); border: 1px solid rgba(0,201,160,.2);
  border-radius: 6px; color: #00c9a0; font-size: .6rem; font-weight: 800;
  padding: 4px 8px; cursor: pointer; flex-shrink: 0; transition: background .15s;
}
.max-btn:hover { background: rgba(0,201,160,.16); }

.send-available { font-size: .68rem; color: var(--text-muted, #3a5070); text-align: right; }
.send-available .mono { color: var(--text-sec, #8ea8c8); }

.send-btn { background: linear-gradient(135deg,#00c9a0,#00af8d) !important; color: #060a12 !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; }
.send-btn:hover:not(:disabled) { box-shadow: 0 0 20px rgba(0,201,160,.4) !important; }

.btn-spinner {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  animation: spin 1s linear infinite; flex-shrink: 0;
}

.tx-pending-note {
  font-size: .65rem; color: var(--text-muted, #3a5070); text-align: center; margin: 0;
  display: flex; flex-direction: column; gap: 4px; align-items: center;
}

/* ── Receive view ─────────────────────────────────────────────────────── */
.receive-label { font-size: .62rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--text-muted, #3a5070); text-align: center; }
.receive-address-box {
  background: rgba(0,0,0,.3); border: 1px solid var(--card-border, #182336);
  border-radius: 12px; padding: 18px 14px; text-align: center;
}
.receive-addr-chunks { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 3px; }
.receive-prefix { font-size: .75rem; color: var(--text-muted, #3a5070); }
.addr-chunk { font-size: .75rem; color: var(--text-sec, #8ea8c8); letter-spacing: .04em; }

.receive-note {
  font-size: .68rem; color: var(--text-muted, #3a5070);
  text-align: center; line-height: 1.5; padding: 0 4px;
}

/* ── TX Success ───────────────────────────────────────────────────────── */
.tx-success-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 8px 0; }

.tx-success-icon { position: relative; }
.tx-circle { animation: draw-circle .6s ease forwards; }
.tx-check  { animation: draw-check  .4s .5s ease forwards; stroke-dasharray: 30; stroke-dashoffset: 30; }
@keyframes draw-circle { to { stroke-dashoffset: 0; } }
@keyframes draw-check  { to { stroke-dashoffset: 0; } }

.tx-success-title { font-size: .95rem; font-weight: 800; color: #00c9a0; }
.tx-success-sub   { font-size: .72rem; color: var(--text-muted, #3a5070); }

.tx-hash-box {
  display: flex; align-items: center; gap: 8px;
  background: rgba(0,0,0,.3); border: 1px solid var(--card-border, #182336);
  border-radius: 8px; padding: 10px 12px;
}
.tx-hash-label { font-size: .55rem; font-weight: 800; letter-spacing: .12em; color: var(--text-muted, #3a5070); flex-shrink: 0; }
.tx-hash-val   { font-size: .7rem; color: var(--text-sec, #8ea8c8); flex: 1; }
.tx-hash-copy  { background: none; border: none; cursor: pointer; color: var(--text-muted, #3a5070); padding: 2px; display: flex; transition: color .15s; }
.tx-hash-copy:hover { color: #00c9a0; }

.etherscan-btn {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  background: rgba(129,140,248,.08); border: 1px solid rgba(129,140,248,.18);
  border-radius: 8px; color: #818cf8; font-size: .72rem; font-weight: 700;
  padding: 10px; text-decoration: none; width: 100%; box-sizing: border-box;
  transition: all .15s;
}
.etherscan-btn:hover { background: rgba(129,140,248,.14); border-color: rgba(129,140,248,.4); }

.etherscan-link { color: #818cf8; text-decoration: none; font-size: .62rem; }
.etherscan-link:hover { text-decoration: underline; }

/* ── Wallet list ──────────────────────────────────────────────────────── */
.wallet-list { display: flex; flex-direction: column; gap: 4px; }
.wallet-row {
  display: flex; align-items: center; gap: 10px;
  background: none; border: 1px solid transparent; border-radius: 10px;
  padding: 10px; cursor: pointer; color: var(--text-sec, #8ea8c8);
  text-align: left; width: 100%; transition: all .15s;
}
.wallet-row:hover  { background: rgba(255,255,255,.04); border-color: var(--card-border, #182336); }
.wallet-row.active { background: rgba(0,201,160,.06); border-color: rgba(0,201,160,.2); }

.wr-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .75rem; font-weight: 800; color: #fff; flex-shrink: 0;
}
.wr-info { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.wr-name { font-size: .78rem; font-weight: 700; color: var(--text-primary, #d8eaff); }
.wr-addr { font-size: .62rem; color: var(--text-muted, #3a5070); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wr-bal  { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; flex-shrink: 0; }
.wr-eth  { font-size: .72rem; font-weight: 700; color: var(--text-primary, #d8eaff); white-space: nowrap; }
.wr-net  { font-size: .58rem; color: var(--text-muted, #3a5070); }
.wr-check { flex-shrink: 0; display: flex; }

.add-wallet-btn {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  background: rgba(0,201,160,.05); border: 1px dashed rgba(0,201,160,.2);
  border-radius: 10px; padding: 10px; cursor: pointer;
  color: #00c9a0; font-size: .72rem; font-weight: 700; width: 100%;
  margin-top: 6px; transition: all .15s;
}
.add-wallet-btn:hover { background: rgba(0,201,160,.1); border-color: rgba(0,201,160,.4); }

/* ── Confirm / reveal ─────────────────────────────────────────────────── */
.confirm-icon { display: flex; justify-content: center; margin-bottom: 4px; }
.confirm-warning {
  font-size: .75rem; color: #f87171; text-align: center; line-height: 1.5;
  background: rgba(248,113,113,.06); border: 1px solid rgba(248,113,113,.12);
  border-radius: 8px; padding: 10px 12px; margin: 0;
}

.field-label { font-size: .62rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--text-muted, #3a5070); }

.pin-input, .key-textarea {
  width: 100%; background: var(--input-bg, #0a1120); border: 1px solid var(--input-border, #182336);
  border-radius: 8px; color: var(--text-primary, #d8eaff); font-size: .82rem;
  padding: 10px 12px; outline: none; transition: border-color .15s, box-shadow .15s;
  box-sizing: border-box; font-family: inherit;
}
.pin-input:focus, .key-textarea:focus { border-color: #00c9a0; box-shadow: 0 0 0 3px rgba(0,201,160,.12); }
.pin-input::placeholder, .key-textarea::placeholder { color: var(--text-muted, #3a5070); }
.key-textarea { height: 84px; resize: none; font-family: 'SF Mono','Fira Code',ui-monospace,monospace; font-size: .72rem; }

.pin-error { font-size: .7rem; color: #f87171; margin: 0; }

.confirm-btn {
  width: 100%; background: #e8453c; border: none; border-radius: 8px;
  color: #fff; font-size: .78rem; font-weight: 800; letter-spacing: .05em;
  padding: 11px; cursor: pointer; transition: all .15s; margin-top: 2px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.confirm-btn:hover:not(:disabled) { background: #c73831; box-shadow: 0 0 16px rgba(232,69,60,.3); }
.confirm-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ── Sensitive banner ─────────────────────────────────────────────────── */
.sensitive-banner {
  display: flex; align-items: center; gap: 8px;
  background: rgba(248,113,113,.07); border: 1px solid rgba(248,113,113,.15);
  border-radius: 8px; padding: 9px 12px; font-size: .7rem; color: #f87171; font-weight: 600;
}
.key-box { background: rgba(0,0,0,.3); border: 1px solid var(--card-border, #182336); border-radius: 10px; padding: 14px; word-break: break-all; }
.key-text { font-family: 'SF Mono','Fira Code',ui-monospace,monospace; font-size: .7rem; color: var(--text-sec, #8ea8c8); line-height: 1.6; }

/* ── Copy button ──────────────────────────────────────────────────────── */
.copy-btn {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  background: rgba(0,201,160,.08); border: 1px solid rgba(0,201,160,.2);
  border-radius: 8px; color: #00c9a0; font-size: .72rem; font-weight: 700;
  padding: 9px; cursor: pointer; width: 100%; transition: all .15s;
}
.copy-btn:hover { background: rgba(0,201,160,.14); border-color: rgba(0,201,160,.4); }

/* ── Phrase grid ──────────────────────────────────────────────────────── */
.phrase-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; }
.phrase-chip {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.03); border: 1px solid var(--card-border, #182336);
  border-radius: 7px; padding: 6px 8px;
}
.phrase-num  { font-size: .55rem; font-weight: 800; color: var(--text-muted, #3a5070); min-width: 14px; text-align: right; }
.phrase-word { font-family: 'SF Mono','Fira Code',ui-monospace,monospace; font-size: .68rem; color: var(--text-primary, #d8eaff); font-weight: 600; }

/* ── Add wallet tabs ──────────────────────────────────────────────────── */
.tab-row { display: flex; gap: 4px; background: rgba(0,0,0,.2); border-radius: 9px; padding: 3px; }
.tab-btn {
  flex: 1; background: none; border: none; border-radius: 7px;
  color: var(--text-muted, #3a5070); font-size: .68rem; font-weight: 700;
  padding: 7px 4px; cursor: pointer; transition: all .15s;
}
.tab-btn.tab-active { background: var(--card-border, #182336); color: var(--text-primary, #d8eaff); }
.tab-btn:not(.tab-active):hover { color: var(--text-sec, #8ea8c8); }

/* ── Copy toast ───────────────────────────────────────────────────────── */
.copy-toast {
  position: absolute; bottom: calc(100% + 10px); right: 0;
  display: flex; align-items: center; gap: 7px;
  background: #0f1623; border: 1px solid rgba(0,201,160,.3); border-radius: 10px;
  padding: 8px 14px 8px 10px; box-shadow: 0 8px 32px rgba(0,0,0,.6), 0 0 0 1px rgba(0,201,160,.08);
  white-space: nowrap; pointer-events: none; z-index: 10000;
}
.toast-check {
  display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; background: rgba(0,201,160,.12); border-radius: 50%;
  flex-shrink: 0; animation: check-pop .3s cubic-bezier(.34,1.56,.64,1) both;
}
.toast-text { font-size: .72rem; font-weight: 700; color: #00c9a0; letter-spacing: .02em; }

.toast-enter-active { transition: opacity .2s ease, transform .25s cubic-bezier(.34,1.56,.64,1); }
.toast-leave-active { transition: opacity .18s ease, transform .18s ease; }
.toast-enter-from   { opacity: 0; transform: translateY(6px) scale(.92); }
.toast-leave-to     { opacity: 0; transform: translateY(-4px) scale(.96); }
@keyframes check-pop { 0% { transform:scale(0); opacity:0; } 60% { transform:scale(1.25); opacity:1; } 100% { transform:scale(1); opacity:1; } }

/* ── Mono utility ─────────────────────────────────────────────────────── */
.mono { font-family: 'SF Mono','Fira Code',ui-monospace,monospace; }
</style>
