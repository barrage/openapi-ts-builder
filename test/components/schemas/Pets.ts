import { SchemaObject } from "../../../dist/types";
import Pet from "./Pet";

export default {
    id: "Pets",
    type: "array",
    items: Pet,
} as SchemaObject;