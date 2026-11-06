export type ContentCategory =
  | 'Edukasi Dasar & Kalkulator'
  | 'Meal Plan Turun BB'
  | 'Meal Plan Naik BB'
  | 'Workout Turun Berat Badan'
  | 'Workout Naik Berat Badan'
  | 'Kebiasaan & Evaluasi'

export type ContentType = 'Edukasi' | 'Meal Plan' | 'Workout' | 'Habits'

export type ContentTarget = 'Turun BB' | 'Naik BB' | 'Umum'

export interface NutritionInfo {
  portion: string
  calories: number
  protein: number
  carbs: number
  fat?: number
}

export interface WorkoutExercise {
  name: string
  sets: number
  reps: string
  rest: string
}

export interface WorkoutInfo {
  exercises: WorkoutExercise[]
  alternatives: string[]
}

export interface ContentItem {
  slug: string
  title: string
  category: ContentCategory
  type: ContentType
  target: ContentTarget
  summary: string
  coverImage: string
  estimatedDuration: string
  body: string[]
  nutrition?: NutritionInfo
  workout?: WorkoutInfo
}
