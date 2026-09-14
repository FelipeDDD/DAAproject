/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as doorDefinitions from "../doorDefinitions.js";
import type * as doors from "../doors.js";
import type * as messages from "../messages.js";
import type * as players from "../players.js";
import type * as quizGeneratedQuestions from "../quizGeneratedQuestions.js";
import type * as quizLobbies from "../quizLobbies.js";
import type * as quizQuestions from "../quizQuestions.js";
import type * as quizSeatDefinitions from "../quizSeatDefinitions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  doorDefinitions: typeof doorDefinitions;
  doors: typeof doors;
  messages: typeof messages;
  players: typeof players;
  quizGeneratedQuestions: typeof quizGeneratedQuestions;
  quizLobbies: typeof quizLobbies;
  quizQuestions: typeof quizQuestions;
  quizSeatDefinitions: typeof quizSeatDefinitions;
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
