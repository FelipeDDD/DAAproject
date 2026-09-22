import { cronJobs, anyApi } from 'convex/server';
const crons = cronJobs();
crons.interval('expire players', { seconds: 5 }, anyApi.players.cleanup, {});
crons.interval('expire profile sessions', { hours: 1 }, anyApi.profileStore.cleanupSessions, {});
crons.interval('expire login attempts', { hours: 1 }, anyApi.profileStore.cleanupLoginAttempts, {});
crons.interval('repair quiz lobbies', { seconds: 5 }, anyApi.quizLobbies.cleanup, {});
crons.interval('expire emotes', { seconds: 5 }, anyApi.emotes.cleanup, {});
export default crons;
