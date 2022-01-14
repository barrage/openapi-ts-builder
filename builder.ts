import * as types from "./types";
import * as fs from "fs";
import * as p from "path";
import * as yaml from "yaml";
import { v4 as uuidv4 } from "uuid";
import Optimizer from "./optimizer";

/**
 * Reads directory and returns paths to files within it.
 *
 * @param {string} dir
 * @return {string[]}
 */
async function readRecursive(dir: string): Promise<string[]> {
  if (dir[dir.length - 1] === "/" || dir[dir.length - 1] === "\\") {
    dir = dir.slice(0, dir.length - 1);
  }

  try {
    const stat = await fs.promises.stat(dir);

    if (!stat.isDirectory()) {
      return [];
    }
  } catch (error) {
    return [];
  }

  let files: string[] = [];

  for (const filename of await fs.promises.readdir(dir)) {
    if ([".", ".."].indexOf(filename) !== -1) {
      continue;
    }

    let prefix = "";

    if (process.platform === "win32") {
      // we need to know which operating system are we using
      prefix = "file://";
    }

    const s = await fs.promises.stat(`${prefix + dir}/${filename}`);

    if (s.isDirectory()) {
      files = files.concat(await readRecursive(p.resolve(dir, filename)));
    }
    else {
      const _p = p.parse(`${prefix + dir}/${filename}`);

      if ([".ts", ".js", ".mjs"].indexOf(_p.ext) !== -1) {
        files.push(`${prefix + dir}/${filename}`);
      }
    }
  }

  return files.flat().filter((item, i, arr) => arr.indexOf(item) === i);
}

interface Dirs {
  // components
  schemas?: string[];
  responses?: string[];
  parameters?: string[];
  examples?: string[];
  requestBodies?: string[];
  headers?: string[];
  securitySchemes?: string[];
  links?: string[];
  callbacks?: string[];

  // paths
  paths?: string[];

  // misc
  servers?: string[];
  tags?: string[];
  security?: string[];
}

export class Builder implements types.OpenAPIObject {
  private generated: boolean = false;
  private dirs: Dirs = {};
  components?: types.ComponentsObject;
  servers?: types.ServerObject[];
  tags?: types.TagObject[];
  security?: types.SecurityRequirementObject[];
  externalDocs?: types.ExternalDocumentationObject;

  constructor(
    public info: types.InfoObject,
    public openapi: string = "3.0.3",
    public paths: types.PathsObject = {}
  ) {}

  /**
   * Generates self with attached info
   *
   * @param {InfoObject} info
   * @returns {Builder}
   */
  static create(info: types.InfoObject): Builder {
    return new Builder(info);
  }

  /**
   * Generates the documentation from the provided parts
   * @returns {Promise<Builder>}
   */
  async generate(): Promise<Builder> {
    if (this.generated) {
      return this;
    }

    const actions = [];

    // Paths
    if (Array.isArray(this.dirs.paths)) {
      for (const dir of this.dirs.paths) {
        actions.push(this.readPaths(dir));
      }
    }

    // Misc
    if (Array.isArray(this.dirs.servers)) {
      for (const dir of this.dirs.servers) {
        actions.push(this.readServers(dir));
      }
    }

    if (Array.isArray(this.dirs.tags)) {
      for (const dir of this.dirs.tags) {
        actions.push(this.readTags(dir));
      }
    }

    if (Array.isArray(this.dirs.security)) {
      for (const dir of this.dirs.security) {
        actions.push(this.readSecurity(dir));
      }
    }

    // Components
    if (Array.isArray(this.dirs.schemas)) {
      for (const dir of this.dirs.schemas) {
        actions.push(this.readSchemas(dir));
      }
    }

    if (Array.isArray(this.dirs.responses)) {
      for (const dir of this.dirs.responses) {
        actions.push(this.readResponses(dir));
      }
    }

    if (Array.isArray(this.dirs.parameters)) {
      for (const dir of this.dirs.parameters) {
        actions.push(this.readParameters(dir));
      }
    }

    if (Array.isArray(this.dirs.examples)) {
      for (const dir of this.dirs.examples) {
        actions.push(this.readExamples(dir));
      }
    }

    if (Array.isArray(this.dirs.requestBodies)) {
      for (const dir of this.dirs.requestBodies) {
        actions.push(this.readRequestBodies(dir));
      }
    }

    if (Array.isArray(this.dirs.headers)) {
      for (const dir of this.dirs.headers) {
        actions.push(this.readHeaders(dir));
      }
    }

    if (Array.isArray(this.dirs.securitySchemes)) {
      for (const dir of this.dirs.securitySchemes) {
        actions.push(this.readSecuritySchemes(dir));
      }
    }

    if (Array.isArray(this.dirs.links)) {
      for (const dir of this.dirs.links) {
        actions.push(this.readLinks(dir));
      }
    }

    if (Array.isArray(this.dirs.callbacks)) {
      for (const dir of this.dirs.callbacks) {
        actions.push(this.readCallbacks(dir));
      }
    }

    await Promise.all(actions);

    this.generated = true;

    return new Optimizer(this).replace().cleanup().get() as Builder;
  }

