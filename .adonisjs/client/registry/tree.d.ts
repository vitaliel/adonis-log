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
  comments: {
    store: typeof routes['comments.store']
    destroy: typeof routes['comments.destroy']
  }
  postLikes: {
    store: typeof routes['post_likes.store']
    destroy: typeof routes['post_likes.destroy']
  }
  commentLikes: {
    store: typeof routes['comment_likes.store']
    destroy: typeof routes['comment_likes.destroy']
  }
  tags: {
    show: typeof routes['tags.show']
  }
  users: {
    show: typeof routes['users.show']
    edit: typeof routes['users.edit']
    update: typeof routes['users.update']
  }
}
