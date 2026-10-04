import './lab.css';
import { REALTIME_CONFIG as config } from '../config.js';
import { createRealtimeTransport } from '../createTransport.js';
import { NetworkSimulation } from './NetworkSimulation.js';
import { LabState } from './LabState.js';
import { PulseExperiment } from './PulseExperiment.js';
import { Benchmark,browserName } from './Benchmark.js';

if(import.meta.env.DEV){
  document.querySelector('#unavailable').hidden=true;document.querySelector('#lab').hidden=false;
  const el=id=>document.getElementById(id),canvas=el('field'),ctx=canvas.getContext('2d');
  el('url').value=import.meta.env.VITE_REALTIME_URL||`ws://${config.host}:${config.port}`;
  const socketUrlKey='realtime-lab.socket-url';
  const normalizeSocketUrl=value=>value.trim().replace(/^https:/i,'wss:').replace(/^http:/i,'ws:');
  const validSocketUrl=value=>{try{return ['ws:','wss:'].includes(new URL(value).protocol);}catch{return false;}};
  el('url').value=normalizeSocketUrl(el('url').value);
  try{const saved=localStorage.getItem(socketUrlKey);if(saved&&validSocketUrl(normalizeSocketUrl(saved)))el('url').value=normalizeSocketUrl(saved);}catch{/* Storage may be blocked; manual configuration still works. */}
  const saveSocketUrl=()=>{const value=normalizeSocketUrl(el('url').value);if(validSocketUrl(value)){el('url').value=value;try{localStorage.setItem(socketUrlKey,value);}catch{/* Optional persistence. */}}};
  el('url').addEventListener('input',saveSocketUrl);
  el('url').addEventListener('change',saveSocketUrl);
  saveSocketUrl();
  el('hz').value=String(config.defaultHz);el('buffer').value=String(config.interpolationMs);
  const model=new LabState(),simulation=new NetworkSimulation(),keys=new Set();
  let transport=null,unsub=[],joined=false,positionTimer=null,raf=null,previous=performance.now(),lastStats=0;
  let local={x:100,y:100,vx:0,vy:0},aim={x:1,y:0},sampleSeq=0,shot=0,testSeq=0,lastShot=-Infinity,lastPulse=-Infinity;
  const status=text=>el('status').textContent=text;
  const serverNow=()=>Date.now()+(transport?.getStats().serverOffsetMs??0);
  const color=id=>`hsl(${[...id].reduce((n,c)=>n+c.charCodeAt(0),0)%360} 80% 65%)`;
  const pulse=new PulseExperiment({shoot,sendControl:(type,payload)=>{if(joined)transport?.sendReliable(type,payload);},
    getSettings:()=>({simulation:{...simulation.settings},positionHz:Number(el('hz').value),interpolation:el('interpolate').checked}),getClientId:()=>transport?.clientId});
  const benchmark=new Benchmark({pulse,getPeers:()=>model.remotes.keys(),getRtt:()=>transport?.getStats().averageRtt??null,
    onRunStart:()=>{for(const [id,p] of model.projectiles)if(p.pulse?.benchmark)model.projectiles.delete(id);},
    getMetadata:()=>({browser:browserName(navigator.userAgent),userAgent:navigator.userAgent,transport:el('transport').value,
      socketUrl:transport?.url??el('url').value,roomId:transport?.roomId??el('room').value,
      simulation:{delayMs:simulation.settings.latencyMs,jitterMs:simulation.settings.jitterMs,messageLossPercent:simulation.settings.loss*100},
      positionSync:{hz:Number(el('hz').value),interpolationEnabled:el('interpolate').checked,interpolationBufferMs:Number(el('buffer').value)}})});
  function send(method,type,payload){const current=transport;simulation.deliver(type,()=>{if(joined&&transport===current){
    if(payload.pulse)payload.pulse.sentAt=performance.now();
    if(current?.[method](type,payload)&&payload.pulse)pulse.sent(payload.id,payload.pulse.sentAt);
  }});}
  function positionSchedule(){
    clearInterval(positionTimer);positionTimer=null;
    if(joined)positionTimer=setInterval(()=>send('sendUnreliable','position',{...local,sampleSeq:++sampleSeq}),1000/Number(el('hz').value));
  }
  function clearTransient(){pulse.reset();joined=false;el('connect').classList.remove('connected');el('connect').textContent='Connect';clearInterval(positionTimer);positionTimer=null;simulation.clear();model.reset();keys.clear();local={x:100,y:100,vx:0,vy:0};sampleSeq=0;shot=0;testSeq=0;lastPulse=-Infinity;lastStats=0;}
  function disconnect(){for(const dispose of unsub)dispose();unsub=[];clearTransient();transport?.disconnect();transport=null;el('socket-target').textContent='Not connected';status('Disconnected.');}
  function connect(){
    try{
      disconnect();
      transport=createRealtimeTransport({kind:el('transport').value,url:normalizeSocketUrl(el('url').value),roomId:el('room').value.trim()});const current=transport;
      if(current.peerRtt)unsub.push(current.peerRtt.onSample(sample=>benchmark.recordPeerRtt(sample)));
      saveSocketUrl();
      unsub.push(current.onConnectionState(state=>{if(state!=='connected')clearTransient();
        el('socket-target').textContent=state==='connected'?current.url:state==='connecting'||state==='reconnecting'?`Pending: ${current.url}`:'Not connected';
        status(state==='reconnecting'?`Cannot connect to ${current.url}. Start npm run realtime:server and check the Socket URL. Retrying automatically…`
          :state==='connecting'?`Connecting to ${current.url}…`:state==='connected'?'Connected. Joining room…':state);}),
        current.onMessage(m=>{
          const wireReceivedAt=performance.now();
          if(m.type==='welcome'){clearTransient();current.sendReliable('join-room',{});}
          if(m.type==='room-state'){joined=true;el('connect').classList.add('connected');el('connect').textContent='Connected ✓ — Reconnect';positionSchedule();status(`Connected to room ${current.roomId}.`);}
          if(m.type==='room-left')clearTransient();
          if(m.type==='peer-left')pulse.removePeer(m.payload.clientId);
          simulation.deliver(m.type,()=>{if(current===transport&&current.state==='connected'){
            if(pulse.receive(m,performance.now(),wireReceivedAt)!==false)model.receive(m,performance.now(),serverNow());
          }});
        }));
      current.connect().catch(error=>{if(current===transport)status(`${error.message}. Start npm run realtime:server and check the Socket URL (${current.url}). Automatic retry is active.`);});
    }catch(error){status(error.message);}
  }
  function shoot(timing=null){
    if(!joined||(!timing&&(benchmark.active||performance.now()-lastShot<150)))return;
    if(!timing)lastShot=performance.now();lastPulse=performance.now();
    const payload={id:`${transport.clientId}-${++shot}`,x:local.x,y:local.y,vx:aim.x*config.projectileSpeed,vy:aim.y*config.projectileSpeed,
      startedAt:serverNow(),ttlMs:config.projectileTtlMs};
    if(timing){payload.pulse=timing;pulse.recordLocal(payload.id,timing);}
    model.spawn(payload,transport.clientId,serverNow());send('sendReliable','projectile-spawn',payload);
  }
  el('connect').addEventListener('click',connect);el('disconnect').addEventListener('click',disconnect);
  status('Ready. Click Connect to join the relay.');
  el('hz').addEventListener('change',positionSchedule);
  function startAuto(burst=false){
    if(benchmark.active)return;
    if(!joined){status('Connect to a room before starting Auto Fire.');return;}
    try{const interval=burst?100:Number(el('fire-interval').value),count=burst?10:el('fire-count').value==='continuous'?null:Number(el('fire-count').value);
      pulse.start(interval,count);el('copy-fallback').hidden=true;lastStats=0;status('Pulse test started.');}catch(error){status(error.message);}
  }
  el('auto-fire').addEventListener('click',()=>{if(!benchmark.active)pulse.generator.active?pulse.stop():startAuto();});
  el('burst').addEventListener('click',()=>startAuto(true));
  async function copyJson(report){
    const text=JSON.stringify(report,(_key,value)=>typeof value==='number'&&Number.isFinite(value)?Math.round(value*1000)/1000:value,2);
    try{await navigator.clipboard.writeText(text);el('copy-fallback').hidden=true;status('Results copied as JSON.');}
    catch{const field=el('copy-fallback');field.hidden=false;field.value=text;field.focus();field.select();status('Clipboard unavailable. Results selected; press Ctrl+C.');}
  }
  el('run-benchmark').addEventListener('click',()=>{
    if(!joined){status('Connect to a room before running a benchmark.');return;}
    if(benchmark.active)return;
    try{benchmark.start(el('benchmark-preset').value,Number(el('benchmark-runs').value));status('Benchmark started.');}
    catch(error){benchmark.stop('error');status(error.message);}
  });
  el('cancel-benchmark').addEventListener('click',()=>benchmark.stop());
  el('copy-benchmark').addEventListener('click',()=>{
    const report=benchmark.report();if(!report){status('Run a benchmark first.');return;}return copyJson(report);
  });
  el('copy-results').addEventListener('click',async()=>{
    if(!pulse.local&&!pulse.receivers.size){status('Run or receive a Burst Test first.');return;}
    return copyJson(pulse.results(transport?.getStats(),navigator.userAgent));
  });
  document.addEventListener('visibilitychange',()=>pulse.visibilityChanged(document.visibilityState));
  for(const id of ['latency','jitter','loss'])el(id).addEventListener('change',()=>simulation.configure({latencyMs:el('latency').value,jitterMs:el('jitter').value,loss:el('loss').value}));
  canvas.addEventListener('keydown',event=>{const key=event.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)){
    event.preventDefault();keys.add(key);if(key===' '&&!event.repeat)shoot();}});
  canvas.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));canvas.addEventListener('blur',()=>keys.clear());
  canvas.addEventListener('pointerdown',event=>{canvas.focus();const r=canvas.getBoundingClientRect(),dx=(event.clientX-r.left)*800/r.width-local.x,dy=(event.clientY-r.top)*500/r.height-local.y;
    const distance=Math.hypot(dx,dy);if(distance)aim={x:dx/distance,y:dy/distance};shoot();});
  const probeTimer=setInterval(()=>{if(joined){transport?.probe();transport?.probePeers?.();}},1000);
  const orderTimer=setInterval(()=>{if(joined&&el('ordering').checked)send('sendUnreliable','test-event',{value:++testSeq});},100);
  function frame(now){
    const dt=Math.min(50,now-previous)/1000;previous=now;
    let x=0,y=0;if(joined){x=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
      y=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));}
    const length=Math.hypot(x,y);local.vx=length?x/length*config.speed:0;local.vy=length?y/length*config.speed:0;
    local.x=Math.max(8,Math.min(792,local.x+local.vx*dt));local.y=Math.max(8,Math.min(492,local.y+local.vy*dt));if(length)aim={x:x/length,y:y/length};
    ctx.clearRect(0,0,800,500);ctx.strokeStyle='#1e293b';for(let n=0;n<800;n+=50){ctx.beginPath();ctx.moveTo(n,0);ctx.lineTo(n,500);ctx.stroke();}for(let n=0;n<500;n+=50){ctx.beginPath();ctx.moveTo(0,n);ctx.lineTo(800,n);ctx.stroke();}
    for(const [id,buffer] of model.remotes){const p=buffer.sample(now,Math.max(0,Math.min(1000,Number(el('buffer').value)||0)),el('interpolate').checked);if(!p)continue;
      ctx.fillStyle=color(id);ctx.fillRect(p.x-8,p.y-8,16,16);ctx.fillText(id.slice(0,8),p.x+12,p.y);}
    ctx.fillStyle='#7dd3fc';ctx.fillRect(local.x-8,local.y-8,16,16);ctx.fillText('YOU',local.x+12,local.y);
    for(const p of model.projectileSamples(serverNow())){ctx.fillStyle=p.ownerId===transport?.clientId?'#fef08a':color(p.ownerId);ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();pulse.rendered(p.id,performance.now());}
    el('auto-fire').textContent=`Auto Fire: ${pulse.generator.active?'ON':'OFF'}`;el('auto-fire').setAttribute('aria-pressed',String(pulse.generator.active));
    el('pulse-dot').style.opacity=now-lastPulse<70?'1':'.15';
    for(const id of ['run-benchmark','benchmark-preset','benchmark-runs','auto-fire','burst','fire-interval','fire-count','hz','buffer','interpolate','latency','jitter','loss','ordering','connect','url','room','transport'])el(id).disabled=benchmark.active;
    el('cancel-benchmark').disabled=!benchmark.active;
    if(now-lastStats>250){lastStats=now;const s=transport?.getStats();const fmt=n=>n===null||n===undefined?'—':n.toFixed(1);
      const describe=(name,m)=>`${name}: ${m.completed?m.reason:'running'}; requested ${m.configuredIntervalMs} ms; samples ${m.sampleCount}\n  ${m.role==='sender'?'Local':'Arrival'} interval avg ${fmt(m.intervalsMs.average)} / jitter σ ${fmt(m.intervalsMs.jitter)} / min ${fmt(m.intervalsMs.min)} / max ${fmt(m.intervalsMs.max)} ms\n  ${m.role==='sender'?`Schedule error avg ${fmt(m.scheduleErrorMs.average)} / max ${fmt(m.scheduleErrorMs.max)} ms; skipped slots ${m.skippedScheduledSlots}; max wake lateness ${fmt(m.maxWakeLatenessMs)} ms`:`Receive → render avg ${fmt(m.receiveToRenderMs.average)} / max ${fmt(m.receiveToRenderMs.max)} ms (${m.receiveToRenderMs.count} rendered); missing ${m.missingSequences}${m.missingIsProvisional?' provisional':''}; stale/out-of-order ${m.outOfOrder}`}\n  ${m.backgrounded?'WARNING: Tab was backgrounded during this test.':'Foreground (no hidden state observed).'}`;
      const summaries=[];if(pulse.local)summaries.push(describe('Browser / event loop',pulse.local.summary()));
      for(const [id,r] of pulse.receivers)summaries.push(describe('Receiving from '+id.slice(0,8),r.metrics.summary()));
      for(const [id,r] of pulse.reports)summaries.push(describe('Peer report '+id.slice(0,8),r));
      if(pulse.local?.completed&&!pulse.reports.size)summaries.push('Remote report: none yet. A connected peer must receive the test and finish its settling window.');
      el('pulse-stats').textContent=summaries.join('\n\n')||'No pulse test yet.';
      const report=benchmark.report();
      if(report){
        const a=report.aggregate,b=report.benchmark,stats=s=>`avg ${fmt(s.average)} / p50 ${fmt(s.p50)} / p95 ${fmt(s.p95)} / p99 ${fmt(s.p99)} / max ${fmt(s.max)} ms (n=${s.count})`;
        el('benchmark-stats').textContent=`${b.label.toUpperCase()} BENCHMARK — ${b.status}\n${benchmark.active?`Benchmark: run ${Math.min(benchmark.runs.length+1,b.requestedRuns)} / ${b.requestedRuns}; ${benchmark.phase}; shots ${benchmark.phase==='firing'?pulse.local?.samples??0:0} / ${b.shotsPerRun}\n`:''}${b.completedRuns} completed / ${b.abortedRuns} aborted / ${b.unstartedRuns} unstarted; ${a.totalShots} shots\n\nBrowser / event loop\nSchedule error: ${stats(a.localScheduleError)}\nAbsolute interval variation: ${stats(a.localIntervalJitter)}\n\nNetwork arrival\nAbsolute interval variation: ${stats(a.remoteArrivalJitter)}\nArrival interval: ${stats(a.remoteArrivalIntervals)}\nServer RTT rolling average at run end: ${stats(a.rtt)}\n\nRender handoff\nReceive → render: ${stats(a.receiveToRender)}\n\nReliability / sequences\nReceived ${a.receivedSamples}; missing ${a.missing}; out-of-order ${a.outOfOrder}; skipped slots ${a.skippedScheduledShots}; missing peer reports ${a.missingPeerReports} (unknown delivery)\nSender: ${report.visibility.senderBackgroundedRuns} backgrounded run(s). Receiver: ${report.visibility.receiverBackgroundedRuns} backgrounded run(s).\nSender foreground aggregate includes ${report.foregroundAggregate.totalShots} shots; receiver visibility does not exclude sender runs.`;
        for(const peer of report.peerRtt)el('benchmark-stats').textContent+=`\nPeer RTT [${peer.peerId}]: ${stats(peer)}`;
        if(a.receiveToRender.count===0)el('benchmark-stats').textContent+='\nNo receiver first-draw samples. Hidden receivers or expired/capped visuals can leave this metric unavailable; this is not zero render delay.';
      }
      const peerLines=(s?.peerRtt??[]).map(p=>`Peer RTT [${p.peerId}]: current ${fmt(p.current)} / average (30) ${fmt(p.average)} / successive variation ${fmt(p.jitter)} ms (n=${p.count})`);
      el('stats').textContent=`State: ${s?.state??'disconnected'}  Client: ${s?.clientId??'—'}  Room: ${s?.roomId??'—'}\nServer RTT probe: ${fmt(s?.rtt)} ms  Average (30): ${fmt(s?.averageRtt)} ms  Jitter estimate: ${fmt(s?.jitter)} ms\nMessages/s: ↑ ${s?.sentPerSecond??0} ↓ ${s?.receivedPerSecond??0}  Bytes/s: ↑ ${s?.sentBytesPerSecond??0} ↓ ${s?.receivedBytesPerSecond??0}\nPosition: ${el('hz').value} Hz  Interpolation: ${el('interpolate').checked?'ON':'OFF'} (${el('buffer').value} ms)  Peers: ${model.remotes.size}\nSimulated delay: ${simulation.settings.latencyMs} ms/direction ± ${simulation.settings.jitterMs} ms  Simulated message loss: ${simulation.settings.loss*100}%  Dropped here: ${simulation.dropped}\nNumbered sent: #${testSeq}  Last received: #${model.lastReceivedTest}  Late/stale ignored: ${model.stale}  Invalid transport messages: ${s?.rejected??0}`;
      el('stats').textContent+='\n'+(peerLines.join('\n')||'Peer RTT: unavailable (no connected peer samples).');
    }
    raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
  window.addEventListener('pagehide',()=>{benchmark.dispose();disconnect();clearInterval(probeTimer);clearInterval(orderTimer);cancelAnimationFrame(raf);});
}
