<template>
  <div
    ref="dateTimeRef"
    class="am-fs-dt__calendar"
    :class="props.globalClass"
  >
    <Calendar
      :id="0"
      :preselect-slot="false"
      :load-counter="loadCounter"
      :end-time="amCustomize.dateTimeStep.options.endTimeVisibility.visibility"
      :time-zone="amCustomize.dateTimeStep.options.timeZoneVisibility.visibility"
      :label-slots-selected="amLabels.date_time_slots_selected"
    ></Calendar>

    <!-- Recurring Appointment -->
    <AmSlidePopup v-if="service.recurringCycle !== 'disabled' && notLastDay" :visibility="recurringPopupVisibility">
      <div class="am-fs-dt__rec_popup">
        <p>
          {{amLabels.repeat_appointment}}
        </p>
        <p v-if="amCustomize.recurringPopup.options.content.visibility">
          {{amLabels.repeat_appointment_quest}}
        </p>
      </div>
      <template #footer>
        <AmButton
          category="secondary"
          :type="amCustomize.recurringPopup.options.secondaryButton.buttonType"
          @click="recurringStep(false)"
        >
          {{amLabels.no}}
        </AmButton>
        <AmButton
          :type="amCustomize.recurringPopup.options.primaryButton.buttonType"
          @click="recurringStep(true)"
        >
          {{amLabels.yes}}
        </AmButton>
      </template>
    </AmSlidePopup>
    <!--/ Recurring Appointment -->

    <!-- Packages Popup -->
    <PackagesPopup @continue-with-service="packagesVisibility = false"></PackagesPopup>
    <!--/ Packages Popup -->

  </div>

</template>

<script setup>
import { useStore } from "vuex";
import { ref, provide, inject, computed, onMounted, watchEffect, reactive } from "vue";
import AmButton from "../../../_components/button/AmButton.vue";
import AmSlidePopup from "../../../_components/slide-popup/AmSlidePopup.vue";
import Calendar from "../../Parts/Calendar.vue";
import { useAppointmentParams } from "../../../../assets/js/public/slots.js"
import {
  useBuildAppointment,
  useFillAppointments,
  useDuration,
  usePaymentError
} from "../../../../assets/js/common/appointments.js";
import { useCustomFields } from "../../../../assets/js/public/customFields.js";
import { useCart, useCartItem } from "../../../../assets/js/public/cart";
import PackagesPopup from "../PakagesStep/parts/PackagesPopup";
import { useCurrentUser } from "../../../../assets/js/public/user";

let props = defineProps({
  globalClass: {
    type: String,
    default: ''
  }
})

let dateTimeRef = ref(null)
provide('formWrapper', dateTimeRef)

let amCustomize = inject('amCustomize')

const store = useStore()

const amLabels = inject('amLabels')

let date = computed(() => {
  return cartItem.value && cartItem.value.index !== '' &&
    cartItem.value.services[cartItem.value.serviceId].list[cartItem.value.index].date
})

let time = computed(() => {
  return cartItem.value && cartItem.value.index !== '' &&
    cartItem.value.services[cartItem.value.serviceId].list[cartItem.value.index].time
})

let cartItem = computed(() => useCartItem(store))

let slotsParams = computed(() => {
  return useAppointmentParams(store)
})

// * Package

let stepIndex = inject('stepIndex')
let shortcodeData = inject('shortcodeData')

let packagesOptions = computed(() => store.getters['entities/filteredPackages'](
  {
    categoryId: null,
    serviceId: store.getters['booking/getServiceId'],
    providerId: null,
    locationId: null,
  }
))

let packagesVisibility = ref(packagesOptions.value.length > 0 && shortcodeData.value.show !== 'services' && stepIndex.value === 0)
provide('packagesVisibility', packagesVisibility)


/**************
 * Navigation *
 *************/

const {
  nextStep,
  footerButtonReset,
  footerBtnDisabledUpdater,
  footerButtonClicked
} = inject('changingStepsFunctions', {
  nextStep: () => {},
  footerButtonReset: () => {},
  footerBtnDisabledUpdater: () => {},
  footerButtonClicked: {
    value: false
  },
})

