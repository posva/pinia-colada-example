import { createRouter, createWebHistory } from 'vue-router'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return {
        ...savedPosition,
        behavior: 'smooth',
      }
    }

    return {
      top: 0,
      behavior: 'instant',
    }
  },
})

if (import.meta.hot) {
  handleHotUpdate(router)
}
