import { cronJobs, anyApi } from 'convex/server';
const crons = cronJobs();
crons.interval('expire players', { seconds: 5 }, anyApi.players.cleanup, {});
crons.interval('repair quiz lobbies', { seconds: 5 }, anyApi.quizLobbies.cleanup, {});
crons.interval('expire emotes', { seconds: 5 }, anyApi.emotes.cleanup, {});
export default crons;
