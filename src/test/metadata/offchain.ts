import {fetchOffchainJson,fetchOnchainMetaData} from '@pipeline';
import {getDeps} from './../initialize.js';
const deps = await getDeps();
const metaDaata = await deps.metaDataRepo.fetchCursor({limit:3})
console.log(metaDaata)
