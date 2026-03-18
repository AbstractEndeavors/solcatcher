
import e from 'express';
import {DepsInitializer} from './../initialize.js';
import {repoResultToClassifiedEvents,fetchOrCreateTxnRepoResult,txnEntry,fetchAndInsertTxn} from '@pipeline';
import { expectRepoValue, } from '@imports';
import {fetchTransaction,fetchTransactionRaw} from '@rateLimiter';
const deps_mgr = new DepsInitializer()
const deps = await deps_mgr.start();

const signature = 'PJWxVe6agKo4yxBzMWSo4iGNr4iHbd7jEY6rxaE93vq4zQyAxA9ccDEzzei3nTyn7JKwkkzZxTvcoppcWmcfovi'

const RepoResult = await  fetchOrCreateTxnRepoResult({signature},deps)
const logData = expectRepoValue(RepoResult)
console.log(logData)
const events = await repoResultToClassifiedEvents(RepoResult,deps)
console.log(events)
const entries = await txnEntry(events,deps,false)
for (const entry of entries.creates){
    console.log(entry)

}