watchEffect(() => {
  if (footerButtonClicked.value && date.value && time.value) {
    footerButtonReset()

    usePaymentError(store, '')
    if (service.recurringCycle !== 'disabled' && notLastDay.value) {
      recurringPopupVisibility.value = true
    } else {
      useFillAppointments(store)

      nextStep()
    }
  }
})

watchEffect(() => {
  footerBtnDisabledUpdater(!date.value || !time.value)
})


/*****************
 * Calendar Data *
 ****************/

let loadCounter = ref(0)

provide('slotsParams', slotsParams)

let calendarChangeSideBar = ref(true)

provide('calendarChangeSideBar', calendarChangeSideBar)

let calendarSlotDuration = ref(0)

provide('calendarSlotDuration', calendarSlotDuration)


/*********
 * Other *
 ********/

let service = reactive({})

let recurringPopupVisibility = ref(false)

let { goToRecurringStep } = inject('goToRecurringStep', {
  goToRecurringStep: () => {}
})

let { removeRecurringStep } = inject('removeRecurringStep', {
  removeRecurringStep: () => {}
})

let notLastDay = computed(() => {
  if (cartItem.value && cartItem.value.index !== '') {
    let lastDate = store.getters['booking/getMultipleAppointmentsLastDate']
    let chosenDate = store.getters['booking/getMultipleAppointmentsDate']
    return lastDate !== chosenDate
  }
  return false
})

function recurringStep (repeat) {
  if (repeat) {
    goToRecurringStep()
  } else {
    useFillAppointments(store)
    nextStep()
  }
}

onMounted(() => {
  service = store.getters['entities/getService'](
    store.getters['booking/getServiceId']
  )

  let extrasIds = store.getters['booking/getSelectedExtras'].map(i => i.extraId)

  calendarSlotDuration.value = useDuration(service, service.extras.filter(i => extrasIds.includes(i.id)))

  if (useCart(store).length !== 0 && cartItem.value.services[cartItem.value.serviceId].list.length > 1) {
    removeRecurringStep()
  }

  let index = 0

  if (store.getters['booking/getAllMultipleAppointments'].length) {
    store.commit('booking/setMultipleAppointmentsIndex', 0)
  }

  let appointments = useBuildAppointment(
    index,
    store.getters['booking/getServiceId'],
    store.getters['booking/getEmployeeId'],
    store.getters['booking/getLocationId'],
    store.getters['booking/getAllMultipleAppointments'].length
      ? store.getters['booking/getMultipleAppointmentsDate'] : null,
    store.getters['booking/getAllMultipleAppointments'].length
      ? store.getters['booking/getMultipleAppointmentsTime'] : null,
    store.getters['booking/getAllMultipleAppointments'].length
      ? store.getters['booking/getMultipleAppointmentsRange'] : {start: null, end: null}
  )

  store.commit('booking/setMultipleIndex', index)
  store.commit('booking/setMultipleAppointments', appointments)

  useCustomFields(store)

  useCurrentUser(store, shortcodeData.value.hasApiCall)

  loadCounter.value++
})
</script>

<script>
export default {
  name: 'DateTimeStep',
  key: 'dateTimeStep',
  sidebarData: {
    label: 'date_time',
    stepSelectedData: [],
    finished: false,
    selected: false,
  }
}
</script>

<style lang="scss">
// am -- amelia
// fs -- form steps

.amelia-v2-booking #amelia-container {
  // Amelia Form Steps
  .am-fs {

    // Container Wrapper
    &__main {
      &-heading {
        &-inner {
          display: flex;
          align-items: center;

          .am-heading-prev {
            margin-right: 12px;
          }
        }
      }
      &-inner {
        &#{&}-dt {
          padding: 0 20px;
        }
      }
    }

    &-dt__rec_popup {
      margin: 16px 0 48px 0;
      & > p {
        font-size: 15px;
        line-height: 1.6;
        color: var(--am-c-main-text);

        &:first-child {
          font-weight: 500;
          margin-bottom: 7px;
        }

        &:last-child {
          font-weight: 400;
        }
      }
    }
  }
}
</style>
