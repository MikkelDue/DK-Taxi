<template>
  <template v-if="!amFonts.customFontSelected">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" type="text/css" :href="`${baseUrls.wpAmeliaPluginURL}v3/src/assets/scss/common/fonts/font.css`" media="all">
  </template>
  <div v-if="!empty" id="amelia-container" ref="ameliaContainer" class="am-fs__wrapper" :style="cssVars">
    <SideBar v-if="containerWidth > 560 && sidebarVisibility" class="am-fs-sb">
      <template #step-list>
        <div class="am-fs-sb__step-wrapper">
          <template v-if="stepsArray[stepIndex] !== congratulationsStep || !amSettings.general.addToCalendar || (booked && booked.data.length === 0)">
            <div
              v-for="step in sidebarSteps"
              :key="step.key"
              class="am-fs-sb__step"
            >
              <div class="am-fs-sb__step-inner">
                <p class="am-fs-sb__step-heading">
                  {{ step.label }}
                </p>
                <div
                  class="am-fs-sb__step-checker"
                  :class="{'am-fs-sb__step-checker-selected': step.selected}"
                >
                  <transition name="fade">
                    <span v-if="step.finished" class="am-icon-check"></span>
                  </transition>
                </div>
              </div>
              <TransitionGroup tag="span" name="fade" appear class="am-fs-sb__step-selection__wrapper" :class="{'am-fs-sb__step-selection-packages': step.key === packageAppointmentsStep.key && step.stepSelectedData.length > 3 }">
                <p
                  v-for="(itemSelected, index) in step.stepSelectedData" :key="itemSelected.position"
                  class="am-fs-sb__step-selection"
                >
                <span v-if="step.key !== packageAppointmentsStep.key || index < 3">
                   {{ itemSelected.value }}
                </span>
                 <span v-else>
                   {{ amLabels.plus_more }}
                 </span>
                </p>
              </TransitionGroup>
            </div>
          </template>
          <template v-else>
            <AddToCalendar></AddToCalendar>
          </template>
        </div>
      </template>
      <template v-if="amSettings.company.email" #support-info>
        <div class="am-fs-sb__support">
          <div class="am-fs-sb__support-heading">
            {{ amLabels.get_in_touch }}
          </div>
          <a class="am-fs-sb__support-email" :href="`mailto:${amSettings.company.email}`">
            {{ amSettings.company.email }}
          </a>
        </div>
      </template>
    </SideBar>
    <MainContent>
      <template v-if="stepsArray[stepIndex] !== congratulationsStep" #header>
        <MainContentHeader :sidebar-visible="sidebarVisibility"></MainContentHeader>
      </template>
      <template #step>
        <component :is="stepsArray[stepIndex]" global-class="am-fs__main-content"></component>
      </template>
      <template #footer>
        <MainContentFooter
          :second-button-show="stepsArray[stepIndex] === congratulationsStep && amSettings.roles.customerCabinet.enabled && amSettings.roles.customerCabinet.pageUrl !== null"
          :booked="booked"
          :loading="loading"
          :payment-gateway="paymentGateway"
          :customized-labels="footerLabels"
          :primary-footer-button-type="primFooterBtnType"
          :secondary-footer-button-type="secFooterBtnType"
        ></MainContentFooter>
      </template>
    </MainContent>
  </div>
  <template v-else>
    <div class="am-no-services">
      <img :src="baseUrls.wpAmeliaPluginURL+'/v3/src/assets/img/am-empty-booking.svg'" style="margin-top: 10px;">
      <h1>{{amLabels.oops}}</h1>
      <h3>{{amLabels.no_services_employees}}</h3>
      <p>{{amLabels.add_services_employees}}</p>
      <a href="https://wpamelia.com/services-and-categories/">
        {{amLabels.add_services_url}}&nbsp;
      </a>
      <span style="font-size:14px">{{amLabels.and}}&nbsp;</span>
      <a href="https://wpamelia.com/employees/">
        {{amLabels.add_employees_url}}
      </a>
    </div>
  </template>
</template>

<script setup>
// * Form construction
import MainContent from '../../common/SbsFormConstruction/MainContent/MainContent.vue'
import MainContentHeader from '../../common/SbsFormConstruction/MainContent/parts/MainContentHeader.vue'
import MainContentFooter from '../../common/SbsFormConstruction/MainContent/parts/MainContentFooter'
import SideBar from '../../common/SbsFormConstruction/SideBar/SideBar.vue'

