<template>
  <div class="home">
    <div class="beatmapsets">
      <SongCard :beatmap_set='set'></SongCard>

    </div>
  </div>
</template>

<script lang="ts">
import {BeatmapSet} from '@src/common/interfaces/osu'
import {GameMode, Approved, Language, Genre} from "@src/common/enums/osu"
import SongCard from '@/components/SongCard.vue';

export default {
  name: 'home',
  components: {SongCard},
  data() {
    var set: BeatmapSet = {
      id: 93398,
      title: 'High-Priestess',
      creator: 'RikiH_',
      artist: 'Luxion',
      Approved: Approved.ranked,
      tags: ['kloyd', 'flower', 'roxas'],
      sources: ['BMS'],
      language: Language.instrumental,
      genre: Genre.video_game,
      duration: 146,
      bpm: 196,
      maps: [
        {
          id: 252002,
          name: 'Overkill',
          difficult: 5.30,
          mode: GameMode.osu,
          circle_count: 388,
          slider_count: 222,
          spinner_count: 3,
          map_diff: {
            cs: 4,
            od: 8,
            ar: 9,
            hp: 7
          }
        }
      ]
    }
    return {
      set
    }
  }
}
</script>

<style lang="less">
.home {
  min-height: 100vh;
  background-color: hsl(200, 10%, 15%);
  padding: 10px 8px;

  .beatmapsets {
  }
}
</style>
