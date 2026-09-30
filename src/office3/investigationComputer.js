// Separate PC-USER beside the new Tiled marker. The original Office3 puzzle PC
// keeps its own files, safe code and shutdown flow in office3Computer.js.
export const OFFICE3_INVESTIGATION_COMPUTER = Object.freeze({
  hostname:'PC-USER',ipv4:'192.168.10.20',ipv6:'fe80::20',
  subnetMask:'255.255.255.0',gateway:'192.168.10.1',
  dns:{server:'192.168.10.5',serverName:'dns.daa.local',records:{'director.daa.local':'192.168.10.42'}},
  dnsCache:{'director.daa.local':'192.168.10.99'},
  reachableIps:['192.168.10.20','192.168.10.42','192.168.10.5'],
  extraIpconfigLines:['   Connection-specific DNS Suffix  : daa.local'],
  services:[{id:'director-archive',hostname:'director.daa.local',ip:'192.168.10.42',
    port:8443,requireHostname:true,title:'DIRECTOR ARCHIVE',
    banner:'DIRECTOR ARCHIVE\nAuthentication required.'}],
  filesystem:{type:'dir',entries:{}},
});
