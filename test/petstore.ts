import { Builder } from "../dist/builder";
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
