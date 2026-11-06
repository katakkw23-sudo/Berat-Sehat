<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import CalorieCalculator from '../components/calculator/CalorieCalculator.vue'
import BmiCalculator from '../components/calculator/BmiCalculator.vue'
import ProgramPaths from '../components/home/ProgramPaths.vue'
import RecommendedPrograms from '../components/home/RecommendedPrograms.vue'
import TaskChecklist from '../components/home/TaskChecklist.vue'
import WeightTracker from '../components/home/WeightTracker.vue'
import ProfilePreferences from '../components/home/ProfilePreferences.vue'
import ProgressInsights from '../components/home/ProgressInsights.vue'
import AccountAccess from '../components/home/AccountAccess.vue'
import type { RootState } from '../store'

const store = useStore<RootState>()
const profile = computed(() => store.state.user.profile)
const loadFailed = computed(() => store.state.user.status === 'error')
const localStorageMode = computed(() => store.state.user.persistenceMode === 'local')
const anonymousAccount = computed(() => store.state.user.anonymousAccount)

const benefits = [
  { icon: 'estimate', title: 'Estimasi yang jelas', text: 'Lihat kebutuhan energi harian dan target kalori yang dihitung dari data tubuh kamu.' },
  { icon: 'meal', title: 'Menu dari bahan lokal', text: 'Contoh makan dari tempe, telur, sayur, dan nasi yang mudah ditemukan dan terjangkau.' },
  { icon: 'progress', title: 'Progres yang bisa dipantau', text: 'Catat checklist harian dan berat badan untuk melihat tren, bukan hanya satu angka.' },
]

</script>

<template>
  <div>
    <section class="hero">
      <img
        class="hero-image"
        src="https://images.pexels.com/photos/8032970/pexels-photo-8032970.jpeg?auto=compress&cs=tinysrgb&w=1800"
        alt=""
        aria-hidden="true"
        fetchpriority="high"
        decoding="async"
      />
      <div class="container hero-inner">
        <span class="eyebrow">Kebiasaan sehat untuk keseharianmu</span>
        <h1>Sehat itu perjalanan, bukan lomba.</h1>
        <p class="hero-text">
          Atur makan dan gerak dengan menu lokal, latihan pemula, serta langkah yang terasa realistis. Rekomendasi kalori
          personal tersedia untuk usia 18 tahun ke atas.
        </p>
        <div class="hero-actions">
          <RouterLink to="/program" class="btn btn-primary">Mulai program</RouterLink>
          <a href="#kalkulator" class="btn btn-hero-outline">Hitung kebutuhan kalori</a>
        </div>
        <div class="hero-points" aria-label="Fitur BeratSehat">
          <span><strong>10</strong> menu harian</span>
          <span><strong>10</strong> latihan pemula</span>
          <span><strong>1</strong> langkah hari ini</span>
        </div>
      </div>
    </section>

    <section class="section goals-section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Pilih tujuan</span>
          <h2>Pilih arah sehatmu</h2>
          <p>Mulai dengan target turun atau naik berat badan.</p>
        </div>
        <ProgramPaths />
      </div>
    </section>

    <section v-if="localStorageMode || anonymousAccount === true" class="account-section">
      <div class="container"><AccountAccess /></div>
    </section>

    <section v-if="profile" class="section dashboard-section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Ruang pribadi</span>
          <h2>Program kamu</h2>
          <p>Ringkasan target, kebiasaan harian, dan perkembangan berat badanmu.</p>
        </div>
        <RecommendedPrograms :profile="profile" />
      </div>
    </section>

    <section v-if="profile" class="section section-muted progress-section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Kebiasaan dan tren</span>
          <h2>Progres yang terasa nyata</h2>
          <p>Checklist membantu menjaga rutinitas. Catatan berat memperlihatkan tren dari waktu ke waktu.</p>
        </div>
        <div v-if="loadFailed" class="alert alert-error" role="alert">
          Data progres belum bisa dimuat. Periksa koneksi internet atau konfigurasi Firebase, lalu muat ulang halaman.
        </div>
        <div v-else class="grid grid-2">
          <TaskChecklist />
          <WeightTracker />
        </div>
        <div v-if="!loadFailed" class="insights-wrap">
          <ProgressInsights />
        </div>
      </div>
    </section>

    <section id="kalkulator" class="section tools-section">
      <div class="container">
        <div class="section-head tools-head">
          <span class="eyebrow">Alat bantu</span>
          <h2>Kenali kebutuhan tubuhmu</h2>
          <p>Gunakan estimasi ini sebagai panduan awal. Angka bukan diagnosis dan bisa berbeda pada tiap orang.</p>
        </div>
        <div class="tools-grid">
          <section class="tool-panel">
            <div class="tool-title"><span class="tool-index">01</span><div><h3>Indeks massa tubuh</h3><p class="muted">Skrining BMI dan rentang berat sehat.</p></div></div>
            <BmiCalculator />
          </section>
          <section class="tool-panel">
            <div class="tool-title"><span class="tool-index">02</span><div><h3>Estimasi kalori harian</h3><p class="muted">BMR, TDEE, dan target sesuai profil.</p></div></div>
            <CalorieCalculator />
            <details class="preferences-details">
              <summary>Sesuaikan pilihan bahan makanan</summary>
              <div class="preferences-body"><ProfilePreferences /></div>
            </details>
          </section>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">BeratSehat</span>
          <h2>Langkah sehat yang mudah dipahami</h2>
        </div>
        <div class="grid grid-3">
          <article v-for="benefit in benefits" :key="benefit.title" class="card benefit">
            <span class="benefit-icon" aria-hidden="true">
              <svg v-if="benefit.icon === 'estimate'" viewBox="0 0 24 24">
                <path d="M4 19h16M7 16V9m5 7V5m5 11v-4" />
              </svg>
              <svg v-else-if="benefit.icon === 'meal'" viewBox="0 0 24 24">
                <path d="M4 12a8 8 0 0 0 16 0H4Zm2-3a6 6 0 0 1 12 0M12 3v2" />
              </svg>
              <svg v-else viewBox="0 0 24 24">
                <path d="M4 17 9 12l3 3 8-8M14 7h6v6" />
              </svg>
            </span>
            <h3>{{ benefit.title }}</h3>
            <p class="muted">{{ benefit.text }}</p>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  min-height: 400px;
  overflow: hidden;
  background: #183b2c;
}

