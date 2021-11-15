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

  productionSourceMap: false,

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
