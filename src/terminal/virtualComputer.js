// Fictional, local-only computer. Commands never access the browser's network or filesystem.
const key = value => String(value ?? '').toLowerCase();
const ipv4 = value => /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value);
const entry = (folder, name) => Object.entries(folder?.entries ?? {}).find(([label]) => key(label) === key(name));
const currentFolder = (computer, path) => path.reduce((node, name) => entry(node, name)?.[1], computer.filesystem);
const pathLabel = path => `C:\\${path.join('\\')}`;

export function createComputerSession(computer) {
  return {path: [], dnsCache: {...computer.dnsCache}, flags: {...computer.initialFlags}};
}

export function parseComputerCommand(input) {
  const text = String(input ?? '').trim();
  if (!text) return {verb: '', arg: ''};
  const match = /^(\S+)(?:\s+([\s\S]*))?$/.exec(text);
  return {verb: key(match[1]), arg: (match[2] ?? '').trim()};
}

function resolvePath(computer, session, raw) {
  const normalized = raw.replace(/^"(.*)"$/, '$1').replaceAll('/', '\\');
  const absolute = /^c:\\/i.test(normalized) || normalized.startsWith('\\');
  const parts = normalized.replace(/^c:/i, '').split('\\').filter(Boolean);
  const path = absolute ? [] : [...session.path];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {path.pop(); continue;}
    const found = entry(currentFolder(computer, path), part);
    if (!found) return {error: 'The system cannot find the path specified.'};
    if (found[1].type === 'denied') return {error: 'You do not have permission to access this folder.'};
    if (found[1].type !== 'dir') return {error: 'The directory name is invalid.'};
    path.push(found[0]);
  }
  return {path};
}

function dnsAnswer(computer, name) {
  return Object.entries(computer.dns?.records ?? {}).find(([host]) => key(host) === key(name))?.[1];
}

function targetIp(computer, session, host) {
  return ipv4(host) ? host : session.dnsCache[key(host)] ?? dnsAnswer(computer, host);
}

function networkCommand(computer, session, verb, arg) {
  const dns = computer.dns ?? {};
  if (verb === 'hostname') return {message: computer.hostname};
  if (verb === 'ipconfig') {
    if (key(arg) === '/flushdns') {
      session.dnsCache = {};
      return {message: 'Windows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.',success:true};
    }
    if (arg && key(arg) !== '/all') return {message: 'Usage: ipconfig [/all | /flushdns]', error: true};
    const lines = ['Windows IP Configuration', '', `   Host Name . . . . . . . . . . . . : ${computer.hostname}`,
      `   IPv4 Address. . . . . . . . . . : ${computer.ipv4}`,
      `   Subnet Mask . . . . . . . . . . : ${computer.subnetMask}`,
      `   Default Gateway . . . . . . . : ${computer.gateway}`];
    if (key(arg) === '/all') lines.push(`   IPv6 Address. . . . . . . . . . . : ${computer.ipv6}`,
      `   DNS Servers . . . . . . . . . . : ${dns.server}`,
      ...(computer.extraIpconfigLines ?? []));
    return {message: lines.join('\n')};
  }
  if (verb === 'nslookup') {
    if (!arg) return {message: 'Usage: nslookup <host-or-ip>', error: true};
    const address = ipv4(arg) ? Object.entries(dns.records ?? {}).find(([, ip]) => ip === arg)?.[0] : dnsAnswer(computer, arg);
    const header = `Server:  ${dns.serverName ?? 'dns.daa.local'}\nAddress: ${dns.server}\n`;
    return address ? {message: `${header}\nName:    ${ipv4(arg) ? address : arg}\nAddress: ${ipv4(arg) ? arg : address}`}
      : {message: `${header}\n*** No DNS record found for ${arg}`, error: true};
  }
  if (verb === 'ping') {
    if (!arg) return {message: 'Usage: ping <host-or-ip>', error: true};
    const ip = targetIp(computer, session, arg);
    if (!ip) return {message: `Ping request could not find host ${arg}.`, error: true};
    const reachable = (computer.reachableIps ?? []).includes(ip);
    return {message: reachable
      ? `Pinging ${arg} [${ip}] with 32 bytes of data:\nReply from ${ip}: bytes=32 time<1ms TTL=64`
      : `Pinging ${arg} [${ip}] with 32 bytes of data:\nRequest timed out.`, error: !reachable};
  }
  if (verb === 'connect') {
    if (!arg || !/[:\s]/.test(arg)) return {message: 'A destination port is required. Usage: connect <host>:<port> or connect <host> <port>', error: true};
    const match = /^([^:\s]+)(?::|\s+)(\d{1,5})$/.exec(arg);
    if (!match || Number(match[2]) > 65535 || Number(match[2]) < 1)
      return {message: 'Usage: connect <host>:<port> or connect <host> <port>', error: true};
    const [, host, port] = match;
    const ip = targetIp(computer, session, host);
    if (!ip || !(computer.reachableIps ?? []).includes(ip))
      return {message: `Could not connect to ${host}.\nThe resolved address may no longer be valid.`, error: true};
    const service = (computer.services ?? []).find(item => item.ip === ip && item.port === Number(port));
    if (!service) return {message: `Connection to ${host}:${port} refused.`, error: true};
    if (service.requireHostname && key(host) !== key(service.hostname))
      return {message: 'Unknown virtual host. Connect using the registered hostname.', error: true};
    return {message: service.banner, service: {id: service.id, title: service.title, banner: service.banner,
      ...(service.interaction?{interaction:service.interaction}:{})}};
  }
  return null;
}

