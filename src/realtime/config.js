export const REALTIME_CONFIG=Object.freeze({
  host:'127.0.0.1',port:8787,defaultHz:20,rates:[10,20,30,60],
  heartbeatMs:15000,maxMessageBytes:8192,maxMessagesPerSecond:120,
  maxClients:64,maxRoomClients:16,maxBufferedBytes:65536,
  reconnectMs:500,maxReconnectMs:10000,interpolationMs:100,maxSnapshots:32,
  width:800,height:500,speed:180,projectileSpeed:300,projectileTtlMs:2000,
});
