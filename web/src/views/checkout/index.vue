<script setup lang="ts">
import { useCartStore } from "@/stores/cart"
import { Icon } from "@iconify/vue"
import NavButton from "@/components/atoms/NavButton.vue"
import { Modal, SelectProps } from "ant-design-vue"
import { computed, onMounted, reactive, ref, watch } from "vue"
import router from "@/router"
import { useAreaStore } from "@/stores/area"
import { useAuthStore } from "@/stores/auth"
import { useOrderStore } from "@/stores/order"
defineProps<{}>()

if (!useAuthStore().data.user) {
    router.push("/404")
}
const cart = useCartStore()
const area = useAreaStore()
const order = useOrderStore()
const orderForm = reactive<OrderForm>({
    receiver_name: "",
    address: "",
    province_code: null,
    district_code: null,
    commune_code: null,
    phone: "",
    delivery_fee: 20000,
    products: [],
})

const provinceSelects = ref<SelectProps["options"]>([])
const districtSelects = ref<SelectProps["options"]>([])
const communeSelects = ref<SelectProps["options"]>([])

const handleSelectProvince = async () => {
    console.log("hello from handleSelectProvince")
    if (!orderForm.province_code) return
    await area.fetchDistricts(orderForm.province_code)
    const districtsList = area.districts.find((district) => district.province_code === orderForm.province_code)?.list || []
    districtSelects.value = districtsList.map((district) => ({
        label: district.name,
        value: district.code,
    }))
}
const handleSelectDistrict = async () => {
    if (!orderForm.district_code) return
    await area.fetchCommunes(orderForm.district_code)
    const communesList = area.communes.find((commune) => commune.district_code === orderForm.district_code)?.list || []
    communeSelects.value = communesList.map((commune) => ({
        label: commune.name,
        value: commune.code,
    }))
}

const deliveryFee = computed(() => {
    const cities = ["01", "48", "79", "92", "31"]
    return cities.includes(orderForm.province_code || "") ? 30000 : 50000
})

const onFinish = async () => {
    orderForm.products = cart.items.map((item) => ({
        product_id: item.id,
        price_at_order: (item.price * (100 - item.discount_percent)) / 100,
        quantity: item.pivot.quantity,
        size: item.pivot.size,
    }))
    orderForm.delivery_fee = deliveryFee.value
    console.log(orderForm)
    await order.createOrder(orderForm)
}

const onFinishFailed = () => {
    Modal.error({
        title: "?????t h??ng th???t b???i",
        content: "Vui l??ng ki???m tra l???i th??ng tin ????n h??ng",
    })
}

const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

onMounted(async () => {
    area.loadFromLocalStorage()
    await area.fetchProvinces()
    provinceSelects.value = area.provinces.map((province) => ({
        label: province.name,
        value: province.code,
    }))
})
</script>

