<template>
  <div class="home">
      hello world!
      <router-link :to="{ name: 'landing-page'}">返回</router-link>
      <mytab :dataSource="data"  @handle="updateActive"></mytab>
      <section v-show="currIndex == 0" class="tab_content">
        程序状态页面
      </section>
      <section v-show="currIndex == 1" class="tab_content">
        <mytab :dataSource="data2" @handle="updateActive2" :currIndex="currIndex2"></mytab>
        <section v-show="currIndex2 ==0"> 
            <ul class="d-flex">
              <li>
                <input
                  v-model="newTodoText"
                  id="new-todo"
                  placeholder="添加关键词"
                >
                <button @click="addNewTodo()">Add</button>
              </li>
              <li v-for="(todo, index) in todos" :key="index+todo.id">
                {{ todo.title }}
                <button v-on:click="todos.splice(index, 1)">Remove</button>
              </li>
              <li>
                <label for="time">间隔时间设置（分钟）</label>
                <input
                id="time"
                placeholder="会在间隔时间后重复执行操作"
                >
              </li>
              <li>
                <label for="cycletime">每天定时设置</label>
                <input
                id="starttime"
                placeholder="会定时启动程序"
                >
              </li>
              <li>
                <button @click="start()">启动微博热搜自动评论</button>
              </li>
            </ul>
        </section>
        <section v-show="currIndex2 ==1">
            <button @click="start()">启动微博热搜自动评论</button>
        </section>
      </section>
      <section v-show="currIndex == 2" class="tab_content">
        微博账号管理
      </section>
  </div>
</template>

<script>
  import mytab from '../components/MyTab/MyTab'
  export default {
    data () {
      return {
        data: [
          { text: '程序运行状态' },
          { text: '程序功能设置' },
          { text: '微博账号管理' }
        ],
        data2: [
          { text: '综合搜索评论' },
          { text: '微博热搜评论' }
        ],
        currIndex: 0,
        currIndex2: 0,
        newTodoText: '',
        todos: [],
        nextTodoId: 4
      }
    },
    async created () {
    },
    mounted () {
    },
    name: 'home',
    components: {
      mytab
    },
    methods: {
      open (link) {
        // const res = await this.$http.get(`https://s.weibo.com/weibo?q=%23%E6%9E%97%E5%B0%8F%E5%AE%85%E5%9B%9E%E5%BA%94%E6%81%8B%E6%83%85%23&Refer=top`); console.log(res);
        this.$electron.shell.openExternal(link)
      },
      updateActive (item, index) {
        console.log(index)
        this.currIndex = index
      },
      updateActive2 (item, index) {
        console.log(index)
        this.currIndex2 = index
      },
      addNewTodo: function () {
        this.todos.push({
          id: this.nextTodoId++,
          title: this.newTodoText
        })
        this.newTodoText = ''
      },
      start () {
        this.log('程序已启动');
        this.runCmd('node ./weibo/example/app.js');
      }
    }
  }
</script>

<style lang="scss" scoped>
.home {
  //background-color: #00adb5;
}
.d-flex li {
  display: flex;
  flex-direction: row ;
  justify-content:flex-start
}
.tab_content {
  margin: 1rem 0;
  padding: 1rem 1rem;
}

</style>