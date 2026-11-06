<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import ContentCard from '../ContentCard.vue'
import { contentsForProgram } from '../../lib/contentQueries'
import { calculateCalorieResult, type ProfileInput } from '../../lib/calculator'
import type { RootState } from '../../store'

const props = defineProps<{ profile: ProfileInput }>()
const store = useStore<RootState>()

const programTarget = computed(() => (props.profile.goal === 'loss' ? 'Turun BB' : 'Naik BB'))
const result = computed(() => calculateCalorieResult(props.profile))
const items = computed(() => contentsForProgram(programTarget.value))
const weights = computed(() => store.getters['user/sortedWeights'] as RootState['user']['weights'])
const startWeight = computed(() => weights.value[0]?.weightKg ?? props.profile.weightKg)
const currentWeight = computed(() => weights.value[weights.value.length - 1]?.weightKg ?? props.profile.weightKg)
const targetProgress = computed(() => {
  const target = props.profile.targetWeightKg
  if (!target || target === startWeight.value) return null
  const progress = props.profile.goal === 'loss'
    ? ((startWeight.value - currentWeight.value) / (startWeight.value - target)) * 100
    : ((currentWeight.value - startWeight.value) / (target - startWeight.value)) * 100
  return Math.max(0, Math.min(100, Math.round(progress)))
})
</script>

<template>
  <div>
    <div v-if="result.verdict === 'blocked'" class="alert alert-warning">
      Rencana program belum ditampilkan karena hasil kalkulator memerlukan konsultasi. Lihat catatan di bagian kalkulator.
    </div>
    <div v-else>
      <section class="card program-summary">
        <div>
          <span class="field-label">Program {{ props.profile.goal === 'loss' ? 'Turun BB' : 'Naik BB' }}</span>
          <p class="summary-weight">{{ currentWeight.toLocaleString('id-ID') }} kg <span class="muted">saat ini</span></p>
        </div>
        <div v-if="props.profile.targetWeightKg">
          <span class="field-label">Target</span>
          <p class="summary-weight">{{ props.profile.targetWeightKg.toLocaleString('id-ID') }} kg</p>
        </div>
        <div v-else>
          <span class="field-label">Target berat</span>
          <p class="muted">Tambahkan target dari kalkulator di Beranda.</p>
        </div>
        <div v-if="result.targetKcal !== null" class="calorie-target">
          <span class="field-label">Estimasi target harian</span>
          <strong>{{ result.targetKcal.toLocaleString('id-ID') }} kkal</strong>
        </div>
        <div v-if="targetProgress !== null" class="target-progress">
          <div class="progress-label"><span>Progres menuju target</span><strong>{{ targetProgress }}%</strong></div>
          <div class="progress-track" role="progressbar" aria-label="Progres menuju target berat" :aria-valuenow="targetProgress" aria-valuemin="0" aria-valuemax="100">
            <span :style="{ width: `${targetProgress}%` }"></span>
          </div>
        </div>
      </section>
      <div class="grid grid-2">
        <ContentCard v-for="item in items" :key="item.slug" :item="item" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.program-summary {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

.summary-weight {
  margin: 6px 0 0;
  font-size: 20px;
  font-weight: 700;
}

.calorie-target strong {
  display: block;
  margin-top: 6px;
  color: var(--primary-700);
  font-size: 20px;
}

.target-progress {
  grid-column: 1 / -1;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.progress-track {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--neutral-200);
}

.progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--primary-600);
}

@media (min-width: 700px) {
  .program-summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: center;
  }
}
</style>
