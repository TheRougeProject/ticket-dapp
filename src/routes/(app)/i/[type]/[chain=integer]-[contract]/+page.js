import { redirect } from '@sveltejs/kit'

export const prerender = false

// compat route < v0.6.4

export const load = async ({ params }) => {
  redirect(307, `/i/ticket/${params.chain}:${params.contract}/`);
}
