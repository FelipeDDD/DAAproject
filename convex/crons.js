import { cronJobs, anyApi } from 'convex/server';
const crons = cronJobs();
crons.interval('expire players', { minutes: 15 }, anyApi.players.cleanup, {});
crons.interval('expire profile sessions', { hours: 1 }, anyApi.profileStore.cleanupSessions, {});
crons.interval('expire login attempts', { hours: 1 }, anyApi.profileStore.cleanupLoginAttempts, {});
crons.interval('expire emotes', { hours: 24 }, anyApi.emotes.cleanup, {});
export default crons;
