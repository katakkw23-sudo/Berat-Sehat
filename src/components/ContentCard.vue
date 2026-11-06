<script setup lang="ts">
import type { ContentItem } from '../types/content'

defineProps<{ item: ContentItem }>()
</script>

<template>
  <RouterLink :to="`/explore/${item.slug}`" class="content-card card">
    <div class="cover">
      <img :src="item.coverImage" :alt="item.title" loading="lazy" />
    </div>
    <div class="card-body">
      <div class="badges">
        <span class="badge">{{ item.category }}</span>
        <span class="badge badge-target">{{ item.target }}</span>
      </div>
      <h3>{{ item.title }}</h3>
      <p class="muted summary">{{ item.summary }}</p>
      <p class="duration">{{ item.estimatedDuration }}</p>
    </div>
  </RouterLink>
</template>

<style scoped>
.content-card {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  color: var(--neutral-900);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.12);
  color: var(--neutral-900);
}

.cover {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--neutral-200);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.content-card:hover .cover img {
  transform: scale(1.04);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  flex: 1;
}

.card-body h3 {
  margin: 0;
  font-size: 18px;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge-target {
  background: var(--primary-100);
  color: var(--primary-700);
}

.summary {
  margin: 0;
  font-size: 15px;
}

.duration {
  margin: auto 0 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--neutral-700);
}
</style>
