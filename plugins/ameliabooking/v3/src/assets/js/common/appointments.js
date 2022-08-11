import {useFormattedPrice} from "./formatting";
import {useTimeInSeconds} from "./date";
import {useCartItem} from "../public/cart";
import {useSortedDateStrings} from "./helper";
import {settings} from "../../../plugins/settings";

function useCapacity (employeeServices) {
  let options = {
    availability: false,
    min: 0,
    max: 0
  }

  let serviceMinCapacity = 0

  if (employeeServices.length && employeeServices.length > 1) {
    employeeServices.forEach(service => {
      serviceMinCapacity = service.minCapacity

      options.availability = service.bringingAnyone && service.maxCapacity > 1

      if (service.maxCapacity > options.max || options.max === 0) {
        options.max = service.maxCapacity
      }

      if (options.min < service.minCapacity) {
        options.min = settings.appointments.allowBookingIfNotMin ? 1 : service.minCapacity
      }
    })

  } else if (employeeServices.length && employeeServices.length === 1) {
    let service = employeeServices[0]

    serviceMinCapacity = service.minCapacity

    options.availability = service.bringingAnyone && service.maxCapacity > 1
    options.min = settings.appointments.allowBookingIfNotMin ? 1 : service.minCapacity
    options.max = service.maxCapacity
  }

  if (settings.appointments.openedBookingAfterMin) {
    options.min = serviceMinCapacity
  }

  options.max = options.max > 1 ? (options.max - 1) : options.max
  options.min = options.min > 0 ? (options.min - 1) : options.min

  return options
}

function usePaymentError (store, message) {
  store.commit('booking/setError', message)
}

function usePrepaidPrice (store, entity, type) {
  switch (type) {
    case 'appointment':
      let appointments = useAppointmentsPayments(
        store,
        entity.id,
        useCartItem(store).services[entity.id].list
      )

      return useAppointmentsTotalAmount(store, entity, appointments.prepaid)
    case 'package':
      return entity.price
  }
}

function useDuration (service, extras) {
  let duration = service.duration

  extras.forEach((extra) => {
    duration += (extra.duration * extra.quantity)
  })

  return duration
}

function useBuildAppointment (
  index,
  serviceId,
  providerId,
  locationId,
  date = null,
  time = null,
  range = {start: null, end: null}
) {
  let items = [
    {
      packageId: null,
      serviceId: serviceId,
      index: 0,
      services: {},
    }
  ]

  items[index].services[serviceId] = {
    fetched: false,
    slots: [],
    providerId: providerId,
    locationId: locationId,
    list: [
      {
        providerId: providerId,
        locationId: locationId,
        date: date,
        time: time,
        range: range,
      }
    ],
  }

  return items
}

function useCalendarEvents (slots) {
  let calendarSlotsValues = []

  useSortedDateStrings(Object.keys(slots)).forEach((date) => {
    calendarSlotsValues.push({
      title  : 'e',
      start  : date,
      display: 'background',
      extendedProps: {
        slotsTotal: 100,
        slotsAvailable: 1,
        slots: slots[date]
      }
    })
  })

  return calendarSlotsValues
}

function useServices (store) {
  let type = store.getters['booking/getBookableType']

  let services = null

  switch (type) {
    case ('appointment'):
      services = store.getters['entities/getServices']

      break

    case ('package'):
      let packages = store.getters['entities/getPackages']

      let packagesServices = {}

      packages.forEach((pack) => {
        pack.bookable.forEach((book) => {
          packagesServices[book.service.id] = book.service
        })
      })

      services = Object.values(packagesServices)

      break
  }

  return services
}

