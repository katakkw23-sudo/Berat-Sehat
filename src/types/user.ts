import type { Goal, ProfileInput } from '../lib/calculator'

export interface DailyTask {
  id: string
  title: string
  date: string
  done: boolean
  program?: Goal
}

export interface WeightEntry {
  date: string
  weightKg: number
}

export interface UserPreferences {
  favoriteIngredients: string[]
  excludedIngredients: string[]
  dailyFoodBudget: number | null
}

export interface UserData {
  profile: ProfileInput | null
  tasks: DailyTask[]
  weights: WeightEntry[]
  favorites: string[]
  preferences: UserPreferences
}
