<script setup>
import { computed, ref } from 'vue'
import { useData } from 'vitepress'

defineProps({
  prompt: { type: String, required: true },
})

const { lang } = useData()
const zh = computed(() => String(lang.value || '').toLowerCase().startsWith('zh'))

const open = ref(false)
</script>

<template>
  <div class="tbp-retrieval" :class="{ 'is-open': open }">
    <p class="tbp-retrieval__prompt">{{ prompt }}</p>
    <button
      type="button"
      class="tbp-retrieval__toggle"
      :aria-expanded="open"
      @click="open = !open"
    >
      {{ open ? (zh ? '收起答案' : 'Hide answer') : zh ? '显示答案' : 'Reveal answer' }}
    </button>
    <div class="tbp-retrieval__answer">
      <slot />
    </div>
  </div>
</template>
