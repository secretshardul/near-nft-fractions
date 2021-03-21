import { Context, logging, storage, ContractPromise, context, ContractPromiseResult, PersistentMap } from 'near-sdk-as'

@nearBindgen
class GetOwnerArgs {
  token_id: string
}

@nearBindgen
class OnGotOwnerArgs {
  itemAddedRequestId: string
  nft_contract: string
  token_id: string
  sender: string
}

const nft_fraction_balances = new PersistentMap<string, Map<string, u64>>("c:")

const balances = new PersistentMap<string, u64>("b:")
const approves = new PersistentMap<string, u64>("a:")

const TOTAL_SUPPLY: u64 = 1000000

export function init(initialOwner: string): void {
  logging.log("initialOwner: " + initialOwner)
  assert(storage.get<string>("init") == null, "Already initialized token supply")
  balances.set(initialOwner, TOTAL_SUPPLY)
  storage.set("init", "done")
}

export function totalSupply(): string {
  return TOTAL_SUPPLY.toString()
}

export function balanceOf(tokenOwner: string): u64 {
  logging.log("balanceOf: " + tokenOwner)
  if (!balances.contains(tokenOwner)) {
    return 0
  }
  const result = balances.getSome(tokenOwner)
  return result
}

export function allowance(tokenOwner: string, spender: string): u64 {
  const key = tokenOwner + ":" + spender
  if (!approves.contains(key)) {
    return 0
  }
  return approves.getSome(key)
}

export function transfer(to: string, tokens: u64): boolean {
  logging.log("transfer from: " + context.sender + " to: " + to + " tokens: " + tokens.toString())
  const fromAmount = getBalance(context.sender)
  assert(fromAmount >= tokens, "not enough tokens on account")
  assert(getBalance(to) <= getBalance(to) + tokens, "overflow at the receiver side")
  balances.set(context.sender, fromAmount - tokens)
  balances.set(to, getBalance(to) + tokens)
  return true
}

export function approve(spender: string, tokens: u64): boolean {
  logging.log("approve: " + spender + " tokens: " + tokens.toString())
  approves.set(context.sender + ":" + spender, tokens)
  return true
}

export function transferFrom(from: string, to: string, tokens: u64): boolean {
  const fromAmount = getBalance(from)
  assert(fromAmount >= tokens, "not enough tokens on account")
  const approvedAmount = allowance(from, to)
  assert(tokens <= approvedAmount, "not enough tokens approved to transfer")
  assert(getBalance(to) <= getBalance(to) + tokens, "overflow at the receiver side")
  balances.set(from, fromAmount - tokens)
  balances.set(to, getBalance(to) + tokens)
  return true
}

function getBalance(owner: string): u64 {
  return balances.contains(owner) ? balances.getSome(owner) : 0
}

/** Fractionalization */

export function fractionalize(nft_contract: string, token_id: string): void {
  // Check if current contract is owner
  let itemArgs: GetOwnerArgs = {
    token_id
  }

  let promise = ContractPromise.create(
    nft_contract,
    "get_token_owner",
    itemArgs.encode(),
    3000000000000
  )

  let requestArgs: OnGotOwnerArgs = {
    itemAddedRequestId: "UNIQUE_REQUEST_ID",
    nft_contract,
    token_id,
    sender: context.sender
  }
  let callbackPromise = promise.then(
    context.contractName,
    "_onGotOwner",
    requestArgs.encode(),
    3000000000000
  )
  callbackPromise.returnAsResult()
}

export function _onGotOwner(itemAddedRequestId: string, nft_contract: string, token_id: string, sender: string): void {
  let results = ContractPromise.getResults()
  let addItemResult = results[0]

  // Check if this contract is owner of NFT
  let decodedName = decode<string>(addItemResult.buffer)
  logging.log('Decoded name ' + decodedName)

  assert(decodedName == context.contractName, "Contract does not own the token")
  // Issue NFTs
  logging.log('Minting tokens for NFT ID' + token_id)

  let balanceMap = new Map<string, u64>()
  balanceMap.set(sender, 100)

  nft_fraction_balances.set(token_id, balanceMap)
}