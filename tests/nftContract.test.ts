import getNftContract from '../src/near/nftContract'
import { assert } from 'chai'

describe('Contract test', async () => {

    // it('Mint NFT', async () => {
    //     const contract = await getNftContract()
    //     const saveAddressResp = await contract.mint_to({
    //         owner_id: 'monkeyis.near'
    //     })
    //     console.log('Mint NFT response', saveAddressResp)

    //     assert(true)
    // })

    it('Get NFT owner', async () => {
        const contract = await getNftContract()
        const getOwnerResp = await contract.get_token_owner({
            token_id: '1'
        })
        console.log('Get owner response', getOwnerResp)

        assert(true)
    })
})
