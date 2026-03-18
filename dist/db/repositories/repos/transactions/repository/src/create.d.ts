import { TransactionsRepository } from './../TransactionsRepository.js';
export declare function createTable(this: TransactionsRepository): Promise<void>;
export declare function createIndexes(this: TransactionsRepository): Promise<void>;
export declare function createPotentialIndexes(this: TransactionsRepository): Promise<void>;
export declare function createRollupsTable(this: TransactionsRepository): Promise<void>;
export declare function createTmpCreatorTable(this: TransactionsRepository): Promise<void>;
export declare function initSchema(this: TransactionsRepository): Promise<void>;
