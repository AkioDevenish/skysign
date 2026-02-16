/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions from "../actions.js";
import type * as apiKeys from "../apiKeys.js";
import type * as audit from "../audit.js";
import type * as auditQueries from "../auditQueries.js";
import type * as certificates from "../certificates.js";
import type * as config from "../config.js";
import type * as crons from "../crons.js";
import type * as documents from "../documents.js";
import type * as email from "../email.js";
import type * as newsletter from "../newsletter.js";
import type * as rateLimit from "../rateLimit.js";
import type * as reminderQueries from "../reminderQueries.js";
import type * as reminderScheduler from "../reminderScheduler.js";
import type * as settings from "../settings.js";
import type * as signatureRequests from "../signatureRequests.js";
import type * as signatures from "../signatures.js";
import type * as team from "../team.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  apiKeys: typeof apiKeys;
  audit: typeof audit;
  auditQueries: typeof auditQueries;
  certificates: typeof certificates;
  config: typeof config;
  crons: typeof crons;
  documents: typeof documents;
  email: typeof email;
  newsletter: typeof newsletter;
  rateLimit: typeof rateLimit;
  reminderQueries: typeof reminderQueries;
  reminderScheduler: typeof reminderScheduler;
  settings: typeof settings;
  signatureRequests: typeof signatureRequests;
  signatures: typeof signatures;
  team: typeof team;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
