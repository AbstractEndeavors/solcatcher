// src/pipeline/handlers/txnEntry.ts
//
// UPDATED: Two paths based on what arrives from the queue.
//
// Fast path (normal flow):
//   logEntry returns IngestResult → txnEntry receives it with decoded events
//   → decodePayloads() sees hasDecodedEvents → routes pre-decoded trades/creates
//   → zero re-fetch, zero re-decode
//
// Slow path (re-processing, manual trigger):
//   payload is plain { id, signature } → getLogPayloadContext → eventOrchistrator
//   → full decode from DB
import { type AllDeps} from '@repoServices';
import {type ClassifiedEvent,EventKind,type DecodedCreateEvents,type DecodedTradeEvents,type EventsLog} from '@imports'
import {processCreateEvent,processTradeEvent} from './../events/index.js'


export async function txnEntry(
  events: ClassifiedEvent[],
  deps: AllDeps,
  publish:boolean=true
): Promise<EventsLog> {
  const eventsLogs:EventsLog ={trades:[],creates:[],unknown:[]}
  for (const event of events) {
    switch (event.kind) {
      case EventKind.TRADE:
        if (publish){
          await deps.publisher.publish('tradeEventEntry', event as DecodedTradeEvents);
        }else{
            eventsLogs.trades.push(await processTradeEvent(event as DecodedTradeEvents,deps))
        }
        break;
      case EventKind.CREATE:
        if (publish){
          await deps.publisher.publish('createEventEntry', event as DecodedCreateEvents);
        }else{
           eventsLogs.creates.push(await processCreateEvent(event as DecodedCreateEvents,deps))
        }
        break;
      case EventKind.UNKNOWN:
        
        break;
    }
  }
  return eventsLogs
}