import { Builder } from "openapi-ts-builder";
import * as path from "path";

export default Builder.create({
  title: "Specs title",
  version: "1.0.0",
  license: {
    name: "MIT",
  },
})
  .addPathsDir(path.resolve(__dirname, "paths"))
  .addComponentsDir(path.resolve(__dirname, "components"));
