<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'
import ContentCard from '../components/ContentCard.vue'
import { filterContents, type TargetFilter, type TypeFilter } from '../lib/contentQueries'

const TARGET_OPTIONS: TargetFilter[] = ['Semua', 'Turun BB', 'Naik BB']
const TYPE_OPTIONS: TypeFilter[] = ['Semua', 'Edukasi', 'Meal Plan', 'Workout', 'Habits']

const route = useRoute()
const router = useRouter()

function readQuery(value: LocationQueryValue | LocationQueryValue[] | undefined): string {
  return typeof value === 'string' ? value : ''
}

const query = ref(readQuery(route.query.q))
const target = ref<TargetFilter>(
  TARGET_OPTIONS.includes(readQuery(route.query.target) as TargetFilter)
    ? (readQuery(route.query.target) as TargetFilter)
    : 'Semua',
)
const type = ref<TypeFilter>(
  TYPE_OPTIONS.includes(readQuery(route.query.type) as TypeFilter)
    ? (readQuery(route.query.type) as TypeFilter)
    : 'Semua',
)

const results = computed(() => filterContents({ query: query.value, target: target.value, type: type.value }))

const hasActiveFilter = computed(
  () => query.value.trim() !== '' || target.value !== 'Semua' || type.value !== 'Semua',
)

watch([query, target, type], ([q, t, ty]) => {
  router.replace({
    query: {
      ...(q.trim() ? { q: q.trim() } : {}),
      ...(t !== 'Semua' ? { target: t } : {}),
      ...(ty !== 'Semua' ? { type: ty } : {}),
    },
  })
})

function resetFilters() {
  query.value = ''
  target.value = 'Semua'
  type.value = 'Semua'
}
</script>

<template>
  <section class="section explore-page">
    <div class="container">
      <div class="section-head explore-head">
        <span class="eyebrow">Perpustakaan BeratSehat</span>
        <h1>Temukan konten yang sesuai</h1>
        <p>Jelajahi menu, latihan, dan panduan dasar. Saring berdasarkan tujuan agar lebih cepat menemukan yang kamu butuhkan.</p>
      </div>

      <div class="controls card">
        <div class="field">
          <label for="search">Cari judul konten</label>
          <input
            id="search"
            v-model="query"
            class="input"
            type="search"
            placeholder="Contoh: menu hemat, latihan"
            autocomplete="off"
          />
        </div>

        <div class="filter-group">
          <span class="field-label">Target</span>
          <div class="chip-row" role="group" aria-label="Filter target">
            <button
              v-for="option in TARGET_OPTIONS"
              :key="option"
              type="button"
              class="chip"
              :class="{ active: target === option }"
              :aria-pressed="target === option"
              @click="target = option"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <span class="field-label">Tipe</span>
          <div class="chip-row" role="group" aria-label="Filter tipe">
            <button
              v-for="option in TYPE_OPTIONS"
              :key="option"
              type="button"
              class="chip"
              :class="{ active: type === option }"
              :aria-pressed="type === option"
              @click="type = option"
            >
              {{ option }}
            </button>
          </div>
        </div>
      </div>

      <p class="result-count muted" aria-live="polite">{{ results.length }} konten ditemukan</p>

      <div v-if="results.length" class="grid grid-2 grid-3-wide">
        <ContentCard v-for="item in results" :key="item.slug" :item="item" />
      </div>

      <div v-else class="empty-state card">
        <h3>Tidak ada konten yang cocok</h3>
        <p>Coba kata kunci lain atau atur ulang filter untuk melihat semua konten.</p>
        <button v-if="hasActiveFilter" type="button" class="btn btn-outline" @click="resetFilters">
          Atur ulang filter
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.controls {
  display: grid;
  gap: 18px;
  margin-bottom: 24px;
}

.explore-head { max-width: 760px; }
.explore-head h1 { margin-bottom: 10px; }

.field {
  margin-bottom: 0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.result-count {
  margin-bottom: 24px;
  font-size: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-state h3 {
  margin: 0;
}

@media (min-width: 820px) {
  .controls {
    grid-template-columns: minmax(0, 1.25fr) repeat(2, minmax(0, 1fr));
    align-items: end;
    gap: 20px;
    padding: 22px;
  }

  .chip-row { gap: 6px; }
  .chip { padding: 0 12px; }
}

@media (min-width: 1080px) {
  .grid-3-wide {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
