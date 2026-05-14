import { defineStore } from 'pinia'
import { tradesApi } from '@/services/api'

const mockTrades = [
  { symbol: 'ETH', amount: 50000000,  price: 300000000000,  is_buy: true,  timestamp: 1715432400 },
  { symbol: 'BTC', amount: 2000000,   price: 5800000000000, is_buy: true,  timestamp: 1715350000 },
  { symbol: 'SOL', amount: 500000000, price: 15000000000,   is_buy: true,  timestamp: 1715200000 },
  { symbol: 'ETH', amount: 10000000,  price: 340000000000,  is_buy: false, timestamp: 1715100000 },
  { symbol: 'BTC', amount: 2000000,   price: 6000000000000, is_buy: true,  timestamp: 1714900000 },
]

export const useTradesStore = defineStore('trades', {
  state: () => ({
    trades: [],
    loading: false,
    lastTxHash: null,
  }),

  getters: {
    totalTrades:  (state) => state.trades.length,
    sortedTrades: (state) => [...state.trades].sort((a, b) => b.timestamp - a.timestamp),
  },

  actions: {
    async loadTrades(address) {
      this.loading = true
      try {
        const res    = await tradesApi.getTrades(address)
        this.trades  = res.data.trades ?? []
      } catch {
        this.trades = mockTrades
      } finally {
        this.loading = false
      }
    },

    async recordTrade(payload) {
      const res        = await tradesApi.recordTrade(payload)
      this.lastTxHash  = res.data.tx_hash ?? null
      return res.data
    },
  },
})
