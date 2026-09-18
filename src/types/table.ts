// 表格通用类型：配合 el-table 的「配置化渲染」设计
// 泛型 T = 行数据类型（如 UserItem），prop 用 keyof T 锁定，字段名写错直接编译报错

/** 表格列配置（对应单个 el-table-column 的声明式描述） */
export interface TableColumn<T> {
  /** 行数据字段名；插槽列（slot）可不传 */
  prop?: keyof T & string
  /** 表头文案 */
  label: string
  /** 固定列宽（px 或百分比字符串） */
  width?: number | string
  /** 最小列宽（随容器伸缩） */
  minWidth?: number | string
  /** 单元格对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 固定列位置 */
  fixed?: boolean | 'left' | 'right'
  /** 自定义单元格插槽名：声明后该列内容由模板同名插槽渲染（如状态 tag 列） */
  slot?: string
}

/** 操作列单个动作（对应操作列里的一个 el-button） */
export interface TableAction<T> {
  /** v-for 的 key，需唯一 */
  key: string
  /** 按钮文案 */
  label: string
  /** 按钮类型（对齐 el-button type） */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 按钮级权限标识，传给 v-permission 指令；不传 = 不设限 */
  permission?: string[]
  /** 禁用判定（按行数据计算） */
  disabled?: (row: T) => boolean
  /** 点击回调，携带整行数据 */
  onClick: (row: T) => void
}
