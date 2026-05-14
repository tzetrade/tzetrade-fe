<script setup>
import { RouterLink } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

const features = [
  { icon: 'pi-chart-line', title: 'Real-time Price Feeds',     desc: 'Live ETH, BTC, SOL and BNB prices via TradingView — professional-grade charts with full indicator support.', color: '#22c55e', glow: 'rgba(34,197,94,.18)' },
  { icon: 'pi-calculator', title: 'P&L Analytics',             desc: 'Per-asset unrealised gains and losses calculated from your on-chain average buy price against live market data.', color: '#3b82f6', glow: 'rgba(59,130,246,.18)' },
  { icon: 'pi-send',       title: 'On-chain Trade Recording',  desc: 'Record buys and sells directly to Sepolia testnet via go-ethereum. Every trade is verifiable on Etherscan.', color: '#8b5cf6', glow: 'rgba(139,92,246,.18)' },
  { icon: 'pi-th-large',   title: 'Portfolio Allocation',      desc: 'Visual breakdown of your holdings by value, P&L contribution, and percentage allocation — always in sync.', color: '#f59e0b', glow: 'rgba(245,158,11,.18)' },
  { icon: 'pi-list',       title: 'Full Trade History',        desc: 'Complete indexed history of every on-chain transaction with timestamp, price, amount, and Etherscan link.', color: '#ec4899', glow: 'rgba(236,72,153,.18)' },
  { icon: 'pi-wallet',     title: 'Wallet-native Access',      desc: 'No account, no sign-up. Paste any Sepolia wallet address and get instant portfolio visibility in seconds.', color: '#00c9a0', glow: 'rgba(0,201,160,.18)' },
]

const steps = [
  { num: '01', title: 'Enter your wallet address', desc: 'Paste any Ethereum Sepolia testnet wallet address into the bar and hit Load Portfolio.' },
  { num: '02', title: 'Analyse your positions',    desc: 'Instantly see holdings, P&L, TradingView charts, and a full on-chain trade history for that address.' },
  { num: '03', title: 'Record trades on-chain',    desc: 'Use the Log Trade form to broadcast buys and sells to Sepolia. Each TX is confirmed and linked on Etherscan.' },
]

const stats = [
  { number: '4',     label: 'Assets tracked',    detail: 'ETH · BTC · SOL · BNB' },
  { number: '$4.8K', label: 'Sample portfolio',  detail: 'Based on mock holdings' },
  { number: '100%',  label: 'On-chain',          detail: 'All trades to Sepolia' },
  { number: '0',     label: 'Account required',  detail: 'Wallet address only' },
]

const techStack = ['go-ethereum', 'TradingView', 'Vue 3', 'Pinia', 'Gin REST API', 'Sepolia Testnet', 'Vite', 'TypeScript', 'go-ethereum', 'TradingView', 'Vue 3', 'Pinia', 'Gin REST API', 'Sepolia Testnet', 'Vite', 'TypeScript']
</script>

