import { defineComponent } from 'vue'
import { Layout } from 'ant-design-vue'
import Slider from './slider'
import './index.less'

export default defineComponent({
  name: 'layouts.tsx',
  setup(_, ctx) {
    return () => (
      <Layout class='app-layout h-100'>
        <Layout.Sider width={52}>
          <Slider />
        </Layout.Sider>
        <Layout.Content>
          {/* 奇怪的写法: https://github.com/vuejs/composition-api/issues/84 */}
          {ctx?.slots?.default?.()}
        </Layout.Content>
      </Layout>
    )
  },
})
