"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RecursiveReplacer {
    constructor(forReplace, id, _id, ref) {
        this.forReplace = forReplace;
        this.id = id;
        this._id = _id;
        this.ref = ref;
    }
    run() {
        for (const key in this.forReplace) {
            if (this.forReplace[key] &&
                typeof this.forReplace[key] === "object" &&
                !this.forReplace[key]["$ref"]) {
                if (this.forReplace[key].id &&
                    this.forReplace[key].id === this.id &&
                    this.forReplace[key]._id !== this._id) {
                    this.forReplace[key] = this.ref;
                }
                else {
                    new RecursiveReplacer(this.forReplace[key], this.id, this._id, this.ref).run();
                }
            }
        }
    }
}
class RecursiveCleaner {
    constructor(forClean) {
        this.forClean = forClean;
    }
    run() {
        if (typeof this.forClean.id === "string") {
            this.forClean.id = undefined;
        }
        if (typeof this.forClean._id === "string") {
            this.forClean._id = undefined;
        }
        for (const key in this.forClean) {
            if (this.forClean[key] && typeof this.forClean[key] === "object") {
                new RecursiveCleaner(this.forClean[key]).run();
            }
        }
    }
}
class Optimizer {
    constructor(builder) {
        this.builder = builder;
        this.replaced = [];
        this.cleaned = [];
    }
    /**
     * Replaces all occurences of component items in the whole builder object
     *
     * @returns {Optimizer}
     */
    replace() {
        this.replacer("schemas");
        this.replacer("responses");
        this.replacer("parameters");
        this.replacer("examples");
        this.replacer("requestBodies");
        this.replacer("headers");
        this.replacer("securitySchemes");
        this.replacer("links");
        this.replacer("callbacks");
        return this;
    }
    /**
     * Removes all the _id and id markings from all the objects.
     */
    cleanup() {
        for (const key in this.builder) {
            if (this.builder[key] && typeof this.builder[key] === "object") {
                new RecursiveCleaner(this.builder).run();
            }
        }
        return this;
    }
    /**
     * Return the builder back
     * @returns {OpenAPIObject}
     */
    get() {
        return this.builder;
    }
    /**
     * Runner that will run the replacement recursively through RecursiveReplacer for given
     * component object.
     *
     * @param {string} name
     * @returns {void}
     */
    replacer(name) {
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
            throw new Error("Invalid component item attempted to be replaced");
        }
        if (!this.builder.components || !this.builder.components[name]) {
            return;
        }
        let item = null;
        let ID = null;
        let _id = null;
        let ref = null;
        for (const id in this.builder.components[name]) {
            if (item) {
                continue;
            }
            // @ts-ignore
            _id = this.builder.components[name][id]._id;
            if (_id && this.replaced.indexOf(_id) === -1) {
                ID = id;
                item = this.builder.components[name][ID];
                ref = { $ref: `#/components/${name}/${ID}` };
            }
            else {
                item = null;
                ID = null;
                _id = null;
                ref = null;
            }
        }
        if (!item) {
            return;
        }
        this.replaced.push(_id);
        const runner = new RecursiveReplacer(this.builder, ID, _id, ref);
        runner.run();
        return this.replacer(name);
    }
}
exports.default = Optimizer;
