<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex'
import CalorieResultCard from './CalorieResultCard.vue'
import {
  ACTIVITY_OPTIONS,
  GOAL_OPTIONS,
  calculateCalorieResult,
  isAdultForCalculator,
  validateProfileInput,
  type ActivityLevel,
  type Gender,
  type Goal,
  type ProfileErrors,
  type ProfileInput,
} from '../../lib/calculator'
import type { RootState } from '../../store'

interface FormState {
  gender: Gender | ''
  age: string
  heightCm: string
  weightKg: string
  targetWeightKg: string | number
  activity: ActivityLevel | ''
  goal: Goal | ''
  healthConcern: boolean
}

const store = useStore<RootState>()

const form = reactive<FormState>({
  gender: '',
  age: '',
  heightCm: '',
  weightKg: '',
  targetWeightKg: '',
  activity: '',
  goal: '',
  healthConcern: false,
})

const attempted = ref(false)
const saving = ref(false)
const saveMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

function toInput(): ProfileInput {
  const targetWeight = String(form.targetWeightKg).trim()
  return {
    gender: form.gender as Gender,
    age: Number(form.age),
    heightCm: Number(form.heightCm),
    weightKg: Number(form.weightKg),
    ...(targetWeight ? { targetWeightKg: Number(targetWeight) } : {}),
    activity: form.activity as ActivityLevel,
    goal: form.goal as Goal,
    healthConcern: form.healthConcern,
  }
}

const errors = computed<ProfileErrors>(() => validateProfileInput(toInput()))
const hasErrors = computed(() => Object.keys(errors.value).length > 0)
const visibleErrors = computed<ProfileErrors>(() => (attempted.value ? errors.value : {}))
const isUnderAge = computed(() => !hasErrors.value && !isAdultForCalculator(Number(form.age)))
const result = computed(() => (hasErrors.value || isUnderAge.value ? null : calculateCalorieResult(toInput())))
const targetError = computed(() => {
  const targetValue = String(form.targetWeightKg).trim()
  if (!targetValue) return ''
  const targetWeightKg = Number(targetValue)
  if (!Number.isFinite(targetWeightKg) || targetWeightKg < 25 || targetWeightKg > 300) {
    return 'Target berat harus antara 25 dan 300 kg.'
  }
  if (form.goal === 'loss' && targetWeightKg >= Number(form.weightKg)) {
    return 'Target Turun BB perlu lebih rendah dari berat saat ini.'
  }
  if (form.goal === 'gain' && targetWeightKg <= Number(form.weightKg)) {
    return 'Target Naik BB perlu lebih tinggi dari berat saat ini.'
  }
  return ''
})

const savedProfile = computed(() => store.state.user.profile)

watch(
  savedProfile,
  (profile) => {
    if (!profile) return
    form.gender = profile.gender
    form.age = String(profile.age)
    form.heightCm = String(profile.heightCm)
    form.weightKg = String(profile.weightKg)
    form.targetWeightKg = profile.targetWeightKg === undefined ? '' : String(profile.targetWeightKg)
    form.activity = profile.activity
    form.goal = profile.goal
    form.healthConcern = profile.healthConcern
  },
  { immediate: true },
)

function submitForm() {
  attempted.value = true
}

