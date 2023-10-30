import { writable } from 'svelte/store'
import { nanoid } from 'nanoid'

const createStore = () => {
  const { subscribe, set, update } = writable([])

  const dismiss = (message) =>
    update((messages) => messages.filter((m) => m.id !== message.id))

  const add = (message) => {
    message.id = message.id || nanoid()
    message.timestamp = message.timestamp || new Date().getTime()
    update((messages) => [message, ...messages])
  }

  return {
    subscribe,
    add,
    dismiss,
    clear: () => set([])
  }
}

const notifier = createStore()

export default notifier
