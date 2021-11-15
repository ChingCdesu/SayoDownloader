<template>
  <div class="download-page">
    <h1 class="page-title">下载列表</h1>
    <el-space direction="vertical" class="download-items">
      <div
        v-for="(item, index) in dh"
        :key="index"
        class="download-item"
        :style="
        `--background: url('https://a.sayobot.cn/beatmaps/${getQuerySid(
          item.url
        )}/covers/cover.webp')`"
      >
        <font-awesome-icon :icon="['far', 'file-archive']" size="2x"></font-awesome-icon>
        <div class="info">
          <div class="file-name">{{ item.fileName }}</div>
          <div class="progress-bar" v-if="item.paused === false && item.state === 'progressing'">
            <el-progress :percentage="item.progress * 100" :format="formatPercentage" />
          </div>
          <el-space
            direction="horizontal"
            size="large"
            style="display: flex; font-size: 14px"
            alignment="center"
            prefix-cls="w-auto"
          >
            <div class="progress">
              {{ byteUnited(item.receivedBytes) }} /
              {{ byteUnited(item.totalBytes) }}
            </div>
            <div class="status">{{ displayStatus(item) }}</div>
          </el-space>
        </div>
        <div class="actions">
          <div class="btn-action" @click="removeDownloadItem(item, index)">
            <font-awesome-icon :icon="['fas', 'times']" />
          </div>
          <div
            class="btn-action"
            v-if="item.paused || item.state !== 'progressing'"
            @click="redoBtnClick(item)"
          >
            <font-awesome-icon :icon="['fas', 'redo']" />
          </div>
          <div
            class="btn-action"
            v-if="item.state === 'progressing' && !item.paused"
            @click="pauseOrResumeDownload(item)"
          >
            <font-awesome-icon :icon="['fas', 'pause']" />
          </div>
          <div class="btn-action" @click="openFolder(item)">
            <font-awesome-icon :icon="['far', 'folder-open']" />
          </div>
          <div class="btn-action" v-if="item.state === 'completed'" @click="openFile(item)">
            <font-awesome-icon :icon="['far', 'file']" />
          </div>
        </div>
      </div>
    </el-space>
    <div class="fixed-footer">
      <el-space>
        <div>已下载: {{ byteUnited(bytes.receivedBytes) }}</div>
        <div>总共: {{ byteUnited(bytes.totalBytes) }}</div>
      </el-space>
    </div>
  </div>
</template>

<script lang="ts">
import {
  retryDownloadFile,
  newDownloadFile,
  getDownloadData,
  removeDownloadItem,
  openFile as _openFile,
  openFileInFolder,
  clearDownloadDone,
  listenerNewDownloadItem,
  listenerDownloadItemUpdate,
  listenerDownloadItemDone,
  pauseOrResume,
} from "@/hooks/download/ipc-renderer";

import {
  INewDownloadFile,
  IDownloadFile,
  IDownloadBytes,
} from "@src/common/interfaces/download";

import { onMounted, ref, Ref } from "vue";
import { URL } from "@cliqz/url-parser";
import { cloneDeep } from "lodash";
import store from "@src/common/utils/store";

