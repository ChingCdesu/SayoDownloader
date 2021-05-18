<template>
  <div class="home">
    <div class="beatmap-filter">
      <div
        class="beatmap-filter-background"
        :style="{
          'background-image': this.sets[0]
            ? `url(https://a.sayobot.cn/beatmaps/${this.sets[0].id}/covers/cover.webp)`
            : 'none',
        }"
      ></div>
      <h1 class="page-title">铺面列表</h1>
      <div class="search">
        <el-input
          class="filter-search-input"
          suffix-icon="el-icon-search"
          placeholder="搜索关键字..."
          v-model="this.keyword"
          @change="this.onSearch"
        />
      </div>
      <table class="conditions">
        <tbody>
          <tr>
            <td class="condition-header" width="60">模式</td>
            <td class="condition-content">
              <el-checkbox-group v-model="this.filter.mode" size="mini">
                <el-checkbox-button
                  v-for="option in this.modeOptions"
                  :key="option"
                  :label="option.value"
                  :class="this.filterBtnClass"
                >
                  {{ option.label }}
                </el-checkbox-button>
              </el-checkbox-group>
            </td>
          </tr>
          <tr>
            <td class="condition-header" width="60">分类</td>
            <td class="condition-content">
              <el-checkbox-group v-model="this.filter.approved" size="mini">
                <el-checkbox-button
                  v-for="option in this.approvedOptions"
                  :key="option"
                  :label="option.value"
                  :class="this.filterBtnClass"
                >
                  {{ option.label }}
                </el-checkbox-button>
              </el-checkbox-group>
            </td>
          </tr>
          <tr>
            <td class="condition-header" width="60">流派</td>
            <td class="condition-content">
              <el-checkbox-group v-model="this.filter.genre" size="mini">
                <el-checkbox-button
                  v-for="option in this.genreOptions"
                  :key="option"
                  :label="option.value"
                  :class="this.filterBtnClass"
                >
                  {{ option.label }}
                </el-checkbox-button>
              </el-checkbox-group>
            </td>
          </tr>
          <tr>
            <td class="condition-header" width="60">语言</td>
            <td class="condition-content">
              <el-checkbox-group v-model="this.filter.language" size="mini">
                <el-checkbox-button
                  v-for="option in this.languageOptions"
                  :key="option"
                  :label="option.value"
                  :class="this.filterBtnClass"
                >
                  {{ option.label }}
                </el-checkbox-button>
              </el-checkbox-group>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      class="beatmapsets"
      v-infinite-scroll="this.loadMore"
      :infinite-scroll-disabled="!this.autoload"
      :infinite-scroll-immediate="false"
    >
      <el-row
        v-for="index in parseInt(this.sets.length / 2)"
        :key="index"
        style="width: 100%"
        class="sets-row"
      >
        <el-col
          :xs="{ span: 11, offset: 0 }"
          :sm="{ span: 11, offset: 0 }"
          :md="{ span: 10, offset: 2 }"
          class="sets-item"
          style="margin-right: 8px"
        >
          <SongCard :beatmap_set="this.sets[(index - 1) * 2]" />
        </el-col>
        <el-col
          :xs="{ span: 11, offset: 0 }"
          :sm="{ span: 11, offset: 0 }"
          :md="{ span: 10, offset: 2 }"
          class="sets-item"
          style="margin-left: 8px"
        >
          <SongCard :beatmap_set="this.sets[(index - 1) * 2 + 1]" />
        </el-col>
      </el-row>
    </div>
  </div>
  <Player  />
</template>

<script lang="ts">
import { IBeatmapSet } from "@src/common/interfaces/osu";
import SongCard from "@/components/SongCard.vue";
import PlayerSingleton from "@src/common/utils/player";
import Player from "@/components/Player.vue";
import { apiData2IBeatmapSet } from "@src/common/utils/data-trans";
import Api from "@src/common/utils/api";
import { reactive, Ref, ref, watch } from "vue";
import { IApiBeatmapSet } from "@src/common/interfaces/api.osu";
import { cloneDeep } from "lodash";

type number_array_of_2 = [number, number];

interface IBeatmapListParams {
  cmd: string;
  limit: number;
  offset: number;
  type: string;
  keyword?: string;
  subType?: number;
  mode?: number;
  class?: number;
  genre?: number;
  language?: number;
  stars?: number_array_of_2;
  ar?: number_array_of_2;
  od?: number_array_of_2;
  cs?: number_array_of_2;
  hp?: number_array_of_2;
  bpm?: number_array_of_2;
  length?: number_array_of_2;
}

