<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import type { RootState } from '../../store'

const props = defineProps<{ estimatedCost: number }>()
const store = useStore<RootState>()
const preferences = computed(() => store.state.user.preferences)
const budgetInput = ref('')
const saving = ref(false)
const errorText = ref('')
const successText = ref('')
const budget = computed(() => Number(budgetInput.value))
const hasBudget = computed(() => Number.isInteger(budget.value) && budget.value >= 5000 && budget.value <= 1000000)
const difference = computed(() => budget.value - props.estimatedCost)

watch(preferences, (value) => {
  budgetInput.value = value.dailyFoodBudget === null ? '' : String(value.dailyFoodBudget)
}, { immediate: true, deep: true })

function formatRupiah(value: number): string {
  return `Rp${Math.round(value).toLocaleString('id-ID')}`
}

async function saveBudget() {
  errorText.value = ''
  successText.value = ''
  if (!hasBudget.value) {
    errorText.value = 'Masukkan anggaran antara Rp5.000 dan Rp1.000.000 per hari.'
    return
  }
  saving.value = true
  try {
    await store.dispatch('user/savePreferences', { ...preferences.value, dailyFoodBudget: budget.value })
    successText.value = 'Anggaran harian tersimpan di preferensi kamu.'
  } catch {
    errorText.value = 'Anggaran belum tersimpan. Periksa koneksi dan pengaturan Firebase.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="budget-panel card" aria-labelledby="budget-title">
    <!-- Cost Header -->
    <div class="budget-heading">
      <div>
        <span class="field-label">Perkiraan biaya menu</span>
        <h3 id="budget-title">{{ formatRupiah(props.estimatedCost) }} <span>/ hari</span></h3>
      </div>
      <span class="badge">Harga pasar lokal</span>
    </div>

    <!-- Divider separating cost card and budget input -->
    <div class="budget-divider" aria-hidden="true"></div>

    <!-- Budget Input Form -->
    <form class="budget-form" novalidate @submit.prevent="saveBudget">
      <div class="field budget-field">
        <label for="daily-food-budget">Anggaran makan kamu per hari</label>
        <div class="budget-input-wrap">
          <span class="currency-prefix">Rp</span>
          <input
            id="daily-food-budget"
            v-model="budgetInput"
            class="input budget-input"
            type="number"
            min="5000"
            max="1000000"
            step="1000"
            inputmode="numeric"
            placeholder="Contoh: 40000"
          />
        </div>
      </div>
      <button type="submit" class="btn btn-outline budget-save-btn" :disabled="saving">
        {{ saving ? 'Menyimpan...' : 'Simpan anggaran' }}
      </button>
    </form>

    <!-- Over Budget Alert with Icon and Larger Text (Point 12) -->
    <div v-if="hasBudget && difference < 0" class="alert alert-warning budget-alert" role="status">
      <svg class="budget-alert-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      <div class="budget-alert-content">
        <strong class="budget-alert-title">Menu melebihi target anggaran</strong>
        <p class="budget-alert-text">
          Menu sekitar <strong>{{ formatRupiah(Math.abs(difference)) }}</strong> di atas anggaran harianmu. Kamu bisa memilih bahan alternatif hemat di menu bawah.
        </p>
      </div>
    </div>

    <!-- Within Budget Notification -->
    <div v-else-if="hasBudget && difference >= 0" class="alert alert-success budget-alert" role="status">
      <svg class="budget-alert-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <div class="budget-alert-content">
        <strong class="budget-alert-title">Sesuai anggaran harian</strong>
        <p class="budget-alert-text">Perkiraan sisa hemat <strong>{{ formatRupiah(difference) }}</strong> per hari.</p>
      </div>
    </div>

    <p v-else class="muted budget-note">Biaya dapat berbeda menurut daerah dan harga pasar. Simpan anggaran harian untuk membandingkan biaya menu.</p>

    <p v-if="errorText" class="alert alert-error" role="alert">{{ errorText }}</p>
    <p v-if="successText" class="alert alert-success" role="status">{{ successText }}</p>
  </section>
</template>

<style scoped>
.budget-panel {
  margin: 20px 0;
  padding: 24px;
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-card);
  background: var(--neutral-50);
}

.budget-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.budget-heading h3 {
  margin: 6px 0 0;
  font-size: 26px;
  font-weight: 800;
  color: var(--primary-700);
}

.budget-heading h3 span {
  color: var(--neutral-500);
  font-size: 14px;
  font-weight: 500;
}

.budget-divider {
  height: 1px;
  background: var(--neutral-200);
  margin: 20px 0;
}

.budget-form {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
}

.budget-field {
  flex: 1;
  margin: 0;
}

.budget-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-prefix {
  position: absolute;
  left: 14px;
  color: var(--neutral-500);
  font-size: 15px;
  font-weight: 600;
}

.budget-input {
  padding-left: 42px;
}

.budget-save-btn {
  flex: 0 0 auto;
  min-height: 48px;
  padding: 0 20px;
}

/* Alert styling for over/within budget */
.budget-alert {
  margin-top: 18px;
  margin-bottom: 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 12px;
}

.budget-alert-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  margin-top: 2px;
}

.budget-alert-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.budget-alert-title {
  font-size: 16px;
  font-weight: 700;
}

.budget-alert-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
}

.budget-note {
  margin: 16px 0 0;
  font-size: 14px;
}

@media (max-width: 600px) {
  .budget-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .budget-form {
    flex-direction: column;
    align-items: stretch;
  }

  .budget-save-btn {
    width: 100%;
  }
}
</style>
