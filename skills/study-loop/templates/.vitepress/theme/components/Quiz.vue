<script setup>
import { computed, nextTick, ref } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({
  question: { type: String, required: true },
  options: { type: Array, required: true },
  answer: { type: [Number, Array], required: true },
  multiple: { type: Boolean, default: false },
  explanation: { type: String, default: '' },
})

const { lang } = useData()
const zh = computed(() => String(lang.value || '').toLowerCase().startsWith('zh'))

const t = computed(() =>
  zh.value
    ? {
        multiple: '（可多选）',
        check: '核对答案',
        correct: '答对了。',
        wrong: '还不对。',
        answer: '正确答案：',
        retry: '再试一次',
      }
    : {
        multiple: '(select all that apply)',
        check: 'Check answer',
        correct: 'Correct.',
        wrong: 'Not quite.',
        answer: 'Correct answer: ',
        retry: 'Try again',
      },
)

const picked = ref([])
const submitted = ref(false)
const feedback = ref(null)

const correct = computed(() =>
  Array.isArray(props.answer) ? [...props.answer] : [props.answer],
)

const isCorrect = computed(() => {
  if (!submitted.value) return false
  const chosen = [...picked.value].sort((a, b) => a - b)
  const expected = [...correct.value].sort((a, b) => a - b)
  return (
    chosen.length === expected.length && chosen.every((value, i) => value === expected[i])
  )
})

function letter(i) {
  return String.fromCharCode(65 + i)
}

function reveal() {
  submitted.value = true
  // 判分后把焦点移到反馈区：按钮仍可聚焦（aria-disabled），键盘用户不会丢失上下文。
  nextTick(() => feedback.value && feedback.value.focus())
}

function choose(i) {
  if (submitted.value) return

  if (props.multiple) {
    picked.value = picked.value.includes(i)
      ? picked.value.filter((value) => value !== i)
      : [...picked.value, i]
    return
  }

  picked.value = [i]
  reveal()
}

function check() {
  if (picked.value.length) reveal()
}

function reset() {
  picked.value = []
  submitted.value = false
}
</script>

<template>
  <div class="tbp-quiz">
    <p class="tbp-quiz__question">
      {{ question }}
      <span v-if="multiple" class="tbp-quiz__note">{{ t.multiple }}</span>
    </p>

    <ul class="tbp-quiz__options">
      <li v-for="(option, i) in options" :key="i">
        <button
          type="button"
          :aria-disabled="submitted ? 'true' : 'false'"
          :aria-pressed="picked.includes(i)"
          :class="{
            picked: picked.includes(i),
            answer: submitted && correct.includes(i),
            wrong: submitted && picked.includes(i) && !correct.includes(i),
          }"
          @click="choose(i)"
        >
          <span class="mark" aria-hidden="true">{{ letter(i) }}</span>
          <span>{{ option }}</span>
        </button>
      </li>
    </ul>

    <div v-if="multiple && !submitted" class="tbp-quiz__actions">
      <button type="button" :disabled="!picked.length" @click="check">{{ t.check }}</button>
    </div>

    <div v-if="submitted" ref="feedback" class="tbp-quiz__feedback" role="status" tabindex="-1">
      <p><strong>{{ isCorrect ? t.correct : t.wrong }}</strong></p>
      <p v-if="explanation">{{ explanation }}</p>
      <p v-if="!isCorrect" class="tbp-quiz__note">
        {{ t.answer }}{{ correct.map(letter).join(', ') }}
      </p>
      <button type="button" class="tbp-quiz__reset" @click="reset">{{ t.retry }}</button>
    </div>
  </div>
</template>
