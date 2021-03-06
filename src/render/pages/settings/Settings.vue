<template>
  <div class="settings-page">
    <h1 class="page-title">设置</h1>
    <el-form class="setting-form">
      <el-form-item :label="'下载路径'">
        <div :style="{ display: 'flex' }">
          <el-input
            class="download-path-input"
            v-model="downloadPath"
            @change="changeDownloadPath"
            @input="checkPathExists"
          />
          <el-button @click="defaultPathDialog">选择</el-button>
        </div>
        <span class="tips tips-error">{{ pathErrorMsg }}</span>
      </el-form-item>
      <el-form-item :label="'下载osz版本'">
        <div>
          <el-radio
            class="radio-osz-version"
            v-model="oszVersion"
            label="full"
            @change="changeOszVersion"
          >全部</el-radio>
          <el-radio
            class="radio-osz-version"
            v-model="oszVersion"
            label="novideo"
            @change="changeOszVersion"
          >不带视频</el-radio>
          <el-radio
            class="radio-osz-version"
            v-model="oszVersion"
            label="mini"
            @change="changeOszVersion"
          >mini</el-radio>
        </div>
        <div class="tips tips-normal">"全部"版本包含视频和Storyboard（如果有）</div>
        <div class="tips tips-normal">"mini"版本不包含视频和Storyboard，但是包括背景图片</div>
      </el-form-item>
      <el-form-item :label="'下载完成后打开文件'">
        <el-switch active-color="#13ce66" v-model="openDownloaded" @change="changeOpenDownloaded"></el-switch>
      </el-form-item>
      <el-form-item :label="'以源语言显示歌曲名和歌手名'">
        <el-switch
          active-color="#13ce66"
          v-model="displayWithUnicode"
          @change="changeDisplayWithUnicode"
        ></el-switch>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import store from "@src/common/utils/store";
import { OszVersion } from "@src/common/interfaces/app";
import { showOpenDialog, checkPathExists as _checkPathExists } from "@/hooks/app/ipc-renderer";
import { ref } from "vue";

export default {
  name: "SettingsPage",
  setup() {
    const downloadPath = ref(store.get("defaultDownloadPath"));
    const displayWithUnicode = ref(store.get("displayWithUnicode"));
    const openDownloaded = ref(store.get("openDownloaded"));
    const oszVersion = ref(store.get("oszVersion"));
    const pathErrorMsg = ref("");

    const checkPathExists = async (path: string) => {
      downloadPath.value = path;
      const exist = await _checkPathExists(path);
      if (!exist) pathErrorMsg.value = "找不到该路径";
      else pathErrorMsg.value = "";
    };

    const changeDownloadPath = (path: string) => {
      if (pathErrorMsg.value !== "") return;
      store.set("defaultDownloadPath", path);
    };

    const changeDisplayWithUnicode = (value: boolean) => {
      store.set("displayWithUnicode", value);
      console.log(store.store);
    };

    const changeOpenDownloaded = (value: boolean) => {
      store.set("openDownloaded", value);
    };
    const changeOszVersion = (version: OszVersion) => {
      store.set("oszVersion", version);
    };
    const defaultPathDialog = async () => {
      const result = await showOpenDialog({
        title: "选择默认下载路径",
        properties: ["openDirectory"],
        defaultPath: downloadPath.value,
      });
      if (result && result?.length > 0) {
        const dir = result[0];
        downloadPath.value = dir;
      }
    };

    return {
      // data
      downloadPath,
      displayWithUnicode,
      openDownloaded,
      oszVersion,
      pathErrorMsg,

      // methods
      checkPathExists,
      changeDownloadPath,
      changeOpenDownloaded,
      changeOszVersion,
      defaultPathDialog,
      changeDisplayWithUnicode
    };
  }
};
</script>

<style lang="less">
.settings-page {
  padding: 16px 24px;
  .setting-form {
    text-align: left;

    .el-form-item__label {
      color: hsl(200, 10%, 80%);
      user-select: none;
    }

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

    .radio-osz-version {
      color: hsl(200, 10%, 80%);
    }

    .tips {
      line-height: 1.2;
    }

    .tips-error {
      color: hsl(0, 70%, 55%);
    }

    .tips-normal {
      color: hsl(200, 10%, 60%);
    }
  }
}
</style>
