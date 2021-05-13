import { defineComponent } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { routes } from '@/router'
import './slider.less'

export interface SiderMenu {
  title?: string
  icon?: JSX.Element | null
  path: string
  render?: Function
}

export default defineComponent({
  name: 'sider.tsx',
  setup(scope, { }) {
    const router = useRoute()
    const menus: SiderMenu[] = routes
      .filter(r => r?.meta?.name)
      .map(r => ({
        title: r?.meta?.name,
        icon: r?.meta?.icon,
        path: r.path,
      }))

    return () => (
      <div class='sider-wrap'>
        {menus.map((menu) => {
          const { title, path, icon, render } = menu
          const cls = [
            'menu-item',
            router.path === path ? 'active' : '',
            '',
          ]
          const node = <RouterLink to={path}>{icon}</RouterLink>

          return (
            <div key={path} title={title} class={cls.join(' ')}>
              {render ? render(menu, node) : node}
            </div>)
        })}
      </div>
    )
  },
})
