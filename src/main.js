import Vue from 'vue'
import App from './App'
import router from './router'
import Vuex from 'vuex'
import VueLazyLoad from 'vue-lazyload'  //懒加载
import VueInfinite from 'vue-infinite-scroll'  //滚动加载
import {currency} from "@/util/currency"  //价格格式化过滤器
Vue.filter("currency",currency);

Vue.config.productionTip = false

Vue.use(VueLazyLoad,{
  loading:"./static/loading-svg/loading-bars.svg"
}),
Vue.use(VueInfinite)
Vue.use(Vuex);

const store = new Vuex.Store({
  state:{
    nickName:'',
    cartCount:0
  },
  mutations:{
    updateUserInfo(state,nickName){
      state.nickName = nickName;
    },
    updateCartCount(state,cartCount){
      state.cartCount += cartCount;
    },
    initCartCount(state,cartCount){
      state.cartCount = cartCount;
    }
  }
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
