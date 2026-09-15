export function useModal<T = undefined>(options?: {
    onConfirm?: (data: T) => Promise<void> | void
}) {
    const visible = ref(false)
    const formData = ref<T | undefined>(undefined);
    const open = (data?: T) => {
        formData.value = data;
        visible.value = true;
    }
    const close = () => {
        visible.value = false;
        formData.value = undefined;
    }
    const confirm = async () => {
        try {
            await options?.onConfirm?.(formData.value as T);
            close();
        } catch {

        }
    }
    return {
        visible,
        formData,
        open,
        close,
        confirm
    }
}