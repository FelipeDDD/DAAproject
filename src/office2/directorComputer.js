import { createComputerSession } from '../terminal/virtualComputer.js';

// Move the Office2 monitor light relative to the PC-DIRECTOR Tiled marker.
export const DIRECTOR_PC_STATUS_LIGHT=Object.freeze({offsetX:0,offsetY:0,radius:5});

export const DIRECTOR_COMPUTER=Object.freeze({
  hostname:'PC-DIRECTOR',ipv4:'192.168.10.42',ipv6:'fe80::42',
  subnetMask:'255.255.255.0',gateway:'192.168.10.1',
  dns:{server:'192.168.10.5',serverName:'dns.daa.local',records:{'director.daa.local':'192.168.10.42'}},
  dnsCache:{'director.daa.local':'192.168.10.42'},
  reachableIps:['192.168.10.20','192.168.10.42','192.168.10.5'],
  filesystem:{type:'dir',entries:{}},
  services:[{id:'director-archive',hostname:'director.daa.local',ip:'192.168.10.42',
    port:8443,requireHostname:true,title:'DIRECTOR ARCHIVE',
    banner:'DIRECTOR ARCHIVE\nAuthentication required.'}],
});

export const createDirectorComputerSession=()=>createComputerSession(DIRECTOR_COMPUTER);
