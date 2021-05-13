<template>
  <div class="song-card">
    <!-- TODO: 更换cover图片-->
    <div class="covers">
      <div class="left-cover">
        <img class="img-cover" src="https://assets.ppy.sh/beatmaps/648659/covers/list@2x.jpg">
      </div>
      <div class="right-cover">
        <img class="img-cover" src="https://assets.ppy.sh/beatmaps/648659/covers/card.jpg">
      </div>
    </div>
    <div class="content">
      <div class="play">

      </div>
      <div class="info">
        <span class="song-title">{{ this.beatmap_set.title }}</span>
        <span class="song-artist">艺术家: {{ this.beatmap_set.artist }}</span>
        <span class="song-creator">作图者: {{ this.beatmap_set.creator }}</span>
        <Space class="song-maps">
          <div :class="this.approvedClass">
            {{ this.approved }}
          </div>
          <div class="diffs">
            <div class="diff" v-for="beatmap in this.beatmap_set.maps"
                 :style={background:this.diffColor(beatmap.difficult)}>
            </div>
          </div>
        </Space>
      </div>
      <div class="menu">

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {PropType} from "vue";
import {Osu} from "@src/common/constant";
import {PlayCircleOutlined} from "@ant-design/icons-vue";
import {Space} from 'ant-design-vue'

export default {
  name: "SongCard",
  components: {
    PlayCircleOutlined,
    Space
  },
  props: {
    beatmap_set: {
      type: Object as PropType<Osu.BeatmapSet>,
      require: true
    },
  },
  setup(props) {
    console.log(props.beatmap_set);
  },
  data() {
    return {
      colors: ["#4fbdfc", "#65ff84", "#adf94e",
        "#f9a55f", "#f9514e", "#a067ff"],
      diffs: [0, 2.00, 2.70, 4.00, 5.30, 6.50],
      expertPurple: "#545ad6"
    }
  },
  methods: {
    HexToRgb(sColor: String): Number[] {
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
        return sColor;
      }
    },
    RgbToHex(rgb: Number[]): String {
      let _this = rgb;
      let reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
      if (/^(rgb|RGB)/.test(_this)) {
        let aColor = _this.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
        let strHex = "#";
        for (let i = 0; i < aColor.length; i++) {
          let hex = Number(aColor[i]).toString(16);
          hex = hex < 10 ? 0 + '' + hex : hex;// 保证每个rgb的值为2位
          if (hex === "0") {
            hex += hex;
          }
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
            numHex += (aNum[i] + aNum[i]);
          }
          return numHex;
        }
      } else {
        return _this;
      }
    },
    gradientColor(startColor: String, endColor: String, step: Number, index: Number): String {
      let startRGB = this.HexToRgb(startColor);//转换为rgb数组模式
      let startR = startRGB[0];
      let startG = startRGB[1];
      let startB = startRGB[2];
      let endRGB = this.HexToRgb(endColor);
      let endR = endRGB[0];
      let endG = endRGB[1];
      let endB = endRGB[2];

      let sR = (endR - startR) / step;//总差值
      let sG = (endG - startG) / step;
      let sB = (endB - startB) / step;

      return this.RgbToHex('rgb(' + parseInt((sR * index + startR)) + ',' + parseInt((sG * index + startG)) + ',' +
          parseInt((sB * index + startB)) + ')');
    },
    diffColor(diff: Number): String {
      if (diff > 6.50) {
        return this.expertPurple;
      } else if (diff < 0) {
        return this.colors[0];
      }
      let index = 0;
      while (diff > this.diffs[index]) index++;
      const step = parseInt((this.diffs[index] - this.diffs[index - 1]) * 100);
      const i = parseInt((diff - this.diffs[index - 1]) * 100);
      return this.gradientColor(this.colors[index - 1], this.colors[index], step, i);
    }
  },
  computed: {
    approvedClass() {
      return Osu.Approved[this.beatmap_set.Approved] + ' approved-status';
    },
    approved() {
      return Osu.Approved[this.beatmap_set.Approved].toUpperCase();
    }
  }
}
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
      background-color: hsla(200, 10%, 10%, .8);
      display: flex;
      align-items: center;
      justify-content: center;
      //opacity: 0;
      flex: none;
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
      background: linear-gradient(0.25turn, hsl(200, 10%, 20%), hsla(200, 10%, 20%, 0.8));
      //border-radius: @song-card-radius;
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
            width: 6px;
            height: 12px;
            border-radius: 12px;
          }
        }
      }
    }
  }
}
</style>
