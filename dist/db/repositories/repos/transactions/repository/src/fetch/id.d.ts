import { TransactionsRepository } from './../../TransactionsRepository.js';
import type { TransactionsRow, IdLike, MintLike, SigLike } from '@imports';
export declare function fetchById(this: TransactionsRepository, id: IdLike): Promise<TransactionsRow | null>;
export declare function fetchBySignature(this: TransactionsRepository, signature: SigLike): Promise<TransactionsRow | null>;
export declare function fetchByPair(this: TransactionsRepository, pairId: IdLike): Promise<TransactionsRow[]>;
export declare function fetchByMint(this: TransactionsRepository, mint: MintLike): Promise<TransactionsRow[]>;
