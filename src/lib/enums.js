import { ethers } from 'ethers'

// XXX only support non BigInt chainId
const baseChainIds = JSON.parse(import.meta.env.VITE_MAINCHAIN_IDS)
const baseTestnetChainIds = JSON.parse(import.meta.env.VITE_TESTCHAIN_IDS)
export const supportedChainIds = baseChainIds.map((id) => BigInt(id))

export const getSupportedChainIds = (testnets) => {
  if (!testnets) return supportedChainIds
  return [...baseChainIds, ...baseTestnetChainIds].map((id) => BigInt(id))
}

// purely informational
export const categories = [
  'Concert',
  'Conference',
  'Convention',
  'Class',
  'Exhibition',
  'Expo',
  'Festival',
  'Fair',
  'Gala',
  'Seminar',
  'Show',
  'Sport',
  'Trade show',
  'Performance',
  'Party',
  'Hackathon',
  'Networking Event',
  'Meet up',
  'Signing',
  'Workshop',
  'Other event'
]

export const themes = ['Business', 'Crypto']

const _netAbbr = {
  42170: 'arb-nova',
  1337: 'local'
}

// TODO should support any format
export const netAbbr = (chain) => _netAbbr[`${chain}`] || 'unknown'

// some ux template differ
export const types = [
  'Registration',
  'Ticket',
  'Discount Coupon',
  'Proof Of Attendance',
  'IOU'
]

// TODO support https://tokenlists.org/

// XXX move to erc-token-js

export const f = (decimals) => (s) =>
  ethers.formatUnits((s + '').split(' ').join(''), decimals)
export const f6 = f(6)
export const f18 = f(18)

export const formatAmount = ({ decimals = 18, amount = '0', symbol }) => {
  return f(parseInt(decimals))(amount) + ` ${symbol}`
}
