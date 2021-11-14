import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { CloudDownloadOutlined, HomeOutlined, SettingOutlined } from "@ant-design/icons-vue";

export interface RouteMeta {
  icon?: JSX.Element
  name?: string
}

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/pages/home"),
    meta: {
      icon: <HomeOutlined />,
      name: "首页"
    },
  },
  {
    path: "/downloads",
    component: () => import("@/pages/downloads"),
    meta: {
      icon: <CloudDownloadOutlined />,
      name: "下载"
    }
  },
  {
    path: "/settings",
    component: () => import("@/pages/settings"),
    meta: {
      icon: <SettingOutlined />,
      name: "设置"
    }
  }
];

export default createRouter({
  routes,
  history: createWebHashHistory(), // 这里使用 hash 模式，确保打包后正常加载
});
