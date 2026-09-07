import DefaultTheme from 'vitepress/theme'
import type { App } from 'vue'
import Mermaid from './Mermaid.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: App }) {
    app.component('Mermaid', Mermaid)
  }
}
