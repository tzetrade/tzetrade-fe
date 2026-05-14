import { defineStore } from 'pinia'
import { markRaw }     from 'vue'
import { ethers }      from 'ethers'

// ── RPC pool — tried in order, first success wins ────────────────────────
const RPCS = [
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://sepolia.drpc.org',
  'https://1rpc.io/sepolia',
  'https://sepolia.gateway.tenderly.co',
]
// Sepolia network — passed inline so ethers skips the async eth_chainId call
const SEPOLIA = { chainId: 11155111, name: 'sepolia' }

function makeProvider(url) {
  return new ethers.JsonRpcProvider(url, SEPOLIA, { staticNetwork: true })
}

// Module-level flag — survives hot-reload resets of Pinia state
let _initDone = false

const STORAGE_KEY = 'tzetrade_wallets_v1'
const PALETTE     = ['#f6851b', '#818cf8', '#00c9a0', '#f87171', '#facc15', '#38bdf8', '#e2761b']

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    wallets:        [],
    activeId:       null,
    provider:       null,
    balanceLoading: false,
    balanceError:   null,
    txPending:      false,
    lastTxHash:     null,
    lastTxError:    null,
  }),

  getters: {
    active: (s) => s.wallets.find(w => w.id === s.activeId) ?? null,
  },

  actions: {
    // ── Boot — safe to call from multiple components ─────────────────────
    async init() {
      if (_initDone) return
      _initDone = true

      this._load()

      // Pick the first responding RPC as the persistent provider
      this.provider = markRaw(await this._pickProvider())

      if (this.wallets.length === 0) {
        await this.createWallet('Account 1')
      } else {
        await this.refreshBalance()
      }
    },

    // ── Create wallet from random entropy ────────────────────────────────
    async createWallet(name) {
      const w     = ethers.Wallet.createRandom()
      const entry = this._entry(name, w.address, w.privateKey, w.mnemonic?.phrase ?? null)
      this.wallets.push(entry)
      if (!this.activeId) this.activeId = entry.id
      this._save()
      await this.refreshBalance(entry.id)
      return entry
    },

    // ── Import from private key ──────────────────────────────────────────
    async importFromKey(name, rawKey) {
      const w = new ethers.Wallet(rawKey.trim())
      this._assertNotDuplicate(w.address)
      const entry = this._entry(name, w.address, w.privateKey, null)
      this.wallets.push(entry)
      this._save()
      await this.refreshBalance(entry.id)
      return entry
    },

    // ── Import from 12/24-word mnemonic ──────────────────────────────────
    async importFromPhrase(name, phrase) {
      const w = ethers.Wallet.fromPhrase(phrase.trim())
      this._assertNotDuplicate(w.address)
      const entry = this._entry(name, w.address, w.privateKey, phrase.trim())
      this.wallets.push(entry)
      this._save()
      await this.refreshBalance(entry.id)
      return entry
    },

    // ── Switch active wallet ─────────────────────────────────────────────
    async switchWallet(id) {
      this.activeId = id
      this._save()
      await this.refreshBalance(id)
    },

    // ── Fetch live balance — tries all RPCs, stops at first success ───────
    async refreshBalance(id) {
      const target = this.wallets.find(w => w.id === (id ?? this.activeId))
      if (!target) return

      this.balanceLoading = true
      this.balanceError   = null

      for (const url of RPCS) {
        try {
          const p   = makeProvider(url)
          const raw = await Promise.race([
            p.getBalance(target.address),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000)),
          ])
          target.balance = parseFloat(ethers.formatEther(raw)).toFixed(4)
          this.provider  = markRaw(p)   // markRaw: prevent Vue proxy from breaking ethers private fields
          this._save()
          this.balanceLoading = false
          return
        } catch { /* try next */ }
      }

      // All RPCs failed
      this.balanceError   = 'Could not reach Sepolia — check your internet'
      this.balanceLoading = false
    },

    // ── Send ETH ─────────────────────────────────────────────────────────
    async sendETH(to, amountEth) {
      if (!this.active) throw new Error('No active wallet')

      // Ensure we have a live provider before sending
      if (!this.provider) this.provider = markRaw(await this._pickProvider())

      this.txPending   = true
      this.lastTxHash  = null
      this.lastTxError = null
      try {
        const signer = new ethers.Wallet(this.active.privateKey, this.provider)
        const tx     = await signer.sendTransaction({
          to,
          value: ethers.parseEther(String(amountEth)),
        })
        this.lastTxHash = tx.hash
        await tx.wait(1)
        await this.refreshBalance()
        return tx
      } catch (err) {
        this.lastTxError = err?.shortMessage ?? err?.message ?? 'Transaction failed'
        throw err
      } finally {
        this.txPending = false
      }
    },

    // ── Remove wallet (min 1 must stay) ──────────────────────────────────
    removeWallet(id) {
      if (this.wallets.length <= 1) return
      this.wallets  = this.wallets.filter(w => w.id !== id)
      if (this.activeId === id) this.activeId = this.wallets[0].id
      this._save()
    },

    // ── Internals ────────────────────────────────────────────────────────
    async _pickProvider() {
      for (const url of RPCS) {
        try {
          const p = makeProvider(url)
          await Promise.race([
            p.getBlockNumber(),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000)),
          ])
          return markRaw(p)
        } catch { /* try next */ }
      }
      return markRaw(makeProvider(RPCS[0]))
    },

    _entry(name, address, privateKey, mnemonic) {
      return {
        id: Date.now(),
        name,
        address,
        privateKey,
        mnemonic,
        balance: '0.0000',
        color: PALETTE[this.wallets.length % PALETTE.length],
      }
    },

    _assertNotDuplicate(address) {
      if (this.wallets.some(w => w.address.toLowerCase() === address.toLowerCase())) {
        throw new Error('This wallet is already added')
      }
    },

    _save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          wallets:  this.wallets,
          activeId: this.activeId,
        }))
      } catch { /* storage quota */ }
    },

    _load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const data    = JSON.parse(raw)
        this.wallets  = data.wallets  ?? []
        this.activeId = data.activeId ?? this.wallets[0]?.id ?? null
      } catch { /* corrupted */ }
    },
  },
})
