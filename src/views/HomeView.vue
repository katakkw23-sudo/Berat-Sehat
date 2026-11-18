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
  {
    icon: 'estimate',
    title: 'Estimasi yang jelas',
    text: 'Lihat kebutuhan energi harian dan target kalori yang dihitung dari data tubuh kamu.',
    link: '#kalkulator',
  },
  {
    icon: 'meal',
    title: 'Menu dari bahan lokal',
    text: 'Contoh makan dari tempe, telur, sayur, dan nasi yang mudah ditemukan dan terjangkau.',
    link: '/program',
  },
  {
    icon: 'progress',
    title: 'Progres yang bisa dipantau',
    text: 'Catat checklist harian dan berat badan untuk melihat tren, bukan hanya satu angka.',
    link: '/explore',
  },
]
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <img
        class="hero-image"
        src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1800"
        alt="Hidangan sehat dan bahan makanan bernutrisi"
        fetchpriority="high"
        decoding="async"
      />
      <div class="container hero-inner">
        <!-- Hero Left Column -->
        <div class="hero-content">
          <span class="eyebrow hero-eyebrow">Kebiasaan sehat untuk keseharianmu</span>
          <h1>Sehat itu perjalanan, bukan lomba.</h1>
          <p class="hero-text">
            Atur makan dan gerak dengan menu lokal, latihan pemula, serta langkah yang terasa realistis. Rekomendasi kalori
            personal tersedia untuk usia 18 tahun ke atas.
          </p>
          <div class="hero-actions">
            <RouterLink to="/program" class="btn btn-primary hero-btn-main">Mulai program</RouterLink>
            <a href="#kalkulator" class="btn btn-hero-outline">Hitung kebutuhan kalori</a>
          </div>

          <!-- Hero Big Bold Stats -->
          <div class="hero-stats" aria-label="Statistik BeratSehat">
            <div class="hero-stat-card">
              <span class="hero-stat-number">10</span>
              <span class="hero-stat-label">menu harian</span>
            </div>
            <div class="hero-stat-divider" aria-hidden="true"></div>
            <div class="hero-stat-card">
              <span class="hero-stat-number">10</span>
              <span class="hero-stat-label">latihan pemula</span>
            </div>
            <div class="hero-stat-divider" aria-hidden="true"></div>
            <div class="hero-stat-card">
              <span class="hero-stat-number">1</span>
              <span class="hero-stat-label">langkah hari ini</span>
            </div>
          </div>
        </div>

        <!-- Hero Right Column: Visual Preview Card -->
        <div class="hero-visual" aria-hidden="true">
          <div class="hero-preview-card">
            <div class="preview-header">
              <span class="preview-badge">
                <span class="preview-dot"></span>
                Inspirasi Menu Hari Ini
              </span>
              <span class="preview-chip">Lokal Sehat</span>
            </div>
            <div class="preview-body">
              <div class="preview-meal-pic">
                <img
                  src="https://images.pexels.com/photos/36982092/pexels-photo-36982092.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Inspirasi menu lokal sehat"
                  loading="lazy"
                />
              </div>
              <div class="preview-meta">
                <h4>Nasi Ayam Lalap & Sayur</h4>
                <p class="preview-kcal">~520 kkal <span>· Porsi Seimbang</span></p>
                <div class="preview-nutri-tags">
                  <span>Protein 32g</span>
                  <span>Karbo 60g</span>
                  <span>Serat 8g</span>
                </div>
              </div>
            </div>

            <!-- Progress Ring snippet -->
            <div class="preview-ring-box">
              <div class="ring-container">
                <svg class="progress-ring-svg" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" class="ring-bg" />
                  <circle cx="24" cy="24" r="20" class="ring-fill" />
                </svg>
                <span class="ring-percentage">75%</span>
              </div>
              <div class="ring-details">
                <strong>Target Rutinitas Hari Ini</strong>
                <span>3 dari 4 checklist selesai</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Goals Section: White background -->
    <section class="section section-white goals-section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Pilih tujuan</span>
          <h2>Pilih arah sehatmu</h2>
          <p>Mulai dengan target turun atau naik berat badan.</p>
        </div>
        <ProgramPaths />
      </div>
    </section>

    <!-- Optional Account Section -->
    <section v-if="localStorageMode || anonymousAccount === true" class="section section-white account-section">
      <div class="container">
        <AccountAccess />
      </div>
    </section>

    <!-- Dashboard Section (if profile): Light Green background -->
    <section v-if="profile" class="section section-light-green dashboard-section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Ruang pribadi</span>
          <h2>Program kamu</h2>
          <p>Ringkasan target, kebiasaan harian, dan perkembangan berat badanmu.</p>
        </div>
        <RecommendedPrograms :profile="profile" />
      </div>
    </section>

    <!-- Progress Section (if profile): White background -->
    <section v-if="profile" class="section section-white progress-section">
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

    <!-- Tools & Calculator Section: Light Green background -->
    <section id="kalkulator" class="section section-light-green tools-section">
      <div class="container">
        <div class="section-head tools-head">
          <span class="eyebrow">Alat bantu</span>
          <h2>Kenali kebutuhan tubuhmu</h2>
          <p>Gunakan estimasi ini sebagai panduan awal. Angka bukan diagnosis dan bisa berbeda pada tiap orang.</p>
        </div>
        <div class="tools-grid">
          <section class="tool-panel">
            <div class="tool-title">
              <span class="tool-index">01</span>
              <div>
                <h3>Indeks massa tubuh</h3>
                <p class="muted">Skrining BMI dan rentang berat sehat.</p>
              </div>
            </div>
            <BmiCalculator />
          </section>
          <section class="tool-panel">
            <div class="tool-title">
              <span class="tool-index">02</span>
              <div>
                <h3>Estimasi kalori harian</h3>
                <p class="muted">BMR, TDEE, dan target sesuai profil.</p>
              </div>
            </div>
            <CalorieCalculator />
            <details class="preferences-details">
              <summary class="preferences-btn">
                <svg viewBox="0 0 20 20" class="pref-icon" aria-hidden="true">
                  <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>Sesuaikan pilihan bahan makanan</span>
                <svg viewBox="0 0 20 20" class="chevron-icon" aria-hidden="true">
                  <path d="m6 8 4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </summary>
              <div class="preferences-body"><ProfilePreferences /></div>
            </details>
          </section>
        </div>
      </div>
    </section>

    <!-- Focal Point Section: Dark Green background with white text -->
    <section class="section section-dark-green features-focal-section">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow eyebrow-light">Langkah terarah</span>
          <h2>Langkah sehat yang mudah dipahami</h2>
          <p>Mulai perubahan gaya hidup sehat dengan panduan yang jelas, realistis, dan ramah kantong.</p>
        </div>
        <div class="grid grid-3">
          <article v-for="benefit in benefits" :key="benefit.title" class="card benefit-card">
            <div class="benefit-icon" aria-hidden="true">
              <svg v-if="benefit.icon === 'estimate'" viewBox="0 0 24 24">
                <path d="M4 19h16M7 16V9m5 7V5m5 11v-4" />
              </svg>
              <svg v-else-if="benefit.icon === 'meal'" viewBox="0 0 24 24">
                <path d="M4 12a8 8 0 0 0 16 0H4Zm2-3a6 6 0 0 1 12 0M12 3v2" />
              </svg>
              <svg v-else viewBox="0 0 24 24">
                <path d="M4 17 9 12l3 3 8-8M14 7h6v6" />
              </svg>
            </div>
            <h3>{{ benefit.title }}</h3>
            <p>{{ benefit.text }}</p>
            <RouterLink v-if="benefit.link.startsWith('/')" :to="benefit.link" class="benefit-link">
              Pelajari &rarr;
            </RouterLink>
            <a v-else :href="benefit.link" class="benefit-link">
              Pelajari &rarr;
            </a>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  overflow-x: hidden;
}

