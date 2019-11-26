type Snapshot = import('../system/snapshot').default;
type SnapshotRecordArray = import('../system/snapshot-record-array').default;
type Store = import('../system/core-store').default;
type ModelSchema = import('../ts-interfaces/ds-model').ModelSchema;
type AdapterPopulatedRecordArray = import('../system/record-arrays/adapter-populated-record-array').default;
type RelationshipSchema = import('./record-data-schemas').RelationshipSchema;
import { Dict } from './utils';

type Group = Snapshot[];

/**
  ## Overview

  In order to properly fetch and update data, EmberData
  needs to understand how to connect to your API.

  `Adapters` accept various kinds of requests from the store
  and manage fulfillment of the request from your API.

  ### Request Flow

  When the store decides it needs to issue a request it uses the
  following flow to manage the request and process the data.

  - find the appropriate adapter
  - issue the request to the adapter
  - await the adapter's response
    - if an error occurs reject with the error
    - if no error
      - if there is response data
        - pass the response data to the appropriate serializer
        - update the cache using the JSON:API formatted data from the serializer's response
      - return the primary record(s) associated with the request


  ### Implementing an Adapter

  // TODO

  ### Adapter Resolution

  `store.adapterFor(name)` will lookup adapters defined in
  `app/adapters/` and return an instance. If no adapter is found, an
  error will be thrown.

  `adapterFor` first attempts to find an adapter with an exact match on `name`,
  then falls back to checking for the presence of an adapter named `application`.

  ```ts
  store.adapterFor('author');

  // lookup paths (in order) =>
  //   app/adapters/author.js
  //   app/adapters/application.js
  ```

  Most requests in EmberData are made with respect to a particular `type` (or `modelName`)
  (e.g., "get me the full collection of **books**" or "get me the **employee** whose id is 37"). We
  refer to this as the **primary** resource `type`.

  Typically `adapterFor` will be used to find an adapter with a name matching that of the primary
  resource `type` for the request, falling back to the `application` adapter for those types that
  do not have a defined adapter. This is often described as a `per-model` or `per-type` strategy
  for defining adapters. However, because APIs rarely define endpoints per-type but rather
  per-API-version, this may not be a desired strategy.

  It is recommended that applications define only a single `application` adapter and serializer
  where possible.

  If you have multiple APIs and the per-type strategy is not viable, one strategy is to
  write an `application` adapter and serializer that make use of `options` to specify the desired
  format when making a request.

  ### Using an Adapter

  Any adapter in `app/adapters/` can be looked up by `name` using `store.adapterFor(name)`.

  ### Default Adapters

  Applications whose API's structure endpoint URLs *very close to* or *exactly* the **REST**
  or **JSON:API** convention, the `@ember-data/adapter` package contains implementations
  these applications can extend.

  Many applications will find writing their own adapter to be allow greater flexibility,
  customization, and maintenance than attempting to override methods in these adapters.

  @module @ember-data/adapter
  @main @ember-data/adapter
  @public
*/

/**
  The following documentation describes the methods an
  adapter should implement with descriptions around when an
  application might expect these methods to be called.

  Methods that are not required are marked as **optional**.

  @module @ember-data/adapter
  @class MinimumAdapterInterface
  @public
*/
interface Adapter {
  /**
   * `adapter.findRecord` takes a request for a resource of a given `type` and `id` combination
   * and should return a `Promise` which fulfills with data for a single resource matching that
   * `type` and `id`.
   *
   * The response will be fed to the associated serializer's `normalizeResponse` method with the
   * `requestType` set to `findRecord`.
   *
   * `adapter.findRecord` is called whenever the `store` needs to load, reload, or backgroundReload
   * the resource data for a given `type` and `id`.
   *
   * ⚠️ If the adapter's response resolves to a false-y value, the associated `serializer.normalizeResponse`
   * call will NOT be made. In this scenario you may need to do at least a minimum amount of response
   * processing within the adapter.
   *
   * @method findRecord
   * @public
   * @param {Store} store
   * @param {ModelSchema} schema
   * @param {String} id
   * @param {Snapshot} snapshot
   * @return {Promise} a promise resolving with resource data to feed to the associated serializer
   */
  findRecord(store: Store, schema: ModelSchema, id: string, snapshot: Snapshot): Promise<unknown>;

