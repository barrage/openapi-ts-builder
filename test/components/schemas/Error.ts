import { SchemaObject } from "../../../dist/types";

export default {
  id: "Error",
  type: "object",
  required: ["code", "message"],
  properties: {
    code: {
      type: "integer",
      format: "int32",
    },
    message: {
      type: "string",
    },
  },
} as SchemaObject;
