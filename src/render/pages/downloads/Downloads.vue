<template>
  <div class="download-page">
    <a-page-header title="下载列表"/>
    <a-list itemLayout="horizontal" :split="false" :dataSource="this.dh" class="download-items">

      <template #renderItem="{ item }">
        <a-list-item key="item.id"
                     class="download-item"
                     :style="{'--background': `url('https://a.sayobot.cn/beatmaps/${this.getQuerySid(item.url)}/covers/cover.webp')`}">
          <font-awesome-icon
              :icon="['far', 'file-archive']"
              size="2x"
          ></font-awesome-icon>
          <div class="info">
            <div class="file-name">{{ item.fileName }}</div>
            <div class="progress-bar" v-if="item.paused === false && item.state === 'progressing'">
              <a-progress :percent="item.progress * 100" status="active"/>
            </div>
            <a-space direction="horizontal" size="large">
              <div class="progress">
                {{ this.byteUnited(item.receivedBytes) }} / {{ this.byteUnited(item.totalBytes) }}
              </div>
              <div class="status">
                {{ this.displayStatus(item) }}
              </div>
            </a-space>
          </div>
          <div class="actions">
            <div class="btn-action" v-if="item.paused || item.state !== 'progressing'">
              <font-awesome-icon :icon="['fas', 'redo']"/>
            </div>
            <div class="btn-action" v-if="item.state === 'progressing' && !item.paused">
              <font-awesome-icon :icon="['fas', 'pause']"/>
            </div>
            <div class="btn-action">
              <font-awesome-icon :icon="['far', 'folder-open']"/>
            </div>
            <div class="btn-action" v-if="item.state === 'completed'">
              <font-awesome-icon :icon="['far', 'file']"/>
            </div>
          </div>
        </a-list-item>
      </template>
    </a-list>
    <div class="fixed-footer">
      <a-space>
        <div>
          已下载: {{ this.byteUnited(bytes.receivedBytes) }}
        </div>
        <div>
          总共: {{ this.byteUnited(bytes.totalBytes) }}
        </div>
      </a-space>
    </div>
  </div>
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
  listenerNewDownloadItem,
  listenerDownloadItemUpdate,
  listenerDownloadItemDone
} from "@/hooks/download/ipc-renderer";

import {
  INewDownloadFile,
  IDownloadFile,
  DownloadItemState,
  IDownloadBytes,
} from "@src/common/interfaces/download";

import {onMounted, ref, Ref} from "vue";
import {URL} from "@cliqz/url-parser";

export default {
  name: "downloads",
  setup() {
    let bytes: Ref<IDownloadBytes> = ref({receivedBytes: 0, totalBytes: 0})
    let dh: Ref<IDownloadFile[]> = ref([])
    onMounted(async () => {
      dh.value = await getDownloadData({pageIndex: 1, pageCount: 10});
    })

    const getDownloadBytes = () => {
      const data = dh.value
      const allBytes = data.reduce<IDownloadBytes>(
          (prev, current) => {
            if (current.state === 'progressing') {
              prev.receivedBytes += current.receivedBytes
              prev.totalBytes += current.totalBytes
            }

            return prev
          },
          {receivedBytes: 0, totalBytes: 0},
      )
      return allBytes
    }
    const handleUpdate = (event, item: IDownloadFile) => {
      const index = dh.value.findIndex(d => d.id === item.id)
      if (index < 0) {
        dh.value.unshift(item)
      } else {
        dh.value[index] = item
      }
      bytes.value = getDownloadBytes()
    }
    // add listeners
    listenerNewDownloadItem(handleUpdate)
    listenerDownloadItemUpdate(handleUpdate)
    listenerDownloadItemDone(handleUpdate)

    return {
      dh, bytes,
    }
  },
  methods: {
    async btnClick(event) {
      const file: INewDownloadFile = {
        url: "https://dl.sayobot.cn/beatmaps/download/full/886402",
        fileName: "Kano - Daisy Blue.osz",
        path: await getDownloadPath(),
      };
      newDownloadFile(file)
    },
    byteUnited(byte: number): string {
      const units = ['bytes', 'KB', 'MB', 'GB']
      let count = 0
      while (byte > 1024 && count < 3) {
        count++
        byte /= 1024
      }
      return byte.toFixed(2) + units[count]
    },
    displayStatus(item: IDownloadFile): string {
      if (item.state == 'cancelled') return '已取消'
      if (item.state == 'interrupted') return '下载失败'
      if (item.state == 'completed') return '已完成'
      if (item.state == 'progressing') {
        if (item.paused) return '已暂停'
        else return `${this.byteUnited(item.speed)}/s`
      }
      return ''
    },
    getQuerySid(url: string): number {
      console.log(url)
      const _url = new URL(url)
      const sid = _url.searchParams.get('filename')?.split('%20')[0]
      if (sid) return parseInt(sid)
      else return 0
    }
  },
};
</script>

<style lang="less">
.download-page {
  color: #fff;
  background-color: hsl(200, 10%, 15%);
  min-height: 100vh;
  padding: 10px 8px;

  .ant-page-header-heading-title {
    color: rgba(255, 255, 255, .85);
  }

  .ant-empty-description {
    color: #fff;
  }

  .download-items {
    color: #fff;

    .download-item {
      position: relative;
      padding: 8px 16px;
      margin: 5px 0;
      height: 85px;
      border: 2px solid #ffffff75;
      border-radius: 10px;

      &::before {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        content: '';
        background-image: var(--background);
        background-size: cover;
        background-position: 25% 60%;
        opacity: .3;
        overflow: hidden;
        border-radius: 10px;
      }
    }

    .ant-progress-text {
      color: rgba(255, 255, 255, .45);
    }

    .info {
      flex: 1;
      margin: 0 12px;
      text-align: start;
      font-family: Torus, sans-serif;

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
