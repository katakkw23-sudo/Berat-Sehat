import { getFirebaseConfigurationError, getFirebaseServices, isFirebaseConfigured } from './firebase'
import { isAdultForCalculator, validateProfileInput, type ProfileInput } from './calculator'
import type { DailyTask, UserData, UserPreferences, WeightEntry } from '../types/user'

const USERS_COLLECTION = 'users'
const LOCAL_USER_ID = 'local-browser'
const LOCAL_USER_ID_KEY = 'beratsehat-local-user-id'
const LOCAL_DATA_PREFIX = 'beratsehat-user-data:'
const LOCAL_CACHE_VERSION = 2
let persistenceMode: 'cloud' | 'local' = 'cloud'
let persistenceError: string | null = null
let accountEmail: string | null = null
let anonymousAccount: boolean | null = null

export type UserMutation =
  | { type: 'profile'; profile: ProfileInput }
  | { type: 'tasks-upsert'; tasks: DailyTask[] }
  | { type: 'task-set'; task: DailyTask }
  | { type: 'weight-upsert'; entry: WeightEntry }
  | { type: 'preferences'; base: UserPreferences; preferences: UserPreferences }
  | { type: 'favorite-set'; id: string; favorite: boolean }

interface LocalCache {
  data: UserData
  pending: UserMutation[]
  legacy: boolean
}
const EMPTY_PREFERENCES: UserPreferences = {
  favoriteIngredients: [],
  excludedIngredients: [],
  dailyFoodBudget: null,
}

function readStringList(value: unknown, limit: number, maxLength = 180): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim()).filter((item) => item.length > 0 && item.length <= maxLength))].slice(0, limit)
}

function emptyUserData(): UserData {
  return { profile: null, tasks: [], weights: [], favorites: [], preferences: { ...EMPTY_PREFERENCES } }
}

export function getPersistenceMode(): 'cloud' | 'local' {
  return persistenceMode
}

export function getPersistenceError(): string | null {
  return persistenceError
}

export interface AccountIdentity {
  email: string | null
  isAnonymous: boolean | null
}

export function getAccountIdentity(): AccountIdentity {
  return { email: accountEmail, isAnonymous: anonymousAccount }
}

function describeFirebaseError(error: unknown): string {
  const code = isRecord(error) && typeof error.code === 'string' ? error.code : ''
  if (!isFirebaseConfigured()) return getFirebaseConfigurationError()
  if (code === 'auth/operation-not-allowed') return 'Metode masuk belum aktif. Aktifkan Anonymous untuk sesi awal dan Email/Password untuk sinkronisasi antarperangkat.'
  if (code === 'auth/email-already-in-use') return 'Email sudah terdaftar. Pilih Masuk, bukan Buat akun.'
  if (code === 'auth/invalid-email') return 'Format email belum benar.'
  if (code === 'auth/unauthorized-domain') return 'Domain website belum diizinkan. Tambahkan domain ini di Firebase Authentication → Settings → Authorized domains.'
  if (code === 'auth/configuration-not-found') return 'Firebase Authentication belum disiapkan untuk project ini.'
  if (code === 'auth/weak-password') return 'Kata sandi terlalu pendek. Gunakan minimal 6 karakter.'
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return 'Email atau kata sandi tidak cocok.'
  if (code === 'auth/too-many-requests') return 'Terlalu banyak percobaan masuk. Tunggu sebentar lalu coba lagi.'
  if (code === 'auth/invalid-api-key' || code === 'auth/invalid-project-id') return 'Konfigurasi Firebase tidak cocok dengan project aktif. Periksa nilai .env.local.'
  if (code === 'permission-denied' || code === 'firestore/permission-denied') return 'Firestore menolak akses. Deploy firestore.rules dan pastikan pengguna sudah login.'
  if (code === 'not-found' || code === 'firestore/not-found') return 'Database Cloud Firestore belum dibuat pada project Firebase ini.'
  if (code === 'failed-precondition' || code === 'firestore/failed-precondition') return 'Cloud Firestore belum siap. Buat database pada project Firebase yang sama.'
  if (code === 'unavailable' || code === 'auth/network-request-failed' || code === 'deadline-exceeded') return 'Firebase tidak dapat dijangkau. Periksa koneksi internet lalu coba sinkronkan lagi.'
  return `Firebase gagal menyinkronkan data${code ? ` (${code})` : ''}. Data tetap tersimpan di perangkat ini.`
}

