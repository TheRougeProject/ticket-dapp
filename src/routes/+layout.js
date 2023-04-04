import { browser } from '$app/environment'

import blockchain from '$lib/blockchain.js'

// SPA mode, fallback is 200.html, no ssr
export const prerender = false
export const ssr = false

const initBrowser = async () => {
  const wallet = await import('$lib/wallet.js')
  blockchain.wallet = wallet.default
  await blockchain.on()

  console.log('wallet & blockchain ready...')
}

if (browser) initBrowser()
