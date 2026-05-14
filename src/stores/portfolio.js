import { defineStore } from 'pinia'
import { portfolioApi } from '@/services/api'

const mockHoldings = [
  { symbol: 'ETH', amount: 0.5,  current_price: 3200,  value_usd: 1600 },
  { symbol: 'BTC', amount: 0.04, current_price: 62000, value_usd: 2480 },
  { symbol: 'SOL', amount: 5.0,  current_price: 148,   value_usd: 740  },
]

const mockPnl = [
  { symbol: 'ETH', avg_buy_price: 3000,  current_price: 3200,  amount: 0.5,  pnl_usd: 100, pnl_percent: 6.67 },
  { symbol: 'BTC', avg_buy_price: 58000, current_price: 62000, amount: 0.04, pnl_usd: 160, pnl_percent: 6.90 },
  { symbol: 'SOL', avg_buy_price: 140,   current_price: 148,   amount: 5.0,  pnl_usd: 40,  pnl_percent: 5.71 },
]

export const usePortfolioStore = defineStore('portfolio', {
  state: () => ({
    address: '0xa0FAC51456E504aE12EBE3170a3b942d66aa99c3',
    holdings: [],
    pnl: [],
    prices: {},
    loading: false,
    error: null,
    apiOffline: false,
  }),

  getters: {
    totalValue: (state) => state.holdings.reduce((s, h) => s + h.value_usd, 0),

    totalPnl: (state) => state.pnl.reduce((s, p) => s + p.pnl_usd, 0),

    totalPnlPercent: (state) => {
      const cost = state.pnl.reduce((s, p) => s + p.avg_buy_price * p.amount, 0)
      if (!cost) return 0
      return (state.pnl.reduce((s, p) => s + p.pnl_usd, 0) / cost) * 100
    },

    totalAssets: (state) => state.holdings.length,

    mergedHoldings: (state) =>
      state.holdings.map((h) => {
        const p = state.pnl.find((item) => item.symbol === h.symbol)
        return {
          ...h,
          avg_buy_price: p?.avg_buy_price ?? 0,
          pnl_usd:       p?.pnl_usd ?? 0,
          pnl_percent:   p?.pnl_percent ?? 0,
        }
      }),
  },

  actions: {
    async loadPortfolio(address) {
      this.loading = true
      this.error = null
      this.apiOffline = false
      try {
        const [portfolioRes, pnlRes] = await Promise.all([
          portfolioApi.getPortfolio(address),
          portfolioApi.getPnl(address),
        ])
        this.address  = address
        this.holdings = portfolioRes.data.holdings ?? []
        this.pnl      = pnlRes.data.pnl ?? []
      } catch (err) {
        this.apiOffline = true
        this.error      = err.message
        this.holdings   = mockHoldings
        this.pnl        = mockPnl
      } finally {
        this.loading = false
      }
    },

    async loadPrices() {
      try {
        const res  = await portfolioApi.getPrices()
        this.prices = res.data.prices ?? {}
      } catch {
        // ignore
      }
    },
  },
})
