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
    port:8443,requireHostname:true,title:'DIRECTOR ARCHIVE',interaction:'director-recovery',
    banner:'DIRECTOR ARCHIVE\nAuthentication required.'}],
  filesystem:{type:'dir',entries:{
    Hacking_Class_Material:{type:'dir',entries:{
      'remote_access_notes.txt':{type:'file',content:
        'Apparently "connect" is a command now.\nI Googled it. It isn\'t.\nThe professor definitely made this one up.\n\nSyntax: connect <host> <port>\nAlso accepted: connect <host>:<port>\n\nDo not ask why we are not using SSH.'},
      'totally_legitimate_hacking_notes.txt':{type:'file',content:
        'Do not ask what happened to Telnet either.\nThe answer was "educational purposes."\nThe hostname and port must both be known before the class exercise works.'},
      'network_lab_notes.txt':{type:'file',content:
        'If an IP replies but a hostname does not, check the local DNS cache.\nThis note will self-destruct when the printer learns how.'},
      'printer_security_policy.txt':{type:'file',content:
        'The printer was denied network access after attempting to join the faculty meeting.'},
    }},
  }},
});
