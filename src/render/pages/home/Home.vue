<template>
  <div class="home">
    <div class="beatmap-filter">
      <div
        class="beatmap-filter-background"
        :style="{
          backgroundImage: sets[0]
            ? `url(https://a.sayobot.cn/beatmaps/${sets[0].id}/covers/cover.webp)`
            : 'none',
        }"
      ></div>
      <h1 class="page-title">铺面列表</h1>
      <div class="search">
        <el-input
          class="filter-search-input"
          suffix-icon="el-icon-search"
          placeholder="搜索关键字..."
          v-model="keyword"
          @change="onSearch"
        />
      </div>
      <table class="conditions">
        <tbody>
          <tr>
            <td class="condition-header" width="60">模式</td>
            <td class="condition-content">
              <el-checkbox-group v-model="filter.mode" size="mini">
                <el-checkbox-button
                  v-for="option in modeOptions"
                  :key="option"
                  :label="option.value"
                  :class="filterBtnClass"
                >{{ option.label }}</el-checkbox-button>
              </el-checkbox-group>
            </td>
          </tr>
          <tr>
            <td class="condition-header" width="60">分类</td>
            <td class="condition-content">
              <el-checkbox-group v-model="filter.approved" size="mini">
                <el-checkbox-button
                  v-for="option in approvedOptions"
                  :key="option"
                  :label="option.value"
                  :class="filterBtnClass"
                >{{ option.label }}</el-checkbox-button>
              </el-checkbox-group>
            </td>
          </tr>
          <tr>
            <td class="condition-header" width="60">流派</td>
            <td class="condition-content">
              <el-checkbox-group v-model="filter.genre" size="mini">
                <el-checkbox-button
                  v-for="option in genreOptions"
                  :key="option"
                  :label="option.value"
                  :class="filterBtnClass"
                >{{ option.label }}</el-checkbox-button>
              </el-checkbox-group>
            </td>
          </tr>
          <tr>
            <td class="condition-header" width="60">语言</td>
            <td class="condition-content">
              <el-checkbox-group v-model="filter.language" size="mini">
                <el-checkbox-button
                  v-for="option in languageOptions"
                  :key="option"
                  :label="option.value"
                  :class="filterBtnClass"
                >{{ option.label }}</el-checkbox-button>
              </el-checkbox-group>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      class="beatmapsets"
      v-infinite-scroll="loadMore"
      :infinite-scroll-disabled="!autoload"
      :infinite-scroll-immediate="false"
    >
      <el-row v-for="index in (Math.ceil(sets.length / 2) + 1)" :key="index" class="sets-row">
        <el-col
          :xs="{ span: 11, offset: 0 }"
          :sm="{ span: 11, offset: 0 }"
          :md="{ span: 11, offset: 0 }"
          class="sets-item"
        >
          <SongCard
            :BeatmapSet="sets[(index - 1) * 2]"
            v-if="sets[(index - 1) * 2]"
            @show-detail="e => console.log(e)"
          />
        </el-col>
        <el-col
          :xs="{ span: 11, offset: 0 }"
          :sm="{ span: 11, offset: 0 }"
          :md="{ span: 11, offset: 0 }"
          class="sets-item"
        >
          <SongCard
            :BeatmapSet="sets[(index - 1) * 2 + 1]"
            v-if="sets[(index - 1) * 2 + 1]"
            @show-detail="e => console.log(e)"
          />
        </el-col>
      </el-row>
      <!-- <el-button
        v-show="autoload"
        class="btn-load-more"
        :icon="'el-icon-arrow-down'"
        size="mini"
        round
        v-if="!no_more"
        @click="loadMore"
      >加载更多</el-button>-->
      <el-alert v-if="no_more" title="没有更多啦！" center show-icon type="info" :closable="false" />
    </div>
  </div>
  <Player />
  <el-dialog
    v-model="this.modalVisible"
    width="75%"
    :modal="true"
    :show-close="false"
    :destroy-on-close="true"
    :lock-scroll="true"
    :append-to-body="true"
    :center="true"
    custom-class="song-detail-modal"
  >
    <SongDetailModal :BeatmapSet="sets.filter(set => set.id === modalSid)[0] || undefined" />
    <div
      class="modal-background"
      :style="{
        'background-image': `url(https://a.sayobot.cn/beatmaps/${this.BeatmapSet.id}/covers/cover.webp)`,
      }"
    ></div>
  </el-dialog>
</template>

