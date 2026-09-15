import { ref } from 'vue'
import type { FormInstance } from 'element-plus'

export function useForm<F extends Record<string, unknown>>(options: {
    initialData: F,
    onSubmit: (data: F) => Promise<void>
}) {
    const form = ref<F>({ ...options.initialData })
    const loading = ref(false);
    const formRef = ref<FormInstance | null>(null);

    const submit = async () => {
        if (formRef.value) {
            try {
                await formRef.value.validate();
            } catch {
                return;
            }
        }
        loading.value = true;
        try {
            await options.onSubmit(form.value);
        } finally {
            loading.value = false;
        }
    }

    const reset = () => {
        form.value = { ...options.initialData };
        formRef.value?.clearValidate();
    }
    return {
        form,
        loading,
        formRef,
        submit,
        reset,
    }
}