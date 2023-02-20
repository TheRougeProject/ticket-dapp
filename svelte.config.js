import sveltePreprocess from 'svelte-preprocess'

import adapter from '@sveltejs/adapter-static'

const config = {
  preprocess: sveltePreprocess({}),
  kit: {
    prerender: {
      handleHttpError: 'warn', // | ((details: RequestDetails) => void | never);
      entries: [] // no prerendering
    },
    adapter: adapter({
      pages: '.build',
      assets: '.build',
      fallback: '200.html'
    })
  }
}

export default config
