<template>
  <el-tabs
    class="song-detail-modal__diffs"
    :style="{ width: '100%' }"
    v-model="activeBid"
    @tab-click="activeChanged"
  >
    <el-tab-pane
      v-for="map in BeatmapSet.maps"
      :key="map.id"
      :lazy="true"
      :name="map.id.toString()"
    >
      <template #label>
        <el-tooltip placement="top" popper-class="difficuly-tooltip">
          <template #content>
            <el-space :size="4">
              <span :style="{ 'font-weight': 600, color: '#fff' }">
                {{
                  map.name
                }}
              </span>
              <span
                :style="{
                  'font-weight': 800,
                  color: diffColor(map.difficult),
                }"
              >{{ map.difficult.toFixed(2) }}</span>
            </el-space>
          </template>
          <i
            class="icon-osu"
            :class="getModeIconClass(map.mode)"
            :style="{ color: diffColor(map.difficult) }"
          />
        </el-tooltip>
      </template>
    </el-tab-pane>
  </el-tabs>
  <div class="map-version-text">{{ activeMap?.name }}</div>
  <div class="display-title">{{ displayTitle }}</div>
  <div class="display-artist">{{ displayArtist }}</div>
  <div>作图者：{{ BeatmapSet.creator }}</div>
  <div class="extra-info">
    <div class="info-left">
      <div>
        语言：{{
          languages.find((l) => l.enum === BeatmapSet.language)
            ?.value
        }}
      </div>
      <div>
        流派：{{
          genres.find((g) => g.enum === BeatmapSet.genre)?.value
        }}
      </div>
      <div>
        <span>标签：</span>
        <div class="tags">
          <el-tag v-for="tag in BeatmapSet.tags" :key="tag">{{ tag }}</el-tag>
        </div>
      </div>
    </div>
    <div class="info-right">
      <el-space
        class="info-part1"
        :size="6"
        :style="{ width: '100%', 'justify-content': 'space-around' }"
      >
        <el-space :size="4">
          <div class="length-icon info-icon" />
          <span>{{ secondToTime(BeatmapSet.duration) }}</span>
        </el-space>
        <el-space :size="4">
          <div class="bpm-icon info-icon" />
          <span>{{ BeatmapSet.bpm }}</span>
        </el-space>
        <el-space :size="4">
          <div class="circle-count-icon info-icon" />
          <span>{{ activeMap?.circle_count ?? 0 }}</span>
        </el-space>
        <el-space :size="4">
          <div class="slider-count-icon info-icon" />
          <span>{{ activeMap?.slider_count ?? 0 }}</span>
        </el-space>
      </el-space>
      <div class="info-part2">
        <el-space direction="vertical" :size="4">
          <div
            class="map-info-with-bar"
            v-for="(value, name) in (activeMap?.map_diff ?? {})"
            :key="name"
          >
            <div class="map-info-with-bar__title">{{ getNameOfDiff(name) }}</div>
            <el-progress :percentage="value * 10" :show-text="false" :color="colors" />
            <div class="map-info-with-bar__number">{{ value }}</div>
          </div>
          <div class="map-info-with-bar">
            <div class="map-info-with-bar__title">难度星级</div>
            <el-progress
              :percentage="(activeMap?.difficult ?? 0) * 10"
              :show-text="false"
              :color="diffColor(activeMap?.difficult ?? 0)"
            />
            <div class="map-info-with-bar__number">{{ activeMap?.difficult.toFixed(2) ?? "0.00" }}</div>
          </div>
        </el-space>
      </div>
    </div>
  </div>
  <div class="song-detail-modal__buttons">
    <el-tooltip content="下载">
      <el-button circle :icon="Download" @click="download" />
    </el-tooltip>
    <el-tooltip content="添加到播放列表">
      <el-button circle :icon="Plus" @click="addSong" />
    </el-tooltip>
  </div>
</template>

