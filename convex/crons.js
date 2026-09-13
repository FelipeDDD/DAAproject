import { cronJobs, anyApi } from 'convex/server';
const crons = cronJobs();
crons.interval('expire players', { seconds: 5 }, anyApi.players.cleanup, {});
crons.interval('repair quiz lobbies', { seconds: 5 }, anyApi.quizLobbies.cleanup, {});
export default crons;
