<script setup lang="ts">
const faqs = [
  {
    question: 'Apakah BeratSehat pengganti dokter atau ahli gizi?',
    answer: 'Tidak. BeratSehat adalah aplikasi edukasi dan perencana kebiasaan. Aplikasi ini tidak mendiagnosis atau mengobati kondisi medis apa pun.',
  },
  {
    question: 'Seberapa akurat hasil kalkulator?',
    answer: 'Hasilnya adalah estimasi berdasarkan rumus umum. Kebutuhan tubuh setiap orang bisa berbeda, jadi pantau tren berat badan selama beberapa minggu.',
  },
  {
    question: 'Mengapa target tidak muncul untuk saya?',
    answer: 'Target disembunyikan jika hasil berada di luar batas aman, misalnya BMI yang tidak sesuai dengan tujuan, atau jika ada penurunan berat badan tanpa sebab. Dalam kondisi ini konsultasikan ke tenaga kesehatan.',
  },
  {
    question: 'Apakah program ini cocok untuk remaja?',
    answer: 'Kalkulator dan program personal hanya tersedia untuk pengguna berusia 18 tahun ke atas. Remaja tetap bisa membaca materi edukasi.',
  },
  {
    question: 'Berapa lama hasil terlihat?',
    answer: 'Perubahan berat badan tidak selalu linear. Fokus pada konsistensi kebiasaan dan tren mingguan, bukan pada satu angka harian.',
  },
]

const communityUrl = import.meta.env.VITE_WHATSAPP_COMMUNITY_URL as string | undefined
</script>

<template>
  <div class="about-page">
    <section class="about-hero">
      <img
        class="about-image"
        src="https://images.pexels.com/photos/23224739/pexels-photo-23224739.jpeg?auto=compress&cs=tinysrgb&w=1600"
        alt="Aktivitas hidup sehat dan bersemangat"
        fetchpriority="high"
        decoding="async"
      />
      <div class="container about-content">
        <span class="eyebrow about-eyebrow">Tentang BeratSehat</span>
        <h1>Lebih paham. Lebih konsisten. Dengan caramu.</h1>
        <p class="lead">Panduan sederhana untuk makan, bergerak, dan memahami progres tanpa mengejar perubahan instan.</p>
      </div>
    </section>

    <!-- Section 1: Principles (White background) -->
    <section class="section section-white">
      <div class="container grid grid-2">
        <article class="card principle-card">
          <div class="card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h2>Cara kerja: CICO</h2>
          <p class="muted">
            CICO singkatan dari <em>Calories In, Calories Out</em>. Berat badan cenderung turun saat energi yang masuk lebih kecil
            dari energi yang keluar, dan cenderung naik saat sebaliknya.
          </p>
          <p class="muted">
            Itu hanya gambaran dasar. Kualitas makanan, waktu tidur, tingkat stres, dan kondisi kesehatan pribadi juga sangat memengaruhi hasil.
          </p>
        </article>

        <article class="card principle-card">
          <div class="card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <h2>Istilah penting</h2>
          <dl class="terms">
            <div>
              <dt>BMR</dt>
              <dd>Energi yang dibutuhkan tubuh saat istirahat.</dd>
            </div>
            <div>
              <dt>TDEE</dt>
              <dd>Total energi harian setelah memperhitungkan aktivitas.</dd>
            </div>
            <div>
              <dt>Defisit</dt>
              <dd>Asupan kalori di bawah TDEE, dipakai untuk program Turun BB.</dd>
            </div>
            <div>
              <dt>Surplus</dt>
              <dd>Asupan kalori di atas TDEE, dipakai untuk program Naik BB.</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>

    <!-- Section 2: FAQ & Expert Verification (Light green background) -->
    <section class="section section-light-green">
      <div class="container narrow">
        <div class="section-head">
          <span class="eyebrow">Tanya Jawab</span>
          <h2>Pertanyaan yang sering diajukan</h2>
          <p>Jawaban atas pertanyaan umum tentang cara kerja panduan BeratSehat.</p>
        </div>
        <details v-for="faq in faqs" :key="faq.question" class="faq card">
          <summary>{{ faq.question }}</summary>
          <p class="muted">{{ faq.answer }}</p>
        </details>

        <!-- Informative note on program advisors without leaving huge empty space -->
        <div class="card expert-card">
          <h3>Pendamping program</h3>
          <p class="muted">
            Profil coach dan nutrisionis akan ditampilkan di sini setelah kualifikasinya diverifikasi. Sampai saat itu, BeratSehat
            fokus menyajikan edukasi dasar berbasis sains tanpa mencantumkan tenaga ahli tertentu.
          </p>
        </div>
      </div>
    </section>

    <!-- Community Section: ONLY show if community link exists -->
    <section v-if="communityUrl" class="section section-white">
      <div class="container cta card">
        <div>
          <h2>Gabung komunitas</h2>
          <p class="muted">Diskusi dan pertanyaan ringan seputar kebiasaan sehat bersama pengguna lain.</p>
        </div>
        <a
          :href="communityUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-primary"
        >
          Gabung Komunitas WhatsApp
        </a>
      </div>
    </section>

    <!-- Medical Disclaimer Section -->
    <section class="section section-white disclaimer-section">
      <div class="container">
        <div class="alert alert-warning">
          <span class="alert-icon" aria-hidden="true">&#9888;</span>
          <div>
            <strong>Penting untuk diperhatikan:</strong>
            <p>
              BeratSehat bukan pengganti diagnosis atau perawatan medis. Jika kamu memiliki kondisi kesehatan khusus, sedang hamil,
              atau mengalami penurunan berat badan drastis tanpa sebab, konsultasikan ke dokter atau ahli gizi sebelum mengikuti program.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  overflow-x: hidden;
}