// * Step components
import InitStep from './InitStep/InitStep.vue'
import BringingAnyone from "./BringingAnyone/BringingAnyone"
import Extras from './Extras/Extras.vue'
import PackageInfo from './PakagesStep/PackageInfoStep'
import DateTimeStep from './DateTimeStep/DateTimeStep.vue'
import PackageAppointmentsStep from './PakagesStep/PackageAppointmentsStep.vue'
import PackageAppointmentsListStep from './PakagesStep/PackageAppointmentsListStep.vue'
import InfoStep from './InfoStep/InfoStep.vue'
import Congratulations from './Congratulations/Congratulations.vue'
import AddToCalendar from './Congratulations/AddToCalendar.vue'
import PaymentStep from './PaymentStep/PaymentStep.vue'
import PackagesStep from './PakagesStep/PackageStep'
import RecurringStep from "./RecurringStep/RecurringStep";
import RecurringSummary from "./RecurringStep/RecurringSummary";

// * import from Vue
import { ref, reactive, watch, provide, inject, markRaw, computed, onBeforeMount, onMounted } from 'vue'
// * import from Vuex
import { useStore } from 'vuex'
// * import composable
import useRestore from '../../../assets/js/public/restore'
import { useBuildPackage } from '../../../assets/js/public/package.js'
import { defaultCustomizeSettings } from '../../../assets/js/common/defaultCustomize.js'
import useAction from "../../../assets/js/public/actions";
import { useColorTransparency } from "../../../assets/js/common/colorManipulation";
import {useCapacity} from "../../../assets/js/common/appointments";

// * Component reference
let ameliaContainer = ref(null)
// * Plugin wrapper width
let containerWidth = ref()
provide('containerWidth', containerWidth)

let empty = ref(false)

// * window resize listener
window.addEventListener('resize', resize);
// * resize function
function resize() {
  containerWidth.value = ameliaContainer.value.offsetWidth
}

onMounted(() => {
  document.getElementById(
    'amelia-v2-booking-' + shortcodeData.value.counter
  ).classList.add('amelia-v2-booking-' + shortcodeData.value.counter + '-loaded')

  useAction(store, {}, 'ViewContent', 'appointment', null, null)

  containerWidth.value = ameliaContainer.value.offsetWidth
})

// * Root Settings
const amSettings = inject('settings')

// * Customize
const amCustomize = amSettings.customizedData ? amSettings.customizedData.sbsNew : defaultCustomizeSettings.sbsNew
if (amCustomize) {
  provide('amCustomize', amCustomize)
}

// * Fonts
const amFonts = amSettings.customizedData ? amSettings.customizedData.fonts : defaultCustomizeSettings.fonts
provide('amFonts', amFonts)

// * Form Sidebar Visibility
let sidebarVisibility = amCustomize.sidebar ? amCustomize.sidebar.options.self.visibility : true

// * Root Urls
const baseUrls = inject('baseUrls')

// * Define store
const store = useStore()

let ready = computed(() => store.getters['entities/getReady'])

watch(ready, (current) => {
  if (current) {
    setShortcodeParams()
    empty.value = store.getters['entities/getServices'].length === 0 || store.getters['entities/getEmployees'].length === 0

    let restore = useRestore(store, shortcodeData.value)

    if (restore) {
      stepsArray.value.splice(0, stepsArray.value.length)

      sidebarSteps.value.splice(0, sidebarSteps.value.length)

      stepIndex.value = 0

      restore.steps.forEach((key) => {
        switch (key) {
          case ('initStep'):
            stepsArray.value.push(initStep)
            break

          case ('packageInfoStep'):
            stepsArray.value.push(packageInfoStep)
            break

          case ('packageAppointmentsStep'):
            stepsArray.value.push(packageAppointmentsStep)
            break

          case ('packageAppointmentsListStep'):
            stepsArray.value.push(packageAppointmentsListStep)
            break

          case ('extrasStep'):
            stepsArray.value.push(extras)
            break

          case ('dateTimeStep'):
            stepsArray.value.push(dateTimeStep)
            break

          case ('recurringStep'):
            stepsArray.value.push(recurringStep)
            break

          case ('recurringSummary'):
            stepsArray.value.push(recurringSummary)
            break

          case ('infoStep'):
            stepsArray.value.push(infoStep)
            break

          case ('paymentStep'):
            stepsArray.value.push(paymentStep)
            break

          case ('congratulations'):
            stepsArray.value.push(congratulationsStep)
            break
        }

        let sideBarItem = restore.sidebar.find(i => i.key === key)

        sidebarDataUpdate()

        if (typeof sideBarItem !== 'undefined') {
          if (sideBarItem.data) {
            sideBarItem.data.forEach((i) => {
              sidebarDataCollector({
                reference: i.reference,
                position: i.position,
                value: i.value
              })
            })
          }
        }

        stepIndex.value++
      })

      store.commit('booking/setLoading', false)

      let index = -1

      if (restore.result === 'success') {
        index = stepsArray.value.length - 1
      } else if (restore.result === 'error' || restore.result === 'canceled') {
        index = stepsArray.value.length - 2
      }

      for (let i = 0; i <= index; i++) {
        stepsArray.value[i].finished = true
      }

      for (let i = 0; i <= index - 1; i++) {
        sidebarSteps.value[i].finished = true
        sidebarSteps.value[i].selected = false
      }
      if (restore.result === 'error' || restore.result === 'canceled') {
        sidebarSteps.value[index].finished = false
        sidebarSteps.value[index].selected = true
      }

      stepIndex.value = index
    }
  }
})

