export interface ISpecificationExtension {
  [extensionName: string]: any;
}
export declare class SpecificationExtension implements ISpecificationExtension {
  [extensionName: string]: any;
  static isValidExtension(extensionName: string): boolean;
  getExtension(extensionName: string): any;
  addExtension(extensionName: string, payload: any): void;
  listExtensions(): string[];
}
export interface OpenAPIObject extends ISpecificationExtension {
  openapi: string;
  info: InfoObject;
  servers?: ServerObject[];
  paths: PathsObject;
  components?: ComponentsObject;
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
}
export interface InfoObject extends ISpecificationExtension {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
  version: string;
}
export interface ContactObject extends ISpecificationExtension {
  name?: string;
  url?: string;
  email?: string;
}
export interface LicenseObject extends ISpecificationExtension {
  name: string;
  url?: string;
}
export interface ServerObject extends ISpecificationExtension {
  url: string;
  description?: string;
  variables?: {
    [v: string]: ServerVariableObject;
  };
}
export interface ServerVariableObject extends ISpecificationExtension {
  enum?: string[] | boolean[] | number[];
  default: string | boolean | number;
  description?: string;
}
export interface ComponentsObject extends ISpecificationExtension {
  schemas?: {
    [schema: string]: SchemaObject | ReferenceObject;
  };
  responses?: {
    [response: string]: ResponseObject | ReferenceObject;
  };
  parameters?: {
    [parameter: string]: ParameterObject | ReferenceObject;
  };
  examples?: {
    [example: string]: ExampleObject | ReferenceObject;
  };
  requestBodies?: {
    [request: string]: RequestBodyObject | ReferenceObject;
  };
  headers?: {
    [header: string]: HeaderObject | ReferenceObject;
  };
  securitySchemes?: {
    [securityScheme: string]: SecuritySchemeObject | ReferenceObject;
  };
  links?: {
    [link: string]: LinkObject | ReferenceObject;
  };
  callbacks?: {
    [callback: string]: CallbackObject | ReferenceObject;
  };
}
export interface PathsObject extends ISpecificationExtension {
  [path: string]: PathItemObject | any;
}
export declare type PathObject = PathsObject;
export declare function getPath(
  pathsObject: PathsObject,
  path: string
): PathItemObject | undefined;
export interface PathItemObject extends ISpecificationExtension {
  location: string;
  $ref?: string;
  summary?: string;
  description?: string;
  get?: OperationObject;
  put?: OperationObject;
  post?: OperationObject;
  delete?: OperationObject;
  options?: OperationObject;
  head?: OperationObject;
  patch?: OperationObject;
  trace?: OperationObject;
  servers?: ServerObject[];
  parameters?: (ParameterObject | ReferenceObject)[];
}
export interface OperationObject extends ISpecificationExtension {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
  operationId?: string;
  parameters?: (ParameterObject | ReferenceObject)[];
  requestBody?: RequestBodyObject | ReferenceObject;
  responses: ResponsesObject;
  callbacks?: CallbacksObject;
  deprecated?: boolean;
  security?: SecurityRequirementObject[];
  servers?: ServerObject[];
}
export interface ExternalDocumentationObject extends ISpecificationExtension {
  description?: string;
  url: string;
}
export declare type ParameterLocation = "query" | "header" | "path" | "cookie";
export declare type ParameterStyle =
  | "matrix"
  | "label"
  | "form"
  | "simple"
  | "spaceDelimited"
  | "pipeDelimited"
  | "deepObject";
