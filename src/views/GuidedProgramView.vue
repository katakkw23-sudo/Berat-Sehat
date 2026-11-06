<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { calculateCalorieResult, type Goal } from '../lib/calculator'
import MealBudget from '../components/calculator/MealBudget.vue'
import {
  dailyMenus,
  estimateRecipeCost,
  findMealRecipe,
  getMealAlternatives,
  getTrainingDay,
  mealFavoriteId,
  resolveMealFavorite,
  trainingProgramNames,
} from '../data/guidedPlans'
import type { RootState } from '../store'

interface SavedProgram {
  goal: Goal
  programIndex: number
  durationDays: number
  currentDay: number
  completed: Record<number, string[]>
  mealOverrides?: Record<number, Record<string, string>>
}

const STORAGE_KEY = 'beratsehat-guided-program-v1'
const route = useRoute()
const store = useStore<RootState>()
const goals: { value: Goal; label: string }[] = [
  { value: 'loss', label: 'Turun berat badan' },
  { value: 'gain', label: 'Naik berat badan' },
]
const goal = ref<Goal>(route.query.target === 'Naik BB' ? 'gain' : 'loss')
const durationDays = ref(14)
const selectedProgramIndex = ref(0)
const activeProgram = ref<SavedProgram | null>(null)
const profile = computed(() => store.state.user.profile)
const preferences = computed(() => store.state.user.preferences)
const favoriteIds = computed(() => store.state.user.favorites)
const favoriteMeals = computed(() => favoriteIds.value.flatMap((id) => {
  const favorite = resolveMealFavorite(id)
  return favorite ? [{ id, ...favorite }] : []
}))
const alternativeOpen = ref<string[]>([])
const savingFavorite = ref<string | null>(null)
const favoriteError = ref('')
const recommendation = computed(() => profile.value
  ? calculateCalorieResult({ ...profile.value, goal: goal.value })
  : null)
const activeRecommendation = computed(() => activeProgram.value && profile.value
  ? calculateCalorieResult({ ...profile.value, goal: activeProgram.value.goal })
  : null)
const activeMenu = computed(() => {
  if (!activeProgram.value) return null
  const { goal: activeGoal, currentDay } = activeProgram.value
  const menu = dailyMenus[activeGoal][(currentDay - 1) % 10]
  const overrides = activeProgram.value.mealOverrides?.[currentDay] ?? {}
  const meals = menu.meals.map((meal) => ({
    ...meal,
    recipe: overrides[meal.id]
      ? findMealRecipe(activeGoal, meal.id, overrides[meal.id]) ?? meal.recipe
      : meal.recipe,
  }))
  return {
    ...menu,
    meals,
    calories: meals.reduce((total, meal) => total + meal.recipe.calories, 0),
    estimatedCost: meals.reduce((total, meal) => total + estimateRecipeCost(activeGoal, meal.id, meal.recipe), 0),
  }
})
const activeTraining = computed(() => activeProgram.value
  ? getTrainingDay(
    activeProgram.value.goal,
    activeProgram.value.currentDay - 1,
    activeProgram.value.programIndex,
    profile.value?.activity ?? 'sedentary',
  )
  : null)
const abilityGuide = computed(() => {
  if (!profile.value) return 'Profil belum tersedia; volume latihan dimulai dari versi ringan.'
  if (profile.value.activity === 'sedentary') return 'Versi ringan: jumlah set dikurangi dan jeda istirahat diperpanjang.'
  if (profile.value.activity === 'active') return 'Volume tetap bertahap; utamakan teknik dan pemulihan sebelum menambah beban.'
  return 'Volume pemula mengikuti aktivitas profil kamu. Tambah beban hanya bila gerakan terasa nyaman.'
})
const taskItems = computed(() => [
  ...(activeMenu.value?.meals.map((meal) => ({ id: meal.id, label: meal.label })) ?? []),
  { id: 'training', label: activeTraining.value?.exercises.length ? 'Selesaikan latihan hari ini' : 'Selesaikan waktu istirahat atau peregangan' },
])
const completedToday = computed(() => activeProgram.value?.completed[activeProgram.value.currentDay] ?? [])
const todayProgress = computed(() => taskItems.value.length
  ? Math.round((completedToday.value.length / taskItems.value.length) * 100)
  : 0)