<script lang="ts">
import { PropType, ref, computed } from "vue";
import { IBeatmap, IBeatmapSet } from "@src/common/interfaces/osu";
import store from "@src/common/utils/store";
import { Approved, GameMode } from "@src/common/enums/osu";
import {
  newDownloadFile,
} from "@/hooks/download/ipc-renderer";
import PlayerSingleton from "@src/common/utils/player";
import {
  diffColor,
  getModeIconClass,
  gameModeString,
} from "@src/common/utils/osu";

import { OsuConstant } from "@src/common/constant";

import { Download, Plus } from "@element-plus/icons";

export default {
  name: "SongDetailModal",
  props: {
    BeatmapSet: {
      type: Object as PropType<IBeatmapSet>,
      required: true,
    },
    ActiveBid: {
      type: Number,
      default: -1
    }
  },
  setup(props: { BeatmapSet: IBeatmapSet; ActiveBid: number; }) {
    const color = diffColor(props.BeatmapSet.maps[0].difficult as number);
    document.body.style.setProperty("--song-detail-modal__active-color", color);
    const activeMap = ref(props.BeatmapSet.maps.find((m) => m.id === props.ActiveBid) ?? props.BeatmapSet.maps[0]);
    const activeBid = ref(props.ActiveBid !== -1 ? String(props.ActiveBid) : props.BeatmapSet.maps[0].id.toString());

    const approvedClass = computed((): string => {
      return Approved[props.BeatmapSet.approved] + " approved-status";
    });

    const approved = computed((): string => {
      return Approved[props.BeatmapSet.approved].toUpperCase();
    });
    const modes = computed((): Set<GameMode> => {
      let _modes: Set<GameMode> = new Set();
      props.BeatmapSet.maps.forEach((v) => {
        const _mode = v.mode;
        _modes.add(_mode);
      });
      return _modes;
    });
    const displayTitle = computed((): string => {
      const uni = store.get("displayWithUnicode");
      let ret: string | undefined;
      if (uni) ret = props.BeatmapSet.titleU || props.BeatmapSet.title;
      else ret = props.BeatmapSet.title;
      return ret || "";
    });
    const displayArtist = computed((): string => {
      const uni = store.get("displayWithUnicode");
      let ret: string | undefined;
      if (uni) ret = props.BeatmapSet.artistU || props.BeatmapSet.artist;
      else ret = props.BeatmapSet.artist;
      return ret || "";
    });


    const addSong = () => {
      const player = PlayerSingleton.instance;
      if (props.BeatmapSet.audio) {
        const url = `https://dl.sayobot.cn/beatmaps/files/${props.BeatmapSet.id}/${props.BeatmapSet.audio}`;
        const title = `${displayTitle.value.toString()} - ${displayArtist.value.toString()}`;
        const id = player.addAudioToPlaylist(
          url,
          title,
          props.BeatmapSet.id as number
        );
      }
    };
    const download = async () => {
      const url = `https://dl.sayobot.cn/beatmaps/download/${store.get("oszVersion")}/${props.BeatmapSet.id}`;
      const fileName = `${props.BeatmapSet.id} ${props.BeatmapSet.title} - ${props.BeatmapSet.artist}.osz`;
      const path = store.get("defaultDownloadPath");
      newDownloadFile({
        url,
        fileName,
        path,
      })
        .then((data) => {
          if (!data) {
            // @ts-ignore
            this.$notify({
              title: "正在下载...",
              message: `正在下载 ${fileName}到${path}。`,
              type: "success",
            });
          } else {
            // @ts-ignore
            this.$notify({
              title: "文件存在于下载队列",
              message: `${fileName} 正在下载中。`,
              type: "warning",
            });
          }
        })
        .catch((err) => {
          // @ts-ignore
          this.$notify({
            title: "出现错误",
            message: `将不会下载该文件。原因是：${err}。`,
            type: "error",
          });
        });
    };
    const mapFilter = (mode: GameMode): IBeatmap[] => {
      return props.BeatmapSet.maps.filter((v: { mode: GameMode; }) => v.mode == mode);
    };
    const activeChanged = (tab: any) => {
      const bid = Number(tab.props.name);
      activeMap.value = props.BeatmapSet.maps.find((m: { id: number; }) => m.id === bid) ?? props.BeatmapSet.maps[0];
      const color = diffColor(activeMap.value?.difficult as number);
      document.body.style.setProperty(
        "--song-detail-modal__active-color",
        color
      );
    };
    const secondToTime = (sec: number): string => {
      const _sec = Math.floor(sec % 60);
      const _min = Math.floor(sec / 60);
      return `${_min.toString()}:${_sec.toString().padStart(2, "0")}`;
    };
    const getNameOfDiff = (index: "cs" | "ar" | "hp" | "od") => {
      const names = {
        cs: "圆圈大小",
        ar: "缩圈速度",
        hp: "掉血速度",
        od: "准确率",
      };
      return names[index];
    };

    return {
      // data
      activeBid,
      activeMap,
      // methods
      gameModeString,
      getModeIconClass,
      diffColor,
      addSong,
      download,
      mapFilter,
      activeChanged,
      secondToTime,
      getNameOfDiff,
      // constants
      colors: [
        { percentage: 0, color: "#4fbdfc" },
        { percentage: 20, color: "#65ff84" },
        { percentage: 40, color: "#adf94e" },
        { percentage: 60, color: "#f9a55f" },
        { percentage: 80, color: "#f9514e" },
        { percentage: 100, color: "#a067ff" },
      ],
      languages: OsuConstant.LanguageChinese,
      genres: OsuConstant.GenreChinese,
      // computed
      approvedClass,
      approved,
      modes,
      displayTitle,
      displayArtist,
      // components
      Download,
      Plus
    };
  }
};
</script>

