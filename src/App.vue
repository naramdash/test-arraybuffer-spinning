<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
import MyWorker from './MyWorker.worker?worker'

const lastLogMode = false

const worker = new MyWorker()
const logs = ref<[string, string, string][]>([])
const lastLog = ref<number>(NaN)

watchEffect(() => {
  if (logs.value.length > 10) logs.value.pop()
})
onMounted(() => {
  worker.addEventListener('message', (event) => {
    const view = new Uint8Array(event.data)

    if (lastLogMode) {
      lastLog.value = view[0]
    } else {
      logs.value.unshift(['Main Thread', 'PASSED MSSG', `CUR: ${view[0]}`])
    }

    const vBefore = view[0]
    const vAfter = view[0] + 1
    view[0] = vAfter

    console.group("Main Thread");
    console.log("Main Thread view[0] before", vBefore);
    console.log("Main Thread view[0] after", vAfter);
    console.groupEnd();

    setTimeout(() => {
      if (lastLogMode) {
        lastLog.value = view[0]
      } else {
        logs.value.unshift(['Main Thread', 'BEFORE PASS', `CUR: ${view[0]}`])
      }
      worker.postMessage(event.data, [event.data])
    }, 200);
  })

  const buffer = new ArrayBuffer(8 * 1024)
  if (lastLogMode) {
    lastLog.value = new Uint8Array(buffer)[0]
  } else {
    logs.value.unshift(['Main Thread', 'BEFORE PASS', `CUR: ${new Uint8Array(buffer)[0]}`])
  }
  worker.postMessage(buffer, [buffer])
})

onUnmounted(() => {
  worker.terminate()
})


</script>

<template>
  <h1>arraybuffer spinning</h1>

  <div v-if="lastLogMode">
    <p>{{ lastLog }}</p>
  </div>

  <div v-if="!lastLogMode">
    <p :key="i" v-for="log, i of logs">
      <span class="w-100 text-center">{{ log[0] }}</span>
      |
      <span class="w-150 text-center">{{ log[1] }}</span>
      |
      <span class="w-100 text-center">{{ log[2] }}</span>
    </p>
  </div>
</template>

<style scoped>
.w-100 {
  display: inline-block;
  width: 100px;
}

.w-150 {
  display: inline-block;
  width: 150px;
}

.text-center {
  text-align: center;
}
</style>
