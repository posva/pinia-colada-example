import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
