import Relationships from './relationships/state/create';
import Relationship from './relationships/state/relationship';
import BelongsToRelationship from './relationships/state/belongs-to';
import ManyRelationship from './relationships/state/has-many';
import { graphFor } from './relationships/state/graph';
import { InternalModel, upgradeForInternal } from '@ember-data/store/-private';
import { RelationshipRecordData } from './ts-interfaces/relationship-record-data';
type RecordDataStoreWrapper = import('@ember-data/store/-private/system/store/record-data-store-wrapper').default;
type StableRecordIdentifier = import('@ember-data/store/-private/ts-interfaces/identifier').StableRecordIdentifier;
type RelationshipDict = import('@ember-data/store/-private/ts-interfaces/utils').ConfidentDict<Relationship>;

export function relationshipsFor(
  storeWrapper: RecordDataStoreWrapper,
  identifier: StableRecordIdentifier
): Relationships {
  if (!identifier) {
    let internalModel = ((storeWrapper as unknown) as { _internalModel: InternalModel })._internalModel;
    identifier = internalModel.identifier;
    storeWrapper = upgradeForInternal((internalModel._recordData as RelationshipRecordData).storeWrapper);
  }
  return graphFor(storeWrapper).get(identifier);
}

export function relationshipStateFor(
  storeWrapper: RecordDataStoreWrapper,
  identifier: StableRecordIdentifier,
  propertyName: string
): BelongsToRelationship | ManyRelationship {
  if (!propertyName) {
    let internalModel = ((storeWrapper as unknown) as { _internalModel: InternalModel })._internalModel;
    propertyName = (identifier as unknown) as string;
    identifier = internalModel.identifier;
    storeWrapper = upgradeForInternal((internalModel._recordData as RelationshipRecordData).storeWrapper);
  }
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
