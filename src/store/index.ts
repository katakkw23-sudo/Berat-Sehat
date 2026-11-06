import { createStore } from 'vuex'
import user, { type UserState } from './user'

export interface RootState {
  user: UserState
}

export const store = createStore<RootState>({
  modules: { user },
})
