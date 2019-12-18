import Vue from 'vue'
import VueRouter from 'vue-router'

// 懒加载
const Home = () => import ('views/home/Home')
const Category = () => import ('views/category/Category')
const Cart = () => import ('views/cart/Cart')
const Profile = () => import ('views/profile/Profile')
const Detail = () => import ('views/detail/Detail')

// 1.通过 Vue.use(插件),安装插件
Vue.use(VueRouter)

// 2.创建Router对象
const router = new VueRouter({
    routes: [
        {
            path: '',
            redirect: '/home'
        },
        {
            path: '/home',
            component: Home
        },
        {
            path: '/category',
            component: Category
        },
        {
            path: '/cart',
            component: Cart
        },
        {
            path: '/profile',
            component: Profile
        },
        {
            path: '/detail/:iid',
            component: Detail
        }
    ],
    mode: 'history'
})

export default router
