import test from 'node:test';
import assert from 'node:assert/strict';
import { createComputerSession,runComputerCommand } from '../src/terminal/virtualComputer.js';
import { DIRECTOR_COMPUTER } from '../src/office2/directorComputer.js';
import { DIRECTOR_VACATION_ALBUM } from '../src/office2/directorFiles.js';

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

test('Director files list albums as files and open data-driven photos without treating them as text',()=>{
  const session=createComputerSession(DIRECTOR_COMPUTER);
  const run=command=>runComputerCommand(DIRECTOR_COMPUTER,session,command);
  assert.match(run('dir').message,/<DIR>  Private/);
  assert.equal(run('cd Private').error,false);
  const listing=run('dir').message;
  assert.match(listing,/Endlich_Ferien\.album/);assert.match(listing,/Urlaubsplanung_FINAL_REAL\.txt/);
  assert.doesNotMatch(listing,/<DIR>\s+Endlich_Ferien/);
  const opened=run('OPEN endlich_ferien.album');
  assert.equal(opened.album,DIRECTOR_VACATION_ALBUM);
  assert.equal(opened.title,'Endlich_Ferien.album');
  assert.match(opened.album.photos[0].src,/endlich_ferien\.png$/);
  assert.equal(opened.album.photos[0].caption,'Endlich ein bisschen Erholung.');
  assert.equal(run('type Endlich_Ferien.album').error,true);
  assert.equal(run('open Photos_Do_Not_Open.album').album.photos,DIRECTOR_VACATION_ALBUM.photos);
  assert.match(run('type Bitte_nicht_HR_zeigen.txt').note,/Affen/);
  assert.equal(run('open missing.album').error,true);
  assert.equal(run('open').error,true);
  assert.equal(run('open "C:\\Private\\Endlich_Ferien.album"').album,DIRECTOR_VACATION_ALBUM);
  assert.equal(session.path.join('\\'),'Private','open does not change working directory');
});