interface IBeatmapFilter {
  mode?: number[];
  approved?: number[];
  genre?: number[];
  language?: number[];
  stars?: number_array_of_2;
  ar?: number_array_of_2;
  od?: number_array_of_2;
  cs?: number_array_of_2;
  hp?: number_array_of_2;
  bpm?: number_array_of_2;
  length?: number_array_of_2;
}

export default {
  name: "home",
  components: { SongCard, Player },
  setup() {
    let sets: Ref<IBeatmapSet[]> = ref([]);
    let error = ref(false);
    let autoload = ref(false);
    let keyword = ref("");
    var filter: IBeatmapFilter = reactive({
      mode: [],
      approved: [],
      language: [],
      genre: [],
      stars: [0, 0],
      cs: [0, 0],
      ar: [0, 0],
      od: [0, 0],
      hp: [0, 0],
      bpm: [0, 0],
      length: [0, 0],
    });
    const limit = ref(25);
    let page = ref(0);
    const isFilterArrayEmpty = (arr: any[] | undefined): boolean => {
      return arr?.length === 0;
    };
    const isFilterArray2Empty = (
      arr: [number, number] | undefined
    ): boolean => {
      return arr?.reduce((p, v) => (p += v), 0) === 0;
    };
    const isFilterEmpty = (): boolean => {
      let result = true;
      result &&= filter.mode?.length === 0;
      result &&= filter.approved?.length === 0;
      result &&= filter.language?.length === 0;
      result &&= filter.genre?.length === 0;
      result &&= filter.stars?.reduce((p, v) => (p += v), 0) === 0;
      result &&= filter.cs?.reduce((p, v) => (p += v), 0) === 0;
      result &&= filter.ar?.reduce((p, v) => (p += v), 0) === 0;
      result &&= filter.od?.reduce((p, v) => (p += v), 0) === 0;
      result &&= filter.hp?.reduce((p, v) => (p += v), 0) === 0;
      result &&= filter.length?.reduce((p, v) => (p += v), 0) === 0;
      result &&= filter.bpm?.reduce((p, v) => (p += v), 0) === 0;
      return result;
    };
    const onSearch = () => {
      page.value = 0;
      sets.value = [];
      // 等第一页加载结束才启用自动滚动加载
      autoload.value = false;
      loadMore();
      autoload.value = true;
    };
    const combineFilterObj = (): IBeatmapListParams => {
      let obj: IBeatmapListParams = {
        cmd: "beatmaplist",
        limit: limit.value,
        offset: limit.value * (page.value - 1),
        type: isFilterEmpty() ? "hot" : "search",
      };
      if (keyword.value && keyword.value?.trim().length !== 0)
        obj.keyword = keyword.value?.trim();
      if (!isFilterArrayEmpty(filter.mode))
        obj.mode = filter.mode?.reduce(
          (sum: number, num: number) => (sum += num),
          0
        );
      if (!isFilterArrayEmpty(filter.approved))
        obj.class = filter.approved?.reduce(
          (sum: number, num: number) => (sum += num),
          0
        );
      if (!isFilterArrayEmpty(filter.genre))
        obj.genre = filter.genre?.reduce(
          (sum: number, num: number) => (sum += num),
          0
        );
      if (!isFilterArrayEmpty(filter.language))
        obj.language = filter.language?.reduce(
          (sum: number, num: number) => (sum += num),
          0
        );
      if (!isFilterArray2Empty(filter.stars)) obj.stars = filter.stars;
      if (!isFilterArray2Empty(filter.ar)) obj.ar = filter.ar;
      if (!isFilterArray2Empty(filter.cs)) obj.cs = filter.cs;
      if (!isFilterArray2Empty(filter.hp)) obj.hp = filter.hp;
      if (!isFilterArray2Empty(filter.od)) obj.od = filter.od;
      if (!isFilterArray2Empty(filter.bpm)) obj.bpm = filter.bpm;
      if (!isFilterArray2Empty(filter.length)) obj.length = filter.length;
      return obj;
    };
    const loadMore = async () => {
      page.value++;
      const result = await Api.post("/?post", combineFilterObj());
      if (!result || result.status !== 200 || result.data.status !== 0) {
        error.value = true;
        return;
      }
      for (var i = 0; i < result.data.data.length; ++i) {
        const sid = result.data.data[i].sid;
        const info = await Api.get(`/v2/beatmapinfo?K=${sid}`);
        if (!info || result.status !== 200) {
          error.value = true;
          return;
        }
        const beatmapset = info.data.data as IApiBeatmapSet;
        sets.value.push(apiData2IBeatmapSet(beatmapset));
      }
    };
    loadMore().then(() => (autoload.value = true));
    watch(
      () => cloneDeep(filter),
      (filter, _) => {
        onSearch();
      }
    );

    return { sets, error, filter, onSearch, loadMore, keyword, autoload };
  },
  data() {
    const modeOptions = [
      { label: "std", value: 1 },
      { label: "taiko", value: 2 },
      { label: "ctb", value: 4 },
      { label: "mania", value: 8 },
    ];
    const approvedOptions = [
      { label: "Ranked & Approved", value: 1 },
      { label: "Qualified", value: 2 },
      { label: "Loved", value: 4 },
      { label: "Pending & WIP", value: 8 },
      { label: "Graveyard", value: 16 },
    ];
    const genreOptions = [
      { label: "所有", value: 1 },
      { label: "尚未指定", value: 2 },
      { label: "电子游戏", value: 4 },
      { label: "动漫", value: 8 },
      { label: "摇滚", value: 16 },
      { label: "流行乐", value: 32 },
      { label: "其他", value: 64 },
      { label: "新奇", value: 128 },
      { label: "嘻哈", value: 256 },
      { label: "电子", value: 1024 },
    ];
    const languageOptions = [
      { label: "所有", value: 1 },
      { label: "其他", value: 2 },
      { label: "英语", value: 4 },
      { label: "日语", value: 8 },
      { label: "中文", value: 16 },
      { label: "纯音乐", value: 32 },
      { label: "韩语", value: 64 },
      { label: "法语", value: 128 },
      { label: "德语", value: 256 },
      { label: "瑞典语", value: 512 },
      { label: "西班牙语", value: 1024 },
      { label: "意大利语", value: 2048 },
    ];
    const filterBtnClass = "filter-checkbox-btn";
    const player = PlayerSingleton.instance
    return {
      filterBtnClass,
      modeOptions,
      approvedOptions,
      genreOptions,
      languageOptions,
      player
    };
  },
};
</script>

