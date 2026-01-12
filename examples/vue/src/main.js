import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { defineCustomElements } from 'erixeditor/loader'

defineCustomElements()

createApp(App).mount('#app')
