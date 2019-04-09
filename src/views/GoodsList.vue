<!--  -->
<template>
  
  <div>
    <nav-header></nav-header>
    <nav-bread>
      <span>Goods</span>
    </nav-bread>
      <div class="accessory-result-page accessory-page">
        <div class="container">
          <div class="filter-nav">
            <span class="sortby">Sort by:</span>
            <a href="javascript:void(0)" class="default cur">Default</a>
            <a href="javascript:void(0)" class="price" @click="sortGoods">Price <svg class="icon icon-arrow-short" v-bind:class="{'sort-up':!sortFlag}"><use xlink:href="#icon-arrow-short"></use></svg></a>
            <a href="javascript:void(0)" class="filterby stopPop" @click="showFilter">Filter by</a>
          </div>
          <div class="accessory-result">
            <!-- filter -->
            <div class="filter stopPop" id="filter" v-bind:class="{'filterby-show':filterBy}">
              <dl class="filter-price">
                <dt>Price:</dt>
                <dd><a href="javascript:void(0)" v-bind:class="{'cur':priceCheck=='all'}" @click="setPriceFilter('all')">All</a></dd>
                <dd v-for="(price,index) in priceFilter">
                  <a href="javascript:void(0)" v-bind:class="{'cur':priceCheck==index}" @click="setPriceFilter(index)">{{price.startPrice}}-{{price.endPrice}}</a>
                </dd>
              </dl>
            </div>

            <!-- search result accessories list -->
            <div class="accessory-list-wrap">
              <div class="accessory-list col-4">
                <ul>
                  <li v-for="item in goodsList">
                    <div class="pic">
                      <a href="#"><img v-bind:src="'static/'+item.productImage" alt=""></a>
                    </div>
                    <div class="main">
                      <div class="name">{{item.productName}}</div>
                      <div class="price"><span style="color:#d1434a">零售价:</span>{{item.salePrice}}</div>
                      <div class="btn-area">
                        <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                      </div>
                    </div>
                  </li>
                </ul>
              <div class="load-more" v-infinite-scroll="LoadMore" infinite-scroll-disabled="busy" infinite-scroll-distance='50'>
               <img src="./../assets/loading-balls.svg" v-show="loading">
              </div>
              </div>
            </div>
          </div>
        </div>
        <modal v-bind:mdShow="mdShow" v-on:close="closeModal">
          <p slot="message">
            请先登录，否则无法加入到购物车中！
          </p>
          <div slot="btnGroup">
             <a class='btn btn--m' @click="closeModal()" href="javascript:;">关闭</a>
          </div>
        </modal>
        <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
          <p slot="message">
            <svg class="icon-status-ok">
              <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-status-ok"></use>
            </svg>
            <span>加入购物车成功</span>
          </p>
          <div slot="btnGroup">
             <a class='btn btn--m' @click="mdShowCart = false" href="javascript:;">继续购物</a>
             <router-link class='btn btn--m' href="javascript:;" to="/cart">查看购物车</router-link>
          </div>
        </modal>
      </div>
    <div class="md-overlay" v-show="overLayflag" @click="closePop"></div>
    <nav-footer></nav-footer>
    </div>
</template>
<style>
.load-more{
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.sort-up{
  transform: rotate(180deg);
  transition: all 0.3s ease-out;
}
</style>

<script>
import './../assets/css/base.css'
import './../assets/css/product.css'
import NavHeader from '@/components/Header.vue'
import NavFooter from '@/components/Footer.vue'
import NavBread from '@/components/Bread.vue'
import Modal from '@/components/Modal.vue'
import axios from 'axios'
export default {
  data () {
    return {
        goodsList:[],
        sortFlag:true,
        page:1,
        pageSize:8,
        busy:true,
        loading:false,
        mdShow:false,
        mdShowCart:false,
        priceFilter:[
          {
            startPrice:'0',
            endPrice:'500'
          },
          {
            startPrice:'500',
            endPrice:'1000'
          },
          {
            startPrice:'1000',
            endPrice:'1500'
          },
          {
            startPrice:'1500',
            endPrice:'2000'
          },
          {
            startPrice:'2000',
            endPrice:'9999'
          }
        ],
        priceCheck:"all",
        filterBy:false,
        overLayflag:false
    };
  },
  components:{
    NavHeader,
    NavFooter,
    NavBread,
    Modal
  },
  mounted:function(){
    this.getGoodsList();
  },
  methods:{
    getGoodsList(flag){
      var param = {
        page:this.page,
        pageSize:this.pageSize,
        sort:this.sortFlag?1:-1,
        priceLevel:this.priceCheck,
      }
      this.loading = true;
      axios.get("/goods",{
        params:param
      }).then((result)=>{
        var res = result.data;
        this.loading = false;
        if(res.status == "0"){
          if(flag){
            this.goodsList = this.goodsList.concat(res.result.list);
            if(res.result.count == 0){
              this.busy = true;
            }else{
              this.busy = false;
            }
          }else{
            this.goodsList = res.result.list;
            this.busy = false;
          }
        }else{
          this.goodsList = [];
        }
      })
    },
    sortGoods(){
        this.sortFlag = !this.sortFlag;
        this.page = 1;
        this.getGoodsList();
    },
    LoadMore(){
      this.busy = true;
      setTimeout(() => {
        this.page++,
        this.getGoodsList(true)
      },500);
    },
    showFilter(){
      this.filterBy = true;
      this.overLayflag = true;
    },
    setPriceFilter(index){
      this.priceCheck = index;
      this.page = 1;
      this.getGoodsList();
    },
    closePop(){
      this.filterBy = false;
      this.overLayflag = false;
    },
    addCart(productId){
        axios.post("/goods/addCart",{
          productId:productId
        }).then((res)=>{
          var res = res.data;
          if(res.status == 0){
            this.mdShowCart = true;
            this.$store.commit("updateCartCount",1);
          }else{
            this.mdShow = true;
          }
        })
    },
    closeModal(){
      this.mdShow = false;
      this.mdShowCart = false;
    }
  }
}

</script>
<style>
</style>