async function saveProfile() {
  if (!result.value || targetError.value) return
  saving.value = true
  saveMessage.value = null
  try {
    await store.dispatch('user/saveProfile', toInput())
    saveMessage.value = { type: 'success', text: 'Profil dan rencana kamu sudah tersimpan.' }
  } catch {
    saveMessage.value = {
      type: 'error',
      text: 'Profil belum bisa disimpan. Periksa koneksi internet atau konfigurasi Firebase, lalu coba lagi.',
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="calculator">
    <form class="card form" novalidate @submit.prevent="submitForm">
      <div class="form-grid">
        <div class="field">
          <label for="gender">Jenis kelamin</label>
          <select id="gender" v-model="form.gender" class="input" :aria-invalid="!!visibleErrors.gender">
            <option value="" disabled>Pilih jenis kelamin</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
          <span v-if="visibleErrors.gender" class="field-error">{{ visibleErrors.gender }}</span>
        </div>

        <div class="field">
          <label for="age">Usia (tahun)</label>
          <input id="age" v-model="form.age" class="input" type="number" inputmode="numeric" min="1" max="120" placeholder="Contoh: 25" :aria-invalid="!!visibleErrors.age" />
          <span v-if="visibleErrors.age" class="field-error">{{ visibleErrors.age }}</span>
        </div>

        <div class="field">
          <label for="height">Tinggi badan (cm)</label>
          <input id="height" v-model="form.heightCm" class="input" type="number" inputmode="decimal" min="100" max="250" placeholder="Contoh: 165" :aria-invalid="!!visibleErrors.heightCm" />
          <span v-if="visibleErrors.heightCm" class="field-error">{{ visibleErrors.heightCm }}</span>
        </div>

        <div class="field">
          <label for="weight">Berat badan saat ini (kg)</label>
          <input id="weight" v-model="form.weightKg" class="input" type="number" inputmode="decimal" min="25" max="300" placeholder="Contoh: 60" :aria-invalid="!!visibleErrors.weightKg" />
          <span v-if="visibleErrors.weightKg" class="field-error">{{ visibleErrors.weightKg }}</span>
        </div>

        <div class="field full">
          <label for="activity">Tingkat aktivitas harian</label>
          <select id="activity" v-model="form.activity" class="input" :aria-invalid="!!visibleErrors.activity">
            <option value="" disabled>Pilih tingkat aktivitas</option>
            <option v-for="option in ACTIVITY_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <span v-if="visibleErrors.activity" class="field-error">{{ visibleErrors.activity }}</span>
        </div>

        <div class="field full">
          <span class="field-label">Tujuan kamu</span>
          <div class="goal-row" role="group" aria-label="Pilih tujuan">
            <button
              v-for="option in GOAL_OPTIONS"
              :key="option.value"
              type="button"
              class="chip goal-chip"
              :class="{ active: form.goal === option.value }"
              :aria-pressed="form.goal === option.value"
              @click="form.goal = option.value"
            >
              {{ option.label }}
            </button>
          </div>
          <span v-if="visibleErrors.goal" class="field-error">{{ visibleErrors.goal }}</span>
        </div>

        <div class="field full">
          <label for="target-weight">Target berat badan (opsional)</label>
          <input id="target-weight" v-model="form.targetWeightKg" class="input" type="number" inputmode="decimal" min="25" max="300" step="0.1" placeholder="Contoh: 55" :aria-invalid="!!targetError" />
          <span v-if="targetError" class="field-error">{{ targetError }}</span>
        </div>

        <label class="checkbox full">
          <input v-model="form.healthConcern" type="checkbox" />
          <span>Saya mengalami penurunan berat badan tanpa sebab yang jelas, atau memiliki kondisi kesehatan yang memengaruhi makan.</span>
        </label>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Hitung Estimasi</button>
      </div>
    </form>

    <div v-if="isUnderAge" class="alert alert-warning" role="status">
      Kalkulator kalori dewasa tersedia untuk usia 18 tahun ke atas. Kamu tetap bisa membaca materi edukasi dasar di
      <RouterLink to="/explore?type=Edukasi">Explore</RouterLink>.
    </div>

    <CalorieResultCard
      v-if="result"
      :result="result"
      :goal="form.goal as Goal"
      :saving="saving || !!targetError"
      @save="saveProfile"
    />

    <p v-if="saveMessage" class="alert" :class="saveMessage.type === 'success' ? 'alert-success' : 'alert-error'" role="status">
      {{ saveMessage.text }}
    </p>
  </div>
</template>

<style scoped>
.calculator {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form {
  padding: 32px;
}

.form-grid {
  display: grid;
  gap: 0 24px;
  grid-template-columns: 1fr;
}

.form-grid .full {
  grid-column: 1 / -1;
}

.field {
  margin-bottom: 16px;
}

.goal-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.goal-chip {
  flex: 1 1 160px;
  justify-content: center;
}

.checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: var(--neutral-700);
  margin-bottom: 16px;
  cursor: pointer;
}

.checkbox input {
  margin-top: 4px;
  width: 18px;
  height: 18px;
  accent-color: var(--primary-600);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
