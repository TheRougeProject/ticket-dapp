export const prerender = false

export const load = async ({ params }) => {
  return { address: params.address, index: params.index }
}
