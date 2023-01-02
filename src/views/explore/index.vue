<template>
  <div id="explore" class="d-flex flex-ai flex-clo" style="overflow: hidden">
    <go-to-top></go-to-top>
    <div class="explore-content">
      <div class="find-tip flex-jcc" v-show="showNothingTip">
        <div class="tip-content d-flex flex-clo flex-ai">
          <span class="emoji">🧐</span>
          <span class="text-describe">哎呀，什么都没找到诶~~</span>
          <span class="text-describe"
            >但我想，也许你可以为这里开拓一片新天地？</span
          >
        </div>
      </div>
      <!-- <div class="init-tip flex-jcc" v-show="!init">
        <div class="d-flex flex-jcc text-describe">
          <span>请在搜索框输入关键字寻找你想要的实例</span>
        </div>
      </div> -->
      <div v-show="!nothing">
        <div class="explore-instance-list">
          <div
            class="explore-list-item"
            v-for="(item, index) in instanceList"
            :key="item.exampleId"
          >
            <instance-card
              :info="item"
              :cardIndex="index"
              @setFav="setFav"
            ></instance-card>
          </div>
          <div
            class="skeleton-list-item"
            v-show="listLoading"
            v-for="(item, index) in 12"
            :key="index"
          >
            <instance-skeleton></instance-skeleton>
          </div>
        </div>
        <div class="page-opt flex-jcc" v-show="!isFirstPage || !isLastPage">
          <v-btn
            color="primary"
            class="before-btn"
            @click="switchPage(-1)"
            :disabled="isFirstPage"
            >上一页</v-btn
          >
          <v-btn
            color="primary"
            class="after-btn"
            @click="switchPage(1)"
            :disabled="isLastPage"
            >下一页</v-btn
          >
        </div>
      </div>
      <div v-show="nothing && !showNothingTip">暂无数据</div>
    </div>
  </div>
</template>

<script>
import InstanceSkeleton from "@components/skeleton/instanceSkeleton";
import CateGory from "@components/CateGory";
import InstanceCard from "@components/instanceCard";
import GoToTop from "@components/goToTop";
import { defPrepOpts } from "@utils/publicData";
import { judgeMode } from "@utils/editor/judgeMode";
import * as p2b from "@utils/paramsToBase64";
export default {
  name: "Explore",
  provide() {
    return {
      setFollow: (isFollow, username) => {
        this.instanceList.forEach((item) => {
          if (item.username === username) {
            item.myFollow = isFollow;
          }
        });
      },
    };
  },
  data() {
    return {
      sortList: Object.freeze([
        { text: "创建时间", value: 0 },
        { text: "更新日期", value: 1 },
        { text: "喜爱度", value: 2 },
      ]),
      prepList: [],
      searchForm: {
        keyword: "",
        prep: "",
        sort: 2,
      },
      page: 1,
      instanceList: [],
      nothing: false,
      showNothingTip: false,
      searchLoading: false,
      showFilter: false,
      listLoading: false,
      isLastPage: false,
      isFirstPage: false,
      init: false,
    };
  },
  created() {
    const prepList = this.prepList;
    for (let key in defPrepOpts) {
      prepList.push(...defPrepOpts[key]);
    }
    this.initData();
  },
  methods: {
    initData() {
      let page = 1;
      let sort = 2;
      let prep = "";
      let keyword = "";
      let f = this.$route.query.f;
      if (f) {
        const {
          page: fPage,
          sort: fSort,
          prep: fPrep,
          keyword: fKeyword,
        } = p2b.decode(f);
        page = parseInt(fPage);
        sort = parseInt(fSort);
        keyword = fKeyword;
        prep = fPrep;
      }
      this.searchForm = { sort, prep, keyword };
      this.page = page;
      this.getInstance();
    },
    newSearch() {
      // 重新从第一页开始搜索
      this.page = 1;
      this.getInstance();
    },
    switchPage(changeNum) {
      this.page += changeNum;
      this.getInstance();
    },
    switchRoute() {
      // 切换路由，如果没有name就只更新query查询信息
      const f = p2b.encode({ ...this.searchForm, page: this.page });
      if (this.$route.query.f !== f) {
        const routeObj = { name: "Explore", query: { f } };
        this.$router
          .push(routeObj)
          .then(() => {
            this.getInstance();
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        this.getInstance();
      }
    },
    search() {
      this.$refs.searchField.blur();
      this.newSearch();
    },
    async getInstance(title = "", resetPage) {
      try {
        this.instanceList = [];
        this.searchLoading = true;
        this.listLoading = true;
        this.nothing = false;
        this.showNothingTip = false;
        this.init = true;

        const res = await this.$http.searchWorksByContent({
          pageIndex: resetPage ? 1 : this.page,
          pageSize: 12,
          type: "code",
          title,
          // currentPage: this.page,
          // queryContent: keyword || "",
        });
        if (res.code === 200) {
          // this.$message.success('查询成功！')
          const { data: list, isLastPage, isFirstPage } = res;
          this.nothing = list.length === 0;
          this.showNothingTip = list.length === 0;
          this.instanceList = list.map((item) => {
            const contentData = JSON.parse(item.content);
            return {
              ...item,
              content: contentData.content,
            };
          });
          if (resetPage) {
            this.page = 1;
          }
          this.isFirstPage = res.pageIndex === 1;
          this.isLastPage = res.pageIndex >= Math.ceil(res.total / 12);
        } else {
          this.nothing = true;
          // this.$message.error('查询失败！')
        }
      } catch (err) {
        this.nothing = true;
      }
      this.searchLoading = false;
      this.listLoading = false;
    },
    setFav(isFav, index) {
      const item = this.instanceList[index];
      item.myFavorites = isFav;
      item.favorites += isFav ? 1 : -1;
    },
  },
  components: {
    InstanceSkeleton,
    InstanceCard,
    GoToTop,
    CateGory,
  },
};
</script>
<style lang="scss">
.search-keyword {
  .v-input__slot {
    padding-right: 100px !important;
  }
}
</style>
<style lang="scss" scoped>
#explore {
  padding: 20px 0;
  .explore-content {
    .find-tip {
      display: flex;
      padding: 50px 0 150px 0;
      .tip-content {
        padding: 25px 50px;
        border-radius: 5px;
        background-color: $deep-4;
        span {
          margin-bottom: 10px;
        }
        .emoji {
          font-size: 64px;
        }
      }
    }
    .init-tip {
      margin: 50px 0;
      padding: 30px 50px;
      background-color: $deep-3;
      border-radius: 10px;
    }
    .explore-search {
      .search-keyword {
        .search-btn {
          top: 4px;
          right: 4px;
        }
      }
    }
    .explore-instance-list {
      margin-top: 30px;
      display: grid;
      grid-gap: 30px;
    }
  }
  .page-opt {
    display: flex;
    margin-top: 50px;
    .before-btn {
      margin-right: 15px;
    }
  }
}

@include Mobile {
  #explore {
    padding: 50px 10px 0;
    .explore-content {
      .explore-instance-list {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
    }
  }
}
@include screenSM {
  #explore .explore-content {
    width: 90%;
  }
}
@include screenMD {
  #explore {
    .explore-content {
      width: 95%;
      .explore-instance-list {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
    }
  }
}
@include screenLG {
  #explore {
    .explore-content {
      width: 90%;
      .explore-instance-list {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
    }
  }
}
@include screenXL {
  #explore {
    .explore-content {
      width: 90%;
      .explore-instance-list {
        grid-template-columns: repeat(4, minmax(300px, 1fr));
      }
    }
  }
}
</style>