/* Hero Section */
.hero {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  min-height: 520px;
  overflow: hidden;
  background: #0f271b;
  padding: 40px 0;
}

.hero::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  content: '';
  background: linear-gradient(135deg, rgba(10, 26, 18, 0.93) 0%, rgba(15, 39, 27, 0.86) 55%, rgba(12, 33, 23, 0.74) 100%);
}

.hero-image {
  position: absolute;
  z-index: -2;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 42%;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 36px;
  color: var(--neutral-0);
}

@media (min-width: 980px) {
  .hero-inner {
    grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.85fr);
    gap: 48px;
  }
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  max-width: 680px;
}

.hero-eyebrow {
  color: #e2f5e8;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
}

.hero-content h1 {
  margin: 0;
  font-size: 46px;
  line-height: 1.15;
  color: #ffffff;
}

.hero-text {
  font-size: 17px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 6px;
}

.hero-btn-main {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.btn-hero-outline {
  color: var(--neutral-0);
  border-color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.1);
}

.btn-hero-outline:hover {
  color: var(--neutral-900);
  background: var(--neutral-0);
  border-color: var(--neutral-0);
}

/* Big bold stats */
.hero-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
}

.hero-stat-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-stat-number {
  font-size: 34px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}

.hero-stat-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  text-transform: capitalize;
}

