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
      <h3 class="card-title">{{ item.title }}</h3>
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
  border-radius: var(--radius-card);
  color: var(--neutral-900);
  height: 100%;
  transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(27, 48, 32, 0.12);
  border-color: var(--primary-600);
  color: var(--neutral-900);
}

.cover {
  aspect-ratio: 16 / 9;
  width: 100%;
  overflow: hidden;
  background: var(--neutral-200);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.content-card:hover .cover img {
  transform: scale(1.05);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px;
  flex: 1;
}

/* Uniform title height clamped to 2 lines (Point 13) */
.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
  height: 2.7em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--neutral-900);
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
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.duration {
  margin: auto 0 0;
  padding-top: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--neutral-700);
  border-top: 1px solid var(--neutral-100);
}
</style>
