<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { todayIso, formatDate } from '../../lib/date'
import type { Goal } from '../../lib/calculator'
import type { RootState } from '../../store'
import type { DailyTask } from '../../types/user'

const store = useStore<RootState>()
const today = todayIso()
const pending = ref(false)
const errorText = ref('')
const goal = computed(() => store.state.user.profile?.goal)

const programTasks: Record<Goal, Array<Pick<DailyTask, 'id' | 'title' | 'program'>>> = {
  loss: [
    { id: 'loss-breakfast', title: 'Sarapan sesuai rencana', program: 'loss' },
    { id: 'loss-balanced-meals', title: 'Pilih lauk berprotein dan sayur atau buah', program: 'loss' },
    { id: 'loss-water', title: 'Minum air secara cukup sepanjang hari', program: 'loss' },
    { id: 'loss-portions', title: 'Makan dengan porsi yang sudah direncanakan', program: 'loss' },
    { id: 'loss-activity', title: 'Lakukan aktivitas fisik sesuai kemampuan', program: 'loss' },
    { id: 'loss-mindful', title: 'Makan perlahan dan berhenti saat cukup', program: 'loss' },
    { id: 'loss-rest', title: 'Berikan waktu tidur dan istirahat yang cukup', program: 'loss' },
  ],
  gain: [
    { id: 'gain-breakfast', title: 'Selesaikan sarapan', program: 'gain' },
    { id: 'gain-morning-snack', title: 'Konsumsi snack pagi', program: 'gain' },
    { id: 'gain-lunch', title: 'Selesaikan makan siang', program: 'gain' },
    { id: 'gain-afternoon-snack', title: 'Konsumsi snack sore', program: 'gain' },
    { id: 'gain-dinner', title: 'Selesaikan makan malam', program: 'gain' },
    { id: 'gain-protein', title: 'Sertakan sumber protein dalam menu', program: 'gain' },
    { id: 'gain-plan', title: 'Ikuti rencana asupan sesuai kemampuan', program: 'gain' },
    { id: 'gain-strength', title: 'Lakukan latihan kekuatan sesuai jadwal', program: 'gain' },
    { id: 'gain-rest', title: 'Cukupkan waktu istirahat dan pemulihan', program: 'gain' },
  ],
}

const tasks = computed(() => {
  const activeGoal = goal.value
  return (store.getters['user/tasksForDate'](today) as RootState['user']['tasks'])
    .filter((task) => task.program === undefined || task.program === activeGoal)
})
const doneCount = computed(() => tasks.value.filter((task) => task.done).length)
const completion = computed(() => tasks.value.length ? Math.round((doneCount.value / tasks.value.length) * 100) : 0)
const week = computed(() => Array.from({ length: 7 }, (_, index) => {
  const date = new Date()
  date.setDate(date.getDate() - (6 - index))
  const dateKey = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
  const entries = (store.state.user.tasks as DailyTask[]).filter(
    (task) => task.date === dateKey && (task.program === undefined || task.program === goal.value),
  )
  return { date: dateKey, done: entries.filter((task) => task.done).length, total: entries.length }
}))
const weekTotals = computed(() => week.value.reduce(
  (totals, day) => ({ done: totals.done + day.done, total: totals.total + day.total }),
  { done: 0, total: 0 },
))
const weekCompletion = computed(() => weekTotals.value.total
  ? Math.round((weekTotals.value.done / weekTotals.value.total) * 100)
  : 0)

watch(goal, (activeGoal) => {
  if (!activeGoal) return
  store.dispatch('user/ensureDailyTasks', { date: today, tasks: programTasks[activeGoal] }).catch(() => {
    errorText.value = 'Checklist belum bisa dimuat. Periksa koneksi internet, lalu coba lagi.'
  })
}, { immediate: true })

async function toggle(id: string) {
  pending.value = true
  errorText.value = ''
  try {
    await store.dispatch('user/toggleTask', { id, date: today })
  } catch {
    errorText.value = 'Perubahan belum tersimpan. Periksa koneksi internet, lalu coba lagi.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section class="card">
    <div class="panel-head">
      <div>
        <h3>Checklist hari ini</h3>
        <p class="muted">{{ formatDate(today) }}</p>
      </div>
      <span class="badge">{{ doneCount }} / {{ tasks.length }} selesai</span>
    </div>

    <div class="progress-summary">
      <div class="progress-label"><strong>Progres hari ini</strong><span>{{ completion }}%</span></div>
      <div class="progress-track" role="progressbar" aria-label="Progres checklist hari ini" :aria-valuenow="completion" aria-valuemin="0" aria-valuemax="100">
        <span :style="{ width: `${completion}%` }"></span>
      </div>
      <p v-if="tasks.length && doneCount === tasks.length" class="success-note">Semua aktivitas selesai. Pertahankan ritme yang nyaman untukmu.</p>
    </div>

    <p v-if="errorText" class="alert alert-error" role="alert">{{ errorText }}</p>

    <ul v-if="tasks.length" class="task-list">
      <li v-for="task in tasks" :key="task.id">
        <label class="task-item" :class="{ done: task.done }">
          <input type="checkbox" :checked="task.done" :disabled="pending" @change="toggle(task.id)" />
          <span>{{ task.title }}</span>
        </label>
      </li>
    </ul>

    <div v-else class="empty-state">
      <p>Checklist sedang disiapkan untuk program kamu. Pastikan profil dan tujuan program sudah tersimpan.</p>
      <RouterLink to="/explore" class="btn btn-outline">Jelajahi konten</RouterLink>
    </div>

    <div class="week-summary">
      <h4>Ringkasan 7 hari terakhir</h4>
      <p v-if="weekTotals.total" class="muted week-total">
        {{ weekTotals.done }} dari {{ weekTotals.total }} aktivitas selesai ({{ weekCompletion }}%). Lihat tren beberapa minggu, bukan satu hari saja.
      </p>
      <ul>
        <li v-for="day in week" :key="day.date">
          <span>{{ formatDate(day.date) }}</span>
          <strong v-if="day.total">{{ day.done }}/{{ day.total }} aktivitas</strong>
          <span v-else class="muted">Belum ada data</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.panel-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px 16px;
  margin-bottom: 16px;
}

.panel-head h3 {
  margin: 0;
}

.panel-head p {
  margin: 4px 0 0;
  font-size: 14px;
}

.progress-summary {
  margin-bottom: 20px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
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
  transition: width 0.2s ease;
}

.success-note {
  margin: 8px 0 0;
  color: var(--success-700);
  font-size: 14px;
}

.task-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 48px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--neutral-200);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.task-item:hover {
  background: var(--primary-50);
}

.task-item input {
  width: 20px;
  height: 20px;
  accent-color: var(--primary-600);
  flex-shrink: 0;
}

.task-item.done span {
  color: var(--neutral-500);
  text-decoration: line-through;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  color: var(--neutral-500);
}

.empty-state p {
  margin: 0;
}

.week-summary {
  margin-top: 24px;
  border-top: 1px solid var(--neutral-200);
  padding-top: 20px;
}

.week-summary h4 {
  margin: 0 0 12px;
  font-size: 16px;
}

.week-summary ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.week-summary li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--neutral-200);
  font-size: 14px;
}

.week-summary li:last-child {
  border-bottom: 0;
}
</style>