function mergeAccountData(remote: UserData, incoming: UserData): UserData {
  const tasks = new Map<string, DailyTask>()
  for (const task of incoming.tasks) tasks.set(`${task.date}:${task.id}`, task)
  for (const task of remote.tasks) {
    const key = `${task.date}:${task.id}`
    const incomingTask = tasks.get(key)
    tasks.set(key, incomingTask ? { ...incomingTask, ...task, done: incomingTask.done || task.done } : task)
  }
  const weights = new Map<string, WeightEntry>()
  for (const weight of [...incoming.weights, ...remote.weights]) weights.set(weight.date, weight)
  return {
    profile: remote.profile ?? incoming.profile,
    tasks: [...tasks.values()].sort((first, second) => first.date.localeCompare(second.date)),
    weights: [...weights.values()].sort((first, second) => first.date.localeCompare(second.date)),
    favorites: [...new Set([...remote.favorites, ...incoming.favorites])],
    preferences: {
      favoriteIngredients: [...new Set([...remote.preferences.favoriteIngredients, ...incoming.preferences.favoriteIngredients])],
      excludedIngredients: [...new Set([...remote.preferences.excludedIngredients, ...incoming.preferences.excludedIngredients])],
      dailyFoodBudget: remote.preferences.dailyFoodBudget ?? incoming.preferences.dailyFoodBudget,
    },
  }
}

function applyUserMutation(current: UserData, mutation: UserMutation): UserData {
  switch (mutation.type) {
    case 'profile':
      return { ...current, profile: mutation.profile }
    case 'tasks-upsert': {
      const tasks = new Map(current.tasks.map((task) => [`${task.date}:${task.id}`, task]))
      for (const task of mutation.tasks) {
        const key = `${task.date}:${task.id}`
        if (!tasks.has(key)) tasks.set(key, task)
      }
      return { ...current, tasks: [...tasks.values()] }
    }
    case 'task-set': {
      const task = mutation.task
      const key = `${task.date}:${task.id}`
      const tasks = new Map(current.tasks.map((item) => [`${item.date}:${item.id}`, item]))
      tasks.set(key, task)
      return { ...current, tasks: [...tasks.values()] }
    }
    case 'weight-upsert': {
      const weights = new Map(current.weights.map((entry) => [entry.date, entry]))
      weights.set(mutation.entry.date, mutation.entry)
      return { ...current, weights: [...weights.values()].sort((first, second) => first.date.localeCompare(second.date)) }
    }
    case 'preferences': {
      const applyListChanges = (currentItems: string[], baseItems: string[], nextItems: string[]) => {
        const merged = new Set(currentItems)
        const base = new Set(baseItems)
        const next = new Set(nextItems)
        for (const item of new Set([...baseItems, ...nextItems])) {
          if (base.has(item) === next.has(item)) continue
          if (next.has(item)) merged.add(item)
          else merged.delete(item)
        }
        return [...merged]
      }
      return {
        ...current,
        preferences: {
          favoriteIngredients: applyListChanges(
            current.preferences.favoriteIngredients,
            mutation.base.favoriteIngredients,
            mutation.preferences.favoriteIngredients,
          ),
          excludedIngredients: applyListChanges(
            current.preferences.excludedIngredients,
            mutation.base.excludedIngredients,
            mutation.preferences.excludedIngredients,
          ),
          dailyFoodBudget: mutation.base.dailyFoodBudget === mutation.preferences.dailyFoodBudget
            ? current.preferences.dailyFoodBudget
            : mutation.preferences.dailyFoodBudget,
        },
      }
    }
    case 'favorite-set': {
      const favorites = new Set(current.favorites)
      if (mutation.favorite) favorites.add(mutation.id)
      else favorites.delete(mutation.id)
      return { ...current, favorites: [...favorites] }
    }
  }
  return current
}

