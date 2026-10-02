import test from 'node:test';
import assert from 'node:assert/strict';
import { createComputerSession,runComputerCommand } from '../src/terminal/virtualComputer.js';
import { DIRECTOR_COMPUTER } from '../src/office2/directorComputer.js';
import { DIRECTOR_VACATION_ALBUM } from '../src/office2/directorFiles.js';
import { readFileSync,readdirSync } from 'node:fs';

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
  assert.match(opened.album.photos[0].src,/cover\.png$/);
  assert.equal(opened.album.photos[0].caption,'Endlich ein bisschen Erholung.');
  assert.equal(run('type Endlich_Ferien.album').error,true);
  assert.equal(run('open Photos_Do_Not_Open.album').album.photos,DIRECTOR_VACATION_ALBUM.photos);
  assert.match(run('type Bitte_nicht_HR_zeigen.txt').note,/Affen/);
  assert.equal(run('open missing.album').error,true);
  assert.equal(run('open').error,true);
  assert.equal(run('open "C:\\Private\\Endlich_Ferien.album"').album,DIRECTOR_VACATION_ALBUM);
  assert.equal(session.path.join('\\'),'Private','open does not change working directory');
});

test('root vacation album preserves the draft cover/numeric order and is independent of the quest',()=>{
  const session=createComputerSession(DIRECTOR_COMPUTER);
  const listing=runComputerCommand(DIRECTOR_COMPUTER,session,'dir');
  assert.match(listing.message,/Endlich Ferien.album/);assert.match(listing.message,/Lost key.txt/);
  const opened=runComputerCommand(DIRECTOR_COMPUTER,session,'open Endlich Ferien.album');
  assert.equal(opened.album,DIRECTOR_VACATION_ALBUM);assert.equal(opened.interaction,undefined);
  const expected=['cover.png','foto1.png','foto2.png','foto3.png','foto4.png','foto5.png','foto6.png'];
  assert.deepEqual(opened.album.photos.map(photo=>photo.src.split('/').at(-1)),expected);
  const runtime=new URL('../public/assets/director/vacation/',import.meta.url);
  assert.deepEqual(readdirSync(runtime).filter(name=>name.endsWith('.png')).sort(),expected);
  for(const photo of opened.album.photos){
    const file=photo.src.split('/').at(-1),bytes=readFileSync(new URL(file,runtime));
    assert.equal(bytes.readUInt32BE(0),0x89504e47);
    assert.deepEqual(bytes,readFileSync(new URL(`../assets-drafts/director-album/${file}`,import.meta.url)));
  }
  assert.equal(runComputerCommand(DIRECTOR_COMPUTER,session,'type Endlich Ferien.album').error,true);
});
