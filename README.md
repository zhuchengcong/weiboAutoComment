# WeiboAutoCommentTool

微博自动评论工具。
*警告：谨慎使用，仅供学习，不要做违法乱纪的事情。*

## 使用方法

运行需要nodejs环境 

目前实现了发带图片的微博，单个热搜微博话题下批量评论 

src目录下面是electron前端代码，暂未完善， 

examples\index.js        微博实例api 示例，有注释

lib\utils\weibo_crawler.js  热搜话题下自动评论，有注释

> weibo automment

#### Build Setup

``` bash
#运行需要nodejs环境，版本 12.0 以上， 

# install dependencies
npm install  

# serve with hot reload at localhost:9080
npm run dev  //图形化页面，目前没写完整，暂时没用

# build electron application for production
npm run build

# run unit & end-to-end tests
npm test


# lint all JS/Vue component files in `src/`
npm run lint

# 微博评论代码在  examples\index.js
# 有注释， 直接node examples\index.js  运行
node examples\index.js

# 批量评论代码在  lib\utils\weibo_crawler.js
# 有注释，直接 node lib\utils\weibo_crawler.js 运行
node lib\utils\weibo_crawler.js

```

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