<script lang="ts">
import { IBeatmapSet } from "@src/common/interfaces/osu";
import SongCard from "@/components/SongCard.vue";
import Player from "@/components/Player.vue";
import SongDetailModal from "@/components/SongDetailModal.vue";
import { apiData2IBeatmapSet } from "@src/common/utils/data-trans";
import Api from "@src/common/utils/api";
import { onMounted, reactive, Ref, ref, watch } from "vue";
import { IApiBeatmapSet } from "@src/common/interfaces/api.osu";
import { cloneDeep } from "lodash";
import store from "@src/common/utils/store";
import { OsuConstant } from "@src/common/constant";
import { ElInfiniteScroll } from "element-plus";

import { listenerLinkBeatmap } from '@src/render/hooks/protocol/ipc-renderer'

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
  components: { SongCard, Player, SongDetailModal },
  directives: { "infinite-scroll": ElInfiniteScroll },
  setup() {
    let sets: Ref<IBeatmapSet[]> = ref([]);
    let error = ref(false);
    let autoload = ref(false);
    let no_more = ref(false);
    let modalVisible = ref(false);
    let modalSid = ref(-1);

    let keyword = ref("");
    if (store.has("searchKeyword")) {
      keyword.value = store.get("searchKeyword");
    }
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
    if (store.has("searchFilter")) {
      filter = reactive(store.get("searchFilter"));
    }
    const limit = ref(20);
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
      result &&= keyword.value.length === 0;
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
    const onSearch = async () => {
      page.value = 0;
      sets.value = [];
      no_more.value = false;
      const try_convert = Number(keyword.value);
      if (!isNaN(try_convert)) {
        const result = await Api.get(`/v2/beatmapinfo?K=${try_convert}`);
        if (result && result.status === 200 && result.data.status === 0) {
          const data = result.data.data as IApiBeatmapSet;
          sets.value.push(apiData2IBeatmapSet(data));
        }
      }
      // 等第一页加载结束才启用自动滚动加载
      autoload.value = false;
      await loadMore();
      autoload.value = true;
      store.set("searchKeyword", keyword.value);
      store.set("searchFilter", filter);
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
      if (no_more.value) return;
      page.value++;
      const result = await Api.post("/?post", combineFilterObj());
      if (!result || result.status !== 200 || result.data.status !== 0) {
        error.value = true;
        return;
      }
      for (var i = 0; i < result.data.data.length; ++i) {
        const sid = result.data.data[i].sid;
        if (sets.value.findIndex(v => v.id === sid) !== -1) continue;
        const info = await Api.get(`/v2/beatmapinfo?K=${sid}`);
        if (!info || result.status !== 200) {
          error.value = true;
          return;
        }
        const beatmapset = info.data.data as IApiBeatmapSet;
        sets.value.push(apiData2IBeatmapSet(beatmapset));
      }
      if (sets.value.length >= result.data.results) {
        no_more.value = true;
        console.log('no more')
      }
    };
    onMounted(async () => {
      await onSearch();
      autoload.value = true;
    });

    watch(
      () => cloneDeep(filter),
      (filter, _) => {
        onSearch();
      }
    );

    const handleLinkBeatmap = (_: any, url: string) => {
      const uri = new URL(url)
      const [type] = uri.pathname.substr(1).split('/')
      switch (type) {
        case 'beatmapsets':
          {
            const [_, sid] = uri.pathname.substr(1).split('/')
            keyword.value = sid
            onSearch()
            break;
          }
        default: break
      }

    }

    listenerLinkBeatmap(handleLinkBeatmap)

    return { sets, error, filter, onSearch, loadMore, keyword, autoload, no_more, modalSid, modalVisible };
  },
  data() {
    const filterBtnClass = "filter-checkbox-btn";
    return {
      filterBtnClass,
      modeOptions: OsuConstant.mode,
      approvedOptions: OsuConstant.approved,
      genreOptions: OsuConstant.genre,
      languageOptions: OsuConstant.language,
    };
  },
};
</script>

<style lang="less">
.home {
  min-height: 100vh;
  padding: 10px 8px;

  .beatmap-filter {
    padding: 6px 16px;
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
    min-height: calc(100vh - 500px);
    margin-bottom: 40px;
    .sets-row {
      margin-bottom: 16px;
      width: 100%;
      justify-content: space-evenly;
    }
    .btn-load-more {
      background: rgba(73, 83, 96, 0.7);
      color: hsl(200, 40%, 100%);
    }
  }
}

.sets-item {
  margin-right: 8px;
}
</style>
