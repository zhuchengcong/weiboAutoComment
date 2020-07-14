/**
 * 爬取热搜微博id
 */



"use strict";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const fs = require('fs');
const moment = require('moment');
const Crawler = require('crawler');
const fse = require('fs-extra');
const path = require('path');
const Weibo = require('../weibo');
const { resolve } = require('path');

const _prgname = 'doubanTop250';

const jsonPath = path.join(__dirname, '../', 'tokens', `general.json`);


class WeiboCrawler {
    mids = [];
    status = false;
    timer = null;
    weibo = null;
    constructor() {
        // this.writeStream = fs.createWriteStream('../result/' + _prgname + '_book_' + moment().format('YYYY-MM-DD') + '.csv');
        this.rank = 1;
        this.cookie = null;

        this.options = {
            jQuery: 'cheerio',
            maxConnection: 1,
            forceUTF8: true,
            rateLimit: 2000,
            jar: true,
            time: true,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Host': "s.weibo.com",
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
            }
        }
        this.crawler = new Crawler(this.options);

        this.crawler.on('drain', () => {
            this.status = true;
            console.log(this.mids);
            this.comment(this.mids,1000);

            //end stream
            // this.writeStream.end();
        }).on('schedule', options => {
            //options.proxy = 'http://xxx.xxx.xx.xxx:xxxx';
            options.limiter = Math.floor(Math.random() * 10);//并发10
        });
    }
    async init() {
        try {
            const json = await fse.readJson(jsonPath);
            this.cookie = json.value;
            this.headers = Object.assign({
                Cookie: this.cookie
            }, this.headers);
             this.weibo = new Weibo({
                username: "", //微博账号
                password: "", //微博密码
                onNeedPinCode: function (params) {
                    //当需要验证码的时候会回调这里,这里会传入本次验证码的url和codeKey，人工辨识后，然后回调下params.callback('具体的验证码');
                    console.log('codePictureUrl', params.codePictureUrl);
                    console.log('codeKey', params.codeKey);
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
                    rl.question('请输入验证码\n', (pinCode) => {
                        console.log(`你输入的验证码为：${pinCode}`);
                        params.callback(pinCode)
                        rl.close();
                    })
                }
            });
            

            return;
        } catch (err) {
            console.log('err', err);
            return err;
        }
    }
    start() {
        this.status = false;
        this.mids = [];
        let self = this;
        //self.writeStream.write(`\ufeff${self.header}\n`);
        this.crawler.queue({
            uri: 'https://s.weibo.com/weibo?q=%23%E6%88%90%E9%83%BD%E5%9D%A0%E4%BA%A114%E5%B2%81%E5%A5%B3%E5%AD%A9%E6%AF%8D%E4%BA%B2%E5%8F%91%E5%A3%B0%23&Refer=top&sudaref=s.weibo.com&display=0&retcode=6102',
            method: 'GET',
            callback: this.pageList.bind(this)
        });
    }
    pageList(err, res, done) {
        let self = this;
        const $ = res.$;
        let midsEle =  $('.card-wrap');
        midsEle.each((i,index)=>{
            if($(midsEle[i]).attr('mid')){
                this.mids.push($(midsEle[i]).attr('mid'));
            }
        })
        return done();
    }
    comment(mids,time){
        for(let i = 0;i<mids.length;i++){
            setTimeout(()=>{
                this.weibo.api('statuses/comment',{
                    content:'微博自动引流脚本，+Q 裙：1085205921，',
                    mid:mids[i],
                    uid:'3811146291',
                }).then( (data) => {
                    console.log('succ',data);
                }).catch( (e) => {
                    console.log('comment_err',e)
                });
            },time);
            time = time*(i+1);
        }
    }
}

(async () => {
    const weiboCrawler = new WeiboCrawler();
    await weiboCrawler.init();
    weiboCrawler.start();
})()


