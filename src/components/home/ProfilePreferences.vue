<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import type { RootState } from '../../store'

const INGREDIENTS = [
  { value: 'ayam', label: 'Ayam' },
  { value: 'ikan', label: 'Ikan' },
  { value: 'telur', label: 'Telur' },
  { value: 'tempe', label: 'Tempe' },
  { value: 'tahu', label: 'Tahu' },
  { value: 'susu', label: 'Susu' },
  { value: 'kacang', label: 'Kacang' },
  { value: 'oat', label: 'Oat' },
  { value: 'sayur', label: 'Sayur' },
]

const store = useStore<RootState>()
const preferences = computed(() => store.state.user.preferences)
const profile = computed(() => store.state.user.profile)
const favoriteIngredients = ref<string[]>([])
const excludedIngredients = ref<string[]>([])
const saving = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

watch(preferences, (value) => {
  favoriteIngredients.value = [...value.favoriteIngredients]
  excludedIngredients.value = [...value.excludedIngredients]
}, { immediate: true, deep: true })

function valueFor(ingredient: string): string {
  if (favoriteIngredients.value.includes(ingredient)) return 'favorite'
  if (excludedIngredients.value.includes(ingredient)) return 'exclude'
  return ''
}

function updateIngredient(ingredient: string, event: Event) {
  const select = event.target
  if (!(select instanceof HTMLSelectElement)) return
  favoriteIngredients.value = favoriteIngredients.value.filter((item) => item !== ingredient)
  excludedIngredients.value = excludedIngredients.value.filter((item) => item !== ingredient)
  if (select.value === 'favorite') favoriteIngredients.value.push(ingredient)
  if (select.value === 'exclude') excludedIngredients.value.push(ingredient)
  message.value = null
}

async function save() {
  saving.value = true
  message.value = null
  try {
    await store.dispatch('user/savePreferences', {
      ...preferences.value,
      favoriteIngredients: favoriteIngredients.value,
      excludedIngredients: excludedIngredients.value,
    })
    message.value = { type: 'success', text: 'Preferensi makanan tersimpan di profil kamu.' }
  } catch {
    message.value = { type: 'error', text: 'Preferensi belum tersimpan. Periksa koneksi dan pengaturan Firebase.' }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="card preferences-card">
    <div class="preferences-heading">
      <div>
        <span class="eyebrow">Profil & preferensi</span>
        <h2>Sesuaikan pilihan makanan</h2>
        <p class="muted">Pilih bahan yang kamu suka atau ingin hindari. Profil tubuh dan tujuan diatur lewat kalkulator.</p>
      </div>
      <RouterLink to="/#kalkulator" class="profile-link">{{ profile ? 'Ubah profil tubuh' : 'Lengkapi profil tubuh' }} <span aria-hidden="true">&rarr;</span></RouterLink>
    </div>

    <div class="ingredient-list">
      <label v-for="ingredient in INGREDIENTS" :key="ingredient.value" class="ingredient-row">
        <span>{{ ingredient.label }}</span>
        <select class="input" :value="valueFor(ingredient.value)" :aria-label="`Preferensi ${ingredient.label}`" @change="updateIngredient(ingredient.value, $event)">
          <option value="">Netral</option>
          <option value="favorite">Saya suka</option>
          <option value="exclude">Hindari</option>
        </select>
      </label>
    </div>

    <div class="preferences-footer">
      <p v-if="message" class="alert" :class="message.type === 'success' ? 'alert-success' : 'alert-error'" role="status">{{ message.text }}</p>
      <button type="button" class="btn btn-primary" :disabled="saving" @click="save">{{ saving ? 'Menyimpan...' : 'Simpan preferensi' }}</button>
    </div>
  </section>
</template>

<style scoped>
.preferences-heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; margin-bottom: 20px; }
.preferences-heading .eyebrow { margin-bottom: 10px; }
.preferences-heading h2 { margin: 0 0 8px; font-size: 24px; }
.preferences-heading p { max-width: 640px; margin: 0; font-size: 14px; }
.profile-link { flex: 0 0 auto; font-size: 14px; }
.ingredient-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px 16px; }
.ingredient-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0; padding: 8px 0; border-bottom: 1px solid var(--neutral-200); font-size: 14px; font-weight: 600; }
.ingredient-row .input { min-height: 42px; max-width: 150px; padding: 0 10px; font-size: 13px; }
.preferences-footer { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-top: 20px; }
.preferences-footer .alert { margin: 0; }

@media (max-width: 760px) {
  .ingredient-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .preferences-heading, .preferences-footer { align-items: stretch; flex-direction: column; }
  .ingredient-list { grid-template-columns: 1fr; }
  .ingredient-row .input { width: 150px; }
}
</style>