const isDayComplete = computed(() => taskItems.value.every((task) => completedToday.value.includes(task.id)))
const isFinished = computed(() => !!activeProgram.value && activeProgram.value.currentDay > activeProgram.value.durationDays)
const overallProgress = computed(() => {
  if (!activeProgram.value) return 0
  if (isFinished.value) return 100
  return Math.round(((activeProgram.value.currentDay - 1 + todayProgress.value / 100) / activeProgram.value.durationDays) * 100)
})
const selectedProgramName = computed(() => activeProgram.value
  ? trainingProgramNames[activeProgram.value.goal][activeProgram.value.programIndex]
  : '')

function saveProgress() {
  if (!activeProgram.value) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeProgram.value))
  } catch {
    return
  }
}

onMounted(() => {
  store.dispatch('user/load').catch(() => undefined)
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    const parsed = JSON.parse(saved) as SavedProgram
    if (
      (parsed.goal === 'gain' || parsed.goal === 'loss') &&
      Number.isInteger(parsed.programIndex) && parsed.programIndex >= 0 && parsed.programIndex < 10 &&
      Number.isInteger(parsed.durationDays) && parsed.durationDays >= 7 && parsed.durationDays <= 30 &&
      Number.isInteger(parsed.currentDay) && parsed.currentDay > 0 &&
      parsed.completed && typeof parsed.completed === 'object'
    ) {
      activeProgram.value = { ...parsed, mealOverrides: parsed.mealOverrides ?? {} }
    }
  } catch {
    activeProgram.value = null
  }
})

function startProgram() {
  const normalizedDuration = Math.min(30, Math.max(7, Math.round(Number(durationDays.value) || 14)))
  activeProgram.value = {
    goal: goal.value,
    programIndex: selectedProgramIndex.value,
    durationDays: normalizedDuration,
    currentDay: 1,
    completed: {},
    mealOverrides: {},
  }
  durationDays.value = normalizedDuration
  saveProgress()
}

function toggleTask(id: string) {
  if (!activeProgram.value || isFinished.value) return
  const day = activeProgram.value.currentDay
  const completed = activeProgram.value.completed[day] ?? []
  const next = completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id]
  activeProgram.value = {
    ...activeProgram.value,
    completed: { ...activeProgram.value.completed, [day]: next },
  }
  saveProgress()
}

function nextDay() {
  if (!activeProgram.value || !isDayComplete.value) return
  activeProgram.value = { ...activeProgram.value, currentDay: activeProgram.value.currentDay + 1 }
  saveProgress()
}

function restartProgram() {
  if (!activeProgram.value) return
  activeProgram.value = { ...activeProgram.value, currentDay: 1, completed: {} }
  saveProgress()
}

function mealIsFavorite(goal: Goal, mealId: string, recipeName: string): boolean {
  return favoriteIds.value.includes(mealFavoriteId(goal, mealId, recipeName))
}

function alternativesFor(mealId: string, recipeName: string) {
  if (!activeProgram.value) return []
  return getMealAlternatives(
    activeProgram.value.goal,
    mealId,
    recipeName,
    preferences.value.favoriteIngredients,
    preferences.value.excludedIngredients,
  )
}

function hasExcludedIngredient(recipeName: string, mealId: string): boolean {
  if (!activeProgram.value) return false
  const recipe = findMealRecipe(activeProgram.value.goal, mealId, recipeName)
  return !!recipe && preferences.value.excludedIngredients.some((ingredient) =>
    recipe.ingredients.some((item) => item.toLowerCase().includes(ingredient.toLowerCase())),
  )
}

