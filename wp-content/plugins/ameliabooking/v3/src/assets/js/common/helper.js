import { settings } from "../../../plugins/settings.js"

function useRemoveUrlParameter (url, parameter) {
  let urlParts = url.split('?')

  if (urlParts.length >= 2) {
    let prefix = encodeURIComponent(parameter) + '='
    let pars = urlParts[1].split(/[&;]/g)

    for (let i = pars.length; i-- > 0;) {
      if (pars[i].lastIndexOf(prefix, 0) !== -1) {
        pars.splice(i, 1)
      }
    }

    url = urlParts[0] + (pars.length > 0 ? '?' + pars.join('&') : '')
  }

  return url
}

function useUrlParams (params) {
  if (!settings.activation.disableUrlParams) {
    return params
  }

  let names = ['categories', 'services', 'packages', 'employees', 'providers', 'providerIds', 'extras', 'locations', 'events', 'types', 'dates']

  let convertedParams = JSON.parse(JSON.stringify(params))

  names.forEach((name) => {
    if (name === 'extras' && name in convertedParams && convertedParams['extras']) {
      convertedParams['extras'] = JSON.parse(convertedParams['extras'])

      let extras = []

      convertedParams['extras'].forEach((item) => {
        extras.push(item.id + '-' + item.quantity)
      })

      convertedParams['extras'] = extras.length ? extras : null
    }

    if (name in convertedParams && Array.isArray(convertedParams[name]) && convertedParams[name].length) {
      convertedParams[name] = convertedParams[name].join(',')
    }
  })

  return convertedParams
}

function useSortedDateStrings (dates) {
  return dates.sort((a,b) =>  new Date(a) - new Date(b))
}

export {
  useRemoveUrlParameter,
  useSortedDateStrings,
  useUrlParams,
}