const shortcodeData = inject('shortcodeData')

store.commit('entities/setPreselected', shortcodeData.value)

// * Get Entities from server
store.dispatch(
  'entities/getEntities',
  {
    types: [
      'employees',
      'categories',
      'locations',
      'packages',
      'entitiesRelations',
      'customFields',
    ],
    loadEntities: window.ameliaShortcodeData.filter(i => !i.hasApiCall).length === window.ameliaShortcodeData.length
      ? true : shortcodeData.value.hasApiCall
  }
)

// * Form Component Collection
const initStep = markRaw(InitStep)
const extras = markRaw(Extras)
const packageInfoStep = markRaw(PackageInfo)
const recurringStep = markRaw(RecurringStep)
const recurringSummary = markRaw(RecurringSummary)
const dateTimeStep = markRaw(DateTimeStep)
const packageAppointmentsStep = markRaw(PackageAppointmentsStep)
const packageAppointmentsListStep = markRaw(PackageAppointmentsListStep)
const congratulationsStep = markRaw(Congratulations)
const infoStep = markRaw(InfoStep)
const paymentStep = markRaw(PaymentStep)
const packagesStep = markRaw(PackagesStep)
const bringingAnyone = markRaw(BringingAnyone)

// * Array of step components
const stepsArray = ref(
  [
    initStep,
    dateTimeStep,
    infoStep,
    paymentStep,
    congratulationsStep
  ]
)

provide('stepsArray', stepsArray)

// * labels
const labels = inject('labels')

// * local language short code
const localLanguage = inject('localLanguage')

// * Computed labels
let amLabels = computed(() => {
  let computedLabels = reactive({...labels})

  if (amSettings.customizedData) {
    Object.keys(amSettings.customizedData.sbsNew).forEach(stepKey => {
      if (stepKey !== 'colors' && amSettings.customizedData.sbsNew[stepKey].translations) {
        let customizedLabels = amSettings.customizedData.sbsNew[stepKey].translations
        Object.keys(customizedLabels).forEach(labelKey => {
          if (customizedLabels[labelKey][localLanguage.value]) {
            computedLabels[labelKey] = customizedLabels[labelKey][localLanguage.value]
          } else if (customizedLabels[labelKey].default) {
            computedLabels[labelKey] = customizedLabels[labelKey].default
          }
        })
      }
    })
  }
  return computedLabels
})

provide('amLabels', amLabels)

let footerLabels = computed(() => {
  let customLabels = {}
  if (amSettings.customizedData) {
    let customizedLabels =  amSettings.customizedData.sbsNew[stepsArray.value[stepIndex.value].key] ?
      amSettings.customizedData.sbsNew[stepsArray.value[stepIndex.value].key].translations :
      null
    if (amSettings.customizedData && customizedLabels) {
      Object.keys(customizedLabels).forEach(labelKey => {
        if (customizedLabels[labelKey][localLanguage.value]) {
          customLabels[labelKey] = customizedLabels[labelKey][localLanguage.value]
        } else if (customizedLabels[labelKey].default) {
          customLabels[labelKey] = customizedLabels[labelKey].default
        }
      })
    }
  }

  return Object.keys(customLabels).length ? customLabels : labels
})

