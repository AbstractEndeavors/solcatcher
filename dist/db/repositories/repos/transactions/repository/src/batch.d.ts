import { TransactionsRepository } from './../TransactionsRepository.js';
import type { IdLike, SigLike } from '@imports';
export declare function bulkInsertTmpCreatorSignatures(this: TransactionsRepository, signatures: SigLike[]): Promise<void>;
export declare function fetchCreatorAccountIds(this: TransactionsRepository): Promise<IdLike[]>;
