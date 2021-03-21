import { assert } from 'chai'
import getFractionContract from '../src/near/fractionContract'

describe('Fraction contract test', async () => {

    it('Fractionalize', async () => {
        const contract = await getFractionContract()
        const fractionalizeResp = await contract.fractionalize({
            nft_contract: 'dev-1616323404800-5884526',
            token_id: '6'
        })
        console.log('Fractionalize response', fractionalizeResp)

        assert(true)
    })
})
