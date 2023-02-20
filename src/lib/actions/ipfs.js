// XXX could be gateway ...
const endpoint = import.meta.env.VITE_SPRINGBOK_ENDPOINT
const gateway = `${endpoint}/ipfs/`

export const ipfs = (node) => {
  let loaded = false
  const uri = node.getAttribute('data-ipfs')

  if (!uri) {
    console.warn('empty ipfs src')
    return
  }

  if (/^http/.test(uri)) {
    node.src = uri

    return
  } else {
    const cid = uri.replace('ipfs://', '')

    const handleLoad = () => {
      if (!loaded && node.src.search(cid) >= 0) {
        loaded = true
      }
    }

    document.addEventListener('load', handleLoad, true)

    node.src = gateway + cid

    return {
      destroy() {
        document.removeEventListener('load', handleLoad, true)
      }
    }
  }
}
