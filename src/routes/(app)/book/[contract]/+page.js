export const prerender = false

export const load = async ({ params }) => {
  return {
    chain: parseInt(params.chain),
    contract: params.contract
  }
}
