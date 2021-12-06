const path = require('path')
function resolve (dir) {
  return path.join(__dirname, dir)
}
/** 标准横幅 **/
const package = require('./package.json')
const banner = `${package.name} v${package.version}
(c) 2021-${new Date().getFullYear()} entfrm开发团队-王翔
Released under the MIT License`

module.exports = {

  // 部署生产环境和开发环境下的URL。
  // 默认情况下，Vue CLI 会假设你的应用是被部署在一个域名的根路径上
  // 例如 https://www.entfrm.com/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.entfrm.com/admin/，则设置 baseUrl 为 /admin/。
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",

  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,

  // 用于放置生成的静态资源 (js、css、img、fonts) 的；（项目打包之后，静态资源会放在这个文件夹下）
  assetsDir: 'static',

  configureWebpack: {
    output: {
      libraryExport: 'default'
    }
  },

  chainWebpack: config => {

    config.externals({
      'vue': 'Vue',
      'element-ui': 'ELEMENT'
    })

    config.resolve.alias
      .set('@', resolve('packages'))
      .set('@moddle', resolve('packages/moddle'))
      .set('@components', resolve('packages/components'))
      .set('@utils', resolve('packages/utils'))

    config.plugin('banner')
      .use(require('webpack').BannerPlugin, [banner])

    config.plugin("limitChunkCountPlugin")
      .use(require("webpack").optimize.LimitChunkCountPlugin, [{ maxChunks: 1 }])
  },

  devServer: {
    host: '0.0.0.0',
    port: 80,
    open: true,
    // 测试请求后端Api
    proxy: {
      '/test': {
        target: `http://localhost:8888`,
        changeOrigin: true,
        pathRewrite: { '^/test': '' }
      }
    },
    disableHostCheck: true
  }
}