.hero-stat-divider {
  width: 1px;
  height: 38px;
  background: rgba(255, 255, 255, 0.22);
}

/* Hero Visual Element (Right side) */
.hero-visual {
  display: flex;
  justify-content: center;
}

.hero-preview-card {
  width: 100%;
  max-width: 380px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: var(--radius-card);
  padding: 22px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #ffffff;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  color: #dcfce7;
}

.preview-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 8px #4ade80;
}

.preview-chip {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.preview-body {
  display: flex;
  gap: 14px;
  align-items: center;
}

.preview-meal-pic {
  width: 74px;
  height: 74px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.preview-meal-pic img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-meta h4 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.preview-kcal {
  font-size: 13px;
  font-weight: 600;
  color: #86efac;
  margin: 0 0 6px;
}

.preview-kcal span {
  color: rgba(255, 255, 255, 0.75);
  font-weight: 400;
}

.preview-nutri-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preview-nutri-tags span {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 7px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
}

.preview-ring-box {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.22);
  border-radius: 12px;
}

.ring-container {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.progress-ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 4;
}

.ring-fill {
  fill: none;
  stroke: #4ade80;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 125;
  stroke-dashoffset: 31;
}

.ring-percentage {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 800;
  color: #ffffff;
}

.ring-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ring-details strong {
  font-size: 13px;
  color: #ffffff;
}

.ring-details span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* Tools Section (BMI & Calorie Calculators) */
.tools-section {
  background: #edf5f0;
}

.tools-head {
  max-width: 740px;
}

.tools-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  align-items: start;
}

@media (min-width: 900px) {
  .tools-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}

.tool-panel {
  min-width: 0;
  width: 100%;
}

.tool-title {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
}

.tool-index {
  display: grid;
  flex: 0 0 40px;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--primary-100);
  color: var(--primary-700);
  font-size: 14px;
  font-weight: 800;
}

.tool-title h3 {
  margin: 0 0 4px;
  font-size: 20px;
}

.tool-title p {
  margin: 0;
  font-size: 14px;
}

/* Preferences Outline Button (Point 10) */
.preferences-details {
  margin-top: 20px;
}

.preferences-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 22px;
  border: 1.5px solid var(--primary-600);
  border-radius: var(--radius-btn);
  background: var(--neutral-0);
  color: var(--primary-700);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  list-style: none;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.preferences-btn::-webkit-details-marker {
  display: none;
}

.preferences-btn:hover {
  background: var(--primary-50);
  border-color: var(--primary-700);
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(23, 79, 50, 0.12);
}

.pref-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.chevron-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  transition: transform var(--transition-base);
}

.preferences-details[open] .chevron-icon {
  transform: rotate(180deg);
}

.preferences-body {
  padding-top: 16px;
}

/* Focal Point: Langkah Sehat (Points 8 & 11) */
.features-focal-section {
  background: #113423;
  color: #ffffff;
}

.eyebrow-light {
  color: #d1fae5;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.benefit-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  color: var(--neutral-900);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 32px 28px;
  border-radius: var(--radius-card);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
}

.benefit-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.28);
}

.benefit-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 22px;
  border-radius: 16px;
  background: var(--primary-100);
  color: var(--primary-700);
  flex-shrink: 0;
}

.benefit-icon svg {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.benefit-card h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: var(--neutral-900);
}

.benefit-card p {
  color: var(--neutral-600);
  font-size: 15px;
  line-height: 1.6;
  margin: 0 0 20px;
  flex-grow: 1;
}

.benefit-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 700;
  color: var(--primary-600);
  transition: all var(--transition-base);
  margin-top: auto;
}

.benefit-link:hover {
  color: var(--primary-700);
  transform: translateX(3px);
}

.account-section {
  padding-top: 0;
}

.insights-wrap {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .hero {
    min-height: auto;
    padding: 36px 0;
  }

  .hero-content h1 {
    font-size: 32px;
  }

  .hero-text {
    font-size: 15px;
  }

  .hero-stats {
    gap: 12px;
    padding-top: 14px;
  }

  .hero-stat-number {
    font-size: 26px;
  }

  .hero-stat-label {
    font-size: 12px;
  }

  .hero-visual {
    display: none;
  }

  .benefit-card {
    padding: 24px 20px;
  }
}

@media (max-width: 480px) {
  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .hero-actions .btn {
    width: 100%;
  }

  .hero-stats {
    justify-content: space-between;
  }

  .hero-stat-divider {
    height: 28px;
  }
}
</style>
