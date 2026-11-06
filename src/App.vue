<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useStore } from 'vuex'
import type { RootState } from './store'

const store = useStore<RootState>()
const syncNeedsAttention = computed(() => store.state.user.persistenceMode === 'local' || store.state.user.status === 'error')
const syncBusy = computed(() => store.state.user.status === 'loading')
const syncMessage = computed(() => store.state.user.syncError)
const cloudConnected = computed(() => store.state.user.persistenceMode === 'cloud' && store.state.user.status === 'ready')
const syncTitle = computed(() => store.state.user.persistenceMode === 'local'
  ? 'Data tersimpan di perangkat ini.'
  : 'Data belum berhasil dimuat.')

function retrySync() {
  store.dispatch('user/sync').catch(() => undefined)
}

function retryWhenOnline() {
  if (store.state.user.persistenceMode === 'local') retrySync()
}

onMounted(() => {
  store.dispatch('user/load').catch(() => undefined)
  window.addEventListener('online', retryWhenOnline)
})

onBeforeUnmount(() => window.removeEventListener('online', retryWhenOnline))

const navLinks = [
  { to: '/', label: 'Beranda', icon: 'home' },
  { to: '/program', label: 'Program', icon: 'program' },
  { to: '/explore', label: 'Explore', icon: 'search' },
  { to: '/about', label: 'Tentang', icon: 'info' },
] as const
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <div class="container header-inner">
        <RouterLink to="/" class="brand">
          <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M25.5 6.5c-8.3 0-15 2.9-17 8.6-1.6 4.7 1.6 9.2 6.2 9.2 6.6 0 10.8-7.5 10.8-17.8Z" />
            <path d="M8.8 23.8c3.4-4.9 7.3-8.4 12.4-11.2" />
          </svg>
          <span>BeratSehat</span>
        </RouterLink>
        <nav class="site-nav desktop-nav" aria-label="Navigasi utama">
          <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-link">
            {{ link.label }}
          </RouterLink>
        </nav>
        <span v-if="cloudConnected" class="sync-chip" role="status"><i aria-hidden="true"></i>Tersimpan di Firebase</span>
      </div>
    </header>

    <aside v-if="syncNeedsAttention" class="sync-status" role="status">
      <div class="container sync-status-inner">
        <span class="sync-status-mark" aria-hidden="true">i</span>
        <p><strong>{{ syncTitle }}</strong> {{ syncMessage || 'Belum tersinkron ke perangkat lain.' }}</p>
        <button type="button" class="sync-retry" :disabled="syncBusy" @click="retrySync">
          {{ syncBusy ? 'Menyinkronkan...' : 'Coba sinkronkan' }}
        </button>
      </div>
    </aside>

    <main class="app-main">
      <RouterView />
    </main>

    <footer class="site-footer">
      <div class="container">
        <p class="footer-brand">BeratSehat</p>
        <p class="muted footer-note">
          BeratSehat adalah aplikasi edukasi dan perencana kebiasaan. Hasilnya berupa estimasi dan bukan pengganti diagnosis
          atau perawatan medis dari dokter maupun ahli gizi.
        </p>
      </div>
    </footer>

    <nav class="bottom-nav" aria-label="Navigasi bawah">
      <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="bottom-link">
        <svg v-if="link.icon === 'home'" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />
        </svg>
        <svg v-else-if="link.icon === 'search'" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4.2-4.2" />
        </svg>
        <svg v-else-if="link.icon === 'program'" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="5" width="16" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h6" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
        <span>{{ link.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px) saturate(140%);
  border-bottom: 1px solid var(--neutral-200);
}

.sync-status { border-bottom: 1px solid #e8dfc7; background: #fffcf4; color: #705c32; }
.sync-status-inner { display: flex; min-height: 48px; align-items: center; gap: 10px; padding-top: 6px; padding-bottom: 6px; }
.sync-status-mark { display: grid; flex: 0 0 20px; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: #f0e5c7; font-size: 12px; font-weight: 700; }
.sync-status-inner p { flex: 1; margin: 0; font-size: 12px; }
.sync-status-inner strong { color: #4e4127; }
.sync-retry { flex: 0 0 auto; min-height: 36px; border: 1px solid #d5c9a9; border-radius: 8px; padding: 0 12px; background: white; color: #66542e; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.sync-retry:hover { background: #f7f0dd; }
.sync-retry:disabled { opacity: .6; cursor: wait; }

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 72px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 19px;
  font-weight: 700;
  color: var(--primary-700);
}

.brand-mark {
  width: 30px;
  height: 30px;
  fill: var(--primary-600);
  stroke: var(--neutral-0);
  stroke-width: 1.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.site-nav {
  display: flex;
  gap: 4px;
}

.sync-chip { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 7px; color: var(--success-700); font-size: 12px; font-weight: 700; }
.sync-chip i { width: 8px; height: 8px; border-radius: 50%; background: var(--success-700); box-shadow: 0 0 0 3px var(--success-50); }

.nav-link {
  padding: 10px 14px;
  border-radius: 12px;
  color: var(--neutral-700);
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-link:hover {
  background: var(--primary-50);
  color: var(--primary-700);
}

.nav-link.router-link-active {
  background: var(--primary-100);
  color: var(--primary-700);
}

.bottom-nav {
  display: none;
}

.site-footer {
  border-top: 1px solid var(--neutral-200);
  background: var(--neutral-0);
  padding: 36px 0;
  margin-top: 48px;
}

.footer-brand {
  font-weight: 700;
  color: var(--primary-700);
  margin-bottom: 8px;
}

.footer-note {
  font-size: 14px;
  max-width: 720px;
  margin-bottom: 0;
}

@media (max-width: 767px) {
  .desktop-nav {
    display: none;
  }

  .app-main {
    padding-bottom: 88px;
  }

  .site-footer {
    margin-top: 48px;
    padding-bottom: 108px;
  }

  .bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(12px);
    border-top: 1px solid var(--neutral-200);
    box-shadow: 0 -6px 24px rgba(17, 24, 39, 0.08);
    padding-bottom: env(safe-area-inset-bottom);
  }

  .bottom-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 68px;
    font-size: 12px;
    font-weight: 600;
    color: var(--neutral-500);
    transition: color 0.2s ease;
  }

  .bottom-link svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .bottom-link.router-link-active {
    color: var(--primary-700);
  }

  .sync-status-inner { flex-wrap: wrap; gap: 7px 9px; padding: 8px 20px; }
  .sync-status-inner p { flex-basis: calc(100% - 30px); }
  .sync-retry { margin-left: 29px; }
}
</style>
