import * as types from "./types";
export declare class Builder implements types.OpenAPIObject {
    info: types.InfoObject;
    openapi: string;
    paths: types.PathsObject;
    private generated;
    private dirs;
    components?: types.ComponentsObject;
    servers?: types.ServerObject[];
    tags?: types.TagObject[];
    security?: types.SecurityRequirementObject[];
    externalDocs?: types.ExternalDocumentationObject;
    constructor(info: types.InfoObject, openapi?: string, paths?: types.PathsObject);
    /**
     * Generates self with attached info
     *
     * @param {InfoObject} info
     * @returns {Builder}
     */
    static create(info: types.InfoObject): Builder;
    /**
     * Generates the documentation from the provided parts
     * @returns {Promise<Builder>}
     */
    generate(): Promise<Builder>;
    /**
     * Convert the object into JSON string
     *
     * @param {number} spaces
     * @returns {Promise<string>}
     */
    toJson(spaces?: number): Promise<string>;
    /**
     * Convert the object to YAML string
     *
     * @returns {Promise<string>}
     */
    toYaml(): Promise<string>;
    /**
     * Read the directory where all the servers are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readServers(dir: string): Promise<void>;
    /**
     * Read the directory where all the tags are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readTags(dir: string): Promise<void>;
    /**
     * Read the directory where all the security requirements are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readSecurity(dir: string): Promise<void>;
    /**
     * Read the directory where all the schemas are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readSchemas(dir: string): Promise<void>;
    /**
     * Read the directory where all the responses are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readResponses(dir: string): Promise<void>;
    /**
     * Read the directory where all the parameters are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readParameters(dir: string): Promise<void>;
    /**
     * Read the directory where all the examples are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readExamples(dir: string): Promise<void>;
    /**
     * Read the directory where all the request bodies are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readRequestBodies(dir: string): Promise<void>;
    /**
     * Read the directory where all the headers are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readHeaders(dir: string): Promise<void>;
    /**
     * Read the directory where all the security schemas are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readSecuritySchemes(dir: string): Promise<void>;
    /**
     * Read the directory where all the links are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readLinks(dir: string): Promise<void>;
    /**
     * Read the directory where all the callbacks are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readCallbacks(dir: string): Promise<void>;
    /**
     * Read the directory where all the paths are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readPaths(dir: string): Promise<void>;
    /**
     * Attaches path to schema object
     *
     * @param {types.PathItemObject} path
     * @returns
     */
    addPath(path: types.PathItemObject): this;
    /**
     * Attaches server to schema object
     *
     * @param {types.ServerObject} server
     * @returns
     */
    addServer(server: types.ServerObject): this;
    /**
     * Attaches tag to schema object
     *
     * @param {types.TagObject} tag
     * @returns
     */
    addTag(tag: types.TagObject): this;
    /**
     * Attaches security to schema object
     *
     * @param {types.SecurityRequirementObject} security
     * @returns
     */
    addSecurity(security: types.SecurityRequirementObject): this;
    /**
     * Attaches external documentation to schema object
     *
     * @param {types.ExternalDocumentationObject} externalDocs
     * @returns
     */
    addExternalDocs(externalDocs: types.ExternalDocumentationObject): this;
    /**
     * Attaches schema object to the components
     *
     * @param {types.SchemaObject} path
     * @returns
     */
    addSchema(item: types.SchemaObject): this;
    /**
     * Attaches response object to the components
     *
     * @param {types.ResponseObject} path
     * @returns
     */
    addResponse(item: types.ResponseObject): this;
    /**
     * Attaches parameter object to the components
     *
     * @param {types.ParameterObject} path
     * @returns
     */
    addParameter(item: types.ParameterObject): this;
    /**
     * Attaches example object to the components
     *
     * @param {types.ExampleObject} path
     * @returns
     */
    addExample(item: types.ExampleObject): this;
    /**
     * Attaches request body object to the components
     *
     * @param {types.RequestBodyObject} path
     * @returns
     */
    addRequestBody(item: types.RequestBodyObject): this;
    /**
     * Attaches header object to the components
     *
     * @param {types.HeaderObject} path
     * @returns
     */
    addHeader(item: types.HeaderObject): this;
    /**
     * Attaches security schema object to the components
     *
     * @param {types.SecuritySchemeObject} path
     * @returns
     */
    addSecurityScheme(item: types.SecuritySchemeObject): this;
    /**
     * Attaches link object to the components
     *
     * @param {types.LinkObject} path
     * @returns
     */
    addLink(item: types.LinkObject): this;
    /**
     * Attaches callback object to the components
     *
     * @param {types.CallbackObject} path
     * @returns
     */
    addCallback(item: types.CallbackObject): this;
    /**
     * Adds dir for components.
     *
     * @param {string} dir
     * @returns {this}
     */
    addComponentsDir(dir: string): this;
    /**
     * Adds paths directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addPathsDir(dir: string): this;
    /**
     * Adds schemas directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addSchemasDir(dir: string): this;
    /**
     * Adds responses directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addResponsesDir(dir: string): this;
    /**
     * Adds parameters directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addParametersDir(dir: string): this;
    /**
     * Adds examples directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addExamplesDir(dir: string): this;
    /**
     * Adds request bodies directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addRequestBodiesDir(dir: string): this;
    /**
     * Adds headers directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addHeadersDir(dir: string): this;
    /**
     * Adds security schemes directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addSecuritySchemesDir(dir: string): this;
    /**
     * Adds links directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addLinksDir(dir: string): this;
    /**
     * Adds callbacks directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addCallbacksDir(dir: string): this;
    /**
     * Adds dir for named components.
     *
     * @param {name} dir
     * @param {string} dir
     * @returns {this}
     */
    private addDir;
    /**
     * Create component item object
     *
     * @param {string} name
     */
    private addComponentItem;
}
