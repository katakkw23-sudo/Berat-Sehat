<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const form = reactive({ gender: '', age: '', heightCm: '', weightKg: '' })
const submitted = ref(false)

const age = computed(() => Number(form.age))
const heightCm = computed(() => Number(form.heightCm))
const weightKg = computed(() => Number(form.weightKg))
const valid = computed(
  () => !!form.gender && Number.isInteger(age.value) && age.value >= 1 && age.value <= 120
    && heightCm.value >= 100 && heightCm.value <= 250
    && weightKg.value >= 25 && weightKg.value <= 300,
)
const result = computed(() => {
  if (!submitted.value || !valid.value) return null
  const heightM = heightCm.value / 100
  const bmi = weightKg.value / heightM ** 2
  const minimumWeight = 18.5 * heightM ** 2
  const maximumWeight = 24.9 * heightM ** 2
  const category = bmi < 18.5 ? 'Berat badan kurang' : bmi < 25 ? 'Rentang normal' : bmi < 30 ? 'Berat badan berlebih' : 'Obesitas'
  return { bmi: Math.round(bmi * 10) / 10, minimumWeight, maximumWeight, category }
})
const error = computed(() => {
  if (!submitted.value) return ''
  if (!form.gender) return 'Pilih jenis kelamin.'
  if (!Number.isInteger(age.value) || age.value < 1 || age.value > 120) return 'Masukkan usia yang valid.'
  if (heightCm.value < 100 || heightCm.value > 250) return 'Tinggi badan harus antara 100 dan 250 cm.'
  if (weightKg.value < 25 || weightKg.value > 300) return 'Berat badan harus antara 25 dan 300 kg.'
  return ''
})

function calculate() {
  submitted.value = true
}

function formatKg(value: number): string {
  return value.toLocaleString('id-ID', { maximumFractionDigits: 1 })
}
</script>

<template>
  <div class="bmi-layout">
    <form class="card" novalidate @submit.prevent="calculate">
      <div class="form-grid">
        <div class="field">
          <label for="bmi-gender">Jenis kelamin</label>
          <select id="bmi-gender" v-model="form.gender" class="input">
            <option value="" disabled>Pilih jenis kelamin</option>
            <option value="female">Perempuan</option>
            <option value="male">Laki-laki</option>
          </select>
        </div>
        <div class="field">
          <label for="bmi-age">Usia (tahun)</label>
          <input id="bmi-age" v-model="form.age" class="input" type="number" min="1" max="120" inputmode="numeric" placeholder="Contoh: 25" />
        </div>
        <div class="field">
          <label for="bmi-height">Tinggi badan (cm)</label>
          <input id="bmi-height" v-model="form.heightCm" class="input" type="number" min="100" max="250" inputmode="decimal" placeholder="Contoh: 165" />
        </div>
        <div class="field">
          <label for="bmi-weight">Berat badan (kg)</label>
          <input id="bmi-weight" v-model="form.weightKg" class="input" type="number" min="25" max="300" inputmode="decimal" placeholder="Contoh: 60" />
        </div>
      </div>
      <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
      <button type="submit" class="btn btn-primary">Hitung BMI</button>
      <p class="muted note">Untuk usia di bawah 18 tahun, kategori BMI dewasa dan rentang berat ini tidak digunakan. Konsultasikan pertumbuhan dengan tenaga kesehatan.</p>
    </form>

    <section v-if="result" class="card result" aria-live="polite">
      <span class="field-label">Hasil skrining</span>
      <p class="bmi-value">{{ result.bmi.toLocaleString('id-ID') }} <span>BMI</span></p>
      <p class="category">{{ age < 18 ? 'Kategori dewasa tidak ditampilkan' : result.category }}</p>
      <template v-if="age >= 18">
        <p>Rentang berat berdasarkan BMI 18,5–24,9:</p>
        <strong>{{ formatKg(result.minimumWeight) }}–{{ formatKg(result.maximumWeight) }} kg</strong>
        <p v-if="weightKg < result.minimumWeight" class="muted">Sekitar {{ formatKg(result.minimumWeight - weightKg) }} kg di bawah batas bawah rentang.</p>
        <p v-else-if="weightKg > result.maximumWeight" class="muted">Sekitar {{ formatKg(weightKg - result.maximumWeight) }} kg di atas batas atas rentang.</p>
        <p v-else class="muted">Berat saat ini berada dalam rentang BMI tersebut.</p>
      </template>
      <p v-else class="muted">Untuk anak dan remaja, BMI perlu dibandingkan dengan kurva pertumbuhan sesuai usia dan jenis kelamin oleh tenaga kesehatan.</p>
      <p class="muted note">BMI hanya alat skrining dan tidak mempertimbangkan semua faktor tubuh. Hasil ini bukan diagnosis dan bukan target berat badan pasti.</p>
    </section>
  </div>
</template>

<style scoped>
.bmi-layout {
  display: grid;
  gap: 24px;
}

.form-grid {
  display: grid;
  gap: 0 16px;
  grid-template-columns: 1fr;
}

.note {
  font-size: 14px;
  margin: 20px 0 0;
}

.result {
  align-self: start;
}

.bmi-value {
  margin: 12px 0 4px;
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-700);
}

.bmi-value span {
  font-size: 16px;
}

.category {
  font-size: 18px;
  font-weight: 700;
}

@media (min-width: 700px) {
  .bmi-layout {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }

  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
