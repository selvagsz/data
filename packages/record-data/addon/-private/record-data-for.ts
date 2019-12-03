import Relationships from './relationships/state/create';
import Relationship from './relationships/state/relationship';
import BelongsToRelationship from './relationships/state/belongs-to';
import ManyRelationship from './relationships/state/has-many';
import { graphFor } from './relationships/state/graph';
type RecordDataStoreWrapper = import('@ember-data/store/addon/-private/ts-interfaces/record-data-store-wrapper').RecordDataStoreWrapper;
type StableRecordIdentifier = import('@ember-data/store/-private/ts-interfaces/identifier').StableRecordIdentifier;
type RelationshipDict = import('@ember-data/store/-private/ts-interfaces/utils').ConfidentDict<Relationship>;

export function relationshipsFor(
  storeWrapper: RecordDataStoreWrapper,
  identifier: StableRecordIdentifier
): Relationships {
  return graphFor(storeWrapper).get(identifier);
}

export function relationshipStateFor(
  storeWrapper: RecordDataStoreWrapper,
  identifier: StableRecordIdentifier,
  propertyName: string
): BelongsToRelationship | ManyRelationship {
  return relationshipsFor(storeWrapper, identifier).get(propertyName);
}

export function implicitRelationshipsFor(
  storeWrapper: RecordDataStoreWrapper,
  identifier: StableRecordIdentifier
): RelationshipDict {
  return graphFor(storeWrapper).getImplicit(identifier);
}

export function implicitRelationshipStateFor(
  storeWrapper: RecordDataStoreWrapper,
  identifier: StableRecordIdentifier,
  propertyName: string
): Relationship {
  return implicitRelationshipsFor(storeWrapper, identifier)[propertyName];
}