function useAvailableSlots (store) {
  let cart = store.getters['booking/getAllMultipleAppointments']

  let cartIndex = store.getters['booking/getMultipleAppointmentsIndex']

  let activeAppointment = cart[cartIndex].services[cart[cartIndex].serviceId].list[cart[cartIndex].index]

  let services = useServices(store)

  if (activeAppointment.date) {
    let selectedSlots = []

    cart.forEach((cartItem) => {
      for (let serviceId in cartItem.services) {
        let service = services.find(i => i.id === parseInt(serviceId))

        cartItem.services[serviceId].list.forEach((i, index) => {
          if (i.date &&
            i.date === activeAppointment.date &&
            i.time &&
            (cart[cartIndex].serviceId === parseInt(serviceId) ? parseInt(cart[cartIndex].index) !== index : true)
          ) {
            selectedSlots.push({
              time: i.time,
              duration: service.duration,
              timeAfter: service.timeAfter,
              timeBefore: service.timeBefore
            })
          }
        })
      }
    })

    let service = services.find(i => i.id === cart[cartIndex].serviceId)

    let defaultSlots = Object.keys(cart[cartIndex].services[cart[cartIndex].serviceId].slots[activeAppointment.date])

    let availableSlots = {}

    for (let i = 0; i < defaultSlots.length; i++) {
      let defaultSlotSeconds = useTimeInSeconds(defaultSlots[i])

      let isFreeSlot = true

      for (let j = 0; j < selectedSlots.length; j++) {
        let slotInSeconds = useTimeInSeconds(selectedSlots[j].time)

        if (defaultSlotSeconds > (slotInSeconds - service.duration - service.timeAfter) &&
          defaultSlotSeconds < (slotInSeconds + selectedSlots[j].duration + selectedSlots[j].timeBefore + service.timeAfter)
        ) {
          isFreeSlot = false

          break
        }
      }

      if (isFreeSlot) {
        availableSlots[defaultSlots[i]] = useTimeInSeconds(defaultSlots[i])
      }
    }

    return useSortedDateStrings(Object.keys(availableSlots))
  }

  return activeAppointment.slots
}

