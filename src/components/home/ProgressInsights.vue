<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { RootState } from '../../store'

const store = useStore<RootState>()
const tasks = computed(() => store.state.user.tasks)
const weights = computed(() => store.getters['user/sortedWeights'] as RootState['user']['weights'])
const goal = computed(() => store.state.user.profile?.goal)

function isoDate(offset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

function tasksForGoal(items: typeof tasks.value) {
  return items.filter((task) => task.program === undefined || task.program === goal.value)
}

function summarizeWeek(startOffset: number) {
  const days = Array.from({ length: 7 }, (_, index) => isoDate(startOffset + index))
  const entries = tasksForGoal(tasks.value).filter((task) => days.includes(task.date))
  const done = entries.filter((task) => task.done).length
  const completedDays = days.filter((date) => {
    const daily = entries.filter((task) => task.date === date)
    return daily.length > 0 && daily.every((task) => task.done)
  }).length
  return {
    done,
    total: entries.length,
    completedDays,
    completion: entries.length ? Math.round((done / entries.length) * 100) : 0,
  }
}

const thisWeek = computed(() => summarizeWeek(-6))
const previousWeek = computed(() => summarizeWeek(-13))
const checklistChange = computed(() => thisWeek.value.total && previousWeek.value.total
  ? thisWeek.value.completion - previousWeek.value.completion
  : null)
const thisWeekWeights = computed(() => weights.value.filter((entry) => entry.date >= isoDate(-6) && entry.date <= isoDate(0)))
const previousWeekWeights = computed(() => weights.value.filter((entry) => entry.date >= isoDate(-13) && entry.date <= isoDate(-7)))
const weightChange = computed(() => {
  if (!thisWeekWeights.value.length || !previousWeekWeights.value.length) return null
  const average = (entries: typeof weights.value) => entries.reduce((sum, entry) => sum + entry.weightKg, 0) / entries.length
  return Math.round((average(thisWeekWeights.value) - average(previousWeekWeights.value)) * 10) / 10
})
const completedDaysTotal = computed(() => {
  const relevant = tasksForGoal(tasks.value)
  const dates = [...new Set(relevant.map((task) => task.date))]
  return dates.filter((date) => {
    const daily = relevant.filter((task) => task.date === date)
    return daily.length > 0 && daily.every((task) => task.done)
  }).length
})
const badges = computed(() => [
  { id: 'first-task', name: 'Mulai Bergerak', detail: 'Selesaikan checklist pertamamu.', earned: tasks.value.some((task) => task.done) },
  { id: 'three-days', name: 'Tiga Hari Tuntas', detail: 'Selesaikan checklist penuh pada 3 hari.', earned: completedDaysTotal.value >= 3 },
  { id: 'week', name: 'Tujuh Hari Tuntas', detail: 'Selesaikan checklist penuh pada 7 hari.', earned: completedDaysTotal.value >= 7 },
  { id: 'first-weight', name: 'Catatan Pertama', detail: 'Simpan catatan berat badan pertama.', earned: weights.value.length >= 1 },
  { id: 'five-weights', name: 'Pantau Berkala', detail: 'Simpan 5 catatan berat badan.', earned: weights.value.length >= 5 },
])
const earnedBadges = computed(() => badges.value.filter((badge) => badge.earned).length)
const weeklyComment = computed(() => {
  if (!thisWeek.value.total) return 'Checklist harian akan membantu membentuk evaluasi pada minggu ini.'
  if (checklistChange.value === null) return `${thisWeek.value.completedDays} hari checklist selesai. Data minggu berikutnya akan memberi pembanding.`
  if (checklistChange.value > 0) return `Konsistensi checklist meningkat ${checklistChange.value} poin persentase dibanding minggu lalu.`
  if (checklistChange.value < 0) return `Progres checklist turun ${Math.abs(checklistChange.value)} poin persentase dari minggu lalu. Pilih satu kebiasaan kecil untuk dimulai lagi.`
  return 'Progres checklist stabil dibanding minggu lalu. Pertahankan ritme yang nyaman.'
})
const weightChangeLabel = computed(() => weightChange.value === null
  ? 'Catat berat pada dua minggu berbeda untuk melihat perbandingan.'
  : `${weightChange.value > 0 ? '+' : ''}${weightChange.value.toLocaleString('id-ID')} kg dari rata-rata catatan minggu lalu.`)

</script>

<template>
  <section class="card insights-card">
    <div class="insights-heading">
      <div><span class="eyebrow">Tinjauan pribadi</span><h2>Evaluasi mingguan</h2><p class="muted">Lihat kebiasaan dan tren, bukan satu angka harian.</p></div>
      <span class="badge">{{ earnedBadges }} / {{ badges.length }} badge</span>
    </div>

    <div class="review-grid">
      <article class="review-stat">
        <span class="field-label">Checklist minggu ini</span>
        <strong>{{ thisWeek.done }} / {{ thisWeek.total }}</strong>
        <span class="muted">{{ thisWeek.completion }}% · {{ thisWeek.completedDays }} hari tuntas</span>
        <p>{{ weeklyComment }}</p>
      </article>
      <article class="review-stat">
        <span class="field-label">Catatan berat badan</span>
        <strong>{{ thisWeekWeights.length }} <span>catatan</span></strong>
        <span class="muted">{{ weightChangeLabel }}</span>
        <p v-if="!previousWeekWeights.length" class="muted">Perubahan mingguan adalah ringkasan tren, bukan penilaian kesehatan.</p>
        <p v-else class="muted">Rata-rata minggu ini dibandingkan dengan rata-rata minggu sebelumnya.</p>
      </article>
    </div>

    <div class="badge-section">
      <div class="badge-heading"><h3>Badge pencapaian</h3><span class="muted">Dihitung dari riwayat tersimpan</span></div>
      <div class="badge-grid">
        <article v-for="badge in badges" :key="badge.id" class="achievement" :class="{ earned: badge.earned }">
          <span class="achievement-mark" :aria-label="badge.earned ? 'Tercapai' : 'Belum tercapai'">{{ badge.earned ? '✓' : '·' }}</span>
          <div><strong>{{ badge.name }}</strong><p>{{ badge.detail }}</p></div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.insights-heading, .badge-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.insights-heading .eyebrow { margin-bottom: 10px; }
.insights-heading h2 { margin: 0 0 6px; font-size: 24px; }
.insights-heading p { margin: 0; font-size: 14px; }
.review-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin: 22px 0 26px; }
.review-stat { display: flex; min-width: 0; flex-direction: column; gap: 6px; padding: 18px; border-radius: 8px; background: var(--neutral-50); }
.review-stat > strong { color: var(--primary-700); font-size: 25px; }
.review-stat > strong span { color: var(--neutral-500); font-size: 14px; font-weight: 500; }
.review-stat > .muted { font-size: 13px; }
.review-stat p { margin: 6px 0 0; font-size: 14px; }
.badge-section { border-top: 1px solid var(--neutral-200); padding-top: 20px; }
.badge-heading { align-items: baseline; margin-bottom: 14px; }
.badge-heading h3 { margin: 0; font-size: 18px; }
.badge-heading .muted { font-size: 13px; }
.badge-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.achievement { display: flex; gap: 12px; align-items: flex-start; min-width: 0; padding: 14px; border: 1px solid var(--neutral-200); border-radius: 8px; opacity: 0.62; }
.achievement.earned { border-color: var(--primary-100); background: var(--primary-50); opacity: 1; }
.achievement-mark { display: grid; flex: 0 0 28px; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--neutral-200); color: var(--neutral-700); font-weight: 700; }
.earned .achievement-mark { background: var(--primary-600); color: white; }
.achievement strong { font-size: 14px; }
.achievement p { margin: 4px 0 0; color: var(--neutral-500); font-size: 12px; }

@media (max-width: 620px) {
  .review-grid, .badge-grid { grid-template-columns: 1fr; }
  .badge-heading { align-items: flex-start; flex-direction: column; gap: 4px; }
}
</style>