<style lang="less">
.home {
  min-height: 100vh;
  background-color: hsl(200, 10%, 15%);
  padding: 10px 8px;

  .beatmap-filter {
    padding: 15px 5px 15px 5px;
    position: relative;
    margin-bottom: 10px;

    .beatmap-filter-background {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-position: 50%;
      background-repeat: no-repeat;
      background-size: cover;
      opacity: 0.5;
      filter: blur(5px);
    }

    .filter-search-input {
      .el-input__inner {
        background-color: hsl(200, 10%, 30%);
        border: 1px solid hsl(200, 10%, 20%);
        color: #fff;
        transition: all cubic-bezier(0.645, 0.045, 0.355, 1) 0.2s;
        &:focus,
        &:hover {
          border: 1px solid hsl(200, 40%, 80%);
          box-shadow: 0 0 10px hsl(200, 40%, 80%);
        }
      }
    }

    .conditions {
      color: rgba(255, 255, 255, 0.85);
      margin-top: 10px;

      .condition-header {
        text-align: right;
        padding: 0 7px;
      }

      .condition-content {
        text-align: left;
        padding: 2px 7px;

        .filter-checkbox-btn {
          &.is-checked {
            &:first-child .el-checkbox-button__inner {
              border-left-color: hsl(200, 100%, 60%);
            }
            .el-checkbox-button__inner {
              background: hsl(200, 100%, 60%);
              border-color: hsl(200, 100%, 60%);
            }
          }
          .el-checkbox-button__inner {
            background: rgba(73, 83, 96, 0.7);
            color: hsl(200, 40%, 100%);
          }
        }
      }
    }

    .conditions-advanced {
      width: 100%;
    }
  }

  .beatmapsets {
    width: 100%;
    min-height: calc(100vh - 500);
    .sets-row {
      margin-bottom: 16px;
    }
  }
}
</style>