function toggleAlternatives(mealId: string) {
  alternativeOpen.value = alternativeOpen.value.includes(mealId)
    ? alternativeOpen.value.filter((id) => id !== mealId)
    : [...alternativeOpen.value, mealId]
}

function chooseAlternative(mealId: string, event: Event) {
  if (!activeProgram.value || !(event.target instanceof HTMLSelectElement)) return
  const recipeName = event.target.value
  if (!alternativesFor(mealId, activeMenu.value?.meals.find((meal) => meal.id === mealId)?.recipe.name ?? '')
    .some((recipe) => recipe.name === recipeName)) return
  const day = activeProgram.value.currentDay
  activeProgram.value = {
    ...activeProgram.value,
    mealOverrides: {
      ...activeProgram.value.mealOverrides,
      [day]: { ...activeProgram.value.mealOverrides?.[day], [mealId]: recipeName },
    },
  }
  saveProgress()
}

async function toggleRecipeFavorite(goal: Goal, mealId: string, recipeName: string) {
  const favoriteId = mealFavoriteId(goal, mealId, recipeName)
  savingFavorite.value = favoriteId
  favoriteError.value = ''
  try {
    await store.dispatch('user/toggleFavorite', favoriteId)
  } catch {
    favoriteError.value = 'Menu favorit belum tersimpan. Periksa koneksi dan pengaturan Firebase.'
  } finally {
    savingFavorite.value = null
  }
}
</script>