<style lang="less">
.song-detail-modal {
  .el-tabs__item {
    padding: 2px;
  }
  .icon-osu {
    font-size: 22px;
    outline: none;
  }
  .el-tabs__nav-wrap::after {
    content: none;
  }
  .el-tabs__active-bar {
    background-color: var(--song-detail-modal__active-color);
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
  .map-version-text {
    color: var(--song-detail-modal__active-color);
    mix-blend-mode: lighten;
    font-weight: 500;
  }
  .display-title,
  .display-artist {
    text-shadow: 0 1px 3px rgb(0 0 0 / 75%);
    font-family: Torus, KiwiMaru, sans-serif;
  }

  .display-title {
    font-size: 30px;
    font-weight: 500;
    line-height: 1;
  }

  .display-artist {
    font-size: 20px;
    font-weight: 500;
  }

  .extra-info {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    .info-left {
      flex: 1;
      .tags .el-tag {
        color: #fff;
        font-family: Torus, KiwiMaru, sans-serif;
        background-color: hsla(333, 90%, 70%, 0.6);
        margin-right: 5px;
        margin-top: 5px;
        border: 1px solid hsl(333, 90%, 80%);
        height: 20px;
        line-height: 18px;
        padding: 0 3px;
      }
    }
    .info-right {
      width: 275px;
      margin-left: 20px;
      height: 100%;
      .info-part1 {
        color: #fd5;
        .info-icon {
          width: 24px;
          height: 24px;
          background-size: cover;
        }
        .bpm-icon {
          background-image: url("@/assets/svgs/bpm.svg");
        }
        .length-icon {
          background-image: url("@/assets/svgs/total_length.svg");
        }
        .circle-count-icon {
          background-image: url("@/assets/svgs/count_circles.svg");
        }
        .slider-count-icon {
          background-image: url("@/assets/svgs/count_sliders.svg");
        }
      }
      .info-part2 {
        &,
        .el-space,
        .el-space__item {
          width: 100%;
        }
        .map-info-with-bar {
          display: flex;
          flex-direction: row;
          width: 100%;
          .map-info-with-bar__title {
            min-width: 60px;
          }
          .map-info-with-bar__number {
            min-width: 30px;
            text-align: right;
          }
          .el-progress {
            flex: 1;
            margin: 0 5px;
          }
          .el-progress-bar__outer {
            background: transparent;
          }
        }
      }
    }
  }
}
.song-detail-modal__buttons {
  margin-top: 20px;
  text-align: right;
  .el-button {
    font-size: 14px;
  }
}
</style>