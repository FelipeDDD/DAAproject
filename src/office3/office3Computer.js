export const COMPUTER_COOLDOWN_MS = 10_000;
export const NORMAL_FOLDER = 'Totally_normal_files';
export const PASSWORD_FOLDER = 'Definitely_not_important';
export const PASSWORD_FILE = 'Definitely_not_a_password.txt';
export const ROOT_FOLDERS = ['Windows', 'Program Files', 'pc-user', NORMAL_FOLDER, PASSWORD_FOLDER];
export const OFFICE_FILES = Object.freeze({
  'very_safe_program.exe': null,
  'where_is_the_director.txt': 'If I knew, this file would have a much better name.',
  'i_have_no_idea_where_he_is.txt': 'Update: I still have no idea where he is.',
  'secret_plan.txt': 'Step 1: Make a plan.\nStep 2: Keep it secret.\nStep 3: Remember the plan.',
  'secret_plan_but_more_secret.txt': 'See secret_plan.txt. But quietly.',
  'super_secret_plan.txt': 'This plan is so secret that even I cannot access it.',
  'please_stop_making_secret_plans.txt': 'We have a meeting at 9. Please make a normal agenda.',
  'excel_exercises_unnecessarily_difficult.xlsx': 'Spreadsheet viewer is not installed. Please contact IT. Preferably someone else.',
  'printer_threats.txt': 'Print this page or I will replace you with a pencil.',
  'things_the_printer_has_done.txt': 'Ate the report.\nPrinted 47 blank pages.\nClaimed to be offline while standing right here.',
  'proof_the_printer_is_alive.txt': 'It only jams when I am in a hurry. This cannot be a coincidence.',
});

export function passwordNote(code) {
  return `Safe Code: ${code}\n\nTO DO LIST:\n\n- Stop saving passwords in .txt files.\n- Rename this file to something less obvious.\n- Stop clicking "Remind me later" on Windows updates.\n- Buy coffee.\n- Find out why the printer only works when threatened.\n- Figure out what DNS actually stands for before the next meeting.\n- Stop pretending rebooting fixes everything.\n- Buy more coffee and maybe a burger.\n- Ignore previous TODO.`;
}

// This is a fictional filesystem. Never evaluate commands or access real files.
export function runOfficeCommand(folder, command, code) {
  const text = command.trim(), lower = text.toLowerCase();
  const output = (message, error = false) => ({folder, message, error});
  if (lower === 'dir') return output((folder === '' ? ROOT_FOLDERS.map(name => `<DIR>  ${name}`)
    : folder === PASSWORD_FOLDER ? [PASSWORD_FILE] : Object.keys(OFFICE_FILES)).join('\n'));
  if (/^cd(?:\s|$)/i.test(text)) {
    let path = text.slice(2).trim().replace(/^"(.*)"$/, '$1').replaceAll('/', '\\');
    if (!path) return output(`C:\\${folder}`);
    if (path === '..' || path === '\\' || /^c:\\?$/i.test(path)) return {...output(''), folder: ''};
    const absolute = /^c:\\/i.test(path) || path.startsWith('\\');
    path = path.replace(/^c:\\/i, '').replace(/^\\|\\$/g, '');
    if (folder && !absolute) return output('The system cannot find the path specified.', true);
    const target = ROOT_FOLDERS.find(name => name.toLowerCase() === path.toLowerCase());
    if (!target) return output('The system cannot find the path specified.', true);
    if (target !== NORMAL_FOLDER && target !== PASSWORD_FOLDER)
      return output('You do not have permission to access this folder.', true);
    return {...output(''), folder: target};
  }
  if (folder === PASSWORD_FOLDER && lower === PASSWORD_FILE.toLowerCase())
    return {...output(''), note: passwordNote(code), title: PASSWORD_FILE};
  const file = folder === NORMAL_FOLDER ? Object.keys(OFFICE_FILES).find(name => name.toLowerCase() === lower) : undefined;
  if (file === 'very_safe_program.exe') return {...output('Shutting down...'), shutdown: true};
  if (file?.endsWith('.txt')) return {...output(''), note: OFFICE_FILES[file], title: file};
  if (file) return output(OFFICE_FILES[file], true);
  return output('Command not recognized.', true);
}
