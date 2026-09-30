import test from 'node:test';
import assert from 'node:assert/strict';
import {createComputerSession, parseComputerCommand, runComputerCommand} from '../src/terminal/virtualComputer.js';
import {OFFICE3_COMPUTER, createOffice3ComputerSession, runOfficeCommand,
  NORMAL_FOLDER, PASSWORD_FOLDER, PASSWORD_FILE} from '../src/office3/office3Computer.js';
import {OFFICE3_INVESTIGATION_COMPUTER} from '../src/office3/investigationComputer.js';

const run = (session, command) => runComputerCommand(OFFICE3_COMPUTER, session, command, {code: '0123'});

test('parser accepts normal case and whitespace variations; hostname and ipconfig use PC configuration', () => {
  assert.deepEqual(parseComputerCommand('  IpCoNfIg    /ALL   '), {verb: 'ipconfig', arg: '/ALL'});
  const session = createOffice3ComputerSession();
  assert.equal(run(session, '  HoStNaMe  ').message, 'PC-USER');
  assert.match(run(session, 'IPCONFIG').message, /192\.168\.10\.20/);
  assert.match(run(session, 'ipconfig /all').message, /192\.168\.10\.5/);
  assert.match(run(session, 'help').message, /connect <host>:<port>/);
  assert.equal(run(session, 'totally unknown').error, true);
});

test('authoritative DNS works while stale local cache breaks hostname ping, then flush repairs it', () => {
  const session = createOffice3ComputerSession();
  assert.match(run(session, 'nslookup director.daa.local').message, /Server:  dns\.daa\.local[\s\S]*Name:    director\.daa\.local\nAddress: 192\.168\.10\.42/);
  assert.match(run(session, 'nslookup 192.168.10.42').message, /director\.daa\.local/);
  assert.match(run(session, 'ping 192.168.10.42').message, /Reply from 192\.168\.10\.42/);
  assert.match(run(session, 'PING director.daa.local').message, /192\.168\.10\.99[\s\S]*timed out/);
  assert.match(run(session, 'ipconfig /flushdns').message, /Successfully flushed the DNS Resolver Cache/);
  assert.match(run(session, 'ping director.daa.local').message, /Reply from 192\.168\.10\.42/);
  assert.match(run(createOffice3ComputerSession(), 'ping director.daa.local').message, /192\.168\.10\.99/,
    'a separate computer session retains its own initial cache');
});

test('connect requires a port, routes by configured service, and can require the hostname', () => {
  const session = createOffice3ComputerSession();
  const hint = run(session, 'connect director.daa.local');
  assert.match(hint.message, /destination port is required/i);
  assert.doesNotMatch(hint.message, /8443/);
  run(session, 'ipconfig /flushdns');
  assert.match(run(session, 'connect 192.168.10.42:8443').message, /Unknown virtual host/);
  const result = run(session, 'CONNECT director.daa.local:8443');
  assert.equal(result.service.id, 'director-archive');
  assert.match(result.service.banner, /Authentication required/);
});

test('Office3 old files and navigation work through reusable filesystem; nested folders can be configured', () => {
  const session = createOffice3ComputerSession();
  assert.equal(run(session, ` cd  ${PASSWORD_FOLDER} `).folder, PASSWORD_FOLDER);
  assert.match(run(session, `type ${PASSWORD_FILE}`).note, /Safe Code: 0123/);
  assert.equal(run(session, 'cd..').folder, '');
  assert.equal(run(session, `cd ${NORMAL_FOLDER}`).folder, NORMAL_FOLDER);
  assert.match(run(session, 'dir').message, /secret_plan\.txt/);
  assert.match(run(session, 'TYPE secret_plan.txt').note, /Step 1/);
  assert.equal(run(session, 'very_safe_program.exe').shutdown, true);
  assert.equal(runOfficeCommand('', 'cd Windows', '0123').error, true);

  const other = {...OFFICE3_COMPUTER, filesystem: {type: 'dir', entries: {
    Absolutely_Not_Secrets: {type: 'dir', entries: {notes: {type: 'dir', entries: {
      'clue.txt': {type: 'file', content: 'A configurable clue'},
    }}}},
  }}};
  const state = createComputerSession(other);
  runComputerCommand(other, state, 'cd Absolutely_Not_Secrets\\notes');
  assert.equal(runComputerCommand(other, state, 'type clue.txt').note, 'A configurable clue');
  assert.equal(runComputerCommand(other, state, 'cd ..').folder, 'Absolutely_Not_Secrets');
});

test('separate investigation PC keeps network commands without exposing the old safe-code file',()=>{
  const session=createComputerSession(OFFICE3_INVESTIGATION_COMPUTER);
  assert.equal(runComputerCommand(OFFICE3_INVESTIGATION_COMPUTER,session,'hostname').message,'PC-USER');
  assert.deepEqual(OFFICE3_INVESTIGATION_COMPUTER.filesystem.entries,{});
  assert.equal(runComputerCommand(OFFICE3_INVESTIGATION_COMPUTER,session,`cd ${NORMAL_FOLDER}`).error,true);
  assert.match(runComputerCommand(OFFICE3_INVESTIGATION_COMPUTER,session,'ipconfig /all').message,
    /192\.168\.10\.20/);
  assert.match(runOfficeCommand('',`cd ${PASSWORD_FOLDER}`,'0123').folder,/Definitely_not_important/,
    'the original puzzle computer retains its files');
});

test('a different PC can add local puzzle flags, commands and harmless output noise through configuration', () => {
  const other = {...OFFICE3_COMPUTER, hostname: 'PC-LAB', initialFlags: {visited: false},
    outputSuffix: {hostname: 'Lab machine 7 is having a perfectly normal day.'},
    commandHandlers: {visit: ({session}) => {session.flags.visited = true; return {message: 'Visit recorded locally.'};}}};
  const state = createComputerSession(other);
  assert.match(runComputerCommand(other, state, 'hostname').message, /PC-LAB[\s\S]*Lab machine 7/);
  assert.equal(runComputerCommand(other, state, 'VISIT').message, 'Visit recorded locally.');
  assert.equal(state.flags.visited, true);
});
