/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'auth.register.show': {
    methods: ["GET","HEAD"],
    pattern: '/register',
    tokens: [{"old":"/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register.show']['types'],
  },
  'auth.register': {
    methods: ["POST"],
    pattern: '/register',
    tokens: [{"old":"/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register']['types'],
  },
  'auth.login.show': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login.show']['types'],
  },
  'auth.login': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'auth.logout': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'posts.index': {
    methods: ["GET","HEAD"],
    pattern: '/posts',
    tokens: [{"old":"/posts","type":0,"val":"posts","end":""}],
    types: placeholder as Registry['posts.index']['types'],
  },
  'posts.create': {
    methods: ["GET","HEAD"],
    pattern: '/posts/create',
    tokens: [{"old":"/posts/create","type":0,"val":"posts","end":""},{"old":"/posts/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['posts.create']['types'],
  },
  'posts.edit': {
    methods: ["GET","HEAD"],
    pattern: '/posts/:id/edit',
    tokens: [{"old":"/posts/:id/edit","type":0,"val":"posts","end":""},{"old":"/posts/:id/edit","type":1,"val":"id","end":""},{"old":"/posts/:id/edit","type":0,"val":"edit","end":""}],
    types: placeholder as Registry['posts.edit']['types'],
  },
  'posts.show': {
    methods: ["GET","HEAD"],
    pattern: '/posts/:id',
    tokens: [{"old":"/posts/:id","type":0,"val":"posts","end":""},{"old":"/posts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['posts.show']['types'],
  },
  'posts.store': {
    methods: ["POST"],
    pattern: '/posts',
    tokens: [{"old":"/posts","type":0,"val":"posts","end":""}],
    types: placeholder as Registry['posts.store']['types'],
  },
  'posts.update': {
    methods: ["PUT"],
    pattern: '/posts/:id',
    tokens: [{"old":"/posts/:id","type":0,"val":"posts","end":""},{"old":"/posts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['posts.update']['types'],
  },
  'posts.destroy': {
    methods: ["DELETE"],
    pattern: '/posts/:id',
    tokens: [{"old":"/posts/:id","type":0,"val":"posts","end":""},{"old":"/posts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['posts.destroy']['types'],
  },
  'comments.store': {
    methods: ["POST"],
    pattern: '/posts/:postId/comments',
    tokens: [{"old":"/posts/:postId/comments","type":0,"val":"posts","end":""},{"old":"/posts/:postId/comments","type":1,"val":"postId","end":""},{"old":"/posts/:postId/comments","type":0,"val":"comments","end":""}],
    types: placeholder as Registry['comments.store']['types'],
  },
  'comments.destroy': {
    methods: ["DELETE"],
    pattern: '/posts/:postId/comments/:id',
    tokens: [{"old":"/posts/:postId/comments/:id","type":0,"val":"posts","end":""},{"old":"/posts/:postId/comments/:id","type":1,"val":"postId","end":""},{"old":"/posts/:postId/comments/:id","type":0,"val":"comments","end":""},{"old":"/posts/:postId/comments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['comments.destroy']['types'],
  },
  'post_likes.store': {
    methods: ["POST"],
    pattern: '/posts/:postId/likes',
    tokens: [{"old":"/posts/:postId/likes","type":0,"val":"posts","end":""},{"old":"/posts/:postId/likes","type":1,"val":"postId","end":""},{"old":"/posts/:postId/likes","type":0,"val":"likes","end":""}],
    types: placeholder as Registry['post_likes.store']['types'],
  },
  'post_likes.destroy': {
    methods: ["DELETE"],
    pattern: '/posts/:postId/likes',
    tokens: [{"old":"/posts/:postId/likes","type":0,"val":"posts","end":""},{"old":"/posts/:postId/likes","type":1,"val":"postId","end":""},{"old":"/posts/:postId/likes","type":0,"val":"likes","end":""}],
    types: placeholder as Registry['post_likes.destroy']['types'],
  },
  'comment_likes.store': {
    methods: ["POST"],
    pattern: '/posts/:postId/comments/:commentId/likes',
    tokens: [{"old":"/posts/:postId/comments/:commentId/likes","type":0,"val":"posts","end":""},{"old":"/posts/:postId/comments/:commentId/likes","type":1,"val":"postId","end":""},{"old":"/posts/:postId/comments/:commentId/likes","type":0,"val":"comments","end":""},{"old":"/posts/:postId/comments/:commentId/likes","type":1,"val":"commentId","end":""},{"old":"/posts/:postId/comments/:commentId/likes","type":0,"val":"likes","end":""}],
    types: placeholder as Registry['comment_likes.store']['types'],
  },
  'comment_likes.destroy': {
    methods: ["DELETE"],
    pattern: '/posts/:postId/comments/:commentId/likes',
    tokens: [{"old":"/posts/:postId/comments/:commentId/likes","type":0,"val":"posts","end":""},{"old":"/posts/:postId/comments/:commentId/likes","type":1,"val":"postId","end":""},{"old":"/posts/:postId/comments/:commentId/likes","type":0,"val":"comments","end":""},{"old":"/posts/:postId/comments/:commentId/likes","type":1,"val":"commentId","end":""},{"old":"/posts/:postId/comments/:commentId/likes","type":0,"val":"likes","end":""}],
    types: placeholder as Registry['comment_likes.destroy']['types'],
  },
  'tags.show': {
    methods: ["GET","HEAD"],
    pattern: '/tags/:slug',
    tokens: [{"old":"/tags/:slug","type":0,"val":"tags","end":""},{"old":"/tags/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['tags.show']['types'],
  },
  'users.show': {
    methods: ["GET","HEAD"],
    pattern: '/users/:username',
    tokens: [{"old":"/users/:username","type":0,"val":"users","end":""},{"old":"/users/:username","type":1,"val":"username","end":""}],
    types: placeholder as Registry['users.show']['types'],
  },
  'users.edit': {
    methods: ["GET","HEAD"],
    pattern: '/users/:username/edit',
    tokens: [{"old":"/users/:username/edit","type":0,"val":"users","end":""},{"old":"/users/:username/edit","type":1,"val":"username","end":""},{"old":"/users/:username/edit","type":0,"val":"edit","end":""}],
    types: placeholder as Registry['users.edit']['types'],
  },
  'users.update': {
    methods: ["PUT"],
    pattern: '/users/:username',
    tokens: [{"old":"/users/:username","type":0,"val":"users","end":""},{"old":"/users/:username","type":1,"val":"username","end":""}],
    types: placeholder as Registry['users.update']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
