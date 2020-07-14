const request = require('request');
const {
    urlToBase64
} = require('./pictureTool');
const fse = require('fs-extra');
const { NO_PICTURE } = require('../constans/code');
const format = require('./format');
const config = require('../weibo.config');
const querystring = require('querystring');
exports.request = function (params) {
    //TODO
    // return Promise.resolve()
    // console.log('request params', params);
    return new Promise((resolve, reject) => {
        // return resolve({
        //     statusCode:302,
        //     body:`{"code":"100000","msg":"","data":{"html":"<html></html>"}}`
        // })
        request(params, function (err, r, b) {
            if (err) {
                return reject(err);
            } else {
                if (r.statusCode >= 200 || r.statusCode < 400) {
                    return resolve(r);
                } else {
                    return reject(r);
                }
            }
        });
    });
};
let retryTime = config.cookieErrorRetryTime;

exports.weiboRequest = function (params) {
    const cookie = params.cookie;
    // console.log('weiboRequest', params);
    const host = 'https://weibo.com';
    var headers = {
        'Origin': host,
        'Pragma': 'no-cache',
        "Host": "weibo.com",
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': host + '/friends',
        'Accept': '*/*',
        'Cache-Control': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
        'Connection': 'keep-alive'
    };
    let promise;
    if (params.cookieStr) {
        headers.Cookie = params.cookieStr;
        promise = Promise.resolve();
    } else {
        promise = cookie.getWeiboCookie().then(cookieStr => {
            headers.Cookie = cookieStr;
            return Promise.resolve();
        });
    }

    promise = promise.then(data => {
        let requestParams = Object.assign({
            url: host + params.url,
            headers: headers,
            method: params.method || 'POST',
            form: params.form
        }, params.extra);
        return exports.request(requestParams).then(data => {
            if (data.statusCode === 302) {
                console.log('retryTime', retryTime);
                //登录态问题，获取到登录态之后重试
                //todo 
                if (retryTime > 0) {
                    retryTime--;
                    return cookie.getWeiboCookie({
                        force: true
                    }).then(() => {
                        return Promise.resolve();
                    }).then(() => {
                        return exports.weiboRequest(params);
                    });
                } else {
                    return Promise.reject({
                        code: 9001,
                        message: "cookie 无效"
                    });
                }
            }
            // console.log('status', data.statusCode);
            // console.log('header', data.header);
            // console.log('body', data.body);
            return data;
        });
    });
    return promise;
};
/**
 * 微博批量上传图片
 */
exports.weiboMultiUploadPicture = function (params) {
    // console.log('params',params);
    let promises = [];
    // console.log('pictureBase64Datas',params.pictureBase64Datas.length);
    if (Array.isArray(params.pictureBase64Datas) && params.pictureBase64Datas.length > 0) {
        promises = params.pictureBase64Datas.map(pic => {
            return exports.weiboUploadPicture({
                pictureBase64Data: pic,
                cookie: params.cookie
            });
        });
    } else if (Array.isArray(params.pictureUrls) && params.pictureUrls.length > 0) {
        promises = params.pictureUrls.map(pic => {
            return exports.weiboUploadPicture({
                pictureUrl: pic,
                cookie: params.cookie
            });
        });
    } else if (Array.isArray(params.pictureFiles) && params.pictureFiles.length > 0) {
        promises = params.pictureFiles.map(pic => {
            return exports.weiboUploadPicture({
                pictureFile: pic,
                cookie: params.cookie
            });
        });
    } else {
        return Promise.reject({
            code: NO_PICTURE,
            msg: "图片不存在"
        });
    }
    return Promise.all(promises);
};
/**
 * 微博上传图片
 */
exports.weiboUploadPicture = async function (params) {
    // console.log('params',params);
    let base64Data = '';
    //优先读取base64
    if (params.pictureBase64Data) {
        // console.log('here',);
        base64Data = params.pictureBase64Data.split('base64,')[1] || params.pictureBase64Data.split('base64,')[0];
        // console.log('base64Data',base64Data);
        // return;
    } else if (params.pictureUrl) {
        try {
            base64Data = await urlToBase64(params.pictureUrl);
        } catch (error) {
            console.log('error', error);
            return Promise.reject(error);
        }
    } else if (params.pictureFile) {
        try {
            base64Data = await fse.readFile(params.pictureFile, 'base64');
        } catch (error) {
            console.log('error', error);
            return Promise.reject(error);
        }
        // console.log('base64Data',base64Data);
    } else {
        return Promise.reject({
            code: NO_PICTURE,
            msg: "图片不存在"
        });
    }
    const cookie = params.cookie;
    const host = 'https://weibo.com';
    var headers = {
        'Origin': host,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': host + '/friends'
    };
    let promise = cookie.getWeiboCookie().then(cookieStr => {
        headers.Cookie = cookieStr;
        return Promise.resolve();
    });
    promise = promise.then(data => {
        let requestParams = Object.assign({
            url: 'https://picupload.weibo.com/interface/pic_upload.php',
            qs: {
                cb: `https://weibo.com/aj/static/upimgback.html?_wv=5&callback=STK_ijax_${new Date().getTime()}`,
                mime: 'image/jpeg',
                data: 'base64',
                url: '0',
                ori: '1', //原图
                markpos: '1',
                logo: '',
                nick: '0',
                marks: '0',
                app: 'miniblog',
                s: 'rdxt' },
            headers: headers,
            method: params.method || 'POST',
            form: {
                b64_data: base64Data
            }
        }, params.extra);
        return exports.request(requestParams).then(data => {
            // delete requestParams.form
            // console.log('requestParams',requestParams);

            // console.log('data.status',data.statusCode);
            // console.log('data.body',data.body);
            // console.log('data',data.headers);
            // console.log('location',data.headers.location);
            // return;
            if (data.statusCode === 302) {
                let response = format.parseUploadResponse(data.headers.location);
                if (response.ret == 1 && response.pid) {
                    //上传成功
                    return {
                        pid: response.pid,
                        url: `http://ww3.sinaimg.cn/large/${response.pid}`
                    };
                } else if (response.ret == -1) {
                    //cookie无效
                    console.log('retryTime', retryTime);
                    //登录态问题，获取到登录态之后重试
                    //todo 
                    if (retryTime > 0) {
                        retryTime--;
                        return cookie.getWeiboCookie({
                            force: true
                        }).then(() => {
                            return Promise.resolve();
                        }).then(() => {
                            return exports.weiboUploadPicture(params);
                        });
                    } else {
                        return Promise.reject({
                            code: 9001,
                            message: "cookie 无效"
                        });
                    }
                } else {
                    return Promise.reject({
                        code: response.ret,
                        message: "上传图片错误"
                    });
                }
            }
        });
    });
    return promise;
};


