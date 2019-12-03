type RecordDataStoreWrapper = import('@ember-data/store/-private/ts-interfaces/record-data-store-wrapper').RecordDataStoreWrapper;
type RelationshipDict = import('@ember-data/store/-private/ts-interfaces/utils').ConfidentDict<Relationship>;
type StableRecordIdentifier = import('@ember-data/store/-private/ts-interfaces/identifier').StableRecordIdentifier;
import Relationships from './create';
import Relationship from './relationship';

const Graphs = new WeakMap<RecordDataStoreWrapper, Graph>();

export function graphFor(store: RecordDataStoreWrapper): Graph {
  let graph = Graphs.get(store);
  if (graph === undefined) {
    graph = new Graph(store);
    Graphs.set(store, graph);
  }
  return graph;
}

export class Graph {
  identifiers: Map<StableRecordIdentifier, Relationships> = new Map();
  implicitMap: Map<StableRecordIdentifier, RelationshipDict> = new Map();
  constructor(public storeWrapper: RecordDataStoreWrapper) {}

  get(identifier: StableRecordIdentifier): Relationships {
    let relationships = this.identifiers.get(identifier);

    if (relationships === undefined) {
      relationships = new Relationships(this, identifier);
      this.identifiers.set(identifier, relationships);
    }

    return relationships;
  }

  getImplicit(identifier: StableRecordIdentifier): RelationshipDict {
    let relationships = this.implicitMap.get(identifier);

    if (relationships === undefined) {
      relationships = Object.create(null) as RelationshipDict;
      this.implicitMap.set(identifier, relationships);
    }

    return relationships;
  }
}
