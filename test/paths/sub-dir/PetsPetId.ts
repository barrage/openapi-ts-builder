import { PathItemObject } from "../../../types";
import Pet from "../../components/schemas/Pet";
import Error from "../../components/schemas/Error";

export default {
  location: "/pets/{petId}",
  get: {
    summary: "Info for a specific pet",
    operationId: "showPetById",
    tags: ["pets"],
    parameters: [
      {
        name: "petId",
        in: "path",
        required: true,
        description: "The id of the pet to retrieve",
        schema: {
          type: "string",
        },
      },
    ],
    responses: {
      "200": {
        description: "Expected response to a valid request",
        content: {
          "application/json": {
            schema: Pet,
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
} as PathItemObject;
