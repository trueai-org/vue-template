import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题，用于 document.title 与菜单 */
    title?: string
    /** UnoCSS 图标类名，用于菜单渲染 */
    icon?: string
    /** 是否在菜单中隐藏 */
    hidden?: boolean
  }
}