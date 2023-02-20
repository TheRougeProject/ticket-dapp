import path from 'path'

import npm from './package.json'
import config from './rougeticket.config.js'

import { sveltekit } from '@sveltejs/kit/vite'

const vite = {
  plugins: [sveltekit()],
  // exclude: ['dayjs'],
  define: {
    __APP_NAME__: JSON.stringify(npm.name),
    __APP_VERSION__: JSON.stringify(npm.version),
    __CONFIG_NAME__: JSON.stringify(config.name),
    __CONFIG_TITLE__: JSON.stringify(config.title),
    __CONFIG_DESCRIPTION__: JSON.stringify(config.description),
    __CONFIG_SHORT_DESCRIPTION__: JSON.stringify(
      config.shortDescription || config.description
    ),
    __CONFIG_IMAGE__: JSON.stringify(config.image),
    __CONFIG_URL__: JSON.stringify(config.url),
    __CONFIG_PLUGINS__: JSON.stringify(JSON.stringify(config.plugins))
  },
  ssr: {
    //
  },
  server: {
    // port: 3000,
  },
  resolve: {
    alias: {
      $components: path.resolve('./src/components'),
      $stores: path.resolve('./src/stores'),
      $icons: path.resolve('./src/icons')
    }
  }
}

export default vite
