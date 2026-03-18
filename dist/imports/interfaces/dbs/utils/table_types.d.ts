export interface TableSchema {
    name: string;
    creationQuery: string;
    indexes: string[];
    description: string;
    dependsOn: any;
}
export type TableRegistry = Record<string, TableSchema>;
