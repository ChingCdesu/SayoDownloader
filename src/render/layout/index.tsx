import { defineComponent } from 'vue'
import { Layout } from 'ant-design-vue'
import { ElContainer, ElMain, ElAside } from 'element-plus'
import Slider from './slider'
import './index.less'

export default defineComponent({
  name: 'layouts.tsx',
  setup(_, ctx) {
    return () => (
      <ElContainer class='app-layout h-100'>
        <ElAside width="52px">
          <Slider />
        </ElAside>
        <ElMain>
          {/* 奇怪的写法: https://github.com/vuejs/composition-api/issues/84 */}
          {ctx?.slots?.default?.()}
        </ElMain>
      </ElContainer>
    )
  },
})
