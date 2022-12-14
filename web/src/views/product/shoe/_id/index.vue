<script setup lang="ts">
import { onMounted, ref, computed } from "vue"
import { useRoute } from "vue-router"
import { Icon } from "@iconify/vue"
import { Carousel, Slide, Navigation, Pagination } from "vue3-carousel"
import ViewedProducts from "@/components/common/ViewedProducts.vue"
import "vue3-carousel/dist/carousel.css"
import api from "@/api"
import noImg from "@/assets/NoImage"
import router from "@/router"
import { Modal } from "ant-design-vue"
import { useViewedProductsStore } from "@/stores/viewedProducts"
import { useLoadingStore } from "@/stores/loading"
import { useLovedProductsStore } from "@/stores/lovedProducts"
import { useCartStore } from "@/stores/cart"
defineProps<{}>()
const GENDERS = {
    0: "Nam",
    1: "Nữ",
} as Record<number, string>

const loveProducts = useLovedProductsStore()
const cart = useCartStore()
const productId = useRoute().params.id
const shoe = ref<ShoeWithProductAndChild | null>(null)
const size = ref<number>()
const quantity = ref<number>(1)
const isFetched = ref(false)

const currentSlide = ref(0)
const slideTo = (val: number) => {
    currentSlide.value = val
}

const fetchData = async () => {
    try {
        const { data } = await api.get(`/products/shoes/${productId}/`)
        shoe.value = data as ShoeWithProductAndChild
        if (shoe.value.product.images.length == 0) {
            shoe.value.product.images = [...noImg]
        }
        await new Promise((resolve) => setTimeout(resolve, 500))
        isFetched.value = true
    } catch (e) {
        console.log(e)
        router.replace("/404")
    }
}
const toggleLove = async () => {
    await loveProducts.toggleLoveProduct(Number(productId))
}

const addToCart = async () => {
    if (!size.value) {
        Modal.warning({
            title: "Vui lòng chọn size!!",
            content: "Bạn chưa chọn size cho sản phẩm này",
            centered: true,
        })
        return
    }

    if (quantity.value <= 0) {
        Modal.warning({
            title: "Vui lòng chọn số lượng",
            centered: true,
        })
        return
    }

    const item = {
        product_id: shoe.value?.product.id,
        size: size.value,
        quantity: quantity.value,
    } as CartAddingForm
    await cart.addItem(item)
}

const isLoved = computed(() => {
    return loveProducts.isLoved(Number(productId))
})

onMounted(async () => {
    await fetchData()
    if (shoe.value) {
        useViewedProductsStore().addProduct(shoe.value.product)
    }
})
</script>

