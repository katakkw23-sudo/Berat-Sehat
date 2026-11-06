import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

export interface FirebaseServices {
  app: FirebaseApp
  auth: Auth
  db: Firestore
}

let services: FirebaseServices | null = null
let servicesPromise: Promise<FirebaseServices> | null = null

function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    ...(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
      ? { storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET }
      : {}),
    ...(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
      ? { messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID }
      : {}),
  }
}

export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig()
  return [config.apiKey, config.authDomain, config.projectId, config.appId]
    .every((value) => typeof value === 'string' && value.trim().length > 0 && !value.startsWith('your-'))
}

export function getFirebaseConfigurationError(): string {
  const config = getFirebaseConfig()
  const missing = [
    ['VITE_FIREBASE_API_KEY', config.apiKey],
    ['VITE_FIREBASE_AUTH_DOMAIN', config.authDomain],
    ['VITE_FIREBASE_PROJECT_ID', config.projectId],
    ['VITE_FIREBASE_APP_ID', config.appId],
  ].filter(([, value]) => typeof value !== 'string' || value.trim().length === 0 || value.startsWith('your-'))
    .map(([name]) => name)
  return missing.length
    ? `Firebase belum dikonfigurasi. Isi ${missing.join(', ')} dari konfigurasi aplikasi Web Firebase.`
    : 'Firebase belum dapat diinisialisasi. Periksa konfigurasi aplikasi Web Firebase.'
}

export async function getFirebaseServices(): Promise<FirebaseServices> {
  if (services) return services
  if (servicesPromise) return servicesPromise
  const config = getFirebaseConfig()
  if (!isFirebaseConfigured()) {
    throw new Error(getFirebaseConfigurationError())
  }
  servicesPromise = Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ]).then(([appSdk, authSdk, firestoreSdk]) => {
    const app = appSdk.initializeApp(config)
    services = {
      app,
      auth: authSdk.getAuth(app),
      db: firestoreSdk.getFirestore(app),
    }
    return services
  }).catch((error: unknown) => {
    servicesPromise = null
    throw error
  })
  return servicesPromise
}