async function replayLocalChanges(
  services: Awaited<ReturnType<typeof getFirebaseServices>>,
  uid: string,
  initialData: UserData,
  snapshotExists: boolean,
): Promise<UserData> {
  const accountCache = readLocalCache(uid)
  const browserCache: LocalCache = uid === LOCAL_USER_ID
    ? { data: emptyUserData(), pending: [], legacy: false }
    : readLocalCache(LOCAL_USER_ID)
  const pending = [...browserCache.pending, ...accountCache.pending]
  const unjournaled = [
    ...(!snapshotExists || browserCache.legacy ? [browserCache.data] : []),
    ...(!snapshotExists || accountCache.legacy ? [accountCache.data] : []),
  ].filter((data) => hasUserData(data))
  if (!pending.length && !unjournaled.length) {
    try {
      saveLocalUserData(uid, initialData)
    } catch {
      return initialData
    }
    return initialData
  }

  const { doc, runTransaction } = await import('firebase/firestore')
  const reference = doc(services.db, USERS_COLLECTION, uid)
  const data = await runTransaction(services.db, async (transaction) => {
    const snapshot = await transaction.get(reference)
    let merged = snapshot.exists() ? normalizeUserData(snapshot.data()) : initialData
    for (const localData of unjournaled) merged = mergeAccountData(merged, localData)
    for (const mutation of pending) merged = applyUserMutation(merged, mutation)
    transaction.set(reference, merged)
    return merged
  })

  try {
    saveLocalUserData(uid, data)
  } catch {
    persistenceError = 'Data sudah tersinkron ke Firebase, tetapi salinan cache browser tidak dapat diperbarui.'
  }
  if (uid !== LOCAL_USER_ID && typeof localStorage !== 'undefined') {
    try {
      saveLocalUserData(LOCAL_USER_ID, browserCache.data)
    } catch {
      return data
    }
  }
  return data
}

function localUserId(): string {
  if (typeof localStorage === 'undefined') return LOCAL_USER_ID
  try {
    return localStorage.getItem(LOCAL_USER_ID_KEY) ?? LOCAL_USER_ID
  } catch {
    return LOCAL_USER_ID
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function readProfile(value: unknown): ProfileInput | null {
  if (!isRecord(value)) return null
  const profile = value as unknown as ProfileInput
  if (
    (profile.gender !== 'male' && profile.gender !== 'female') ||
    !['sedentary', 'light', 'moderate', 'active'].includes(profile.activity) ||
    (profile.goal !== 'loss' && profile.goal !== 'gain') ||
    typeof profile.healthConcern !== 'boolean' ||
    Object.keys(validateProfileInput(profile)).length > 0 ||
    !isAdultForCalculator(profile.age)
  ) return null
  if (profile.targetWeightKg !== undefined) {
    if (!Number.isFinite(profile.targetWeightKg) || profile.targetWeightKg < 25 || profile.targetWeightKg > 300) return null
  }
  return profile
}

function readTasks(value: unknown): DailyTask[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is DailyTask =>
    isRecord(item) && typeof item.id === 'string' && item.id.length <= 180 &&
    typeof item.title === 'string' && item.title.length <= 180 && isIsoDate(item.date) &&
    typeof item.done === 'boolean' &&
    (item.program === undefined || item.program === 'loss' || item.program === 'gain'),
  ).slice(-1000)
}

function readWeights(value: unknown): WeightEntry[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is WeightEntry =>
    isRecord(item) && isIsoDate(item.date) && typeof item.weightKg === 'number' &&
    Number.isFinite(item.weightKg) && item.weightKg >= 25 && item.weightKg <= 300,
  ).slice(-1000)
}

function normalizeUserData(value: unknown): UserData {
  if (!isRecord(value)) return emptyUserData()
  const rawPreferences = isRecord(value.preferences) ? value.preferences : {}
  const budget = rawPreferences.dailyFoodBudget
  return {
    profile: readProfile(value.profile),
    tasks: readTasks(value.tasks),
    weights: readWeights(value.weights),
    favorites: readStringList(value.favorites, 100),
    preferences: {
      favoriteIngredients: readStringList(rawPreferences.favoriteIngredients, 20, 40),
      excludedIngredients: readStringList(rawPreferences.excludedIngredients, 20, 40),
      dailyFoodBudget: Number.isInteger(budget) && Number(budget) >= 5000 && Number(budget) <= 1000000
        ? Number(budget)
        : null,
    },
  }
}

function localDataKey(uid: string): string {
  return `${LOCAL_DATA_PREFIX}${uid}`
}

