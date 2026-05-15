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
    'tags.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
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
  }
  POST: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'posts.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'posts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'posts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}