let primFooterBtnType = computed(() => {
  let btnType = 'filled'
  if (amSettings.customizedData && amSettings.customizedData.sbsNew[stepsArray.value[stepIndex.value].key]) {
    btnType = amSettings.customizedData.sbsNew[stepsArray.value[stepIndex.value].key].options.primaryFooterButton.buttonType
  }

  return btnType
})

let secFooterBtnType = computed(() => {
  let btnType = 'text'
  if (
    amSettings.customizedData &&
    amSettings.customizedData.sbsNew[stepsArray.value[stepIndex.value].key] &&
    amSettings.customizedData.sbsNew[stepsArray.value[stepIndex.value].key].options.secondaryFooterButton
  ) {
    btnType = amSettings.customizedData.sbsNew[stepsArray.value[stepIndex.value].key].options.secondaryFooterButton.buttonType
  }

  return btnType
})

let bringingAnyoneOptions = computed(() => {
  return useCapacity(
    store.getters['entities/getEmployeeServices'](
      store.getters['booking/getSelection']
    )
  )
})

function setShortcodeParams () {
  let preselected = store.getters['entities/getPreselected']
  if (preselected.category) {
    store.commit('booking/setCategoryId', parseInt(preselected.category))
  }
  if (preselected.service) {
    store.commit('booking/setServiceId', parseInt(preselected.service))
    let service = store.getters['entities/getService'](parseInt(preselected.service))
    store.commit('booking/setCategoryId', service ? parseInt(service.categoryId) : null)
  }
  if (preselected.employee) {
    store.commit('booking/setEmployeeId',  parseInt(preselected.employee))
  }
  if (preselected.location) {
    store.commit('booking/setLocationId', parseInt(preselected.location))
  }

  if (preselected.show === 'packages') {
    stepsArray.value.splice(0, 1, packagesStep);
    sidebarSteps.value.splice(0, 1)
    store.commit('booking/setBookableType', 'package')
    sidebarDataUpdate()
  } else {
    changeInitStepDataService()
    store.commit('booking/setBookableType', 'appointment')
    let employeeOptions = store.getters["entities/filteredEmployees"](store.getters['booking/getSelection']).length <= 1
    let employeeVisibility = !amCustomize.initStep.options.employee.visibility
    let locationOptions = store.getters['entities/filteredLocations'](store.getters['booking/getSelection']).length <= 1
    let locationVisibility = !amCustomize.initStep.options.location.visibility

    if (
      preselected.service &&
      (preselected.employee || employeeOptions || employeeVisibility) &&
      (preselected.location || locationOptions || locationVisibility)
    ) {
      if (bringingAnyoneOptions.value.availability) {
        stepsArray.value.splice(0, 1, bringingAnyone);
        sidebarSteps.value.splice(0, 1)
      } else {
        stepsArray.value.splice(0, 1)
        sidebarSteps.value.splice(0, 1)
      }
      sidebarDataUpdate()
    }
  }
}

function  checkIfAllFree () {
  let preselected = store.getters['entities/getPreselected']
  if (preselected.show === 'packages') {
    let packages = store.getters['booking/getPackageId'] ? [store.getters['entities/getPackage'](store.getters['booking/getPackageId'])] : store.getters['entities/getPackages']
    return packages.filter(p => p.price > 0).length === 0
  } else {
    if (!store.getters['booking/getPackageId']) {
      let services =  store.getters['booking/getServiceId'] ? [store.getters['entities/getService'](store.getters['booking/getServiceId'])] : store.getters['entities/getServices']
      for (let service of services) {
        let employees = store.getters['booking/getEmployeeId'] ? [store.getters['entities/getEmployee'](store.getters['booking/getEmployeeId'])] : store.getters['entities/getEmployees']
        let providers = employees.filter(eS => eS.serviceList.find(s => s.id === service.id && s.price > 0))
        if (providers.length > 0) {
          return false
        }
        let extras =  store.getters['booking/getSelectedExtras'].length ? store.getters['booking/getSelectedExtras'] : service.extras
        if (extras.filter(e => e.price > 0).length > 0) {
          return false
        }
      }
      return true
    } else {
      return store.getters['entities/getPackage'](store.getters['booking/getPackageId']).price === 0;
    }
  }
}

let removePaymentStep = computed(() => checkIfAllFree())

watch(removePaymentStep, (current) => {
  if (current) {
    stepChanger(
      stepsArray,
      ['PaymentStep'],
      []
    )
    stepChanger(
      sidebarSteps,
      ['PaymentStep'],
      []
    )
  } else {
    if (stepsArray.value.indexOf(paymentStep) === -1) {
      stepsArray.value.splice(stepsArray.value.length - 1, 0, paymentStep)
      sidebarDataUpdate()
    }
  }
})



