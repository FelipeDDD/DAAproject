import { pullDatabase,runTransfer } from './convex-db-transfer.mjs';
runTransfer(pullDatabase).catch(error=>{console.error(error.message);process.exitCode=1;});
