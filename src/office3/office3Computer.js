import { createComputerSession, runComputerCommand } from '../terminal/virtualComputer.js';

export const COMPUTER_COOLDOWN_MS = 10_000;
export const NORMAL_FOLDER = 'Totally normal files';
export const PASSWORD_FOLDER = 'Definitely_not_important';
export const PASSWORD_FILE = 'Definitely not a password.txt';
export const ROOT_FOLDERS = ['Windows', 'Program Files', 'pc-user', NORMAL_FOLDER, PASSWORD_FOLDER];
export const OFFICE_FILES = Object.freeze({
  'very_safe_program.exe': null,
  'where is the director.txt': 'If I knew, this file would have a much better name.',
  'i have no idea where he is.txt': 'Update: I still have no idea where he is.',
  'secret_plan.txt': 'Step 1: Make a plan.\nStep 2: Keep it secret.\nStep 3: Remember the plan.',
  'secret plan but more secret.txt': 'See secret_plan.txt. But quietly.',
  'super-ecret-plan.txt': 'This plan is so secret that even I cannot access it.',
  'please_stop-making secret--plans.txt': 'We have a meeting at 9. Please make a normal agenda.',
  'excel_exercises_unnecessarily_difficult.xlsx': 'Spreadsheet viewer is not installed. Please contact IT. Preferably someone else.',
  'printer_threats.txt': 'Print this page or I will replace you with a pencil.',
  'things the printer has done.txt': 'Ate the report.\nPrinted 47 blank pages.\nClaimed to be offline while standing right here.',
  'proof_the_printer_is_alive.txt': 'It only jams when I am in a hurry. This cannot be a coincidence.',
});

export function passwordNote(code) {
  return `Safe Code: ${code}\n\nTO DO LIST:\n\n- Stop saving passwords in .txt files.\n- Rename this file to something less obvious.\n- Stop clicking "Remind me later" on Windows updates.\n- Buy coffee.\n- Find out why the printer only works when threatened.\n- Figure out what DNS actually stands for before the next meeting.\n- Stop pretending rebooting fixes everything.\n- Buy more coffee and maybe a burger.\n- Ignore previous TODO.`;
}

const file = content => ({type: 'file', content});
const normalFiles = Object.fromEntries(Object.entries(OFFICE_FILES).map(([name, content]) => [name,
  content === null ? {type: 'action', action: 'shutdown', message: 'Shutting down...'}
    : name.endsWith('.txt') ? file(content) : {type: 'unsupported', message: content}]));
// Individual computers provide data; the command engine contains no Office3-specific clues.
export const OFFICE3_COMPUTER = {
  hostname: 'PC-USER', ipv4: '192.168.10.20', ipv6: 'fe80::20',
  subnetMask: '255.255.255.0', gateway: '192.168.10.1',
  dns: {server: '192.168.10.5', serverName: 'dns.daa.local', records: {'director.daa.local': '192.168.10.42'}},
  dnsCache: {'director.daa.local': '192.168.10.99'},
  reachableIps: ['192.168.10.20', '192.168.10.42', '192.168.10.5'],
  extraIpconfigLines: ['   Connection-specific DNS Suffix  : daa.local'],
  services: [{id: 'director-archive', hostname: 'director.daa.local', ip: '192.168.10.42',
    port: 8443, requireHostname: true, title: 'DIRECTOR ARCHIVE', banner: 'DIRECTOR ARCHIVE\nAuthentication required.'}],
  filesystem: {type: 'dir', entries: {
    Windows: {type: 'denied'}, 'Program Files': {type: 'denied'}, 'pc-user': {type: 'denied'},
    [NORMAL_FOLDER]: {type: 'dir', entries: normalFiles},
    [PASSWORD_FOLDER]: {type: 'dir', entries: {[PASSWORD_FILE]: file(({code}) => passwordNote(code))}},
  }},
};

export const createOffice3ComputerSession = () => createComputerSession(OFFICE3_COMPUTER);

// Legacy API retained for existing callers and tests; interactive clients pass a session.
export function runOfficeCommand(folder, command, code, session = createOffice3ComputerSession()) {
  if (!session.path.length && folder) session.path = folder.split('\\').filter(Boolean);
  return runComputerCommand(OFFICE3_COMPUTER, session, command, {code});
}