  /**
   * Convert the object into JSON string
   *
   * @param {number} spaces
   * @returns {Promise<string>}
   */
  async toJson(spaces: number = 2): Promise<string> {
    return JSON.stringify(
      {
        ...(await this.generate()),
        dirs: undefined,
        generated: undefined,
      },
      null,
      spaces
    );
  }

  /**
   * Convert the object to YAML string
   *
   * @returns {Promise<string>}
   */
  async toYaml(): Promise<string> {
    return yaml.stringify(JSON.parse(await this.toJson(2)));
  }

  /**
   * Read the directory where all the servers are located
   *
   * @param {string} dir
   * @returns {void}
   */
  async readServers(dir: string): Promise<void> {
    if (this.generated) {
      return;
    }

    const dirs = await readRecursive(dir);
    const files = [];
    for (const path of dirs) {
      files.push(await import(path));
    }

    for (const file of files) {
      if (file.default) {
        this.addServer(file.default);
      }
    }
  }

  /**
   * Read the directory where all the tags are located
   *
   * @param {string} dir
   * @returns {void}
   */
  async readTags(dir: string): Promise<void> {
    if (this.generated) {
      return;
    }

    const dirs = await readRecursive(dir);
    const files = [];
    for (const path of dirs) {
      files.push(await import(path));
    }

    for (const file of files) {
      if (file.default) {
        this.addTag(file.default);
      }
    }
  }

  /**
   * Read the directory where all the security requirements are located
   *
   * @param {string} dir
   * @returns {void}
   */
  async readSecurity(dir: string): Promise<void> {
    if (this.generated) {
      return;
    }

    const dirs = await readRecursive(dir);
    const files = [];
    for (const path of dirs) {
      files.push(await import(path));
    }

    for (const file of files) {
      if (file.default) {
        this.addSecurity(file.default);
      }
    }
  }

  /**
   * Read the directory where all the schemas are located
   *
   * @param {string} dir
   * @returns {void}
   */
  async readSchemas(dir: string): Promise<void> {
    if (this.generated) {
      return;
    }

    const dirs = await readRecursive(dir);
    const files = [];
    for (const path of dirs) {
      files.push(await import(path));
    }

    for (const file of files) {
      if (file.default) {
        this.addSchema(file.default);
      }
    }
  }

  /**
   * Read the directory where all the responses are located
   *
   * @param {string} dir
   * @returns {void}
   */
  async readResponses(dir: string): Promise<void> {
    if (this.generated) {
      return;
    }

    const dirs = await readRecursive(dir);
    const files = [];
    for (const path of dirs) {
      files.push(await import(path));
    }

    for (const file of files) {
      if (file.default) {
        this.addResponse(file.default);
      }
    }
  }

  /**
   * Read the directory where all the parameters are located
   *
   * @param {string} dir
   * @returns {void}
   */
  async readParameters(dir: string): Promise<void> {
    if (this.generated) {
      return;
    }

    const dirs = await readRecursive(dir);
    const files = [];
    for (const path of dirs) {
      files.push(await import(path));
    }

    for (const file of files) {
      if (file.default) {
        this.addParameter(file.default);
      }
    }
  }

  /**
   * Read the directory where all the examples are located
   *
   * @param {string} dir
   * @returns {void}
   */
  async readExamples(dir: string): Promise<void> {
    if (this.generated) {
      return;
    }

    const dirs = await readRecursive(dir);
    const files = [];
    for (const path of dirs) {
      files.push(await import(path));
    }

    for (const file of files) {
      if (file.default) {
        this.addExample(file.default);
      }
    }
  }

  /**
   * Read the directory where all the request bodies are located
   *
   * @param {string} dir
   * @returns {void}
   */
  async readRequestBodies(dir: string): Promise<void> {
    if (this.generated) {
      return;
    }

    const dirs = await readRecursive(dir);
    const files = [];
    for (const path of dirs) {
      files.push(await import(path));
    }

    for (const file of files) {
      if (file.default) {
        this.addRequestBody(file.default);
      }
    }
  }

