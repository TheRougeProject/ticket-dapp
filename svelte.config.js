import sveltePreprocess from 'svelte-preprocess'

import adapter from '@sveltejs/adapter-static'

const config = {
  preprocess: sveltePreprocess({}),
  kit: {
    csp: {
      directives: {
        'script-src': [
          'self',
          'https://verify.walletconnect.org/',
          'https://verify.walletconnect.com/'
        ]
      }
      // reportOnly: {
      //   'script-src': ['self', 'https://verify.walletconnect.com/']
      // }
    },
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
