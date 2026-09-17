import { usePermission } from '@/composables/usePermission'
import type { Directive } from 'vue'

export type PermissionDirective = Directive<HTMLElement, string[]>

declare module 'vue' {
  export interface GlobalDirectives {
    // prefix with v (v-permission)
    vPermission: PermissionDirective
  }
}
// binding 参数说明
// value：传递给指令的值。例如，在v-my-directive="1 + 1"中，值将是2。
// oldValue：之前的值，仅在beforeUpdate和updated中可用。无论值是否已更改，该值都可用。
// arg：传递给指令的参数（如果有的话）。例如，在 v-my-directive:foo 中，arg 将是 "foo"。
// modifiers：一个包含修饰符的对象（如果有的话）。例如，在v-my-directive.foo.bar中，修饰符对象将为{ foo: true, bar: true }。
// instance：使用该指令的组件实例。
// dir：指令定义对象。

export default {
  mounted: (el, binding) => {
    const { hasRole, hasPermission } = usePermission()
    // 语义：roles 或 permissions 任一命中即显示（按钮级权限字符串走 permissions 维度）
    if (hasRole(binding.value) || hasPermission(binding.value)) return
    el.parentNode?.removeChild(el)
  },
} satisfies PermissionDirective