  /**
   * Read the directory where all the headers are located
   *
   * @param {string} dir
   * @returns {void}
   */
  async readHeaders(dir: string): Promise<void> {
    if (this.generated) {
      return;
    }

    const dirs = await readRecursive(dir);
    const files = [];
    for (const path of dirs) {
      files.push(await import(path));
    }

    for (const file of files) {
      if (file.default) {
        this.addHeader(file.default);
      }
    }
  }

  /**
   * Read the directory where all the security schemas are located
   *
   * @param {string} dir
   * @returns {void}
   */
  async readSecuritySchemes(dir: string): Promise<void> {
    if (this.generated) {
      return;
    }

    const dirs = await readRecursive(dir);
    const files = [];
    for (const path of dirs) {
      files.push(await import(path));
    }

    for (const file of files) {
      if (file.default) {
        this.addSecurityScheme(file.default);
      }
    }
  }

  /**
   * Read the directory where all the links are located
   *
   * @param {string} dir
   * @returns {void}
   */
  async readLinks(dir: string): Promise<void> {
    if (this.generated) {
      return;
    }

    const dirs = await readRecursive(dir);
    const files = [];
    for (const path of dirs) {
      files.push(await import(path));
    }

    for (const file of files) {
      if (file.default) {
        this.addLink(file.default);
      }
    }
  }

  /**
   * Read the directory where all the callbacks are located
   *
   * @param {string} dir
   * @returns {void}
   */
  async readCallbacks(dir: string): Promise<void> {
    if (this.generated) {
      return;
    }

    const dirs = await readRecursive(dir);
    const files = [];
    for (const path of dirs) {
      files.push(await import(path));
    }

    for (const file of files) {
      if (file.default) {
        this.addCallback(file.default);
      }
    }
  }

  /**
   * Read the directory where all the paths are located
   *
   * @param {string} dir
   * @returns {void}
   */
  async readPaths(dir: string): Promise<void> {
    if (this.generated) {
      return;
    }

    const dirs = await readRecursive(dir);
    const files = [];
    for (const path of dirs) {
      files.push(await import(path));
    }

    for (const file of files) {
      if (file.default) {
        this.addPath(file.default);
      }
    }
  }

  /**
   * Attaches path to schema object
   *
   * @param {types.PathItemObject} path
   * @returns
   */
  addPath(path: types.PathItemObject): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    if (!path.location) {
      throw new Error("Cannot add path object without a 'location' key.");
    }

    const location = path.location;

    this.paths[location] = { ...path, location: undefined };

