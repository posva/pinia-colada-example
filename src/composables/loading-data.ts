import { router } from '@/router'
import { ref } from 'vue'

export const isNavigating = ref(false)

router.beforeEach(() => {
  console.log('Loading data...')
  isNavigating.value = true
})
router.afterEach(() => {
  console.log('Loading data DONE')
  isNavigating.value = false
})
router.onError((error) => {
  isNavigating.value = false
  console.error(error)
})
