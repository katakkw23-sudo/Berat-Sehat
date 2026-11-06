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
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.path-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary-600);
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.12);
}

.path-card h3 {
  margin: 12px 0 0;
  font-size: 21px;
}

.path-card p {
  max-width: 440px;
  margin: 8px 0 22px;
  font-size: 14px;
}

.path-image {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 8.5;
  object-fit: cover;
}

.path-content {
  display: flex;
  min-height: 204px;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
}

@media (min-width: 900px) {
  .path-card {
    display: grid;
    grid-template-columns: minmax(0, 0.72fr) minmax(0, 1fr);
    min-height: 256px;
  }

  .path-image {
    height: 100%;
    min-height: 256px;
    aspect-ratio: auto;
  }

  .path-content {
    min-height: 256px;
    padding: 22px;
  }
}

.path-link {
  margin-top: auto;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-size: 14px;
}

.path-link svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.2s ease;
}

.path-link:hover svg {
  transform: translateX(3px);
}

@media (max-width: 600px) {
  .path-card {
    display: grid;
    grid-template-columns: 96px minmax(0, 1fr);
    min-height: 154px;
  }

  .path-content {
    min-height: 0;
    justify-content: center;
    gap: 6px;
    padding: 12px;
  }

  .path-image {
    height: 100%;
    min-height: 154px;
    aspect-ratio: auto;
  }

  .path-card h3 {
    margin: 4px 0 0;
    font-size: 17px;
  }

  .path-card p {
    margin: 2px 0 8px;
    font-size: 12px;
    line-height: 1.4;
  }

  .path-link {
    font-size: 12px;
  }
}
</style>
