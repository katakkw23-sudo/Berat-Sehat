export type Gender = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active'
export type Goal = 'loss' | 'gain'

export interface ProfileInput {
  gender: Gender
  age: number
  heightCm: number
  weightKg: number
  targetWeightKg?: number
  activity: ActivityLevel
  goal: Goal
  healthConcern: boolean
}

export type ProfileErrors = Partial<Record<'gender' | 'age' | 'heightCm' | 'weightKg' | 'activity' | 'goal', string>>

export type CalorieVerdict = 'ok' | 'warning' | 'blocked'

export interface CalorieResult {
  verdict: CalorieVerdict
  bmi: number
  bmr: number
  tdee: number
  targetKcal: number | null
  messages: string[]
}

export const MIN_ADULT_AGE = 18
export const ADJUSTMENT_KCAL = 400
const MIN_TARGET_KCAL: Record<Gender, number> = { male: 1500, female: 1200 }

export const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; factor: number }[] = [
  { value: 'sedentary', label: 'Jarang bergerak (hampir tidak berolahraga)', factor: 1.2 },
  { value: 'light', label: 'Ringan (olahraga 1-3 kali seminggu)', factor: 1.375 },
  { value: 'moderate', label: 'Sedang (olahraga 3-5 kali seminggu)', factor: 1.55 },
  { value: 'active', label: 'Berat (olahraga 6-7 kali seminggu)', factor: 1.725 },
]

export const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'loss', label: 'Turun BB' },
  { value: 'gain', label: 'Naik BB' },
]

export function validateProfileInput(input: ProfileInput): ProfileErrors {
  const errors: ProfileErrors = {}
  if (!input.gender) errors.gender = 'Pilih jenis kelamin.'
  if (!Number.isInteger(input.age) || input.age < 1 || input.age > 120) {
    errors.age = 'Masukkan usia dalam angka bulat yang valid.'
  }
  if (!Number.isFinite(input.heightCm) || input.heightCm < 100 || input.heightCm > 250) {
    errors.heightCm = 'Tinggi badan harus antara 100 dan 250 cm.'
  }
  if (!Number.isFinite(input.weightKg) || input.weightKg < 25 || input.weightKg > 300) {
    errors.weightKg = 'Berat badan harus antara 25 dan 300 kg.'
  }
  if (!input.activity) errors.activity = 'Pilih tingkat aktivitas harian.'
  if (!input.goal) errors.goal = 'Pilih tujuan Turun BB atau Naik BB.'
  return errors
}

export function isAdultForCalculator(age: number): boolean {
  return age >= MIN_ADULT_AGE
}

export function calculateCalorieResult(input: ProfileInput): CalorieResult {
  const { gender, age, heightCm, weightKg, activity, goal, healthConcern } = input
  const bmi = weightKg / (heightCm / 100) ** 2
  const bmr = gender === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  const factor = ACTIVITY_OPTIONS.find((option) => option.value === activity)?.factor ?? 1.2
  const tdee = bmr * factor
  const adjustedTarget = goal === 'loss' ? tdee - ADJUSTMENT_KCAL : tdee + ADJUSTMENT_KCAL

  const messages: string[] = []
  let blocked = false
  let warned = false
  const block = (message: string) => {
    blocked = true
    messages.push(message)
  }
  const warn = (message: string) => {
    warned = true
    messages.push(message)
  }

  if (healthConcern) {
    block('Karena ada penurunan berat badan tanpa sebab yang jelas atau kondisi kesehatan yang memengaruhi makan, target kalori tidak ditampilkan. Konsultasikan ke dokter atau ahli gizi terlebih dahulu.')
  }
  if (bmi < 17) {
    block('BMI kamu berada di bawah 17. Target kalori tidak ditampilkan. Mohon konsultasikan ke tenaga kesehatan.')
  }
  if (goal === 'loss' && bmi < 18.5) {
    block('BMI kamu sudah berada di bawah 18,5, sehingga program Turun BB tidak disarankan. Pilih Naik BB atau konsultasikan ke ahli gizi.')
  }
  if (goal === 'gain' && bmi >= 25) {
    block('BMI kamu berada di rentang berat badan lebih atau lebih, sehingga program Naik BB tidak disarankan. Pilih Turun BB atau konsultasikan ke ahli gizi.')
  }
  if (goal === 'loss' && bmi >= 30) {
    warn('BMI kamu berada di rentang obesitas. Program ini sebaiknya dijalankan dengan pendampingan tenaga kesehatan.')
  }
  if (adjustedTarget < MIN_TARGET_KCAL[gender]) {
    block(`Target kalori hasil perhitungan berada di bawah batas aman ${MIN_TARGET_KCAL[gender]} kkal per hari. Target tidak ditampilkan. Konsultasikan ke ahli gizi untuk rencana yang sesuai.`)
  }

  const verdict: CalorieVerdict = blocked ? 'blocked' : warned ? 'warning' : 'ok'

  return {
    verdict,
    bmi: Math.round(bmi * 10) / 10,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetKcal: blocked ? null : Math.round(adjustedTarget),
    messages,
  }
}
