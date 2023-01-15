const baseUrl = require("./src/service/env");
const path = require("path");
const resolve = (dir) => path.join(__dirname, dir);
const IS_PROD = ["production", "prod"].includes(process.env.NODE_ENV);
const CompressionWebpackPlugin = require("compression-webpack-plugin");

const cdn = {
  externals: {
    vue: "Vue",
    vuex: "Vuex",
    "vue-router": "VueRouter",
    axios: "axios",
    vuetify: "vuetify",
    less: "less",
    jszip: "JSZip",
    prettier: "prettier",
  },
  js: [
    "https://cdn.staticfile.org/vue/2.6.11/vue.min.js",
    "https://cdn.staticfile.org/vuex/3.5.1/vuex.min.js",
    "https://cdn.staticfile.org/vue-router/3.2.0/vue-router.min.js",
    "https://cdn.staticfile.org/axios/0.19.2/axios.min.js",
    "https://cdn.staticfile.org/vuetify/2.4.0/vuetify.min.js",
    "https://cdn.staticfile.org/less.js/3.12.2/less.min.js",
    "https://cdn.staticfile.org/jszip/3.7.1/jszip.min.js",
    "https://cdn.staticfile.org/prettier/2.5.1/standalone.min.js",
  ],
};
// 本地环境是否需要使用cdn
const devNeedCdn = false;

module.exports = {
  publicPath: IS_PROD ? "/" : "/",
  outputDir: "dist",
  assetsDir: "assets",
  lintOnSave: false,
  runtimeCompiler: true,
  productionSourceMap: !IS_PROD,
  parallel: require("os").cpus().length > 1,
  pwa: {},
  devServer: {
    historyApiFallback: { index: "/index.html" },
    proxy: {
      "/api": {
        target: baseUrl.server,
        pathRewrite: {
          "^/api": "",
        },
      },
      "/admin1": {
        target: baseUrl.server1,
        pathRewrite: {
          "^/admin1": "",
        },
      },
      'user': {
        target: baseUrl.user,
        pathRewrite: {
          "^/user": "",
        },
      }
      // "/githubApi": {
      //   target: "https://api.github.com",
      //   secure: true,
      //   changeOrigin: true,
      //   pathRewrite: {
      //     "^/githubApi": "",
      //   },
      // },
      // "/qiNiuCdn": {
      //   target: "http://picstore.lliiooiill.cn",
      //   secure: true,
      //   changeOrigin: true,
      //   pathRewrite: {
      //     "^/qiNiuCdn": "",
      //   },
      // },
      // "/qiNiu": {
      //   target: "http://upload-z2.qiniup.com",
      //   pathRewrite: {
      //     "^/qiNiu": "",
      //   },
      // },
      // "/images": {
      //   target: "http://images.lliiooiill.cn",
      //   pathRewrite: {
      //     "^/images": "",
      //   },
      // },
    },
    port: 8888
  },
  configureWebpack: (config) => {
    config.module.rules.push({
      /*test: /\.extension$/,*/
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });
    //gzip压缩
    const productionGzipExtensions = ["html", "js", "css"];
    config.plugins.push(
      new CompressionWebpackPlugin({
        filename: "[path].gz[query]",
        algorithm: "gzip",
        test: new RegExp("\\.(" + productionGzipExtensions.join("|") + ")$"),
        threshold: 10240, // 只有大小大于该值的资源会被处理 10240
        minRatio: 0.8, // 只有压缩率小于这个值的资源才会被处理
        deleteOriginalAssets: false, // 删除原文件
      })
    );
    // config.optimization = {
    //   runtimeChunk: "single",
    //   /**
    //    * 以前是CommonsChunkPlugin，现在换成optimization.splitChunks。普通项目下方的配置就足够用啦
    //    * 详情见官网：https://webpack.docschina.org/configuration/optimization/#optimizationsplitchunks
    //    * */
    //   splitChunks: {
    //     chunks: "all", // 可选值：all，async 和 initial。all功能最强大，所以咱们就使用all
    //     maxInitialRequests: Infinity, // 最大并行请求数，为了以防万一，设置无穷大即可
    //     minSize: 100000, // 引入的模块大于20kb才做代码分割，官方默认20000，这里不用修改了
    //     maxSize: 200000, // 若引入的模块大于60kb，则告诉webpack尝试再进行拆分
    //     cacheGroups: {
    //       vendors: {
    //         test: /[\\/]node_modules[\\/]/, // 使用正则匹配node_modules中引入的模块
    //         priority: -10, // 优先级值越大优先级越高，默认-10，不用修改
    //         name(module) {
    //           // 设定分包以后的文件模块名字，按照包名字替换拼接一下
    //           const packageName = module.context.match(
    //             /[\\/]node_modules[\\/](.*?)([\\/]|$)/
    //           )[1];
    //           return `npm.${packageName.replace("@", "")}`;
    //         },
    //       },
    //     },
    //   },
    // };
    if (IS_PROD || devNeedCdn) config.externals = cdn.externals;
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set("@", resolve("src"))
      .set("@styles", resolve("src/styles"))
      .set("@assets", resolve("src/assets"))
      .set("@service", resolve("src/service"))
      .set("@components", resolve("src/components"))
      .set("@views", resolve("src/views"))
      .set("@store", resolve("src/store"))
      .set("@utils", resolve("src/utils"))
      .set("@plugins", resolve("src/plugins"));
    config.plugin("html").tap((args) => {
      // 生产环境或本地需要cdn时，才注入cdn
      if (IS_PROD || devNeedCdn) args[0].cdn = cdn;
      return args;
    });

    if (IS_PROD) {
      config
        .plugin("webpack-bundle-analyzer")
        .use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin);
    }
  },

  css: {
    extract: IS_PROD,
    sourceMap: false,
    loaderOptions: {
      scss: {
        additionalData: `@import '@styles/main.scss';`,
      },
    },
  },

  transpileDependencies: ["vuetify"],
};