function useFillAppointments (store) {
  let cartItem = useCartItem(store)

  let activeItemServices = cartItem.services

  for (let serviceId in activeItemServices) {
    if (activeItemServices[serviceId].list.length && activeItemServices[serviceId].list.filter(i => i.date && i.time).length) {
      let employeesIds = {}
      let locationsIds = {}

      for (let i = 0; i < activeItemServices[serviceId].list.length; i++) {
        if (activeItemServices[serviceId].list[i].date && activeItemServices[serviceId].list[i].time) {
          activeItemServices[serviceId].slots[activeItemServices[serviceId].list[i].date][activeItemServices[serviceId].list[i].time].forEach(function (slotData) {
            if (!(slotData[0] in employeesIds)) {
              employeesIds[slotData[0]] = 1
            } else {
              employeesIds[slotData[0]]++
            }

            if (!(slotData[1] in locationsIds)) {
              locationsIds[slotData[1]] = 1
            } else {
              locationsIds[slotData[1]]++
            }
          })
        }
      }

      let mostFrequentEmployeeId = getEntityIdWithMaxSlotCount(employeesIds)
      let mostFrequentLocationId = getEntityIdWithMaxSlotCount(locationsIds)

      let maxAppointments = employeesIds[mostFrequentEmployeeId]

      let equallyFrequentEmployeesIds = {}

      equallyFrequentEmployeesIds[mostFrequentEmployeeId] = true

      for (let id in employeesIds) {
        if (employeesIds[id] === maxAppointments) {
          equallyFrequentEmployeesIds[id] = true
        }
      }

      equallyFrequentEmployeesIds = Object.keys(equallyFrequentEmployeesIds)

      let randomlyMostFrequentEmployeeIdIndex = Math.floor(Math.random() * (equallyFrequentEmployeesIds.length) + 1)

      mostFrequentEmployeeId = equallyFrequentEmployeesIds[randomlyMostFrequentEmployeeIdIndex - 1]

      let isSingleLocation = Object.keys(locationsIds).length === 1

      for (let i = 0; i < activeItemServices[serviceId].list.length; i++) {
        if (activeItemServices[serviceId].list[i].date && activeItemServices[serviceId].list[i].time) {
          let slotsEntitiesData = activeItemServices[serviceId].slots[activeItemServices[serviceId].list[i].date][activeItemServices[serviceId].list[i].time]

          if (isSingleLocation) {
            let slotEmployeesIds = slotsEntitiesData.map(slotData => slotData[0])

            let slotEntitiesIndex = slotEmployeesIds.indexOf(mostFrequentEmployeeId)

            if (slotEntitiesIndex !== -1) {
              activeItemServices[serviceId].list[i].providerId = slotsEntitiesData[slotEntitiesIndex][0]
              activeItemServices[serviceId].list[i].locationId = slotsEntitiesData[slotEntitiesIndex][1]
            } else {
              let randomlySelectedEmployeeIndex = Math.floor(Math.random() * (slotEmployeesIds.length) + 1)

              activeItemServices[serviceId].list[i].providerId = slotsEntitiesData[randomlySelectedEmployeeIndex - 1][0]
              activeItemServices[serviceId].list[i].locationId = slotsEntitiesData[randomlySelectedEmployeeIndex - 1][1]
            }
          } else {
            let slotLocationsIds = slotsEntitiesData.map(slotData => slotData[1])

            let slotEntitiesIndex = slotLocationsIds.indexOf(mostFrequentLocationId)

            if (slotEntitiesIndex !== -1) {
              activeItemServices[serviceId].list[i].providerId = slotsEntitiesData[slotEntitiesIndex][0]
              activeItemServices[serviceId].list[i].locationId = slotsEntitiesData[slotEntitiesIndex][1]
            } else {
              let randomlySelectedLocationIndex = Math.floor(Math.random() * (slotLocationsIds.length) + 1)

              activeItemServices[serviceId].list[i].providerId = slotsEntitiesData[randomlySelectedLocationIndex - 1][0]
              activeItemServices[serviceId].list[i].locationId = slotLocationsIds[randomlySelectedLocationIndex - 1]
            }
          }
        }
      }
    }
  }
}

function getEntityIdWithMaxSlotCount (entitiesIds) {
  let maxSlotsCount = Math.max.apply(Math, Object.entries(entitiesIds).map(function (o) { return o[1] }))

  return parseInt(Object.entries(entitiesIds).find(function (o) { return o[1] === maxSlotsCount })[0])
}

function getAppointmentServiceAmount (store, serviceId, appointment) {
  let employeeService = store.getters['entities/getEmployeeService'](appointment.providerId, serviceId)

  return employeeService.price * (employeeService.aggregatedPrice ? store.getters['booking/getBookingPersons'] : 1)
}

function useAppointmentsAmount (store, service, appointments) {
  let amount = 0

  appointments.forEach((appointment) => {
    amount += getAppointmentServiceAmount(store, service.id, appointment)
  })

  return amount
}

function useAppointmentExtraAmount (service, selectedExtra, persons) {
  let extra = service.extras.find(item => item.id === parseInt(selectedExtra.extraId))

  if (extra) {
    let extraAggregatedPrice = extra.aggregatedPrice === null ? service.aggregatedPrice : extra.aggregatedPrice

    return extra.price * selectedExtra.quantity * (extraAggregatedPrice ? persons : 1)
  }

  return 0
}

function useAppointmentExtrasAmount (store, service, appointments) {
  let amount = 0

  let persons = store.getters['booking/getBookingPersons']

  let selectedExtras = store.getters['booking/getSelectedExtras']

  selectedExtras = selectedExtras ? selectedExtras : []

  selectedExtras.forEach((selectedExtra) => {
    appointments.forEach((appointment) => {
      amount += useAppointmentExtraAmount(service, selectedExtra, persons)
    })
  })

  return amount
}

