<script setup lang="ts"></script>

<template>
  <section class="section">
    <div class="container empty-state card">
      <h1>Halaman tidak ditemukan</h1>
      <p class="muted">Alamat yang kamu buka tidak tersedia. Mulai lagi dari beranda atau jelajahi konten.</p>
      <div class="actions">
        <RouterLink to="/" class="btn btn-primary">Ke Beranda</RouterLink>
        <RouterLink to="/explore" class="btn btn-outline">Explore</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.empty-state h1 {
  font-size: 28px;
  margin: 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
</style>
