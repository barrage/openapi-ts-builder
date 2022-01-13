import { PathItemObject } from "../../types";
import Error from "../components/schemas/Error";
import Pets from "../components/schemas/Pets";

export default {
  location: "/pets",
  get: {
    summary: "List all pets",
    operationId: "listPets",
    tags: ["pets"],
    parameters: [
      {
        name: "limit",
        in: "query",
        description: "How many items to return at one time (max 100)",
        required: false,
        schema: {
          type: "integer",
          format: "int32",
        },
      },
    ],
    responses: {
      "200": {
        description: "A paged array of pets",
        headers: {
          "x-next": {
            description: "A link to the next page of responses",
            schema: {
              type: "string",
            },
          },
        },
        content: {
          "application/json": {
            schema: Pets,
          },
        },
      },
      default: {
        description: "unexpected error",
        content: {
          "application/json": {
            schema: Error,
          },
        },
      },
    },
  },
  post: {
    summary: "Create a pet",
    operationId: "createPets",
    tags: ["pets"],
    responses: {
      "201": {
        description: "Null response",
      },
      default: {
        description: "unexpected error",
        content: {
          "application/json": {
            schema: Error,
          },
        },
      },
    },
  },
} as PathItemObject;
