import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            component: () => import("@/views/home/index.vue"),
            meta: {
                title: "Home",
                layout: "admin",
            },
        },
        {
            path: "/login",
            component: () => import("@/views/login/index.vue"),
            meta: {
                title: "Đăng nhập",
                layout: "auth",
            },
        },
        {
            name: "Register",
            path: "/register",
            component: () => import("@/views/register/index.vue"),
            meta: {
                title: "Đăng ký",
                layout: "auth",
            },
        },
        {
            path: "/about",
            component: () => import("@/views/about/index.vue"),
        },
        {
            path: "/products",
            component: () => import("@/views/products/index.vue"),
        },
        {
            path: "/products/:id",
            component: () => import("@/views/products/_id/index.vue"),
        },
        {
            name: "404",
            path: "/:pathMatch(.*)*",
            component: () => import("@/views/404/index.vue"),
            meta: {
                title: "404",
                layout: "empty",
            }
        }
    ],
})

const DEFAULT_TITLE = "Pomme Shop"
router.afterEach((to, from) => {
    // Use next tick to handle router history correctly
    // see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
    document.title = to.meta.title ? "Pomme | " + to.meta.title : DEFAULT_TITLE
})

export default router
