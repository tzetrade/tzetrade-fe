<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route    = useRoute()
const scrolled = ref(false)
const menuOpen = ref(false)

function onScroll() { scrolled.value = window.scrollY > 32 }

onMounted(()  => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <nav class="navbar" :class="{ scrolled }">
    <div class="nav-inner">

      <!-- Logo -->
      <RouterLink to="/" class="nav-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3 17L9 11L13 15L21 7" stroke="#00c9a0" stroke-width="2.4"
                stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17 7H21V11" stroke="#00c9a0" stroke-width="2.4"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="logo-text">TZETRADE</span>
      </RouterLink>

      <!-- Desktop links -->
      <div class="nav-links">
        <a href="#features"     class="nav-link">Features</a>
        <a href="#how-it-works" class="nav-link">How it works</a>
        <RouterLink to="/dashboard" class="nav-link"
          :class="{ active: route.path === '/dashboard' }">Dashboard</RouterLink>
      </div>

      <!-- Desktop CTA -->
      <RouterLink to="/dashboard" class="nav-cta">
        Launch App
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor"
                stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </RouterLink>

      <!-- Mobile hamburger -->
      <button class="hamburger" @click="menuOpen = !menuOpen" aria-label="menu">
        <span :class="{ open: menuOpen }"></span>
        <span :class="{ open: menuOpen }"></span>
        <span :class="{ open: menuOpen }"></span>
      </button>
    </div>

    <!-- Mobile menu -->
    <div class="mobile-menu" :class="{ open: menuOpen }">
      <a href="#features"     class="mob-link" @click="menuOpen = false">Features</a>
      <a href="#how-it-works" class="mob-link" @click="menuOpen = false">How it works</a>
      <RouterLink to="/dashboard" class="mob-link" @click="menuOpen = false">Dashboard</RouterLink>
      <RouterLink to="/dashboard" class="mob-cta"  @click="menuOpen = false">Launch App →</RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position:        fixed;
  top: 0; left: 0; right: 0;
  z-index:         500;
  background:      transparent;
  border-bottom:   1px solid transparent;
  transition:      background .25s, border-color .25s, box-shadow .25s;
}
.navbar.scrolled {
  background:    rgba(6, 10, 18, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom-color: rgba(255,255,255,.05);
  box-shadow: 0 1px 40px rgba(0,0,0,.6);
}

.nav-inner {
  max-width:   1200px;
  margin:      0 auto;
  padding:     0 28px;
  height:      64px;
  display:     flex;
  align-items: center;
  gap:         32px;
}

/* Logo */
.nav-logo {
  display:         flex;
  align-items:     center;
  gap:             9px;
  text-decoration: none;
  flex-shrink:     0;
}
.logo-text {
  font-size:      0.88rem;
  font-weight:    900;
  letter-spacing: 0.16em;
  background:     linear-gradient(90deg, #00c9a0, #7af9dc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Links */
.nav-links {
  display:     flex;
  align-items: center;
  gap:         2px;
  flex:        1;
}
.nav-link {
  color:           rgba(180, 200, 230, 0.6);
  font-size:       0.83rem;
  font-weight:     500;
  padding:         6px 13px;
  border-radius:   8px;
  text-decoration: none;
  transition:      color .15s, background .15s;
}
.nav-link:hover,
.nav-link.active {
  color:      #e2e8f0;
  background: rgba(255,255,255,.05);
}

/* CTA */
.nav-cta {
  display:         flex;
  align-items:     center;
  gap:             7px;
  margin-left:     auto;
  background:      rgba(0,201,160,.12);
  border:          1px solid rgba(0,201,160,.3);
  color:           #00c9a0;
  font-size:       0.8rem;
  font-weight:     700;
  letter-spacing:  0.04em;
  padding:         8px 18px;
  border-radius:   9px;
  text-decoration: none;
  white-space:     nowrap;
  flex-shrink:     0;
  transition:      background .15s, box-shadow .15s, border-color .15s;
}
.nav-cta:hover {
  background:  rgba(0,201,160,.2);
  border-color:rgba(0,201,160,.6);
  box-shadow:  0 0 20px rgba(0,201,160,.2);
}

/* Hamburger */
.hamburger {
  display:     none;
  flex-direction: column;
  gap:         5px;
  background:  none;
  border:      none;
  cursor:      pointer;
  padding:     4px;
  margin-left: auto;
}
.hamburger span {
  display:       block;
  width:         22px;
  height:        2px;
  background:    rgba(180,200,230,.7);
  border-radius: 2px;
  transition:    transform .2s, opacity .2s;
}
.hamburger span.open:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger span.open:nth-child(2) { opacity: 0; }
.hamburger span.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Mobile menu */
.mobile-menu {
  display:        none;
  flex-direction: column;
  padding:        12px 20px 20px;
  border-top:     1px solid rgba(255,255,255,.06);
  gap:            4px;
  background:     rgba(6,10,18,.97);
  backdrop-filter: blur(20px);
}
.mobile-menu.open { display: flex; }
.mob-link {
  color:           rgba(180,200,230,.7);
  font-size:       0.9rem;
  font-weight:     500;
  padding:         10px 12px;
  border-radius:   8px;
  text-decoration: none;
  transition:      background .15s, color .15s;
}
.mob-link:hover { background: rgba(255,255,255,.05); color: #e2e8f0; }
.mob-cta {
  margin-top:      8px;
  background:      rgba(0,201,160,.12);
  border:          1px solid rgba(0,201,160,.3);
  color:           #00c9a0;
  font-size:       0.88rem;
  font-weight:     700;
  padding:         12px 20px;
  border-radius:   8px;
  text-decoration: none;
  text-align:      center;
}

@media (max-width: 700px) {
  .nav-links, .nav-cta { display: none; }
  .hamburger            { display: flex; }
}
</style>
