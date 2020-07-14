<template>
    <div class="wt-tab">
        <div class="tab">
            <ul :class="type">
                <li v-for="(item, index) in dataSource" :key="index" @click="handle(item, index)" :class="{active:active == index}">
                    {{item.text}}
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
export default {
  name: 'wt-tab',
  props: {
    dataSource: {
      type: Array,
      default: () => {
        return []
      }
    },
    currIndex: {
      type: Number | String,
      default: () => {
        return 0
      }
    },
    type: {
      type: String,
      default: () => {
        return 'default'
      }
    }
  },
  data () {
    return {
      active: ''
    };
  },
  created () {
    this.active = this._props.currIndex;
  },
  methods: {
    handle (item, index) {
      this.active = index;
      this.$emit('handle', item, index);
    }
  }
}
</script>
<style lang="scss" scoped>
 .wt-tab {
     color: #eeeeee;
     width: 100%;
     font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
     .tab {
         background: #fff;
        //  border-bottom: 1px solid #ebebeb;
         &::after {
              transform: scaleY(.5);
              height: 1px;
              content: '';
              border-bottom: 1px solid #ccc;
              display: block;
          }
         ul {
             display: flex;
             font-size: 1rem;
             &.default {
                 justify-content: flex-start;
             }
             &.full {
                 justify-content: space-between;
                 li {
                     flex: 1;
                     text-align: center;
                 }
             }
             li {
                 margin-left: 0.3rem;;
                 border: 1px solid #393e46;
                 border-radius: 1rem;
                 background-color: #393e46;
                 padding: 7px 7px 7px 7px;
                 list-style: none;
                 height: 2rem;
                 line-height: 1rem;
                &.active {
                    border-bottom: 2px solid #a3a3a3;
                    margin-bottom: -1px;
                   // color: #1BB5F1;
                   background-color: #222831;
                }
             }
         }
     }
 }
</style>