<template>
    <div class="product max-w-[1200px] mx-auto">
        <div class="product__breadcrumb text-lg px-1">
            <div>
                <a-breadcrumb>
                    <a-breadcrumb-item><RouterLink :to="{ name: 'Products', query: { type: 'shoe' } }">Giày</RouterLink></a-breadcrumb-item>
                    <a-breadcrumb-item
                        ><RouterLink :to="{ name: 'Products', query: { type: 'Shoe', series: shoe?.series } }">{{ shoe?.series }}</RouterLink></a-breadcrumb-item
                    >
                    <a-breadcrumb-item>{{ shoe?.product?.name }}</a-breadcrumb-item>
                </a-breadcrumb>
            </div>
        </div>
        <div class="px-1">
            <div class="divider--solid mt-2 mb-6"></div>
        </div>

        <div class="product__detail flex-col lg:flex-row flex w-full gap-12">
            <div class="product__detail__left w-full lg:w-[640px]">
                <div v-if="!isFetched" class="skeleton flex flex-col gap-2">
                    <a-skeleton-avatar :active="true" :size="640" shape="square" />
                    <div class="flex gap-2">
                        <a-skeleton-avatar :active="true" :size="208" shape="square" />
                        <a-skeleton-avatar :active="true" :size="208" shape="square" />
                        <a-skeleton-avatar :active="true" :size="208" shape="square" />
                    </div>
                </div>

                <Carousel v-if="isFetched" id="gallery" :items-to-show="1" :wrap-around="true" v-model="currentSlide" class="p-1">
                    <Slide v-for="index in shoe?.product.images.length || 0" :key="index - 1" :index="index">
                        <div class="carousel__item w-full aspect-square p-1">
                            <img :src="shoe?.product.images[index - 1].url" alt="#" class="w-full aspect-square object-cover" />
                        </div>
                    </Slide>
                    <template #addons>
                        <Navigation />
                    </template>
                </Carousel>

                <Carousel v-if="isFetched" id="thumbnails" :wrap-around="true" :items-to-show="3" :mouse-drag="false" v-model="currentSlide" class="p-1">
                    <Slide v-for="index in shoe?.product.images.length" :key="index - 1" :index="index">
                        <div class="carousel__item" @click="slideTo(index - 1)">
                            <img :src="shoe?.product.images[index - 1].url" alt="#" class="p-1" />
                        </div>
                    </Slide>
                    <template #addons>
                        <Navigation />
                        <Pagination />
                    </template>
                </Carousel>
            </div>
            <div class="product__detail__right flex-1">
                <div class="font-black text-3xl uppercase mb-4">
                    {{ shoe?.product.name }}
                </div>
                <div class="text-base mb-4">Mã sản phẩm: {{ shoe?.product.id }}</div>
                <div class="flex gap-2 items-center">
                    <span class="text-2xl font-bold text-primary"> {{ Number((Number(shoe?.product.price) * (100 - Number(shoe?.product.discount_percent))) / 100).toLocaleString() }}₫ </span>
                    <span class="text-lg font-light text-secondary line-through">{{ Number(shoe?.product.price).toLocaleString() }}₫</span>
                </div>

                <!--  -->
                <div class="divider--dashed my-6"></div>
                <!--  -->
                <div class="lorem">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam saepe, ipsum minima deleniti iusto dicta officiis doloribus iste. Aliquam praesentium hic harum quia asperiores
                    perspiciatis omnis distinctio culpa odit. Laudantium, placeat nostrum modi omnis, necessitatibus explicabo perferendis impedit minima harum fuga rem. Possimus nemo ipsam quas magni
                    porro aliquam dignissimos maxime voluptatem, sit adipisci quia neque assumenda reiciendis vitae, dolorem laudantium accusantium eligendi quo praesentium quos nam architecto at.
                </div>
                <!--  -->
                <div class="divider--dashed my-6"></div>
                <!--  -->
                <div class="grid grid-cols-2 gap-y-4 gap-x-2 mb-4">
                    <div class="font-black text-2xl uppercase">Size</div>
                    <div class="font-black text-2xl uppercase">Số lượng</div>
                    <ASelect placeholder="Size" class="w-full" size="large" v-model:value="size">
                        <ASelectOption v-for="child in shoe?.children" :key="child.id" :value="child.size" :disabled="child.in_stock <= 0">
                            {{ child.size }}
                        </ASelectOption>
                    </ASelect>
                    <AInputNumber default-value="1" min="1" style="width: 100%" :max="shoe?.children.find((item) => item.size === size)?.in_stock" size="large" v-model:value="quantity" />
                </div>
                <!--  -->
                <div class="grid grid-row-2 grid-cols-4 gap-x-2 gap-y-2">
                    <div class="col-span-3 big-button bg-primary text-white" @click="addToCart">Thêm vào giỏ hàng</div>
                    <div class="col-span-1 big-button bg-black text-primary" @click="toggleLove">
                        <Icon icon="ph:heart-straight-fill" :color="isLoved ? '#44AF7D' : 'white'" :width="30" :height="30" />
                    </div>
                </div>
                <!--  -->
                <div class="my-8">
                    <div class="font-bold text-xl text-primary uppercase">Thông tin sản phẩm</div>
                    <ul>
                        <li>Gender: {{ GENDERS[shoe?.gender === undefined ? 2 : shoe?.gender] }}</li>
                        <li>Dòng sản phẩm: {{ shoe?.series }}</li>
                        <li>Dáng: {{ shoe?.shape ? "High Top" : "Low Top" }}</li>
                    </ul>
                    <img src="/images/size-chart.png" alt="img-size-chart" class="w-full cover" />
                </div>
            </div>
        </div>

        <div class="divider--dashed my-8"></div>
        <ViewedProducts />
    </div>
</template>

<style lang="less" scoped>
.big-button {
    @apply flex justify-center py-5 items-center font-black text-xl uppercase cursor-pointer;
}
</style>
