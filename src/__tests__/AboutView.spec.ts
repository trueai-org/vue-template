import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutView from '../views/AboutView.vue'

// 组件测试示例：挂载 AboutView 并断言渲染内容
// https://vitest.dev/guide/ · https://test-utils.vuejs.org/guide/
describe('AboutView', () => {
  it('渲染标题与技术栈说明', () => {
    const wrapper = mount(AboutView)
    expect(wrapper.find('h1').text()).toBe('关于')
    expect(wrapper.text()).toContain('Vue3')
  })
})
