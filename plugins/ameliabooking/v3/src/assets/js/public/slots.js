import moment from "moment";
import httpClient from "../../../plugins/axios";
import {useUrlParams} from "../common/helper";
import {settings} from "../../../plugins/settings";

function useLocalFromUtcSlots (slots) {
  let formattedSlots = {}

  for (let date in slots) {
    for (let time in slots[date]) {
      let dateTime = moment
        .utc(date + ' ' + time, 'YYYY-MM-DD HH:mm')
        .local()
        .format('YYYY-MM-DD HH:mm')
        .split(' ')

      if (!(dateTime[0] in formattedSlots)) {
        formattedSlots[dateTime[0]] = {}
      }

      formattedSlots[dateTime[0]][dateTime[1]] = slots[date][time]
    }
  }

  return formattedSlots
}

function useAppointmentParams (store) {
  let employeeId = store.getters['booking/getEmployeeId']

  return {
    queryTimeZone: settings.general.showClientTimeZone ? Intl.DateTimeFormat().resolvedOptions().timeZone : null,
    monthsLoad: 1,
    locationId: store.getters['booking/getLocationId'],
    serviceId: store.getters['booking/getServiceId'],
    providerIds: !employeeId ? store.getters['entities/filteredEmployees'](
      store.getters['booking/getSelection']
    ).map(item => item.id) : [employeeId],
    extras: JSON.stringify(
      store.getters['entities/getService'](
        store.getters['booking/getServiceId']
      ).extras.map(
        extra => extra.quantity ? (
          {
            id: extra.id,
            quantity: extra.quantity
          }
        ) : null
      ).filter(
        extra => extra !== null
      )
    ),
    group: 1,
    page: 'booking',
    persons: store.getters['booking/getBookingPersons']
  }
}

function useAppointmentSlots (store, params, callback, customCallback) {
  httpClient.get(
    '/slots',
    {params: useUrlParams(params)}
  ).then(response => {
    let slots = settings.general.showClientTimeZone
      ? useLocalFromUtcSlots(response.data.data.slots) : response.data.data.slots

    let loadedSlots = store.getters['booking/getMultipleAppointmentsServiceSlots']

    for (let date in slots) {
      if (!(date in loadedSlots)) {
        loadedSlots[date] = slots[date]
      } else {
        for (let time in slots[date]) {
          if (!(time in loadedSlots[date])) {
            loadedSlots[date][time] = slots[date][time]
          }
        }
      }
    }

    store.commit('booking/setMultipleAppointmentsSlots', loadedSlots)
    store.commit('booking/setMultipleAppointmentsLastDate', response.data.data.maximum)

    callback(loadedSlots, response.data.data.minimum, response.data.data.maximum, customCallback)
  })
}

export {
  useAppointmentSlots,
  useAppointmentParams,
}
