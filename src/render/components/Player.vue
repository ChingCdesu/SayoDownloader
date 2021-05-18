<template>
  <div class="audio-player" v-if="this.player.playlist.length !== 0">
    <div class="controls">
      <font-awesome-icon
        class="control-btn"
        :icon="['fas', 'backward']"
        @click="this.previousSong"
      ></font-awesome-icon>
      <font-awesome-icon
        class="control-btn"
        :icon="['fas', 'play']"
        v-if="!this.player.playing"
        @click="this.resume"
      ></font-awesome-icon>
      <font-awesome-icon
        class="control-btn"
        :icon="['fas', 'pause']"
        v-if="this.player.playing"
        @click="this.pause"
      ></font-awesome-icon>
      <font-awesome-icon
        class="control-btn"
        :icon="['fas', 'stop']"
        @click="this.stop"
      ></font-awesome-icon>
      <font-awesome-icon
        class="control-btn"
        :icon="['fas', 'forward']"
        @click="this.nextSong"
      ></font-awesome-icon>
    </div>
    <div class="duration">
      <div class="timer-text time">
        {{ this.secondToTime(this.item.timer) }}
      </div>
      <el-slider
        class="duration-bar"
        :format-tooltip="this.secondToTime"
        v-model="this.item.timer"
        :max="this.item.duration || 0"
        :disabled="this.item.duration === 0"
        @change="this.seek"
      />
      <div class="duration-text time">
        {{ this.secondToTime(this.item.duration) }}
      </div>
    </div>
    <div class="volume">
      <div class="volume-icon">
        <font-awesome-icon
          class="control-btn"
          :icon="['fas', 'volume-up']"
          v-if="this.volume >= 50 && !this.mute"
          @click="this.doMute"
        />
        <font-awesome-icon
          class="control-btn"
          :icon="['fas', 'volume-down']"
          v-if="this.volume < 50 && this.volume > 0 && !this.mute"
          @click="this.doMute"
        />
        <font-awesome-icon
          class="control-btn"
          :icon="['fas', 'volume-mute']"
          v-if="this.volume === 0 || this.mute"
          @click="this.unmute"
        />
      </div>
      <el-slider
        class="volume-bar"
        v-model="this.volume"
        :max="100"
        @input="this.changeVolume"
      />
    </div>
    <div class="playlist">
      <el-popover
        :show-arrow="false"
        popper-class="playlist-popover"
        :width="400"
        placement="top-start"
        trigger="click"
      >
        <template #reference>
          <font-awesome-icon class="control-btn" :icon="['fas', 'list-ul']" />
        </template>
        <div class="playlist-popover__inner">
          <div
            class="playlist-popover__content"
            :class="this.item.id === listitem.id ? 'isplaying' : ''"
            v-for="listitem in this.player.playlist"
            :key="listitem.id"
          >
            <div>
              <font-awesome-icon
                class="fa-remove-icon"
                color="rgb(242, 83, 91)"
                :icon="['fas', 'times']"
                @click="this.removeSong(listitem.id)"
              />
              <span @click="this.play(listitem.id)">{{ listitem.title }}</span>
            </div>
            <font-awesome-icon
              class="fa-play-icon"
              :icon="['fas', 'play']"
              @click="this.play(listitem.id)"
            />
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script lang="ts">
import PlayerSingleton from "@src/common/utils/player";
import { PlayListItem } from "@src/common/interfaces/player";

export default {
  name: "player",
  data() {
    let item: PlayListItem = {
      id: "",
      sid: 0,
      url: "",
      title: "",
      timer: 0,
      duration: 0,
      deleted: false,
    };
    const player = PlayerSingleton.instance;
    let volume = player.getVolume();
    let storedVolume = volume;
    let mute = volume === 0;
    player.walkSync = (it: PlayListItem) => {
      // 这里必须为this.item，函数触发的时候已经渲染完了
      this.item = it;
    };
    return {
      player,
      item,
      volume,
      mute,
      storedVolume,
    };
  },
  computed: {},
  methods: {
    play(id: string) {
      this.player.play(id);
    },
    removeSong(id: string) {
      this.player.removePlaylistItem(id);
    },
    resume() {
      this.player.resume();
    },
    pause() {
      this.player.pause();
    },
    stop() {
      this.player.stop();
    },
    seek(time: number) {
      this.player.seek(time);
    },
    previousSong() {
      this.player.previousSong();
    },
    nextSong() {
      this.player.nextSong();
    },
    changeVolume(volume: number) {
      this.storedVolume = volume;
      this.player.setVolume(volume);
    },
    secondToTime(sec: number): string {
      const _sec = Math.floor(sec % 60);
      const _min = Math.floor(sec / 60);
      return `${_min.toString().padStart(2, "0")}:${_sec
        .toString()
        .padStart(2, "0")}`;
    },
    doMute() {
      this.mute = true;
      this.volume = 0;
      this.player.setVolume(0);
    },
    unmute() {
      this.mute = false;
      this.volume = this.storedVolume;
      this.player.setVolume(this.volume);
    },
  },
};
</script>

<style lang="less">
.audio-player {
  position: fixed;
  bottom: 0;
  right: 0;
  width: calc(100vw - 52px);
  height: 35px;
  z-index: 101;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 15px 0 10px;
  color: #fff;
  background-color: hsl(200, 10%, 20%, 0.7);
  box-shadow: 0px -1px 5px #000;
  .control-btn {
    margin: 0 10px;
    cursor: pointer;
  }
  .controls {
    display: flex;
  }
  .duration {
    display: flex;
    align-items: center;
    flex-direction: row;
    flex: 1;
    .duration-bar {
      flex: 1;
      margin: 0 20px;
    }
    .time {
      text-align: center;
      width: 45px;
    }
  }
  .volume {
    width: 150px;
    display: flex;
    flex-direction: row;
    align-items: center;
    .volume-icon {
      width: 40px;
    }
    .volume-bar {
      flex: 1;
      margin: 0 5px;
    }
  }
}

.playlist-popover.el-popover {
  background-color: hsla(200, 10%, 20%, 0.7);
  backdrop-filter: blur(5px);
  color: #fff;
  font-family: Torus, sans-serif;
  border: none;
  padding: 0;
  overflow: hidden;
  .playlist-popover__content {
    cursor: pointer;
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &.isplaying {
      background-color: hsl(200, 100%, 60%);
      .fa-play-icon {
        opacity: 1;
      }
    }
    &:hover {
      .fa-play-icon,
      .fa-remove-icon {
        opacity: 1;
      }
    }
    .fa-play-icon,
    .fa-remove-icon {
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }
    .fa-remove-icon {
      margin-right: 4px;
    }
  }
}
</style>