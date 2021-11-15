<template>
  <div class="audio-player" v-if="player.playlist.length !== 0">
    <div class="controls">
      <font-awesome-icon class="control-btn" :icon="['fas', 'backward']" @click="previousSong"></font-awesome-icon>
      <font-awesome-icon
        class="control-btn"
        :icon="['fas', 'play']"
        v-if="!player.playing && !player.loading"
        @click="resume"
      ></font-awesome-icon>
      <font-awesome-icon
        class="control-btn"
        :icon="['fas', 'pause']"
        v-if="player.playing && !player.loading"
        @click="pause"
      ></font-awesome-icon>
      <font-awesome-icon
        class="control-btn"
        :style="{ 'cursor': 'default' }"
        :icon="['fas', 'spinner']"
        spin
        v-if="player.loading"
      ></font-awesome-icon>
      <font-awesome-icon class="control-btn" :icon="['fas', 'stop']" @click="stop"></font-awesome-icon>
      <font-awesome-icon class="control-btn" :icon="['fas', 'forward']" @click="nextSong"></font-awesome-icon>
    </div>
    <div class="duration">
      <div class="timer-text time">{{ secondToTime(item.timer ?? 0) }}</div>
      <el-slider
        class="duration-bar"
        :format-tooltip="secondToTime"
        v-model="item.timer"
        :max="item.duration || 0"
        :disabled="item.duration === 0"
        @change="seek"
      />
      <div class="duration-text time">{{ secondToTime(item.duration ?? 0) }}</div>
    </div>
    <div class="volume">
      <div class="volume-icon">
        <font-awesome-icon
          class="control-btn"
          :icon="['fas', 'volume-up']"
          v-if="volume >= 50"
          @click="doMute"
        />
        <font-awesome-icon
          class="control-btn"
          :icon="['fas', 'volume-down']"
          v-if="volume < 50 && volume > 0"
          @click="doMute"
        />
        <font-awesome-icon
          class="control-btn"
          :icon="['fas', 'volume-mute']"
          v-if="volume === 0"
          @click="unmute"
        />
      </div>
      <el-slider class="volume-bar" v-model="volume" :max="100" @input="changeVolume" />
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
            :class="item.id === listitem.id ? 'isplaying' : ''"
            v-for="listitem in player.playlist"
            :key="listitem.id"
          >
            <div>
              <font-awesome-icon
                class="fa-remove-icon"
                color="rgb(242, 83, 91)"
                :icon="['fas', 'times']"
                @click="removeSong(listitem.id)"
              />
              <span @click="play(listitem.id)">{{ listitem.title }}</span>
            </div>
            <font-awesome-icon
              class="fa-play-icon"
              :icon="['fas', 'play']"
              @click="play(listitem.id)"
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
import { ref, Ref } from "vue";

export default {
  name: "PlayerComponent",
  setup() {
    const item: Ref<PlayListItem> = ref({
      id: "",
      sid: 0,
      url: "",
      title: "",
      timer: 0,
      duration: 0,
      deleted: false,
    });
    const player = PlayerSingleton.instance;
    const volume = ref(player.getVolume());
    const storedVolume = ref(player.getVolume());

    player.walkSync = (it: PlayListItem) => {
      item.value = it;
    };

    const play = (id: string) => {
      player.play(id);
    };

    const removeSong = (id: string) => {
      player.removePlaylistItem(id);
    };
    const resume = () => {
      player.resume();
    };
    const pause = () => {
      player.pause();
    };
    const stop = () => {
      player.stop();
    };
    const seek = (time: number) => {
      player.seek(time);
    };
    const previousSong = () => {
      player.previousSong();
    };
    const nextSong = () => {
      player.nextSong();
    };
    const changeVolume = (volume: number) => {
      if (volume !== 0) storedVolume.value = volume;
      player.setVolume(volume);
    };
    const secondToTime = (sec: number): string => {
      const _sec = Math.floor(sec % 60);
      const _min = Math.floor(sec / 60);
      return `${_min.toString().padStart(2, "0")}:${_sec
        .toString()
        .padStart(2, "0")}`;
    };
    const doMute = () => {
      storedVolume.value = volume.value;
      volume.value = 0;
      // this.player.setVolume(0);
    };
    const unmute = () => {
      volume.value = storedVolume.value;
      // this.player.setVolume(this.volume);
    };

    return {
      // data
      player,
      item,
      volume,
      storedVolume,
      // methods
      play,
      removeSong,
      resume,
      pause,
      stop,
      seek,
      previousSong,
      nextSong,
      changeVolume,
      secondToTime,
      doMute,
      unmute
    };
  }
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
      text-align: left;
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
  border: none;
  padding: 0;
  overflow: hidden;
  user-select: none;
  .playlist-popover__content {
    cursor: pointer;
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: Torus, KiwiMaru, sans-serif;
    &.isplaying {
      background-color: hsla(200, 100%, 60%, 0.5);
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