import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
import vSelect from 'vue-select'
import { DatePicker, setupCalendar } from 'v-calendar'

import 'vue-select/dist/vue-select.css'
import 'v-calendar/dist/style.css'

const app = createApp(App)

app.use(router)
app.use(VueApexCharts)
app.use(setupCalendar, {})

app.component('VDatePicker', DatePicker)
app.component('v-select', vSelect)

app.mount('#app')