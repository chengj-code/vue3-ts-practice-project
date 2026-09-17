// Element Plus 官方暗色模式：配合 <html class="dark"> 生效（须早于 main.css，品牌色覆盖在 main.css）
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/main.css'
// 函数式组件不会被 unplugin-vue-components 捕获，需手动引入样式
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/notification/style/css'
import 'element-plus/es/components/loading/style/css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import directives from '@/directives'

const app = createApp(App)

app.use(createPinia().use(piniaPluginPersistedstate))
app.use(router)
Object.entries(directives).forEach(([name, directive]) => {
    app.directive(name, directive)
})
app.mount('#app')