.about-hero {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  min-height: 420px;
  overflow: hidden;
  background: #0f271b;
  padding: 40px 0;
}

.about-hero::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  content: '';
  background: linear-gradient(135deg, rgba(10, 26, 18, 0.94) 0%, rgba(15, 39, 27, 0.88) 60%, rgba(12, 33, 23, 0.74) 100%);
}

.about-image {
  position: absolute;
  z-index: -2;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 42%;
}

.about-content {
  padding-top: 40px;
  padding-bottom: 40px;
  color: white;
}

.about-content > * {
  max-width: 740px;
}

.about-eyebrow {
  color: #d1fae5;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
}

.about-content h1 {
  margin: 0 0 16px;
  font-size: 44px;
  line-height: 1.15;
  color: #ffffff;
}

.lead {
  font-size: 18px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  max-width: 720px;
  margin: 0;
}

.principle-card {
  padding: 32px 28px;
}

.card-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary-100);
  color: var(--primary-700);
  margin-bottom: 18px;
}

.terms {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.terms dt {
  font-weight: 700;
  color: var(--primary-700);
  font-size: 16px;
}

.terms dd {
  margin: 4px 0 0;
  color: var(--neutral-600);
  font-size: 15px;
}

.narrow {
  max-width: 800px;
}

.faq {
  padding: 0;
  margin-bottom: 16px;
  overflow: hidden;
  border-radius: var(--radius-card);
}

.faq summary {
  cursor: pointer;
  padding: 22px 24px;
  font-weight: 700;
  font-size: 17px;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  color: var(--neutral-900);
}

.faq summary::-webkit-details-marker {
  display: none;
}

.faq summary::after {
  content: '+';
  font-size: 24px;
  font-weight: 400;
  color: var(--primary-600);
  transition: transform 0.2s ease;
}

.faq[open] summary::after {
  transform: rotate(45deg);
}

.faq p {
  padding: 0 24px 22px;
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--neutral-600);
}

.expert-card {
  margin-top: 28px;
  background: var(--neutral-0);
  border-radius: var(--radius-card);
  padding: 24px 28px;
}

.expert-card h3 {
  font-size: 19px;
  margin-bottom: 8px;
}

.expert-card p {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
}

.cta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  padding: 32px;
}

.cta h2 {
  font-size: 26px;
  margin-bottom: 8px;
}

.cta p {
  margin: 0;
  font-size: 16px;
}

.disclaimer-section {
  padding-top: 0;
}

.alert-icon {
  font-size: 22px;
  color: var(--warning-700);
  flex-shrink: 0;
  line-height: 1.2;
}

.alert p {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.5;
}

@media (min-width: 768px) {
  .cta {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .about-hero {
    min-height: auto;
    padding: 32px 0;
  }

  .about-content h1 {
    font-size: 32px;
  }

  .lead {
    font-size: 16px;
  }

  .principle-card {
    padding: 22px 18px;
  }

  .faq summary {
    padding: 18px 20px;
    font-size: 16px;
  }

  .faq p {
    padding: 0 20px 18px;
  }
}
</style>
