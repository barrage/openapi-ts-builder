"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Builder = void 0;
const fs = __importStar(require("fs"));
const p = __importStar(require("path"));
const yaml = __importStar(require("yaml"));
const uuid_1 = require("uuid");
const optimizer_1 = __importDefault(require("./optimizer"));
/**
 * Reads directory and returns paths to files within it.
 *
 * @param {string} dir
 * @return {string[]}
 */
function readRecursive(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        if (dir[dir.length - 1] === "/" || dir[dir.length - 1] === "\\") {
            dir = dir.slice(0, dir.length - 1);
        }
        try {
            const stat = yield fs.promises.stat(dir);
            if (!stat.isDirectory()) {
                return [];
            }
        }
        catch (error) {
            return [];
        }
        let files = [];
        for (const filename of yield fs.promises.readdir(dir)) {
            if ([".", ".."].indexOf(filename) !== -1) {
                continue;
            }
            let prefix = "";
            if (process.platform === "win32") {
                // we need to know which operating system are we using
                prefix = "file://";
            }
            const s = yield fs.promises.stat(`${prefix + dir}/${filename}`);
            if (s.isDirectory()) {
                files = files.concat(yield readRecursive(p.resolve(dir, filename)));
            }
            else {
                const _p = p.parse(`${prefix + dir}/${filename}`);
                if ([".ts", ".js", ".mjs"].indexOf(_p.ext) !== -1) {
                    files.push(`${prefix + dir}/${filename}`);
                }
            }
        }
        return files.flat().filter((item, i, arr) => arr.indexOf(item) === i);
    });
}
class Builder {
    constructor(info, openapi = "3.0.3", paths = {}) {
        this.info = info;
        this.openapi = openapi;
        this.paths = paths;
        this.generated = false;
        this.dirs = {};
    }
    /**
     * Generates self with attached info
     *
     * @param {InfoObject} info
     * @returns {Builder}
     */
    static create(info) {
        return new Builder(info);
    }
    /**
     * Generates the documentation from the provided parts
     * @returns {Promise<Builder>}
     */
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield Promise.all(actions);
            this.generated = true;
            return new optimizer_1.default(this).replace().cleanup().get();
        });
    }
    /**
     * Convert the object into JSON string
     *
     * @param {number} spaces
     * @returns {Promise<string>}
     */
    toJson(spaces = 2) {
        return __awaiter(this, void 0, void 0, function* () {
            return JSON.stringify(Object.assign(Object.assign({}, (yield this.generate())), { dirs: undefined, generated: undefined }), null, spaces);
        });
    }
    /**
     * Convert the object to YAML string
     *
     * @returns {Promise<string>}
     */
    toYaml() {
        return __awaiter(this, void 0, void 0, function* () {
            return yaml.stringify(JSON.parse(yield this.toJson(2)));
        });
    }
    /**
     * Read the directory where all the servers are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readServers(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.generated) {
                return;
            }
            const dirs = yield readRecursive(dir);
            const files = [];
            for (const path of dirs) {
                files.push(yield Promise.resolve().then(() => __importStar(require(path))));
            }
            for (const file of files) {
                if (file.default) {
                    this.addServer(file.default);
                }
            }
        });
    }
    /**
     * Read the directory where all the tags are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readTags(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.generated) {
                return;
            }
            const dirs = yield readRecursive(dir);
            const files = [];
            for (const path of dirs) {
                files.push(yield Promise.resolve().then(() => __importStar(require(path))));
            }
            for (const file of files) {
                if (file.default) {
                    this.addTag(file.default);
                }
            }
        });
    }
    /**
     * Read the directory where all the security requirements are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readSecurity(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.generated) {
                return;
            }
            const dirs = yield readRecursive(dir);
            const files = [];
            for (const path of dirs) {
                files.push(yield Promise.resolve().then(() => __importStar(require(path))));
            }
            for (const file of files) {
                if (file.default) {
                    this.addSecurity(file.default);
                }
            }
        });
    }
    /**
     * Read the directory where all the schemas are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readSchemas(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.generated) {
                return;
            }
            const dirs = yield readRecursive(dir);
            const files = [];
            for (const path of dirs) {
                files.push(yield Promise.resolve().then(() => __importStar(require(path))));
            }
            for (const file of files) {
                if (file.default) {
                    this.addSchema(file.default);
                }
            }
        });
    }
    /**
     * Read the directory where all the responses are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readResponses(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.generated) {
                return;
            }
            const dirs = yield readRecursive(dir);
            const files = [];
            for (const path of dirs) {
                files.push(yield Promise.resolve().then(() => __importStar(require(path))));
            }
            for (const file of files) {
                if (file.default) {
                    this.addResponse(file.default);
                }
            }
        });
    }
    /**
     * Read the directory where all the parameters are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readParameters(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.generated) {
                return;
            }
            const dirs = yield readRecursive(dir);
            const files = [];
            for (const path of dirs) {
                files.push(yield Promise.resolve().then(() => __importStar(require(path))));
            }
            for (const file of files) {
                if (file.default) {
                    this.addParameter(file.default);
                }
            }
        });
    }
    /**
     * Read the directory where all the examples are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readExamples(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.generated) {
                return;
            }
            const dirs = yield readRecursive(dir);
            const files = [];
            for (const path of dirs) {
                files.push(yield Promise.resolve().then(() => __importStar(require(path))));
            }
            for (const file of files) {
                if (file.default) {
                    this.addExample(file.default);
                }
            }
        });
    }
    /**
     * Read the directory where all the request bodies are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readRequestBodies(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.generated) {
                return;
            }
            const dirs = yield readRecursive(dir);
            const files = [];
            for (const path of dirs) {
                files.push(yield Promise.resolve().then(() => __importStar(require(path))));
            }
            for (const file of files) {
                if (file.default) {
                    this.addRequestBody(file.default);
                }
            }
        });
    }
    /**
     * Read the directory where all the headers are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readHeaders(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.generated) {
                return;
            }
            const dirs = yield readRecursive(dir);
            const files = [];
            for (const path of dirs) {
                files.push(yield Promise.resolve().then(() => __importStar(require(path))));
            }
            for (const file of files) {
                if (file.default) {
                    this.addHeader(file.default);
                }
            }
        });
    }
    /**
     * Read the directory where all the security schemas are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readSecuritySchemes(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.generated) {
                return;
            }
            const dirs = yield readRecursive(dir);
            const files = [];
            for (const path of dirs) {
                files.push(yield Promise.resolve().then(() => __importStar(require(path))));
            }
            for (const file of files) {
                if (file.default) {
                    this.addSecurityScheme(file.default);
                }
            }
        });
    }
    /**
     * Read the directory where all the links are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readLinks(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.generated) {
                return;
            }
            const dirs = yield readRecursive(dir);
            const files = [];
            for (const path of dirs) {
                files.push(yield Promise.resolve().then(() => __importStar(require(path))));
            }
            for (const file of files) {
                if (file.default) {
                    this.addLink(file.default);
                }
            }
        });
    }
    /**
     * Read the directory where all the callbacks are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readCallbacks(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.generated) {
                return;
            }
            const dirs = yield readRecursive(dir);
            const files = [];
            for (const path of dirs) {
                files.push(yield Promise.resolve().then(() => __importStar(require(path))));
            }
            for (const file of files) {
                if (file.default) {
                    this.addCallback(file.default);
                }
            }
        });
    }
    /**
     * Read the directory where all the paths are located
     *
     * @param {string} dir
     * @returns {void}
     */
    readPaths(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.generated) {
                return;
            }
            const dirs = yield readRecursive(dir);
            const files = [];
            for (const path of dirs) {
                files.push(yield Promise.resolve().then(() => __importStar(require(path))));
            }
            for (const file of files) {
                if (file.default) {
                    this.addPath(file.default);
                }
            }
        });
    }
    /**
     * Attaches path to schema object
     *
     * @param {types.PathItemObject} path
     * @returns
     */
    addPath(path) {
        if (this.generated) {
            throw new Error("Cannot modify schema after it has been generated");
        }
        if (!path.location) {
            throw new Error("Cannot add path object without a 'location' key.");
        }
        const location = path.location;
        this.paths[location] = Object.assign(Object.assign({}, path), { location: undefined });
        return this;
    }
    /**
     * Attaches server to schema object
     *
     * @param {types.ServerObject} server
     * @returns
     */
    addServer(server) {
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
    addTag(tag) {
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
    addSecurity(security) {
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
    addExternalDocs(externalDocs) {
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
    addSchema(item) {
        if (this.generated) {
            throw new Error("Cannot modify schema after it has been generated");
        }
        if (!item.id) {
            throw new Error("Cannot add schema object without an 'id' key.");
        }
        const id = item.id;
        this.addComponentItem("schemas");
        // @ts-ignore - this item will exist after the previous call
        this.components.schemas[id] = Object.assign(Object.assign({}, item), { _id: (0, uuid_1.v4)() });
        return this;
    }
    /**
     * Attaches response object to the components
     *
     * @param {types.ResponseObject} path
     * @returns
     */
    addResponse(item) {
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
        this.components.responses[id] = Object.assign(Object.assign({}, item), { _id: (0, uuid_1.v4)() });
        return this;
    }
    /**
     * Attaches parameter object to the components
     *
     * @param {types.ParameterObject} path
     * @returns
     */
    addParameter(item) {
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
        this.components.parameters[id] = Object.assign(Object.assign({}, item), { _id: (0, uuid_1.v4)() });
        return this;
    }
    /**
     * Attaches example object to the components
     *
     * @param {types.ExampleObject} path
     * @returns
     */
    addExample(item) {
        if (this.generated) {
            throw new Error("Cannot modify schema after it has been generated");
        }
        if (!item.id) {
            throw new Error("Cannot add example object without an 'id' key.");
        }
        const id = item.id;
        this.addComponentItem("examples");
        // @ts-ignore - this item will exist after the previous call
        this.components.examples[id] = Object.assign(Object.assign({}, item), { _id: (0, uuid_1.v4)() });
        return this;
    }
    /**
     * Attaches request body object to the components
     *
     * @param {types.RequestBodyObject} path
     * @returns
     */
    addRequestBody(item) {
        if (this.generated) {
            throw new Error("Cannot modify schema after it has been generated");
        }
        if (!item.id) {
            throw new Error("Cannot add request body object without an 'id' key.");
        }
        const id = item.id;
        this.addComponentItem("requestBodies");
        // @ts-ignore - this item will exist after the previous call
        this.components.requestBodies[id] = Object.assign(Object.assign({}, item), { _id: (0, uuid_1.v4)() });
        return this;
    }
    /**
     * Attaches header object to the components
     *
     * @param {types.HeaderObject} path
     * @returns
     */
    addHeader(item) {
        if (this.generated) {
            throw new Error("Cannot modify schema after it has been generated");
        }
        if (!item.id) {
            throw new Error("Cannot add header object without an 'id' key.");
        }
        const id = item.id;
        this.addComponentItem("headers");
        // @ts-ignore - this item will exist after the previous call
        this.components.headers[id] = Object.assign(Object.assign({}, item), { _id: (0, uuid_1.v4)() });
        return this;
    }
    /**
     * Attaches security schema object to the components
     *
     * @param {types.SecuritySchemeObject} path
     * @returns
     */
    addSecurityScheme(item) {
        if (this.generated) {
            throw new Error("Cannot modify schema after it has been generated");
        }
        if (!item.id) {
            throw new Error("Cannot add security schema object without an 'id' key.");
        }
        const id = item.id;
        this.addComponentItem("securitySchemes");
        // @ts-ignore - this item will exist after the previous call
        this.components.securitySchemes[id] = Object.assign(Object.assign({}, item), { _id: (0, uuid_1.v4)() });
        return this;
    }
    /**
     * Attaches link object to the components
     *
     * @param {types.LinkObject} path
     * @returns
     */
    addLink(item) {
        if (this.generated) {
            throw new Error("Cannot modify schema after it has been generated");
        }
        if (!item.id) {
            throw new Error("Cannot add link object without an 'id' key.");
        }
        const id = item.id;
        this.addComponentItem("links");
        // @ts-ignore - this item will exist after the previous call
        this.components.links[id] = Object.assign(Object.assign({}, item), { _id: (0, uuid_1.v4)() });
        return this;
    }
    /**
     * Attaches callback object to the components
     *
     * @param {types.CallbackObject} path
     * @returns
     */
    addCallback(item) {
        if (this.generated) {
            throw new Error("Cannot modify schema after it has been generated");
        }
        if (!item.id) {
            throw new Error("Cannot add callback object without an 'id' key.");
        }
        const id = item.id;
        this.addComponentItem("callbacks");
        // @ts-ignore - this item will exist after the previous call
        this.components.callbacks[id] = Object.assign(Object.assign({}, item), { _id: (0, uuid_1.v4)() });
        return this;
    }
    /**
     * Adds dir for components.
     *
     * @param {string} dir
     * @returns {this}
     */
    addComponentsDir(dir) {
        if (this.generated) {
            throw new Error("Cannot modify schema after it has been generated");
        }
        const stat = fs.statSync(dir);
        if (!stat.isDirectory()) {
            throw new Error(`Provided components directory '${dir}' is not a directory`);
        }
        try {
            this.addDir("schemas", p.resolve(dir, "schemas"));
        }
        catch (e) { }
        try {
            this.addDir("responses", p.resolve(dir, "responses"));
        }
        catch (e) { }
        try {
            this.addDir("parameters", p.resolve(dir, "parameters"));
        }
        catch (e) { }
        try {
            this.addDir("examples", p.resolve(dir, "examples"));
        }
        catch (e) { }
        try {
            this.addDir("requestBodies", p.resolve(dir, "requestBodies"));
        }
        catch (e) { }
        try {
            this.addDir("requestBodies", p.resolve(dir, "request-bodies"));
        }
        catch (e) { }
        try {
            this.addDir("headers", p.resolve(dir, "headers"));
        }
        catch (e) { }
        try {
            this.addDir("securitySchemes", p.resolve(dir, "securitySchemes"));
        }
        catch (e) { }
        try {
            this.addDir("securitySchemes", p.resolve(dir, "securitySchemas"));
        }
        catch (e) { }
        try {
            this.addDir("securitySchemes", p.resolve(dir, "security-schemes"));
        }
        catch (e) { }
        try {
            this.addDir("securitySchemes", p.resolve(dir, "security-schemas"));
        }
        catch (e) { }
        try {
            this.addDir("links", p.resolve(dir, "links"));
        }
        catch (e) { }
        try {
            this.addDir("callbacks", p.resolve(dir, "callbacks"));
        }
        catch (e) { }
        return this;
    }
    /**
     * Adds paths directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addPathsDir(dir) {
        return this.addDir("paths", dir);
    }
    /**
     * Adds schemas directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addSchemasDir(dir) {
        return this.addDir("schemas", dir);
    }
    /**
     * Adds responses directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addResponsesDir(dir) {
        return this.addDir("responses", dir);
    }
    /**
     * Adds parameters directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addParametersDir(dir) {
        return this.addDir("parameters", dir);
    }
    /**
     * Adds examples directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addExamplesDir(dir) {
        return this.addDir("examples", dir);
    }
    /**
     * Adds request bodies directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addRequestBodiesDir(dir) {
        return this.addDir("requestBodies", dir);
    }
    /**
     * Adds headers directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addHeadersDir(dir) {
        return this.addDir("headers", dir);
    }
    /**
     * Adds security schemes directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addSecuritySchemesDir(dir) {
        return this.addDir("securitySchemes", dir);
    }
    /**
     * Adds links directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addLinksDir(dir) {
        return this.addDir("links", dir);
    }
    /**
     * Adds callbacks directory
     *
     * @param {string} dir
     * @returns {this}
     */
    addCallbacksDir(dir) {
        return this.addDir("callbacks", dir);
    }
    /**
     * Adds dir for named components.
     *
     * @param {name} dir
     * @param {string} dir
     * @returns {this}
     */
    addDir(name, dir) {
        if (this.generated) {
            throw new Error("Cannot modify schema after it has been generated");
        }
        if ([
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
        ].indexOf(name) === -1) {
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
    addComponentItem(name) {
        if (this.generated) {
            throw new Error("Cannot modify schema after it has been generated");
        }
        if ([
            "schemas",
            "responses",
            "parameters",
            "examples",
            "requestBodies",
            "headers",
            "securitySchemes",
            "links",
            "callbacks",
        ].indexOf(name) === -1) {
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
            this.components[name] === null) {
            // @ts-ignore
            this.components[name] = {};
        }
    }
}
exports.Builder = Builder;