export function runComputerCommand(computer, session, input, context = {}) {
  const {verb, arg} = parseComputerCommand(input);
  const result = (message = '', error = false, extra = {}) => ({folder: session.path.join('\\'),
    message: message && computer.outputSuffix?.[verb] ? `${message}\n${computer.outputSuffix[verb]}` : message,
    error, ...extra});
  if (!verb) return result();
  const custom = computer.commandHandlers?.[verb]?.({computer, session, arg, context});
  if (custom) return result(custom.message, Boolean(custom.error), custom);
  if (verb === 'help') return result('Available commands: help, hostname, ipconfig, ping, nslookup, dir, cd, type, open, connect.\nUse open <file.album> for a photo album.\nUse connect <host>:<port> for a network service.');
  if (verb === 'cd..') return runComputerCommand(computer, session, 'cd ..', context);
  const network = networkCommand(computer, session, verb, arg);
  if (network) return result(network.message, Boolean(network.error), {
    ...(network.service?{service:network.service}:{}),...(network.success?{success:true}:{}),
  });
  if (verb === 'dir') {
    const location = arg ? resolvePath(computer, session, arg) : {path: session.path};
    if (location.error) return result(location.error, true);
    const folder = currentFolder(computer, location.path);
    return result(Object.entries(folder.entries ?? {}).map(([name, item]) => ['dir','denied'].includes(item.type) ? `<DIR>  ${name}` : name).join('\n'));
  }
  if (verb === 'cd') {
    if (!arg) return result(pathLabel(session.path));
    const location = resolvePath(computer, session, arg);
    if (location.error) return result(location.error, true);
    session.path = location.path;
    return result();
  }
  if (verb === 'open') {
    if (!arg) return result('Usage: open <file>', true);
    const filename=arg.replace(/^"(.*)"$/, '$1').replaceAll('/', '\\');
    const separator=filename.lastIndexOf('\\');
    const location=separator<0?{path:session.path}:resolvePath(computer,session,filename.slice(0,separator+1));
    if(location.error)return result(location.error,true);
    const found=entry(currentFolder(computer,location.path),filename.slice(separator+1));
    if(!found)return result('The system cannot find the file specified.',true);
    if(found[1].type==='album')return result('',false,{album:found[1].album,title:found[0]});
    if(found[1].type==='file'){
      const content=found[1].content;
      return result('',false,{note:typeof content==='function'?content(context):content,title:found[0],
        ...(found[1].interaction?{interaction:found[1].interaction}:{})});
    }
    return result('The system cannot open this file.',true);
  }
  const filename = verb === 'type' ? arg.replace(/^"(.*)"$/, '$1') : String(input).trim();
  if (verb === 'type' && !filename) return result('Usage: type <file>', true);
  const found = entry(currentFolder(computer, session.path), filename);
  if(found?.[1].type==='album'&&verb!=='type')return result(`Use open ${found[0]} to view this album.`,true);
  if (found?.[1].type === 'file') {
    const content = found[1].content;
    const note = typeof content === 'function' ? content(context) : content;
    return result('', false, {note, title: found[0],
      ...(found[1].interaction?{interaction:found[1].interaction}:{})});
  }
  if (found?.[1].type === 'action' && verb !== 'type') return result(found[1].message, false, {action: found[1].action, shutdown: found[1].action === 'shutdown'});
  if (found?.[1].type === 'unsupported' && verb !== 'type') return result(found[1].message, true);
  if (found && verb === 'type') return result('The system cannot open this file as text.', true);
  if (verb === 'type') return result('The system cannot find the file specified.', true);
  return result(`'${verb}' is not recognized as an internal or external command,\noperable program or batch file.`, true);
}