<template>
  <div class="home-page">
    <NavBar />

    <!-- ══════════════════════════════════════════
         HERO
    ══════════════════════════════════════════ -->
    <section class="hero">
      <!-- Animated background layers -->
      <div class="hero-bg">
        <div class="bg-grid"></div>
        <div class="bg-orb orb-1"></div>
        <div class="bg-orb orb-2"></div>
        <div class="bg-orb orb-3"></div>
      </div>

      <div class="hero-inner">

        <!-- Left copy -->
        <div class="hero-copy">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            Sepolia Testnet &nbsp;·&nbsp; Live Price Feeds
            <span class="badge-shimmer"></span>
          </div>

          <h1 class="hero-h1">
            Professional<br>
            crypto portfolio<br>
            <span class="hero-accent">tracking.</span>
          </h1>

          <p class="hero-sub">
            Real-time P&amp;L analytics, multi-asset holdings, and
            verifiable trade history — all anchored to the Ethereum
            Sepolia testnet. No account required.
          </p>

          <div class="hero-actions">
            <RouterLink to="/dashboard" class="btn-primary">
              Launch Dashboard
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor"
                      stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </RouterLink>
            <a href="#features" class="btn-ghost">
              Explore Features
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor"
                      stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>

          <!-- Floating token chips -->
          <div class="token-chips">
            <span class="chip chip-eth">
              <span class="chip-dot" style="background:#7b68ee"></span>ETH
              <span class="chip-val">$3,200</span>
              <span class="chip-up">+6.7%</span>
            </span>
            <span class="chip chip-btc">
              <span class="chip-dot" style="background:#f7931a"></span>BTC
              <span class="chip-val">$62K</span>
              <span class="chip-up">+6.9%</span>
            </span>
            <span class="chip chip-sol">
              <span class="chip-dot" style="background:#14f195"></span>SOL
              <span class="chip-val">$148</span>
              <span class="chip-up">+5.7%</span>
            </span>
          </div>
        </div>

        <!-- Right — dashboard preview card -->
        <div class="hero-card-wrap">
          <div class="hero-card">
            <!-- Glow ring -->
            <div class="card-glow"></div>

            <!-- Header -->
            <div class="pv-header">
              <div class="pv-live"><span class="pv-live-dot"></span>LIVE</div>
              <span class="pv-title">Portfolio Overview</span>
              <span class="pv-network">Sepolia</span>
            </div>

            <!-- Total value -->
            <div class="pv-total">
              <div class="pv-total-label">TOTAL VALUE</div>
              <div class="pv-total-val">$4,820.00</div>
              <div class="pv-total-pnl">+$300.00 &nbsp;·&nbsp; +6.64% ↑</div>
            </div>

            <div class="pv-divider"></div>

            <!-- Asset rows -->
            <div class="pv-assets">
              <div class="pv-row" v-for="(a, i) in [
                { sym:'ETH', amt:'0.500', price:'$3,200', chg:'+6.7%', color:'#7b68ee', w:'33%' },
                { sym:'BTC', amt:'0.040', price:'$62,000',chg:'+6.9%', color:'#f7931a', w:'51%' },
                { sym:'SOL', amt:'5.000', price:'$148',   chg:'+5.7%', color:'#14f195', w:'15%' },
              ]" :key="i">
                <span class="pv-dot" :style="{ background: a.color }"></span>
                <span class="pv-sym">{{ a.sym }}</span>
                <span class="pv-amt">{{ a.amt }}</span>
                <span class="pv-price">{{ a.price }}</span>
                <span class="pv-change up">{{ a.chg }}</span>
                <div class="pv-bar-wrap">
                  <div class="pv-bar" :style="{ width: a.w, background: a.color }"></div>
                </div>
              </div>
            </div>

            <div class="pv-divider"></div>

            <!-- Mini chart -->
            <div class="pv-minichart">
              <svg viewBox="0 0 220 52" preserveAspectRatio="none" width="100%" height="100%">
                <defs>
                  <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stop-color="#00c9a0" stop-opacity=".3"/>
                    <stop offset="100%" stop-color="#00c9a0" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0 42 C18 40 28 34 50 30 S80 22 105 16 S145 8 165 6 S195 3 220 2"
                      fill="none" stroke="#00c9a0" stroke-width="2"/>
                <path d="M0 42 C18 40 28 34 50 30 S80 22 105 16 S145 8 165 6 S195 3 220 2 L220 52 L0 52Z"
                      fill="url(#cg2)"/>
              </svg>
            </div>

            <RouterLink to="/dashboard" class="pv-cta">
              Open full dashboard
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
              </svg>
            </RouterLink>
          </div>

          <!-- Floating decorative badges -->
          <div class="float-badge badge-pnl">
            <span class="fb-label">P&amp;L</span>
            <span class="fb-val green">+$300</span>
          </div>
          <div class="float-badge badge-tx">
            <span class="fb-icon">⛓</span>
            <span class="fb-label">On-chain TX</span>
          </div>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════
         MARQUEE TECH STACK BAR
    ══════════════════════════════════════════ -->
    <div class="marquee-wrap">
      <div class="marquee-fade marquee-fade-l"></div>
      <div class="marquee-track">
        <div class="marquee-inner">
          <span v-for="(t, i) in techStack" :key="'a'+i" class="marquee-item">
            {{ t }} <span class="marq-sep">·</span>
          </span>
        </div>
        <div class="marquee-inner" aria-hidden="true">
          <span v-for="(t, i) in techStack" :key="'b'+i" class="marquee-item">
            {{ t }} <span class="marq-sep">·</span>
          </span>
        </div>
      </div>
      <div class="marquee-fade marquee-fade-r"></div>
    </div>


    <!-- ══════════════════════════════════════════
         FEATURES
    ══════════════════════════════════════════ -->
    <section id="features" class="features">
      <div class="section-inner">
        <div class="section-eyebrow">What you get</div>
        <h2 class="section-h2">Everything a trader needs</h2>
        <p class="section-sub">
          Six core features working together to give you a complete picture
          of your on-chain portfolio — in real time.
        </p>

        <div class="feature-grid">
          <div
            v-for="(f, i) in features"
            :key="f.title"
            class="feature-card"
            :style="{ '--card-glow': f.glow, '--card-color': f.color, 'animation-delay': i * 80 + 'ms' }"
          >
            <div class="feature-icon-wrap" :style="{ background: f.color + '14', color: f.color, boxShadow: '0 0 20px ' + f.color + '22' }">
              <i :class="['pi', f.icon]" style="font-size:1.15rem"></i>
            </div>
            <h3 class="feature-title">{{ f.title }}</h3>
            <p class="feature-desc">{{ f.desc }}</p>
            <div class="card-corner-glow"></div>
          </div>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════
         STATS
    ══════════════════════════════════════════ -->
    <section class="stats-section">
      <div class="stats-glow"></div>
      <div class="section-inner">
        <div class="stats-grid">
          <div v-for="(s, i) in stats" :key="i" class="stat-item" :style="{ 'animation-delay': i * 100 + 'ms' }">
            <div class="stat-number">{{ s.number }}</div>
            <div class="stat-label">{{ s.label }}</div>
            <div class="stat-detail">{{ s.detail }}</div>
          </div>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════
         HOW IT WORKS
    ══════════════════════════════════════════ -->
    <section id="how-it-works" class="how-section">
      <div class="section-inner">
        <div class="section-eyebrow">Simple by design</div>
        <h2 class="section-h2">Up and running in 30 seconds</h2>
        <p class="section-sub">No wallets to connect, no gas fees, no sign-up. Just paste and go.</p>

        <div class="steps-wrap">
          <!-- Connecting line -->
          <div class="steps-line" aria-hidden="true"></div>

          <div class="steps-grid">
            <div v-for="(step, i) in steps" :key="step.num" class="step-card" :style="{ 'animation-delay': i * 120 + 'ms' }">
              <div class="step-num-wrap">
                <div class="step-num">{{ step.num }}</div>
                <div class="step-num-ring"></div>
              </div>
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-desc">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════
         CTA
    ══════════════════════════════════════════ -->
    <section class="cta-section">
      <div class="cta-orb cta-orb-1"></div>
      <div class="cta-orb cta-orb-2"></div>
      <div class="cta-grid"></div>
      <div class="cta-inner">
        <div class="cta-badge">
          <span class="badge-dot"></span>
          Ready to track?
        </div>
        <h2 class="cta-h2">
          Start analysing your<br>
          <span class="cta-accent">portfolio right now.</span>
        </h2>
        <p class="cta-sub">
          Paste your Sepolia wallet address and get instant P&amp;L breakdowns,
          live prices, and a full verifiable trade history.
        </p>
        <RouterLink to="/dashboard" class="cta-btn">
          <span class="cta-btn-glow"></span>
          Launch Dashboard
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor"
                  stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </RouterLink>
        <p class="cta-footnote">No account · No gas fees · Sepolia only</p>
      </div>
    </section>


    <!-- ══════════════════════════════════════════
         FOOTER
    ══════════════════════════════════════════ -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 17L9 11L13 15L21 7" stroke="#00c9a0" stroke-width="2.4"
                  stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 7H21V11" stroke="#00c9a0" stroke-width="2.4"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="footer-logo-text">TZETRADE</span>
        </div>

        <div class="footer-links">
          <RouterLink to="/"          class="footer-link">Home</RouterLink>
          <RouterLink to="/dashboard" class="footer-link">Dashboard</RouterLink>
          <a href="#features"         class="footer-link">Features</a>
          <a href="#how-it-works"     class="footer-link">How it works</a>
        </div>

        <div class="footer-copy">
          © {{ new Date().getFullYear() }} TZETRADE · Sepolia Testnet · Built for learning
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ══════════════════════════════════════════════════════════════
   BASE