function stepChanger (steps, stepsNamesToRemove, stepsToAdd) {
  let removeIndexes = steps.value.map(
    (item, index) => (stepsNamesToRemove.includes(item.name)) ? index : null
  ).filter(item => item !== null).reverse()

  removeIndexes.forEach((item) => {
    steps.value.splice(item, 1)
  })

  stepsToAdd.forEach((item) => {
    if (steps.value.indexOf(item) === -1) {
      steps.value.splice(stepIndex.value + 1, 0, item)
    }
  })
}

provide('goToPackageStep', {goToPackageStep})

provide('removePackageStep', {removePackageStep})

function goToPackageStep (pack) {
  store.commit('booking/setPackageId', pack.id)
  store.commit('booking/setBookableType', 'package')
  store.commit('booking/setMultipleAppointments', useBuildPackage(0, pack))
  store.commit('booking/setMultipleAppointmentsIndex', 0)

  let bookingCount = pack.bookable.reduce((partialSum, book) => partialSum + book.maximumScheduled, 0)

  let removeSteps = []
  let addSteps = []
  if (stepsArray.value[0] !== extras) {
    removeSteps.push('ExtrasStep')
  }
  if (stepsArray.value[0] !== dateTimeStep) {
    removeSteps.push('DateTimeStep')
  }
  if (bookingCount > 0) {
    addSteps = addSteps.concat([packageAppointmentsListStep, packageAppointmentsStep, packageInfoStep])
  } else {
    addSteps.push(packageInfoStep)
  }

  stepChanger(
    stepsArray,
    removeSteps,
    addSteps
  )

  stepChanger(
    sidebarSteps,
    removeSteps,
    []
  )

  sidebarDataUpdate()
  nextStep()
}

function removePackageStep () {
  let addSteps = []
  if (stepsArray.value[0] !== dateTimeStep) {
    addSteps.push(dateTimeStep)
  }
  if (stepsArray.value[0] !== extras && selectedServiceExtras.value && selectedServiceExtras.value.length) {
    addSteps.push(extras)
  }

  stepChanger(
    stepsArray,
    ['PackageInfoStep', 'PackageAppointmentsStep', 'PackageAppointmentsListStep'],
    addSteps
  )

  stepChanger(
    sidebarSteps,
    ['PackageInfoStep', 'PackageAppointmentsStep', 'PackageAppointmentsListStep'],
    []
  )

  sidebarDataUpdate()
}

provide('goToRecurringStep', {goToRecurringStep})

provide('removeRecurringStep', {removeRecurringStep})

function goToRecurringStep () {
  let startIndex = 0

  for (let i = 0; i < stepsArray.value.length; i++) {
    if (stepsArray.value[i].name === 'DateTimeStep') {
      startIndex = i

      break
    }
  }

  stepsArray.value.splice( startIndex + 1, 0, recurringStep)
  stepsArray.value.splice( startIndex + 2, 0, recurringSummary)

  sidebarDataUpdate()

  nextStep()
}

function removeRecurringStep () {
  let indexesToRemove = []

  for (let i = 0; i < stepsArray.value.length; i++) {
    if (stepsArray.value[i].name === 'RecurringStep' || stepsArray.value[i].name === 'RecurringSummary') {
      indexesToRemove.push(i)
    }
  }

  for (let i = stepsArray.value.length - 1; i >= 0; i--) {
    if (stepsArray.value[i].name === 'RecurringStep' || stepsArray.value[i].name === 'RecurringSummary') {
      indexesToRemove.includes(i)
      stepsArray.value.splice( i + 1, 1)
    }
  }

  sidebarDataUpdate()
}

provide('addPaymentsStep', {addPaymentsStep})

provide('removePaymentsStep', {removePaymentsStep})

function addPaymentsStep () {
  stepsArray.value.splice(stepsArray.value.length - 1, 0, paymentStep)

  sidebarDataUpdate()
}

function removePaymentsStep () {
  let removeSteps = ['PaymentStep']

  stepChanger(
    stepsArray,
    removeSteps,
    []
  )

  stepChanger(
    sidebarSteps,
    removeSteps,
    []
  )

  sidebarDataUpdate()
}

/**
 * Detect if Selected Service has Extras
 * @type {any}
 */
