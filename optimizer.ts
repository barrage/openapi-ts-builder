import { OpenAPIObject, ReferenceObject } from "./types";

class RecursiveReplacer {
  constructor(
    public forReplace: any,
    public id: string,
    public _id: string,
    public ref: ReferenceObject
  ) {}

  run() {
    for (const key in this.forReplace) {
      if (
        this.forReplace[key] &&
        typeof this.forReplace[key] === "object" &&
        !this.forReplace[key]["$ref"]
      ) {
        if (
          this.forReplace[key].id &&
          this.forReplace[key].id === this.id &&
          this.forReplace[key]._id !== this._id
        ) {
          this.forReplace[key] = this.ref;
        } else {
          new RecursiveReplacer(
            this.forReplace[key],
            this.id,
            this._id,
            this.ref
          ).run();
        }
      }
    }
  }
}

class RecursiveCleaner {
  constructor(public forClean: any) {}

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

export default class Optimizer {
  private replaced: string[] = [];
  private cleaned: string[] = [];

  constructor(private builder: OpenAPIObject) {}

  /**
   * Replaces all occurences of component items in the whole builder object
   *
   * @returns {Optimizer}
   */
  replace(): Optimizer {
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
  cleanup(): Optimizer {
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
  get(): OpenAPIObject {
    return this.builder;
  }

  /**
   * Runner that will run the replacement recursively through RecursiveReplacer for given
   * component object.
   *
   * @param {string} name
   * @returns {void}
   */
  private replacer(name: string): void {
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
        ref = { $ref: `#/components/${name}/${ID}` } as ReferenceObject;
      } else {
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

    const runner = new RecursiveReplacer(
      this.builder,
      ID as string,
      _id,
      ref as ReferenceObject
    );
    runner.run();

    return this.replacer(name);
  }
}