══════════════════════════════════════════════════════════════ */
.home-page {
  background:  #060a12;
  color:       #c8daf0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  overflow-x:  hidden;
}

/* ══════════════════════════════════════════════════════════════
   SHARED SECTION ELEMENTS
══════════════════════════════════════════════════════════════ */
.section-inner {
  max-width:  1200px;
  margin:     0 auto;
  text-align: center;
  padding:    0 28px;
}

.section-eyebrow {
  font-size:      0.68rem;
  font-weight:    800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color:          #00c9a0;
  margin-bottom:  14px;
}

.section-h2 {
  font-size:      2.5rem;
  font-weight:    900;
  letter-spacing: -0.03em;
  color:          #e8f4ff;
  margin:         0 0 16px;
  line-height:    1.15;
}

.section-sub {
  font-size:   1rem;
  line-height: 1.7;
  color:       #5a7a9a;
  max-width:   520px;
  margin:      0 auto 64px;
}

/* ══════════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════════ */
.hero {
  position:   relative;
  min-height: 100vh;
  display:    flex;
  align-items:center;
  padding:    120px 28px 80px;
  overflow:   hidden;
}

/* Layered background */
.hero-bg {
  position: absolute;
  inset:    0;
  pointer-events: none;
  z-index:  0;
}

.bg-grid {
  position:   absolute;
  inset:      0;
  background-image:
    linear-gradient(rgba(255,255,255,.024) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.024) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}

