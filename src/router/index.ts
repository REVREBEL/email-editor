// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import Example from '@/views/Example.vue'
import DevExample from '@/views/dev-example.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: Example },
  { path: '/dev', name: 'dev', component: DevExample },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})


