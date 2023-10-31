import { writable } from 'svelte/store'
import { nanoid } from 'nanoid'

const createStore = () => {
  const { subscribe, set, update } = writable([])

  const dismiss = (message) =>
    update((messages) => messages.filter((m) => m.id !== message.id))

  const add = (message) => {
    message.id ||= nanoid()
    message.timestamp ||= new Date().getTime()
    update((messages) => [message, ...messages])
  }

  const anomaly = (message) => {
    console.error(message)
  }

  return {
    anomaly,
    subscribe,
    add,
    dismiss,
    clear: () => set([])
  }
}

const notifier = createStore()

export default notifier
