<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { getFirebaseConfigurationError, isFirebaseConfigured } from '../../lib/firebase'
import type { RootState } from '../../store'

const store = useStore<RootState>()
const email = ref('')
const password = ref('')
const mode = ref<'sign-in' | 'create'>('create')
const busy = ref(false)
const localMessage = ref('')
const configured = computed(() => isFirebaseConfigured())
const configurationMessage = computed(() => getFirebaseConfigurationError())
const signedInEmail = computed(() => store.state.user.accountEmail)
const isSignedIn = computed(() => store.state.user.persistenceMode === 'cloud' && !!signedInEmail.value && !store.state.user.anonymousAccount)
const buttonLabel = computed(() => mode.value === 'create' ? 'Buat akun & sinkronkan' : 'Masuk & sinkronkan')

watch(() => store.state.user.accountEmail, (value) => {
  if (value) mode.value = 'sign-in'
}, { immediate: true })

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Akun belum dapat dihubungkan. Coba lagi.'
}

async function submit() {
  localMessage.value = ''
  if (!configured.value) {
    localMessage.value = configurationMessage.value
    return
  }
  if (!email.value.includes('@') || password.value.length < 6) {
    localMessage.value = 'Masukkan email valid dan kata sandi minimal 6 karakter.'
    return
  }
  busy.value = true
  try {
    await store.dispatch('user/connectAccount', { email: email.value.trim(), password: password.value, mode: mode.value })
    password.value = ''
    localMessage.value = 'Akun tersambung. Gunakan email dan kata sandi yang sama di perangkat lain.'
  } catch (error) {
    localMessage.value = errorMessage(error)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="card account-access" aria-labelledby="account-title">
    <div class="account-copy">
      <span class="field-label">Sinkronisasi lintas perangkat</span>
      <h2 id="account-title">{{ isSignedIn ? 'Akun tersambung' : 'Simpan progres dengan akun' }}</h2>
      <p v-if="isSignedIn" class="muted">{{ signedInEmail }} · gunakan akun ini di perangkat lain agar data yang sama terbuka.</p>
      <p v-else class="muted">Buat akun atau masuk dengan email yang sama di perangkatmu. Data profil, checklist, berat, dan favorit mengikuti akun Firebase.</p>
    </div>

    <form v-if="!isSignedIn" class="account-form" @submit.prevent="submit">
      <div v-if="configured" class="account-fields">
        <div class="field">
          <label for="sync-email">Email</label>
          <input id="sync-email" v-model="email" class="input" type="email" autocomplete="email" required placeholder="nama@email.com" />
        </div>
        <div class="field">
          <label for="sync-password">Kata sandi</label>
          <input id="sync-password" v-model="password" class="input" type="password" :autocomplete="mode === 'create' ? 'new-password' : 'current-password'" minlength="6" required placeholder="Minimal 6 karakter" />
        </div>
      </div>
      <p v-else class="configuration-note">{{ configurationMessage }}</p>
      <div class="account-actions">
        <button v-if="configured" type="submit" class="btn btn-primary" :disabled="busy">
          {{ busy ? 'Menghubungkan...' : buttonLabel }}
        </button>
        <button v-if="configured" type="button" class="mode-switch" @click="mode = mode === 'create' ? 'sign-in' : 'create'; localMessage = ''">
          {{ mode === 'create' ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Buat akun' }}
        </button>
      </div>
      <p v-if="localMessage" class="account-message" :class="{ error: !isSignedIn && (busy || localMessage.includes('belum') || localMessage.includes('Periksa') || localMessage.includes('Email')) }" role="status">{{ localMessage }}</p>
    </form>
    <p v-else-if="localMessage" class="alert alert-success" role="status">{{ localMessage }}</p>
  </section>
</template>

<style scoped>
.account-access { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: 20px 28px; align-items: start; }
.account-copy h2 { margin: 7px 0; font-size: 20px; }
.account-copy p { margin: 0; font-size: 13px; }
.account-form { display: grid; gap: 12px; }
.account-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.account-fields .field { margin: 0; }
.account-fields label { font-size: 13px; }
.account-fields .input { min-height: 44px; padding: 0 12px; font-size: 14px; }
.account-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.account-actions .btn { min-height: 44px; padding: 0 16px; }
.mode-switch { min-height: 44px; border: 0; padding: 0; background: transparent; color: var(--primary-700); font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
.configuration-note, .account-message { margin: 0; color: var(--neutral-600, #59665d); font-size: 13px; }
.account-message.error { color: var(--error-700); }

@media (max-width: 700px) {
  .account-access { grid-template-columns: 1fr; gap: 14px; padding: 18px; }
  .account-fields { grid-template-columns: 1fr; }
  .account-actions { align-items: stretch; flex-direction: column; }
  .account-actions .btn { width: 100%; }
  .mode-switch { min-height: 36px; }
}
</style>