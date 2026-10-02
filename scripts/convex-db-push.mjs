import { pushDatabase,runTransfer } from './convex-db-transfer.mjs';
runTransfer(pushDatabase).catch(error=>{console.error(error.message);process.exitCode=1;});
