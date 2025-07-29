export type FieldSchema = {
  name: string;
  bits: bigint;
};

export type FieldInfo = {
  bits: bigint;
  shift: bigint;
};

export type SchemaDefinition = FieldSchema[];