function isUserMutation(value: unknown): value is UserMutation {
  if (!isRecord(value) || typeof value.type !== 'string') return false
  switch (value.type) {
    case 'profile': return !!readProfile(value.profile)
    case 'tasks-upsert': return Array.isArray(value.tasks) && readTasks(value.tasks).length === value.tasks.length
    case 'task-set': return readTasks([value.task]).length === 1
    case 'weight-upsert': return readWeights([value.entry]).length === 1
    case 'preferences': return isRecord(value.preferences) && isRecord(value.base)
      && Array.isArray(value.preferences.favoriteIngredients)
      && Array.isArray(value.preferences.excludedIngredients)
      && Array.isArray(value.base.favoriteIngredients)
      && Array.isArray(value.base.excludedIngredients)
    case 'favorite-set': return typeof value.id === 'string' && value.id.length > 0 && typeof value.favorite === 'boolean'
    default: return false
  }
}

function readLocalCache(uid: string): LocalCache {
  if (typeof localStorage === 'undefined') return { data: emptyUserData(), pending: [], legacy: false }
  try {
    const saved = localStorage.getItem(localDataKey(uid))
    if (!saved) return { data: emptyUserData(), pending: [], legacy: false }
    const parsed: unknown = JSON.parse(saved)
    if (isRecord(parsed) && parsed.version === LOCAL_CACHE_VERSION && isRecord(parsed.data)) {
      return {
        data: normalizeUserData(parsed.data),
        pending: Array.isArray(parsed.pending) ? parsed.pending.filter(isUserMutation).slice(-500) : [],
        legacy: false,
      }
    }
    return { data: normalizeUserData(parsed), pending: [], legacy: true }
  } catch {
    return { data: emptyUserData(), pending: [], legacy: false }
  }
}

function readLocalUserData(uid: string): UserData {
  return readLocalCache(uid).data
}

function hasUserData(data: UserData): boolean {
  return !!data.profile || data.tasks.length > 0 || data.weights.length > 0 ||
    data.favorites.length > 0 || data.preferences.dailyFoodBudget !== null ||
    data.preferences.favoriteIngredients.length > 0 || data.preferences.excludedIngredients.length > 0
}

function saveLocalUserData(uid: string, data: UserData, pending: UserMutation[] = []): void {
  if (typeof localStorage === 'undefined') throw new Error('Penyimpanan lokal tidak tersedia di browser ini.')
  try {
    localStorage.setItem(localDataKey(uid), JSON.stringify({
      version: LOCAL_CACHE_VERSION,
      data,
      pending: pending.slice(-500),
    }))
  } catch {
    throw new Error('Penyimpanan lokal penuh atau tidak tersedia. Kosongkan ruang browser, lalu coba lagi.')
  }
}

export async function ensureSignedIn(): Promise<string> {
  if (!isFirebaseConfigured()) {
    persistenceMode = 'local'
    persistenceError = getFirebaseConfigurationError()
    accountEmail = null
    anonymousAccount = null
    return localUserId()
  }
  try {
    const { signInAnonymously } = await import('firebase/auth')
    const services = await getFirebaseServices()
    await services.auth.authStateReady()
    const uid = services.auth.currentUser?.uid ?? (await signInAnonymously(services.auth)).user.uid
    persistenceMode = 'cloud'
    persistenceError = null
    accountEmail = services.auth.currentUser?.email ?? null
    anonymousAccount = services.auth.currentUser?.isAnonymous ?? true
    try {
      localStorage.setItem(LOCAL_USER_ID_KEY, uid)
    } catch {
      return uid
    }
    return uid
  } catch (error) {
    persistenceMode = 'local'
    persistenceError = describeFirebaseError(error)
    accountEmail = null
    anonymousAccount = null
    return localUserId()
  }
}

