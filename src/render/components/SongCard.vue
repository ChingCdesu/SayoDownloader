<template>
  <div class="song-card">
    <div class="covers">
      <div class="left-cover">
        <img
          class="img-cover"
          :src="`https://assets.ppy.sh/beatmaps/${this.beatmap_set.id}/covers/list@2x.jpg`"
        />
      </div>
      <div class="right-cover">
        <img
          class="img-cover"
          :src="`https://assets.ppy.sh/beatmaps/${this.beatmap_set.id}/covers/card.jpg`"
        />
      </div>
    </div>
    <div class="content">
      <div class="play">
        <font-awesome-icon :icon="['fas', 'play']"></font-awesome-icon>
      </div>
      <div class="info">
        <span class="song-title">{{ this.beatmap_set.title }}</span>
        <span class="song-artist">艺术家: {{ this.beatmap_set.artist }}</span>
        <span class="song-creator">作图者: {{ this.beatmap_set.creator }}</span>
        <a-space class="song-maps">
          <div :class="this.approvedClass">
            {{ this.approved }}
          </div>
          <div class="diffs">
            <a-space align="center" v-if="this.osuMaps.length !== 0">
              <img
                class="gamemode-icon"
                src="../assets/osu/mode-osu-small.png"
              />
              <div
                class="diff"
                v-for="beatmap in this.osuMaps"
                :style="{ background: this.diffColor(beatmap.difficult) }"
              ></div>
            </a-space>
            <a-space align="center" v-if="this.taikoMaps.length !== 0">
              <img
                class="gamemode-icon"
                src="../assets/osu/mode-osu-small.png"
              />
              <div
                class="diff"
                v-for="beatmap in this.taikoMaps"
                :style="{ background: this.diffColor(beatmap.difficult) }"
              ></div>
            </a-space>
            <a-space align="center" v-if="this.catchMaps.length !== 0">
              <img
                class="gamemode-icon"
                src="../assets/osu/mode-osu-small.png"
              />
              <div
                class="diff"
                v-for="beatmap in this.catchMaps"
                :style="{ background: this.diffColor(beatmap.difficult) }"
              ></div>
            </a-space>
            <a-space align="center" v-if="this.maniaMaps.length !== 0">
              <img
                class="gamemode-icon"
                src="../assets/osu/mode-osu-small.png"
              />
              <div
                class="diff"
                v-for="beatmap in this.maniaMaps"
                :style="{ background: this.diffColor(beatmap.difficult) }"
              ></div>
            </a-space>
          </div>
        </a-space>
      </div>
      <div class="menu">
        <div class="menu-inner">
          <a-tooltip title="收藏铺面">
            <font-awesome-icon
              :icon="['far', 'heart']"
              class="fa-icon"
            ></font-awesome-icon>
          </a-tooltip>
          <a-tooltip title="下载">
            <a
              :href="`https://dl.sayobot.cn/beatmaps/download/full/${this.beatmap_set.id}`"
            >
              <font-awesome-icon
                :icon="['fas', 'file-download']"
                class="fa-icon"
              ></font-awesome-icon>
            </a>
          </a-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from "vue";
import {BeatmapSet} from "@src/common/interfaces/osu";
import {GameMode, Approved} from "@src/common/enums/osu"
import { PlayCircleOutlined } from "@ant-design/icons-vue";