  /**
   * `adapter.findAll` takes a request for resources of a given `type` and should return
   *  a `Promise` which fulfills with a collection of resource data matching that `type`.
   *
   * The response will be fed to the associated serializer's `normalizeResponse` method
   *  with the `requestType` set to `findAll`.
   *
   * `adapter.findAll` is called whenever `store.findAll` is asked to reload or backgroundReload.
   * The records in the response are merged with the contents of the store. Existing records for
   * the `type` will not be removed.
   *
   * ⚠️ If the adapter's response resolves to a false-y value, the associated `serializer.normalizeResponse`
   * call will NOT be made. In this scenario you may need to do at least a minimum amount of response
   * processing within the adapter.
   *
   * @method findAll
   * @public
   * @param {Store} store
   * @param {ModelSchema} schema
   * @param {null} sinceToken This parameter is no longer used and will always be null.
   * @param {SnapshotRecordArray} snapshotRecordArray an object containing any passed in options,
   *  adapterOptions, and the ability to access a snapshot for each existing record of the type.
   * @return {Promise} a promise resolving with resource data to feed to the associated serializer
   */
  findAll(
    store: Store,
    schema: ModelSchema,
    sinceToken: null,
    snapshotRecordArray: SnapshotRecordArray
  ): Promise<unknown>;

  /**
   * `adapter.query` takes a request for resources of a given `type` and should return
   *  a `Promise` which fulfills with a collection of resource data matching that `type`.
   *
   * The response will be fed to the associated serializer's `normalizeResponse` method
   *  with the `requestType` set to `query`.
   *
   * `adapter.query` is called whenever `store.query` is called or a previous query result is
   * asked to reload.
   *
   * As with `findAll`, the records in the response are merged with the contents of the store.
   * Existing records for the `type` will not be removed. The key difference is in the result
   * returned by the `store`. For `findAll` the result is all known records of the `type`,
   * while for `query` it will only be the records returned from `adapter.query`.
   *
   * ⚠️ If the adapter's response resolves to a false-y value, the associated `serializer.normalizeResponse`
   * call will NOT be made. In this scenario you may need to do at least a minimum amount of response
   * processing within the adapter.
   *
   * @method query
   * @public
   * @param {Store} store
   * @param {ModelSchema} schema
   * @param {object} query
   * @param {AdapterPopulatedRecordArray} recordArray
   * @param {object} options
   * @return {Promise} a promise resolving with resource data to feed to the associated serializer
   */
  query(
    store: Store,
    schema: ModelSchema,
    query: Dict<any>,
    recordArray: AdapterPopulatedRecordArray,
    options: { adapterOptions?: any }
  ): Promise<unknown>;

  /**
   * `adapter.queryRecord` takes a request for resource of a given `type` and should return
   *  a `Promise` which fulfills with data for a single resource matching that `type`.
   *
   * The response will be fed to the associated serializer's `normalizeResponse` method
   *  with the `requestType` set to `queryRecord`.
   *
   * ⚠️ If the adapter's response resolves to a false-y value, the associated `serializer.normalizeResponse`
   * call will NOT be made. In this scenario you may need to do at least a minimum amount of response
   * processing within the adapter.
   *
   * @method queryRecord
   * @public
   * @param {Store} store
   * @param {ModelSchema} schema
   * @param query
   * @param options
   * @return {Promise} a promise resolving with resource data to feed to the associated serializer
   */
  queryRecord(store: Store, schema: ModelSchema, query: Dict<any>, options: { adapterOptions?: any }): Promise<unknown>;

  /**
   * `adapter.createRecord` takes a request to create a resource of a given `type` and should
   * return a `Promise` which fulfills with data for the newly created resource.
   *
   * The response will be fed to the associated serializer's `normalizeResponse` method
   *  with the `requestType` set to `createRecord`.
   *
   * ⚠️ If the adapter's response resolves to a false-y value, the associated `serializer.normalizeResponse`
   * call will NOT be made. In this scenario you may need to do at least a minimum amount of response
   * processing within the adapter.
   *
   * @param store
   * @param schema
   * @param snapshot
   * @return {Promise} a promise resolving with resource data to feed to the associated serializer
   */
  createRecord(store: Store, schema: ModelSchema, snapshot: Snapshot): Promise<unknown>;