export async function connectEmailAccount(
  email: string,
  password: string,
  mode: 'create' | 'sign-in',
  currentData: UserData,
): Promise<string> {
  if (!isFirebaseConfigured()) {
    persistenceError = getFirebaseConfigurationError()
    throw new Error(persistenceError)
  }
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail || password.length < 6) throw new Error('Masukkan email valid dan kata sandi minimal 6 karakter.')

  try {
    const authSdk = await import('firebase/auth')
    const services = await getFirebaseServices()
    await services.auth.authStateReady()
    const previousUser = services.auth.currentUser
    if (previousUser?.isAnonymous && hasUserData(currentData)) {
      saveLocalUserData(previousUser.uid, currentData, readLocalCache(previousUser.uid).pending)
    }

    const credential = mode === 'create' && previousUser?.isAnonymous
      ? await authSdk.linkWithCredential(previousUser, authSdk.EmailAuthProvider.credential(normalizedEmail, password))
      : mode === 'create'
        ? await authSdk.createUserWithEmailAndPassword(services.auth, normalizedEmail, password)
        : await authSdk.signInWithEmailAndPassword(services.auth, normalizedEmail, password)

    const uid = credential.user.uid
    persistenceMode = 'cloud'
    persistenceError = null
    accountEmail = credential.user.email
    anonymousAccount = credential.user.isAnonymous
    try {
      localStorage.setItem(LOCAL_USER_ID_KEY, uid)
    } catch {
      // Firebase remains the source of truth when browser caching is unavailable.
    }

    if (hasUserData(currentData)) {
      const { doc, getDoc } = await import('firebase/firestore')
      const accountDocument = doc(services.db, USERS_COLLECTION, uid)
      const snapshot = await getDoc(accountDocument)
      const remoteData = snapshot.exists() ? normalizeUserData(snapshot.data()) : emptyUserData()
      const mergedData = mergeAccountData(remoteData, currentData)
      await saveUserData(uid, mergedData)
      if (uid !== LOCAL_USER_ID) saveLocalUserData(LOCAL_USER_ID, currentData)
    }
    return uid
  } catch (error) {
    persistenceError = describeFirebaseError(error)
    throw new Error(persistenceError)
  }
}

export async function fetchUserData(uid: string): Promise<UserData> {
  if (persistenceMode === 'local') return readLocalUserData(uid)
  try {
    const services = await getFirebaseServices()
    const { doc, getDoc } = await import('firebase/firestore')
    const snapshot = await getDoc(doc(services.db, USERS_COLLECTION, uid))
    const initialData = snapshot.exists() ? normalizeUserData(snapshot.data()) : emptyUserData()
    const data = await replayLocalChanges(services, uid, initialData, snapshot.exists())
    persistenceMode = 'cloud'
    persistenceError = null
    return data
  } catch (error) {
    persistenceMode = 'local'
    persistenceError = describeFirebaseError(error)
    const localData = readLocalUserData(uid)
    return hasUserData(localData) ? localData : readLocalUserData(LOCAL_USER_ID)
  }
}

export async function saveUserData(uid: string, data: UserData, mutation?: UserMutation): Promise<UserData> {
  const normalized = normalizeUserData(data)
  if (persistenceMode === 'local' || !isFirebaseConfigured()) {
    persistenceMode = 'local'
    if (!isFirebaseConfigured()) persistenceError = getFirebaseConfigurationError()
    const cache = readLocalCache(uid)
    const next = mutation ? applyUserMutation(cache.data, mutation) : normalized
    saveLocalUserData(uid, next, mutation ? [...cache.pending, mutation] : cache.pending)
    return next
  }
  try {
    const [{ doc, runTransaction }, services] = await Promise.all([
      import('firebase/firestore'),
      getFirebaseServices(),
    ])
    const reference = doc(services.db, USERS_COLLECTION, uid)
    const persisted = await runTransaction(services.db, async (transaction) => {
      const snapshot = await transaction.get(reference)
      const current = snapshot.exists() ? normalizeUserData(snapshot.data()) : emptyUserData()
      const next = mutation ? applyUserMutation(current, mutation) : mergeAccountData(current, normalized)
      transaction.set(reference, next)
      return next
    })
    persistenceMode = 'cloud'
    persistenceError = null
    try {
      saveLocalUserData(uid, persisted)
    } catch {
      return persisted
    }
    return persisted
  } catch (error) {
    persistenceMode = 'local'
    persistenceError = describeFirebaseError(error)
    const cache = readLocalCache(uid)
    const next = mutation ? applyUserMutation(cache.data, mutation) : mergeAccountData(cache.data, normalized)
    saveLocalUserData(uid, next, mutation ? [...cache.pending, mutation] : cache.pending)
    return next
  }
}
