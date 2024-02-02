import { redirect } from '@sveltejs/kit'
import { allChainsData } from 'ethers-svelte'

//  true XXX ?
export const prerender = false

export const load = async ({ params }) => {
  if (!/^\d+$/.test(params.chain)) {
    const search = allChainsData.filter((o) => o.shortName === params.chain)
    if (search.length !== 1) {
      console.log('unknown chain')
      redirect(400, '/hub');
    }
    params.chain = search[0].chainId
  }

  return {
    type: params.type,
    chain: BigInt(params.chain)
  }
}