  /**
   * `adapter.updateRecord` takes a request to update a resource of a given `type` and should
   * return a `Promise` which fulfills with the updated data for the resource.
   *
   * The response will be fed to the associated serializer's `normalizeResponse` method
   *  with the `requestType` set to `updateRecord`.
   *
   * ⚠️ If the adapter's response resolves to a false-y value, the associated `serializer.normalizeResponse`
   * call will NOT be made. In this scenario you may need to do at least a minimum amount of response
   * processing within the adapter.
   *
   * @param store
   * @param schema
   * @param snapshot
   */
  updateRecord(store: Store, schema: ModelSchema, snapshot: Snapshot): Promise<unknown>;

  /**
   * `adapter.deleteRecord` takes a request to delete a resource of a given `type` and
   * should return a `Promise` which resolves when that deletion is complete.
   *
   * Usually the response will be empty, but you may include additional updates in the
   * response.
   *
   * The response will be fed to the associated serializer's `normalizeResponse` method
   *  with the `requestType` set to `deleteRecord`.
   *
   * ⚠️ If the adapter's response resolves to a false-y value, the associated `serializer.normalizeResponse`
   * call will NOT be made. In this scenario you may need to do at least a minimum amount of response
   * processing within the adapter.
   *
   * @param store
   * @param schema
   * @param snapshot
   */
  deleteRecord(store: Store, schema: ModelSchema, snapshot: Snapshot): Promise<unknown>;

  /**
   *
   * The response will be fed to the associated serializer's `normalizeResponse` method
   *  with the `requestType` set to `findBelongsTo`.
   *
   * ⚠️ If the adapter's response resolves to a false-y value, the associated `serializer.normalizeResponse`
   * call will NOT be made. In this scenario you may need to do at least a minimum amount of response
   * processing within the adapter.
   *
   * @method findBelongsTo [OPTIONAL]
   * @public
   * @optional
   * @param {Store} store
   * @param {Snapshot} snapshot
   * @param {string} relatedLink
   * @param {object} relationship
   * @return {Promise} a promise resolving with resource data to feed to the associated serializer
   */
  findBelongsTo?(
    store: Store,
    snapshot: Snapshot,
    relatedLink: string,
    relationship: RelationshipSchema
  ): Promise<unknown>;

  /**
   *
   * The response will be fed to the associated serializer's `normalizeResponse` method
   *  with the `requestType` set to `findHasMany`.
   *
   * ⚠️ If the adapter's response resolves to a false-y value, the associated `serializer.normalizeResponse`
   * call will NOT be made. In this scenario you may need to do at least a minimum amount of response
   * processing within the adapter.
   *
   * @method findhasMany [OPTIONAL]
   * @public
   * @optional
   * @param {Store} store
   * @param {Snapshot} snapshot
   * @param {string} relatedLink
   * @param {object} relationship
   * @return {Promise} a promise resolving with resource data to feed to the associated serializer
   */
  findHasMany?(
    store: Store,
    snapshot: Snapshot,
    relatedLink: string,
    relationship: RelationshipSchema
  ): Promise<unknown>;

  /**
   *
   * The response will be fed to the associated serializer's `normalizeResponse` method
   *  with the `requestType` set to `findMany`.
   *
   * ⚠️ If the adapter's response resolves to a false-y value, the associated `serializer.normalizeResponse`
   * call will NOT be made. In this scenario you may need to do at least a minimum amount of response
   * processing within the adapter.
   *
   * @param store
   * @param schema
   * @param ids
   * @param snapshots
   */
  findMany?(store: Store, schema: ModelSchema, ids: string[], snapshots: Snapshot[]): Promise<unknown>;

  generateIdForRecord?(store: Store, modelName: string, properties: unknown): string;
  groupRecordsForFindMany?(store: Store, snapshots: Snapshot[]): Group[];

  shouldReloadRecord?(store: Store, snapshot: Snapshot): boolean;
  shouldReloadAll?(store: Store, snapshotArray: SnapshotRecordArray): boolean;
  shouldBackgroundReloadRecord?(store: Store, snapshot: Snapshot): boolean;
  shouldBackgroundReloadAll?(store: Store, snapshotArray: SnapshotRecordArray): boolean;

  coalesceFindRequests?: boolean;
}

export default Adapter;
