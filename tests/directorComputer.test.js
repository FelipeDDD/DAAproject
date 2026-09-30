import test from 'node:test';
import assert from 'node:assert/strict';
import { createComputerSession,runComputerCommand } from '../src/terminal/virtualComputer.js';
import { DIRECTOR_COMPUTER } from '../src/office2/directorComputer.js';

test('Director PC identifies itself and represents the configured Director service',()=>{
  const session=createComputerSession(DIRECTOR_COMPUTER);
  assert.equal(runComputerCommand(DIRECTOR_COMPUTER,session,'hostname').message,'PC-DIRECTOR');
  assert.match(runComputerCommand(DIRECTOR_COMPUTER,session,'ipconfig').message,/192\.168\.10\.42/);
  const result=runComputerCommand(DIRECTOR_COMPUTER,session,'connect director.daa.local:8443');
  assert.equal(result.service.id,'director-archive');
  assert.match(result.service.banner,/Authentication required/);
});

test('Director PC shares the command parser and reports DNS and ping through the configured network',()=>{
  const session=createComputerSession(DIRECTOR_COMPUTER);
  assert.match(runComputerCommand(DIRECTOR_COMPUTER,session,'nslookup director.daa.local').message,/192\.168\.10\.42/);
  assert.match(runComputerCommand(DIRECTOR_COMPUTER,session,'ping director.daa.local').message,/Reply from 192\.168\.10\.42/);
});
