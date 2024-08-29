import { createWalletClient, custom } from 'viem'
import { mainnet, WalletClientSigner } from '@alchemy/aa-core'
import { MagicSigner } from '@alchemy/aa-signers/magic'

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})

export const eoaSigner = new WalletClientSigner(client, 'json-rpc')

export const createMagicSigner = async () => {
  const magicSigner = new MagicSigner({
    apiKey: import.meta.env.VITE_MAGIC_SDK_API_KEY
  })
  await magicSigner.authenticate({
    authenticate: async () => {
      await magicSigner.inner.wallet.connectWithUI()
    }
  })

  return magicSigner
}

// import { z } from 'zod'
// import { AlchemyGasManagerConfig } from '@alchemy/aa-alchemy'
// import {
//   SupportedAccountTypes,
//   cookieStorage,
//   createConfig
// } from '@alchemy/aa-alchemy/config'
// import { SmartAccountClientOptsSchema, arbitrumSepolia } from '@alchemy/aa-core'

// export const chain = arbitrumSepolia;
// export const config = createConfig({
//   // this is for requests to the specific chain RPC
//   rpcUrl: "/api/rpc/chain/" + chain.id,
//   signerConnection: {
//     // this is for Alchemy Signer requests
//     rpcUrl: "/api/rpc/",
//   },
//   chain,
//   ssr: true,
//   storage: cookieStorage,
// });
