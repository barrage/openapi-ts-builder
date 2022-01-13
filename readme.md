# Openapi Typescript Builder

Builder that will allow you to write your Openapi 3.0.x specs as a Typescript files.
You can import them and work with them as with regular Typescript files and will then compile
into YAML or JSON with all the `$ref` create automatically pointing to schema objects or responses, or whatever.

Referencing files outside of your specs is possible with native YAML or JSON Openapi specs, but it's not good enoguh
when you start working on a large project where you might have many paths and objects so we came up with this
helper that keeps our specs clean and automatically takes care of it compiling into a valid Openapi schema file.

## Usage

Create a base file that will represent you main Openapi entrypoint:

```typescript
// petstore.ts
import { Builder } from "openapi-ts-builder";
import * as path from "path";

export default Builder.create({
  title: "Swagger Petstore",
  version: "1.0.0",
  license: {
    name: "MIT",
  },
})
  .addServer({
    url: "http://petstore.swagger.io/v1",
  })
  .addPathsDir(path.resolve(__dirname, "paths"))
  .addComponentsDir(path.resolve(__dirname, "components"));
```

Define basic information about your specs and give it locations of directory that will hold all your paths and components.

For simpler specs you can directly load the items inside the same file, but that beats the purpose of this builder.

## Components objects

As you can notice from the example below, we have added the `id` field which doesn't exist in Openapi specs but it allows
this builder to aggregate all the schema files properly in the finalized YAML or JSON file it exports. It won't be present
in the finished export.

```typescript
// components/schemas/Pet.ts
import { SchemaObject } from "openapi-ts-builder/types";

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
```

### Default directory structure for components

When you define the `components` directory the builder will assume the following:

```
components/
    schemas/
    responses/
    parameters/
    examples/
    requestBodies/ | request-bodies/
    headers/
    securitySchemes/ | security-schemes/ | securitySchemas/ | security-schemas/
    links/
    callbacks/
```

If your structure is different then this, you can add each components directory individually (check the Builder class for more info).

## Path files

As you can notice below, we have added the `location` key in the `PathItemObject` that defines the actual `path` on your API of that path.
Paths without it will not be loaded and you'll get an error.

```typescript
// paths/PetsPetId.ts
import { PathItemObject } from "openapi-ts-builder/types";
import Pet from "../components/schemas/Pet";
import Error from "../components/schemas/Error";

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
```

# Generating the specs document

We have also provided a bin that will assist you to easily convert your specs into YAML or JSON files.

```shell
~$ openapi-ts-builder --help
Usage: openapi-ts-builder [options] input-file.ts [output-file.yaml]
       openapi-ts-builder --generate /path/to/desired/specs/dir

Options:
  --help                        Displays this screen
  --generate                    helps you generate starting point for writing your spes
  --format=yaml|json            Defaults to yaml, lets the builder know what format to export
  --dry-run                     Doesn't create a file, only prints it out in the console
```

# Example

For a working example of the implementation please check out the `test/` directory of this repository.

# Credits

Credits for the types we have added here goes to the great folks who created https://github.com/metadevpro/openapi3-ts
They did all the work with defining types, they have also created their own builder, but it didn't fit our needs so we created this.
