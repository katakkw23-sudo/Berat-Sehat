import type { ActionContext, Module } from 'vuex'
import type { ProfileInput } from '../lib/calculator'
import {
  connectEmailAccount,
  ensureSignedIn,
  fetchUserData,
  getAccountIdentity,
  getPersistenceError,
  getPersistenceMode,
  saveUserData,
} from '../lib/userRepository'
import type { DailyTask, UserData, UserPreferences, WeightEntry } from '../types/user'
import type { RootState } from './index'

export interface UserState extends UserData {
  uid: string | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  persistenceMode: 'cloud' | 'local' | null
  syncError: string | null
  accountEmail: string | null
  anonymousAccount: boolean | null
}

type UserContext = ActionContext<UserState, RootState>

function requireUid(state: UserState): string {
  if (!state.uid) throw new Error('Data pengguna belum siap.')
  return state.uid
}

function createUserData(state: UserState, updates: Partial<UserData> = {}): UserData {
  return {
    profile: updates.profile === undefined ? state.profile : updates.profile,
    tasks: updates.tasks ?? state.tasks,
    weights: updates.weights ?? state.weights,
    favorites: updates.favorites ?? state.favorites,
    preferences: updates.preferences ?? state.preferences,
  }
}

const userModule: Module<UserState, RootState> = {
  namespaced: true,
  state: (): UserState => ({
    uid: null,
    status: 'idle',
    persistenceMode: null,
    syncError: null,
    accountEmail: null,
    anonymousAccount: null,
    profile: null,
    tasks: [],
    weights: [],
    favorites: [],
    preferences: { favoriteIngredients: [], excludedIngredients: [], dailyFoodBudget: null },
  }),
  getters: {
    tasksForDate: (state) => (date: string) => state.tasks.filter((task) => task.date === date),
    sortedWeights: (state) => [...state.weights].sort((a, b) => a.date.localeCompare(b.date)),
  },
  mutations: {
    setStatus(state, status: UserState['status']) {
      state.status = status
    },
    setData(state, payload: { uid: string; data: UserData }) {
      state.uid = payload.uid
      state.profile = payload.data.profile
      state.tasks = payload.data.tasks
      state.weights = payload.data.weights
      state.favorites = payload.data.favorites
      state.preferences = payload.data.preferences
      state.persistenceMode = getPersistenceMode()
      state.syncError = getPersistenceError()
      const identity = getAccountIdentity()
      state.accountEmail = identity.email
      state.anonymousAccount = identity.isAnonymous
      state.status = 'ready'
    },
  },
  actions: {
    async load({ state, commit }: UserContext) {
      if (state.status === 'ready') return
      commit('setStatus', 'loading')
      try {
        const uid = await ensureSignedIn()
        const data = await fetchUserData(uid)
        commit('setData', { uid, data })
      } catch (error) {
        commit('setStatus', 'error')
        state.syncError = getPersistenceError() ?? (error instanceof Error ? error.message : 'Firebase gagal memuat data.')
        throw error
      }
    },
    async sync({ state, commit }: UserContext) {
      if (state.status === 'loading') return
      commit('setStatus', 'loading')
      try {
        const uid = await ensureSignedIn()
        const data = await fetchUserData(uid)
        commit('setData', { uid, data })
      } catch (error) {
        commit('setStatus', 'error')
        state.syncError = getPersistenceError() ?? (error instanceof Error ? error.message : 'Firebase gagal menyinkronkan data.')
        throw error
      }
    },
    async connectAccount(
      { state, commit, dispatch }: UserContext,
      payload: { email: string; password: string; mode: 'create' | 'sign-in' },
    ) {
      await dispatch('load')
      commit('setStatus', 'loading')
      try {
        const currentData = createUserData(state)
        const uid = await connectEmailAccount(payload.email, payload.password, payload.mode, currentData)
        const data = await fetchUserData(uid)
        commit('setData', { uid, data })
      } catch (error) {
        commit('setStatus', state.uid ? 'ready' : 'error')
        state.syncError = getPersistenceError() ?? (error instanceof Error ? error.message : 'Firebase gagal menghubungkan akun.')
        throw error
      }
    },
    async saveProfile({ state, commit, dispatch }: UserContext, profile: ProfileInput) {
      await dispatch('load')
      const uid = requireUid(state)
      const data = await saveUserData(uid, createUserData(state, { profile }), { type: 'profile', profile })
      commit('setData', { uid, data })
    },
    async addTask({ state, commit, dispatch }: UserContext, task: Pick<DailyTask, 'id' | 'title' | 'date'>) {
      await dispatch('load')
      const uid = requireUid(state)
      const exists = state.tasks.some((item) => item.id === task.id && item.date === task.date)
      if (exists) return
      const newTask: DailyTask = { ...task, done: false }
      const tasks = [...state.tasks, newTask]
      const data = await saveUserData(uid, createUserData(state, { tasks }), { type: 'tasks-upsert', tasks: [newTask] })
      commit('setData', { uid, data })
    },
    async ensureDailyTasks(
      { state, commit, dispatch }: UserContext,
      payload: { date: string; tasks: Array<Pick<DailyTask, 'id' | 'title' | 'program'>> },
    ) {
      await dispatch('load')
      const uid = requireUid(state)
      const existingIds = new Set(state.tasks.filter((task) => task.date === payload.date).map((task) => task.id))
      const additions = payload.tasks
        .filter((task) => !existingIds.has(task.id))
        .map((task) => ({ ...task, date: payload.date, done: false }))
      if (!additions.length) return
      const data = await saveUserData(
        uid,
        createUserData(state, { tasks: [...state.tasks, ...additions] }),
        { type: 'tasks-upsert', tasks: additions },
      )
      commit('setData', { uid, data })
    },
    async toggleTask({ state, commit, dispatch }: UserContext, target: Pick<DailyTask, 'id' | 'date'>) {
      await dispatch('load')
      const uid = requireUid(state)
      const existing = state.tasks.find((task) => task.id === target.id && task.date === target.date)
      if (!existing) return
      const updatedTask = { ...existing, done: !existing.done }
      const tasks = state.tasks.map((task) => task.id === target.id && task.date === target.date ? updatedTask : task)
      const data = await saveUserData(uid, createUserData(state, { tasks }), { type: 'task-set', task: updatedTask })
      commit('setData', { uid, data })
    },
    async addWeight({ state, commit, dispatch }: UserContext, entry: WeightEntry) {
      await dispatch('load')
      const uid = requireUid(state)
      const weights = [...state.weights.filter((item) => item.date !== entry.date), entry]
      const data = await saveUserData(uid, createUserData(state, { weights }), { type: 'weight-upsert', entry })
      commit('setData', { uid, data })
    },
    async savePreferences({ state, commit, dispatch }: UserContext, preferences: UserPreferences) {
      await dispatch('load')
      const uid = requireUid(state)
      const normalize = (items: string[]) => [...new Set(items
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim().slice(0, 40))
        .filter(Boolean))].slice(0, 20)
      const favoriteIngredients = normalize(preferences.favoriteIngredients)
      const favoriteSet = new Set(favoriteIngredients)
      const excludedIngredients = normalize(preferences.excludedIngredients)
        .filter((item) => !favoriteSet.has(item))
      const dailyFoodBudget = preferences.dailyFoodBudget === null
        ? null
        : Math.round(preferences.dailyFoodBudget)
      if (dailyFoodBudget !== null && (dailyFoodBudget < 5000 || dailyFoodBudget > 1000000)) {
        throw new Error('Anggaran harian harus antara Rp5.000 dan Rp1.000.000.')
      }
      const nextPreferences = { favoriteIngredients, excludedIngredients, dailyFoodBudget }
      const data = await saveUserData(
        uid,
        createUserData(state, { preferences: nextPreferences }),
        { type: 'preferences', base: state.preferences, preferences: nextPreferences },
      )
      commit('setData', { uid, data })
    },
    async toggleFavorite({ state, commit, dispatch }: UserContext, favoriteId: string) {
      await dispatch('load')
      const uid = requireUid(state)
      const id = favoriteId.trim()
      if (!id || id.length > 180) throw new Error('Menu favorit tidak valid.')
      const favorites = state.favorites.includes(id)
        ? state.favorites.filter((item) => item !== id)
        : [...state.favorites, id]
      const favorite = !state.favorites.includes(id)
      if (favorites.length > 100) throw new Error('Maksimal 100 menu favorit dapat disimpan.')
      const data = await saveUserData(uid, createUserData(state, { favorites }), { type: 'favorite-set', id, favorite })
      commit('setData', { uid, data })
    },
  },
}

export default userModule