let selectedServiceExtras = computed(() => {
  let service = store.getters['entities/getService'](
    store.getters['booking/getServiceId']
  )

  return service ? service.extras : []
})

/**
 * Add or Remove steps from Steps Array
 */
function changeInitStepDataService () {
  if (selectedServiceExtras.value.length && !stepsArray.value.find(step => step.name === 'ExtrasStep')) {
    let index = stepIndex.value
    stepsArray.value.splice( index + 1, 0, extras)
    sidebarDataUpdate()
  }

  if (sidebarSteps.value.find(step => step.name === 'ExtrasStep') && !Object.keys(selectedServiceExtras.value).length) {
    stepsArray.value.splice(1, 1)
    sidebarSteps.value.splice(1, 1)
  }
}

provide('initDataChanges', {
  changeInitStepDataService
})

// * Step index
const stepIndex = ref(0)
// * StepIndex provide
provide('stepIndex', stepIndex)

// * Monitoring step index for step selection
watch(stepIndex, (currStepIndex, prevStepIndex) => {
  if (currStepIndex < sidebarSteps.value.length) {
    sidebarSteps.value[prevStepIndex].selected = false
    sidebarSteps.value[currStepIndex].selected = true
  }
  if (currStepIndex === sidebarSteps.value.length) {
    sidebarSteps.value[prevStepIndex].selected = false
  }
})

/**
 * Move to previous Form Step
 */
function previousStep () {
  footerBtnDisabledUpdater(false)
  if (!navigateInsideStep.value) {
    if (stepsArray.value[stepIndex.value].name === packageInfoStep.name) {
      stepsArray.value.splice(stepIndex.value, 1)
      sidebarSteps.value.splice(stepIndex.value, 1)
    }
    if (stepsArray.value[stepIndex.value].name === recurringStep.name) {
      stepsArray.value.splice(stepIndex.value, 2)
      sidebarSteps.value.splice(stepIndex.value, 2)
    }
    stepIndex.value = stepIndex.value - 1
  }

  headerButtonPreviousClicked.value = !headerButtonPreviousClicked.value
}

/**
 * Move to next Form Step
 */
function nextStep () {
  if (!navigateInsideStep.value) {
    sidebarSteps.value[stepIndex.value].finished = true
    stepIndex.value = stepIndex.value + 1
  }
}

// * Footer states
let loading = computed(() => store.getters['booking/getLoading'])
let booked = computed(() => store.getters['booking/getBooked'])
let paymentGateway = computed(() => store.getters['booking/getPaymentGateway'])

// * Footer btn flag
let footerButtonClicked = ref(false)
let footerBtnDisabled = ref(false)

let headerButtonPreviousClicked = ref(false)

/**
 * Footer btn clicked
 */
function footerButtonClick () {
  footerButtonClicked.value = true
}

/**
 * Footer btn reset
 */
function footerButtonReset () {
  footerButtonClicked.value = false
}


/**
 * Header btn previous clicked
 */
function headerButtonPreviousClick () {
  headerButtonPreviousClicked.value = true
}

/**
 * Header btn previous reset
 */
function headerButtonPreviousReset () {
  headerButtonPreviousClicked.value = false
}

function footerBtnDisabledUpdater (data) {
  footerBtnDisabled.value = data
}

function secondButtonClick() {
  if (booked.value) {
    if (booked.value.customerCabinetUrl) {
      window.location.href = booked.value.customerCabinetUrl
    } else {
      window.location.href = amSettings.roles.customerCabinet.pageUrl
    }
  }
}

provide('secondButton', {
  secondButtonClick
})

let navigateInsideStep = ref(false)

provide('changingStepsFunctions', {
  nextStep,
  previousStep,
  footerButtonClick,
  footerButtonReset,
  footerBtnDisabledUpdater,
  headerButtonPreviousClick,
  headerButtonPreviousReset,
  footerBtnDisabled,
  footerButtonClicked,
  headerButtonPreviousClicked,
  navigateInsideStep,
})

// * Array of Sidebar steps
const sidebarSteps = ref([])
provide('sidebarSteps', sidebarSteps)

/**
 * Collecting and rearranging selected data in form sidebar based on item position in form
 * @param data
 */
