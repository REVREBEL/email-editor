// src/router/index.ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import Example from '@/views/Example.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: Example },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})


