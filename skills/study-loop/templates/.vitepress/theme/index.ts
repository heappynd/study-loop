import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Quiz from './components/Quiz.vue'
import Retrieval from './components/Retrieval.vue'
import Step from './components/Step.vue'
import Steps from './components/Steps.vue'
import Source from './components/Source.vue'
import './styles/course.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Quiz', Quiz)
    app.component('Retrieval', Retrieval)
    app.component('Steps', Steps)
    app.component('Step', Step)
    app.component('Source', Source)
  },
} satisfies Theme