export default {
  name: "SongCard",
  components: {
    PlayCircleOutlined,
  },
  props: {
    beatmap_set: {
      type: Object as PropType<BeatmapSet>,
      require: true,
    },
  },
  // setup(props) {
  //   console.log(props.beatmap_set.maps);
  // },
  data() {
    return {
      colors: [
        "#4fbdfc",
        "#65ff84",
        "#adf94e",
        "#f9a55f",
        "#f9514e",
        "#a067ff",
      ],
      diffs: [0, 2.0, 2.7, 4.0, 5.3, 6.5],
      expertPurple: "#545ad6",
      play: {
        isPlaying: false,
        isLoaded: false,
        duration: 0,
        progress: 0,
      },
    };
  },
  methods: {
    HexToRgb(sColor: string): number[] {
      let reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
      sColor = sColor.toLowerCase();
      if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
          let sColorNew = "#";
          for (let i = 1; i < 4; i += 1) {
            sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
          }
          sColor = sColorNew;
        }
        //处理六位的颜色值
        let sColorChange = [];
        for (let i = 1; i < 7; i += 2) {
          sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        return sColorChange;
      } else {
        return [];
      }
    },
    RgbToHex(rgb: string): string {
      let _this = rgb;
      let reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
      if (/^(rgb|RGB)/.test(_this)) {
        let aColor = _this.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
        let strHex = "#";
        for (let i = 0; i < aColor.length; i++) {
          let hex = Number(aColor[i]).toString(16);
          hex = hex.length < 2 ? 0 + "" + hex : hex; // 保证每个rgb的值为2位
          strHex += hex;
        }
        if (strHex.length !== 7) {
          strHex = _this;
        }
        return strHex;
      } else if (reg.test(_this)) {
        let aNum = _this.replace(/#/, "").split("");
        if (aNum.length === 6) {
          return _this;
        } else if (aNum.length === 3) {
          let numHex = "#";
          for (let i = 0; i < aNum.length; i += 1) {
            numHex += aNum[i] + aNum[i];
          }
          return numHex;
        }
      } else {
        return _this;
      }
      return "";
    },
    gradientColor(
      startColor: string,
      endColor: string,
      step: number,
      index: number
    ): string {
      let startRGB = this.HexToRgb(startColor); //转换为rgb数组模式
      let startR = startRGB[0];
      let startG = startRGB[1];
      let startB = startRGB[2];
      let endRGB = this.HexToRgb(endColor);
      let endR = endRGB[0];
      let endG = endRGB[1];
      let endB = endRGB[2];

      let sR = (endR - startR) / step; //总差值
      let sG = (endG - startG) / step;
      let sB = (endB - startB) / step;

      return this.RgbToHex(
        "rgb(" +
          Math.round(sR * index + startR) +
          "," +
          Math.round(sG * index + startG) +
          "," +
          Math.round(sB * index + startB) +
          ")"
      );
    },
    diffColor(diff: number): string {
      if (diff > 6.5) {
        return this.expertPurple;
      } else if (diff < 0) {
        return this.colors[0];
      }
      let index = 0;
      while (diff > this.diffs[index]) index++;
      const step = parseInt((this.diffs[index] - this.diffs[index - 1]) * 100);
      const i = parseInt((diff - this.diffs[index - 1]) * 100);
      return this.gradientColor(
        this.colors[index - 1],
        this.colors[index],
        step,
        i
      );
    },
    startPlaying() {},
    stopPlaying() {},
    pausePlaying() {},
    loading() {},
  },
  computed: {
    approvedClass() {
      return Approved[this.beatmap_set.Approved] + " approved-status";
    },
    approved() {
      return Approved[this.beatmap_set.Approved].toUpperCase();
    },
    osuMaps() {
      return this.beatmap_set.maps.filter(v => v.mode == GameMode.osu);
    },
    taikoMaps() {
      return this.beatmap_set.maps.filter(v => v.mode == GameMode.taiko);
    },
    catchMaps() {
      return this.beatmap_set.maps.filter(v => v.mode == GameMode.catch);
    },
    maniaMaps() {
      return this.beatmap_set.maps.filter(v => v.mode == GameMode.mania);
    },
  },
};
</script>

<style lang="less">
@song-card-radius: 10px;
@play-wrap-width: 120px;

