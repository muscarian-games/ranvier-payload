export type DataSourceType<T extends string | symbol | number> = ArrayDataSource<T> | ObjectDataSource<T>;
export type PayloadDataSourceConfig = {
  collection: string;
  idProperty?: string;
};

export type DocWithId<T> = T & { id: string; }

export interface ArrayDataSource<T extends string | symbol | number> extends BaseDataSource<T> {
  fetchAll(config: PayloadDataSourceConfig): Promise<T[]>;
}

export interface ObjectDataSource<T extends string | symbol | number> extends BaseDataSource<T> {
  fetchAll(config: PayloadDataSourceConfig): Promise<Record<string, T>>;
}

interface BaseDataSource<T extends string | symbol | number> {
  fetch(config: PayloadDataSourceConfig, id: string): Promise<T>;
  hasData(config: PayloadDataSourceConfig): Promise<boolean>;
  update?(config: PayloadDataSourceConfig, id: string, data: T): Promise<void>;

  // Unimplemented in Payload datasources:
  // replace(config: PayloadDataSourceConfig, data: T): Promise<undefined>;
}
