/**
 * 评论微博相关
 */
const util = require('../../utils');
const format = require('../../utils/format');

module.exports = function (params) {
  params = Object.assign({
    act: 'post',
    forward: '0',
    isroot: '0',
    pageid: 'weibo',
    dom: 'javascript:void(0)',
    ouid: '1890124614',
    action_code: '31',
    _t: '0'
  }, params);
  
  //浅拷贝去除cookie获得表单数据
  let formData =Object.assign({},params);
  delete formData.cookie;
  formData.content +=Math.random().toString(36).slice(-3);
  let promise;
  promise = util.weiboComment({
    cookie: params.cookie,
    url: `/Ajax_Comment/add?__rnd=${new Date().getTime()}`,
    form: formData
  });
  promise = promise.then(data => {
    if (data.statusCode === 200) {
      try {
        var body = JSON.parse(data.body);
      } catch (error) {
        return format.errorPromise(error);
      }
      if (body.code == '100000') {
        return {
          meta: {
            code: 100000 //0代表成功
          },
          data: format.succMessage(body.data.comment)

        };
      } else {
        return format.errorMessage(body);
      }
    } else {
      //失败      
      return format.errorPromise(data);
    }
  });
  return promise;
};