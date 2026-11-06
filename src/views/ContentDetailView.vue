<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { findContentBySlug } from '../lib/contentQueries'
import { todayIso } from '../lib/date'
import type { RootState } from '../store'

const route = useRoute()
const store = useStore<RootState>()

const item = computed(() => findContentBySlug(String(route.params.slug)))

const saving = ref(false)
const saveMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined

const whatsappUrl = computed(() => {
  if (!item.value || !whatsappNumber) return null
  const text = `Halo, saya ingin bertanya tentang "${item.value.title}" di BeratSehat.`
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`
})

async function saveToChecklist() {
  if (!item.value) return
  saving.value = true
  saveMessage.value = null
  try {
    await store.dispatch('user/addTask', { id: item.value.slug, title: item.value.title, date: todayIso() })
    saveMessage.value = { type: 'success', text: 'Tersimpan di checklist hari ini. Lihat bagian progres di Beranda.' }
  } catch {
    saveMessage.value = { type: 'error', text: 'Belum bisa disimpan. Periksa koneksi internet, lalu coba lagi.' }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section v-if="item" class="section">
    <div class="container detail">
      <RouterLink to="/explore" class="back-link">&larr; Kembali ke Explore</RouterLink>

      <header class="detail-header">
        <div class="badges">
          <span class="badge">{{ item.category }}</span>
          <span class="badge badge-target">{{ item.target }}</span>
        </div>
        <h1>{{ item.title }}</h1>
        <p class="muted">{{ item.summary }}</p>
        <p class="duration"><strong>Perkiraan waktu:</strong> {{ item.estimatedDuration }}</p>
      </header>

      <img class="cover" :src="item.coverImage" :alt="item.title" />

      <div class="detail-body">
        <article class="card content">
          <p v-for="paragraph in item.body" :key="paragraph">{{ paragraph }}</p>

          <div v-if="item.nutrition" class="block">
            <h2>Nutrisi per porsi</h2>
            <p class="muted">{{ item.nutrition.portion }}</p>
            <dl class="nutrition">
              <div><dt>Energi</dt><dd>{{ item.nutrition.calories.toLocaleString('id-ID') }} kkal</dd></div>
              <div><dt>Protein</dt><dd>{{ item.nutrition.protein }} g</dd></div>
              <div><dt>Karbohidrat</dt><dd>{{ item.nutrition.carbs }} g</dd></div>
              <div v-if="item.nutrition.fat !== undefined"><dt>Lemak</dt><dd>{{ item.nutrition.fat }} g</dd></div>
            </dl>
            <p class="muted small">Nilai ini perkiraan dan bisa berbeda tergantung bahan dan cara memasak.</p>
          </div>

          <div v-if="item.workout" class="block">
            <h2>Rincian latihan</h2>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Gerakan</th>
                    <th>Set</th>
                    <th>Repetisi / durasi</th>
                    <th>Istirahat</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="exercise in item.workout.exercises" :key="exercise.name">
                    <td>{{ exercise.name }}</td>
                    <td>{{ exercise.sets }}</td>
                    <td>{{ exercise.reps }}</td>
                    <td>{{ exercise.rest }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3>Alternatif gerakan</h3>
            <ul>
              <li v-for="alternative in item.workout.alternatives" :key="alternative">{{ alternative }}</li>
            </ul>
          </div>
        </article>

        <aside class="card actions-card">
          <h3>Langkah berikutnya</h3>
          <p class="muted">Jadikan konten ini kegiatan nyata dengan menyimpannya ke checklist hari ini.</p>
          <button type="button" class="btn btn-primary btn-block" :disabled="saving" @click="saveToChecklist">
            {{ saving ? 'Menyimpan...' : 'Simpan ke Checklist Harian' }}
          </button>
          <p v-if="saveMessage" class="alert" :class="saveMessage.type === 'success' ? 'alert-success' : 'alert-error'" role="status">
            {{ saveMessage.text }}
          </p>

          <a v-if="whatsappUrl" :href="whatsappUrl" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-block">
            Tanya Coach via WhatsApp
          </a>
          <p v-else class="muted small">Layanan tanya coach belum tersedia.</p>
        </aside>
      </div>
    </div>
  </section>

  <section v-else class="section">
    <div class="container empty-state card">
      <h1>Konten tidak ditemukan</h1>
      <p class="muted">Tautan yang kamu buka mungkin sudah berubah atau tidak tersedia.</p>
      <RouterLink to="/explore" class="btn btn-primary">Kembali ke Explore</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.back-link {
  font-size: 15px;
}

.detail-header h1 {
  margin: 16px 0;
  font-size: 36px;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge-target {
  background: var(--primary-100);
  color: var(--primary-700);
}

.duration {
  margin: 16px 0 0;
  font-size: 15px;
}

.cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--radius);
}

.detail-body {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}

.content {
  padding: 32px;
}

.block {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--neutral-200);
}

.block h2 {
  font-size: 22px;
}

.block h3 {
  font-size: 18px;
  margin-top: 24px;
}

.nutrition {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 16px 0 8px;
}

.nutrition div {
  padding: 16px;
  border-radius: 8px;
  background: var(--primary-50);
}

.nutrition dt {
  font-size: 13px;
  color: var(--neutral-500);
}

.nutrition dd {
  margin: 4px 0 0;
  font-size: 20px;
  font-weight: 700;
}

.small {
  font-size: 13px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}

th,
td {
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid var(--neutral-200);
  vertical-align: top;
}

th {
  color: var(--neutral-700);
  font-weight: 700;
}

.actions-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: fit-content;
}

.actions-card h3,
.actions-card p {
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.empty-state h1 {
  font-size: 28px;
  margin: 0;
}

@media (min-width: 900px) {
  .detail-body {
    grid-template-columns: minmax(0, 1fr) 320px;
    align-items: start;
  }
}

@media (max-width: 600px) {
  .detail-header h1 { font-size: 30px; }
  .content { padding: 20px; }
  .nutrition { gap: 10px; }
  th, td { padding: 10px 8px; }
}
</style>