function sidebarDataCollector (data) {
  // Determines are selected data already exists
  if (sidebarSteps.value[stepIndex.value].stepSelectedData.filter(item => item.reference === data.reference).length) {
    sidebarSteps.value[stepIndex.value].stepSelectedData.forEach((item, index, array) => {
      // Handles changing value of existing data
      if ((item.reference === data.reference) && data.value && data.value !== item.value) {
        item.value = data.value
      }

      // Removes un-selected form data from sidebar array
      if ((item.reference === data.reference) && !data.value) {
        array.splice(index, 1)
      }
    })
  } else {
    if (data.value) {
      sidebarSteps.value[stepIndex.value].stepSelectedData.push(data)
    }
  }

  // Rearranges data in sidebar based on item position in the form
  sidebarSteps.value[stepIndex.value].stepSelectedData.sort((a, b) => {
    return a.position - b.position
  })
}

/**
 * Function that creates Data Array for SideBar
 */
function sidebarDataCreator () {
  stepsArray.value.forEach((item, index) => {
    if ('name' in item && item.name !== "CongratulationsStep") {
      let labelKey = item.sidebarData.label
      let step = {
        name: item.name,
        key: item.key,
        label: amLabels.value[labelKey],
        labelKey: labelKey,
        stepSelectedData: [],
        finished: false,
        selected: index === stepIndex.value,
      }
      sidebarSteps.value.splice(index, 0, step)
    }
  })
}

/**
 * Lifecycle Hooks
 */
onBeforeMount(() => {
  sidebarDataCreator()
})

/**
 * Function that update SideBar Data Array when some component are dynamically added
 */
function sidebarDataUpdate () {
  stepsArray.value.forEach((item, index) => {
    if (!Object.keys(item).includes('sidebarData')) {
      return
    }
    if (!sidebarSteps.value.find(block => block.labelKey === item.sidebarData.label)) {
      let labelKey = item.sidebarData.label
      let step = {
        name: item.name,
        key: item.key,
        label: amLabels.value[labelKey],
        labelKey: labelKey,
        stepSelectedData: [],
        finished: false,
        selected: index === stepIndex.value,
      }
      sidebarSteps.value.splice(index, 0, step)
    }
  })
}
provide('sidebarStepsFunctions', {
  sidebarDataCollector
})
// * Colors block
let amColors = computed(() => {
  return amSettings.customizedData ? amSettings.customizedData.sbsNew.colors : defaultCustomizeSettings.sbsNew.colors
})
provide('amColors', amColors);

let cssVars = computed(() => {
  return {
    '--am-c-primary': amColors.value.colorPrimary,
    '--am-c-success': amColors.value.colorSuccess,
    '--am-c-error': amColors.value.colorError,
    '--am-c-warning': amColors.value.colorWarning,
    '--am-c-main-bgr': amColors.value.colorMainBgr,
    '--am-c-main-heading-text': amColors.value.colorMainHeadingText,
    '--am-c-main-text': amColors.value.colorMainText,
    '--am-c-sb-bgr': amColors.value.colorSbBgr,
    '--am-c-sb-text': amColors.value.colorSbText,
    '--am-c-inp-bgr': amColors.value.colorInpBgr,
    '--am-c-inp-border': amColors.value.colorInpBorder,
    '--am-c-inp-text': amColors.value.colorInpText,
    '--am-c-inp-placeholder': amColors.value.colorInpPlaceHolder,
    '--am-c-drop-bgr': amColors.value.colorDropBgr,
    '--am-c-drop-text': amColors.value.colorDropText,
    '--am-c-btn-prim': amColors.value.colorBtnPrim,
    '--am-c-btn-prim-text': amColors.value.colorBtnPrimText,
    '--am-c-btn-sec': amColors.value.colorBtnSec,
    '--am-c-btn-sec-text': amColors.value.colorBtnSecText,
    '--am-c-skeleton-op20': useColorTransparency(amColors.value.colorMainText, 0.2),
    '--am-c-skeleton-op60': useColorTransparency(amColors.value.colorMainText, 0.6),
    '--am-font-family': amFonts.fontFamily,

    // css properties
    // -mw- max width
    // -brad- border-radius
    '--am-mw-main': sidebarVisibility ? '760px' : '520px',
    '--am-brad-main': sidebarVisibility ? '0 0.5rem 0.5rem 0' : '0.5rem'
  }
})

function activateCustomFontStyles () {
  let head = document.head || document.getElementsByTagName('head')[0]
  if (head.querySelector('#amCustomFont')) {
    head.querySelector('#amCustomFont').remove()
  }

  let css = `@font-face {font-family: '${amFonts.fontFamily}'; src: url(${amFonts.fontUrl});}`
  let style = document.createElement('style')
  head.appendChild(style)
  style.setAttribute('type', 'text/css')
  style.setAttribute('id', 'amCustomFont')
  style.appendChild(document.createTextNode(css))
}

