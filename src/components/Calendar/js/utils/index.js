/* eslint-disable */
import * as type from './type'
import * as dateFns from 'date-fns'

import { nanoid as uuid } from 'nanoid'
export { uuid }

export const detectSupportsPassive = () => {
  let supportsPassive = false

  try {
    let opts = Object.defineProperty({}, 'passive', {
      get() {
        supportsPassive = true
      }
    })

    window.addEventListener('testPassive', null, opts)
    window.removeEventListener('testPassive', null, opts)
  } catch (e) {}

  return supportsPassive
}

export const newDate = (date, format, fallback = 'yyyy-MM-dd HH:mm') => {
  if (!date) {
    return undefined
  }

  // Clone Date
  if (type.isDate(date)) {
    return new Date(date.getTime())
  }

  // Parse Date
  let result = dateFns.parse(date, format, new Date())

  if (!type.isDate(result)) {
    result = dateFns.parse(date, fallback, new Date())
  }

  return result
}
