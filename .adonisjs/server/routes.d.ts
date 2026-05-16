import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'auth.register.show': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login.show': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'posts.index': { paramsTuple?: []; params?: {} }
    'posts.create': { paramsTuple?: []; params?: {} }
    'posts.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'posts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'posts.store': { paramsTuple?: []; params?: {} }
    'posts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'posts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'comments.store': { paramsTuple: [ParamValue]; params: {'postId': ParamValue} }
    'comments.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'postId': ParamValue,'id': ParamValue} }
    'post_likes.store': { paramsTuple: [ParamValue]; params: {'postId': ParamValue} }
    'post_likes.destroy': { paramsTuple: [ParamValue]; params: {'postId': ParamValue} }
    'comment_likes.store': { paramsTuple: [ParamValue,ParamValue]; params: {'postId': ParamValue,'commentId': ParamValue} }
    'comment_likes.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'postId': ParamValue,'commentId': ParamValue} }
    'tags.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'users.show': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
    'users.edit': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
    'users.update': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'auth.register.show': { paramsTuple?: []; params?: {} }
    'auth.login.show': { paramsTuple?: []; params?: {} }
    'posts.index': { paramsTuple?: []; params?: {} }
    'posts.create': { paramsTuple?: []; params?: {} }
    'posts.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'posts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tags.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'users.show': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
    'users.edit': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'auth.register.show': { paramsTuple?: []; params?: {} }
    'auth.login.show': { paramsTuple?: []; params?: {} }
    'posts.index': { paramsTuple?: []; params?: {} }
    'posts.create': { paramsTuple?: []; params?: {} }
    'posts.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'posts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tags.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'users.show': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
    'users.edit': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
  }
  POST: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'posts.store': { paramsTuple?: []; params?: {} }
    'comments.store': { paramsTuple: [ParamValue]; params: {'postId': ParamValue} }
    'post_likes.store': { paramsTuple: [ParamValue]; params: {'postId': ParamValue} }
    'comment_likes.store': { paramsTuple: [ParamValue,ParamValue]; params: {'postId': ParamValue,'commentId': ParamValue} }
  }
  PUT: {
    'posts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.update': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
  }
  DELETE: {
    'posts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'comments.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'postId': ParamValue,'id': ParamValue} }
    'post_likes.destroy': { paramsTuple: [ParamValue]; params: {'postId': ParamValue} }
    'comment_likes.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'postId': ParamValue,'commentId': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}