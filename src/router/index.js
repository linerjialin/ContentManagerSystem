import Vue from 'vue'
import VueRouter from 'vue-router'
import store from "@/store";

Vue.use(VueRouter)

const routes = [

  {
    path: '/login',
    name: 'Login',
    component: ()=>import("../views/Login.vue")
  },
  {
    path: '/register',
    name: 'Register',
    component: ()=>import("../views/Register.vue")
  },
  {
    path: '/404',
    name: '404',
    component: ()=>import("../views/404.vue")
  },
]




const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

//重置路由
export const resetRouter = () => {
  router.matcher = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
  })
}


//返回出来  export  在登录时使用
//注意刷新页面会导致页面路由重置
export const setRoutes = () => {
  //取出 menus 集合
  const storeMenus = localStorage.getItem("menus")
  //判断  有则拼装动态路由
  if (storeMenus){
    // mangeRoute 框架是固定的
    const mangeRoute = {path: '/', name:'Manage', component: () => import( '../views/Manager.vue'), redirect:"/home", children:[
        //在初始化路由的时候加入
        {path:'person',name:'个人信息',component: ()=> import('../views/Person.vue')}
      ]}

    // children 是动态的
    const menus  = JSON.parse(storeMenus)
    menus.forEach(item =>{
      if (item.path){  //当且仅当 path 不为空则拼接 动态路由
        let itemMenu = {path: item.path.replace("/",""), name: item.name, component: () => import( '../views/'+ item.pagePath+'.vue')}
        mangeRoute.children.push(itemMenu)
      }else if(item.children.length){
        item.children.forEach(item =>{
          if (item.path){
            let itemMenu = {path: item.path.replace("/",""), name: item.name, component: () => import( '../views/'+ item.pagePath+'.vue')}
            mangeRoute.children.push(itemMenu)
          }
        })
      }
    })
    //获取当前的路由对象名称数组
    const currentRouteNames = router.getRoutes().map(v => v.name)
    if (!currentRouteNames.includes('Manage')){
      //动态添加到当前的路由对象中
      router.addRoute(mangeRoute)
    }
  }
}
//路由重置 就再次调用一次路由
setRoutes ()

// 路由守卫
router.beforeEach((to, from, next) => {
  localStorage.setItem("currentPathName", to.name)  // 设置当前的路由名称，为了在Header组件中去使用
  store.commit("setPath")  // 触发store的数据更新

  //未找到路由的情况
  if (!to.matched.length){
    const storeMenus = localStorage.getItem("menus")
    //判断用户是否第一次登录
    if (storeMenus){  //如果存在则说明用户登录过，可以放行，负责跳转登录界面
      next("/404")  // 放行路由
    }else {
      next("/login")
    }
  }
  //其余情况直接放行
  next()




})

export default router
