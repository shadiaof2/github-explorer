import { ref, watch } from 'vue'
// 为泛型 T 添加 extends object 约束
export function useDebounce<T extends object>(value: T, delay: number = 500) {
  const debouncedValue = ref<T>(value)
  let timeoutId: ReturnType<typeof setTimeout>
  watch(value, (newValue) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 500,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