.song-card {
  max-width: 475px;
  height: 100px;
  border-radius: @song-card-radius;
  overflow: hidden;
  background-color: hsl(200, 10%, 30%);
  position: relative;
  cursor: pointer;

  .covers {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;

    .img-cover {
      object-fit: cover;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }

    .left-cover {
      width: @play-wrap-width + 10px;
      flex: none;
      position: relative;
      height: 100%;
      border-radius: @song-card-radius;
    }

    .right-cover {
      position: relative;
      height: 100%;
      flex: 1;
    }
  }

  .content {
    height: 100%;
    width: 100%;
    position: absolute;
    display: flex;
    flex-direction: row;

    .play {
      position: relative;
      padding: 15px;
      width: @play-wrap-width;
      height: 100%;
      background-color: hsla(200, 10%, 10%, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      color: #fff;
      flex: none;
      transition: all ease-in-out 0.15s;

      &:hover {
        color: hsl(45, 100%, 70%);
      }

      &::before,
      &::after {
        content: "";
        width: 10px;
        height: 10px;
        position: absolute;
        background-color: inherit;
        left: 100%;
      }

      &::before {
        top: 0;
        clip-path: path("M-1 -1 L-1 10 L0 10 A10 10 0 0 1 10 0 L10 -1 Z");
      }

      &::after {
        bottom: 0;
        clip-path: path("M-1 11 L-1 0 L0 0 A10 10 0 0 0 10 10 L10 11 Z");
      }
    }

    .info {
      display: flex;
      flex: 1;
      flex-direction: column;
      color: #fff;
      font-family: Torus;
      align-items: flex-start;
      justify-content: space-between;
      padding: 4px 10px 6px;
      background: linear-gradient(
        0.25turn,
        hsl(200, 10%, 20%),
        hsla(200, 10%, 20%, 0.8)
      );
      border-radius: 9px 0 0 9px;

      .song-title {
        font-size: 16px;
        font-weight: 600;
        text-shadow: 0 1px 3px rgb(0 0 0 / 75%);
      }

      .song-artist {
        font-size: 14px;
        font-weight: 600;
        text-shadow: 0 1px 3px rgb(0 0 0 / 75%);
      }

      .song-creator {
        font-size: 12px;
        font-weight: 600;
      }

      .song-maps {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;

        .gamemode-icon {
          width: 20px;
          height: 20px;
        }

        .graveyard {
          background-color: hsl(200, 10%, 10%);
          color: hsl(200, 10%, 40%);
        }

        .wip {
          background-color: hsl(200, 40%, 80%);
          color: hsl(200, 10%, 25%);
        }

        .pending {
          background-color: hsl(45, 60%, 50%);
          color: hsl(200, 10%, 25%);
        }

        .qualified {
          background-color: hsl(45, 100%, 70%);
          color: hsl(200, 10%, 25%);
        }

        .approved {
          background-color: hsl(200, 40%, 80%);
          color: hsl(200, 10%, 40%);
        }

        .ranked {
          background-color: hsl(90, 100%, 70%);
          color: hsl(200, 10%, 40%);
        }

        .loved {
          background-color: hsl(333, 100%, 70%);
          color: hsl(200, 10%, 40%);
        }

        .approved-status {
          border-radius: 99px;
          font-family: Torus;
          font-weight: 800;
          font-size: 12px;
          line-height: 16px;
          padding: 0 5px;
        }

        .diffs {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;

          .diff {
            margin-top: 2px;
            margin-right: 2px;
            width: 7px;
            height: 14px;
            border-radius: 14px;
          }
        }
      }
    }

    .menu {
      width: 10px;
      background-color: hsl(200, 10%, 25%);
      border-radius: 0 10px 10px 0;
      transition: all 0.15s ease-in-out;
      position: relative;

      &::before,
      &::after {
        content: "";
        width: 10px;
        height: 10px;
        position: absolute;
        background-color: inherit;
        right: 100%;
      }

      &::before {
        top: 0;
        clip-path: path("M11 -1 L11 10 L10 10 A10 10 0 0 0 0 0 L0 -1 Z");
      }

      &::after {
        bottom: 0;
        clip-path: path("M11 11 L11 0 L10 0 A10 10 0 0 1 0 10 L 0 11 Z");
      }

      .menu-inner {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        opacity: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        font-size: 12px;
        transition: all 0.15s ease-in-out;

        .fa-icon {
          color: hsl(200, 40%, 90%);
        }
      }
    }
  }

  &:hover {
    .menu {
      width: 30px;

      .menu-inner {
        opacity: 1;
      }
    }

    .play {
      opacity: 1;
    }
  }
}
</style>
