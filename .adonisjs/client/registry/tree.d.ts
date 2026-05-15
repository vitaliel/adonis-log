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
  posts: {
    index: typeof routes['posts.index']
    create: typeof routes['posts.create']
    edit: typeof routes['posts.edit']
    show: typeof routes['posts.show']
    store: typeof routes['posts.store']
    update: typeof routes['posts.update']
    destroy: typeof routes['posts.destroy']
  }
  tags: {
    show: typeof routes['tags.show']
  }
}
