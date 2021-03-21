import * as nearAPI from 'near-api-js'
const {
    Near, Contract, KeyPair,
    keyStores: { InMemoryKeyStore },
} = nearAPI
import * as credentials from './dev-1615619158857-5968612.json'

const networkId = 'default'
const contractName = 'dev-1616312075136-6446253' // NFT contract
const nodeUrl = 'https://rpc.testnet.near.org'

export default async function getNftContract () {
    // Initialize Near
    const keyStore = new InMemoryKeyStore()
    await keyStore.setKey(networkId, contractName, KeyPair.fromString(credentials.private_key))

    const near = new Near({
        networkId, nodeUrl,
        deps: { keyStore },
    })

    const account = await near.account(credentials.account_id)

    // Initialize contract
    return new Contract(account, contractName, {
        viewMethods: ['get_token_owner'],
        changeMethods: ['mint_to'],
    })
}