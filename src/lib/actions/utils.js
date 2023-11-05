import { tick } from 'svelte'
import { writable } from 'svelte/store'

export const portal = (el, target = 'body') => {
  let targetEl
  async function update(newTarget) {
    target = newTarget
    if (typeof target === 'string') {
      targetEl = document.querySelector(target)
      if (targetEl === null) {
        await tick()
        targetEl = document.querySelector(target)
      }
      if (targetEl === null) {
        throw new Error(`No element found matching css selector: "${target}"`)
      }
    } else if (target instanceof HTMLElement) {
      targetEl = target
    } else {
      throw new TypeError(
        `Unknown portal target type: ${
          target === null ? 'null' : typeof target
        }. Allowed types: string (CSS selector) or HTMLElement.`
      )
    }
    targetEl.appendChild(el)
    el.hidden = false
  }

  function destroy() {
    if (el.parentNode) {
      el.parentNode.removeChild(el)
    }
  }

  update(target)
  return {
    update,
    destroy
  }
}

export const invertedScroll = (node, active) => {
  const handleWheel = (event) => {
    if (active && event.deltaY) {
      event.preventDefault()
      event.currentTarget.scrollTop -=
        parseFloat(
          getComputedStyle(event.currentTarget).getPropertyValue('font-size')
        ) *
        (event.deltaY < 0 ? -1 : 1) *
        2
    }
  }

  node.addEventListener('wheel', handleWheel, true)
  return {
    update(newActive) {
      active = newActive
    },
    destroy() {
      node.removeEventListener('wheel', handleWheel, true)
    }
  }
}

export const clickOutside = (node) => {
  const handleClick = (event) => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      node.dispatchEvent(new CustomEvent('click_outside', node))
    }
  }

  document.addEventListener('click', handleClick, true)
  return {
    destroy() {
      document.removeEventListener('click', handleClick, true)
    }
  }
}

export const createSelector = (multiple = false) => {
  let selectable = 0

  const { subscribe, update } = writable({})

  const addSelectable = (selected = false) => {
    update(($selector) => ({
      ...$selector,
      [++selectable]: selected
    }))
    return selectable
  }

  const simpleSelect = (index) => {
    update(($selector) =>
      Object.keys($selector).reduce((acc, key) => {
        acc[key] = parseInt(key) === index
        return acc
      }, {})
    )
  }

  const mutipleSelect = (index) => {
    update(($selector) => ({
      ...$selector,
      [index]: !$selector[index]
    }))
  }

  return {
    subscribe,
    addSelectable,
    select: multiple ? mutipleSelect : simpleSelect
  }
}
