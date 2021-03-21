import { assert } from 'chai'
import getFractionContract from '../src/near/fractionContract'

describe('Fraction contract test', async () => {

    it('Get NFT owner from caller contract', async () => {
        const contract = await getFractionContract()
        const getOwnerResp = await contract.getOwner({})
        console.log('Get owner response', getOwnerResp)

        assert(true)
    })

    // it('Call near function', async () => {
    //     const contract = await getFractionContract()
    //     const nearResp = await contract.callMetaNear({})
    //     console.log('Get near function response', nearResp)

    //     assert(true)
    // })
})