.hero::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  content: '';
  background: rgba(14, 35, 25, 0.56);
}

.hero-image {
  position: absolute;
  z-index: -2;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 38%;
}

.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  max-width: 1200px;
  padding-top: 30px;
  padding-bottom: 30px;
  color: var(--neutral-0);
}

.hero-inner > * {
  max-width: 700px;
}

.hero-inner .eyebrow {
  color: #f2f7ed;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.24);
}

.hero-inner h1 {
  max-width: 680px;
  margin: 0;
  font-size: 46px;
  line-height: 1.06;
}

.hero-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.86);
  margin: 0;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 2px;
}

.btn-hero-outline {
  color: var(--neutral-0);
  border-color: rgba(255, 255, 255, 0.66);
  background: rgba(255, 255, 255, 0.08);
}

.btn-hero-outline:hover {
  color: var(--neutral-900);
  background: var(--neutral-0);
}

.hero-points {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.hero-points strong {
  color: var(--neutral-0);
  font-size: 17px;
}

.benefit {
  min-height: 196px;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.benefit:hover {
  transform: translateY(-4px);
  border-color: var(--primary-100);
  box-shadow: 0 14px 30px rgba(27, 48, 32, 0.1);
}

.benefit-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-bottom: 20px;
  border-radius: 12px;
  background: var(--primary-50);
  color: var(--primary-700);
}

.benefit-icon svg {
  width: 23px;
  height: 23px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.benefit h3 {
  font-size: 18px;
}

.goals-section .section-head {
  max-width: 720px;
}

.goals-section { padding-top: 48px; }

.setup-state {
  padding-top: 10px;
}

.cloud-note {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 10px 13px;
  border: 1px solid #e8dfc7;
  border-radius: 12px;
  background: #fffcf4;
  color: #705c32;
  font-size: 13px;
}

.cloud-copy { display: grid; flex: 1; gap: 2px; min-width: 0; }
.cloud-copy strong { color: var(--neutral-900); font-size: 13px; }
.sync-button { flex: 0 0 auto; min-height: 38px; padding: 0 12px; border: 1px solid #d5c9a9; border-radius: 8px; background: white; color: #66542e; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.sync-button:hover { background: #f7f0dd; }
.sync-button:disabled { opacity: .6; cursor: wait; }
.account-section { padding-top: 12px; }
.cloud-mark { display: grid; flex: 0 0 19px; place-items: center; width: 19px; height: 19px; border-radius: 50%; background: #f0e5c7; font-size: 12px; font-weight: 700; }

.tools-section {
  background: #f0f4ef;
}

.tools-head {
  max-width: 740px;
}

.tools-head .eyebrow {
  margin-bottom: 12px;
}

.tools-grid {
  display: grid;
  gap: 28px;
}

.tool-panel {
  min-width: 0;
}

.tool-title {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.tool-index {
  display: grid;
  flex: 0 0 38px;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: var(--primary-100);
  color: var(--primary-700);
  font-size: 13px;
  font-weight: 700;
}

.tool-title h3 {
  margin: 0 0 4px;
  font-size: 19px;
}

.tool-title p {
  margin: 0;
  font-size: 13px;
}

.preferences-details {
  margin-top: 16px;
  padding: 14px 0 0;
  border-top: 1px solid var(--neutral-200);
}

.preferences-details summary {
  color: var(--primary-700);
  font-weight: 700;
  cursor: pointer;
}

.preferences-body {
  padding-top: 14px;
}

.benefit p {
  margin: 0;
}

.setup-state p {
  margin-bottom: 0;
}

@media (min-width: 1120px) {
  .tools-grid {
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
    align-items: start;
    gap: 24px;
  }
}

@media (max-width: 700px) {
  .hero {
    min-height: 370px;
  }

  .hero-image {
    object-position: 61% center;
  }

  .hero-inner {
    gap: 9px;
    padding-top: 22px;
    padding-bottom: 22px;
  }

  .hero-inner h1 {
    font-size: 32px;
  }

  .hero-text {
    font-size: 14px;
  }

  .hero-points {
    display: none;
  }
}

@media (max-width: 420px) {
  .hero-actions {
    align-items: stretch;
    flex-direction: column;
    width: 100%;
  }

  .hero-actions .btn {
    width: 100%;
  }

  .hero-inner h1 { font-size: 30px; }
  .goals-section { padding-top: 24px; }
  .goals-section .section-head h2 { font-size: 23px; }
  .goals-section .section-head p { font-size: 13px; }

  .tool-title {
    gap: 10px;
  }

  .cloud-note { align-items: flex-start; flex-wrap: wrap; }
  .cloud-copy { flex-basis: calc(100% - 34px); }
  .sync-button { margin-left: 29px; }

  .goals-section { padding-top: 26px; }
  .goals-section .section-head { margin-bottom: 16px; }
  .goals-section .section-head h2 { font-size: 24px; }
  .goals-section .section-head p { font-size: 13px; }
}
</style>
