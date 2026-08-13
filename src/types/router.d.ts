import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    particles?: 'high' | 'low' | 'off'
  }
}
