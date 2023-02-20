const SPRINGBOK_GATEWAY = import.meta.env.VITE_SPRINGBOK_ENDPOINT + '/ipfs/'

// https://ipfs.github.io/public-gateway-checker/

const IPFS_GATEWAYS = [
  'localStorage',
  SPRINGBOK_GATEWAY
  // 'https://nftstorage.link/ipfs/',
  // 'https://ipfs.fleek.co/ipfs/',
  // 'https://gateway.ipfs.io/ipfs/',
  // 'https://dweb.link/ipfs/',
  // 'https://ipfs.io/ipfs/'
]

const createcache = () => {
  const getJSONURL = (uri, gateway = IPFS_GATEWAYS[0]) =>
    uri.replace('ipfs://', gateway)

  // TODO sessionstorage for text only ?
  const getJSONFrom = async (uri, gateway) => {
    try {
      if (gateway === 'localStorage') {
        return JSON.parse(localStorage.getItem(uri))
      }
      // #if (/^ipfs\:\/\//.test(uri)) {
      const response = await fetch(getJSONURL(uri, gateway), {
        method: 'GET',
        //mode: 'no-cors', // cors, *cors, same-origin
        headers: {
          //'Content-Type': 'application/json', // most ipfs gateway won't support it
        }
      })
      console.log(response)
      if (response.ok) {
        return response.json()
      }
    } catch (e) {
      console.warn(`gateway ${gateway} for ${uri}`, e)
    }
  }

  const getJSON = async (uri) => {
    // TODO test hash format
    if (!/^ipfs:\/\//.test(uri)) uri = 'ipfs://' + uri
    for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
      const json = await getJSONFrom(uri, IPFS_GATEWAYS[i])
      if (json) {
        localStorage.setItem(uri, JSON.stringify(json))
        return json
      }
    }
    throw new Error('no gateway answer')
  }

  return { getJSONURL, getJSON }
}

const cache = createcache()

export default cache
