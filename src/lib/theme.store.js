import { writable } from 'svelte/store'
import { browser } from '$app/environment'

const storedTheme = browser && localStorage.getItem('theme')
const initialTheme =
  storedTheme ?? (browser && document.body.dataset.theme) ?? 'light'

const theme = writable(initialTheme)

export default theme
