const OpenAPISchemaValidator = require("openapi-schema-validator").default;
const openAPIValidator = new OpenAPISchemaValidator({
  version: 3,
});

const fs = require("fs");
const path = require("path");

const main = async () => {
  // read the schema details
  const schemaFilepath = path.join(__dirname, "openapi.json");
  const schema = JSON.parse(fs.readFileSync(schemaFilepath, "utf-8"));

  const res = openAPIValidator.validate(schema);
  if (res.errors.length) {
    console.error(res.errors);
    process.exit(1);
  } else {
      console.log("Schema is valid");
      process.exit(0);
  }
};

main();
