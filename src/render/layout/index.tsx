import { defineComponent } from 'vue'
import { Layout } from 'ant-design-vue'
import { ElContainer, ElMain, ElAside, ElBacktop } from 'element-plus'
import Slider from './slider'
import './index.less'

export default defineComponent({
  name: 'layouts.tsx',
  setup(_, ctx) {
    return () => (
      <ElContainer class='app-layout h-100'>
        <ElBacktop target=".el-main" style="z-index: 100; color: hsl(200, 100%, 60%);" bottom="70" right="20"></ElBacktop>
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
