import { SchemaObject } from "../../../dist/types";

export default {
  id: "Pet",
  type: "object",
  required: ["id", "name"],
  properties: {
    id: {
      type: "integer",
      format: "int64",
    },
    name: {
      type: "string",
    },
    tag: {
      type: "string",
    },
  },
} as SchemaObject;