function useAppointmentsTotalAmount (store, service, appointments) {
  return useAppointmentsAmount(store, service, appointments) + useAppointmentExtrasAmount(store, service, appointments)
}

function useAppointmentDepositAmount (store, service, totalAmount) {
  let depositAmount = 0

  if (service.depositPayment !== 'disabled') {
    switch (service.depositPayment) {
      case ('fixed'):
        depositAmount = (service.depositPerPerson && service.aggregatedPrice ? store.getters['booking/getBookingPersons'] : 1) * service.deposit

        break

      case 'percentage':
        depositAmount = totalAmount / 100 * service.deposit

        break
    }
  }

  return totalAmount > depositAmount ? depositAmount : 0
}

function useDiscountAmount (store, coupon, appointments) {
  let persons = store.getters['booking/getBookingPersons']

  let selectedExtras = store.getters['booking/getSelectedExtras']

  let service = store.getters['entities/getService'](
    store.getters['booking/getServiceId']
  )

  let discountAmount = 0

  appointments.forEach((appointment) => {
    let amount = getAppointmentServiceAmount(store, service.id, appointment)

    selectedExtras.forEach((selectedExtra) => {
      amount += useAppointmentExtraAmount(service, selectedExtra, persons)
    })

    discountAmount += amount / 100 * coupon.discount + coupon.deduction
  })

  return discountAmount
}

function useAppointmentsPayments (store, serviceId, appointments) {
  let service = store.getters['entities/getService'](
    serviceId
  )

  let prepaidCount = 1

  if (service.recurringPayment) {
    prepaidCount = service.recurringPayment > appointments.length
      ? appointments.length : service.recurringPayment
  }

  return {
    prepaid: appointments.slice(0, prepaidCount),
    postpaid: appointments.slice(prepaidCount),
  }
}

function useServicePrices (store, serviceId, appointments) {
  let data = {}

  appointments.map(i => i.providerId).forEach((providerId) => {
    let service = store.getters['entities/getEmployeeService'](
      providerId,
      serviceId
    )

    if (!(service.price in data)) {
      data[service.price] = 0
    }

    data[service.price]++
  })

  return data
}

function useAppointmentsLabels (store, serviceId, appointments) {
  let data = useServicePrices(store, serviceId, appointments)

  let persons = store.getters['booking/getBookingPersons']

  let labels = []

  for (let price in data) {
    let count = data[price]

    labels.push(
      count + ' ' + (count > 1 ? 'recurrences' : 'recurrence')
      + ' x ' + persons + ' ' + (persons > 1 ? 'persons' : 'person')
      + ' x ' + useFormattedPrice(price)
    )
  }

  return labels
}

function useExtrasLabels (store, service, appointments) {
  let labels = []

  let selectedExtras = store.getters['booking/getSelectedExtras']

  let persons = store.getters['booking/getBookingPersons']

  selectedExtras.forEach((selectedExtra) => {
    let count = appointments.length

    let extra = service.extras.find(i => i.id === parseInt(selectedExtra.extraId))

    if (extra) {
      labels.push(
          {
            name: extra.name,
            value: count + ' ' + (count > 1 ? 'appointments' : 'appointment')
                + ' x ' + selectedExtra.quantity + ' x '
                + (persons + ' ' + (persons > 1 ? 'persons' : 'person'))
                + ' x ' + useFormattedPrice(extra.price)
          }
      )
    }

  })

  return labels
}

export {
  useCapacity,
  useBuildAppointment,
  useAvailableSlots,
  useFillAppointments,
  useCalendarEvents,
  useAppointmentsPayments,
  useAppointmentsLabels,
  useServicePrices,
  useExtrasLabels,
  useAppointmentExtrasAmount,
  useAppointmentExtraAmount,
  useAppointmentsAmount,
  useDiscountAmount,
  useAppointmentDepositAmount,
  useAppointmentsTotalAmount,
  useDuration,
  usePrepaidPrice,
  usePaymentError,
  useServices,
}
