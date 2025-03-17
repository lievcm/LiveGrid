import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import MonitorView from '@/views/MonitorView.vue'
import HistoricalView from '@/views/HistoricalView.vue'
import SettingsView from '@/views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: DashboardView
    },
    {
      path: '/Monitor',
      name: 'Monitor',
      component: MonitorView
    },
    {
      path: '/Historical',
      name: 'Historical',
      component: HistoricalView
    },
    {
      path: '/Settings',
      name: 'Settings',
      component: SettingsView
    }
  ],
})

export default router
