<template>
  <div class="settings-page">
    <h1 class="page-title">设置</h1>
    <el-form class="setting-form" label-width="80px">
      <el-form-item :label="'下载路径'">
        <div :style="{ display: 'flex' }">
          <el-input
            class="download-path-input"
            v-model="this.downloadPath"
            @change="() => {}"
            @input="this.checkPathExists"
          />
          <el-button @click="() => {}">选择</el-button>
        </div>
      </el-form-item>
      <el-form-item> </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import store from "@src/common/utils/store";
import { showOpenDialog, checkPathExists } from "@/hooks/app/ipc-renderer";

export default {
  name: "settings",
  data() {
    return {
      downloadPath: store.get("defaultDownloadPath"),
    };
  },
  methods: {
    async checkPathExists(path: string) {
      this.downloadPath = path
      console.log(await checkPathExists(path))
    },
    changeDownloadPath(path: string) {},
  },
};
</script>

<style lang="less">
.settings-page {
  padding: 16px 24px;
  .setting-form {
    text-align: left;

    .download-path-input {
      flex: 1;
      margin-right: 15px;
    }

    .el-button {
      background: rgba(73, 83, 96, 0.7);
      color: hsl(200, 40%, 100%);
      &:hover {
        background: hsla(200, 100%, 60%, 0.8);
        border-color: hsl(200, 100%, 60%);
      }
    }
  }
}
</style>
