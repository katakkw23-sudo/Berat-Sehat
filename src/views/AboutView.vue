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
  <div>
    <section class="about-hero">
      <img class="about-image" src="https://images.pexels.com/photos/23224739/pexels-photo-23224739.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" aria-hidden="true" fetchpriority="high" decoding="async" />
      <div class="container about-content">
        <span class="eyebrow">Tentang BeratSehat</span>
        <h1>Lebih paham. Lebih konsisten. Dengan caramu.</h1>
        <p class="lead">Panduan sederhana untuk makan, bergerak, dan memahami progres tanpa mengejar perubahan instan.</p>
      </div>
    </section>

    <section class="section">
      <div class="container grid grid-2">
        <article class="card">
          <h2>Cara kerja: CICO</h2>
          <p class="muted">
            CICO singkatan dari <em>Calories In, Calories Out</em>. Berat badan cenderung turun saat energi yang masuk lebih kecil
            dari energi yang keluar, dan cenderung naik saat sebaliknya.
          </p>
          <p class="muted">
            Itu hanya gambaran dasar. Kualitas makanan, tidur, stres, dan kondisi kesehatan juga memengaruhi hasil.
          </p>
        </article>

        <article class="card">
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

    <section class="section section-muted">
      <div class="container">
        <div class="section-head">
          <h2>Pendamping program</h2>
          <p>
            Profil coach dan nutrisionis akan ditampilkan di sini setelah kualifikasinya diverifikasi. Sampai saat itu, BeratSehat
            belum mencantumkan tenaga ahli tertentu.
          </p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container narrow">
        <div class="section-head">
          <h2>Pertanyaan yang sering diajukan</h2>
        </div>
        <details v-for="faq in faqs" :key="faq.question" class="faq card">
          <summary>{{ faq.question }}</summary>
          <p class="muted">{{ faq.answer }}</p>
        </details>
      </div>
    </section>

    <section class="section section-muted">
      <div class="container cta card">
        <div>
          <h2>Gabung komunitas</h2>
          <p class="muted">Diskusi dan pertanyaan ringan seputar kebiasaan sehat bersama pengguna lain.</p>
        </div>
        <a
          v-if="communityUrl"
          :href="communityUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-primary"
        >
          Gabung Komunitas WhatsApp
        </a>
        <p v-else class="muted">Tautan komunitas belum tersedia.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="alert alert-warning">
          BeratSehat bukan pengganti diagnosis atau perawatan medis. Jika kamu memiliki kondisi kesehatan, sedang hamil,
          atau mengalami penurunan berat badan tanpa sebab, konsultasikan ke dokter atau ahli gizi sebelum mengikuti program.
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-hero {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  min-height: 390px;
  overflow: hidden;
  background: #183b2c;
}

.about-hero::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  content: '';
  background: rgba(14, 35, 25, 0.6);
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

.about-content { padding-top: 52px; padding-bottom: 52px; color: white; }
.about-content > * { max-width: 740px; }
.about-content .eyebrow { color: white; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.24); }
.about-content h1 { margin: 0 0 14px; font-size: 44px; line-height: 1.08; }

.lead {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.86);
  max-width: 720px;
  margin: 0;
}

.terms {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.terms dt {
  font-weight: 700;
}

.terms dd {
  margin: 4px 0 0;
  color: var(--neutral-500);
}

.narrow {
  max-width: 760px;
}

.faq {
  padding: 0;
  margin-bottom: 16px;
  overflow: hidden;
}

.faq summary {
  cursor: pointer;
  padding: 20px 24px;
  font-weight: 600;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.faq summary::after {
  content: '+';
  font-size: 22px;
  color: var(--primary-600);
  transition: transform 0.2s ease;
}

.faq[open] summary::after {
  transform: rotate(45deg);
}

.faq p {
  padding: 0 24px 20px;
  margin: 0;
}

.cta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.cta h2 {
  font-size: 24px;
  margin-bottom: 8px;
}

.cta p {
  margin: 0;
}

@media (min-width: 768px) {
  .cta {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 32px;
  }
}

@media (max-width: 600px) {
  .about-hero { min-height: 340px; }
  .about-image { object-position: 58% center; }
  .about-content { padding-top: 42px; padding-bottom: 42px; }
  .about-content h1 { font-size: 34px; }
}
</style>
