<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { formatDate, todayIso } from '../../lib/date'
import type { RootState } from '../../store'

const store = useStore<RootState>()
const date = ref(todayIso())
const weightInput = ref('')
const saving = ref(false)
const errorText = ref('')
const successText = ref('')

const weights = computed(() => store.getters['user/sortedWeights'] as RootState['user']['weights'])
const latest = computed(() => (weights.value.length ? weights.value[weights.value.length - 1] : null))
const first = computed(() => (weights.value.length ? weights.value[0] : null))
const chartPoints = computed(() => {
  if (weights.value.length < 2) return []
  const values = weights.value.map((entry) => entry.weightKg)
  const minimum = Math.min(...values) - 1
  const range = Math.max(...values) - minimum + 1
  return weights.value.map((entry, index) => ({
    x: 10 + (index / (weights.value.length - 1)) * 300,
    y: 110 - ((entry.weightKg - minimum) / range) * 100,
  }))
})
const change = computed(() => {
  if (!latest.value || !first.value) return null
  return Math.round((latest.value.weightKg - first.value.weightKg) * 10) / 10
})
const willReplace = computed(() => weights.value.some((entry) => entry.date === date.value))

async function submitWeight() {
  errorText.value = ''
  successText.value = ''
  const weightKg = Number(weightInput.value)
  if (!date.value) {
    errorText.value = 'Pilih tanggal penimbangan.'
    return
  }
  if (!Number.isFinite(weightKg) || weightKg < 25 || weightKg > 300) {
    errorText.value = 'Berat badan harus antara 25 dan 300 kg.'
    return
  }
  const replacingExistingEntry = willReplace.value
  saving.value = true
  try {
    await store.dispatch('user/addWeight', { date: date.value, weightKg })
    successText.value = replacingExistingEntry ? 'Catatan tanggal ini diperbarui.' : 'Catatan berat badan tersimpan.'
    weightInput.value = ''
  } catch {
    errorText.value = 'Catatan belum tersimpan. Periksa koneksi internet, lalu coba lagi.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="card">
    <h3>Riwayat berat badan</h3>

    <div class="summary">
      <div>
        <span class="field-label">Terakhir</span>
        <p class="stat-metric">
          {{ latest ? latest.weightKg.toLocaleString('id-ID') : '-' }} <span class="stat-unit">kg</span>
        </p>
      </div>
      <div>
        <span class="field-label">Perubahan</span>
        <p class="stat-metric">
          <template v-if="change !== null">{{ change > 0 ? '+' : '' }}{{ change.toLocaleString('id-ID') }} kg</template>
          <template v-else>-</template>
        </p>
      </div>
    </div>

    <div v-if="chartPoints.length" class="weight-chart">
      <div class="chart-heading">
        <span class="field-label">Tren berat badan</span>
        <span class="muted">{{ formatDate(first!.date) }} – {{ formatDate(latest!.date) }}</span>
      </div>
      <svg viewBox="0 0 320 120" role="img" aria-label="Grafik tren catatan berat badan">
        <line x1="10" y1="110" x2="310" y2="110" />
        <polyline :points="chartPoints.map((point) => `${point.x},${point.y}`).join(' ')" />
        <circle v-for="(point, index) in chartPoints" :key="index" :cx="point.x" :cy="point.y" r="4" />
      </svg>
      <div class="chart-labels muted"><span>{{ first!.weightKg }} kg</span><span>{{ latest!.weightKg }} kg</span></div>
    </div>
    <p v-else-if="weights.length === 1" class="muted chart-empty">Tambahkan catatan berikutnya untuk melihat tren perubahan.</p>

    <form class="weight-form" novalidate @submit.prevent="submitWeight">
      <div class="field">
        <label for="weight-date">Tanggal</label>
        <input id="weight-date" v-model="date" class="input" type="date" />
      </div>
      <div class="field">
        <label for="weight-value">Berat (kg)</label>
        <input id="weight-value" v-model="weightInput" class="input" type="number" inputmode="decimal" step="0.1" placeholder="Contoh: 58.5" />
      </div>
      <p v-if="willReplace" class="muted hint">Sudah ada catatan untuk {{ formatDate(date) }} dan akan diperbarui.</p>
      <p v-if="errorText" class="alert alert-error" role="alert">{{ errorText }}</p>
      <p v-if="successText" class="alert alert-success" role="status">{{ successText }}</p>
      <button type="submit" class="btn btn-primary btn-block" :disabled="saving">
        {{ saving ? 'Menyimpan...' : 'Simpan Catatan' }}
      </button>
    </form>

    <ol v-if="weights.length" class="history">
      <li v-for="entry in weights" :key="entry.date">
        <span>{{ formatDate(entry.date) }}</span>
        <strong>{{ entry.weightKg.toLocaleString('id-ID') }} kg</strong>
      </li>
    </ol>
    <p v-else class="muted">Belum ada catatan. Tambahkan berat badan pertama kamu di atas.</p>
  </section>
</template>

<style scoped>
h3 {
  margin-bottom: 16px;
}

.summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-metric {
  margin: 8px 0 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-700);
}

.weight-chart {
  margin-bottom: 24px;
}

.chart-heading,
.chart-labels {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.weight-chart svg {
  display: block;
  width: 100%;
  height: 128px;
  margin-top: 8px;
  overflow: visible;
}

.weight-chart line {
  stroke: var(--neutral-200);
  stroke-width: 1;
}

.weight-chart polyline {
  fill: none;
  stroke: var(--primary-600);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}

.weight-chart circle {
  fill: var(--neutral-0);
  stroke: var(--primary-600);
  stroke-width: 3;
}

.chart-empty {
  margin-bottom: 24px;
  font-size: 14px;
}

.weight-form {
  margin-bottom: 24px;
}

.weight-form .field {
  margin-bottom: 16px;
}

.hint {
  font-size: 14px;
  margin: 0 0 16px;
}

.history {
  margin: 0;
  padding: 0 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.history li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 15px;
}

@media (max-width: 480px) {
  .summary {
    grid-template-columns: 1fr;
  }
}
</style>