export interface BaseParameterObject extends ISpecificationExtension {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: ParameterStyle;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: SchemaObject | ReferenceObject;
  examples?: {
    [param: string]: ExampleObject | ReferenceObject;
  };
  example?: any;
  content?: ContentObject;
}
export interface ParameterObject extends BaseParameterObject {
  id?: string;
  name: string;
  in: ParameterLocation;
}
export interface RequestBodyObject extends ISpecificationExtension {
  id?: string;
  description?: string;
  content: ContentObject;
  required?: boolean;
}
export interface ContentObject {
  [mediatype: string]: MediaTypeObject;
}
export interface MediaTypeObject extends ISpecificationExtension {
  schema?: SchemaObject | ReferenceObject;
  examples?: ExamplesObject;
  example?: any;
  encoding?: EncodingObject;
}
export interface EncodingObject extends ISpecificationExtension {
  [property: string]: EncodingPropertyObject | any;
}
export interface EncodingPropertyObject {
  contentType?: string;
  headers?: {
    [key: string]: HeaderObject | ReferenceObject;
  };
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  [key: string]: any;
}
export interface ResponsesObject extends ISpecificationExtension {
  default?: ResponseObject | ReferenceObject;
  [statuscode: string]: ResponseObject | ReferenceObject | any;
}
export interface ResponseObject extends ISpecificationExtension {
  id?: string;
  description: string;
  headers?: HeadersObject;
  content?: ContentObject;
  links?: LinksObject;
}
export interface CallbacksObject extends ISpecificationExtension {
  [name: string]: CallbackObject | ReferenceObject | any;
}
export interface CallbackObject extends ISpecificationExtension {
  id?: string;
  [name: string]: PathItemObject | any;
}
export interface HeadersObject {
  [name: string]: HeaderObject | ReferenceObject;
}
export interface ExampleObject {
  id?: string;
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
  [property: string]: any;
}
export interface LinksObject {
  [name: string]: LinkObject | ReferenceObject;
}
export interface LinkObject extends ISpecificationExtension {
  id?: string;
  operationRef?: string;
  operationId?: string;
  parameters?: LinkParametersObject;
  requestBody?: any | string;
  description?: string;
  server?: ServerObject;
  [property: string]: any;
}
export interface LinkParametersObject {
  [name: string]: any | string;
}
export interface HeaderObject extends BaseParameterObject {
  id?: string;
}
export interface TagObject extends ISpecificationExtension {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
  [extension: string]: any;
}
export interface ExamplesObject {
  [name: string]: ExampleObject | ReferenceObject;
}
export interface ReferenceObject {
  $ref: string;
}
export declare function isReferenceObject(obj: any): obj is ReferenceObject;
export interface SchemaObject extends ISpecificationExtension {
  id?: string;
  _id?: string;
  nullable?: boolean;
  discriminator?: DiscriminatorObject;
  readOnly?: boolean;
  writeOnly?: boolean;
  xml?: XmlObject;
  externalDocs?: ExternalDocumentationObject;
  example?: any;
  deprecated?: boolean;
  type?:
    | "integer"
    | "number"
    | "string"
    | "boolean"
    | "object"
    | "null"
    | "array";
  format?:
    | "int32"
    | "int64"
    | "float"
    | "double"
    | "byte"
    | "binary"
    | "date"
    | "date-time"
    | "password"
    | string;
  allOf?: (SchemaObject | ReferenceObject)[];
  oneOf?: (SchemaObject | ReferenceObject)[];
  anyOf?: (SchemaObject | ReferenceObject)[];
  not?: SchemaObject | ReferenceObject;
  items?: SchemaObject | ReferenceObject;
  properties?: {
    [propertyName: string]: SchemaObject | ReferenceObject;
  };
  additionalProperties?: SchemaObject | ReferenceObject | boolean;
  description?: string;
  default?: any;
  title?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: any[];
}
export declare function isSchemaObject(
  schema: SchemaObject | ReferenceObject
): schema is SchemaObject;
export interface SchemasObject {
  [schema: string]: SchemaObject;
}
export interface DiscriminatorObject {
  propertyName: string;
  mapping?: {
    [key: string]: string;
  };
}
export interface XmlObject extends ISpecificationExtension {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}
export declare type SecuritySchemeType =
  | "apiKey"
  | "http"
  | "oauth2"
  | "openIdConnect";
export interface SecuritySchemeObject extends ISpecificationExtension {
  id?: string;
  type: SecuritySchemeType;
  description?: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlowsObject;
  openIdConnectUrl?: string;
}
export interface OAuthFlowsObject extends ISpecificationExtension {
  implicit?: OAuthFlowObject;
  password?: OAuthFlowObject;
  clientCredentials?: OAuthFlowObject;
  authorizationCode?: OAuthFlowObject;
}
export interface OAuthFlowObject extends ISpecificationExtension {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: ScopesObject;
}
export interface ScopesObject extends ISpecificationExtension {
  [scope: string]: any;
}
export interface SecurityRequirementObject {
  [name: string]: string[];
}
