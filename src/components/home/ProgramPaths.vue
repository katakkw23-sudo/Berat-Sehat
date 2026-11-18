<script setup lang="ts">
const paths = [
  {
    title: 'Program Turun BB',
    target: 'Turun BB',
    description: 'Atur porsi, pilih menu hemat, dan bergerak ringan dari rumah.',
    image: 'https://images.pexels.com/photos/36982092/pexels-photo-36982092.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageAlt: 'Hidangan seimbang dengan sayuran dan lauk',
  },
  {
    title: 'Program Naik BB',
    target: 'Naik BB',
    description: 'Penuhi energi dan protein, lalu bangun otot dengan latihan bertahap.',
    image: 'https://images.pexels.com/photos/8032970/pexels-photo-8032970.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    imageAlt: 'Latihan kekuatan untuk membangun otot',
  },
]
</script>

<template>
  <div class="grid grid-2">
    <article v-for="path in paths" :key="path.target" class="card path-card">
      <img class="path-image" :src="path.image" :alt="path.imageAlt" loading="lazy" decoding="async" />
      <div class="path-content">
        <span class="badge">{{ path.target }}</span>
        <h3>{{ path.title }}</h3>
        <p class="muted">{{ path.description }}</p>
        <RouterLink class="path-link" :to="{ path: '/program', query: { target: path.target } }">
          Buka program
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5" /></svg>
        </RouterLink>
      </div>
    </article>
  </div>
</template>

<style scoped>
.path-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  border-radius: var(--radius-card);
  transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
}

.path-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary-600);
  box-shadow: var(--shadow-hover);
}

.path-card h3 {
  margin: 12px 0 0;
  font-size: 22px;
  font-weight: 700;
}

.path-card p {
  max-width: 440px;
  margin: 8px 0 20px;
  font-size: 15px;
  line-height: 1.5;
}

.path-image {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.path-content {
  display: flex;
  min-height: 190px;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
}

@media (min-width: 900px) {
  .path-card {
    display: grid;
    grid-template-columns: minmax(0, 0.78fr) minmax(0, 1fr);
    min-height: 250px;
  }

  .path-image {
    height: 100%;
    min-height: 250px;
    aspect-ratio: auto;
  }

  .path-content {
    min-height: 250px;
    padding: 24px;
  }
}

.path-link {
  margin-top: auto;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-size: 15px;
  font-weight: 700;
  color: var(--primary-600);
  transition: color var(--transition-base);
}

.path-link svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform var(--transition-base);
}

.path-link:hover svg {
  transform: translateX(4px);
}

@media (max-width: 600px) {
  .path-card {
    display: flex;
    flex-direction: column;
    min-height: auto;
  }

  .path-image {
    width: 100%;
    aspect-ratio: 16 / 9;
    height: auto;
    min-height: auto;
  }

  .path-content {
    min-height: 0;
    padding: 20px;
  }

  .path-card h3 {
    font-size: 19px;
  }

  .path-card p {
    font-size: 14px;
    margin-bottom: 16px;
  }
}
</style>
