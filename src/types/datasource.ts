export type DataSourceType = ArrayDataSource | ObjectDataSource;
export type PayloadDataSourceConfig = {
  collection: string;
  idProperty?: string;
};

export type DocWithId<T> = T & { id: string; }

export interface ArrayDataSource<T extends Record<string, unknown> = Record<string, unknown>> extends BaseDataSource<T> {
  fetchAll(config: PayloadDataSourceConfig): Promise<T[]>;
}

export interface ObjectDataSource<T extends Record<string, unknown> = Record<string, unknown>> extends BaseDataSource<T> {
  fetchAll(config: PayloadDataSourceConfig): Promise<Record<string, T>>;
}

interface BaseDataSource<T extends Record<string, unknown> = Record<string, unknown>> {
  fetch(config: PayloadDataSourceConfig, id: string): Promise<T>;
  hasData(config: PayloadDataSourceConfig): Promise<boolean>;
  update?(config: PayloadDataSourceConfig, data: T): Promise<void>;

  // Unimplemented in Payload datasources:
  // replace(config: PayloadDataSourceConfig, data: T): Promise<undefined>;
}