.bg-orb {
  position:      absolute;
  border-radius: 50%;
  filter:        blur(80px);
  opacity:       0.5;
}
.orb-1 {
  width:      600px;
  height:     600px;
  top:        -150px;
  left:       -100px;
  background: radial-gradient(circle, rgba(0,201,160,.18) 0%, transparent 65%);
  animation:  orb-drift 18s ease-in-out infinite;
}
.orb-2 {
  width:      500px;
  height:     500px;
  top:        10%;
  right:      -80px;
  background: radial-gradient(circle, rgba(129,140,248,.14) 0%, transparent 65%);
  animation:  orb-drift 22s ease-in-out infinite reverse;
}
.orb-3 {
  width:      400px;
  height:     400px;
  bottom:     -80px;
  left:       30%;
  background: radial-gradient(circle, rgba(0,201,160,.08) 0%, transparent 65%);
  animation:  orb-drift 26s ease-in-out infinite 4s;
}

@keyframes orb-drift {
  0%, 100% { transform: translate(0,   0)   scale(1);    }
  33%       { transform: translate(30px, -20px) scale(1.05); }
  66%       { transform: translate(-20px, 30px) scale(0.95); }
}

.hero-inner {
  position:  relative;
  z-index:   1;
  max-width: 1200px;
  margin:    0 auto;
  width:     100%;
  display:   grid;
  grid-template-columns: 1fr 1fr;
  gap:       72px;
  align-items: center;
}

/* ── Hero copy ── */
.hero-copy {
  animation: fade-up .8s cubic-bezier(.22,1,.36,1) both;
}

