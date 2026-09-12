import { cronJobs, anyApi } from 'convex/server';
const crons = cronJobs();
crons.interval('expire players', { seconds: 5 }, anyApi.players.cleanup, {});
export default crons;
