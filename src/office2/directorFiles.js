import { DIRECTOR_INVESTIGATION_FILE,DIRECTOR_INVESTIGATION_EVENT } from './directorInvestigation.js';

// Local fictional files; edit captions, paths and joke text here.
export const DIRECTOR_VACATION_ALBUM=Object.freeze({
  title:'Endlich Ferien',
  photos:[
    {src:'assets/director/vacation/cover.png',caption:'Endlich ein bisschen Erholung.'},
    // Authored sequence in assets-drafts/director-album: foto1 through foto6.
    {src:'assets/director/vacation/foto1.png',caption:'Homeoffice mit Poolblick. Die Kleiderordnung prüfen wir später.'},
    {src:'assets/director/vacation/foto2.png',caption:'Ich halte den Turm. Er hält sich erstaunlich schlecht.'},
    {src:'assets/director/vacation/foto3.png',caption:'Die Karte ist falsch herum. Die Laune stimmt.'},
    {src:'assets/director/vacation/foto4.png',caption:'Das Mittagessen wurde erfolgreich delegiert. An die Affen.'},
    {src:'assets/director/vacation/foto5.png',caption:'Sonnenbrand: 1. Erholungsplan: 0.'},
    {src:'assets/director/vacation/foto6.png',caption:'Die lokale Presse stellt unangenehme Fragen.'},
  ],
});

export const DIRECTOR_FILESYSTEM={type:'dir',entries:{
  'Endlich Ferien.album':{type:'album',album:DIRECTOR_VACATION_ALBUM},
  [DIRECTOR_INVESTIGATION_FILE]:{type:'file',interaction:DIRECTOR_INVESTIGATION_EVENT,
    content:'Note to myself:\n\nI hid the key somewhere safe.\nUnfortunately, I made it so safe that I no longer remember where it is.\n\nI was still somewhere around the offices.\nI remember moving something.\nIt seemed like a brilliant idea at the time.\n\nFuture me will figure it out.'},
  Private:{type:'dir',entries:{
    'Endlich_Ferien.album':{type:'album',album:DIRECTOR_VACATION_ALBUM},
    'Urlaubsplanung_FINAL.txt':{type:'file',content:'Montag: nichts. Dienstag: das Gleiche, aber am Pool.'},
    'Urlaubsplanung_FINAL_REAL.txt':{type:'file',content:'Die andere FINAL-Datei ist veraltet. Diese vermutlich auch.'},
    'Bitte_nicht_HR_zeigen.txt':{type:'file',content:'Die Affen waren keine offiziellen Teammitglieder.'},
    'Expense_Report_Definitely_Work.txt':{type:'file',content:'Eis: Forschungsbedarf. Sonnenbrille: Datenschutz. Liegestuhl: ergonomischer Arbeitsplatz.'},
    'Pool_WiFi_Password.txt':{type:'file',content:'Das WLAN-Passwort wurde vom Pool verschluckt. Bitte nicht den IT-Support anrufen.'},
    'Things_I_Did_Not_Do_On_Vacation.txt':{type:'file',content:'Den Turm von Pisa reparieren. Tauben interviewen. Excel am Strand öffnen. Jedenfalls offiziell.'},
    'Photos_Do_Not_Open.album':{type:'album',album:{...DIRECTOR_VACATION_ALBUM,title:'Definitely work-related photos'}},
  }},
}};
