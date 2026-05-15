/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  auth: {
    register: typeof routes['auth.register'] & {
      show: typeof routes['auth.register.show']
    }
    login: typeof routes['auth.login'] & {
      show: typeof routes['auth.login.show']
    }
    logout: typeof routes['auth.logout']
  }
}
