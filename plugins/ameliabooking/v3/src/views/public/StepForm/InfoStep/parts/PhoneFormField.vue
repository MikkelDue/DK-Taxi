<template>
  <!-- Phone Number -->
  <el-form-item
    v-if="amCustomize.infoStep.options.phone.visibility"
    ref="primeFieldRef"
    class="am-fs__info-form__item"
    prop="phone"
    label-position="top"
    style="z-index: 10"
  >
    <template #label>
      <span class="am-fs__info-form__label">
        {{ amLabels.phone_colon }}
      </span>
    </template>
    <AmInputPhone
      v-model="infoFormData.phone"
      :placeholder="amLabels.enter_phone"
      :default-code="settings.general.phoneDefaultCountryCode === 'auto' ? '' : settings.general.phoneDefaultCountryCode.toLowerCase()"
      name="phone"
      @country-phone-iso-updated="countryPhoneIsoUpdated"
    />
  </el-form-item>
  <!-- /Phone Number -->
</template>

<script setup>
import AmInputPhone from '../../../../_components/input-phone/AmInputPhone.vue'
import {settings} from "../../../../../plugins/settings";

import { inject, ref } from "vue";
import {useStore} from "vuex";

let store = useStore()

defineEmits([
  'countryPhoneIsoUpdated',
])

let primeFieldRef = ref(null)

// * Labels
let amLabels = inject('amLabels')

// * Customize
let amCustomize = inject('amCustomize')

// * Form field data
let infoFormData = inject('infoFormData')

function countryPhoneIsoUpdated (val) {
  store.commit('booking/setCustomerCountryPhoneIso', val ? val.toLowerCase() : '')
}

defineExpose({
  primeFieldRef
})
</script>

<script>
export default {
  name: "PhoneFormField"
}
</script>
