<template>
    <div id="detail">
        <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="nav"></detail-nav-bar>
        <scroll class="content" ref="scroll" :probe-type="3" @scroll="contentScroll">
            <detail-swiper :top-images="topImages"></detail-swiper>
            <detail-base-info :goods="goods"></detail-base-info>
            <detail-shop-info :shop="shop"></detail-shop-info>
            <detail-images-info :images-info="detailInfo" @imgLoad="imageLoad"></detail-images-info>
            <detail-param-info ref="params" :param-info="paramInfo"></detail-param-info>
            <detail-comment-info ref="comment" :comment-info="commentInfo"></detail-comment-info>
            <goods-list ref="recommend" :goods="recommends"></goods-list>
        </scroll>
        <detail-bottom-bar @addToCart="addToCart"></detail-bottom-bar>
        <back-top @click.native="backTop" v-show="isShowBackTop"></back-top>
    </div>
</template>

<script>
import DetailNavBar from './childComps/DetailNavBar'
import DetailSwiper from './childComps/DetailSwiper'
import DetailBaseInfo from './childComps/DetailBaseInfo'
import DetailShopInfo from './childComps/DetailShopInfo'
import DetailImagesInfo from './childComps/DetailImagesInfo'
import DetailParamInfo from './childComps/DetailParamInfo'
import DetailCommentInfo from './childComps/DetailCommentInfo'
import DetailBottomBar from './childComps/DetailBottomBar'


import Scroll from 'components/common/scroll/Scroll'
import GoodsList from 'components/content/goods/GoodsList'

import { getDetail, Goods, Shop, GoodsParam, getRecommend } from 'network/detail'

import { debounce } from "common/utils";
import { itemListenerMixin, backTopMixin } from 'common/mixin'

import { mapActions, mapGetters } from 'vuex'

export default {
    name: 'Detail',
    components: {
        DetailNavBar,
        DetailSwiper,
        DetailBaseInfo,
        DetailShopInfo,
        DetailImagesInfo,
        DetailParamInfo,
        DetailCommentInfo,
        DetailBottomBar,
        Scroll,
        GoodsList
    },
    mixins: [itemListenerMixin, backTopMixin],
    data() {
        return {
            iid: null,
            topImages: [],
            goods: {},
            shop: {},
            detailInfo: {},
            paramInfo: {},
            commentInfo: {},
            recommends: [],
            themeTopYs: [],
            getThemeTopY: null,
            currentIndex: 0
        }
    },
    created() {
        // 1.保存传入的iid
        this.iid = this.$route.params.iid

        // 2. 根据iid请求详情数据
        getDetail(this.iid).then(res => {
            // 1. 获取顶部的轮播图
            // console.log(res)
            const data = res.result
            this.topImages = data.itemInfo.topImages
            // 2.获取商品信息
            this.goods = new Goods(data.itemInfo, data.columns, data.shopInfo.services)
            // 3.创建店铺信息对象
            this.shop = new Shop(data.shopInfo)
            // 4.保存商品的详情数据
            this.detailInfo = data.detailInfo
            // 5.获取参数信息
            this.paramInfo = new GoodsParam(data.itemParams.info, data.itemParams.rule)
            // 6.取出评论信息
            if (data.rate.cRate !== 0) {
                this.commentInfo = data.rate.list[0]
            }
        })
        // 3.请求推荐数据
        getRecommend().then(res => {
            this.recommends = res.data.list
        })
        // 4.
        this.getThemeTopY = debounce(() => {
                this.themeTopYs = []
                this.themeTopYs.push(0)
                this.themeTopYs.push(this.$refs.params.$el.offsetTop - 44)
                this.themeTopYs.push(this.$refs.comment.$el.offsetTop - 44)
                this.themeTopYs.push(this.$refs.recommend.$el.offsetTop - 44)
                this.themeTopYs.push(Number.MAX_VALUE)
                // console.log(this.themeTopYs)
        }, 100)
    },
    destroyed() {
        this.$bus.$off("itemImageLoad", this.itemImgListener)
    },
    methods: {
        ...mapActions(['addCart']),  // 把方法addCart映射到这里
        imageLoad() {
            this.$refs.scroll.refresh()
            this.getThemeTopY()
        },
        titleClick(index) {
            // console.log(index)
            this.$refs.scroll.scrollTo(0, -this.themeTopYs[index], 100)
        },
        // 导航条和scroll联动
        contentScroll(position) {
            // [0, 100, 200, 300]
            const positionY = -position.y
            let length = this.themeTopYs.length
            // for(let i = 0; i < length - 1; i++) {
            //     if (this.currentIndex !== i && (positionY >= themeTopYs[i] && positionY < this.themeTopYs[i+1])) {
            //             this.currentIndex = i
            //             this.$refs.nav.currentIndex = this.currentIndex
            //     }
            // }
            for(let i = 0; i < length; i++) {
                if (this.currentIndex !== i && positionY > this.themeTopYs[i]) {
                    this.currentIndex = i
                    this.$refs.nav.currentIndex = this.currentIndex
                }
            }
            // 是否回到顶部
            this.listenShowBackTop(position)
        },
        addToCart() {
            // 1.获取购物车需要展示的信息
            const product = {}
            product.image = this.topImages[0]
            product.title = this.goods.title
            product.desc = this.goods.desc
            product.price = this.goods.realPrice
            product.iid = this.iid
            // 2.将商品添加到购物车
            // this.$store.dispatch('addCart', product)
            this.addCart(product).then(res => {
                this.$toast.show(res)
            })
        }
    }
}
</script>

<style scoped>
    #detail {
        position: relative;
        z-index: 9;
        background-color: #fff;
        height: 100vh;
    }

    .content {
        height: calc(100% - 44px - 58px);
    }

    .detail-nav {
        position: relative;
        z-index: 9;
        background-color: #fff;
    }
</style>
