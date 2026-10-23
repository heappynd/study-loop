<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({
  title: { type: String, required: true },
})

const { page } = useData()
const done = ref(false)

// 勾选状态按「页面 + 步骤标题」存到浏览器，刷新和回来复习都不会丢。
// 读取只能发生在 onMounted：服务端没有 localStorage。
const storageKey = computed(() => `study-loop:step:${page.value.relativePath}:${props.title}`)

onMounted(() => {
  try {
    done.value = window.localStorage.getItem(storageKey.value) === '1'
  } catch {
    // 隐私模式下不可用就退回内存状态
  }
})

watch(done, (value) => {
  try {
    window.localStorage.setItem(storageKey.value, value ? '1' : '0')
  } catch {
    // 同上
  }
})
</script>

<template>
  <li class="tbp-step" :class="{ 'is-done': done }">
    <label>
      <input v-model="done" type="checkbox" />
      <span class="tbp-step__title">{{ title }}</span>
    </label>
    <div class="tbp-step__body">
      <slot />
    </div>
  </li>
</template>
