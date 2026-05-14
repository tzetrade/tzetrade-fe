import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
})

export const portfolioApi = {
  getPortfolio: (address) => http.get(`/api/portfolio/${address}`),
  getPnl:       (address) => http.get(`/api/portfolio/${address}/pnl`),
  getPrices:    ()        => http.get('/api/prices'),
}

export const tradesApi = {
  getTrades:   (address) => http.get(`/api/trades/${address}`),
  recordTrade: (payload) => http.post('/api/trades', payload),
}