<template>
  <section class="section program-section">
    <div class="container program-page">
      <header class="program-page-head">
        <span class="eyebrow">Program terpandu</span>
        <h1 v-if="!activeProgram">Pilih program yang sesuai tujuanmu</h1>
        <p v-if="!activeProgram">Tentukan target dan durasi. Menu serta latihan harian akan disusun untukmu.</p>
      </header>

      <template v-if="activeProgram && !isFinished">
        <section class="card active-header">
          <div class="active-title">
            <div>
              <span class="badge">{{ activeProgram.goal === 'gain' ? 'Naik berat badan' : 'Turun berat badan' }}</span>
              <h1>{{ selectedProgramName }}</h1>
              <p class="muted">Hari {{ activeProgram.currentDay }} dari {{ activeProgram.durationDays }} · {{ activeTraining?.title }}</p>
            </div>
            <button type="button" class="btn btn-outline" @click="activeProgram = null">Ubah program</button>
          </div>
          <div class="progress-label"><strong>Progres program</strong><span>{{ overallProgress }}%</span></div>
          <div class="progress-track" role="progressbar" aria-label="Progres program" :aria-valuenow="overallProgress" aria-valuemin="0" aria-valuemax="100">
            <span :style="{ width: `${overallProgress}%` }"></span>
          </div>
          <p v-if="activeRecommendation?.targetKcal !== null && activeRecommendation" class="calorie-note">
            Estimasi kebutuhan dari profil tersimpan: <strong>{{ activeRecommendation.targetKcal.toLocaleString('id-ID') }} kkal/hari</strong>.
            Menu harian adalah contoh, sesuaikan porsi dengan kebutuhanmu.
          </p>
          <p v-else class="muted calorie-note">
            Target kalori pribadi belum tersedia. Lengkapi profil di <RouterLink to="/#kalkulator">kalkulator Beranda</RouterLink>.
            Jangan menjalankan pembatasan makan ekstrem.
          </p>
        </section>

        <div class="daily-grid">
          <div class="daily-content">
            <section class="card menu-card">
              <figure class="plan-photo">
                <img
                  :src="activeProgram.goal === 'gain'
                    ? 'https://images.pexels.com/photos/34463118/pexels-photo-34463118.jpeg?auto=compress&cs=tinysrgb&w=1100'
                    : 'https://images.pexels.com/photos/36982092/pexels-photo-36982092.jpeg?auto=compress&cs=tinysrgb&w=1100'"
                  :alt="activeProgram.goal === 'gain' ? 'Menu lokal bernutrisi untuk dukung kenaikan berat badan' : 'Menu seimbang dengan bahan segar untuk pilihan makan harian'"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Inspirasi makan dari bahan lokal</figcaption>
              </figure>
              <div class="panel-title">
                <div><span class="field-label">Menu hari {{ activeProgram.currentDay }}</span><h2>{{ activeMenu?.title }}</h2></div>
                <span class="badge">~{{ activeMenu?.calories.toLocaleString('id-ID') }} kkal</span>
              </div>
              <p class="muted estimate-note">Perkiraan dari bahan dan takaran yang tercantum, bukan target kalori pribadi.</p>
              <MealBudget v-if="activeMenu" :estimated-cost="activeMenu.estimatedCost" />
              <article v-for="meal in activeMenu?.meals" :key="meal.id" class="meal">
                <div class="meal-heading">
                  <div><h3>{{ meal.label }}</h3><span>~{{ meal.recipe.calories }} kkal</span></div>
                  <div class="meal-actions">
                    <button type="button" class="meal-action" :aria-pressed="mealIsFavorite(activeProgram.goal, meal.id, meal.recipe.name)" :disabled="savingFavorite === mealFavoriteId(activeProgram.goal, meal.id, meal.recipe.name)" @click="toggleRecipeFavorite(activeProgram.goal, meal.id, meal.recipe.name)">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.7c0 4.1-8.8 10-8.8 10S3.2 12.8 3.2 8.7A4.2 4.2 0 0 1 11 6.4l1 1 1-1a4.2 4.2 0 0 1 7.8 2.3Z" /></svg>
                      {{ mealIsFavorite(activeProgram.goal, meal.id, meal.recipe.name) ? 'Tersimpan' : 'Favorit' }}
                    </button>
                    <button type="button" class="meal-action alternative-toggle" :aria-expanded="alternativeOpen.includes(meal.id)" @click="toggleAlternatives(meal.id)">Alternatif</button>
                  </div>
                </div>
                <p v-if="hasExcludedIngredient(meal.recipe.name, meal.id)" class="preference-warning">Menu ini mengandung bahan yang kamu tandai untuk dihindari.</p>
                <strong>{{ meal.recipe.name }}</strong>
                <div v-if="alternativeOpen.includes(meal.id)" class="alternative-panel">
                  <label :for="`alternative-${meal.id}`">Pilih pengganti untuk {{ meal.label.toLowerCase() }}</label>
                  <select :id="`alternative-${meal.id}`" class="input" :value="meal.recipe.name" @change="chooseAlternative(meal.id, $event)">
                    <option :value="meal.recipe.name">{{ meal.recipe.name }} (menu saat ini)</option>
                    <option v-for="recipe in alternativesFor(meal.id, meal.recipe.name)" :key="recipe.name" :value="recipe.name">{{ recipe.name }} · ~{{ recipe.calories }} kkal</option>
                  </select>
                  <span v-if="!alternativesFor(meal.id, meal.recipe.name).length" class="muted">Tidak ada alternatif yang cocok dengan bahan pilihan. Ubah preferensi di Beranda.</span>
                </div>
                <p class="meal-label">Bahan dan takaran</p>
                <ul><li v-for="ingredient in meal.recipe.ingredients" :key="ingredient">{{ ingredient }}</li></ul>
                <p class="meal-method"><strong>Cara membuat:</strong> {{ meal.recipe.method }}</p>
              </article>
              <p v-if="favoriteError" class="alert alert-error" role="alert">{{ favoriteError }}</p>
            </section>

            <section class="card workout-card">
              <figure class="plan-photo">
                <img
                  :src="activeProgram.goal === 'gain'
                    ? 'https://images.pexels.com/photos/8032970/pexels-photo-8032970.jpeg?auto=compress&cs=tinysrgb&w=1100'
                    : 'https://images.pexels.com/photos/23224739/pexels-photo-23224739.jpeg?auto=compress&cs=tinysrgb&w=1100'"
                  :alt="activeProgram.goal === 'gain' ? 'Latihan kekuatan dengan gerakan pemula' : 'Aktivitas kebugaran ringan untuk pemula'"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Gerak nyaman, bertahap, dan terarah</figcaption>
              </figure>
              <div class="panel-title">
                <div><span class="field-label">Latihan</span><h2>{{ activeTraining?.title }}</h2></div>
                <span class="badge">{{ activeTraining?.duration }}</span>
              </div>
              <p class="muted">{{ activeTraining?.type }}. {{ abilityGuide }} Pemanasan ringan 3-5 menit sebelum mulai.</p>
              <article v-if="activeTraining?.exercises.length" v-for="exercise in activeTraining.exercises" :key="exercise.name" class="exercise">
                <h3>{{ exercise.name }}</h3>
                <dl><div><dt>Durasi</dt><dd>{{ exercise.duration }}</dd></div><div><dt>Set</dt><dd>{{ exercise.sets }}</dd></div><div><dt>Repetisi</dt><dd>{{ exercise.reps }}</dd></div><div><dt>Istirahat</dt><dd>{{ exercise.rest }}</dd></div></dl>
                <p>{{ exercise.guide }}</p>
              </article>
              <p v-else class="rest-note">Hari ini untuk pemulihan. Istirahat membantu tubuh pulih; peregangan lembut boleh dilakukan bila terasa nyaman.</p>
              <p class="safety-note">Hentikan latihan bila terasa nyeri, pusing, atau sesak yang tidak biasa.</p>
            </section>
          </div>

          <aside class="card checklist-card">
            <span class="field-label">Checklist hari ini</span>
            <div class="progress-label"><strong>{{ completedToday.length }} dari {{ taskItems.length }} selesai</strong><span>{{ todayProgress }}%</span></div>
            <div class="progress-track" role="progressbar" aria-label="Progres hari ini" :aria-valuenow="todayProgress" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${todayProgress}%` }"></span></div>
            <label v-for="task in taskItems" :key="task.id" class="check-item" :class="{ done: completedToday.includes(task.id) }">
              <input type="checkbox" :checked="completedToday.includes(task.id)" @change="toggleTask(task.id)" />
              <span>{{ task.label }}</span>
            </label>
            <button type="button" class="btn btn-primary btn-block next-button" :disabled="!isDayComplete" @click="nextDay">
              {{ activeProgram.currentDay === activeProgram.durationDays ? 'Selesaikan program' : 'Hari Berikutnya' }}
            </button>
            <p v-if="!isDayComplete" class="muted helper-text">Selesaikan checklist untuk membuka hari berikutnya.</p>
          </aside>
        </div>
      </template>

      <section v-else-if="isFinished" class="card finished-state">
        <span class="eyebrow">Program selesai</span>
        <h1>Kamu sudah menyelesaikan {{ activeProgram?.durationDays }} hari</h1>
        <p class="muted">Lanjutkan kebiasaan yang terasa cocok. Progres tersimpan di perangkat ini.</p>
        <div class="finish-actions">
          <button type="button" class="btn btn-primary" @click="restartProgram">Mulai lagi</button>
          <button type="button" class="btn btn-outline" @click="activeProgram = null">Pilih program lain</button>
        </div>
      </section>

      <section v-else>
        <div class="card setup-card">
          <div class="field">
            <span class="field-label">Pilih tujuan</span>
            <div class="goal-tabs" role="group" aria-label="Pilih tujuan program">
              <button v-for="option in goals" :key="option.value" type="button" class="chip" :class="{ active: goal === option.value }" :aria-pressed="goal === option.value" @click="goal = option.value; selectedProgramIndex = 0">{{ option.label }}</button>
            </div>
          </div>
          <div class="field duration-field">
            <label for="program-duration">Durasi program</label>
            <div class="duration-control"><input id="program-duration" v-model.number="durationDays" class="input" type="number" min="7" max="30" step="1" /><span>hari (7-30)</span></div>
          </div>
          <div v-if="recommendation?.targetKcal !== null && recommendation" class="profile-summary">
            <strong>Rekomendasi berdasarkan profil kamu</strong>
            <p>{{ profile?.age }} tahun · {{ profile?.heightCm }} cm · {{ profile?.weightKg }} kg · aktivitas {{ profile?.activity }}</p>
            <p>Estimasi target {{ goal === 'gain' ? 'naik' : 'turun' }} berat badan: <strong>{{ recommendation.targetKcal.toLocaleString('id-ID') }} kkal/hari</strong>.</p>
            <span class="muted">Angka ini estimasi dari usia, tinggi, berat, aktivitas, dan tujuan. Evaluasi perubahan secara bertahap.</span>
          </div>
          <div v-else class="alert alert-warning profile-warning">
            {{ profile ? 'Target kalori untuk tujuan ini perlu ditinjau tenaga kesehatan. Program tetap dapat dipakai untuk kebiasaan umum tanpa target kalori pribadi.' : 'Simpan profil di kalkulator Beranda agar rekomendasi mempertimbangkan usia, tinggi, berat, aktivitas, dan tujuan.' }}
          </div>
        </div>

        <div class="program-grid">
          <button v-for="(name, index) in trainingProgramNames[goal]" :key="name" type="button" class="card program-option" :class="{ selected: selectedProgramIndex === index }" :aria-pressed="selectedProgramIndex === index" @click="selectedProgramIndex = index">
            <span class="program-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <strong>{{ name }}</strong>
            <span class="muted">{{ index % 3 === 1 ? 'Gerak bertahap dengan pilihan ringan' : index % 3 === 2 ? 'Latihan dan pemulihan seimbang' : 'Cocok untuk mulai dari rumah' }}</span>
          </button>
        </div>
        <div class="start-row">
          <p class="muted">Menu memakai bahan lokal sederhana. Kalori tiap menu adalah perkiraan, bukan resep medis.</p>
          <button type="button" class="btn btn-primary" :disabled="durationDays < 7 || durationDays > 30" @click="startProgram">Mulai program</button>
        </div>
      </section>

      <section v-if="favoriteMeals.length" class="card favorites-panel">
        <div class="panel-title"><div><span class="field-label">Koleksi kamu</span><h2>Menu favorit</h2></div><span class="badge">{{ favoriteMeals.length }} menu</span></div>
        <div class="favorite-list">
          <article v-for="favorite in favoriteMeals" :key="favorite.id" class="favorite-item">
            <div class="favorite-copy">
              <span class="badge">{{ favorite.goal === 'gain' ? 'Naik BB' : 'Turun BB' }}</span>
              <h3>{{ favorite.recipe.name }}</h3>
              <p class="muted">~{{ favorite.recipe.calories }} kkal · {{ favorite.recipe.ingredients.slice(0, 3).join(', ') }}</p>
              <details class="favorite-details">
                <summary>Lihat bahan dan cara membuat</summary>
                <ul><li v-for="ingredient in favorite.recipe.ingredients" :key="ingredient">{{ ingredient }}</li></ul>
                <p>{{ favorite.recipe.method }}</p>
              </details>
            </div>
            <button type="button" class="meal-action" :disabled="savingFavorite === favorite.id" @click="toggleRecipeFavorite(favorite.goal, favorite.mealId, favorite.recipe.name)">Hapus favorit</button>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.program-page { max-width: 1180px; }
.program-section { padding-top: 30px; }
.program-page-head { margin-bottom: 18px; }
.program-page-head .eyebrow { margin-bottom: 10px; }
.program-page-head h1 { max-width: 760px; margin: 0 0 8px; font-size: 34px; }
.program-page-head p { max-width: 640px; margin: 0; color: var(--neutral-500); }
.active-header { margin-bottom: 18px; padding: 20px 22px; }
.active-title, .panel-title, .meal-heading, .progress-label, .start-row, .finish-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.active-title { align-items: center; margin-bottom: 16px; }
.active-title h1, .panel-title h2 { margin: 8px 0 4px; font-size: 22px; }
.active-title p { margin: 0; }
.progress-label { margin-bottom: 8px; font-size: 14px; }
.progress-track { height: 10px; overflow: hidden; border-radius: 999px; background: var(--neutral-200); }
.progress-track span { display: block; height: 100%; border-radius: inherit; background: var(--primary-600); transition: width 0.2s ease; }
.calorie-note { margin: 12px 0 0; font-size: 13px; }
.daily-grid { display: grid; align-items: start; gap: 24px; }
.daily-content { display: grid; gap: 24px; min-width: 0; }
.menu-card, .workout-card { min-width: 0; }
.plan-photo { position: relative; height: 184px; overflow: hidden; margin: -24px -24px 22px; border-radius: var(--radius) var(--radius) 0 0; background: var(--primary-50); }
.plan-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.plan-photo figcaption { position: absolute; right: 12px; bottom: 12px; max-width: calc(100% - 24px); padding: 7px 11px; border-radius: 6px; background: rgba(24, 35, 28, 0.78); color: white; font-size: 12px; }
.panel-title { align-items: flex-start; }
.panel-title h2 { margin-bottom: 0; }
.estimate-note { font-size: 13px; margin: 12px 0; }
.meal { padding: 18px 0; border-top: 1px solid var(--neutral-200); }
.meal-heading { align-items: flex-start; }
.meal-heading h3, .exercise h3 { margin: 0; font-size: 17px; }
.meal-heading > div:first-child > span { display: inline-block; margin-top: 4px; color: var(--neutral-500); font-size: 13px; }
.meal-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
.meal-action { display: inline-flex; min-height: 36px; align-items: center; justify-content: center; gap: 5px; padding: 0 10px; border: 1px solid var(--neutral-200); border-radius: 999px; background: var(--neutral-0); color: var(--neutral-700); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.meal-action:hover, .meal-action[aria-pressed="true"] { border-color: var(--primary-600); color: var(--primary-700); background: var(--primary-50); }
.meal-action:disabled { opacity: 0.6; cursor: wait; }
.meal-action svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.meal-action[aria-pressed="true"] svg { fill: currentColor; }
.alternative-panel { display: grid; gap: 7px; margin: 12px 0; font-size: 13px; }
.alternative-panel .input { min-height: 44px; padding: 0 12px; font-size: 14px; }
.preference-warning { margin: 8px 0; padding: 8px 10px; border-radius: 6px; background: var(--warning-50); color: var(--warning-700); font-size: 12px; }
.meal > strong { display: block; margin-top: 8px; }
.meal-label { margin: 10px 0 4px; color: var(--neutral-700); font-size: 13px; font-weight: 600; }
.meal ul { margin: 0; padding-left: 20px; color: var(--neutral-700); font-size: 14px; }
.meal-method, .exercise p { margin: 10px 0 0; font-size: 14px; }
.workout-card > p { margin: 12px 0 18px; }
.exercise { border-top: 1px solid var(--neutral-200); padding: 16px 0; }
.exercise dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 12px 0 0; }
.exercise dl div { background: var(--neutral-50); padding: 9px 10px; border-radius: 6px; }
.exercise dt { color: var(--neutral-500); font-size: 12px; }
.exercise dd { margin: 2px 0 0; font-size: 14px; font-weight: 600; }
.rest-note { padding: 16px; background: var(--secondary-50); border-radius: 8px; }
.workout-card .safety-note { margin: 8px 0 0; color: var(--warning-700); font-size: 13px; }
.checklist-card { position: sticky; top: 88px; }
.checklist-card > .field-label { display: block; margin-bottom: 16px; }
.check-item { display: flex; align-items: center; gap: 12px; min-height: 52px; border-bottom: 1px solid var(--neutral-200); cursor: pointer; font-size: 14px; }
.check-item input { width: 20px; height: 20px; accent-color: var(--primary-600); flex: 0 0 auto; }
.check-item.done span { color: var(--neutral-500); text-decoration: line-through; }
.next-button { margin-top: 20px; }
.helper-text { margin: 10px 0 0; font-size: 13px; text-align: center; }
.setup-card { margin-bottom: 24px; }
.setup-card .field:last-child { margin-bottom: 0; }
.goal-tabs { display: flex; flex-wrap: wrap; gap: 8px; }
.duration-control { display: flex; align-items: center; gap: 12px; max-width: 280px; }
.duration-control .input { max-width: 120px; }
.duration-control span { color: var(--neutral-500); font-size: 14px; }
.profile-summary { border-top: 1px solid var(--neutral-200); padding-top: 16px; font-size: 14px; }
.profile-summary p { margin: 6px 0; }
.profile-warning { margin: 16px 0 0; }
.program-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
.program-option { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; min-height: 132px; text-align: left; color: var(--neutral-900); font: inherit; cursor: pointer; transition: border-color 0.2s ease, background-color 0.2s ease; }
.program-option:hover, .program-option.selected { border-color: var(--primary-600); background: var(--primary-50); }
.program-option strong { padding-right: 32px; }
.program-option .muted { font-size: 13px; }
.program-number { position: absolute; top: 18px; right: 18px; color: var(--primary-700); font-size: 14px; font-weight: 700; }
.start-row { align-items: flex-start; margin-top: 20px; }
.start-row p { max-width: 560px; margin: 0; font-size: 14px; }
.finished-state { max-width: 680px; margin: 0 auto; }
.finished-state h1 { margin-bottom: 12px; font-size: 28px; }
.finish-actions { justify-content: flex-start; flex-wrap: wrap; }
.favorites-panel { margin-top: 24px; }
.favorites-panel .panel-title { margin-bottom: 16px; }
.favorite-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.favorite-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0; padding: 14px; border: 1px solid var(--neutral-200); border-radius: 8px; }
.favorite-item h3 { margin: 8px 0 4px; font-size: 16px; }
.favorite-item p { margin: 0; font-size: 12px; }
.favorite-copy { min-width: 0; }
.favorite-details { margin-top: 10px; font-size: 13px; }
.favorite-details summary { color: var(--primary-700); font-weight: 600; cursor: pointer; }
.favorite-details ul { margin: 8px 0; padding-left: 18px; color: var(--neutral-700); }
.favorite-details p { margin: 0; color: var(--neutral-700); font-size: 13px; }
.favorite-item .meal-action { flex: 0 0 auto; }

@media (min-width: 640px) {
  .program-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 900px) {
  .daily-grid { grid-template-columns: minmax(0, 1.7fr) minmax(270px, 0.8fr); }
  .program-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .program-section { padding-top: 22px; }
  .program-page-head { margin-bottom: 14px; }
  .program-page-head h1 { font-size: 28px; }
  .active-header { padding: 18px; }
  .active-title, .start-row { flex-direction: column; align-items: stretch; }
  .active-title { gap: 8px; }
  .active-title h1 { font-size: 20px; }
  .active-title .btn, .start-row .btn { width: 100%; }
  .panel-title { flex-direction: column; }
  .program-option { min-height: 116px; }
  .checklist-card { position: static; }
  .plan-photo { height: 150px; margin: -20px -20px 18px; }
  .meal-heading { flex-direction: column; }
  .meal-actions { justify-content: flex-start; }
  .favorite-list { grid-template-columns: 1fr; }
  .favorite-item { align-items: flex-start; flex-direction: column; }
}
</style>