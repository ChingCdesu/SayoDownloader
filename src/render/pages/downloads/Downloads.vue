<template>
  <PageHeader title="下载列表" />
  <Button type="primary" :onClick="this.btnClick">测试</Button>
  <List itemLayout="horizontal"> </List>
</template>

<script lang="ts">
import {
  retryDownloadFile,
  getDownloadPath,
  openFileDialog,
  newDownloadFile,
  getDownloadData,
  removeDownloadItem,
  openFile,
  openFileInFolder,
  clearDownloadDone,
} from "./ipc-renderer";

import electron = require('electron')

import {
  INewDownloadFile,
  IDownloadFile,
} from "@src/common/interfaces/download";

import { List, PageHeader, Button } from "ant-design-vue";

import { onMounted, ref, Ref } from "vue";

export default {
  name: "downloads",
  components: {
    List,
    PageHeader,
    Button
  },
  setup() {
    const dh: Ref<IDownloadFile[]> = ref([]);
    onMounted(async () => {
      dh.value = await getDownloadData({ pageIndex: 1, pageCount: 10 });
    });
    return {
      dh,
    };
  },
  data() {},
  methods: {
    btnClick(event) {
      const file: INewDownloadFile = {
        url: 'https://a.sayobot.cn/preview/93398.mp3',
        path: '/Users/_chingc/Downloads'
      }
      newDownloadFile(file).then(data => console.log(data))
    }
  },
};
</script>

<style lang="less">
</style>
