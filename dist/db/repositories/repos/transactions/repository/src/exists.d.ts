import { TransactionsRepository } from './../TransactionsRepository.js';
import type { IdLike, SigLike } from '@imports';
export declare function existsBySignature(this: TransactionsRepository, signature: SigLike): Promise<boolean>;
export declare function existsById(this: TransactionsRepository, id: IdLike): Promise<boolean>;
