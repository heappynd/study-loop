<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

defineProps({
  title: { type: String, required: true },
  url: { type: String, required: true },
  author: { type: String, default: '' },
  note: { type: String, default: '' },
})

const { lang } = useData()
const zh = computed(() => String(lang.value || '').toLowerCase().startsWith('zh'))
</script>

<template>
  <aside class="tbp-source">
    <p class="tbp-source__label">{{ zh ? '主要来源' : 'Primary source' }}</p>
    <p class="tbp-source__title">
      <a :href="url" target="_blank" rel="noreferrer">{{ title }}</a>
    </p>
    <p v-if="author" class="tbp-source__author">{{ author }}</p>
    <p v-if="note" class="tbp-source__note">{{ note }}</p>
  </aside>
</template>
