<script lang="ts">
import { defineColadaLoader } from 'unplugin-vue-router/data-loaders/pinia-colada'

export const useTestData = defineColadaLoader({
  async query() {
    return { message: 'Hello World' }
  },
  key: () => ['message'],
})
</script>

<script setup lang="ts">
const { data: message } = useTestData()
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    <p>{{ message }}</p>
  </div>
</template>