<template>
    <AForm :model="orderForm" layout="vertical" @finish="onFinish" @finishFailed="onFinishFailed" class="checkout flex flex-col gap-8">
        <div>
            <div class="rotate-180 mb-4">
                <NavButton
                    :on-click="
                        () => {
                            $router.push({ name: 'Cart' })
                        }
                    "
                >
                    <div class="rotate-180">Quay l???i gi??? h??ng</div>
                </NavButton>
            </div>
            <div class="flex flex-col gap-2">
                <div class="title uppercase font-bold text-lg bg-[#F1F1F1] py-2 px-4">Danh s??ch s???n ph???m</div>
                <div class="checkout__product-list flex flex-col bg-[#f1f1f1] p-4">
                    <div v-if="cart.items.length === 0" class="flex flex-col items-center justify-center gap-3 p-8 mx-auto">
                        <Icon icon="ph:heart-straight-break" :width="72" :height="72" />
                        <h3 class="text-center text-xl font-bold w-36">Trong n??y ch??a c?? g?? c??? b???n ??i!</h3>
                    </div>
                    <div v-else v-for="item in cart.items" :key="item.id">
                        <CheckOutProductItem :product="item" />
                        <div class="divider--dashed my-2"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-col gap-2">
            <div class="title py-2 px-4 w-full bg-[#F1F1F1] uppercase font-bold text-lg">Th??ng tin giao h??ng</div>
            <div class="w-full p-4 bg-[#F1F1F1] flex justify-center">
                <div class="max-w-[800px] w-full lg:min-w-[512px]">
                    <AFormItem label="T??n ng?????i nh???n" name="receiver_name" :rules="[{ required: true, message: 'Xin vui l??ng ??i???n tr?????ng n??y' }]">
                        <AInput v-model:value="orderForm.receiver_name" placeholder="e.g. Nguy???n V??n A"></AInput>
                    </AFormItem>
                    <AFormItem
                        label="S??? ??i???n tho???i"
                        name="phone"
                        :rules="[
                            { required: true, message: 'Xin vui l??ng ??i???n tr?????ng n??y' },
                            {
                                pattern: /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/,
                                message: 'S??? ??i???n tho???i kh??ng h???p l???',
                            },
                        ]"
                    >
                        <AInput v-model:value="orderForm.phone" placeholder="e.g. 09123456789"></AInput>
                    </AFormItem>
                    <AFormItem label="?????a ch???" name="address" :rules="[{ required: true, message: 'Xin vui l??ng ??i???n tr?????ng n??y' }]">
                        <AInput v-model:value="orderForm.address" placeholder="e.g. 54 Nguy???n L????ng B???ng"></AInput>
                    </AFormItem>
                    <AFormItem label="T???nh/Th??nh ph???" name="province_code" :rules="[{ required: true, message: 'Xin vui ch???n tr?????ng n??y' }]">
                        <ASelect
                            v-model:value="orderForm.province_code"
                            placeholder="Ch???n t???nh/th??nh"
                            :options="provinceSelects"
                            @change="handleSelectProvince"
                            show-search
                            :filter-option="filterOption"
                        >
                        </ASelect>
                    </AFormItem>
                    <AFormItem label="Qu???n/Huy???n" name="district_code" :rules="[{ required: true, message: 'Xin vui ch???n tr?????ng n??y' }]">
                        <ASelect v-model:value="orderForm.district_code" placeholder="Ch???n qu???n/huy???n" :options="districtSelects" @change="handleSelectDistrict"> </ASelect>
                    </AFormItem>
                    <AFormItem label="Ph?????ng/X??" name="commune_code" :rules="[{ required: true, message: 'Xin vui ch???n tr?????ng n??y' }]">
                        <ASelect v-model:value="orderForm.commune_code" placeholder="Ch???n ph?????ng/x??" :options="communeSelects"> </ASelect>
                    </AFormItem>
                </div>
            </div>
        </div>

        <div>
            <div class="checkout__order-form p-4 w-full bg-[#F1F1F1]">
                <div class="order-form__title font-bold text-2xl uppercase">Gi?? tr??? ????n h??ng</div>
                <div class="divider--dashed my-4"></div>
                <div class="order-form__calc font-bold text-base text-[#666]">
                    <div class="flex justify-between">
                        <span>????n h??ng</span>
                        <span>{{ Number(cart.total).toLocaleString() }}???</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Gi???m</span>
                        <span>{{ Number(0).toLocaleString() }}???</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Ph?? giao h??ng</span>
                        <span>{{ Number(deliveryFee).toLocaleString() }}???</span>
                    </div>
                </div>
                <div class="divider--dashed my-4"></div>
                <div class="order-form__total flex justify-between uppercase font-bold text-lg">
                    <span>T???ng c???ng</span>
                    <span>{{ Number(cart.total + deliveryFee).toLocaleString() }}???</span>
                </div>
                <div class="order-form__order-button mt-6">
                    <AButton html-type="submit" block size="large" type="primary"> ?????t h??ng </AButton>
                </div>
            </div>
        </div>
    </AForm>
</template>

<style lang="less" scoped></style>
