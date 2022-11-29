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

  async fetchAll(config) {
    const payload = await this.getPayload();
    const { collection } = config;
    const results = await payload.find<DocWithId<T>>({
      collection,
      pagination: false, // Return all docs
    });

    // TODO: Set the id property in config (could be uuid for some collections, entityReference, etc.):
    const fetched: Record<string, T> = {};
    for (const doc of results.docs) {
      fetched[doc.id] = doc;
    }

    return fetched;
  }
}