if (amFonts.customFontSelected) activateCustomFontStyles()

// * Design Properties
let amDesignProperties = computed(() => {
  return {
    colorInputBorderRadius: '6px',
  }
})
provide('amDesignProperties', amDesignProperties);
</script>

<style lang="scss">
@import './src/assets/scss/public/overides/overides';
@import './src/assets/scss/common/reset/reset';
@import '../../../assets/scss/common/icon-fonts/style';
@import './src/assets/scss/common/skeleton/skeleton.scss';

:root {
  // Colors
  // shortcuts
  // -c-    color
  // -bgr-  background
  // -prim- primary
  // -sec-  secondary
  // primitive colors
  --am-c-primary: #{$blue-1000};
  --am-c-success: #{$green-1000};
  --am-c-error: #{$red-900};
  --am-c-warning: #{$yellow-1000};
  // main container colors - right part of the form
  --am-c-main-bgr: #{$am-white};
  --am-c-main-heading-text: #{$shade-800};
  --am-c-main-text: #{$shade-900};
  // sidebar container colors - left part of the form
  --am-c-sb-bgr: #17295A;
  --am-c-sb-text: #{$am-white};
  // input global colors - usage input, textarea, checkbox, radio button, select input, adv select input
  --am-c-inp-bgr: #{$am-white};
  --am-c-inp-border: #{$shade-250};
  --am-c-inp-text: #{$shade-900};
  --am-c-inp-placeholder: #{$shade-500};
  // dropdown global colors - usage select dropdown, adv select dropdown
  --am-c-drop-bgr: #{$am-white};
  --am-c-drop-text: #{$shade-1000};
  // button global colors
  --am-c-btn-prim: #{$blue-900};
  --am-c-btn-prim-text: #{$am-white};
  --am-c-btn-sec: #{$am-white};
  --am-c-btn-sec-text: #{$shade-900};

  // Properties
  // shortcuts
  // -h- height
  // -fs- font size
  // -rad- border radius
  --am-h-input: 40px;
  --am-fs-input: 15px;
  --am-rad-input: 6px;
  --am-fs-label: 15px;
  --am-fs-btn: 15px;

  // Font
  --am-font-family: 'Amelia Roboto', sans-serif;
}

// am -- amelia
// fs -- form steps
// sb -- sidebar
.amelia-v2-booking {
  background-color: transparent;

  #amelia-container {
    background-color: transparent;
    * {
      font-family: var(--am-font-family);
      font-style: initial;
      box-sizing: border-box;
    }

    &.am-fs {
      // Container Wrapper
      &__wrapper {
        display: flex;
        justify-content: center;
        max-width: var(--am-mw-main);
        width: 100%;
        height: 560px;
        margin: 100px auto;
        border-radius: 8px;
        box-shadow: 0 30px 40px rgba(0, 0, 0, 0.12);

        .el-form {
          &-item {
            display: block;
            font-family: var(--am-font-family);
            font-size: var(--am-fs-label);
            margin-bottom: 24px;

            &__label {
              flex: 0 0 auto;
              text-align: left;
              font-size: var(--am-fs-label);
              line-height: 1.3;
              color: var(--am-c-main-text);
              box-sizing: border-box;
              margin: 0;

              &:before {
                color: var(--am-c-error);
              }
            }

            &__content {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              flex: 1;
              position: relative;
              font-size: var(--am-fs-input);
              min-width: 0;
              color: var(--am-c-main-text);
            }

            &__error {
              font-size: 12px;
              color: var(--am-c-error);
              padding-top: 4px;
            }
          }
        }

        * {
          font-family: var(--am-font-family);
          box-sizing: border-box;
        }
      }
    }
  }

  .am-no-services {
    box-shadow: 0 30px 40px rgba(0, 0, 0, 0.12);
    margin: 100px auto;
    text-align: center;
    padding: 56px;
    max-width: 760px;
    height: 460px;
    width: 100%;

    p, h4, h3, h2, h1 {
      margin-bottom: 8px;
      padding: 0;
    }

    h1 {
      font-weight: bold;
    }

    a {
      font-size: 14px;
    }

    * {
      font-family: 'Amelia Roboto', sans-serif;
      box-sizing: border-box;
    }
  }
}
</style>