.hero-badge {
  display:        inline-flex;
  align-items:    center;
  gap:            8px;
  position:       relative;
  background:     rgba(0,201,160,.07);
  border:         1px solid rgba(0,201,160,.2);
  border-radius:  20px;
  padding:        5px 16px;
  font-size:      0.7rem;
  font-weight:    700;
  color:          #00c9a0;
  margin-bottom:  28px;
  overflow:       hidden;
  letter-spacing: 0.04em;
}
.badge-dot {
  width:         6px;
  height:        6px;
  border-radius: 50%;
  background:    #00c9a0;
  box-shadow:    0 0 8px #00c9a0;
  animation:     dot-pulse 2s ease-in-out infinite;
}
.badge-shimmer {
  position:   absolute;
  inset:      0;
  background: linear-gradient(105deg, transparent 40%, rgba(0,201,160,.15) 50%, transparent 60%);
  animation:  shimmer 3s ease-in-out infinite;
}
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.hero-h1 {
  font-size:      3.8rem;
  font-weight:    900;
  letter-spacing: -0.04em;
  line-height:    1.05;
  color:          #e8f4ff;
  margin:         0 0 22px;
}
.hero-accent {
  background:              linear-gradient(135deg, #00c9a0 0%, #7af9dc 50%, #00e5c4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip:         text;
  position:                relative;
  display:                 inline-block;
}

.hero-sub {
  font-size:   1.05rem;
  line-height: 1.7;
  color:       #4a6a8a;
  margin:      0 0 36px;
  max-width:   460px;
}

.hero-actions {
  display:      flex;
  align-items:  center;
  gap:          14px;
  margin-bottom:36px;
  flex-wrap:    wrap;
}

.btn-primary {
  display:         inline-flex;
  align-items:     center;
  gap:             9px;
  position:        relative;
  background:      linear-gradient(135deg, #00c9a0, #00af8d);
  color:           #060a12;
  font-size:       0.9rem;
  font-weight:     800;
  padding:         13px 26px;
  border-radius:   11px;
  text-decoration: none;
  letter-spacing:  0.02em;
  transition:      transform .15s, box-shadow .15s;
  overflow:        hidden;
}
.btn-primary::before {
  content:    '';
  position:   absolute;
  inset:      0;
  background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
  border-radius: inherit;
}
.btn-primary:hover {
  transform:  translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,201,160,.45), 0 0 0 1px rgba(0,201,160,.4);
}

.btn-ghost {
  display:         inline-flex;
  align-items:     center;
  gap:             8px;
  background:      rgba(255,255,255,.04);
  border:          1px solid rgba(255,255,255,.08);
  color:           #8ea8c8;
  font-size:       0.87rem;
  font-weight:     600;
  padding:         12px 22px;
  border-radius:   11px;
  text-decoration: none;
  transition:      border-color .15s, color .15s, background .15s;
}
.btn-ghost:hover {
  border-color: rgba(0,201,160,.3);
  color:        #00c9a0;
  background:   rgba(0,201,160,.05);
}

/* Token chips */
.token-chips {
  display:  flex;
  gap:      8px;
  flex-wrap:wrap;
}
.chip {
  display:       flex;
  align-items:   center;
  gap:           6px;
  background:    rgba(255,255,255,.04);
  border:        1px solid rgba(255,255,255,.07);
  border-radius: 20px;
  padding:       5px 12px;
  font-size:     0.72rem;
  font-weight:   700;
  color:         #7090b0;
  animation:     chip-float 4s ease-in-out infinite;
}
.chip-btc { animation-delay: .6s; }
.chip-sol { animation-delay: 1.2s; }
.chip-dot {
  width:         6px;
  height:        6px;
  border-radius: 50%;
}
.chip-val { color: #a0c0e0; }
.chip-up  { color: #22c55e; }

@keyframes chip-float {
  0%, 100% { transform: translateY(0);   }
  50%       { transform: translateY(-3px); }
}

/* ── Hero card ── */
.hero-card-wrap {
  position:  relative;
  animation: fade-up .8s .2s cubic-bezier(.22,1,.36,1) both;
}

.hero-card {
  background:    rgba(12, 18, 32, 0.85);
  border:        1px solid rgba(255,255,255,.07);
  border-radius: 20px;
  padding:       22px;
  box-shadow:    0 32px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(0,201,160,.04);
  backdrop-filter: blur(20px);
  position:      relative;
  overflow:      hidden;
  animation:     card-float 6s ease-in-out infinite;
}
@keyframes card-float {
  0%, 100% { transform: translateY(0);   }
  50%       { transform: translateY(-8px); }
}

.card-glow {
  position:   absolute;
  top:        -60px;
  left:       -60px;
  width:      240px;
  height:     240px;
  background: radial-gradient(circle, rgba(0,201,160,.1) 0%, transparent 65%);
  pointer-events: none;
}

.pv-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  margin-bottom:   16px;
}
.pv-live {
  display:        flex;
  align-items:    center;
  gap:            5px;
  font-size:      0.58rem;
  font-weight:    800;
  letter-spacing: 0.12em;
  color:          #22c55e;
  background:     rgba(34,197,94,.08);
  border:         1px solid rgba(34,197,94,.14);
  border-radius:  20px;
  padding:        3px 9px;
}
.pv-live-dot {
  width:         5px;
  height:        5px;
  border-radius: 50%;
  background:    #22c55e;
  box-shadow:    0 0 6px #22c55e;
  animation:     dot-pulse 2s ease-in-out infinite;
}
.pv-title   { font-size: 0.62rem; font-weight: 700; letter-spacing: .08em; color: #2e4060; }
.pv-network {
  font-size:   0.58rem;
  font-weight: 700;
  color:       #818cf8;
  background:  rgba(129,140,248,.08);
  border:      1px solid rgba(129,140,248,.14);
  border-radius: 20px;
  padding:     2px 8px;
}

.pv-total        { margin-bottom: 14px; }
.pv-total-label  { font-size: .56rem; font-weight: 800; letter-spacing: .1em; color: #1e3050; margin-bottom: 6px; }
.pv-total-val    { font-family: 'SF Mono',ui-monospace,monospace; font-size: 1.65rem; font-weight: 800; color: #d8eaff; letter-spacing: -.03em; line-height: 1; margin-bottom: 5px; }
.pv-total-pnl    { font-family: 'SF Mono',ui-monospace,monospace; font-size: .7rem; font-weight: 700; color: #22c55e; }

.pv-divider      { height: 1px; background: rgba(255,255,255,.04); margin: 12px 0; }
.pv-assets       { display: flex; flex-direction: column; gap: 10px; }

.pv-row {
  display:     grid;
  grid-template-columns: 8px 36px 50px 1fr auto 68px;
  align-items: center;
  gap:         8px;
}
.pv-dot   { width: 7px; height: 7px; border-radius: 50%; }
.pv-sym   { font-size: .7rem; font-weight: 800; color: #8ea8c8; letter-spacing: .04em; }
.pv-amt   { font-family: ui-monospace,monospace; font-size: .65rem; color: #2e4060; }
.pv-price { font-family: ui-monospace,monospace; font-size: .7rem; color: #8ea8c8; text-align: right; }
.pv-change { font-family: ui-monospace,monospace; font-size: .66rem; font-weight: 700; text-align: right; }
.pv-change.up   { color: #22c55e; }
.pv-bar-wrap { height: 3px; background: rgba(255,255,255,.04); border-radius: 3px; overflow: hidden; }
.pv-bar      { height: 100%; border-radius: 3px; opacity: .75; transition: width .5s ease; }

.pv-minichart { height: 44px; margin: 12px 0 16px; opacity: .8; }

.pv-cta {
  display:         flex;
  align-items:     center;
  justify-content: center;
  gap:             7px;
  background:      rgba(0,201,160,.08);
  border:          1px solid rgba(0,201,160,.18);
  border-radius:   9px;
  padding:         9px;
  font-size:       .7rem;
  font-weight:     700;
  color:           #00c9a0;
  text-decoration: none;
  transition:      background .15s, box-shadow .15s;
  letter-spacing:  .02em;
}
.pv-cta:hover { background: rgba(0,201,160,.14); box-shadow: 0 0 20px rgba(0,201,160,.1); }

/* Floating decorative badges */
.float-badge {
  position:      absolute;
  background:    rgba(12,18,32,.9);
  border:        1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  padding:       8px 12px;
  display:       flex;
  align-items:   center;
  gap:           7px;
  backdrop-filter: blur(12px);
  box-shadow:    0 8px 24px rgba(0,0,0,.4);
  font-size:     0.7rem;
  font-weight:   700;
}
.badge-pnl {
  top:   -16px;
  right: -20px;
  animation: badge-float-a 5s ease-in-out infinite;
}
.badge-tx {
  bottom: 40px;
  left:   -24px;
  animation: badge-float-b 6s ease-in-out infinite;
}
.fb-label { color: #3a5070; font-size: .62rem; letter-spacing: .06em; }
.fb-val.green { color: #22c55e; font-size: .82rem; }
.fb-icon { font-size: .9rem; }

@keyframes badge-float-a { 0%,100% { transform: translateY(0);    } 50% { transform: translateY(-6px);  } }
@keyframes badge-float-b { 0%,100% { transform: translateY(0);    } 50% { transform: translateY(-5px);  } }


/* ══════════════════════════════════════════════════════════════
   MARQUEE
══════════════════════════════════════════════════════════════ */
.marquee-wrap {
  position:   relative;
  background: rgba(255,255,255,.02);
  border-top:    1px solid rgba(255,255,255,.04);
  border-bottom: 1px solid rgba(255,255,255,.04);
  overflow:   hidden;
  padding:    14px 0;
}
.marquee-track {
  display:   flex;
  width:     max-content;
  animation: marquee 28s linear infinite;
}
.marquee-inner { display: flex; gap: 0; white-space: nowrap; }
.marquee-item {
  font-size:      0.72rem;
  font-weight:    600;
  letter-spacing: 0.06em;
  color:          #2e4060;
  padding:        0 8px;
}
.marq-sep { color: #0f1a28; margin-left: 8px; }
.marquee-fade {
  position:  absolute;
  top: 0; bottom: 0;
  width:     80px;
  z-index:   2;
  pointer-events: none;
}
.marquee-fade-l { left:  0; background: linear-gradient(to right, #060a12, transparent); }
.marquee-fade-r { right: 0; background: linear-gradient(to left,  #060a12, transparent); }

@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }


/* ══════════════════════════════════════════════════════════════
   FEATURES
══════════════════════════════════════════════════════════════ */
.features {
  padding:    110px 0;
  background: #060a12;
  position:   relative;
}
.features::before {
  content:    '';
  position:   absolute;
  top:        0; left: 50%;
  transform:  translateX(-50%);
  width:      800px;
  height:     1px;
  background: linear-gradient(to right, transparent, rgba(0,201,160,.2), transparent);
}

.feature-grid {
  display:               grid;
  grid-template-columns: repeat(3, 1fr);
  gap:                   16px;
  text-align:            left;
}

.feature-card {
  position:      relative;
  background:    rgba(10, 16, 28, 0.7);
  border:        1px solid rgba(255,255,255,.055);
  border-radius: 16px;
  padding:       28px;
  overflow:      hidden;
  transition:    border-color .2s, box-shadow .2s, transform .2s;
  animation:     fade-up .6s cubic-bezier(.22,1,.36,1) both;
}
.feature-card:hover {
  border-color: var(--card-color, #00c9a0);
  box-shadow:   0 0 40px var(--card-glow), 0 8px 24px rgba(0,0,0,.3);
  transform:    translateY(-3px);
}
.feature-card:hover .card-corner-glow { opacity: 1; }

.card-corner-glow {
  position:   absolute;
  top:        -30px;
  right:      -30px;
  width:      120px;
  height:     120px;
  background: radial-gradient(circle, var(--card-glow, rgba(0,201,160,.15)) 0%, transparent 65%);
  opacity:    0;
  transition: opacity .3s;
  pointer-events: none;
}

.feature-icon-wrap {
  width:         46px;
  height:        46px;
  border-radius: 12px;
  display:       flex;
  align-items:   center;
  justify-content: center;
  margin-bottom: 18px;
  transition:    box-shadow .2s;
}
.feature-card:hover .feature-icon-wrap { box-shadow: 0 0 24px var(--card-glow, rgba(0,201,160,.2)) !important; }

.feature-title {
  font-size:   0.95rem;
  font-weight: 700;
  color:       #c8daf0;
  margin:      0 0 9px;
}
.feature-desc {
  font-size:   0.85rem;
  line-height: 1.65;
  color:       #3a5a78;
  margin:      0;
}


/* ══════════════════════════════════════════════════════════════
   STATS
══════════════════════════════════════════════════════════════ */
.stats-section {
  position:   relative;
  padding:    90px 0;
  background: #08101c;
  overflow:   hidden;
}
.stats-glow {
  position:   absolute;
  top:        50%; left: 50%;
  transform:  translate(-50%, -50%);
  width:      600px;
  height:     300px;
  background: radial-gradient(ellipse, rgba(0,201,160,.06) 0%, transparent 65%);
  pointer-events: none;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.stat-item {
  text-align:   center;
  padding:      36px 24px;
  border-right: 1px solid rgba(255,255,255,.04);
  animation:    fade-up .6s cubic-bezier(.22,1,.36,1) both;
}
.stat-item:last-child { border-right: none; }

.stat-number {
  font-family:   'SF Mono', ui-monospace, monospace;
  font-size:     2.8rem;
  font-weight:   800;
  background:    linear-gradient(135deg, #00c9a0, #7af9dc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.04em;
  line-height:   1;
  margin-bottom: 12px;
  text-shadow:   none;
}
.stat-label  { font-size: .88rem; font-weight: 700; color: #8ea8c8; margin-bottom: 6px; }
.stat-detail { font-size: .7rem; color: #1e3050; }


/* ══════════════════════════════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════════════════════════════ */
.how-section {
  padding:    110px 0;
  background: #060a12;
  position:   relative;
}
.how-section::before {
  content:    '';
  position:   absolute;
  top:        0; left: 50%;
  transform:  translateX(-50%);
  width:      600px;
  height:     1px;
  background: linear-gradient(to right, transparent, rgba(255,255,255,.06), transparent);
}

.steps-wrap { position: relative; }

.steps-line {
  display:    none; /* shown on desktop via media query logic below */
  position:   absolute;
  top:        40px;
  left:       calc(33.33% / 2);
  right:      calc(33.33% / 2);
  height:     1px;
  background: linear-gradient(to right, rgba(0,201,160,.3), rgba(0,201,160,.1), rgba(0,201,160,.3));
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap:     24px;
}

.step-card {
  background:    rgba(10, 16, 28, 0.7);
  border:        1px solid rgba(255,255,255,.055);
  border-radius: 16px;
  padding:       32px 28px;
  text-align:    left;
  position:      relative;
  transition:    border-color .2s, box-shadow .2s;
  animation:     fade-up .6s cubic-bezier(.22,1,.36,1) both;
}
.step-card:hover {
  border-color: rgba(0,201,160,.25);
  box-shadow:   0 0 32px rgba(0,201,160,.08);
}

.step-num-wrap {
  position:      relative;
  width:         48px;
  height:        48px;
  margin-bottom: 20px;
}
.step-num {
  font-family:   'SF Mono', ui-monospace, monospace;
  font-size:     1.1rem;
  font-weight:   900;
  background:    linear-gradient(135deg, #00c9a0, #7af9dc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height:   48px;
  text-align:    center;
  position:      relative;
  z-index:       1;
}
.step-num-ring {
  position:      absolute;
  inset:         0;
  border-radius: 50%;
  border:        1px solid rgba(0,201,160,.2);
  background:    rgba(0,201,160,.05);
}
.step-card:hover .step-num-ring {
  border-color: rgba(0,201,160,.4);
  background:   rgba(0,201,160,.08);
  box-shadow:   0 0 16px rgba(0,201,160,.1);
}

.step-title { font-size: 1rem; font-weight: 700; color: #c8daf0; margin: 0 0 10px; }
.step-desc  { font-size: .85rem; line-height: 1.65; color: #3a5a78; margin: 0; }


/* ══════════════════════════════════════════════════════════════
   CTA
══════════════════════════════════════════════════════════════ */
.cta-section {
  position:   relative;
  padding:    120px 28px;
  overflow:   hidden;
  background: #08101c;
}

.cta-orb {
  position:      absolute;
  border-radius: 50%;
  filter:        blur(90px);
  pointer-events:none;
}
.cta-orb-1 {
  width:      500px;
  height:     500px;
  top:        -100px;
  left:       50%;
  transform:  translateX(-50%);
  background: radial-gradient(circle, rgba(0,201,160,.12) 0%, transparent 65%);
  animation:  orb-drift 16s ease-in-out infinite;
}
.cta-orb-2 {
  width:      300px;
  height:     300px;
  bottom:     -60px;
  right:      10%;
  background: radial-gradient(circle, rgba(129,140,248,.1) 0%, transparent 65%);
  animation:  orb-drift 20s ease-in-out infinite reverse;
}
.cta-grid {
  position:   absolute;
  inset:      0;
  background-image:
    linear-gradient(rgba(255,255,255,.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.015) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent);
}

.cta-inner {
  position:   relative;
  max-width:  700px;
  margin:     0 auto;
  text-align: center;
  z-index:    1;
  animation:  fade-up .7s cubic-bezier(.22,1,.36,1) both;
}

.cta-badge {
  display:        inline-flex;
  align-items:    center;
  gap:            8px;
  background:     rgba(0,201,160,.07);
  border:         1px solid rgba(0,201,160,.18);
  border-radius:  20px;
  padding:        5px 16px;
  font-size:      .7rem;
  font-weight:    700;
  letter-spacing: .06em;
  color:          #00c9a0;
  margin-bottom:  22px;
}

.cta-h2 {
  font-size:      3rem;
  font-weight:    900;
  letter-spacing: -0.04em;
  color:          #e8f4ff;
  line-height:    1.1;
  margin:         0 0 18px;
}
.cta-accent {
  background:              linear-gradient(135deg, #00c9a0, #7af9dc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip:         text;
}

.cta-sub {
  font-size:   1rem;
  line-height: 1.7;
  color:       #3a5a78;
  margin:      0 0 40px;
}

.cta-btn {
  display:         inline-flex;
  align-items:     center;
  gap:             10px;
  position:        relative;
  background:      linear-gradient(135deg, #00c9a0, #00af8d);
  color:           #060a12;
  font-size:       1rem;
  font-weight:     800;
  padding:         16px 38px;
  border-radius:   13px;
  text-decoration: none;
  letter-spacing:  0.02em;
  transition:      transform .15s, box-shadow .15s;
  overflow:        hidden;
}
.cta-btn-glow {
  position:   absolute;
  inset:      0;
  background: linear-gradient(135deg, rgba(255,255,255,.18), transparent 60%);
}
.cta-btn:hover {
  transform:  translateY(-2px);
  box-shadow: 0 12px 48px rgba(0,201,160,.5), 0 0 0 1px rgba(0,201,160,.4);
}

.cta-footnote {
  font-size:      .7rem;
  color:          #1e3050;
  margin:         20px 0 0;
  letter-spacing: .06em;
}


/* ══════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════ */
.footer {
  background:  #060a12;
  border-top:  1px solid rgba(255,255,255,.04);
  padding:     32px 28px;
}
.footer-inner {
  max-width:       1200px;
  margin:          0 auto;
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  gap:             24px;
  flex-wrap:       wrap;
}
.footer-brand {
  display:     flex;
  align-items: center;
  gap:         8px;
}
.footer-logo-text {
  font-size:      .85rem;
  font-weight:    900;
  letter-spacing: .16em;
  background:     linear-gradient(90deg, #00c9a0, #7af9dc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.footer-links { display: flex; gap: 2px; flex-wrap: wrap; }
.footer-link {
  color:           #1e3050;
  font-size:       .78rem;
  font-weight:     500;
  padding:         6px 12px;
  border-radius:   6px;
  text-decoration: none;
  transition:      color .15s, background .15s;
}
.footer-link:hover { color: #8ea8c8; background: rgba(255,255,255,.03); }
.footer-copy { font-size: .7rem; color: #0f1c2e; }


/* ══════════════════════════════════════════════════════════════
   SHARED ANIMATIONS
══════════════════════════════════════════════════════════════ */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0);    }
}

@keyframes dot-pulse {
  0%, 100% { opacity: 1;   box-shadow: 0 0 6px currentColor;  }
  50%       { opacity: .5;  box-shadow: 0 0 12px currentColor; }
}


/* ══════════════════════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════════════════════ */
@media (min-width: 1025px) {
  .steps-line { display: block; }
}

@media (max-width: 1024px) {
  .hero-inner    { grid-template-columns: 1fr; gap: 56px; }
  .hero-h1       { font-size: 3rem; }
  .hero-card-wrap{ max-width: 480px; margin: 0 auto; width: 100%; }
  .feature-grid  { grid-template-columns: repeat(2, 1fr); }
  .stats-grid    { grid-template-columns: repeat(2, 1fr); }
  .stat-item     { border-right: none; border-bottom: 1px solid rgba(255,255,255,.04); }
  .stat-item:nth-child(odd) { border-right: 1px solid rgba(255,255,255,.04); }
  .stat-item:last-child, .stat-item:nth-last-child(2) { border-bottom: none; }
  .steps-grid    { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
}

@media (max-width: 640px) {
  .hero        { padding: 110px 20px 64px; min-height: auto; }
  .hero-h1     { font-size: 2.4rem; }
  .cta-h2      { font-size: 2.1rem; }
  .section-h2  { font-size: 2rem; }
  .feature-grid{ grid-template-columns: 1fr; }
  .stats-grid  { grid-template-columns: 1fr; }
  .stat-item   { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,.04) !important; }
  .footer-inner{ flex-direction: column; align-items: flex-start; gap: 16px; }
}
</style>
