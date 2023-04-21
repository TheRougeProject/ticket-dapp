import { writable } from 'svelte/store'
import { decode } from 'jsonwebtoken-esm'

import { ethers } from 'ethers'

import { defaultEvmStores as evm, chainId } from 'ethers-svelte'

import { eip712DomainByChain } from '@rougenetwork/v2-core/config'

import { dataURLtoBlob } from './utils'

const endpoint = import.meta.env.VITE_SPRINGBOK_ENDPOINT

// don't share jwt between address but share between chainId
const jwtKey = (address) => `rge:jwt:${address}`

export const authed = writable(false)

// need to be organized as API
// eg hasGetProject => answer true|false => enable or not
// create several implementation to compare + A|b testing

export const createBackend = () => {
  const request = async (method, url, data) => {
    try {
      const headers =
        data && !(data instanceof FormData)
          ? { 'content-type': 'application/json' }
          : {}
      const response = await fetch(`${endpoint}${url}`, {
        method,
        headers: {
          Authorization: localStorage.getItem(jwtKey(evm.$signerAddress)),
          ...headers
        },
        body: data
          ? data instanceof FormData
            ? data
            : JSON.stringify(data)
          : undefined
      })
      return response.json()
    } catch (e) {
      console.log(e)
    }
  }

  const get = (url) => request('GET', url)
  const put = (url) => request('PUT', url)
  const post = (url, data) => request('POST', url, data)

  const signedRequest = async (path, types, content) => {
    const domain = eip712DomainByChain(evm.$chainId)

    let signature
    // XXX TMP workaround wallet connect incompatibility with ethers.js
    if (/^wc/.test(evm.$provider.provider.connector?.protocol)) {
      const payload = ethers.TypedDataEncoder.getPayload(domain, types, content)
      signature = await evm.$provider.send('eth_signTypedData', [
        evm.$signerAddress.toLowerCase(),
        JSON.stringify(payload)
      ])
    } else {
      signature = await evm.$signer.signTypedData(domain, types, content)
    }

    const response = await fetch(`${endpoint}${path}`, {
      method: 'POST',
      headers: {
        'EIP712-Signature': signature,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ domain, types, content })
    })
    return response.json()
  }

  const signIn = async () => {
    const res = await signedRequest(
      '/v1/eip712/token',
      {
        Content: [
          { name: 'app', type: 'string' },
          { name: 'apiKey', type: 'string' },
          { name: 'address', type: 'string' },
          { name: 'scope', type: 'string' },
          { name: 'message', type: 'string' }
        ]
      },
      {
        app: 'Rouge',
        apiKey: '2a034fb93c10077538c6df0955bd529f',
        scope: 'ipfs',
        address: evm.$signerAddress,
        message: `Sign to accept the Rouge Terms of Service. This request will not trigger a blockchain transaction or cost any gas fees.`
      }
    )
    console.log('signIn', res, evm.$chainId)
    //if (res.success && res.chainId === evm.$chainId) {
    if (res.success) {
      localStorage.setItem(jwtKey(evm.$signerAddress), res.jwt)
      authed.set(true)
    } else {
      // todo handle error msg
      throw new Error('backend failure')
    }
  }

  const signOff = () => {
    localStorage.removeItem(jwtKey(evm.$signerAddress))
    authed.set(false)
  }

  const loadAuth = () => {
    const key = localStorage.getItem(jwtKey(evm.$signerAddress))
    if (key) {
      const decoded = decode(key, { complete: true })
      if (!decoded.payload.aud === 'ipfs') {
        console.log('REMOVE ODL JWT', decoded)
        localStorage.removeItem(jwtKey(evm.$signerAddress))
      } else {
        authed.set(true)
      }
    }
    // TODO check expiration ?
  }

  const unloadAuth = () => {
    authed.set(false)
  }

  const uploadFile = async (file) => {
    //console.log('[uploadFile]', file)
    if (/^data:image/.test(file)) {
      const formData = new FormData()
      formData.append('file', dataURLtoBlob(file))
      return post('/v1/ipfs/add', formData)
    }
  }

  const uploadMeta = async (data) => {
    console.log('[uploadMeta]', data)

    // XXX only upload img,
    if (data._upload && /^data:image/.test(data[data._upload])) {
      const blob = dataURLtoBlob(data.visual)
      const formData = new FormData()

      formData.append('file', blob)

      return post('/v1/ipfs/add', formData)
    } else {
      const formData = new FormData()

      const blob = new Blob([JSON.stringify(data)], {
        type: 'application/json'
      })
      formData.append('metadata', blob)

      //const url = '/v1/ipfs/add?macro=1'

      return post('/v1/ipfs/add', formData)
    }
  }

  const addProject = (address) =>
    put(`/issuer/${evm.$signerAddress}/${address}`)

  const getAcquired = (from) => get(`/v1/events/a2hAyyJJe_y8IrcgcNVTW/${from}`)

  const getProjects = async ({ from, chainId, address }) => {
    const filter = 'ProxyCreation'
    return get(`/v1/event/${from}/${chainId}/${address}/${filter}`)
  }

  chainId.subscribe(($chainId) => {
    if (!$chainId) return unloadAuth()
    // console.log('backend => new chainId', $chainId)
    loadAuth()
  })

  return {
    signIn,
    signOff,
    loadAuth,
    unloadAuth,
    addProject,
    getAcquired,
    getProjects,
    uploadFile,
    uploadMeta
  }
}

const worker = createBackend()

export default worker