    return this;
  }

  /**
   * Attaches server to schema object
   *
   * @param {types.ServerObject} server
   * @returns
   */
  addServer(server: types.ServerObject): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    if (!Array.isArray(this.servers)) {
      this.servers = [];
    }
    this.servers.push(server);

    return this;
  }

  /**
   * Attaches tag to schema object
   *
   * @param {types.TagObject} tag
   * @returns
   */
  addTag(tag: types.TagObject): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    if (!Array.isArray(this.tags)) {
      this.tags = [];
    }
    this.tags.push(tag);

    return this;
  }

  /**
   * Attaches security to schema object
   *
   * @param {types.SecurityRequirementObject} security
   * @returns
   */
  addSecurity(security: types.SecurityRequirementObject): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    if (!Array.isArray(this.security)) {
      this.security = [];
    }
    this.security.push(security);

    return this;
  }

  /**
   * Attaches external documentation to schema object
   *
   * @param {types.ExternalDocumentationObject} externalDocs
   * @returns
   */
  addExternalDocs(externalDocs: types.ExternalDocumentationObject): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    this.externalDocs = externalDocs;

    return this;
  }

  /**
   * Attaches schema object to the components
   *
   * @param {types.SchemaObject} path
   * @returns
   */
  addSchema(item: types.SchemaObject): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    if (!item.id) {
      throw new Error("Cannot add schema object without an 'id' key.");
    }

    const id = item.id;

    this.addComponentItem("schemas");

    // @ts-ignore - this item will exist after the previous call
    this.components.schemas[id] = { ...item, _id: uuidv4() };

    return this;
  }

  /**
   * Attaches response object to the components
   *
   * @param {types.ResponseObject} path
   * @returns
   */
  addResponse(item: types.ResponseObject): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    if (!item.id) {
      throw new Error("Cannot add response object without an 'id' key.");
    }

    const id = item.id;

    if (!id) {
      return this;
    }

    this.addComponentItem("responses");

    // @ts-ignore - this item will exist after the previous call
    this.components.responses[id] = { ...item, _id: uuidv4() };

    return this;
  }

  /**
   * Attaches parameter object to the components
   *
   * @param {types.ParameterObject} path
   * @returns
   */
  addParameter(item: types.ParameterObject): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    if (!item.id) {
      throw new Error("Cannot add parameter object without an 'id' key.");
    }

    const id = item.id;

    if (!id) {
      return this;
    }

    this.addComponentItem("parameters");

    // @ts-ignore - this item will exist after the previous call
    this.components.parameters[id] = { ...item, _id: uuidv4() };

    return this;
  }

  /**
   * Attaches example object to the components
   *
   * @param {types.ExampleObject} path
   * @returns
   */
  addExample(item: types.ExampleObject): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    if (!item.id) {
      throw new Error("Cannot add example object without an 'id' key.");
    }

    const id = item.id;

    this.addComponentItem("examples");

    // @ts-ignore - this item will exist after the previous call
    this.components.examples[id] = { ...item, _id: uuidv4() };

    return this;
  }

  /**
   * Attaches request body object to the components
   *
   * @param {types.RequestBodyObject} path
   * @returns
   */
  addRequestBody(item: types.RequestBodyObject): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    if (!item.id) {
      throw new Error("Cannot add request body object without an 'id' key.");
    }

    const id = item.id;

    this.addComponentItem("requestBodies");

    // @ts-ignore - this item will exist after the previous call
    this.components.requestBodies[id] = { ...item, _id: uuidv4() };

    return this;
  }

  /**
   * Attaches header object to the components
   *
   * @param {types.HeaderObject} path
   * @returns
   */
  addHeader(item: types.HeaderObject): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    if (!item.id) {
      throw new Error("Cannot add header object without an 'id' key.");
    }

    const id = item.id;

    this.addComponentItem("headers");

    // @ts-ignore - this item will exist after the previous call
    this.components.headers[id] = { ...item, _id: uuidv4() };

    return this;
  }

  /**
   * Attaches security schema object to the components
   *
   * @param {types.SecuritySchemeObject} path
   * @returns
   */
  addSecurityScheme(item: types.SecuritySchemeObject): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    if (!item.id) {
      throw new Error("Cannot add security schema object without an 'id' key.");
    }

    const id = item.id;

    this.addComponentItem("securitySchemes");

    // @ts-ignore - this item will exist after the previous call
    this.components.securitySchemes[id] = { ...item, _id: uuidv4() };

    return this;
  }

  /**
   * Attaches link object to the components
   *
   * @param {types.LinkObject} path
   * @returns
   */
  addLink(item: types.LinkObject): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    if (!item.id) {
      throw new Error("Cannot add link object without an 'id' key.");
    }

    const id = item.id;

    this.addComponentItem("links");

    // @ts-ignore - this item will exist after the previous call
    this.components.links[id] = { ...item, _id: uuidv4() };

    return this;
  }

  /**
   * Attaches callback object to the components
   *
   * @param {types.CallbackObject} path
   * @returns
   */
  addCallback(item: types.CallbackObject): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    if (!item.id) {
      throw new Error("Cannot add callback object without an 'id' key.");
    }

    const id = item.id;

    this.addComponentItem("callbacks");

    // @ts-ignore - this item will exist after the previous call
    this.components.callbacks[id] = { ...item, _id: uuidv4() };

    return this;
  }

  /**
   * Adds dir for components.
   *
   * @param {string} dir
   * @returns {this}
   */
  addComponentsDir(dir: string): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    const stat = fs.statSync(dir);

    if (!stat.isDirectory()) {
      throw new Error(
        `Provided components directory '${dir}' is not a directory`
      );
    }

    try {
      this.addDir("schemas", p.resolve(dir, "schemas"));
    } catch (e) {}
    try {
      this.addDir("responses", p.resolve(dir, "responses"));
    } catch (e) {}
    try {
      this.addDir("parameters", p.resolve(dir, "parameters"));
    } catch (e) {}
    try {
      this.addDir("examples", p.resolve(dir, "examples"));
    } catch (e) {}
    try {
      this.addDir("requestBodies", p.resolve(dir, "requestBodies"));
    } catch (e) {}
    try {
      this.addDir("requestBodies", p.resolve(dir, "request-bodies"));
    } catch (e) {}
    try {
      this.addDir("headers", p.resolve(dir, "headers"));
    } catch (e) {}
    try {
      this.addDir("securitySchemes", p.resolve(dir, "securitySchemes"));
    } catch (e) {}
    try {
      this.addDir("securitySchemes", p.resolve(dir, "securitySchemas"));
    } catch (e) {}
    try {
      this.addDir("securitySchemes", p.resolve(dir, "security-schemes"));
    } catch (e) {}
    try {
      this.addDir("securitySchemes", p.resolve(dir, "security-schemas"));
    } catch (e) {}
    try {
      this.addDir("links", p.resolve(dir, "links"));
    } catch (e) {}
    try {
      this.addDir("callbacks", p.resolve(dir, "callbacks"));
    } catch (e) {}

    return this;
  }

  /**
   * Adds paths directory
   *
   * @param {string} dir
   * @returns {this}
   */
  addPathsDir(dir: string): this {
    return this.addDir("paths", dir);
  }

  /**
   * Adds schemas directory
   *
   * @param {string} dir
   * @returns {this}
   */
  addSchemasDir(dir: string): this {
    return this.addDir("schemas", dir);
  }

  /**
   * Adds responses directory
   *
   * @param {string} dir
   * @returns {this}
   */
  addResponsesDir(dir: string): this {
    return this.addDir("responses", dir);
  }

  /**
   * Adds parameters directory
   *
   * @param {string} dir
   * @returns {this}
   */
  addParametersDir(dir: string): this {
    return this.addDir("parameters", dir);
  }

  /**
   * Adds examples directory
   *
   * @param {string} dir
   * @returns {this}
   */
  addExamplesDir(dir: string): this {
    return this.addDir("examples", dir);
  }

  /**
   * Adds request bodies directory
   *
   * @param {string} dir
   * @returns {this}
   */
  addRequestBodiesDir(dir: string): this {
    return this.addDir("requestBodies", dir);
  }

  /**
   * Adds headers directory
   *
   * @param {string} dir
   * @returns {this}
   */
  addHeadersDir(dir: string): this {
    return this.addDir("headers", dir);
  }

  /**
   * Adds security schemes directory
   *
   * @param {string} dir
   * @returns {this}
   */
  addSecuritySchemesDir(dir: string): this {
    return this.addDir("securitySchemes", dir);
  }

  /**
   * Adds links directory
   *
   * @param {string} dir
   * @returns {this}
   */
  addLinksDir(dir: string): this {
    return this.addDir("links", dir);
  }

  /**
   * Adds callbacks directory
   *
   * @param {string} dir
   * @returns {this}
   */
  addCallbacksDir(dir: string): this {
    return this.addDir("callbacks", dir);
  }

  /**
   * Adds dir for named components.
   *
   * @param {name} dir
   * @param {string} dir
   * @returns {this}
   */
  private addDir(name: string, dir: string): this {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    if (
      [
        "schemas",
        "responses",
        "parameters",
        "examples",
        "requestBodies",
        "headers",
        "securitySchemes",
        "links",
        "callbacks",
        "paths",
        "servers",
        "tags",
        "security",
      ].indexOf(name) === -1
    ) {
      throw new Error("Invalid component dir attempted to be created");
    }

    const stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
      throw new Error(`Provided ${name} directory '${dir}' is not a directory`);
    }

    // @ts-ignore
    if (!Array.isArray(this.dirs[name])) {
      // @ts-ignore
      this.dirs[name] = [];
    }

    // @ts-ignore
    this.dirs[name].push(dir);

    return this;
  }

  /**
   * Create component item object
   *
   * @param {string} name
   */
  private addComponentItem(name: string) {
    if (this.generated) {
      throw new Error("Cannot modify schema after it has been generated");
    }

    if (
      [
        "schemas",
        "responses",
        "parameters",
        "examples",
        "requestBodies",
        "headers",
        "securitySchemes",
        "links",
        "callbacks",
      ].indexOf(name) === -1
    ) {
      throw new Error("Invalid component item attempted to be created");
    }

    // @ts-ignore - this could potentially exist on this object
    if (typeof this.components !== "object" || this.components === null) {
      // @ts-ignore
      this.components = {};
    }

    if (
      // @ts-ignore - this could potentially exist on this object
      typeof this.components[name] !== "object" ||
      // @ts-ignore - this could potentially exist on this object
      this.components[name] === null
    ) {
      // @ts-ignore
      this.components[name] = {};
    }
  }
}
