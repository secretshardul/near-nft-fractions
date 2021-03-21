import { Context, logging, storage, ContractPromise, context } from 'near-sdk-as'

const DEFAULT_MESSAGE = 'Hello'


export function getGreeting(accountId: string): string | null {
  return storage.get<string>(accountId, DEFAULT_MESSAGE)
}

export function setGreeting(message: string): void {
  const account_id = Context.sender

  logging.log(
    'Saving greeting "' + message + '" for account "' + account_id + '"'
  )

  storage.set(account_id, message)
}

@nearBindgen
class GetOwnerArgs {
  token_id: string
}

@nearBindgen
class OnGotOwnerArgs {
  itemAddedRequestId: string
}

export function getOwner(): void {
  logging.log('Got gas' + context.prepaidGas.toString())

  let itemArgs: GetOwnerArgs = {
    token_id: '1'
  }
  let promise = ContractPromise.create(
    "dev-1616323404800-5884526",
    "get_token_owner",
    itemArgs.encode(),
    3000000000000
  )

  let requestArgs: OnGotOwnerArgs = {
    itemAddedRequestId: "UNIQUE_REQUEST_ID",
  }
  let callbackPromise = promise.then(
    context.contractName,
    "_onItemAdded",
    requestArgs.encode(),
    3000000000000
  )
  callbackPromise.returnAsResult();
}

export function _onItemAdded(itemAddedRequestId: string): void {
  // Get all results
  let results = ContractPromise.getResults()
  let addItemResult = results[0]

  logging.log('Encoded owner name' + addItemResult.buffer.toString())
}

