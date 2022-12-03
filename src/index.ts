import { Payload } from "payload";
import { DocWithId, ObjectDataSource, PayloadDataSourceConfig } from "./types/datasource";

/**
 * fetchAll() for accounts, players, and help 
 * should return an Object, with each key representing 
 * their respective entity by id.
 */
export class PayloadObjectDatasource<T> implements ObjectDataSource<T> {
  config: PayloadDataSourceConfig;
  rootPath: string;

  constructor(config: PayloadDataSourceConfig, rootPath: string) {
    this.config = config;
    this.rootPath = rootPath;
  }

  async getPayload() {
    return import('payload') as unknown as Payload;
  }

  async hasData(config: PayloadDataSourceConfig) {
    const payload = await this.getPayload();
    const { collection } = config;
    const results = await payload.find<DocWithId<T>>({
      collection,
      limit: 1, // Return one doc at most since we only need to have one to have data!
    });

    return Boolean(results.docs.length);
  }

  async fetch(config: PayloadDataSourceConfig, id: string) {
    const payload = await this.getPayload();
    const { collection } = config;
    console.log('[payload][fetch] Searching for ', id, collection);
    const result = await payload.findByID<DocWithId<T>>({
      collection,
      id, //TODO: may need to use "where" query instead + entityref? needs to be unique though.
    });

    if (!result) {
      console.log('')
    }

    return result;
  }

  async fetchAll(config: PayloadDataSourceConfig) {
    const payload = await this.getPayload();
    const { collection } = config;
    const results = await payload.find<DocWithId<T>>({
      collection,
      pagination: false, // Return all docs
    });

    // TODO: Set the id property in config (could be uuid for some collections, entityReference, etc.):
    const fetched: Record<string, T> = {};
    const { idProperty = 'id' } = config;
    for (const doc of results.docs) {
      fetched[doc.id] = doc;
    }

    return fetched;
  }
}
