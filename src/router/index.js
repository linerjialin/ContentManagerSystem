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
    path: '/404',
    name: '404',
    component: ()=>import("../views/404.vue")
  },
  {
    path: '/register',
    name: 'Register',
    component: ()=>import("../views/Register.vue")
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

//提供一个重置路由的方法
export const resetRouter = () => {
  router.matcher = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
  })
}

//注意刷新页面会重置路由
export const setRoutes = () =>{
  const storeMenus = localStorage.getItem("menus")
  //判断是否有菜单
  if (storeMenus){

    //获取当前的路由数组
    const currentRoutes = router.getRoutes().map(v => v.name)
    if (!currentRoutes.includes('Manager')){
      //拼装动态路由
      const manageRoute = { path:'/',name:'Manager', component: ()=>import("../views/Manager.vue"),redirect:'/home' ,children:[
          { path:'person',name:'个人信息', component: ()=>import("../views/Person.vue")}
        ]}
      const menus =JSON.parse(storeMenus)
      menus.forEach(item =>{
        if (item.path){ //当且仅当 path不为空的时候才设置路由
          let itemMenu = { path:item.path.replace("/",""),name:item.name, component: ()=>import("../views/"+item.pagePath+".vue")}
          manageRoute.children.push(itemMenu)
        }else if (item.children.length){
          item.children.forEach(item => {
            if (item.path){
              let itemMenu = {path: item.path.replace("/", ""), name: item.name, component: () => import("../views/" + item.pagePath + ".vue")}
              manageRoute.children.push(itemMenu)
            }
          })
        }
      })
      //动态添加到现有的路由对象中
      router.addRoute(manageRoute)
    }

  }
}

//防止刷新路由就再次调用
setRoutes()


// 路由守卫
router.beforeEach((to, from, next) => {
  localStorage.setItem("currentPathName", to.name)  // 设置当前的路由名称，为了在Header组件中去使用
  store.commit("setPath")  // 触发store的数据更新

  if (!to.matched.length){ //未找到路由路径
    const storeMenus =  localStorage.getItem("menus") //判断路径有无菜单
    if(storeMenus){
      next("/404")  //直接跳到404
    }else {
      next('/login')  //跳转到登录页面
    }
  }
  next()



})

export default router
