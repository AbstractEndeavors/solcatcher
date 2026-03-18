import { TransactionsRepository } from './../TransactionsRepository.js';
import type { IdLike, AddressLike, VolumeAggregate } from '@imports';
export declare function countByPair(this: TransactionsRepository, pairId: IdLike): Promise<number>;
export declare function countByUser(this: TransactionsRepository, userAddress: AddressLike): Promise<number>;
export declare function sumVolumeByPair(this: TransactionsRepository, pairId: IdLike): Promise<VolumeAggregate | null>;
export declare function sumVolumeByUser(this: TransactionsRepository, userAddress: AddressLike): Promise<VolumeAggregate | null>;
