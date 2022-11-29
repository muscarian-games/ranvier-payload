type DataSourceType = ArrayDataSource | ObjectDataSource;
export type PayloadDataSourceConfig = {
  collection: string;
};

export type DocWithId<T> = T & { id: string; }

export interface ArrayDataSource<T = unknown> extends BaseDataSource<T> {
  fetchAll(config: PayloadDataSourceConfig): T[];
}

export interface ObjectDataSource<T = unknown> extends BaseDataSource<T> {
  fetchAll(config: PayloadDataSourceConfig): Record<string, T>;
}

export interface DataSourceConstructor {
  new (config: PayloadDataSourceConfig, rootPath: string): DataSourceType
}

interface BaseDataSource<T = unknown> {
  constructor(config: PayloadDataSourceConfig, rootPath: string);

  fetch(): Promise<T>;
  hasData(config: PayloadDataSourceConfig): Promise<boolean>;
  update(config: PayloadDataSourceConfig, data: T): Promise<undefined>;

  // Unimplemented in Payload datasources:
  // replace(config: PayloadDataSourceConfig, data: T): Promise<undefined>;
}
