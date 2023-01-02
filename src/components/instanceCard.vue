<template>
  <v-card class="instance-card">
    <div class="iframe-wrap">
      <iframe
        class="ifram-item"
        sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
        scrolling="no"
        allowfullscreen="allowfullscreen"
        :srcdoc="info.content"
      ></iframe>
    </div>

    <v-card-actions>
      <v-menu
        transition="none"
        offset-y
        open-delay="500"
        close-delay="200"
        top
        :open-on-hover="true"
        :close-on-content-click="false"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-avatar
            size="40"
            class="pointer"
            v-bind="attrs"
            v-on="on"
            :color="info.user.avatar ? '' : 'primary'"
          >
            <v-img
              v-if="info.user.avatar"
              :src="qiNiuImgLink + info.user.avatar"
              :alt="info.user.userName"
            ></v-img>
            <span class="white--text text-h7" v-else>{{
              info.user.userName | preNickname
            }}</span>
          </v-avatar>
        </template>
        <user-card
          :avatar="info.user.avatar"
          :username="info.user.userName"
          :nickname="info.user.userName"
          :about="info.user.description"
        ></user-card>
      </v-menu>
      <div class="instance-info d-flex flex-clo flex-start pointer">
        <span class="text-sm" :title="info.title">{{ info.title }}</span>
        <span class="text-xs author" @click="viewUserProfile">{{
          info.user.nameName
        }}</span>
      </div>
      <v-spacer></v-spacer>
      <!-- <v-btn icon :class="info.myFavorites?'icon-like-active':'icon-like'" :loading="likeLoading" @click="like">
        <v-icon>mdi-heart</v-icon>
      </v-btn>
      <span class="liked-num text-xs">{{info.favorites|formatNumber}}</span> -->
      <v-btn class="icon-share" icon @click="viewInstance">
        <v-icon>mdi-eye</v-icon>
      </v-btn>

      <v-btn class="icon-share" icon @click="shareLink">
        <v-icon>mdi-share-variant</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import UserCard from "@components/userCard";
import { copyToClip } from "@utils/tools";
import { qiNiuImgLink, defPosterKey } from "@utils/publicData";
import env from "@service/env";
export default {
  props: {
    info: Object,
    cardIndex: Number,
  },
  data() {
    return {
      qiNiuImgLink,
      defPosterKey,
      likeLoading: false,
    };
  },
  computed: {
    ...mapState(["loginState", "loginInfo"]),
    ...mapGetters(["isSelfProfile"]),
    isSelfWork() {
      return this.info.username === this.loginInfo.username;
    },
  },
  methods: {

    shareLink() {
      const { user, id } = this.info;
      copyToClip(`${env.client}/html/work/${user.userName}/${id}`);
      this.$message.success("链接已复制到剪切板！");
    },
    viewInstance() {
      const { user, id } = this.info;
      this.$router.push(`/html/work/${user.userName}/${id}`);
    },
    viewUserProfile() {
      this.$router.push(`/user/${this.info.username}`);
    },
    async like() {
      if (!this.loginState) {
        this.$message.info("请登录后再进行相关操作！");
        return void 0;
      } else if (this.isSelfWork) {
        this.$message.info("不能对自己的实例点喜欢哦");
        return void 0;
      }
      const { myFavorites, exampleId } = this.info;
      this.likeLoading = true;
      try {
        // 根据当前是否已喜欢来判定调用喜欢还是取消喜欢接口
        const api = this.$http;
        const req = myFavorites ? api.delLikeWork : api.addLikeWork;
        const res = await req({ username: this.loginInfo.username, exampleId });
        if (res.state) {
          if (
            this.isSelfProfile &&
            myFavorites &&
            this.$route.name === "Liked"
          ) {
            this.$emit("search");
          } else {
            this.setFav(!myFavorites);
          }
          // this.$message.success(myFavorites ? '已取消喜爱！' : '已喜爱！')
        }
      } catch (err) {
        console.log(err);
      }
      this.likeLoading = false;
    },
    setFav(isFav) {
      this.$emit("setFav", isFav, this.cardIndex);
    },
  },
  components: {
    UserCard,
  },
};
</script>

<style lang="scss" scoped>
.instance-card {
  width: 100%;
  .iframe-wrap {
    height: 227px;
    iframe {
      width: calc(200%);
      height: calc(200%);
      border: 0;

      background: #fff;
      transform: scale(0.5);
      transform-origin: top left;
      opacity: 1;
      transition: opacity 0.4s linear 0.1s;
    }
  }

  .instance-card-img {
    height: 0;
    padding-bottom: 55%;
    position: relative;
    .img-screen {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      opacity: 0;
      @include setTransition(opacity, 0.3s, ease);
      &:hover {
        opacity: 1;
      }
    }
  }
  .instance-info {
    margin-left: 10px;
    width: calc(100% - 180px);
    span {
      display: block;
      @include text-ellipsis;
    }
    .author {
      color: $light-7;
      &:hover {
        color: $light-2;
      }
    }
  }
}
</style>
