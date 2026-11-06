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
  <section class="budget-panel" aria-labelledby="budget-title">
    <div class="budget-heading">
      <div><span class="field-label">Perkiraan biaya menu</span><h3 id="budget-title">{{ formatRupiah(props.estimatedCost) }} <span>/ hari</span></h3></div>
      <span class="badge">Harga perkiraan</span>
    </div>
    <form class="budget-form" novalidate @submit.prevent="saveBudget">
      <div class="field">
        <label for="daily-food-budget">Anggaran makan kamu per hari</label>
        <div class="budget-input-wrap"><span>Rp</span><input id="daily-food-budget" v-model="budgetInput" class="input" type="number" min="5000" max="1000000" step="1000" inputmode="numeric" placeholder="Contoh: 40000" /></div>
      </div>
      <button type="submit" class="btn btn-outline" :disabled="saving">{{ saving ? 'Menyimpan...' : 'Simpan anggaran' }}</button>
    </form>
    <p v-if="hasBudget" class="budget-comparison" :class="difference >= 0 ? 'within-budget' : 'over-budget'">
      {{ difference >= 0 ? `Perkiraan sisa ${formatRupiah(difference)}.` : `Menu sekitar ${formatRupiah(Math.abs(difference))} di atas anggaran.` }}
      Sesuaikan pilihan bahan atau porsi sesuai kebutuhan.
    </p>
    <p v-else class="muted budget-note">Biaya dapat berbeda menurut daerah dan harga pasar. Simpan anggaran untuk membandingkan menu.</p>
    <p v-if="errorText" class="alert alert-error" role="alert">{{ errorText }}</p>
    <p v-if="successText" class="alert alert-success" role="status">{{ successText }}</p>
  </section>
</template>

<style scoped>
.budget-panel { margin: 16px 0 8px; padding: 16px; border: 1px solid var(--neutral-200); border-radius: 8px; background: var(--neutral-50); }
.budget-heading, .budget-form { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.budget-heading h3 { margin: 4px 0 0; font-size: 22px; color: var(--primary-700); }
.budget-heading h3 span { color: var(--neutral-500); font-size: 13px; font-weight: 500; }
.budget-form { align-items: flex-end; margin-top: 14px; }
.budget-form .field { flex: 1; margin: 0; }
.budget-input-wrap { position: relative; }
.budget-input-wrap > span { position: absolute; top: 12px; left: 13px; color: var(--neutral-500); font-size: 14px; }
.budget-input-wrap .input { padding-left: 38px; }
.budget-form .btn { flex: 0 0 auto; min-height: 48px; padding: 0 16px; }
.budget-comparison, .budget-note { margin: 12px 0 0; font-size: 13px; }
.within-budget { color: var(--success-700); }
.over-budget { color: var(--warning-700); }
.budget-panel .alert { margin: 12px 0 0; padding: 10px 12px; font-size: 13px; }

@media (max-width: 520px) {
  .budget-heading { align-items: flex-start; }
  .budget-form { align-items: stretch; flex-direction: column; }
  .budget-form .btn { width: 100%; }
}
</style>