## 简介
一个记录代码的平台, 类似于codepen, 能保存自己平时的代码
基于以下开源项目: 
前端: [JS-Encoder-Online](https://github.com/JS-Encoder/JS-Encoder-Online)
后端: [PerfreeBlog](https://github.com/perfree/PerfreeBlog)

## 使用
拉PerfreeBlog的代码然后跑起来, 记住自己跑的端口, 一般跑的端口是8080, 然后JS-Encoder-Online部署到其他域名下, 将nginx接口代理, /api 和 /admin, 代理到PerfreeBlog的端口

## 注意事项
需要注意的是, 使用的是PerfreeBlog接口, 它是一个写文章的项目, 目前将代码的数据以保存到文章的表中, 可以看源码都是用的哪些字段