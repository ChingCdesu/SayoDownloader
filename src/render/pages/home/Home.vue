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
          v-model="this.filter.keyword"
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
    <div class="beatmapsets" v-infinite-scroll="this.loadMore">
      <a-row
        :gutter="[16, 16]"
        v-for="index in parseInt(this.sets.length / 2)"
        style="width: 100%"
      >
        <a-col :span="12">
          <SongCard :beatmap_set="this.sets[(index - 1) * 2]" />
        </a-col>
        <a-col :span="12">
          <SongCard :beatmap_set="this.sets[(index - 1) * 2 + 1]" />
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script lang="ts">
import { IBeatmapSet } from "@src/common/interfaces/osu";
import SongCard from "@/components/SongCard.vue";
import { apiData2IBeatmapSet } from "@src/common/utils/data-trans";
import Api from "@src/common/utils/api";
import { onMounted, Ref, ref } from "vue";
import { IApiBeatmapSet } from "@src/common/interfaces/api.osu";

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

type number_array_of_2 = [number, number];

interface IBeatmapFilter {
  keyword?: string;
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
  components: { SongCard },
  setup() {
    let sets: Ref<IBeatmapSet[]> = ref([]);
    let error: Ref<boolean> = ref(false);
    onMounted(async () => {
      const result = await Api.post("/?post", {
        cmd: "beatmaplist",
        type: "hot",
        limit: 20,
      });
      if (!result || result.status !== 200) {
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
    });
    return { sets, error };
  },
  data() {
    var filter: IBeatmapFilter = {
      mode: [],
      approved: [],
      language: [],
      genre: [],
      keyword: "",
    };
    const limit: number = 25;
    let page = 1;
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
    return {
      filter,
      filterBtnClass,
      limit,
      page,
      modeOptions,
      approvedOptions,
      genreOptions,
      languageOptions,
    };
  },
  methods: {
    onSearch() {
      console.log(this.combineFilterObj());
    },
    combineFilterObj(): IBeatmapListParams {
      let obj: IBeatmapListParams = {
        cmd: "beatmaplist",
        limit: this.limit,
        offset: this.limit * (this.page - 1),
        type: this.filter.keyword?.length ? "search" : "hot",
      };
      if (this.filter.keyword && this.filter.keyword?.trim().length !== 0)
        obj.keyword = this.filter.keyword?.trim();
      if (this.filter.mode?.length)
        obj.mode = this.filter.mode?.reduce(
          (sum: number, num: number) => (sum += num),
          0
        );
      if (this.filter.approved?.length)
        obj.class = this.filter.approved?.reduce(
          (sum: number, num: number) => (sum += num),
          0
        );
      if (this.filter.genre?.length)
        obj.genre = this.filter.genre?.reduce(
          (sum: number, num: number) => (sum += num),
          0
        );
      if (this.filter.language?.length)
        obj.language = this.filter.language?.reduce(
          (sum: number, num: number) => (sum += num),
          0
        );
      if (this.filter.stars) obj.stars = this.filter.stars;
      if (this.filter.ar) obj.ar = this.filter.ar;
      if (this.filter.cs) obj.cs = this.filter.cs;
      if (this.filter.hp) obj.hp = this.filter.hp;
      if (this.filter.od) obj.od = this.filter.od;
      if (this.filter.bpm) obj.bpm = this.filter.bpm;
      if (this.filter.length) obj.length = this.filter.length;
      return obj;
    },
    async loadMore() {
      this.page++
      const result = await Api.post('/?post', this.combineFilterObj())
      if (!result || result.status !== 200) {
        this.error = true;
        return;
      }
      for (var i = 0; i < result.data.data.length; ++i) {
        const sid = result.data.data[i].sid;
        const info = await Api.get(`/v2/beatmapinfo?K=${sid}`);
        if (!info || result.status !== 200) {
          this.error = true;
          return;
        }
        const beatmapset = info.data.data as IApiBeatmapSet;
        this.sets.push(apiData2IBeatmapSet(beatmapset));
      }
    }
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
        transition: all cubic-bezier(.645,.045,.355,1) .2s;
        &:focus,
        &:hover {
          border: 1px solid hsl(200, 40%, 80%);
          box-shadow: 0 0 10px hsl(200, 40%, 80%);
        }
      }

      .ant-input-search-icon {
        color: rgba(255, 255, 255, 0.45);
      }

      .ant-input {
        background-color: hsl(200, 10%, 30%);
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
              // background: rgb(118,126,136);
              border-color: hsl(200, 100%, 60%);
            }
          }
          .el-checkbox-button__inner {
            // background: hsla(200, 50%, 45%, 0.7);
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
  }
}
</style>
