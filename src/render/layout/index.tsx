import { defineComponent, } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logo from '@/assets/logo.png'
import './index.less'

export default defineComponent({
  name: 'layouts.tsx',
  setup(_, ctx) {

    return () => (
      <div>
        {/* 奇怪的写法: https://github.com/vuejs/composition-api/issues/84 */}
        {ctx?.slots?.default?.()}
      </div>
    )
  },
})
