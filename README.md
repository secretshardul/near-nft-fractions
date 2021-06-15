# NFT fractionalization on Near

**Note**: Complete program at https://github.com/secretshardul/fractose-contracts-v1.

## Core features
- Fractionalization: Stake NFT and get fungible tokens representing its fractions. The following parameters will be set during fractionalization:
   1. Total fraction count
   2. Exit price
- Redeem: Pay the exit price to redeem the NFT. Each fraction holder gets renumerated according to their fraction share.

## Good to have
- Marketplace for NFT fractions
- Integration with liquidity pools
- Explore NIFTEX vaults and index funds: They allow multiple NFTs to be pooled and fractionalized together.
- $NEAR_FACTIONALIZATION token

## Work plan
- Study whitepapers of ethereum based fractionalization projects.
- Create UML diagrams for contract flow
- Study Rust
- Near protocol study:
   1. New standards for fungible and non-fungible tokens.
   2. Cross-contract calls using Rust.
- Develop contracts using the UML diagrams.

## Credits
- NFTFY: Fractionalize single NFTs
   - Website: https://nftfy.org/
   - White paper: https://drive.google.com/file/d/1B4b8jV3QDxGPO-Xg_JAtiKbd2O6y8cV7/view
- NIFTEX: Fractionalize single NFTs
   - Website: https://www.niftex.com/
- NFTX: Pool NFTs and and create index funds
   - Website: https://nftx.org/

## NFT Index Funds on NFTX

### Create an NFT index fund
- Source: https://docs.nftx.org/archive/old-tutorials/how-to-create-an-nft-index-fund
- NFTX contract: https://etherscan.io/address/0xAf93fCce0548D3124A5fC3045adAf1ddE4e8Bf7e#writeProxyContract
- XStore contract: https://etherscan.io/address/0xBe54738723cea167a76ad5421b50cAa49692E7B7#readContract

1. Create vault: Send a transaction to `createVault` function of NFTX contract. It takes the given fields and creates an ERC20 token contract.
   1. Fund name: Eg. Twerky Pepe
   2. Token name: $TWERKY
   3. Address of the NFT contract
   4. D1 or D2 fund (skip this)

