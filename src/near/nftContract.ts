import * as nearAPI from 'near-api-js'
const {
    Near, Contract, KeyPair,
    keyStores: { InMemoryKeyStore },
} = nearAPI
import * as credentials from './dev-1616311842543-1234040.json'

const networkId = 'default'
const contractName = credentials.account_id
const nodeUrl = 'https://rpc.testnet.near.org'

export interface NftContract extends nearAPI.Contract {
    get_token_owner: Function,
    mint_to: Function,
}

export default async function getNftContract () {
    // Initialize Near
    const keyStore = new InMemoryKeyStore()
    await keyStore.setKey(networkId, contractName, KeyPair.fromString(credentials.private_key))
    console.log(keyStore)

    const near = new Near({
        networkId, nodeUrl,
        deps: { keyStore },
    })

    const account = await near.account(credentials.account_id)

    // Initialize contract
    return new Contract(account, contractName, {
        viewMethods: ['get_token_owner'],
        changeMethods: ['mint_to'],
    }) as NftContract
}
