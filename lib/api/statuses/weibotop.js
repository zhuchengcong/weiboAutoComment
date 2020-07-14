/**
 * 发送微博相关
 */
const util = require('../../utils');
const format = require('../../utils/format');
const querystring = require('querystring');
const { resolve } = require('path');
const { rejects } = require('assert');

module.exports = function (params) {
   
  let promise;

    promise = util.weiboTop({
      cookie: params.cookie,
      url: "/weibo?q=%23%E6%9E%97%E5%B0%8F%E5%AE%85%E5%9B%9E%E5%BA%94%E6%81%8B%E6%83%85%23&Refer=top",
      method:'GET'
    });
  

  promise = promise.then(data => {
    return new Promise((resolve,reject)=>{
      
         resolve(data);

    }) 
  });

  return promise;
};