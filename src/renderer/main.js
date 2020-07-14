import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import nodeCmd from 'node-cmd'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

const log = function (text) {
  console.log('From the element to the Vue instance:', document.getElementById('consolelog'));
  let consolelog = document.getElementById('consolelog');
  let textNode = document.createTextNode(text + '\n');
  consolelog.appendChild(textNode);
}
Vue.prototype.log = log;

const runCmd = function (cmd) {
  nodeCmd.get(
    cmd,
    function (err, data, stderr) {
      if (err) {
        log(err);
        return
      }
      log(data);
    }
  );
}
Vue.prototype.runCmd = runCmd;
console.log('新建vue实例')
/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
