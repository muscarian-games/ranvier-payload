import { Payload } from "payload";
import { Options } from "payload/dist/collections/operations/local/create";
import { ArrayDataSource, DocWithId, PayloadDataSourceConfig } from "./types/datasource";

export class PayloadArrayDatasource<T extends string | symbol | number> implements ArrayDataSource<T> {
  config: PayloadDataSourceConfig;
  rootPath: string;

  constructor(config: PayloadDataSourceConfig, rootPath: string) {
    this.config = config;
    this.rootPath = rootPath;
  }

  /**
   * Get Payload for local API usage after initialization.
   */
  async getPayload() {
    return import('payload') as unknown as Payload;
  }

  /**
   * Ensure that the collection exists and has at least one doc.
   */
  async hasData(config: PayloadDataSourceConfig) {
    const payload = await this.getPayload();
    const { collection } = config;
    const results = await payload.find({
      collection,
      limit: 1, // Return one doc at most since we only need to have one to have data!
    });

    return Boolean(results.docs.length);
  }

  /**
   * Fetch from collection where `id == idProperty`
   * `idProperty` should be a property on the document that is unique
   * and defaults to `'id'`
   */
  async fetch(config: PayloadDataSourceConfig, id: string) {
    const payload = await this.getPayload();
    const { collection, idProperty = 'id' } = config;

    // equivalent to `SELECT * FROM collection WHERE idProperty = id` in SQL
    const query = {
      [idProperty]: {
        equals: id,
      }
    };

    // tslint:disable-next-line:no-console
    console.log('[payload][fetch] Searching for ', idProperty, id, collection);
    const result = await payload.find({
      collection,
      where: query
    });

    if (!result.docs.length) {
      throw new Error(`Nothing found in collection '${collection }'with ID ${idProperty}: ${id}`);
    }

    // tslint:disable-next-line:no-console
    console.log('[payload][fetch] Found ', idProperty, id, collection, result.docs.length);

    return result.docs[0] as T;
  }

  async fetchAll(config: PayloadDataSourceConfig) {
    const payload = await this.getPayload();
    const { collection } = config;
    const results = await payload.find({
      collection,
      pagination: false, // Return all docs
    });

    return results.docs;
  }

  async update(config: PayloadDataSourceConfig, id: string, data: Options<T>['data']) {
    const payload = await this.getPayload();
    const { collection, idProperty = 'id' } = config;
    const updated = {
      ...data,
      // Set 'id' field to same as id property rather than using a mongo id.
      // For this to work I think you also need to specify an id field of type 'text'.
      [idProperty]: id,
      id,
    };

    let exists: any;
    try {
      exists = await payload.findByID({
        id,
        collection
      });
    } catch(e) {
    // tslint:disable-next-line:no-console
      console.error(`[payload][update] Exception while checking for existence of ${idProperty}: ${id} in ${collection}: `, e);
    }

    let taskPromise;
    if (!exists) {
      taskPromise = payload.create({
        collection, // required
        data: updated,
      });
    } else {
      taskPromise = payload.update({
        collection,
        data: updated,
        id,
      });
    }

    taskPromise
      .then(() => {
        const verb = exists ? 'update' : 'create';
        // tslint:disable-next-line:no-console
        console.log(`[payload][update] Successfully ${verb}d ${idProperty}: ${id} in ${collection}`);
      })
      .catch((e) => {
        // tslint:disable-next-line:no-console
        console.error(`[payload][update] Exception while ${exists ? 'updating' : 'creating'} ${idProperty}: ${id} in ${collection}: `, e);
      });
  }
}