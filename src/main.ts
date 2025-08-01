import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from './App.vue'
import EditPageReal from './components/EditPageReal.vue'
import ExportPageReal from './components/ExportPageReal.vue'
import HomePage from './components/HomePage.vue'
import SettingPage from './components/SettingPage.vue'
import TreeFiles from './components/TreeFiles.vue'
import i18n from './i18n'
import 'virtual:uno.css'

const routes = [
  { path: '/', component: HomePage },
  { path: '/files', component: TreeFiles },
  { path: '/edit', component: EditPageReal },
  { path: '/export', component: ExportPageReal },
  { path: '/settings', component: SettingPage },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

const pinia = createPinia()

createApp(App).use(pinia).use(router).use(i18n).mount('#app')
