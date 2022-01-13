import { OpenAPIObject } from "./types";
export default class Optimizer {
    private builder;
    private replaced;
    private cleaned;
    constructor(builder: OpenAPIObject);
    /**
     * Replaces all occurences of component items in the whole builder object
     *
     * @returns {Optimizer}
     */
    replace(): Optimizer;
    /**
     * Removes all the _id and id markings from all the objects.
     */
    cleanup(): Optimizer;
    get(): OpenAPIObject;
    /**
     * Runner that will run the replacement recursively through RecursiveReplacer for given
     * component object.
     *
     * @param {string} name
     * @returns {void}
     */
    private replacer;
}
