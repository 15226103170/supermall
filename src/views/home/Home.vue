<template>
    <div id="home">
        <nav-bar class="home-nav"><div slot="center">购物街</div></nav-bar>
        <tab-control :titles="['流行', '新款', '精选']"
                    @tabClick="tabClick"
                    ref="tabControl1"
                    class="tab-control"
                    v-show="isTabFixed"></tab-control>
        <scroll class="content"
                ref="scroll"
                :probe-type="3"
                @scroll="contentScroll"
                :pull-up-load="true"
                @pullingUp="loadMore">
            <home-swiper :banners="banners" @swiperImageLoad="swiperImageLoad"></home-swiper>
            <recommend-view :recommends="recommends"></recommend-view>
            <feature-view></feature-view>
            <tab-control :titles="['流行', '新款', '精选']"
                        @tabClick="tabClick"
                        ref="tabControl2"></tab-control>
            <goods-list :goods="showGoods"></goods-list>
        </scroll>
        <back-top @click.native="backTop" v-show="isShowBackTop"></back-top>
    </div>
</template>

<script>
import HomeSwiper from './childComps/HomeSwiper'
import RecommendView from './childComps/RecommendView'
import FeatureView from './childComps/FeatureView'

import NavBar from 'components/common/navbar/NavBar'
import TabControl from 'components/content/tabControl/TabControl'
import GoodsList from 'components/content/goods/GoodsList'
import Scroll from 'components/common/scroll/Scroll'

import { getHomeMultidata, getHomeGoods } from 'network/home'
import { debounce } from 'common/utils'
import { itemListenerMixin, backTopMixin } from 'common/mixin'


    export default {
        name: 'Home',
        components: {
            HomeSwiper,
            RecommendView,
            FeatureView,
            NavBar,
            TabControl,
            GoodsList,
            Scroll
        },
        mixins: [itemListenerMixin, backTopMixin],
        data() {
            return {
                banners: [],
                recommends: [],
                goods: {
                    'pop': {page: 0, list: []},
                    'new': {page: 0, list: []},
                    'sell': {page: 0, list: []}
                },
                currentType: 'pop',
                tabOffsetTop: 0,
                isTabFixed: false,
                saveY: 0
            }
        },
        computed: {
            showGoods() {
                return this.goods[this.currentType].list
            }
        },
        activated() {
            this.$refs.scroll.scrollTo(0, this.saveY)
            this.$refs.scroll.refresh()
        },
        deactivated() {
            this.saveY = this.$refs.scroll.getScrollY()
            // 2.
            this.$bus.$off('itemImgLoad', this.itemImgListener)
        },
        created() {
        // 1.请求多个数据
            this.getHomeMultidata()
        // 2.请求商品数据
            this.getHomeGoods('pop')
            this.getHomeGoods('new')
            this.getHomeGoods('sell')
        },
        // 改用mixin技术实现
        // mounted() {
        //     // 1.防止频繁刷新
        //     const refresh = debounce(this.$refs.scroll.refresh, 200)
        //     // 监听item中图片加载完成
        //     this.$bus.$on('itemImageLoad', () => {
        //         refresh()
        //     })
        //     // 2.获取tabControl的offsetTop
        //     this.$on('swiperImageLoad')
        // },
        methods: {
            // 事件监听
            tabClick(index) {
                switch (index){
                    case 0:
                        this.currentType = 'pop'
                        break
                    case 1:
                        this.currentType = 'new'
                        break
                    case 2:
                        this.currentType = 'sell'
                        break
                }
                if (this.$refs.tabControl1 !== undefined) {
                    this.$refs.tabControl1.currentIndex = index
                    this.$refs.tabControl2.currentIndex = index
                }
            },
            contentScroll(position) {
                // 1.判断BackTop是否显示
                this.listenShowBackTop(position)
                // 2.决定tabControl是否吸顶（position：fixed）
                this.isTabFixed = (-position.y) > this.tabOffsetTop
                // console.log(this.isTabFixed)
            },
            loadMore() {
                this.getHomeGoods(this.currentType)
            },
            swiperImageLoad() {
                // console.log(this.$refs.tabControl2.$el.offsetTop)
                this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop
            },
            // 网络请求
            getHomeMultidata() {
                getHomeMultidata().then(res => {
                    this.banners = res.data.banner.list
                    this.recommends = res.data.recommend.list
                })
            },
            getHomeGoods(type) {
                const page = this.goods[type].page + 1
                getHomeGoods(type, page).then(res => {
                    this.goods[type].list.push(...res.data.list)
                    this.goods[type].page += 1
                    this.$refs.scroll.finishPullUp()
                })
            }
        }
    }
</script>

<style scoped>
    #home {
        padding-top: 44px;
        height: 100vh;
        position: relative;
    }

    .home-nav {
        background: var(--color-tint);
        color: #fff;

        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        z-index: 9;
    }

    .content {
        overflow: hidden;
        position: absolute;
        top: 44px;
        bottom: 49px;
        left: 0;
        right: 0;
    }

    .tab-control {
        position: relative;
        z-index: 9;
    }

    /* .content {
        height: calc(100% - 93px);
        overflow: hidden;
        margin-top: 44px;
    } */
</style>