2. Visit the [XStore contract](https://etherscan.io/address/0xBe54738723cea167a76ad5421b50cAa49692E7B7#readContract). Find contract address of the generated ERC20 token.
   - After `NewVault` event is fired check `vaultID` of newly created vault using `vaultsLength`. It starts from 0 and gets incremented for each new token.
   - Get contract address by passing `vaultID` to `xTokenAddress` function.
   - Query the name and symbol fields on this address to verify that this is the correct contract.

3. For ERC 1155 tokens only: Go back to [NFTX contract](https://etherscan.io/address/0xAf93fCce0548D3124A5fC3045adAf1ddE4e8Bf7e#writeProxyContract). Send a transaction to `setIs1155` function with `vaultID` and `true` as parameters.

4. Finalize vault:
   - Send a transaction to `finalizeVault` function with value `vaultID`.

5. To allow minting of index funds
   - Visit the contract of the NFT you wish to convert. Eg. [Twerky Pepe NFT contract](https://etherscan.io/address/0xf4680c917a873e2dd6ead72f9f433e74eb9c623c).
   - Send transaction to `setApprovalForAll` with 2 fields:
      1. `_operator`: NFTX contract address
      2. `_approved`: `true`

      We are approving the `_operator` to transfer the sender's tokens.

      Alternately send a transaction to `approve(address to, uint256 tokenId)` to approve permission for a single NFT. This will cost more gas if multiple NFTs need to be transferred.

6. Minting index funds:
   - Visit the NFTX contract. Send transaction to the `mint` function with values:
      1. **payableAmount** — put a 0 (why?)
      2. **vaultID** — the vault you want to mint into
      3. **nftids** — Pass IDs of NFTs you want to add in square brackets. Eg. `[48,53,89]`.
      4. **d2Amount** — put 0 into this field (ignore)

   - visit XStore and call `holdingsLength` with the vault ID. It will return count of NFTs in this vault.

### Staking NFTs into existing vaults
Perform steps 5 and 6.

### Redeeming
Approve transfer of vTokens using ERC 20 `approve()` function. Send transaction to `redeem(uint256 vaultId, uint256 amount)` with `vaultId` and number of index tokens. You get a random NFT for each redeemed vToken. vTokens are specific to their vaults, eg. cryptokitties vTokens can't be used to redeem cryptopunks.

### Contract architecture

### Questions
1. How many tokens do we get for minting NFTs into vaults?
   - You get 1 index token for each NFT added to vault. There's a 1:1 relation between them. But the ERC20 index tokens can be fractionalized upto 18 decimal places.

2. Is it possible to restrict which NFTs can be deposited into our vault?
   - Yes. NFTs can be white or blacklisted by sending `setIsEligible(uint256 vaultId, uint256[] memory nftIds, bool _boolean)` transaction. Eg. we can create a female CryptoPunks vault or a single NFT vault.

3. Can NFTs created from different contracts be pooled together?
   - Not for D1/single funds. Contract ID must be provided during vault creation. Only NFTs from this contract can be pooled.
   - D2/combined funds are formed by pooling D1 ERC20 tokens from various vaults.

4. Is there a buyout clause / exit fee?
   - No

5. How to determine total value locked (TVL)?


6. How is token cost decided?

7. How to select a random NFT when redeeming?
   - NFTX uses a [pseudo-random number generator](https://github.com/NFTX-project/x-contracts/blob/2c26cb4bc8693cd858ecafe7476d8b432a74b43c/contracts/NFTX.sol#L74). Ideally an oracle should be used.

## Fractionalization with NFTFY

### References
- Website: https://nftfy.org/
- White paper: https://drive.google.com/file/d/1B4b8jV3QDxGPO-Xg_JAtiKbd2O6y8cV7/view

### Architecture

![nftfy-architecture](https://user-images.githubusercontent.com/49580849/115112184-f42be300-9fa1-11eb-9609-65986ca07c77.png)

### Flow charts
1. **Securitization**: The Origin Owner creates a contract and defines the rules as wished. The NFT is staked and the Origin Owner receives 100% of shares.

![securitization](https://user-images.githubusercontent.com/49580849/115112206-0efe5780-9fa2-11eb-9ed6-60c88fca6e9d.png)

2. **Redeem**: The Extractor Buyer pays with ETH and/or Shares to redeem the NFT and to take ownership of it. The contract receives the payment, burns the Shares, and keeps the ETH in the Vault, which is an ETH Fund available for the claimants.

![redeem](https://user-images.githubusercontent.com/49580849/115112220-1e7da080-9fa2-11eb-9eb4-8eb3503037d8.png)

3. **Claim**: Any Ordinary Holder who holds a Share can claim the right of changing shares to ETH. The contract remains running until the last Share is burned.

![claim](https://user-images.githubusercontent.com/49580849/115112227-24738180-9fa2-11eb-85fd-257c2cb7e3b7.png)


### Shareholder agreement
1. Drag-along clause: If majority decides to sell, the minority shareholders will be obliged to sell under the same conditions. This is a protection against blocked sales.
2. Tag-along clause / co-sale right: Minority shareholders have the right to sell at the same terms offered to the majority shareholders.
3. Exit price: If someone pays the exit price, all shareholders will be obliged to sell.

### How exit works
- When an exit price in ETH is paid, this amount becomes the new backing of the remaining shares. Shares of others don't disappear. Others have the option of returning their shares and claiming their ETH. The returned shares are burned. The contract keeps running until the last share is burned.

- Exit price can be paid as a combination of accumulated shares (shares owned by the redeemer) and ETH. This allows people to obtain shares at lower prices from the market and redeem the NFT.

```
Shares' Exit Price(SEP) = Exit Price(EP)/(Supply Shares)

Payment = AccS*SEP + ETH_PAYMENT
```


### NFY token
- Token holders vote to cutate securitized contracts that seek recognition. They vote whether new securities can be listed on Balancer LBPs.
- LBPs must contain at least 30% NFY tokens.
- People can provide liquidity on Balancer and earn NFY tokens. This is to incentivize liquidity. 20% of token supply is earmarked for liquidity mining.

