<script setup lang="ts">
import { computed } from 'vue'
import { ADJUSTMENT_KCAL, type CalorieResult, type Goal } from '../../lib/calculator'

const props = defineProps<{
  result: CalorieResult
  goal: Goal
  saving: boolean
}>()

defineEmits<{ save: [] }>()

const alertClass = computed(() => (props.result.verdict === 'blocked' ? 'alert-error' : 'alert-warning'))

const adjustmentText = computed(() =>
  props.goal === 'loss'
    ? `Defisit sekitar ${ADJUSTMENT_KCAL} kkal per hari dari kebutuhan harian`
    : `Surplus sekitar ${ADJUSTMENT_KCAL} kkal per hari dari kebutuhan harian`,
)

function formatKcal(value: number): string {
  return value.toLocaleString('id-ID')
}
</script>

<template>
  <section class="card result" aria-live="polite">
    <h2>Estimasi kebutuhan kalori</h2>

    <div v-if="result.messages.length" class="alert" :class="alertClass">
      <p v-for="message in result.messages" :key="message">{{ message }}</p>
    </div>

    <div v-if="result.targetKcal !== null" class="target">
      <span class="field-label">Target kalori harian</span>
      <p class="stat-value">{{ formatKcal(result.targetKcal) }} <span class="stat-unit">kkal/hari</span></p>
      <p class="muted">{{ adjustmentText }}</p>
    </div>

    <div class="stats">
      <div>
        <span class="field-label">BMR</span>
        <p class="stat-metric">{{ formatKcal(result.bmr) }} <span class="stat-unit">kkal/hari</span></p>
      </div>
      <div>
        <span class="field-label">TDEE</span>
        <p class="stat-metric">{{ formatKcal(result.tdee) }} <span class="stat-unit">kkal/hari</span></p>
      </div>
      <div>
        <span class="field-label">BMI</span>
        <p class="stat-metric">{{ result.bmi.toLocaleString('id-ID') }}</p>
      </div>
    </div>

    <p class="muted note">
      Angka ini adalah estimasi, bukan angka medis yang pasti. Pantau tren berat badan selama beberapa minggu sebelum
      menilai apakah target perlu disesuaikan.
    </p>

    <div class="actions">
      <button type="button" class="btn btn-primary" :disabled="saving" @click="$emit('save')">
        {{ saving ? 'Menyimpan...' : 'Simpan Profil & Rencana' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.result h2 {
  font-size: 24px;
}

.alert p {
  margin: 0 0 8px;
}

.alert p:last-child {
  margin-bottom: 0;
}

.target {
  margin-bottom: 24px;
}

.target p {
  margin: 8px 0 0;
}

.stats {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 24px;
}

.stats .field-label {
  font-size: 13px;
}

.stat-metric {
  margin: 8px 0 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--neutral-900);
}

.note {
  font-size: 14px;
  margin-bottom: 24px;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 480px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
