/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bossProgress from "../bossProgress.js";
import type * as characterItems from "../characterItems.js";
import type * as crons from "../crons.js";
import type * as doorDefinitions from "../doorDefinitions.js";
import type * as doors from "../doors.js";
import type * as emotes from "../emotes.js";
import type * as itChallenge from "../itChallenge.js";
import type * as itChallengeScoring from "../itChallengeScoring.js";
import type * as messages from "../messages.js";
import type * as playerSessions from "../playerSessions.js";
import type * as players from "../players.js";
import type * as profileDataMigration from "../profileDataMigration.js";
import type * as profileStore from "../profileStore.js";
import type * as profiles from "../profiles.js";
import type * as quizGeneratedQuestions from "../quizGeneratedQuestions.js";
import type * as quizHistory from "../quizHistory.js";
import type * as quizLobbies from "../quizLobbies.js";
import type * as quizQuestions from "../quizQuestions.js";
import type * as quizSeatDefinitions from "../quizSeatDefinitions.js";
import type * as quizSelection from "../quizSelection.js";
import type * as quizStatistics from "../quizStatistics.js";
import type * as quizStatisticsModel from "../quizStatisticsModel.js";
import type * as quizStatisticsStore from "../quizStatisticsStore.js";
import type * as soloStudy from "../soloStudy.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bossProgress: typeof bossProgress;
  characterItems: typeof characterItems;
  crons: typeof crons;
  doorDefinitions: typeof doorDefinitions;
  doors: typeof doors;
  emotes: typeof emotes;
  itChallenge: typeof itChallenge;
  itChallengeScoring: typeof itChallengeScoring;
  messages: typeof messages;
  playerSessions: typeof playerSessions;
  players: typeof players;
  profileDataMigration: typeof profileDataMigration;
  profileStore: typeof profileStore;
  profiles: typeof profiles;
  quizGeneratedQuestions: typeof quizGeneratedQuestions;
  quizHistory: typeof quizHistory;
  quizLobbies: typeof quizLobbies;
  quizQuestions: typeof quizQuestions;
  quizSeatDefinitions: typeof quizSeatDefinitions;
  quizSelection: typeof quizSelection;
  quizStatistics: typeof quizStatistics;
  quizStatisticsModel: typeof quizStatisticsModel;
  quizStatisticsStore: typeof quizStatisticsStore;
  soloStudy: typeof soloStudy;
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
