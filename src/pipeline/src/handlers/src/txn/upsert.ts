import type {TransactionsInsertParams,Identity} from '@imports';
import type {AllDeps} from '@db';
export async function transactionInsert(  
  payload: TransactionsInsertParams,
  deps: AllDeps
):Promise<Identity> {
  await deps.transactionsService.insertTransactions(payload);
  return payload as Identity
}
