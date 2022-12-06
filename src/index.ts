import { Payload } from "payload";
import { Options } from "payload/dist/collections/operations/local/create";
import { DocWithId, ObjectDataSource, PayloadDataSourceConfig } from "./types/datasource";

/**
 * fetchAll() for accounts, players, and help
 * should return an Object, with each key representing
 * their respective entity by id.
 */
export class PayloadObjectDatasource<T extends Record<string, unknown>> implements ObjectDataSource<T> {
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
    const results = await payload.find<DocWithId<T>>({
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
    const result = await payload.find<DocWithId<T>>({
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
    const results = await payload.find<DocWithId<T>>({
      collection,
      pagination: false, // Return all docs
    });

    const fetched: Record<string, T> = {};
    const { idProperty = 'id' } = config;
    for (const doc of results.docs) {
      // Forgive me for I have sinned
      const id = doc[idProperty as 'id'];
      fetched[id] = doc;
    }

    return fetched;
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

    const post = await payload.create({
      collection, // required
      data: updated,
    });

    // tslint:disable-next-line:no-console
    console.log('[payload][update] Posted ', post);
  }
}