export default {
  name: "DownloadsPage",
  setup() {
    let bytes: Ref<IDownloadBytes> = ref({ receivedBytes: 0, totalBytes: 0 });
    let dh: Ref<IDownloadFile[]> = ref([]);
    onMounted(async () => {
      dh.value = cloneDeep(await getDownloadData());
    });

    const getDownloadBytes = () => {
      const data = dh.value;
      const allBytes = data.reduce<IDownloadBytes>(
        (prev, current) => {
          if (current.state === "progressing") {
            prev.receivedBytes += current.receivedBytes;
            prev.totalBytes += current.totalBytes;
          }

          return prev;
        },
        { receivedBytes: 0, totalBytes: 0 }
      );
      return allBytes;
    };
    const handleUpdate = (_: any, item: IDownloadFile) => {
      const index = dh.value.findIndex((d) => d.id === item.id);
      if (index < 0) {
        dh.value.unshift(item);
      } else {
        dh.value[index] = item;
      }
      bytes.value = getDownloadBytes();
    };

    const byteUnited = (byte: number): string => {
      const units = ["bytes", "KB", "MB", "GB"];
      let count = 0;
      while (byte > 1024 && count < 3) {
        count++;
        byte /= 1024;
      }
      return byte.toFixed(2) + units[count];
    };
    const displayStatus = (item: IDownloadFile): string => {
      if (item.state == "cancelled") return "已取消";
      if (item.state == "interrupted") return "下载失败";
      if (item.state == "completed") return "已完成";
      if (item.state == "progressing") {
        if (item.paused) return "已暂停";
        else return `${byteUnited(item.speed)}/s`;
      }
      return "";
    };
    const getQuerySid = (url: string): number => {
      const _url = new URL(url);
      const sid = _url.searchParams.get("filename")?.split("%20")[0];
      if (sid) return parseInt(sid);
      else return 0;
    };
    const pauseOrResumeDownload = (item: IDownloadFile) => {
      const _item = cloneDeep(item);
      pauseOrResume(_item);
    };
    const openFile = async (item: IDownloadFile) => {
      const success = await _openFile(item.path);
      if (!success) {
        // @ts-ignore
        this.$notify({
          title: "文件不存在",
          message: `${item.path} 被移动或被删除。`,
          type: "warning",
        });
      }
    };
    const openFolder = async (item: IDownloadFile) => {
      const success = await openFileInFolder(item.path);
      if (!success) {
        // @ts-ignore
        this.$notify({
          title: "文件不存在",
          message: `${item.path} 被移动或被删除。`,
          type: "warning",
        });
      }
    };
    const removeDownloadItem = async (item: IDownloadFile, index: number) => {
      let _item = cloneDeep(item);
      await removeDownloadItem(_item, index);
      const _index = dh.value.findIndex((d) => d.id === _item.id);
      if (_index !== -1) {
        dh.value.splice(_index, 1);
      }
      bytes.value = getDownloadBytes();
    };

    const redoBtnClick = (item: IDownloadFile) => {
      const _item = cloneDeep(item);
      if (item.state === "progressing" && item.paused) {
        pauseOrResume(_item);
      } else {
        retryDownloadFile(_item);
      }
    };
    const formatPercentage = (percentage: any): string => {
      return Number(percentage).toFixed(2) + "%";
    };
    // add listeners
    listenerNewDownloadItem(handleUpdate);
    listenerDownloadItemUpdate(handleUpdate);
    listenerDownloadItemDone(handleUpdate);

    return {
      dh,
      bytes,
      getDownloadBytes,
      byteUnited,
      displayStatus,
      getQuerySid,
      pauseOrResumeDownload,
      openFile,
      openFolder,
      removeDownloadItem,
      redoBtnClick,
      formatPercentage
    };
  }
};
</script>

<style lang="less">
.download-page {
  color: #fff;
  min-height: 100vh;
  padding: 16px 24px;

  .download-items {
    color: #fff;
    width: 100%;
    margin-bottom: 40px;
    .el-space__item {
      width: 100%;
    }
    .download-item {
      user-select: none;
      position: relative;
      padding: 8px 16px;
      height: 85px;
      border: 2px solid #ffffff75;
      border-radius: 10px;
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;

      &::before {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        content: "";
        background-image: var(--background);
        background-size: cover;
        background-position: 25% 60%;
        opacity: 0.3;
        overflow: hidden;
        border-radius: 10px;
        filter: blur(5px);
        // 防止伪元素背景盖住父元素导致按钮无法点击
        pointer-events: none;
      }
    }

    .el-progress__text {
      color: rgba(255, 255, 255, 0.8);
    }

    .info {
      flex: 1;
      margin: 0 12px;
      text-align: start;

      .file-name {
        font-weight: 800;
        font-size: 16px;
      }

      .progress-container {
        font-weight: 400;
        font-size: 14px;
        display: flex;
        flex-direction: row;
      }
    }

    .actions {
      display: flex;
      flex-direction: row;

      .btn-action {
        padding: 7px;
        cursor: pointer;
      }
    }
  }

  .fixed-footer {
    position: fixed;
    bottom: 0;
    right: 0;
    width: calc(100% - 52px);
    background-color: hsl(0, 1%, 16%);
    padding: 4px 15px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>
