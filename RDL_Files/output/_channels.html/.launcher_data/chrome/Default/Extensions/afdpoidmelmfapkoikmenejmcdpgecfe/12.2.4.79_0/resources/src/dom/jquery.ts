import { Lazy } from "../utils/lazy";

// tslint:disable-next-line no-require-imports
declare function require(module: "jquery"): JQueryStatic;

// tslint:disable-next-line no-require-imports
export const lazyJQuery = new Lazy(() => require("jquery"));
