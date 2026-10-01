// Local fictional files; edit captions, paths and joke text here.
export const DIRECTOR_VACATION_ALBUM=Object.freeze({
  title:'Endlich Ferien',
  photos:[
    {src:'assets/director/vacation/endlich_ferien.png',caption:'Endlich ein bisschen Erholung.'},
    {src:'assets/director/vacation/pisa.png',caption:'Der Turm steht schief. Meine Pose ist korrekt.'},
    {src:'assets/director/vacation/beach.png',caption:'Keine Meetings. Nur Sand im Dienstlaptop.'},
    {src:'assets/director/vacation/tourist.png',caption:'Unauffällige Dienstkleidung für Außentermine.'},
    {src:'assets/director/vacation/pool_office.png',caption:'Homeoffice. Sehr weit von zu Hause.'},
    {src:'assets/director/vacation/pigeons.png',caption:'Die lokale Bevölkerung hat mein Mittagessen übernommen.'},
    {src:'assets/director/vacation/monkeys.png',caption:'Die Verpflegung wurde erfolgreich delegiert.'},
  ],
});

export const DIRECTOR_FILESYSTEM={type:'dir',entries:{
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
