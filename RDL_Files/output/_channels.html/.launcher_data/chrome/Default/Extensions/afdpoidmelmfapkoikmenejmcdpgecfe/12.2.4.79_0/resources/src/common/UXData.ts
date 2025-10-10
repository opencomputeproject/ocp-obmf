"use strict";

import { Primitive } from "../utils/utils";

/**
 * UXData type as generic data type.
 */
export interface UXData {
	[id: string]: Primitive | Primitive[] | undefined;
}