exports.weiboComment = function (params) {
    const cookie = params.cookie;
    // console.log('weiboRequest', params);
    const host = 'https://s.weibo.com';
    var headers = {
        'Origin': host,
        'Pragma': 'no-cache',
        "Host": "s.weibo.com",
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': host + '/friends',
        'Accept': '*/*',
        'Cache-Control': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
        'Connection': 'keep-alive'
    };
    let promise;
    if (params.cookieStr) {
        headers.Cookie = params.cookieStr;
        promise = Promise.resolve();
    } else {
        promise = cookie.getWeiboCookie().then(cookieStr => {
            headers.Cookie = cookieStr;
            return Promise.resolve();
        });
    }

    promise = promise.then(data => {
        let requestParams = Object.assign({
            url: host + params.url,
            headers: headers,
            method: params.method || 'POST',
            form: params.form
        }, params.extra);
        return exports.request(requestParams).then(data => {
            if (data.statusCode === 302) {
                console.log('retryTime', retryTime);
                //登录态问题，获取到登录态之后重试
                //todo 
                if (retryTime > 0) {
                    retryTime--;
                    return cookie.getWeiboCookie({
                        force: true
                    }).then(() => {
                        return Promise.resolve();
                    }).then(() => {
                        return exports.weiboRequest(params);
                    });
                } else {
                    return Promise.reject({
                        code: 9001,
                        message: "cookie 无效"
                    });
                }
            }
            // console.log('status', data.statusCode);
            // console.log('header', data.header);
            // console.log('body', data.body);
            return data;
        });
    });
    return promise;
};


exports.weiboTop = function (params) {
    const cookie = params.cookie;
    // console.log('weiboRequest', params);
    const host = 'https://s.weibo.com';
    var headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Host': "s.weibo.com",
        'Sec-Fetch-Dest': 'document',
       'Sec-Fetch-Mode': 'navigate',
       'Sec-Fetch-Site': 'none',
       'Sec-Fetch-User': '?1',
       'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
        
    };
    let promise;
    if (params.cookieStr) {
        headers.Cookie = params.cookieStr;
        promise = Promise.resolve();
    } else {
        promise = cookie.getWeiboCookie().then(cookieStr => {
            headers.Cookie = cookieStr;
            return Promise.resolve();
        });
    }

    promise = promise.then(data => {
        let requestParams = Object.assign({
            url: host + params.url,
            headers: headers,
            method: params.method || 'POST',
        }, params.extra);
       // console.log(requestParams);

        return exports.requestGet(requestParams).then(r => {
            let reg = /location\.replace\((?:"|')(.*)(?:"|')\)/;
            let loginUrl = reg.exec(r.body)[1];
            let parseLoginUrl = querystring.parse(loginUrl);
            console.log('loginUrl',loginUrl);
            if(parseLoginUrl.retcode == '6102'){
                let j = request.jar();
                requestParams.url = loginUrl
                request(requestParams, function (error, reponse, body) {
                    console.log('body',body);
                    return body;
                });
            }else{
                return '未获得正确的跳转链接，检查请求是否正确';
            }
            
            // console.log('status', data.statusCode);
            // console.log('header', data.header);
            // console.log('body', data.body);
           
        });
    });
    return promise;
};

exports.requestGet = function (params) {
    //TODO
    // return Promise.resolve()
    // console.log('request params', params);
    return new Promise((resolve, reject) => {
        // return resolve({
        //     statusCode:302,
        //     body:`{"code":"100000","msg":"","data":{"html":"<html></html>"}}`
        // })
        request(params, function (err, r, b) {
           // console.log('r',r)
            if(params.url == 'https://s.weibo.com/weibo?q=%23%E6%9E%97%E5%B0%8F%E5%AE%85%E5%9B%9E%E5%BA%94%E6%81%8B%E6%83%85%23&Refer=top'){
                console.log('Url',params.url);
            }else{
                console.log('qita',params.url);
            }
            if (err) {
                return reject(err);
            } else {
                if (r.statusCode >= 200 || r.statusCode < 400) {
                    return resolve(r);
                } else {
                    return reject(r);
                }
            }
        });
    });
};