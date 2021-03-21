import { Context, logging, storage, ContractPromise } from 'near-sdk-as'

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
class CallNftArgs {
  token_id: string
}

export function getOwner(): void {
  let itemArgs: CallNftArgs = {
    token_id: '1'
  }
  let promise = ContractPromise.create(
    "dev-1616311842543-1234040",
    "get_token_owner",
    itemArgs.encode(),
    // 0,
    1000000000000000
  )

  promise.returnAsResult()
}

// 0 gas error: Error: {"index":0,"kind":{"index":0,"kind":{"NewReceiptValidationError":{"ActionsValidation":"FunctionCallZeroAttachedGas"}}}}
// high gas error: Exceeded the prepaid gas

// @nearBindgen
// class CallNearArgs {
//   accountId: string
//   itemId: string
// }

// export function callMetaNear(): void {

//   let itemArgs: CallNearArgs = {
//     accountId: "alice.near",
//     itemId: "Sword +9000",
//   }
//   let promise = ContractPromise.create(
//     "metanear",
//     "addItem",
//     itemArgs,
//     1000,
//   )
//   promise.returnAsResult()
// }