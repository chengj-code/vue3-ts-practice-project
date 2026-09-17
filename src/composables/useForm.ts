import { ref } from 'vue'
import type { FormInstance } from 'element-plus'

export function useForm<F extends object>(options: {
  initialData: F
  onSubmit: (data: F) => Promise<void>
}) {
  const form = ref<F>({ ...options.initialData })
  const loading = ref(false)
  const formRef = ref<FormInstance | null>(null)

  /**
   * 校验 + 提交，返回布尔给调用方做「是否继续下一步」的门禁：
   * 校验失败返回 false（不抛错，Element Plus 已在表单项下展示错误文案）；
   * 校验通过且 onSubmit 执行完返回 true。
   * 单段式页面（如登录页）可忽略返回值；两段式组合（useForm + useModal）
   * 必须根据返回值决定是否调 confirm，否则请求会绕过校验发出。
   */
  const submit = async (): Promise<boolean> => {
    if (formRef.value) {
      try {
        await formRef.value.validate()
      } catch {
        return false
      }
    }
    loading.value = true
    try {
      await options.onSubmit(form.value)
    } finally {
      loading.value = false
    }
    return true
  }

  const reset = () => {
    form.value = { ...options.initialData }
    formRef.value?.clearValidate()
  }
  return {
    form,
    loading,
    formRef,
    submit,
    reset,
  }
}
