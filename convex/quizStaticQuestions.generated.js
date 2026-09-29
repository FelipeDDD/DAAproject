// Generated from quiz-data/*.csv by scripts/sync-quiz-data.mjs. Do not edit.
export default [
  {
    "id": "betriebssysteme-001",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Hauptaufgabe übernimmt ein Betriebssystem zwischen Hardware und Anwendungssoftware?",
    "answers": [
      "Es verwaltet Ressourcen und bietet Anwendungen gemeinsame Systemdienste.",
      "Es übersetzt den Quellcode von Anwendungen in ausführbare Programme.",
      "Es initialisiert die Hardware vor dem Laden des Betriebssystemkerns.",
      "Es führt Anwendungsbefehle als elektronische Rechenschaltung aus."
    ],
    "correctAnswer": 0,
    "explanation": "Das Betriebssystem verwaltet unter anderem Prozessorzeit, Arbeitsspeicher, Geräte und Dateien und stellt Anwendungen Schnittstellen zu diesen Ressourcen bereit.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-002",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Programm reagiert nicht mehr, während andere Programme weiterhin normal funktionieren. Welche Aussage trifft am ehesten zu?",
    "answers": [
      "Der Scheduler hat die Ausführung sämtlicher Prozesse eingestellt.",
      "Der betroffene Prozess wartet auf eine Ressource oder ist fehlerhaft.",
      "Die grafische Sitzung verarbeitet keine Eingaben mehr für Anwendungen.",
      "Der Rechner hat den laufenden Betrieb für einen Neustart beendet."
    ],
    "correctAnswer": 1,
    "explanation": "Moderne Betriebssysteme trennen Prozesse voneinander. Ein einzelner blockierter Prozess muss deshalb nicht das gesamte System beeinträchtigen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-003",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche grundlegende Funktion erfüllt virtueller Speicher?",
    "answers": [
      "Er hält Kopien häufig verwendeter Daten in einem schnellen Zwischenspeicher bereit.",
      "Er stellt virtuelle Adressräume bereit und ordnet deren Adressen physischen Speicherbereichen zu.",
      "Er bezeichnet einen Datenträgerbereich, in dem ausgelagerte Speicherseiten liegen.",
      "Er reserviert jedem Prozess einen festen, zusammenhängenden Bereich im physischen RAM."
    ],
    "correctAnswer": 1,
    "explanation": "Virtueller Speicher stellt Prozessen virtuelle Adressräume bereit. Seitentabellen und die Speicherverwaltung bilden virtuelle Adressen auf physischen Speicher ab und unterstützen den Speicherschutz. Das Auslagern von Seiten auf Datenträger ist eine mögliche Ergänzung, aber keine Voraussetzung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-004",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum ist ständiges starkes Auslagern auf eine SSD oder HDD meist ein Hinweis auf ein Leistungsproblem?",
    "answers": [
      "Das Nachladen vom Datenträger verursacht höhere Zugriffszeiten als der Zugriff auf bereits im RAM liegende Seiten.",
      "Der Zugriff auf eine ausgelagerte Seite ist schneller als ein RAM-Zugriff, die Verzögerung entsteht beim Bildschirmaufbau.",
      "Ausgelagerte Seiten werden direkt von der CPU auf dem Datenträger verarbeitet und müssen nicht in den RAM zurück.",
      "Ein größerer Auslagerungsbereich erhöht die Zugriffszeit des physischen RAMs auch ohne Auslagerungszugriffe."
    ],
    "correctAnswer": 0,
    "explanation": "Wenn häufig Speicherseiten zwischen RAM und Massenspeicher übertragen werden, entstehen deutlich höhere Zugriffszeiten als bei direktem Zugriff auf den Arbeitsspeicher.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-005",
    "category": "Betriebssysteme",
    "topic": "Umgebungsvariablen",
    "difficulty": "medium",
    "question": "Ein ausführbares Linux-Programm lässt sich über seinen vollständigen Pfad starten, über seinen Namen jedoch nicht. Welche Umgebungsvariable bestimmt die durchsuchten Programmverzeichnisse?",
    "answers": [
      "HOME",
      "PATH",
      "LANG",
      "SHELL"
    ],
    "correctAnswer": 1,
    "explanation": "PATH enthält die Verzeichnisse, in denen die Shell nach externen Befehlen ohne Pfadangabe sucht. Fehlt das Programmverzeichnis dort, kann der vollständige Pfad weiterhin funktionieren.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-006",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Benutzer öffnet eine reguläre Datei unter Linux. Er besitzt Leserechte, aber keine Schreibrechte auf diese Datei; der Zugriff auf das übergeordnete Verzeichnis ist erlaubt. Welche Operation am Dateiinhalt ist damit zulässig?",
    "answers": [
      "Den vorhandenen Inhalt anzeigen.",
      "Den vorhandenen Inhalt überschreiben.",
      "Weitere Daten an die Datei anhängen.",
      "Den Inhalt auf eine Länge von null Bytes kürzen."
    ],
    "correctAnswer": 0,
    "explanation": "Leserechte erlauben das Lesen des Inhalts. Überschreiben, Anhängen und Kürzen erfordern Schreibrechte auf die Datei. Das Löschen eines Verzeichniseintrags hängt dagegen von den Rechten am übergeordneten Verzeichnis ab.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-007",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aussage beschreibt den Unterschied zwischen einem Prozess und einem Thread am besten?",
    "answers": [
      "Threads eines Prozesses teilen dessen Adressraum; Prozesse haben normalerweise getrennte Adressräume.",
      "Threads eines Prozesses haben getrennte Adressräume; Prozesse teilen normalerweise denselben Adressraum.",
      "Ein Prozess ist eine gespeicherte Programmdatei; ein Thread ist die gestartete Instanz dieser Datei.",
      "Ein Prozess verwaltet Benutzerrechte; ein Thread verwaltet die Dateien des Benutzers."
    ],
    "correctAnswer": 0,
    "explanation": "Threads gehören zu einem Prozess und können Ressourcen wie dessen Adressraum gemeinsam nutzen. Prozesse sind stärker voneinander getrennte Ausführungseinheiten.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-008",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum sind regelmäßige Betriebssystem-Updates in Unternehmen wichtig?",
    "answers": [
      "Sie können bekannte Sicherheitslücken schließen und Softwarefehler beheben.",
      "Sie können die Überprüfung von Zugriffsrechten im Betrieb ersetzen.",
      "Sie können die Sicherung veränderlicher Benutzerdaten übernehmen.",
      "Sie können die betriebliche Freigabe neuer Software überflüssig machen."
    ],
    "correctAnswer": 0,
    "explanation": "Updates beheben häufig bekannte Fehler und Sicherheitslücken. Sie reduzieren Risiken, können Angriffe aber nicht grundsätzlich verhindern.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-009",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe übernimmt ein Dateisystem wie NTFS oder ext4?",
    "answers": [
      "Es organisiert Dateien, Verzeichnisse und deren Metadaten auf einem Datenträger.",
      "Es legt die Reihenfolge fest, in der Prozesse Rechenzeit erhalten.",
      "Es übersetzt virtuelle Speicheradressen in physische RAM-Adressen.",
      "Es teilt einen Datenträger durch Partitionseinträge in logische Bereiche auf."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Dateisystem organisiert die Speicherung, Benennung und Verwaltung von Dateien und Verzeichnissen auf einem Datenträger.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-010",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welchen Vorteil kann eine native 64-Bit-Anwendung gegenüber einer 32-Bit-Anwendung bei großen Datenmengen haben?",
    "answers": [
      "Sie kann einen größeren virtuellen Adressraum innerhalb ihres Prozesses nutzen.",
      "Sie benötigt für jede Speicheradresse weniger Bits als eine 32-Bit-Anwendung.",
      "Sie greift ohne virtuelle Adressen unmittelbar auf alle physischen RAM-Bereiche zu.",
      "Sie verdoppelt allein durch das Programmformat die Speicherbandbreite des Rechners."
    ],
    "correctAnswer": 0,
    "explanation": "Ein 64-Bit-Programmformat ermöglicht einen größeren virtuellen Adressraum pro Prozess. Die tatsächlich nutzbare Größe hängt von Architektur und Betriebssystem ab; eine höhere Speicherbandbreite folgt daraus nicht automatisch.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-011",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Prozess fordert Speicher an, greift aber zunächst nicht auf alle angeforderten Seiten zu. Warum kann der tatsächlich belegte physische RAM zunächst kleiner sein als der reservierte virtuelle Adressraum?",
    "answers": [
      "Physische Seiten können erst bei einem tatsächlichen Zugriff zugeordnet werden.",
      "Jede Reservierung belegt sofort dieselbe Menge physischen RAMs; die RAM-Anzeige erfasst diesen Speicher nicht.",
      "Reservierte Bereiche werden zunächst im Datenträgercache hinterlegt und deshalb nicht als Prozessspeicher gezählt.",
      "Der Scheduler teilt reservierten Speicher nach CPU-Priorität zu, unabhängig vom Zugriff auf die Seiten."
    ],
    "correctAnswer": 0,
    "explanation": "Moderne Betriebssysteme können Speicher per Demand Paging erst dann mit physischen Seiten hinterlegen, wenn tatsächlich darauf zugegriffen wird.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-012",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "hard",
    "question": "Zwei Prozesse laufen gleichzeitig auf demselben Betriebssystem. Warum kann Prozess A normalerweise nicht direkt auf beliebige Speicheradressen von Prozess B zugreifen?",
    "answers": [
      "Virtuelle Adressräume und hardwaregestützte Zugriffsprüfungen begrenzen den erreichbaren Prozessspeicher.",
      "Die Vergabe unterschiedlicher Prozess-IDs genügt bereits als Zugriffsschutz für alle Speicheradressen.",
      "Die Trennung der CPU-Zeitscheiben verhindert Speicherzugriffe auf Daten eines anderen Prozesses.",
      "Die Leserechte der ausführbaren Programmdatei legen fest, welche fremden RAM-Adressen erreichbar sind."
    ],
    "correctAnswer": 0,
    "explanation": "Virtuelle Speicherverwaltung und Schutzmechanismen des Prozessors sorgen dafür, dass Prozesse getrennte Adressräume verwenden und nicht beliebig auf fremden Speicher zugreifen können.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-013",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein System nutzt intensiv virtuellen Speicher und verbringt einen großen Teil der Zeit mit dem Ein- und Auslagern von Speicherseiten. Wie wird dieser Zustand typischerweise bezeichnet?",
    "answers": [
      "Thrashing",
      "Fragmentierung",
      "Spooling",
      "Polling"
    ],
    "correctAnswer": 0,
    "explanation": "Thrashing beschreibt einen Zustand, in dem sehr häufig Speicherseiten zwischen RAM und Massenspeicher ausgetauscht werden und dadurch kaum noch produktive Arbeit erfolgt.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-014",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "hard",
    "question": "Warum kann ein Dateisystem mit Journaling nach einem unerwarteten Stromausfall Vorteile bieten?",
    "answers": [
      "Ein Änderungsprotokoll unterstützt die Wiederherstellung konsistenter Dateisystemstrukturen.",
      "Historische Kopien der Dateiinhalte ermöglichen die Auswahl einer beliebigen früheren Dateiversion.",
      "Eine zweite Datenträgerkopie übernimmt nach dem Ausfall die Rolle des ursprünglichen Laufwerks.",
      "Ein batteriegepufferter Schreibcache bewahrt noch nicht geschriebene Daten über den Stromausfall hinaus auf."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Journal protokolliert relevante Dateisystemänderungen, sodass nach einem Absturz oder Stromausfall die Konsistenz des Dateisystems schneller und zuverlässiger wiederhergestellt werden kann.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-015",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Prozess verwendet mehrere vom Kernel verwaltete Threads. Ein Thread wartet auf eine langsame Ein-/Ausgabeoperation. Was gilt für andere ausführungsbereite Threads dieses Prozesses?",
    "answers": [
      "Sie können weiterlaufen, wenn keine zusätzliche Abhängigkeit sie blockiert.",
      "Sie müssen bis zum Abschluss der Ein-/Ausgabe ebenfalls im Wartezustand bleiben.",
      "Sie werden vom Scheduler bis zum nächsten Prozessstart aus der Warteschlange entfernt.",
      "Sie übernehmen automatisch die noch ausstehende Ein-/Ausgabe des wartenden Threads."
    ],
    "correctAnswer": 0,
    "explanation": "Der Kernel kann ausführungsbereite Threads unabhängig vom auf I/O wartenden Thread einplanen. Gemeinsame Sperren oder andere Abhängigkeiten können die übrigen Threads allerdings ebenfalls blockieren.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-016",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Über welche Schnittstelle fordert eine Anwendung beim Kernel typischerweise das Öffnen oder Lesen einer Datei an?",
    "answers": [
      "Über die Systemaufrufschnittstelle.",
      "Über die Systemstartkonfiguration.",
      "Über die Paketquellenkonfiguration.",
      "Über die Prozessprioritätseinstellung."
    ],
    "correctAnswer": 0,
    "explanation": "Bibliotheksfunktionen können Dateizugriffe über Systemaufrufe anfordern. Der Kernel prüft dabei Berechtigungen und koordiniert den Zugriff auf das Dateisystem.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-017",
    "category": "Betriebssysteme",
    "topic": "Linux-Prozesssignale",
    "difficulty": "medium",
    "question": "Ein Linux-Prozess soll zum Beenden aufgefordert werden und dabei Gelegenheit erhalten, eigene Aufräumroutinen auszuführen. Welches Signal ist dafür vorgesehen?",
    "answers": [
      "SIGSTOP",
      "SIGKILL",
      "SIGTERM",
      "SIGCONT"
    ],
    "correctAnswer": 2,
    "explanation": "SIGTERM fordert die Beendigung an und kann vom Prozess behandelt werden, etwa zum Schließen von Dateien. SIGKILL lässt sich nicht abfangen und ermöglicht solche Aufräumroutinen nicht.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-018",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Thread?",
    "answers": [
      "Ein Ausführungsstrang innerhalb eines Prozesses.",
      "Eine noch nicht gestartete ausführbare Programmdatei.",
      "Ein vom Scheduler zugeteilter Zeitraum auf einer CPU.",
      "Ein gespeichertes Abbild eines beendeten Prozesses."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Thread ist ein Ausführungsstrang mit eigenem Befehlszeiger und Stack. Mehrere Threads eines Prozesses teilen typischerweise dessen Adressraum und weitere Ressourcen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-019",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Information gehört typischerweise zu den Metadaten einer Datei?",
    "answers": [
      "Der Zeitpunkt ihrer letzten Änderung.",
      "Der erste Absatz ihres Textinhalts.",
      "Das abgebildete Motiv einer Bilddatei.",
      "Die Melodie einer gespeicherten Audiodatei."
    ],
    "correctAnswer": 0,
    "explanation": "Metadaten beschreiben eine Datei, etwa Größe, Zeitstempel, Eigentümer und Zugriffsrechte. Sie sind von den eigentlichen Nutzdaten der Datei zu unterscheiden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-020",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welches Dateisystem wird typischerweise für Windows-Systemlaufwerke verwendet?",
    "answers": [
      "NTFS",
      "ext4",
      "APFS",
      "ISO 9660"
    ],
    "correctAnswer": 0,
    "explanation": "NTFS ist das übliche Dateisystem für moderne Windows-Systemlaufwerke.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-021",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welches Dateisystem ist auf vielen Linux-Systemen verbreitet?",
    "answers": [
      "ext4",
      "NTFS",
      "APFS",
      "FAT12"
    ],
    "correctAnswer": 0,
    "explanation": "ext4 ist ein weit verbreitetes Linux-Dateisystem.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-022",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aussage zu Dateiberechtigungen ist korrekt?",
    "answers": [
      "Sie legen erlaubte Dateioperationen für Benutzer und Gruppen fest.",
      "Sie legen die Reihenfolge der physischen Datenblöcke einer Datei fest.",
      "Sie legen das vom Dateisystem verwendete Kompressionsverfahren fest.",
      "Sie legen die Aufbewahrungsdauer gelöschter Dateien im Papierkorb fest."
    ],
    "correctAnswer": 0,
    "explanation": "Berechtigungen regeln Zugriffsrechte auf Ressourcen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-023",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum ist das Prinzip der geringsten Rechte sinnvoll?",
    "answers": [
      "Begrenzte Rechte verringern den möglichen Schaden bei Fehlern oder kompromittierten Konten.",
      "Gleiche Administratorrechte für alle Konten erleichtern die Nachverfolgung einzelner Aktionen.",
      "Häufig wechselnde Rechte ersetzen die Prüfung der Benutzeridentität bei der Anmeldung.",
      "Zusätzliche Schreibrechte verhindern, dass Anwendungen durch fehlende Berechtigungen angreifbar werden."
    ],
    "correctAnswer": 0,
    "explanation": "Beim Prinzip der geringsten Rechte erhalten Benutzer und Dienste die für ihre Aufgaben erforderlichen Berechtigungen. Dadurch bleiben die Auswirkungen von Fehlbedienung oder einem kompromittierten Konto begrenzt.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-024",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was unterscheidet ein lokales Windows-Benutzerkonto von einem Konto in einer Active-Directory-Domäne?",
    "answers": [
      "Das lokale Konto wird auf dem Rechner verwaltet, das Domänenkonto zentral in Active Directory.",
      "Das lokale Konto gilt auf allen Domänenrechnern, das Domänenkonto auf einem einzelnen Rechner.",
      "Das lokale Konto speichert Gruppenmitgliedschaften zentral, das Domänenkonto in jeder Anwendung.",
      "Das lokale Konto nutzt einen Domänencontroller zur Verwaltung, das Domänenkonto die lokale Kontodatenbank."
    ],
    "correctAnswer": 0,
    "explanation": "Lokale Konten werden in der Kontodatenbank des jeweiligen Rechners verwaltet. Konten einer Active-Directory-Domäne werden zentral verwaltet und können für den Zugriff auf Domänenressourcen berechtigt werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-025",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welcher Befehl zeigt unter Windows typischerweise die IP-Konfiguration an?",
    "answers": [
      "ipconfig",
      "nslookup",
      "netstat",
      "tracert"
    ],
    "correctAnswer": 0,
    "explanation": "ipconfig zeigt unter Windows Netzwerkadapter und IP-Konfigurationen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-026",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bewirkt ipconfig /release auf einer Windows-Schnittstelle, die ihre IPv4-Konfiguration per DHCP bezieht?",
    "answers": [
      "Der Client gibt die DHCP-Lease frei und verwirft die zugehörige IPv4-Konfiguration.",
      "Der Client erneuert die Lease und übernimmt die vom DHCP-Server angebotene Konfiguration.",
      "Der Client leert die gespeicherten Antworten des lokalen DNS-Resolver-Caches.",
      "Der Client registriert seinen Rechnernamen erneut beim konfigurierten DNS-Server."
    ],
    "correctAnswer": 0,
    "explanation": "ipconfig /release sendet eine DHCPRELEASE-Nachricht und verwirft die DHCP-Konfiguration der betroffenen Schnittstelle. Die Verbindung über diese IPv4-Konfiguration steht danach nicht mehr zur Verfügung, bis eine neue Konfiguration eingerichtet wird.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-027",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bewirkt ipconfig /renew?",
    "answers": [
      "Der Client fordert eine DHCP-Konfiguration an oder erneuert seine Lease.",
      "Der Client gibt seine DHCP-Lease frei und entfernt die zugehörige IP-Konfiguration.",
      "Der Client leert die gespeicherten Antworten seines DNS-Resolver-Caches.",
      "Der Client zeigt die aktuellen Einträge seiner IPv4-Routingtabelle an."
    ],
    "correctAnswer": 0,
    "explanation": "Der Befehl initiiert eine DHCP-Erneuerung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-028",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was macht ipconfig /flushdns?",
    "answers": [
      "Die zwischengespeicherten DNS-Antworten des lokalen Windows-Resolvers leeren.",
      "Die gespeicherten IPv4-zu-MAC-Zuordnungen des lokalen Rechners leeren.",
      "Die DHCP-Lease der lokalen Netzwerkschnittstelle freigeben.",
      "Die statischen Routen aus der lokalen IPv4-Routingtabelle entfernen."
    ],
    "correctAnswer": 0,
    "explanation": "ipconfig /flushdns leert den lokalen DNS-Resolver-Cache von Windows. Das kann veraltete oder negativ zwischengespeicherte Antworten beseitigen; Caches anderer Rechner oder einzelner Anwendungen werden dadurch nicht geleert.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-029",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welcher Windows-Befehl zeigt die lokale ARP-Tabelle an?",
    "answers": [
      "arp -a",
      "route -f",
      "net user",
      "sfc /scannow"
    ],
    "correctAnswer": 0,
    "explanation": "arp -a zeigt gelernte IPv4-zu-MAC-Zuordnungen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-030",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welcher Befehl testet typischerweise die Erreichbarkeit eines Hosts mit ICMP?",
    "answers": [
      "ping",
      "nslookup",
      "netstat",
      "arp"
    ],
    "correctAnswer": 0,
    "explanation": "ping sendet ICMP-Echo-Anfragen und wertet Antworten sowie Laufzeiten aus. Eine fehlende Antwort beweist keine Nichterreichbarkeit, da ICMP gefiltert oder nicht beantwortet werden kann.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-031",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welcher Befehl zeigt unter Windows typischerweise die Route über mehrere Hops zum Ziel?",
    "answers": [
      "tracert",
      "nslookup",
      "netstat -r",
      "arp -a"
    ],
    "correctAnswer": 0,
    "explanation": "tracert sendet Pakete mit schrittweise erhöhtem Hop-Limit, bei IPv4 als TTL bezeichnet. Antworten von Zwischenstationen machen Hops sichtbar; Filterung oder fehlende Antworten können Lücken in der Ausgabe verursachen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-032",
    "category": "Betriebssysteme",
    "topic": "Linux-Dateisystemdiagnose",
    "difficulty": "medium",
    "question": "Auf einem ext4-Dateisystem lassen sich keine neuen Dateien anlegen. df -h zeigt freien Speicherplatz, df -i jedoch 100 % belegte Inodes. Welche Ressource ist erschöpft?",
    "answers": [
      "Die verfügbaren Datenblöcke des Dateisystems",
      "Die verfügbaren Inodes des Dateisystems",
      "Die verfügbaren Dateideskriptoren des Prozesses",
      "Die verfügbaren Arbeitsspeicherseiten des Systems"
    ],
    "correctAnswer": 1,
    "explanation": "Eine neue Datei benötigt einen freien Inode für ihre Metadaten. Sind alle Inodes belegt, können trotz freier Datenblöcke keine weiteren Dateien angelegt werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-033",
    "category": "Betriebssysteme",
    "topic": "Energieverwaltung",
    "difficulty": "medium",
    "question": "Wie bewahrt ein Notebook im Ruhezustand (Hibernate) seinen Arbeitszustand auch bei vollständig unterbrochener Stromversorgung?",
    "answers": [
      "Es hält den Arbeitsspeicher über die Mainboard-Batterie unter Spannung.",
      "Es überträgt den Arbeitsspeicherinhalt in den Flash-Speicher der UEFI-Firmware.",
      "Es hält den Arbeitsspeicherinhalt ohne Versorgung in den RAM-Modulen.",
      "Es sichert den Arbeitsspeicherinhalt vor dem Abschalten auf einem Massenspeicher."
    ],
    "correctAnswer": 3,
    "explanation": "Beim Ruhezustand wird der Arbeitszustand auf nichtflüchtigem Speicher gesichert. Beim Fortsetzen wird er wiederhergestellt; eine dauerhafte Stromversorgung des RAM ist dafür nicht erforderlich.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-034",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum kann das Neustarten eines Dienstes ein Problem beheben, ohne den gesamten PC neu zu starten?",
    "answers": [
      "Die betroffene Dienstinstanz wird beendet und mit neuem internem Zustand gestartet.",
      "Die ausführbare Datei des Dienstes wird dabei aus einer Sicherung wiederhergestellt.",
      "Die registrierten Abhängigkeiten des Dienstes werden dabei aus der Konfiguration entfernt.",
      "Die gespeicherten Einstellungen des Dienstes werden dabei auf Installationswerte zurückgesetzt."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Neustart kann einen fehlerhaften Laufzeitzustand des Dienstes beseitigen. Persistente Konfigurationsfehler bleiben dabei bestehen; abhängige Dienste können ebenfalls betroffen sein.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-035",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist der Unterschied zwischen Herunterfahren und hartem Ausschalten einer VM?",
    "answers": [
      "Herunterfahren gibt dem Gast Zeit zum Abschließen von Schreibvorgängen; hartes Ausschalten unterbricht ihn sofort.",
      "Herunterfahren verwirft ausstehende Schreibvorgänge; hartes Ausschalten wartet auf deren Abschluss.",
      "Herunterfahren speichert den RAM zum Fortsetzen; hartes Ausschalten beendet die Dienste geordnet.",
      "Herunterfahren setzt den letzten Checkpoint zurück; hartes Ausschalten sichert den aktuellen Zustand."
    ],
    "correctAnswer": 0,
    "explanation": "Sauberes Herunterfahren reduziert das Risiko inkonsistenter Daten.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-036",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist eine virtuelle Maschine?",
    "answers": [
      "Ein System mit virtueller Hardware, auf dem ein eigenes Gastbetriebssystem ausgeführt wird.",
      "Eine isolierte Anwendungsumgebung, die den Kernel des Hosts mit anderen Umgebungen teilt.",
      "Eine gespeicherte Installationsdatei, aus der ein Betriebssystem eingerichtet werden kann.",
      "Eine Fernzugriffssitzung, die den Bildschirm eines anderen Rechners überträgt."
    ],
    "correctAnswer": 0,
    "explanation": "VMs virtualisieren Hardware-Ressourcen und führen Gastbetriebssysteme isoliert aus.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-037",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Hypervisor?",
    "answers": [
      "Eine Plattform, die virtuelle Maschinen ausführt und ihnen Hardware-Ressourcen zuweist.",
      "Ein Programm, das Anwendungen in einem gemeinsamen Gastbetriebssystem installiert.",
      "Ein Dienst, der Benutzerprofile zwischen mehreren virtuellen Maschinen synchronisiert.",
      "Ein Werkzeug, das den Inhalt virtueller Festplatten unabhängig von laufenden VMs archiviert."
    ],
    "correctAnswer": 0,
    "explanation": "Hypervisoren wie Hyper-V koordinieren virtuelle CPUs, RAM, Datenträger und Netzwerkgeräte.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-038",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Wie unterscheiden sich Typ-1- und Typ-2-Hypervisoren in ihrer grundlegenden Architektur?",
    "answers": [
      "Typ 1 läuft direkt auf der Hardware; Typ 2 setzt auf einem Host-Betriebssystem auf.",
      "Typ 1 setzt auf einem Host-Betriebssystem auf; Typ 2 läuft direkt auf der Hardware.",
      "Typ 1 benötigt einen festen CPU-Kern je VM; Typ 2 teilt CPU-Zeit zwischen VMs auf.",
      "Typ 1 speichert virtuelle Festplatten als Dateien; Typ 2 greift auf Datenträger ohne Virtualisierung zu."
    ],
    "correctAnswer": 0,
    "explanation": "Die Einteilung beschreibt die Position des Hypervisors im Systemaufbau. Typ 1 bildet die Virtualisierungsschicht auf der Hardware, Typ 2 nutzt ein Host-Betriebssystem.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-039",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Snapshot/Checkpoint einer VM?",
    "answers": [
      "Ein gesicherter Zustandspunkt, zu dem eine VM zurückgesetzt werden kann.",
      "Eine unabhängige Archivkopie der VM auf einem getrennten Sicherungsmedium.",
      "Eine Vorlage, aus der neue VMs mit eigener Identität bereitgestellt werden.",
      "Eine laufend synchronisierte zweite VM für die Übernahme bei Hostausfall."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Checkpoint hält einen Zustand der VM zum späteren Zurücksetzen fest. Welche Zustandsbestandteile erfasst werden, hängt vom Checkpoint-Typ ab. Checkpoints hängen typischerweise von vorhandenen VM-Datenträgern ab und ersetzen deshalb kein unabhängiges Backup.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-040",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "hard",
    "question": "Eine VM verwendet mehrere aufeinander aufbauende differenzierende Datenträger. Warum kann eine lange Checkpoint-Kette Lesezugriffe aufwendiger machen?",
    "answers": [
      "Ein angeforderter Block muss gegebenenfalls in mehreren Ebenen der Kette gesucht werden.",
      "Jeder Lesezugriff muss zuerst alle älteren Checkpoints in eine neue Vollkopie zusammenführen.",
      "Jeder Datenträger der Kette muss denselben Block enthalten, bevor der Gast ihn lesen darf.",
      "Der Gast muss für jeden Zugriff die Dateisystemprüfung aller Checkpoints abschließen."
    ],
    "correctAnswer": 0,
    "explanation": "Liegt ein Block nicht im aktuellen differenzierenden Datenträger, kann er in einer übergeordneten Ebene liegen. Das Durchlaufen mehrerer Ebenen kann zusätzlichen Aufwand erzeugen; tatsächliche Auswirkungen hängen unter anderem von Speichertechnik und Caching ab.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-041",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Bootloader?",
    "answers": [
      "Ein Programm, das den Betriebssystemkernel lädt und dessen Start vorbereitet.",
      "Ein Programm, das laufenden Prozessen CPU-Zeit zuweist.",
      "Ein Dienst, der Benutzer nach dem Systemstart authentifiziert.",
      "Ein Treiber, der im laufenden System Dateizugriffe bearbeitet."
    ],
    "correctAnswer": 0,
    "explanation": "UEFI/BIOS lädt typischerweise einen Bootloader, der anschließend das Betriebssystem startet.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-042",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Reihenfolge beschreibt vereinfacht den Start eines Rechners mit separatem Bootloader?",
    "answers": [
      "UEFI/BIOS → Bootloader → Betriebssystemkernel → Dienste/Benutzerumgebung",
      "Bootloader → UEFI/BIOS → Betriebssystemkernel → Dienste/Benutzerumgebung",
      "UEFI/BIOS → Betriebssystemkernel → Bootloader → Dienste/Benutzerumgebung",
      "UEFI/BIOS → Bootloader → Dienste/Benutzerumgebung → Betriebssystemkernel"
    ],
    "correctAnswer": 0,
    "explanation": "Firmware initialisiert die Plattform, danach folgt der Bootloader und anschließend der Kernel.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-043",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Kernel?",
    "answers": [
      "Der Betriebssystemkern, der Speicher, Prozesse und Gerätezugriffe koordiniert.",
      "Die grafische Oberfläche, über die Benutzer Programme und Dateien öffnen.",
      "Die Kommandozeilenumgebung, die Benutzereingaben als Befehle interpretiert.",
      "Die Firmware, die vor dem Laden des Betriebssystems die Hardware initialisiert."
    ],
    "correctAnswer": 0,
    "explanation": "Der Kernel bildet den Kern des Betriebssystems und stellt grundlegende Systemfunktionen bereit.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-044",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist Swap bzw. eine Auslagerungsdatei?",
    "answers": [
      "Ein Bereich auf einem Datenträger, in den Speicherseiten ausgelagert werden können.",
      "Ein RAM-Bereich, in dem kürzlich gelesene Dateiinhalte zwischengespeichert werden.",
      "Ein CPU-Speicher, der häufig benötigte Befehle und Daten bereithält.",
      "Ein Datenträgerabbild, das den Arbeitszustand für den Ruhezustand sichert."
    ],
    "correctAnswer": 0,
    "explanation": "Auslagerung kann RAM-Inhalte auf Datenträger verschieben, ist aber deutlich langsamer als RAM.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-045",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Rechner wird bei hoher Auslastung sehr langsam. Welche Messwerte sprechen besonders für Speicherdruck mit starker Auslagerung?",
    "answers": [
      "Wenig verfügbarer RAM zusammen mit vielen Seitenzugriffen auf den Auslagerungsdatenträger.",
      "Hohe CPU-Auslastung zusammen mit viel verfügbarem RAM und wenigen Datenträgerzugriffen.",
      "Hohe Netzwerklatenz zusammen mit wenig CPU-Auslastung und viel verfügbarem RAM.",
      "Hohe GPU-Auslastung zusammen mit wenig Datenträgeraktivität und viel verfügbarem RAM."
    ],
    "correctAnswer": 0,
    "explanation": "Wenig verfügbarer RAM und häufige Zugriffe auf ausgelagerte Speicherseiten sprechen zusammen für Speicherdruck. Hohe Datenträgerauslastung allein reicht nicht aus, weil auch normale Dateioperationen sie verursachen können.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-046",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist der Unterschied zwischen Administrator- und Standardbenutzerkonto?",
    "answers": [
      "Administrative Rechte ermöglichen systemweite Änderungen; Standardkonten benötigen dafür eine Berechtigungserhöhung.",
      "Administrative Rechte betreffen persönliche Dateien; Standardkonten verwalten die systemweiten Einstellungen.",
      "Administrative Rechte gelten für grafische Programme; Standardkonten verwalten das System über die Kommandozeile.",
      "Administrative Rechte erlauben Netzwerkzugriffe; Standardkonten dürfen Programme lokal installieren und Dienste ändern."
    ],
    "correctAnswer": 0,
    "explanation": "Die Trennung reduziert Risiken durch unnötig hohe Rechte.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-047",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Wozu dient UAC unter Windows?",
    "answers": [
      "Eine kontrollierte Rechteerhöhung für administrative Aktionen ermöglichen.",
      "Dateiinhalte anhand des angemeldeten Benutzers verschlüsseln.",
      "Die Mitgliedschaft von Benutzerkonten in Domänengruppen verwalten.",
      "Das Kennwort eines Benutzerkontos nach einer festgelegten Frist erneuern."
    ],
    "correctAnswer": 0,
    "explanation": "User Account Control hilft, administrative Aktionen von normalen Benutzeraktionen zu trennen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-048",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aussage beschreibt sudo unter Linux korrekt?",
    "answers": [
      "Es führt erlaubte Befehle im Kontext eines anderen Benutzers aus, standardmäßig root.",
      "Es fügt den aufrufenden Benutzer dauerhaft zur Administratorgruppe hinzu.",
      "Es ändert den Eigentümer der angegebenen ausführbaren Datei auf root.",
      "Es startet den angegebenen Befehl nach einem festgelegten Zeitplan."
    ],
    "correctAnswer": 0,
    "explanation": "sudo prüft eine Richtlinie und führt erlaubte Befehle als Zielbenutzer aus, standardmäßig als root. Der Zielbenutzer kann auch ein anderes, weniger privilegiertes Konto sein.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-049",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welcher Linux-Befehl zeigt typischerweise das aktuelle Verzeichnis an?",
    "answers": [
      "pwd",
      "cd",
      "ls",
      "ip"
    ],
    "correctAnswer": 0,
    "explanation": "pwd steht für print working directory.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-050",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welcher Linux-Befehl listet Dateien und Verzeichnisse auf?",
    "answers": [
      "ls",
      "pwd",
      "mkdir",
      "sudo"
    ],
    "correctAnswer": 0,
    "explanation": "ls listet Verzeichnisinhalte auf.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-051",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat sudo apt update auf einem Debian- oder Ubuntu-System?",
    "answers": [
      "Die lokalen Paketlisten aus den konfigurierten Paketquellen aktualisieren.",
      "Die installierten Pakete auf neuere verfügbare Versionen aktualisieren.",
      "Nicht mehr benötigte automatisch installierte Pakete entfernen.",
      "Bereits heruntergeladene Paketdateien aus dem lokalen Cache löschen."
    ],
    "correctAnswer": 0,
    "explanation": "apt update lädt aktuelle Paketinformationen aus den konfigurierten Quellen. Installierte Programme werden dadurch noch nicht aktualisiert; dafür dient beispielsweise apt upgrade.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-052",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat sudo apt upgrade auf einem Debian- oder Ubuntu-System?",
    "answers": [
      "Installierte Pakete auf verfügbare neuere Versionen aktualisieren.",
      "Die lokalen Informationen über verfügbare Paketversionen neu einlesen.",
      "Nicht mehr benötigte automatisch installierte Pakete entfernen.",
      "Die Paketdateien aus dem lokalen Download-Cache löschen."
    ],
    "correctAnswer": 0,
    "explanation": "apt upgrade installiert neuere Versionen vorhandener Pakete anhand der lokalen Paketlisten. Bei Bedarf können neue Abhängigkeiten hinzukommen; vorhandene Pakete werden dabei nicht entfernt. Solche Konflikte können dazu führen, dass Aktualisierungen zurückgehalten werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-053",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum sollte man vor tiefgreifenden Systemänderungen einen Wiederherstellungsplan besitzen?",
    "answers": [
      "Ein getesteter Rückweg begrenzt Ausfallzeit und Datenverlust, wenn die Änderung fehlschlägt.",
      "Ein dokumentierter Rückweg ersetzt die Prüfung, ob vorhandene Sicherungen lesbar sind.",
      "Ein Wiederherstellungsplan behebt vorhandene Konfigurationsfehler bereits vor der Änderung.",
      "Ein Wiederherstellungsplan macht die Abstimmung eines Wartungsfensters überflüssig."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Wiederherstellungsplan beschreibt, wie nach einer fehlgeschlagenen Änderung ein funktionsfähiger Zustand erreicht wird. Dazu gehören geeignete Sicherungen, getestete Schritte und die benötigten Zugänge oder Werkzeuge.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-054",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bedeutet 'Patchen' eines Betriebssystems?",
    "answers": [
      "Korrekturpakete für bekannte Softwarefehler oder Sicherheitslücken installieren.",
      "Die Konfiguration des Systems auf die ursprünglichen Installationswerte zurücksetzen.",
      "Das Betriebssystem mit derselben Version vollständig neu installieren.",
      "Eine Sicherungskopie der installierten Systemdateien auf einem anderen Datenträger anlegen."
    ],
    "correctAnswer": 0,
    "explanation": "Patches schließen Fehler und Sicherheitslücken oder verbessern Funktionen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-055",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum sollten Systeme nicht dauerhaft mit nicht benötigten Diensten betrieben werden?",
    "answers": [
      "Sie können unnötig Ressourcen beanspruchen und zusätzliche Angriffspunkte bieten.",
      "Sie beschleunigen die Anmeldung, weil sie Berechtigungsprüfungen übernehmen.",
      "Sie ersetzen Sicherheitsupdates für andere laufende Hintergrundkomponenten.",
      "Sie verringern den Verwaltungsaufwand, weil mehr Funktionen dauerhaft aktiv bleiben."
    ],
    "correctAnswer": 0,
    "explanation": "Minimierung unnötiger Dienste reduziert Komplexität und mögliche Angriffsflächen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-056",
    "category": "Betriebssysteme",
    "topic": "Systemverwaltung",
    "difficulty": "medium",
    "question": "Warum bleibt ein nicht mehr mit Sicherheitsupdates versorgtes Betriebssystem trotz aktuellem Virenschutz ein Risiko?",
    "answers": [
      "Neu entdeckte Lücken im Betriebssystem können ungepatcht bleiben.",
      "Aktuelle Virensignaturen ersetzen fehlende Betriebssystemkorrekturen vollständig.",
      "Virenschutz macht verwundbare Systemdienste unabhängig von ihrer Konfiguration unerreichbar.",
      "Ein älteres Betriebssystem kann nach dem Supportende keine neuen Schwachstellen mehr aufweisen."
    ],
    "correctAnswer": 0,
    "explanation": "Virenschutz und Betriebssystemupdates erfüllen unterschiedliche Aufgaben. Fehlen Sicherheitskorrekturen, können Schwachstellen bestehen bleiben, die ein Virenschutz nicht zuverlässig ausgleicht.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-057",
    "category": "Betriebssysteme",
    "topic": "Virtualisierung",
    "difficulty": "medium",
    "question": "Was ist ein typischer Unterschied zwischen Host und Gast in einer Virtualisierungsumgebung?",
    "answers": [
      "Der Host stellt Ressourcen bereit; das Gastbetriebssystem läuft innerhalb einer VM.",
      "Der Gast stellt die Hardware bereit; der Host läuft als Anwendung innerhalb des Gastes.",
      "Host und Gast sind zwei Benutzerkonten innerhalb desselben Betriebssystems.",
      "Host und Gast bezeichnen aktive und inaktive Kopien derselben virtuellen Festplatte."
    ],
    "correctAnswer": 0,
    "explanation": "Der Host ist das zugrunde liegende System mit der Hardware, während der Gast als virtuelle Maschine darauf ausgeführt wird",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-058",
    "category": "Betriebssysteme",
    "topic": "Windows",
    "difficulty": "medium",
    "question": "Welche Aufgabe hat der Windows-Explorer hauptsächlich?",
    "answers": [
      "Dateien, Ordner und Laufwerke anzeigen und verwalten.",
      "Laufende Prozesse und ihre Ressourcennutzung überwachen.",
      "Hardwaregeräte und deren Treiberkonfiguration verwalten.",
      "Systemereignisse und Anwendungsfehler protokolliert anzeigen."
    ],
    "correctAnswer": 0,
    "explanation": "Der Windows-Explorer dient zur Verwaltung von Dateien, Ordnern und Laufwerken.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-059",
    "category": "Betriebssysteme",
    "topic": "Windows",
    "difficulty": "medium",
    "question": "Welches Windows-Werkzeug zeigt laufende Prozesse und deren Ressourcennutzung?",
    "answers": [
      "Task-Manager",
      "Ereignisanzeige",
      "Geräte-Manager",
      "Datenträgerverwaltung"
    ],
    "correctAnswer": 0,
    "explanation": "Der Task-Manager zeigt Prozesse sowie CPU-, RAM- und Datenträgerauslastung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-060",
    "category": "Betriebssysteme",
    "topic": "Windows",
    "difficulty": "medium",
    "question": "Wofür wird der Geräte-Manager unter Windows verwendet?",
    "answers": [
      "Erkannte Hardwaregeräte und zugehörige Treiber prüfen und verwalten.",
      "Laufende Programme und deren Arbeitsspeicherverbrauch anzeigen.",
      "Datenträger partitionieren und Laufwerksbuchstaben zuordnen.",
      "Anmeldeereignisse und fehlgeschlagene Systemdienste auswerten."
    ],
    "correctAnswer": 0,
    "explanation": "Im Geräte-Manager lassen sich Hardwaregeräte und Treiber prüfen und verwalten.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-061",
    "category": "Betriebssysteme",
    "topic": "Windows",
    "difficulty": "medium",
    "question": "Welches Werkzeug hilft bei der Analyse von Windows-Systemereignissen und Fehlern?",
    "answers": [
      "Ereignisanzeige",
      "Task-Manager",
      "Geräte-Manager",
      "Aufgabenplanung"
    ],
    "correctAnswer": 0,
    "explanation": "Die Ereignisanzeige zeigt protokollierte System-, Anwendungs- und Sicherheitsereignisse an. Zeitstempel, Ereignisquellen und Ereignis-IDs unterstützen die Fehleranalyse.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-062",
    "category": "Betriebssysteme",
    "topic": "Windows-Automatisierung",
    "difficulty": "medium",
    "question": "Ein vorhandenes Wartungsskript soll unter Windows montags bis freitags jeweils um 19 Uhr automatisch ausgeführt werden. Welches Verwaltungswerkzeug ist dafür vorgesehen?",
    "answers": [
      "Aufgabenplanung",
      "Diensteverwaltung",
      "Ereignisanzeige",
      "Leistungsüberwachung"
    ],
    "correctAnswer": 0,
    "explanation": "Die Aufgabenplanung startet Programme oder Skripte anhand definierter Auslöser. Ein wöchentlicher Zeittrigger kann auf Montag bis Freitag um 19 Uhr eingestellt werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-063",
    "category": "Betriebssysteme",
    "topic": "Linux",
    "difficulty": "medium",
    "question": "Welcher Linux-Befehl zeigt Verzeichniseinträge einschließlich versteckter Namen in ausführlicher Form an?",
    "answers": [
      "ls -la",
      "ls -l",
      "ls -d",
      "ls -R"
    ],
    "correctAnswer": 0,
    "explanation": "Bei ls aktiviert -l das ausführliche Format und -a die Anzeige aller Namen einschließlich der Einträge mit führendem Punkt. -d zeigt Verzeichnisse selbst statt ihrer Inhalte; -R arbeitet rekursiv.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-064",
    "category": "Betriebssysteme",
    "topic": "Linux",
    "difficulty": "medium",
    "question": "In Bash führt der Pfad zum aktuellen Verzeichnis über einen symbolischen Link. Welcher Befehl zeigt den physischen Pfad mit aufgelösten symbolischen Links?",
    "answers": [
      "pwd -P",
      "pwd -L",
      "cd -",
      "ls -d ."
    ],
    "correctAnswer": 0,
    "explanation": "pwd -P zeigt den physischen Verzeichnispfad und löst dabei symbolische Links auf. pwd -L verwendet den logischen Pfad, der solche Links enthalten kann.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-065",
    "category": "Betriebssysteme",
    "topic": "Linux",
    "difficulty": "medium",
    "question": "Welcher Befehl wird unter Linux verwendet, um in ein anderes Verzeichnis zu wechseln?",
    "answers": [
      "cd",
      "cp",
      "mv",
      "touch"
    ],
    "correctAnswer": 0,
    "explanation": "cd steht für change directory.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-066",
    "category": "Betriebssysteme",
    "topic": "Linux",
    "difficulty": "medium",
    "question": "Was macht der Befehl mkdir?",
    "answers": [
      "Er legt ein neues Verzeichnis an.",
      "Er wechselt in ein vorhandenes Verzeichnis.",
      "Er benennt ein vorhandenes Verzeichnis um.",
      "Er entfernt ein vorhandenes leeres Verzeichnis."
    ],
    "correctAnswer": 0,
    "explanation": "mkdir erstellt ein neues Verzeichnis.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-067",
    "category": "Betriebssysteme",
    "topic": "Linux",
    "difficulty": "medium",
    "question": "Die Textdatei notiz.txt enthält zehn unterschiedliche Zeilen. Welcher Linux-Befehl gibt ihren gesamten Inhalt ohne interaktive Seitenanzeige auf der Standardausgabe aus?",
    "answers": [
      "cat notiz.txt",
      "wc -l notiz.txt",
      "head -n 1 notiz.txt",
      "tail -n 1 notiz.txt"
    ],
    "correctAnswer": 0,
    "explanation": "cat gibt den vollständigen Dateiinhalt auf der Standardausgabe aus. wc -l zählt Zeilen, head -n 1 zeigt die erste und tail -n 1 die letzte Zeile.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-068",
    "category": "Betriebssysteme",
    "topic": "Linux",
    "difficulty": "medium",
    "question": "Welcher Befehl führt unter Linux id als Benutzer www-data aus, sofern die sudo-Richtlinie dies erlaubt?",
    "answers": [
      "sudo -u www-data id",
      "sudo id www-data",
      "id -u www-data",
      "whoami www-data"
    ],
    "correctAnswer": 0,
    "explanation": "Bei sudo wählt -u das Zielkonto für den auszuführenden Befehl. sudo -u www-data id startet id mit der Identität von www-data; eine reine Kontoabfrage wechselt dagegen nicht den Ausführungskontext.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-069",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Eine Datei liegt in einem unter Windows freigegebenen NTFS-Ordner. Der Benutzer öffnet sie direkt über den lokalen Pfad C:\\Projekte\\plan.txt, nicht über die Freigabe. Welche Berechtigungsebene wird für diesen lokalen Dateizugriff geprüft?",
    "answers": [
      "Die NTFS-Berechtigungen der Datei und ihres Zugriffspfads.",
      "Die SMB-Freigabeberechtigungen des Ordners.",
      "Die Schnittmenge aus SMB-Freigabe- und NTFS-Berechtigungen.",
      "Die jeweils weitergehende Berechtigung aus SMB-Freigabe und NTFS."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Zugriff über den lokalen Dateipfad unterliegt den Dateisystemberechtigungen. SMB-Freigaberechte kommen beim Zugriff über die Freigabe hinzu, nicht allein deshalb, weil der Ordner auch freigegeben ist.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-070",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Welches Merkmal unterscheidet ext4 von ext2 hinsichtlich der Wiederherstellung nach einem Absturz?",
    "answers": [
      "ext4 unterstützt ein Journal für Dateisystemänderungen.",
      "ext4 speichert mehrere historische Versionen jeder Datei.",
      "ext4 legt für jede Datei eine Kopie auf einem zweiten Datenträger an.",
      "ext4 prüft nach jedem Schreibvorgang automatisch den gesamten Datenträger auf Dateisystemfehler."
    ],
    "correctAnswer": 0,
    "explanation": "ext4 unterstützt Journaling; ext2 besitzt kein Journal. Das Journal erleichtert die Wiederherstellung konsistenter Dateisystemstrukturen, ersetzt aber weder Dateiversionierung noch Backups.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-071",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Welcher Nachteil von FAT32 ist im Alltag besonders relevant?",
    "answers": [
      "Die Größe einer einzelnen Datei ist auf 4 GiB minus 1 Byte begrenzt.",
      "Die Gesamtgröße eines Volumes ist auf 4 GiB minus 1 Byte begrenzt.",
      "Die Summe der Dateigrößen je Verzeichnis ist auf 4 GiB minus 1 Byte begrenzt.",
      "Der freie Speicher muss mindestens 4 GiB minus 1 Byte betragen."
    ],
    "correctAnswer": 0,
    "explanation": "Bei FAT32 beträgt die maximale Größe einer einzelnen Datei 2^32 - 1 Byte, also 4 GiB minus 1 Byte. Diese Grenze ist von der maximalen Größe des gesamten Volumes zu unterscheiden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-072",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "hard",
    "question": "Ein USB-Stick soll sowohl unter Windows als auch Linux funktionieren und Dateien größer als 4 GB speichern. Welches Dateisystem ist dafür oft sinnvoll?",
    "answers": [
      "exFAT",
      "FAT16",
      "ISO 9660",
      "ext2"
    ],
    "correctAnswer": 0,
    "explanation": "exFAT wird häufig für plattformübergreifende Wechseldatenträger mit großen Dateien verwendet.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-073",
    "category": "Betriebssysteme",
    "topic": "NTFS-Speicherkontingente",
    "difficulty": "medium",
    "question": "Auf einem gemeinsam genutzten NTFS-Volume soll der belegbare Speicherplatz pro Benutzer begrenzt werden. Welche Funktion ist dafür vorgesehen?",
    "answers": [
      "NTFS-Dateikomprimierung",
      "NTFS-Zugriffsberechtigungen",
      "NTFS-Datenträgerkontingente",
      "NTFS-Dateiverschlüsselung"
    ],
    "correctAnswer": 2,
    "explanation": "NTFS-Datenträgerkontingente erfassen die Speicherbelegung anhand des Dateibesitzers. Mit einem erzwungenen Kontingentlimit lässt sich weiterer Speicherverbrauch oberhalb der Grenze verhindern.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-074",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Was bedeutet es, ein Volume zu formatieren?",
    "answers": [
      "Auf dem Volume die Strukturen eines Dateisystems einzurichten.",
      "Den Datenträger durch eine Partitionstabelle in Bereiche aufzuteilen.",
      "Die vorhandenen Dateien auf einen zweiten Datenträger zu kopieren.",
      "Die Datenblöcke vorhandener Dateien zur Beschleunigung neu anzuordnen."
    ],
    "correctAnswer": 0,
    "explanation": "Beim Formatieren werden Dateisystemstrukturen eingerichtet, etwa zur Verwaltung von Dateien und freiem Speicher. Das ist von Partitionieren, Sichern und Defragmentieren zu unterscheiden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-075",
    "category": "Betriebssysteme",
    "topic": "Linux-Prozesszustände",
    "difficulty": "medium",
    "question": "Ein Linux-Prozess wird in der Prozessliste mit dem Zustand Z angezeigt. Was bedeutet dieser Zustand?",
    "answers": [
      "Er ist beendet, sein Elternprozess hat den Exit-Status noch nicht abgeholt.",
      "Er ist angehalten und wartet auf ein Signal zum Fortsetzen.",
      "Er ist ausführungsbereit und wartet auf die Zuteilung von CPU-Zeit.",
      "Er ist blockiert und wartet auf den Abschluss einer Ein-/Ausgabeoperation."
    ],
    "correctAnswer": 0,
    "explanation": "Z bezeichnet einen Zombie-Prozess. Seine Ausführung ist beendet, aber ein Prozesseintrag bleibt erhalten, bis der Elternprozess den Beendigungsstatus mit einer wait-Funktion abholt.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-076",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Auf einem Linux-Dateisystem sind bericht.txt und archiv.txt Hardlinks auf dieselbe reguläre Datei. Was geschieht, wenn nur bericht.txt gelöscht wird?",
    "answers": [
      "archiv.txt bleibt als Name bestehen, verweist aber auf ein fehlendes Ziel.",
      "archiv.txt wird ebenfalls gelöscht, weil beide Namen dieselbe Datei bezeichnen.",
      "archiv.txt bleibt nutzbar und ermöglicht weiterhin Zugriff auf denselben Inhalt.",
      "archiv.txt bleibt bestehen, enthält danach aber eine neu angelegte leere Datei."
    ],
    "correctAnswer": 2,
    "explanation": "Hardlinks sind gleichwertige Namen für dieselbe Datei. Das Entfernen eines Namens löscht den Inhalt nicht, solange ein weiterer Hardlink darauf verweist.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-077",
    "category": "Betriebssysteme",
    "topic": "Prozesse",
    "difficulty": "medium",
    "question": "Warum kann ein Programm mehrere Threads verwenden?",
    "answers": [
      "Um mehrere Aufgaben innerhalb eines Prozesses nebenläufig oder parallel zu bearbeiten.",
      "Um jeder Aufgabe einen eigenen, von den anderen Threads isolierten Adressraum zu geben.",
      "Um die Synchronisierung gemeinsam verwendeter Daten dem Dateisystem zu überlassen.",
      "Um die Ausführungsreihenfolge aller Aufgaben unabhängig vom Scheduler festzulegen."
    ],
    "correctAnswer": 0,
    "explanation": "Mehrere Threads können unterschiedliche Aufgaben desselben Prozesses gleichzeitig oder überlappend bearbeiten.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-078",
    "category": "Betriebssysteme",
    "topic": "Prozesse",
    "difficulty": "medium",
    "question": "Was passiert typischerweise, wenn ein Prozess beendet wird?",
    "answers": [
      "Private Speicherbereiche und offene Handles werden vom Betriebssystem freigegeben.",
      "Die ausführbare Programmdatei wird vom Dateisystem entfernt.",
      "Die von ihm erzeugten Dateien werden auf den Zustand vor dem Start zurückgesetzt.",
      "Die von ihm verwendeten Benutzerkonten werden aus der Kontodatenbank entfernt."
    ],
    "correctAnswer": 0,
    "explanation": "Beim Prozessende räumt das Betriebssystem Ressourcen wie privaten Speicher und offene Handles auf. Gemeinsam genutzte Ressourcen können weiterbestehen; unter Unix kann ein kleiner Prozesseintrag bis zum Abholen des Exit-Status erhalten bleiben.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-079",
    "category": "Betriebssysteme",
    "topic": "Arbeitsspeicher",
    "difficulty": "medium",
    "question": "Welche Aufgabe hat der RAM?",
    "answers": [
      "Aktuell verwendete Programme und Daten als flüchtiger Arbeitsspeicher bereithalten.",
      "Programme und Daten ohne Stromversorgung dauerhaft aufbewahren.",
      "Häufig verwendete Daten direkt innerhalb des Prozessors zwischenspeichern.",
      "Hardwareeinstellungen für den nächsten Start in nichtflüchtigem Speicher sichern."
    ],
    "correctAnswer": 0,
    "explanation": "RAM dient als schneller, flüchtiger Arbeitsspeicher.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-080",
    "category": "Betriebssysteme",
    "topic": "Arbeitsspeicher",
    "difficulty": "medium",
    "question": "Kann ein Betriebssystem virtuelle Adressräume verwenden, wenn kein Swap-Bereich eingerichtet ist?",
    "answers": [
      "Ja, virtuelle Adressen können auch ohne Auslagerung auf physischen RAM abgebildet werden.",
      "Nein, virtuelle Adressen sind immer Positionen innerhalb einer Auslagerungsdatei.",
      "Nein, ohne Swap muss jeder Prozess dieselben physischen Adressen verwenden.",
      "Ja, aber dann müssen alle Prozesse auf den Speicherschutz verzichten."
    ],
    "correctAnswer": 0,
    "explanation": "Virtuelle Adressierung und Speicherschutz funktionieren unabhängig von einem Swap-Bereich. Ohne Swap stehen bestimmte Auslagerungsmöglichkeiten nicht zur Verfügung; dadurch entfällt aber nicht die virtuelle Adressverwaltung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-081",
    "category": "Betriebssysteme",
    "topic": "Arbeitsspeicher",
    "difficulty": "medium",
    "question": "Wie lässt sich ein geeigneter, vorbereiteter Swap-Bereich unter Linux für die Speicherauslagerung aktivieren?",
    "answers": [
      "Mit swapon für die Swap-Datei oder Swap-Partition.",
      "Mit mount für einen Einhängepunkt im Verzeichnisbaum.",
      "Mit chmod +x für die Swap-Datei oder das Blockgerät.",
      "Mit fsck zur Freigabe der darin enthaltenen Datenblöcke."
    ],
    "correctAnswer": 0,
    "explanation": "swapon aktiviert einen dafür vorbereiteten Swap-Bereich. Das Erstellen geeigneter Swap-Strukturen und das Aktivieren sind getrennte Schritte; normales Einhängen mit mount macht einen Bereich nicht zu aktivem Swap.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-082",
    "category": "Betriebssysteme",
    "topic": "Arbeitsspeicher",
    "difficulty": "hard",
    "question": "Ein bereits laufender Prozess greift auf eine ausgelagerte Speicherseite zu. Was muss geschehen, bevor der unterbrochene Zugriff fortgesetzt werden kann?",
    "answers": [
      "Das Betriebssystem muss die benötigte Seite wieder in den RAM laden.",
      "Der Kernel muss den Zugriff als ungültig ablehnen, weil ausgelagerte Seiten nicht mehr zum Prozess gehören.",
      "Der Prozess muss die fehlende Seite selbst aus der Auslagerungsdatei lesen und danach neu starten.",
      "Der Kernel muss den gesamten virtuellen Adressraum des Prozesses gleichzeitig in den RAM übernehmen."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Zugriff auf eine gültige, aber ausgelagerte Seite löst einen Seitenfehler aus. Das Betriebssystem lädt die Seite in den RAM, aktualisiert die Zuordnung und kann anschließend den Zugriff fortsetzen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-083",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Warum gibt es unterschiedliche Benutzerrechte in einem Betriebssystem?",
    "answers": [
      "Damit erlaubte Zugriffe auf Daten und Systemfunktionen den Aufgaben der Benutzer entsprechen.",
      "Damit die Identität eines Benutzers allein anhand der vorhandenen Dateirechte festgestellt wird.",
      "Damit jede erlaubte Aktion ohne zusätzliche Protokollierung einem Benutzer nachweisbar zugeordnet ist.",
      "Damit Dateien durch die Rechtevergabe automatisch gegen das Auslesen außerhalb des Systems verschlüsselt werden."
    ],
    "correctAnswer": 0,
    "explanation": "Berechtigungen schützen Daten und Systemfunktionen vor unerlaubtem Zugriff.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-084",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Welches Konto besitzt typischerweise umfangreichere Systemrechte?",
    "answers": [
      "Administrator",
      "Gast",
      "Standardbenutzer",
      "Anonymer Benutzer"
    ],
    "correctAnswer": 0,
    "explanation": "Administratorkonten besitzen erweiterte Rechte zur Systemverwaltung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-085",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Was bedeutet unter Linux die Berechtigung 'r'?",
    "answers": [
      "read",
      "run",
      "rename",
      "root"
    ],
    "correctAnswer": 0,
    "explanation": "r steht für read, also Lesen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-086",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Was bedeutet unter Linux die Berechtigung 'w'?",
    "answers": [
      "write",
      "watch",
      "wait",
      "work"
    ],
    "correctAnswer": 0,
    "explanation": "w steht für write, also Schreiben.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-087",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Wofür steht das Berechtigungszeichen x bei einer regulären Datei unter Linux?",
    "answers": [
      "execute",
      "export",
      "extract",
      "exit"
    ],
    "correctAnswer": 0,
    "explanation": "Bei einer regulären Datei steht x für execute, also die Ausführungsberechtigung. Bei Verzeichnissen erlaubt x dagegen das Durchsuchen beziehungsweise Durchqueren des Verzeichnispfads.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-088",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Welche Dateiberechtigung benötigt ein gewöhnlicher Linux-Benutzer, um den Inhalt einer vorhandenen regulären Datei direkt zu überschreiben? Der Zugriff auf den Pfad ist bereits erlaubt.",
    "answers": [
      "Schreibberechtigung auf die Datei.",
      "Leseberechtigung auf die Datei.",
      "Ausführungsberechtigung auf die Datei.",
      "Schreibberechtigung auf das übergeordnete Verzeichnis."
    ],
    "correctAnswer": 0,
    "explanation": "Direktes Überschreiben des vorhandenen Dateiinhalts erfordert Schreibberechtigung auf die Datei. Das Löschen und Neuanlegen eines Verzeichniseintrags ist eine andere Operation und wird über Verzeichnisrechte kontrolliert.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-089",
    "category": "Betriebssysteme",
    "topic": "Linux-Shell",
    "difficulty": "medium",
    "question": "Welche Umleitung hängt in Bash nur die Standardfehlerausgabe eines Befehls an eine vorhandene Datei fehler.log an?",
    "answers": [
      "> fehler.log",
      "2> fehler.log",
      ">> fehler.log",
      "2>> fehler.log"
    ],
    "correctAnswer": 3,
    "explanation": "Dateideskriptor 2 bezeichnet die Standardfehlerausgabe. Der Operator >> hängt Ausgaben an, ohne den bisherigen Dateiinhalt zu überschreiben.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-090",
    "category": "Betriebssysteme",
    "topic": "Treiber",
    "difficulty": "medium",
    "question": "Ein neu angeschlossenes Gerät wird erkannt, aber Windows findet keinen passenden Gerätetreiber. Welche Folge ist plausibel?",
    "answers": [
      "Gerätefunktionen sind nicht oder nur eingeschränkt verfügbar.",
      "Die Hardwareerkennung genügt, um sämtliche Gerätefunktionen unverändert bereitzustellen.",
      "Der bereits vorhandene Treiber eines anderen Gerätetyps übernimmt dieselben Funktionen.",
      "Ein Neustart ersetzt die Treiberinstallation unabhängig von verfügbaren Treiberpaketen."
    ],
    "correctAnswer": 0,
    "explanation": "Ohne passenden Treiber kann Hardware nicht oder nur eingeschränkt funktionieren.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-091",
    "category": "Betriebssysteme",
    "topic": "Bootprozess",
    "difficulty": "medium",
    "question": "Welche Komponente startet nach dem Einschalten zunächst die Hardwareinitialisierung eines modernen PCs?",
    "answers": [
      "UEFI-Firmware",
      "Bootloader",
      "Betriebssystemkernel",
      "Anmeldedienst"
    ],
    "correctAnswer": 0,
    "explanation": "UEFI bzw. BIOS initialisiert die Hardware und startet anschließend den Bootvorgang.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-092",
    "category": "Betriebssysteme",
    "topic": "Bootprozess",
    "difficulty": "medium",
    "question": "Auf einem Rechner sind zwei Betriebssysteme installiert. Welche Funktion kann ein Bootmanager vor dem Start des Kernels bereitstellen?",
    "answers": [
      "Die Auswahl des zu startenden Betriebssystems.",
      "Die Vergabe von CPU-Zeit an bereits laufende Benutzerprogramme.",
      "Die Prüfung der Zugriffsrechte auf freigegebene Netzwerkordner.",
      "Die Installation ausstehender Anwendungspakete im angemeldeten Benutzerkonto."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Bootmanager kann mehrere Startoptionen anbieten und den ausgewählten Ladepfad starten. Diese Auswahl erfolgt vor der regulären Benutzerumgebung des gewählten Betriebssystems.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-093",
    "category": "Betriebssysteme",
    "topic": "Bootprozess",
    "difficulty": "medium",
    "question": "Warum kann die Bootreihenfolge im UEFI wichtig sein?",
    "answers": [
      "Sie legt fest, welche konfigurierten Bootoptionen zuerst versucht werden.",
      "Sie legt fest, in welcher Reihenfolge Benutzerprogramme CPU-Zeit erhalten.",
      "Sie legt fest, welche Benutzerkonten zuerst zur Anmeldung angeboten werden.",
      "Sie legt fest, in welcher Reihenfolge Gerätetreiber Updates erhalten."
    ],
    "correctAnswer": 0,
    "explanation": "Die UEFI-Bootreihenfolge legt fest, welche konfigurierten Startoptionen zuerst versucht werden, etwa der installierte Bootmanager, ein USB-Medium oder der Netzwerkstart.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-094",
    "category": "Betriebssysteme",
    "topic": "Linux-Dateisystemverwaltung",
    "difficulty": "medium",
    "question": "In welcher Konfigurationsdatei werden unter Linux üblicherweise dauerhafte Zuordnungen zwischen Dateisystemen, Einhängepunkten und Mount-Optionen hinterlegt?",
    "answers": [
      "/etc/hosts",
      "/etc/fstab",
      "/etc/passwd",
      "/etc/resolv.conf"
    ],
    "correctAnswer": 1,
    "explanation": "/etc/fstab beschreibt Dateisysteme, ihre Einhängepunkte und Mount-Optionen. Die Einträge können unter anderem zum automatischen Einhängen beim Systemstart verwendet werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-095",
    "category": "Betriebssysteme",
    "topic": "Virtualisierung",
    "difficulty": "medium",
    "question": "Mehrere VMs besitzen zusammen mehr virtuelle CPUs, als der Host gleichzeitig ausführen kann. Wie ermöglicht der Hypervisor dennoch ihren Betrieb?",
    "answers": [
      "Er plant virtuelle CPUs zeitlich auf den verfügbaren physischen Ausführungseinheiten ein.",
      "Er reserviert für jede virtuelle CPU dauerhaft einen eigenen physischen Kern.",
      "Er führt jeweils eine vollständige VM bis zu deren Herunterfahren aus, bevor die nächste Rechenzeit erhält.",
      "Er überlässt jedem Gast unabhängig von den anderen Gästen die alleinige Auswahl physischer Kerne."
    ],
    "correctAnswer": 0,
    "explanation": "Der Hypervisor teilt verfügbare CPU-Zeit zwischen ausführungsbereiten virtuellen CPUs auf. Mehr zugewiesene vCPUs erhöhen die physische Rechenkapazität nicht und können bei Konkurrenz Wartezeiten verursachen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-096",
    "category": "Betriebssysteme",
    "topic": "Virtualisierung",
    "difficulty": "medium",
    "question": "Welcher Vorteil von Virtualisierung ist typisch?",
    "answers": [
      "Mehrere getrennte Gastbetriebssysteme können dieselbe physische Hardware nutzen.",
      "Gastbetriebssysteme müssen deshalb nicht mehr auf ihre jeweiligen Softwarelizenzen geprüft werden.",
      "Ein Ausfall des gemeinsamen Hosts lässt die darauf laufenden Gastbetriebssysteme unbeeinträchtigt.",
      "Ressourcenengpässe einer VM können dadurch grundsätzlich keine andere VM beeinflussen."
    ],
    "correctAnswer": 0,
    "explanation": "Virtualisierung ermöglicht mehrere getrennte Systeme auf derselben physischen Hardware.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-097",
    "category": "Betriebssysteme",
    "topic": "Virtualisierung",
    "difficulty": "medium",
    "question": "Ein Hypervisor reserviert den konfigurierten RAM beim Start jeder VM und erlaubt keine Speicherüberbelegung. Eine neue VM benötigt mehr RAM, als der Host noch bereitstellen kann. Welche Folge ist zu erwarten?",
    "answers": [
      "Der Start der VM wird wegen unzureichenden Arbeitsspeichers abgelehnt.",
      "Die VM startet, weil freier Platz auf ihrer virtuellen Festplatte als reservierter RAM zählt.",
      "Die VM startet, indem sie ohne Rückfrage den reservierten RAM einer anderen laufenden VM übernimmt.",
      "Die VM startet, weil ihre konfigurierte RAM-Größe beim Start automatisch auf den freien Rest reduziert wird."
    ],
    "correctAnswer": 0,
    "explanation": "Bei der beschriebenen Reservierungspolitik muss die benötigte RAM-Menge beim Start verfügbar sein. Freier Datenträgerspeicher ersetzt diese Voraussetzung nicht. Andere Hypervisoren oder Konfigurationen können mit Speicherüberbelegung anders umgehen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-098",
    "category": "Betriebssysteme",
    "topic": "Systemverwaltung",
    "difficulty": "medium",
    "question": "Ein Update wurde als heruntergeladen gemeldet. Welche Prüfung zeigt am zuverlässigsten, ob die Installation einschließlich eines erforderlichen Neustarts abgeschlossen ist?",
    "answers": [
      "Installationsstatus und installierte Version nach einem erforderlichen Neustart prüfen.",
      "Das Vorhandensein der heruntergeladenen Paketdatei als Installationsnachweis verwenden.",
      "Die verfügbare Zielversion im Updatekatalog mit der installierten Version gleichsetzen.",
      "Die erfolgreiche Downloadmeldung ohne Prüfung der weiteren Installationsschritte übernehmen."
    ],
    "correctAnswer": 0,
    "explanation": "Ein erfolgreicher Download belegt noch keine Installation. Installationsstatus, installierte Version und gegebenenfalls ein abgeschlossener Neustart liefern dafür die entscheidenden Hinweise.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-099",
    "category": "Betriebssysteme",
    "topic": "Systemverwaltung",
    "difficulty": "medium",
    "question": "Was ist ein Paketmanager unter Linux?",
    "answers": [
      "Ein Werkzeug, das Softwarepakete installiert, aktualisiert und entfernt.",
      "Ein Werkzeug, das die CPU-Zeit zwischen laufenden Programmen verteilt.",
      "Ein Werkzeug, das Quellcode in ausführbare Maschinensprache übersetzt.",
      "Ein Werkzeug, das Dateien anhand ihres Inhalts auf Schadcode untersucht."
    ],
    "correctAnswer": 0,
    "explanation": "Paketmanager verwalten Software und deren Abhängigkeiten.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-100",
    "category": "Betriebssysteme",
    "topic": "Systemverwaltung",
    "difficulty": "medium",
    "question": "Warum ist die Installation von Software über einen Paketmanager oft vorteilhaft?",
    "answers": [
      "Abhängigkeiten und verfügbare Aktualisierungen lassen sich gemeinsam verwalten.",
      "Die enthaltenen Programme erhalten bei jedem Start administrative Berechtigungen.",
      "Die installierten Programme verwenden unabhängig vom Paketinhalt denselben Konfigurationspfad.",
      "Die Prüfung der Herkunft heruntergeladener Pakete wird durch die Installation entbehrlich."
    ],
    "correctAnswer": 0,
    "explanation": "Paketmanager vereinfachen Installation, Abhängigkeitsverwaltung und Aktualisierung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-101",
    "category": "Betriebssysteme",
    "topic": "Windows Grundlagen",
    "difficulty": "medium",
    "question": "Mehrere Programme laufen auf einem Rechner, dem genau ein logischer Prozessor zur Verfügung steht. Wie ermöglicht das Betriebssystem ihre nebenläufige Ausführung?",
    "answers": [
      "Es verteilt CPU-Zeit und wechselt zwischen ausführungsbereiten Prozessen.",
      "Es lässt jeden Prozess nach dem Start bis zum vollständigen Ende laufen, bevor ein anderer beginnen darf.",
      "Es bearbeitet die Programme gleichzeitig auf getrennten virtuellen CPU-Kernen ohne zeitliche Aufteilung.",
      "Es führt während einer Ein-/Ausgabe-Wartezeit grundsätzlich keine andere Programminstanz aus."
    ],
    "correctAnswer": 0,
    "explanation": "Der Scheduler weist ausführungsbereiten Prozessen abwechselnd CPU-Zeit zu. Bei einem einzigen logischen Prozessor entsteht dadurch Nebenläufigkeit, ohne dass mehrere Prozesse zugleich auf unterschiedlichen logischen Prozessoren laufen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-102",
    "category": "Betriebssysteme",
    "topic": "Windows Grundlagen",
    "difficulty": "medium",
    "question": "Warum können Anwendungen im Benutzermodus geschützte Kerneloperationen nicht wie gewöhnliche Speicherzugriffe direkt ausführen?",
    "answers": [
      "Die CPU und das Betriebssystem trennen privilegierte Kerneloperationen vom Benutzermodus.",
      "Der Speicherort der ausführbaren Datei bestimmt, ob die CPU ihre Befehle privilegiert ausführt.",
      "Der Scheduler erteilt privilegierte CPU-Rechte automatisch an Prozesse mit hoher Priorität.",
      "Die Menge des reservierten Arbeitsspeichers legt fest, welche Kernelbefehle eine Anwendung nutzen darf."
    ],
    "correctAnswer": 0,
    "explanation": "Prozessormodi und Speicherschutz begrenzen privilegierte Operationen. Anwendungen fordern Kernelservices über definierte Schnittstellen wie Systemaufrufe an; der Kernel prüft dabei Zugriffe.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-103",
    "category": "Betriebssysteme",
    "topic": "Windows Grundlagen",
    "difficulty": "medium",
    "question": "Welche Eigenschaft ist für eine 64-Bit-Prozessorarchitektur typisch?",
    "answers": [
      "Allzweckregister können Werte mit einer Breite von 64 Bit verarbeiten.",
      "Der Prozessor besitzt 64 physische Rechenkerne.",
      "Der Betriebssystem-Scheduler kann bis zu 64 Prozesse verwalten.",
      "Jede Datei wird in Datenblöcken von 64 Byte gespeichert."
    ],
    "correctAnswer": 0,
    "explanation": "Die Bezeichnung bezieht sich unter anderem auf 64 Bit breite Allzweckregister und entsprechende Befehle. Sie nennt weder eine Kernzahl noch die tatsächlich implementierte Größe des physischen oder virtuellen Adressraums.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-104",
    "category": "Betriebssysteme",
    "topic": "Windows Grundlagen",
    "difficulty": "medium",
    "question": "Eine 32-Bit-Anwendung läuft auf einem 64-Bit-Windows. Was folgt daraus für ihren eigenen virtuellen Adressraum?",
    "answers": [
      "Die Anwendung bleibt eine 32-Bit-Anwendung mit entsprechend begrenztem virtuellem Adressraum.",
      "Der Betrieb unter 64-Bit-Windows wandelt ihre Speicheradressen automatisch in 64-Bit-Adressen um.",
      "Der virtuelle Adressraum jeder 32-Bit-Anwendung entspricht dann der gesamten physischen RAM-Kapazität.",
      "Die Anwendung teilt sich unter 64-Bit-Windows einen gemeinsamen virtuellen Adressraum mit allen anderen Programmen."
    ],
    "correctAnswer": 0,
    "explanation": "Ein 64-Bit-Windows kann geeignete 32-Bit-Anwendungen ausführen, erweitert deren Programmformat aber nicht auf 64 Bit. Der nutzbare virtuelle Adressraum bleibt begrenzt und hängt zusätzlich von Programmeigenschaften und Betriebssystemregeln ab.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-105",
    "category": "Betriebssysteme",
    "topic": "Windows Grundlagen",
    "difficulty": "medium",
    "question": "Welche Funktion unterstützt Windows 11 Pro im Unterschied zu Windows 11 Home?",
    "answers": [
      "Den Beitritt zu einer lokalen Active-Directory-Domäne.",
      "Die Anmeldung mit einem persönlichen Microsoft-Konto.",
      "Die Installation von Anwendungen aus dem Microsoft Store.",
      "Die Verbindung mit einem drahtlosen Netzwerk."
    ],
    "correctAnswer": 0,
    "explanation": "Windows 11 Pro unterstützt den Beitritt zu einer lokalen Active-Directory-Domäne und damit die zentrale Verwaltung in dieser Infrastruktur. Die anderen genannten Funktionen stehen auch in Windows 11 Home zur Verfügung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-106",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Eine Mitarbeiterin liest E-Mails und bearbeitet Dokumente. Welche Kontonutzung setzt das Prinzip der geringsten Rechte sinnvoll um?",
    "answers": [
      "Ein Standardkonto für die tägliche Arbeit und gezielte Rechteerhöhung für Verwaltungsaufgaben.",
      "Ein Administratorkonto für die tägliche Arbeit und ein Standardkonto für Installationen.",
      "Ein gemeinsam genutztes Administratorkonto für sämtliche Beschäftigten.",
      "Ein Gastkonto für Verwaltungsaufgaben und ein Administratorkonto zum Lesen von E-Mails."
    ],
    "correctAnswer": 0,
    "explanation": "Alltagsprogramme benötigen in der Regel keine administrativen Rechte. Ein Standardkonto begrenzt ihren Handlungsspielraum; notwendige Verwaltungsaufgaben werden getrennt und kontrolliert erhöht ausgeführt.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-107",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Eine Standardbenutzerin startet unter Windows eine administrative Aufgabe. Die UAC-Richtlinie sieht dafür eine Anmeldeinformationsabfrage vor. Was muss sie bereitstellen?",
    "answers": [
      "Gültige Anmeldeinformationen eines berechtigten Administratorkontos.",
      "Eine zusätzliche Bestätigung mit dem Kennwort ihres unveränderten Standardkontos.",
      "Die Anmeldeinformationen eines Domänenkontos ohne administrative Rechte auf diesem Rechner.",
      "Die Zustimmung eines beliebigen anderen angemeldeten Standardbenutzers."
    ],
    "correctAnswer": 0,
    "explanation": "Bei einer UAC-Anmeldeinformationsabfrage werden die Anmeldeinformationen eines berechtigten Administratorkontos benötigt. Das unterscheidet sich von einer reinen Zustimmungsabfrage für ein Administratorkonto; Richtlinien können das Verhalten ändern.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-108",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Eine Anwendung ist systemweit installiert und für Standardbenutzer freigegeben. Welche Aussage zur Nutzung durch ein Standardkonto trifft zu?",
    "answers": [
      "Das Konto kann die Anwendung nutzen, ohne dadurch administrative Systemrechte zu erhalten.",
      "Das Konto erhält beim Start der Anwendung automatisch die Rechte des Installierenden.",
      "Das Konto muss zum Start jeder systemweit installierten Anwendung in die Administratorgruppe wechseln.",
      "Das Konto kann die Anwendung nutzen, erhält dabei aber automatisch Schreibrechte auf deren geschützten Installationsordner."
    ],
    "correctAnswer": 0,
    "explanation": "Installation und spätere Ausführung sind unterschiedliche Vorgänge. Eine für Standardbenutzer geeignete Anwendung kann mit deren normalen Rechten laufen, auch wenn ihre systemweite Installation administrative Rechte erforderte.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-109",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Was ist eine lokale Benutzergruppe in Windows?",
    "answers": [
      "Eine Sammlung von Konten, der Rechte und Berechtigungen gemeinsam zugewiesen werden können.",
      "Eine Sammlung von Benutzerprofilen, die sich ein gemeinsames Anmeldekennwort teilen.",
      "Eine Sammlung laufender Prozesse, die denselben Arbeitsspeicherbereich verwenden.",
      "Eine Sammlung von Rechnern, die ihre Konten über einen Domänencontroller verwalten."
    ],
    "correctAnswer": 0,
    "explanation": "Lokale Gruppen bündeln Konten für die Vergabe von Rechten auf einem Rechner. Mitglieder können daneben weitere individuelle Rechte oder Gruppenmitgliedschaften besitzen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-110",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Welcher Vorteil entsteht durch Gruppen statt Einzelberechtigungen?",
    "answers": [
      "Berechtigungen lassen sich zentraler und konsistenter verwalten",
      "Benutzer benötigen dadurch keine Anmeldung mehr",
      "Dateien werden automatisch doppelt gespeichert",
      "Alle Benutzer erhalten automatisch Administratorrechte"
    ],
    "correctAnswer": 0,
    "explanation": "Gruppen reduzieren Verwaltungsaufwand und Inkonsistenzen bei vielen Benutzern.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-111",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Ein Dienst soll Protokolldateien in einem festgelegten Ordner anlegen. Welche Berechtigungsvergabe entspricht Least Privilege?",
    "answers": [
      "Dem Dienstkonto die benötigten Schreibrechte für diesen Ordner gewähren.",
      "Das Dienstkonto für diese Aufgabe zur lokalen Administratorgruppe hinzufügen.",
      "Allen lokalen Benutzern Vollzugriff auf den Protokollordner gewähren.",
      "Dem Dienstkonto Schreibrechte auf sämtliche Benutzerprofile gewähren."
    ],
    "correctAnswer": 0,
    "explanation": "Die Rechte sollten auf die tatsächlich benötigten Ressourcen und Aktionen begrenzt werden. Für das Schreiben in einen Protokollordner sind keine pauschalen Administratorrechte oder Zugriffe auf fremde Profile erforderlich.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-112",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Eine NTFS-Datei wird innerhalb desselben Volumes umbenannt. Was geschieht typischerweise mit ihrem Inhalt?",
    "answers": [
      "Der Inhalt bleibt bestehen; geändert wird die Zuordnung des Dateinamens.",
      "Die Nutzdaten werden abhängig von der neuen Dateiendung in ein anderes Datenformat konvertiert.",
      "Die Nutzdaten werden vollständig in eine zweite Datei kopiert; die bisherige Datei bleibt erhalten.",
      "Die Nutzdaten werden gelöscht; der neue Dateiname bezeichnet zunächst eine leere Datei."
    ],
    "correctAnswer": 0,
    "explanation": "Eine Umbenennung ändert den Namen beziehungsweise den Verzeichniseintrag der bestehenden Datei. Sie konvertiert den Dateiinhalt nicht; auch eine andere Dateiendung ändert das Datenformat nicht.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-113",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Welche Funktion unterstützt NTFS im Unterschied zu FAT32 direkt im Dateisystem?",
    "answers": [
      "Zugriffssteuerungslisten für einzelne Dateien und Verzeichnisse.",
      "Die Organisation von Dateien in einer Verzeichnishierarchie.",
      "Die Speicherung von Dateinamen und Änderungszeitpunkten.",
      "Die Verwaltung von belegten und freien Speicherbereichen."
    ],
    "correctAnswer": 0,
    "explanation": "NTFS unterstützt Zugriffssteuerungslisten, mit denen Zugriffe für Benutzer und Gruppen festgelegt werden. FAT32 bietet keine entsprechende dateisystemeigene ACL-Verwaltung; grundlegende Verzeichnisse und Metadaten unterstützen beide.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-114",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Was bedeutet die Vererbung von NTFS-Berechtigungen bei einem Unterordner?",
    "answers": [
      "Er kann als vererbbar markierte Berechtigungseinträge seines übergeordneten Ordners übernehmen.",
      "Er ersetzt die Berechtigungen des übergeordneten Ordners durch seine eigenen expliziten Einträge.",
      "Er übernimmt automatisch alle Rechte des Benutzers, der den Ordner zuletzt geöffnet hat.",
      "Er erhält dieselben Rechte wie jeder andere Ordner mit demselben Namen auf einem anderen Volume."
    ],
    "correctAnswer": 0,
    "explanation": "Bei aktivierter Vererbung können passende Berechtigungseinträge vom übergeordneten Objekt übernommen werden. Explizite Einträge und Änderungen der Vererbung sind davon zu unterscheiden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-115",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Ein Benutzer gehört zu zwei Gruppen. Auf derselben NTFS-Datei erlaubt eine Gruppe Lesen und die andere Schreiben. Es gibt keine Verweigerungen oder weiteren Einschränkungen. Welche dieser Rechte erhält der Benutzer?",
    "answers": [
      "Lesen und Schreiben werden gemeinsam gewährt.",
      "Es gilt Lesen, weil die geringere Berechtigung entscheidet.",
      "Es gilt Schreiben, weil die zuletzt genannte Gruppe entscheidet.",
      "Beide Berechtigungen werden wegen der unterschiedlichen Gruppen aufgehoben."
    ],
    "correctAnswer": 0,
    "explanation": "Erlaubte NTFS-Rechte aus passenden Benutzer- und Gruppeneinträgen können sich ergänzen. Ohne entgegenstehende Verweigerungen erhält der Benutzer hier Lesen und Schreiben. Das ist von der zusätzlichen Begrenzung durch SMB-Freigaberechte zu unterscheiden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-116",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Welche Operationen umfasst die NTFS-Standardberechtigung Ändern auf einer regulären Datei typischerweise?",
    "answers": [
      "Den Inhalt lesen, schreiben und die Datei löschen.",
      "Den Inhalt lesen und die Zugriffsberechtigungen beliebig ändern.",
      "Den Inhalt lesen und den Besitz der Datei übernehmen.",
      "Den Inhalt ausführen und die Zugriffsrechte anderer Benutzer verwalten."
    ],
    "correctAnswer": 0,
    "explanation": "Ändern umfasst unter anderem Lesen, Schreiben, Ausführen und Löschen. Das Ändern von Berechtigungen oder die Übernahme des Besitzes gehört nicht automatisch dazu und unterscheidet Ändern von Vollzugriff.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-117",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "hard",
    "question": "In einer NTFS-Zugriffsliste stehen explizite Verweigerungen vor expliziten Erlaubnissen. Für denselben Benutzer wird Schreiben ausdrücklich verweigert und auch ausdrücklich erlaubt. Wie endet eine gewöhnliche Prüfung dieses Schreibzugriffs?",
    "answers": [
      "Schreiben wird verweigert; der passende Verweigerungseintrag greift zuerst.",
      "Schreiben wird erlaubt; die Erlaubnis hebt die Verweigerung auf.",
      "Schreiben wird erlaubt; widersprüchliche Einträge werden bei der Prüfung ignoriert.",
      "Schreiben wird erlaubt; beide Einträge werden zu erweiterten Rechten zusammengeführt."
    ],
    "correctAnswer": 0,
    "explanation": "Bei der beschriebenen Reihenfolge entscheidet die passende explizite Verweigerung über den angeforderten Schreibzugriff. Daraus folgt keine pauschale Regel für alle Kombinationen aus expliziten und geerbten Einträgen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-118",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Was bietet das NTFS-Journal im Unterschied zu einer versionierten Dateisicherung?",
    "answers": [
      "Unterstützung für konsistente Dateisystemstrukturen, aber kein vollständiges Archiv früherer Dateiinhalte.",
      "Eine vollständige Historie der Dateiinhalte, aber keine Informationen über Dateisystemänderungen.",
      "Eine unabhängige Kopie der Dateien auf einem zweiten Datenträger, aber keine lokale Protokollierung.",
      "Eine dauerhafte Ablage gelöschter Benutzerdateien, aber keine Hilfe nach einem Systemabsturz."
    ],
    "correctAnswer": 0,
    "explanation": "Das Journal unterstützt konsistente Dateisystemstrukturen, ist aber keine vollständige Sicherung früherer Dateiinhalte. Für die Wiederherstellung versehentlich gelöschter Daten sind geeignete Sicherungen oder andere Wiederherstellungsmechanismen erforderlich.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-119",
    "category": "Betriebssysteme",
    "topic": "Datenträgerverwaltung",
    "difficulty": "medium",
    "question": "Wozu dient die Windows-Datenträgerverwaltung?",
    "answers": [
      "Partitionen und Volumes erstellen, formatieren und Laufwerksbuchstaben zuordnen.",
      "Verzeichnisse nach Dateitypen durchsuchen und Dateien zwischen Ordnern verschieben.",
      "Regelmäßige Sicherungsaufträge planen und frühere Dateiversionen wiederherstellen.",
      "Zugriffsrechte für Benutzergruppen auf Netzwerkfreigaben konfigurieren."
    ],
    "correctAnswer": 0,
    "explanation": "Die Datenträgerverwaltung dient unter anderem zum Erstellen, Formatieren und Verwalten von Volumes.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-120",
    "category": "Betriebssysteme",
    "topic": "Datenträgerverwaltung",
    "difficulty": "medium",
    "question": "Was ist ein Laufwerksbuchstabe unter Windows?",
    "answers": [
      "Eine logische Zuordnung wie C: für den Zugriff auf ein Volume oder Laufwerk.",
      "Die vom Hersteller festgelegte Seriennummer des physischen Datenträgers.",
      "Der im Dateisystem gespeicherte Name einer einzelnen Datei.",
      "Die Kennung eines Benutzerkontos, dem der Datenträger gehört."
    ],
    "correctAnswer": 0,
    "explanation": "Windows verwendet Laufwerksbuchstaben wie C: oder D: zur Adressierung von Volumes.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-121",
    "category": "Betriebssysteme",
    "topic": "Datenträgerverwaltung",
    "difficulty": "medium",
    "question": "Was lässt sich aus einer Schnellformatierung eines zuvor verwendeten Volumes nicht zuverlässig ableiten?",
    "answers": [
      "Dass sämtliche früheren Nutzdaten unwiederbringlich überschrieben wurden.",
      "Dass neue Dateisystemstrukturen für die Dateiverwaltung eingerichtet wurden.",
      "Dass das Volume nach erfolgreichem Abschluss als neues Dateisystem genutzt werden kann.",
      "Dass frühere Dateien nicht mehr über die bisherige Verzeichnisstruktur erreichbar sind."
    ],
    "correctAnswer": 0,
    "explanation": "Eine Schnellformatierung richtet die Dateisystemverwaltung neu ein, überschreibt aber nicht zuverlässig alle früheren Nutzdaten. Sie ist deshalb kein allgemeiner Nachweis einer sicheren Datenvernichtung; Datenträgertyp und weitere Mechanismen können die Wiederherstellbarkeit beeinflussen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-122",
    "category": "Betriebssysteme",
    "topic": "Datenträgerverwaltung",
    "difficulty": "medium",
    "question": "Was ist eine Partition?",
    "answers": [
      "Ein durch Partitionseinträge abgegrenzter Bereich eines Datenträgers.",
      "Ein Verzeichnis mit einem eigenen Namen innerhalb eines Dateisystems.",
      "Ein einzelner Datenblock, den ein Dateisystem einer Datei zuordnet.",
      "Ein gespeichertes Abbild des Arbeitsspeichers für den Ruhezustand."
    ],
    "correctAnswer": 0,
    "explanation": "Partitionen unterteilen einen physischen oder virtuellen Datenträger in logische Bereiche.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-123",
    "category": "Betriebssysteme",
    "topic": "Datenträgerverwaltung",
    "difficulty": "medium",
    "question": "Ein fabrikneuer, leerer Datenträger wird in der Windows-Datenträgerverwaltung als nicht zugeordnet angezeigt. Warum erscheint noch kein nutzbares Laufwerk im Explorer?",
    "answers": [
      "Es wurde noch kein nutzbares Volume mit einer passenden Einbindung eingerichtet.",
      "Der Datenträger enthält bereits ein nutzbares Volume, das durch einen Laufwerksbuchstabenkonflikt verdeckt wird.",
      "Der Datenträger enthält bereits ein nutzbares Volume, dessen NTFS-Rechte die Anzeige im Explorer verhindern.",
      "Der Datenträger enthält bereits ein nutzbares Volume, das ausschließlich für SMB-Zugriffe eingerichtet wurde."
    ],
    "correctAnswer": 0,
    "explanation": "Nicht zugeordneter Speicher gehört noch keinem Volume. Auf dem beschriebenen leeren Datenträger muss ein Volume eingerichtet, mit einem unterstützten Dateisystem formatiert und beispielsweise über einen Laufwerksbuchstaben eingebunden werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-124",
    "category": "Betriebssysteme",
    "topic": "Prozesse",
    "difficulty": "medium",
    "question": "Was ist ein Prozess?",
    "answers": [
      "Eine gestartete Programminstanz mit Ausführungszustand und zugeordneten Ressourcen.",
      "Eine ausführbare Programmdatei, die noch nicht gestartet wurde.",
      "Ein einzelner Ausführungsstrang innerhalb einer Programminstanz.",
      "Ein Zeitabschnitt, für den der Scheduler einer Aufgabe die CPU zuteilt."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Prozess repräsentiert ein aktuell ausgeführtes Programm mit zugewiesenen Ressourcen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-125",
    "category": "Betriebssysteme",
    "topic": "Prozesse",
    "difficulty": "medium",
    "question": "Ein Prozessname erscheint mehrfach im Task-Manager. Welche Angabe unterscheidet die gleichzeitig laufenden Prozessinstanzen eindeutig?",
    "answers": [
      "Die Prozess-ID (PID).",
      "Der Name der ausführbaren Datei.",
      "Das Installationsverzeichnis der Anwendung.",
      "Der Name des angemeldeten Benutzers."
    ],
    "correctAnswer": 0,
    "explanation": "Jeder gleichzeitig bestehende Prozess besitzt eine eigene Prozess-ID. Namen, Pfade und Benutzer können bei mehreren Instanzen gleich sein; PIDs können nach dem Ende eines Prozesses später wiederverwendet werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-126",
    "category": "Betriebssysteme",
    "topic": "Prozesse",
    "difficulty": "medium",
    "question": "Was bedeutet eine hohe CPU-Auslastung im Task-Manager?",
    "answers": [
      "Ein großer Anteil der verfügbaren CPU-Zeit wird für Verarbeitung genutzt.",
      "Ein großer Anteil der installierten Anwendungen wird gerade von der SSD gelesen.",
      "Ein großer Anteil des physischen RAMs wurde bereits dauerhaft reserviert.",
      "Ein großer Anteil der Netzwerkbandbreite wird für den Prozess reserviert."
    ],
    "correctAnswer": 0,
    "explanation": "Hohe CPU-Auslastung zeigt, dass viel verfügbare Rechenzeit genutzt wird. Bei rechenintensiven Aufgaben kann das normal sein; für eine Diagnose sind Dauer, betroffene Prozesse und die tatsächlich wahrgenommene Störung entscheidend.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-127",
    "category": "Betriebssysteme",
    "topic": "Prozesse",
    "difficulty": "medium",
    "question": "Was zeigt im Windows-Task-Manager die Anzeige des verwendeten Arbeitsspeichers im Bereich Leistung?",
    "answers": [
      "Wie viel physischer RAM aktuell genutzt wird.",
      "Wie viel freier Speicherplatz auf dem Systemlaufwerk vorhanden ist.",
      "Wie groß die Summe der ausführbaren Programmdateien auf dem Datenträger ist.",
      "Wie groß der von allen Prozessen reservierte virtuelle Adressraum insgesamt ist."
    ],
    "correctAnswer": 0,
    "explanation": "Die RAM-Auslastung zeigt die aktuelle Nutzung des physischen Arbeitsspeichers.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-128",
    "category": "Betriebssysteme",
    "topic": "Prozesse",
    "difficulty": "medium",
    "question": "Eine Anwendung reagiert dauerhaft nicht mehr und lässt sich über ihre Oberfläche nicht schließen. Welche Maßnahme kann als letzter Schritt sinnvoll sein?",
    "answers": [
      "Den betroffenen Prozess im Task-Manager beenden und möglichen Datenverlust berücksichtigen.",
      "Die Priorität des Prozesses erhöhen, damit er ungespeicherte Daten automatisch sichert.",
      "Die Programmdatei auf dem Datenträger umbenennen, damit alle offenen Dateien geschlossen werden.",
      "Ein zweites Fenster der Anwendung öffnen, damit das erste Fenster geordnet beendet wird."
    ],
    "correctAnswer": 0,
    "explanation": "Ein erzwungenes Prozessende kann eine nicht reagierende Anwendung schließen. Es garantiert jedoch keine Ausführung ihrer Aufräum- oder Speicherroutinen; ungespeicherte Änderungen können verloren gehen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-129",
    "category": "Betriebssysteme",
    "topic": "Prozesse",
    "difficulty": "medium",
    "question": "Welche Gefahr besteht beim Beenden eines unbekannten Systemprozesses?",
    "answers": [
      "Abhängige Systemfunktionen können ausfallen oder Windows kann instabil werden.",
      "Die zugehörige Programmdatei wird automatisch aus dem Systemverzeichnis entfernt.",
      "Die gespeicherten Einstellungen aller Benutzer werden auf Standardwerte zurückgesetzt.",
      "Die installierten Sicherheitsupdates des Prozesses werden automatisch deinstalliert."
    ],
    "correctAnswer": 0,
    "explanation": "Systemprozesse erfüllen wichtige Aufgaben; unüberlegtes Beenden kann Instabilität verursachen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-130",
    "category": "Betriebssysteme",
    "topic": "Dienste",
    "difficulty": "medium",
    "question": "Was ist ein Windows-Dienst?",
    "answers": [
      "Eine vom Service Control Manager verwaltete Komponente für Hintergrundaufgaben.",
      "Ein bei der Benutzeranmeldung geöffnetes Fenster einer Desktopanwendung.",
      "Eine zeitgesteuerte Aufgabe, die ausschließlich durch die Aufgabenplanung verwaltet wird.",
      "Ein Benutzerprofil, das Einstellungen für mehrere Anwendungen zusammenfasst."
    ],
    "correctAnswer": 0,
    "explanation": "Windows-Dienste werden vom Service Control Manager verwaltet und arbeiten häufig ohne direkte Benutzeroberfläche. Ein Prozess kann einen oder mehrere Dienste beherbergen; ein Dienst ist daher nicht mit einem eigenen Prozess gleichzusetzen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-131",
    "category": "Betriebssysteme",
    "topic": "Dienste",
    "difficulty": "medium",
    "question": "Welche Startart sieht den regulären Start eines Windows-Dienstes beim Systemstart ohne verzögerten automatischen Start vor?",
    "answers": [
      "Automatisch",
      "Automatisch (Verzögerter Start)",
      "Manuell",
      "Deaktiviert"
    ],
    "correctAnswer": 0,
    "explanation": "Automatisch startet den Dienst im Rahmen des Systemstarts. Automatisch (Verzögerter Start) verschiebt den Start auf eine spätere Phase. Manuell erfordert eine Startanforderung, während Deaktiviert einen Start bis zur Änderung dieser Einstellung verhindert.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-132",
    "category": "Betriebssysteme",
    "topic": "Dienste",
    "difficulty": "medium",
    "question": "Was bedeutet die Startart 'Manuell' bei einem Dienst?",
    "answers": [
      "Er kann durch eine Startanforderung gestartet werden, etwa durch einen Benutzer oder ein Programm.",
      "Er wird vom Service Control Manager regulär bei jedem Systemstart automatisch gestartet.",
      "Er wird beim Systemstart automatisch nach einer zusätzlichen Verzögerung gestartet.",
      "Er ist für Startanforderungen gesperrt, bis seine Startart geändert wird."
    ],
    "correctAnswer": 0,
    "explanation": "Manuell entspricht einem Start bei Bedarf. Eine Anforderung kann von einem Benutzer, einem Programm oder einer abhängigen Komponente kommen; bei entsprechend konfigurierten Diensten sind auch Trigger möglich. Manuell bedeutet nicht, dass ausschließlich ein Mensch den Dienst starten kann.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-133",
    "category": "Betriebssysteme",
    "topic": "Dienste",
    "difficulty": "medium",
    "question": "Warum sollte man unbekannte Windows-Dienste nicht wahllos deaktivieren?",
    "answers": [
      "Abhängige Dienste oder Anwendungen können dadurch ihre Funktion verlieren.",
      "Die Dienstdateien werden beim Deaktivieren aus dem Systemverzeichnis gelöscht.",
      "Die Konfiguration sämtlicher Dienste wird beim Deaktivieren auf Standardwerte gesetzt.",
      "Die zum Dienst gehörende Anwendung wird beim nächsten Start neu installiert."
    ],
    "correctAnswer": 0,
    "explanation": "Viele Dienste haben Abhängigkeiten und erfüllen zentrale Systemaufgaben.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-134",
    "category": "Betriebssysteme",
    "topic": "Dienste",
    "difficulty": "medium",
    "question": "Was beschreibt eine Dienstabhängigkeit?",
    "answers": [
      "Ein Dienst benötigt einen anderen Dienst, der deshalb zuerst gestartet werden muss.",
      "Zwei Dienste verwenden denselben Anzeigenamen in der Diensteverwaltung.",
      "Zwei Dienste speichern ihre ausführbaren Dateien im selben Verzeichnis.",
      "Ein Dienst wurde zusammen mit einem anderen Dienst am selben Tag installiert."
    ],
    "correctAnswer": 0,
    "explanation": "Windows-Dienste können voneinander abhängig sein und in bestimmter Reihenfolge benötigt werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-135",
    "category": "Betriebssysteme",
    "topic": "Autostart",
    "difficulty": "medium",
    "question": "Was ist ein Autostartprogramm?",
    "answers": [
      "Eine Anwendung, deren Start durch Systemstart oder Benutzeranmeldung ausgelöst wird.",
      "Eine Anwendung, die vom Benutzer bei jedem Start mit erhöhten Rechten aufgerufen wird.",
      "Eine Anwendung, die beim Öffnen eines zugeordneten Dateityps durch den Benutzer startet.",
      "Eine Anwendung, die zur Ausführung von einem Installationsmedium aufgerufen werden muss."
    ],
    "correctAnswer": 0,
    "explanation": "Autostartprogramme werden automatisch beim Systemstart oder der Benutzeranmeldung geladen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-136",
    "category": "Betriebssysteme",
    "topic": "Autostart",
    "difficulty": "medium",
    "question": "Wo können Autostartprogramme unter Windows einfach geprüft werden?",
    "answers": [
      "Im Task-Manager im Bereich für Autostart-Apps.",
      "In der Datenträgerverwaltung in der Liste der Volumes.",
      "Im Geräte-Manager in den Eigenschaften der Netzwerkadapter.",
      "In der Ereignisanzeige in den Eigenschaften des Sicherheitsprotokolls."
    ],
    "correctAnswer": 0,
    "explanation": "Der Task-Manager zeigt viele Anwendungen an, die bei der Benutzeranmeldung starten, und erlaubt deren Deaktivierung. Er ist keine vollständige Übersicht über alle Startmechanismen, etwa Dienste und geplante Aufgaben.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-137",
    "category": "Betriebssysteme",
    "topic": "Autostart",
    "difficulty": "medium",
    "question": "Warum kann das Deaktivieren unnötiger Autostartprogramme sinnvoll sein?",
    "answers": [
      "Die Anmeldung kann schneller ablaufen, und weniger automatisch gestartete Programme können Ressourcen beanspruchen.",
      "Die Programme werden dadurch vom Datenträger entfernt und geben ihren Installationsplatz frei.",
      "Die Programme verlieren dadurch ihre Berechtigungen für einen späteren manuellen Start.",
      "Die Programme werden dadurch bei jeder Ausführung mit niedrigerer Prozesspriorität gestartet."
    ],
    "correctAnswer": 0,
    "explanation": "Weniger unnötige Hintergrundprogramme können Start und Ressourcennutzung verbessern.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-138",
    "category": "Betriebssysteme",
    "topic": "Treiber",
    "difficulty": "medium",
    "question": "Welche Aufgabe hat ein Gerätetreiber?",
    "answers": [
      "Er setzt Geräteanforderungen des Betriebssystems in passende gerätespezifische Operationen um.",
      "Er wählt vor dem Systemstart das zu ladende Betriebssystem aus.",
      "Er verwaltet die Reihenfolge, in der Benutzerprogramme CPU-Zeit erhalten.",
      "Er legt die Zugriffsrechte von Benutzern auf gespeicherte Dokumente fest."
    ],
    "correctAnswer": 0,
    "explanation": "Treiber stellen die Softwareschnittstelle zwischen Betriebssystem und Gerät bereit.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-139",
    "category": "Betriebssysteme",
    "topic": "Treiber",
    "difficulty": "medium",
    "question": "Ein Gerät funktioniert seit einer Treiberänderung nicht mehr. Welche Information aus dem Geräte-Manager hilft, die installierte Treiberversion zu dokumentieren?",
    "answers": [
      "Anbieter, Datum und Versionsnummer auf der Registerkarte Treiber.",
      "Hardware-IDs und kompatible IDs auf der Registerkarte Details.",
      "Interrupt- und Speicherbereiche auf der Registerkarte Ressourcen.",
      "Die allgemeine Statusmeldung auf der Registerkarte Allgemein."
    ],
    "correctAnswer": 0,
    "explanation": "Die Treibereigenschaften liefern unter anderem Anbieter, Datum und Versionsnummer. Diese Angaben helfen beim Vergleich mit einer zuvor funktionierenden Version; das Datum allein beweist nicht, wann der Treiber installiert wurde.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-140",
    "category": "Betriebssysteme",
    "topic": "Treiber",
    "difficulty": "medium",
    "question": "Was kann ein gelbes Warnsymbol im Geräte-Manager bedeuten?",
    "answers": [
      "Windows meldet ein Problem mit dem Gerät oder seinem Treiber.",
      "Windows kennzeichnet das Gerät als optional und momentan unbenutzt.",
      "Windows zeigt eine verfügbare neuere Treiberversion für das Gerät an.",
      "Windows bestätigt, dass der Treiber erfolgreich geladen wurde und das Gerät betriebsbereit ist."
    ],
    "correctAnswer": 0,
    "explanation": "Ein gelbes Warnsymbol weist auf einen gemeldeten Gerätefehler hin. In den Geräteeigenschaften liefern Gerätestatus und Fehlercode nähere Hinweise; das Symbol allein nennt noch nicht die Ursache.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-141",
    "category": "Betriebssysteme",
    "topic": "Treiber",
    "difficulty": "medium",
    "question": "Nach einer Betriebssystemaktualisierung tritt ein dokumentierter Fehler im Grafiktreiber auf. Wozu kann ein passendes Treiberupdate dienen?",
    "answers": [
      "Den Softwarefehler beheben und die Zusammenarbeit mit dem Betriebssystem verbessern.",
      "Die aktuelle Betriebssystemversion ohne gesonderte Wiederherstellung zurücksetzen.",
      "Die Einstellungen aller Grafikprogramme auf dieselbe Konfiguration vereinheitlichen.",
      "Die Mindestanforderungen der installierten Programme nachträglich herabsetzen."
    ],
    "correctAnswer": 0,
    "explanation": "Treiberupdates können Fehler beheben und Unterstützung für Hardware oder Software verbessern.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-142",
    "category": "Betriebssysteme",
    "topic": "Treiber",
    "difficulty": "hard",
    "question": "Was ist ein möglicher Grund, einen neuen Treiber wieder zurückzusetzen?",
    "answers": [
      "Der neue Treiber verursacht Instabilität oder Funktionsprobleme",
      "Der neue Treiber verwendet denselben Gerätenamen",
      "Der neue Treiber wurde digital signiert",
      "Der neue Treiber besitzt eine neuere Versionsnummer"
    ],
    "correctAnswer": 0,
    "explanation": "Bei Problemen kann ein zuvor funktionierender Treiber eine sinnvolle Rückfalloption sein.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-143",
    "category": "Betriebssysteme",
    "topic": "Windows Update",
    "difficulty": "medium",
    "question": "Zwei gleich wichtige Server haben dieselbe Sicherheitslücke. Der betroffene Dienst ist bei einem Server aus dem Internet erreichbar, beim anderen gegen die relevanten Angriffswege isoliert. Was spricht dafür, den erreichbaren Server zuerst zu patchen?",
    "answers": [
      "Angreifer können den verwundbaren Dienst unmittelbar erreichen.",
      "Eine Internetverbindung senkt die Wahrscheinlichkeit von Installationsfehlern.",
      "Ein isolierter Server benötigt auch nach Aufhebung der Isolation keine Korrektur.",
      "Die Erreichbarkeit ersetzt die Prüfung, ob das Update zum Betriebssystem passt."
    ],
    "correctAnswer": 0,
    "explanation": "Für die Priorisierung zählen unter anderem Betroffenheit, Ausnutzbarkeit und Exposition der verwundbaren Komponente sowie die Bedeutung des Systems. Ein vorhandenes Update muss mit angemessener Dringlichkeit geprüft und ausgerollt werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-144",
    "category": "Betriebssysteme",
    "topic": "Windows Update",
    "difficulty": "medium",
    "question": "Warum sollten Updates in Unternehmen geplant ausgerollt werden?",
    "answers": [
      "Tests und gestufte Verteilung helfen, Kompatibilitätsprobleme und Ausfälle früh zu erkennen.",
      "Ein fester Zeitplan macht die Prüfung der tatsächlich installierten Updateversion entbehrlich.",
      "Eine gleichzeitige Installation auf allen Geräten ersetzt den Test geschäftskritischer Anwendungen.",
      "Ein Rolloutplan stellt fehlgeschlagene Installationen ohne weitere Maßnahmen automatisch wieder her."
    ],
    "correctAnswer": 0,
    "explanation": "Geplante Rollouts reduzieren Risiken und erlauben Tests vor breiter Verteilung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-145",
    "category": "Betriebssysteme",
    "topic": "Windows Update",
    "difficulty": "medium",
    "question": "Was ist ein Funktionsupdate?",
    "answers": [
      "Ein Update, das neue oder wesentlich geänderte Betriebssystemfunktionen bereitstellt.",
      "Ein Update, das ausschließlich aktuelle Erkennungsdaten für den Virenschutz bereitstellt.",
      "Ein Paket, das den Gerätetreiber einer bestimmten Hardwarekomponente ersetzt.",
      "Eine Sicherung, die ausgewählte Systemeinstellungen auf einem Datenträger ablegt."
    ],
    "correctAnswer": 0,
    "explanation": "Funktionsupdates verändern typischerweise größere Teile des Betriebssystems.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-146",
    "category": "Betriebssysteme",
    "topic": "Windows Update",
    "difficulty": "medium",
    "question": "Warum kann ein Neustart nach einem Windows-Update erforderlich sein?",
    "answers": [
      "Bestimmte Systemdateien können erst beim Neustart ersetzt werden",
      "Der Monitor muss danach neu kalibriert werden",
      "Die SSD muss dadurch neu partitioniert werden",
      "Alle Benutzerkonten müssen neu angelegt werden"
    ],
    "correctAnswer": 0,
    "explanation": "In Benutzung befindliche Systemkomponenten können oft erst während eines Neustarts aktualisiert werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-147",
    "category": "Betriebssysteme",
    "topic": "Ereignisanzeige",
    "difficulty": "medium",
    "question": "Ein Anwendungsabsturz soll in der Windows-Ereignisanzeige untersucht werden. In welchem Windows-Protokoll sind entsprechende Anwendungsmeldungen typischerweise zu suchen?",
    "answers": [
      "Anwendung",
      "Sicherheit",
      "Setup",
      "Weitergeleitete Ereignisse"
    ],
    "correctAnswer": 0,
    "explanation": "Das Protokoll Anwendung enthält Meldungen von Anwendungen und zugehörigen Komponenten. Abhängig vom Programm können zusätzlich eigene Protokolle vorhanden sein; Sicherheits- oder Installationsprotokolle verfolgen andere Schwerpunkte.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-148",
    "category": "Betriebssysteme",
    "topic": "Ereignisanzeige",
    "difficulty": "medium",
    "question": "Warum ist ein Zeitstempel in einem Ereignisprotokoll hilfreich?",
    "answers": [
      "Ereignisse lassen sich mit Änderungen und Störungen im selben Zeitraum abgleichen.",
      "Ein Zeitstempel weist unabhängig vom Inhalt die eigentliche Fehlerursache nach.",
      "Ein Zeitstempel bestätigt, dass eine gemeldete Störung bereits behoben wurde.",
      "Ein Zeitstempel ersetzt die Prüfung, welcher Dienst das Ereignis gemeldet hat."
    ],
    "correctAnswer": 0,
    "explanation": "Zeitliche Zusammenhänge helfen bei der Ursachenanalyse.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-149",
    "category": "Betriebssysteme",
    "topic": "Ereignisanzeige",
    "difficulty": "medium",
    "question": "Was ist bei der Fehlersuche mit der Ereignisanzeige sinnvoll?",
    "answers": [
      "Zeitpunkt, Quelle und Inhalt passender Ereignisse mit dem beobachteten Fehler vergleichen.",
      "Das jüngste Ereignis mit dem höchsten Schweregrad ohne weiteren Kontext als Ursache festlegen.",
      "Die Anzahl aller Warnungen als unmittelbares Maß für einen Hardwaredefekt verwenden.",
      "Ein erfolgreiches Ereignis nach dem Fehler als ausreichenden Nachweis der Behebung ansehen."
    ],
    "correctAnswer": 0,
    "explanation": "Kontext, Zeitpunkt und Quelle eines Ereignisses sind wichtig für die Diagnose.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-150",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "medium",
    "question": "ipconfig /all zeigt für einen Windows-Adapter DHCP aktiviert: Nein. Seine IPv4-Adresse wurde manuell eingetragen. Warum kann ipconfig /renew diese Adresse nicht als DHCP-Lease erneuern?",
    "answers": [
      "Der Adapter verwendet für diese IPv4-Konfiguration keine DHCP-Lease.",
      "Eine DHCP-Lease kann erst nach Ablauf ihrer gesamten Gültigkeitsdauer erneuert werden.",
      "Vor jeder DHCP-Erneuerung muss der Rechner seine physische Adapteradresse ändern.",
      "Die Erneuerung einer DHCP-Lease setzt das erfolgreiche Leeren des DNS-Caches voraus."
    ],
    "correctAnswer": 0,
    "explanation": "ipconfig /renew erneuert DHCP-Konfigurationen. Eine manuell eingetragene IPv4-Adresse ist keine DHCP-Lease; für eine automatische Zuweisung müsste der Adapter entsprechend auf DHCP umgestellt werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-151",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "medium",
    "question": "Welche Angaben zeigt ipconfig /all unter Windows zusätzlich zur grundlegenden Ausgabe von ipconfig?",
    "answers": [
      "Unter anderem physische Adapteradressen, DHCP-Status und konfigurierte DNS-Server.",
      "Unter anderem aktive TCP-Verbindungen, Prozess-IDs und lauschende Ports.",
      "Unter anderem Router entlang eines Pfads und die Laufzeit zu jedem Hop.",
      "Unter anderem Dateifreigaben, deren Besitzer und die zugewiesenen NTFS-Rechte."
    ],
    "correctAnswer": 0,
    "explanation": "ipconfig /all zeigt unter anderem MAC-Adresse, DHCP- und DNS-Informationen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-152",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "medium",
    "question": "Eine direkte HTTPS-Verbindung zu einem Server funktioniert, ping auf dieselbe IP-Adresse erhält jedoch keine Antwort. Welche Erklärung ist plausibel?",
    "answers": [
      "ICMP-Echo-Anfragen oder ihre Antworten werden gefiltert, während HTTPS erlaubt ist.",
      "Der erfolgreiche HTTPS-Zugriff bedeutet, dass der Server auch jede ICMP-Echo-Anfrage beantworten muss.",
      "Ein Server benötigt für ICMP grundsätzlich eine andere Ziel-IP-Adresse als für HTTPS.",
      "Ein fehlendes ICMP-Echo beweist, dass auch die beobachtete HTTPS-Verbindung keine Daten übertragen konnte."
    ],
    "correctAnswer": 0,
    "explanation": "ICMP-Echo und HTTPS sind unterschiedliche Arten von Netzwerkverkehr und können unterschiedlich gefiltert werden. Ein fehlendes Echo allein beweist daher nicht, dass ein Host oder sein Webdienst unerreichbar ist.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-153",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "medium",
    "question": "Was prüft 'ping 127.0.0.1' hauptsächlich?",
    "answers": [
      "Die lokale IPv4-Verarbeitung über die Loopback-Schnittstelle.",
      "Die Verbindung zwischen Netzwerkkarte und lokalem Standardgateway.",
      "Die Erreichbarkeit eines konfigurierten DNS-Servers.",
      "Die Weiterleitung durch den Router in ein entferntes Netz."
    ],
    "correctAnswer": 0,
    "explanation": "127.0.0.1 ist eine IPv4-Loopback-Adresse. Ein erfolgreicher ping darauf prüft lokale IP-Verarbeitung, aber weder das Netzwerkkabel noch den Weg zum Router oder ins Internet.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-154",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "medium",
    "question": "In einer Windows-tracert-Ausgabe erscheinen bei einem Hop Sternchen, spätere Hops antworten jedoch. Was lässt sich daraus ableiten?",
    "answers": [
      "Für diesen Hop kam innerhalb der Wartezeit keine passende Antwort zurück.",
      "Der gesamte Pfad zum Ziel ist ab diesem Hop nachweislich unterbrochen.",
      "Der Zielrechner hat für alle Protokolle die Verbindung zum Absender gesperrt.",
      "Der lokale DNS-Resolver hat die IP-Adresse dieses Routers aus seinem Cache gelöscht."
    ],
    "correctAnswer": 0,
    "explanation": "Sternchen kennzeichnen ausgebliebene Antworten innerhalb der Wartezeit. Ein Router kann Diagnoseantworten filtern oder begrenzen und trotzdem Nutzverkehr weiterleiten; spätere Antworten sprechen gegen einen vollständigen Abbruch an diesem Hop.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-155",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "medium",
    "question": "Wozu dient nslookup?",
    "answers": [
      "DNS-Einträge bei einem DNS-Server abfragen.",
      "Die lokale IPv4-Routingtabelle anzeigen.",
      "Aktive TCP-Verbindungen und lauschende Ports auflisten.",
      "Die gespeicherten IPv4-zu-MAC-Zuordnungen anzeigen."
    ],
    "correctAnswer": 0,
    "explanation": "nslookup fragt DNS-Informationen ab und hilft bei der Analyse der Namensauflösung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-156",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "medium",
    "question": "Was zeigt der Befehl hostname?",
    "answers": [
      "Den Namen des lokalen Rechners.",
      "Den Namen des angemeldeten Benutzerkontos.",
      "Den Namen des konfigurierten DNS-Servers.",
      "Den Namen der Windows-Arbeitsgruppe."
    ],
    "correctAnswer": 0,
    "explanation": "hostname gibt den Computernamen des lokalen Systems aus.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-157",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "medium",
    "question": "Ein Windows-PC besitzt zwei aktive DHCP-Adapter namens Ethernet und WLAN. Die DHCP-Konfiguration von Ethernet soll freigegeben werden; die Konfiguration von WLAN soll unverändert bleiben. Welcher Befehl passt?",
    "answers": [
      "ipconfig /release \"Ethernet\"",
      "ipconfig /renew \"Ethernet\"",
      "ipconfig /release",
      "ipconfig /flushdns"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Adaptername begrenzt /release auf die passende Schnittstelle. Ohne Adapterangabe richtet sich /release an alle passenden DHCP-Adapter; /renew erneuert Konfigurationen und /flushdns betrifft den Resolver-Cache.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-158",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "medium",
    "question": "Nach ipconfig /renew besitzt ein DHCP-Client wieder dieselbe IPv4-Adresse. Welche Aussage ist korrekt?",
    "answers": [
      "Eine erfolgreiche Lease-Erneuerung kann dieselbe Adresse beibehalten.",
      "Der Befehl ist fehlgeschlagen, weil jede Erneuerung die Adresse ändern muss.",
      "Der Client hat dadurch automatisch auf eine statische Adresskonfiguration gewechselt.",
      "Der DNS-Server hat die bisherige DHCP-Adresse unabhängig vom DHCP-Server reserviert."
    ],
    "correctAnswer": 0,
    "explanation": "Die Erneuerung einer DHCP-Lease erzwingt keinen Adresswechsel. Der Server kann die bisherige Adresse weiter bestätigen; Erfolg und Gültigkeit müssen anhand der Konfiguration und Lease-Informationen beurteilt werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-159",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "hard",
    "question": "ping auf die bekannte IPv4-Adresse eines Servers funktioniert. ping auf dessen vollständigen DNS-Namen meldet dagegen, dass der Host nicht gefunden wurde. Welche Ursache ist besonders plausibel?",
    "answers": [
      "Die DNS-Auflösung des angegebenen Namens ist gestört oder der Name ist falsch.",
      "Der Server blockiert sämtliche ICMP-Echo-Anfragen an seine IPv4-Adresse.",
      "Die Netzwerkkarte besitzt keine funktionsfähige Verbindung zum lokalen Netz.",
      "Die lokale IPv4-Route zur bekannten Serveradresse fehlt vollständig."
    ],
    "correctAnswer": 0,
    "explanation": "Die Meldung, dass der Hostname nicht gefunden wurde, betrifft die Namensauflösung. Bei funktionierendem Zugriff auf die bekannte IP-Adresse sollten Schreibweise, DNS-Konfiguration und DNS-Einträge geprüft werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-160",
    "category": "Betriebssysteme",
    "topic": "Freigaben",
    "difficulty": "medium",
    "question": "Was ist eine Netzwerkfreigabe?",
    "answers": [
      "Eine Ressource, die ein Rechner für Zugriffe über das Netzwerk bereitstellt.",
      "Ein Ordner, der im lokalen Explorer als Favorit markiert wurde.",
      "Eine Partition, die einem lokalen Laufwerksbuchstaben zugeordnet wurde.",
      "Ein Dateisystembereich, den ein Benutzer für den Offlinebetrieb reserviert hat."
    ],
    "correctAnswer": 0,
    "explanation": "Freigaben ermöglichen autorisierten Benutzern den Netzwerkzugriff auf Ressourcen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-161",
    "category": "Betriebssysteme",
    "topic": "Freigaben",
    "difficulty": "medium",
    "question": "Welche zwei Berechtigungsebenen können bei einer Windows-Dateifreigabe relevant sein?",
    "answers": [
      "Freigabeberechtigungen und NTFS-Berechtigungen.",
      "Freigabeberechtigungen und Datenträgerkontingente.",
      "NTFS-Berechtigungen und Firewallprofile.",
      "Datenträgerverschlüsselung und Dateikomprimierung."
    ],
    "correctAnswer": 0,
    "explanation": "Bei Netzwerkzugriff können sowohl Freigabe- als auch Dateisystemberechtigungen wirken.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-162",
    "category": "Betriebssysteme",
    "topic": "Freigaben",
    "difficulty": "hard",
    "question": "Ein Benutzer erhält über die SMB-Freigabe Lesen und über NTFS Ändern. Es gelten keine weiteren Einschränkungen. Welche der folgenden Aktionen ist über diese Freigabe erlaubt?",
    "answers": [
      "Den vorhandenen Dateiinhalt lesen.",
      "Den vorhandenen Dateiinhalt überschreiben.",
      "Die vorhandene Datei löschen.",
      "Eine neue Datei im freigegebenen Ordner anlegen."
    ],
    "correctAnswer": 0,
    "explanation": "Beim SMB-Zugriff muss eine Operation sowohl durch die effektiven Freigaberechte als auch durch die effektiven NTFS-Rechte erlaubt sein. Hier begrenzt die Freigabeberechtigung Lesen den Netzwerkzugriff trotz weitergehender NTFS-Rechte.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-163",
    "category": "Betriebssysteme",
    "topic": "Freigaben",
    "difficulty": "medium",
    "question": "Welche Angabe ist ein UNC-Pfad zu einem freigegebenen Ordner auf einem Server?",
    "answers": [
      "\\\\Server\\Freigabe",
      "C:\\Freigabe",
      "https://Server/Freigabe",
      "Server:Freigabe"
    ],
    "correctAnswer": 0,
    "explanation": "Ein UNC-Pfad beginnt mit zwei umgekehrten Schrägstrichen, gefolgt von Servername und Freigabename. Er adressiert die Freigabe, ohne dass zuvor ein Laufwerksbuchstabe zugeordnet werden muss.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-164",
    "category": "Betriebssysteme",
    "topic": "Freigaben",
    "difficulty": "medium",
    "question": "Was bezeichnet ein verbundenes Netzlaufwerk mit dem Buchstaben Z: unter Windows?",
    "answers": [
      "Eine Netzwerkfreigabe, die unter einem lokalen Laufwerksbuchstaben erreichbar ist.",
      "Eine lokale Partition, die für den angemeldeten Benutzer umbenannt wurde.",
      "Eine virtuelle Festplattendatei, die als lokales Volume eingebunden wurde.",
      "Ein vollständiges Abbild einer Freigabe, das dauerhaft ohne Server verfügbar ist."
    ],
    "correctAnswer": 0,
    "explanation": "Ein verbundenes Netzlaufwerk ordnet einer Netzwerkfreigabe einen Laufwerksbuchstaben zu. Die Daten verbleiben grundsätzlich auf dem Server; die Zuordnung allein erstellt keine vollständige lokale Kopie.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-165",
    "category": "Betriebssysteme",
    "topic": "Windows Sicherheit",
    "difficulty": "medium",
    "question": "Welche Aufgabe hat die Windows-Firewall?",
    "answers": [
      "Ein- und ausgehenden Netzwerkverkehr anhand von Regeln zulassen oder blockieren.",
      "Übertragene Dateien anhand von Schadsoftwaresignaturen untersuchen.",
      "Die Identität eines Benutzers bei der Windows-Anmeldung überprüfen.",
      "Den Inhalt gespeicherter Dateien gegen Offlinezugriffe verschlüsseln."
    ],
    "correctAnswer": 0,
    "explanation": "Eine Firewall kontrolliert ein- und ausgehenden Netzwerkverkehr.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-166",
    "category": "Betriebssysteme",
    "topic": "Windows Sicherheit",
    "difficulty": "medium",
    "question": "Warum unterscheiden sich Firewallprofile wie Privat und Öffentlich?",
    "answers": [
      "Sie ermöglichen unterschiedliche Firewallregeln je nach eingestufter Netzwerkumgebung.",
      "Sie legen für jedes Netzwerk automatisch einen anderen DNS-Namensraum an.",
      "Sie ersetzen die Zugriffsberechtigungen von Benutzern auf freigegebene Dateien.",
      "Sie legen die Funkverschlüsselung und das WLAN-Kennwort für das jeweilige Netzwerk fest."
    ],
    "correctAnswer": 0,
    "explanation": "Öffentliche Netze erfordern typischerweise restriktivere Regeln als vertrauenswürdige private Netze.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-167",
    "category": "Betriebssysteme",
    "topic": "Windows Sicherheit",
    "difficulty": "medium",
    "question": "Welche Aufgabe erfüllt Microsoft Defender Antivirus?",
    "answers": [
      "Dateien und Aktivitäten auf Schadsoftware untersuchen und Bedrohungen abwehren.",
      "Laufwerke gegen das Auslesen ohne passenden Entsperrschlüssel verschlüsseln.",
      "Netzwerkpakete anhand von Port- und Adressregeln filtern.",
      "Die Installation von Windows mit einem Aktivierungsnachweis verknüpfen."
    ],
    "correctAnswer": 0,
    "explanation": "Defender Antivirus schützt vor verschiedenen Arten von Schadsoftware.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-168",
    "category": "Betriebssysteme",
    "topic": "Windows Sicherheit",
    "difficulty": "medium",
    "question": "Warum sollten Virensignaturen beziehungsweise Schutzinformationen aktuell sein?",
    "answers": [
      "Neue Erkennungsinformationen verbessern die Erkennung inzwischen bekannter Bedrohungen.",
      "Neue Erkennungsinformationen beheben automatisch die Sicherheitslücken jeder installierten Anwendung.",
      "Neue Erkennungsinformationen ersetzen die Überprüfung verdächtiger Dateien während ihrer Nutzung.",
      "Neue Erkennungsinformationen stellen beschädigte Benutzerdateien aus einem Backup wieder her."
    ],
    "correctAnswer": 0,
    "explanation": "Aktuelle Erkennungsdaten verbessern den Schutz gegen neu bekannte Schadsoftware.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-169",
    "category": "Betriebssysteme",
    "topic": "Windows Sicherheit",
    "difficulty": "medium",
    "question": "Warum ist ein deaktivierter Echtzeitschutz auf einem Arbeitsplatz riskant?",
    "answers": [
      "Dateien und Aktivitäten werden während der Nutzung nicht mehr durch diesen Schutz laufend geprüft.",
      "Die gespeicherten Virensignaturen werden beim Ausschalten des Schutzes automatisch gelöscht.",
      "Die Firewall lässt beim Ausschalten des Schutzes jede eingehende Netzwerkverbindung zu.",
      "Die Verschlüsselung der Systempartition wird beim Ausschalten des Schutzes aufgehoben."
    ],
    "correctAnswer": 0,
    "explanation": "Echtzeitschutz prüft Dateien und Aktivitäten während der Nutzung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-170",
    "category": "Betriebssysteme",
    "topic": "BitLocker",
    "difficulty": "medium",
    "question": "Wozu dient BitLocker?",
    "answers": [
      "Daten auf Laufwerken durch Verschlüsselung gegen unbefugtes Offlineauslesen schützen.",
      "Netzwerkverbindungen anhand von Adressen und Ports zulassen oder blockieren.",
      "Dateien bei ihrer Verwendung anhand von Schadsoftwaremerkmalen prüfen.",
      "Zugriffsrechte einzelner Benutzer auf Dateien über ACL-Einträge festlegen."
    ],
    "correctAnswer": 0,
    "explanation": "BitLocker schützt Daten auf Laufwerken durch Verschlüsselung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-171",
    "category": "Betriebssysteme",
    "topic": "BitLocker",
    "difficulty": "medium",
    "question": "Warum ist ein BitLocker-Wiederherstellungsschlüssel wichtig?",
    "answers": [
      "Er ermöglicht das Entsperren eines verschlüsselten Laufwerks, wenn der normale Entsperrweg nicht verfügbar ist.",
      "Er setzt das Kennwort jedes lokalen Windows-Benutzerkontos ohne weitere Prüfung zurück.",
      "Er stellt gelöschte Dateien aus dem verschlüsselten Laufwerk als frühere Versionen wieder her.",
      "Er ersetzt die Lizenzaktivierung nach dem Austausch des Mainboards."
    ],
    "correctAnswer": 0,
    "explanation": "Der BitLocker-Wiederherstellungsschlüssel ermöglicht den Zugriff auf das verschlüsselte Laufwerk in einem Wiederherstellungsfall, etwa nach relevanten Änderungen der Startumgebung. Er ist kein Ersatz für ein Benutzerkennwort und kein Backup verlorener Dateien.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-172",
    "category": "Betriebssysteme",
    "topic": "BitLocker",
    "difficulty": "medium",
    "question": "Welche Komponente kann bei BitLocker Schlüsselmaterial an Messwerte der Startumgebung binden?",
    "answers": [
      "Trusted Platform Module (TPM)",
      "Windows-Anmeldeinformationsverwaltung",
      "NTFS-Zugriffssteuerungsliste",
      "Windows-Firewallprofil"
    ],
    "correctAnswer": 0,
    "explanation": "Ein TPM kann die Freigabe von Schlüsselmaterial an bestimmte Plattformmesswerte binden. Dadurch kann BitLocker auf unerwartete Änderungen der Startumgebung reagieren.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-173",
    "category": "Betriebssysteme",
    "topic": "BitLocker",
    "difficulty": "hard",
    "question": "Warum kann eine Änderung der gemessenen Startumgebung bei BitLocker mit TPM-Schutz eine Wiederherstellungsabfrage auslösen?",
    "answers": [
      "Die aktuellen Startmesswerte erfüllen die Bedingungen für die normale Freigabe des Schlüsselmaterials nicht.",
      "BitLocker vergleicht dabei das Windows-Anmeldekennwort mit einer im TPM gespeicherten Kennwortkopie.",
      "BitLocker wertet dabei die NTFS-Berechtigungen des angemeldeten Benutzers als Freigabe für den Start aus.",
      "BitLocker prüft dabei den Windows-Aktivierungsstatus als Voraussetzung für die Laufwerksentschlüsselung."
    ],
    "correctAnswer": 0,
    "explanation": "Bei TPM-gestütztem BitLocker können Messwerte der Startumgebung an der Schlüsselfreigabe beteiligt sein. Relevante Änderungen können die normale Freigabe verhindern und die Eingabe eines Wiederherstellungsschlüssels erforderlich machen; nicht jede Hardwareänderung hat diesen Effekt.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-174",
    "category": "Betriebssysteme",
    "topic": "Backup und Wiederherstellung",
    "difficulty": "medium",
    "question": "Warum ist ein Backup wichtig?",
    "answers": [
      "Es ermöglicht die Wiederherstellung gesicherter Daten nach Verlust oder Beschädigung.",
      "Es verhindert die Ausführung von Schadsoftware durch Prüfung aller Dateiänderungen.",
      "Es verschlüsselt vorhandene Dateien gegen das Auslesen durch fremde Benutzer.",
      "Es verhindert das Löschen von Dateien durch Einschränkung der Benutzerrechte."
    ],
    "correctAnswer": 0,
    "explanation": "Backups reduzieren die Folgen von Datenverlust.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-175",
    "category": "Betriebssysteme",
    "topic": "Backup und Wiederherstellung",
    "difficulty": "medium",
    "question": "Originaldaten und ihre einzige Sicherung liegen auf zwei Partitionen derselben SSD. Welches Ereignis kann beide Kopien gleichzeitig unzugänglich machen?",
    "answers": [
      "Ein vollständiger Ausfall des SSD-Controllers.",
      "Das versehentliche Löschen einer einzelnen Originaldatei ohne Synchronisation.",
      "Das Ändern des Namens eines Ordners mit Originaldaten.",
      "Das Schließen des Programms, mit dem die Originaldatei bearbeitet wurde."
    ],
    "correctAnswer": 0,
    "explanation": "Partitionen teilen sich die physische Hardware ihres Datenträgers. Fällt der SSD-Controller aus, können Original und Sicherung gemeinsam betroffen sein; getrennte Datenträger reduzieren dieses gemeinsame Ausfallrisiko.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-176",
    "category": "Betriebssysteme",
    "topic": "Backup und Wiederherstellung",
    "difficulty": "medium",
    "question": "Was ist ein Wiederherstellungspunkt in Windows?",
    "answers": [
      "Ein gespeicherter Zustand ausgewählter Systemdateien und Systemeinstellungen.",
      "Eine vollständige Sicherung aller persönlichen Dokumente des Benutzers.",
      "Ein Abbild des Arbeitsspeichers zum Fortsetzen der laufenden Sitzung.",
      "Eine Kopie des Windows-Installationsmediums auf einem externen Datenträger."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Wiederherstellungspunkt ermöglicht es, bestimmte Systemdateien, installierte Komponenten und Einstellungen auf einen früheren Zustand zurückzusetzen. Er ist keine vollständige Sicherung persönlicher Dateien.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-177",
    "category": "Betriebssysteme",
    "topic": "Backup und Wiederherstellung",
    "difficulty": "medium",
    "question": "Welche regelmäßige Prüfung belegt die praktische Nutzbarkeit einer Datensicherung am unmittelbarsten?",
    "answers": [
      "Benötigte Daten testweise wiederherstellen und ihre Vollständigkeit sowie Lesbarkeit prüfen.",
      "Die Erfolgsmeldung des Sicherungsprogramms ohne Öffnen wiederhergestellter Daten kontrollieren.",
      "Die Existenz und Größe der Sicherungsdateien im Zielverzeichnis kontrollieren.",
      "Die planmäßige Ausführung des Sicherungsauftrags anhand seiner Startzeit kontrollieren."
    ],
    "correctAnswer": 0,
    "explanation": "Regelmäßige Wiederherstellungstests prüfen, ob Daten lesbar, vollständig und mit den verfügbaren Werkzeugen wiederherstellbar sind. Ein erfolgreich gemeldeter Sicherungslauf allein beweist noch keine erfolgreiche Wiederherstellung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-178",
    "category": "Betriebssysteme",
    "topic": "Backup und Wiederherstellung",
    "difficulty": "medium",
    "question": "Zwei Ordner werden ohne Versionsverlauf synchronisiert, einschließlich Löschungen. Eine wichtige Datei wird versehentlich im Quellordner gelöscht. Was ist nach der nächsten erfolgreichen Synchronisation zu erwarten?",
    "answers": [
      "Die Datei kann auch im Ziel fehlen; für den früheren Inhalt ist eine andere Sicherung nötig.",
      "Die Datei bleibt als ältere Version im Ziel erhalten, weil Synchronisation Löschungen als neue Versionen speichert.",
      "Die Datei wird aus dem Ziel wieder in die Quelle kopiert, weil die ältere Kopie grundsätzlich Vorrang hat.",
      "Die Synchronisation bricht bei jeder Löschung ab, bis eine unabhängige Datensicherung bestätigt wurde."
    ],
    "correctAnswer": 0,
    "explanation": "Eine Synchronisation kann den aktuellen Zustand einschließlich Löschungen übernehmen. Ohne Versionsverlauf oder eine unabhängige Sicherung kann die vorherige Datei deshalb an beiden Orten fehlen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-179",
    "category": "Betriebssysteme",
    "topic": "Wiederherstellung",
    "difficulty": "medium",
    "question": "Wie unterstützt der abgesicherte Modus die Fehlersuche bei Windows?",
    "answers": [
      "Er startet mit einem begrenzten Satz von Treibern und Diensten und hilft so, Störquellen einzugrenzen.",
      "Er ersetzt die installierten Treiber automatisch durch ihre neuesten Versionen aus dem Internet.",
      "Er setzt die Berechtigungen sämtlicher Benutzerdateien auf ein gemeinsames Administratorkonto.",
      "Er stellt alle Programme auf die Version zum Zeitpunkt der Windows-Installation zurück."
    ],
    "correctAnswer": 0,
    "explanation": "Der abgesicherte Modus lädt einen reduzierten Satz von Treibern und Diensten. Tritt ein Fehler dort nicht auf, kann dies helfen, zusätzliche Komponenten als mögliche Ursache einzugrenzen; eine Reparatur erfolgt dadurch nicht automatisch.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-180",
    "category": "Betriebssysteme",
    "topic": "Wiederherstellung",
    "difficulty": "medium",
    "question": "Windows startet im abgesicherten Modus, stürzt beim normalen Start aber nach dem Laden zusätzlicher Komponenten ab. Was ist ein sinnvoller nächster Diagnoseschritt?",
    "answers": [
      "Zuletzt geänderte Treiber und Autostartkomponenten gezielt prüfen.",
      "Die erfolgreiche Anmeldung als Nachweis ansehen, dass sämtliche Hardware fehlerfrei ist.",
      "Alle Benutzerkonten neu anlegen, ohne Protokolle oder Änderungen zu prüfen.",
      "Die Systempartition formatieren, bevor einzelne Startkomponenten untersucht werden."
    ],
    "correctAnswer": 0,
    "explanation": "Der Unterschied zwischen normalem und reduziertem Start liefert einen Hinweis auf zusätzlich geladene Komponenten. Änderungen und Ereignisprotokolle helfen, Kandidaten gezielt zu prüfen; ein erfolgreicher abgesicherter Start beweist keine vollständig fehlerfreie Hardware.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-181",
    "category": "Betriebssysteme",
    "topic": "Wiederherstellung",
    "difficulty": "medium",
    "question": "Was ist die Windows-Wiederherstellungsumgebung WinRE?",
    "answers": [
      "Eine separate Umgebung mit Werkzeugen zur Diagnose und Reparatur von Windows.",
      "Eine normale Windows-Sitzung mit dauerhaft erhöhten Rechten für alle Anwendungen.",
      "Ein Abbild des RAMs, aus dem eine zuvor angehaltene Sitzung fortgesetzt wird.",
      "Ein vollständiger Ersatz für die Sicherung persönlicher Benutzerdateien."
    ],
    "correctAnswer": 0,
    "explanation": "WinRE bietet Werkzeuge für Startreparatur, Wiederherstellung und weitere Fehlerbehebung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-182",
    "category": "Betriebssysteme",
    "topic": "Wiederherstellung",
    "difficulty": "medium",
    "question": "Welches WinRE-Werkzeug ist dafür vorgesehen, häufige Fehler der Windows-Startkonfiguration automatisch zu diagnostizieren und zu reparieren?",
    "answers": [
      "Starthilfe (Startup Repair)",
      "Eingabeaufforderung",
      "Systemabbild-Wiederherstellung",
      "Starteinstellungen"
    ],
    "correctAnswer": 0,
    "explanation": "Die Starthilfe untersucht häufige Ursachen fehlgeschlagener Windows-Starts und versucht passende Reparaturen. Sie behebt nicht jede mögliche Ursache und ist von manueller Diagnose oder einer Wiederherstellung aus einem Systemabbild zu unterscheiden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-183",
    "category": "Betriebssysteme",
    "topic": "Kommandozeile",
    "difficulty": "medium",
    "question": "Welcher Windows-Befehl zeigt die Benutzeridentität des Sicherheitskontexts, in dem die aktuelle Eingabeaufforderung läuft?",
    "answers": [
      "whoami",
      "hostname",
      "net user",
      "query user"
    ],
    "correctAnswer": 0,
    "explanation": "whoami zeigt die Identität des aktuellen Sicherheitskontexts. Wird die Eingabeaufforderung unter einem anderen Konto ausgeführt, kann diese Identität vom Benutzer der interaktiven Desktopsitzung abweichen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-184",
    "category": "Betriebssysteme",
    "topic": "Kommandozeile",
    "difficulty": "medium",
    "question": "Welcher CMD-Befehl listet Dateien und Ordner auf?",
    "answers": [
      "dir",
      "cd",
      "cls",
      "ping"
    ],
    "correctAnswer": 0,
    "explanation": "dir zeigt den Inhalt eines Verzeichnisses.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-185",
    "category": "Betriebssysteme",
    "topic": "Kommandozeile",
    "difficulty": "medium",
    "question": "Welcher Befehl wechselt in der Windows-Eingabeaufforderung CMD von C: in das vorhandene Verzeichnis D:\\Daten und aktiviert dabei zugleich Laufwerk D:?",
    "answers": [
      "cd /d D:\\Daten",
      "cd D:\\Daten",
      "dir D:\\Daten",
      "type D:\\Daten"
    ],
    "correctAnswer": 0,
    "explanation": "In CMD wechselt cd /d sowohl das Laufwerk als auch das Verzeichnis. cd mit einem Pfad auf einem anderen Laufwerk ändert ohne /d nicht zugleich das aktive Laufwerk.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-186",
    "category": "Betriebssysteme",
    "topic": "Kommandozeile",
    "difficulty": "medium",
    "question": "Was macht der Befehl cls in der Eingabeaufforderung?",
    "answers": [
      "Er leert die sichtbare Konsolenausgabe",
      "Er löscht den aktuellen Ordner",
      "Er beendet Windows",
      "Er prüft das Dateisystem"
    ],
    "correctAnswer": 0,
    "explanation": "cls räumt lediglich die sichtbare Anzeige der Konsole auf.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-187",
    "category": "Betriebssysteme",
    "topic": "Kommandozeile",
    "difficulty": "medium",
    "question": "Welcher Befehl listet in der Windows-Eingabeaufforderung laufende Prozesse mit ihren Prozessnamen und PIDs auf?",
    "answers": [
      "tasklist",
      "netstat -ano",
      "sc query",
      "query user"
    ],
    "correctAnswer": 0,
    "explanation": "tasklist zeigt laufende Prozesse und zugehörige Informationen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-188",
    "category": "Betriebssysteme",
    "topic": "Kommandozeile",
    "difficulty": "medium",
    "question": "Welcher Windows-CMD-Befehl ist dafür vorgesehen, einen Prozess anhand seiner PID zu beenden?",
    "answers": [
      "taskkill",
      "tasklist",
      "sc query",
      "netstat"
    ],
    "correctAnswer": 0,
    "explanation": "taskkill kann einen Prozess beispielsweise mit /PID gezielt ansprechen. Die PID sollte vorher geprüft werden. Beim erzwungenen Beenden mit /F können ungespeicherte Änderungen verloren gehen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-189",
    "category": "Betriebssysteme",
    "topic": "PowerShell",
    "difficulty": "medium",
    "question": "Was ist PowerShell?",
    "answers": [
      "Eine Shell mit Skriptsprache und Automatisierungsfunktionen für Verwaltungsaufgaben.",
      "Ein Texteditor, der Skriptdateien bearbeiten, aber keine Befehle ausführen kann.",
      "Ein Paketarchiv, das installierbare Windows-Komponenten bereitstellt.",
      "Ein Aufgabenplaner, der Programme anhand von Zeitplänen startet."
    ],
    "correctAnswer": 0,
    "explanation": "PowerShell kombiniert Kommandozeile, Objekte und Skripting für Administration und Automatisierung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-190",
    "category": "Betriebssysteme",
    "topic": "PowerShell",
    "difficulty": "medium",
    "question": "Welcher Vorteil ergibt sich aus den strukturierten Objekten vieler PowerShell-Cmdlets?",
    "answers": [
      "Nachfolgende Cmdlets können Eigenschaften gezielt filtern oder sortieren.",
      "Nachfolgende Cmdlets müssen die sichtbare Spaltenbreite zur Erkennung von Eigenschaften auswerten.",
      "Nachfolgende Cmdlets erhalten unabhängig vom Befehl ausschließlich unstrukturierte Zeichenfolgen.",
      "Nachfolgende Cmdlets können Daten erst nach einem Export in eine Textdatei übernehmen."
    ],
    "correctAnswer": 0,
    "explanation": "Viele Cmdlets geben Objekte mit benannten Eigenschaften zurück. Die Pipeline kann diese direkt weiterverarbeiten, etwa mit Where-Object oder Sort-Object, ohne die formatierte Bildschirmausgabe zerlegen zu müssen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-191",
    "category": "Betriebssysteme",
    "topic": "Systeminformationen",
    "difficulty": "medium",
    "question": "Welches Windows-Werkzeug bietet eine zusammenhängende Übersicht über Betriebssystem, Hardware-Ressourcen, Komponenten und Softwareumgebung?",
    "answers": [
      "msinfo32",
      "winver",
      "devmgmt.msc",
      "diskmgmt.msc"
    ],
    "correctAnswer": 0,
    "explanation": "msinfo32 zeigt Hardware-, System- und Ressourcendetails.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-192",
    "category": "Betriebssysteme",
    "topic": "Systeminformationen",
    "difficulty": "medium",
    "question": "Wozu dient der Befehl winver?",
    "answers": [
      "Er zeigt Windows-Version, Edition und Build-Informationen",
      "Er prüft Dateisystem und Laufwerk auf logische Fehler",
      "Er verwaltet lokale Benutzerkonten und Gruppenmitgliedschaften",
      "Er testet Erreichbarkeit und Qualität einer Netzwerkverbindung"
    ],
    "correctAnswer": 0,
    "explanation": "winver zeigt Informationen zur installierten Windows-Version.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-193",
    "category": "Betriebssysteme",
    "topic": "Systeminformationen",
    "difficulty": "medium",
    "question": "Warum ist die genaue Windows-Buildnummer bei Supportfällen hilfreich?",
    "answers": [
      "Sie hilft, bekannte Fehler und Korrekturen einer konkreten Betriebssystemversion zuzuordnen.",
      "Sie weist nach, dass alle installierten Anwendungen fehlerfrei mit Windows zusammenarbeiten.",
      "Sie legt fest, welche Zugriffsrechte der angemeldete Benutzer auf Systemdateien besitzt.",
      "Sie identifiziert den Hersteller und die Seriennummer des verbauten Mainboards."
    ],
    "correctAnswer": 0,
    "explanation": "Bestimmte Fehler, Funktionen und Patches hängen von der genauen Version ab.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-194",
    "category": "Betriebssysteme",
    "topic": "Windows Installation",
    "difficulty": "medium",
    "question": "Was ist eine Neuinstallation von Windows?",
    "answers": [
      "Windows wird auf einem Zielsystem als neue Betriebssysteminstallation eingerichtet.",
      "Eine bestehende Windows-Installation wird auf eine neuere Version aktualisiert.",
      "Ein vorhandener Wiederherstellungspunkt setzt ausgewählte Systemeinstellungen zurück.",
      "Eine Sicherung der Benutzerdateien wird in vorhandene Benutzerprofile zurückkopiert."
    ],
    "correctAnswer": 0,
    "explanation": "Bei einer Neuinstallation wird Windows auf einer Partition neu eingerichtet.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-195",
    "category": "Betriebssysteme",
    "topic": "Windows Installation",
    "difficulty": "medium",
    "question": "Warum sollte vor einer Neuinstallation ein Backup geprüft werden?",
    "answers": [
      "Der Vorgang kann vorhandene Daten überschreiben; die benötigten Sicherungen müssen wiederherstellbar sein.",
      "Der Installer prüft anhand des Backups, ob alle installierten Anwendungen weiterhin kompatibel sind.",
      "Ein vorhandenes Backup verhindert Änderungen an den Partitionen während der Installation.",
      "Ein geprüftes Backup stellt sämtliche Benutzerdateien nach der Installation ohne Rücksicherung bereit."
    ],
    "correctAnswer": 0,
    "explanation": "Neuinstallation oder Partitionierung kann bestehende Daten überschreiben.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-196",
    "category": "Betriebssysteme",
    "topic": "Windows Installation",
    "difficulty": "medium",
    "question": "Welches USB-Medium eignet sich typischerweise zum Start einer Windows-Neuinstallation auf einem kompatiblen PC?",
    "answers": [
      "Ein für den Start vorbereiteter USB-Stick mit den passenden Windows-Installationsdateien.",
      "Ein USB-Stick, auf dem lediglich eine Verknüpfung zur Windows-Downloadseite liegt.",
      "Ein USB-Stick, der die persönlichen Dateien des bisherigen Benutzerprofils enthält.",
      "Ein USB-Stick, auf den der vorhandene Windows-Ordner ohne weitere Vorbereitung kopiert wurde."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Installationsmedium muss passende Startstrukturen und Installationsdateien enthalten. Eine Verknüpfung, ein Benutzerdatei-Backup oder eine gewöhnliche Kopie des Windows-Ordners macht einen USB-Stick nicht zu einem Installationsmedium.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-197",
    "category": "Betriebssysteme",
    "topic": "Windows Installation",
    "difficulty": "medium",
    "question": "Ein Rechner soll einmalig von einem Installations-USB-Stick starten und danach wieder regulär von der internen SSD. Welche Firmwarefunktion ist dafür besonders geeignet?",
    "answers": [
      "Das einmalige Bootmenü zur Auswahl des USB-Sticks.",
      "Eine dauerhafte Deaktivierung der internen SSD in der Firmware.",
      "Das Löschen des Boot-Eintrags des installierten Betriebssystems.",
      "Das Zurücksetzen sämtlicher Firmwareeinstellungen auf Werkseinstellungen."
    ],
    "correctAnswer": 0,
    "explanation": "Ein einmaliges Bootmenü erlaubt die Auswahl eines Startmediums für diesen Startvorgang. Damit muss die dauerhafte Bootreihenfolge nicht geändert werden; die konkrete Taste hängt vom Gerät ab.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-198",
    "category": "Betriebssysteme",
    "topic": "Windows Installation",
    "difficulty": "medium",
    "question": "Welche Prüfung ist vor der betrieblichen Übergabe eines frisch installierten Windows-Rechners besonders geeignet, seine technische Einsatzbereitschaft zu beurteilen?",
    "answers": [
      "Gerätefunktion, Patchstand, Aktivierungsstatus und benötigte Anwendungen prüfen.",
      "Die erfolgreiche Anmeldung und das Vorhandensein der erwarteten Desktopverknüpfungen als Abnahme verwenden.",
      "Die Liste der sichtbaren Laufwerke als Nachweis einer vollständigen Treiberinstallation verwenden.",
      "Die aktuelle Windows-Versionsbezeichnung als Nachweis einer vollständigen Anwendungsausstattung verwenden."
    ],
    "correctAnswer": 0,
    "explanation": "Eine abgeschlossene Installation belegt noch nicht die betriebliche Einsatzbereitschaft. Funktionsprüfung, passende Treiber, vorgesehene Updates, Aktivierungsstatus und benötigte Anwendungen gehören zur technischen Abnahme.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-199",
    "category": "Betriebssysteme",
    "topic": "Lizenzierung",
    "difficulty": "medium",
    "question": "Welche Aufgabe hat die technische Windows-Aktivierung?",
    "answers": [
      "Prüfen, ob für die Windows-Installation eine passende technische Aktivierungsberechtigung vorliegt.",
      "Die Installation automatisch als vollständigen Nachweis aller vertraglichen Nutzungsrechte zertifizieren.",
      "Die Benutzeridentität für den Zugriff auf sämtliche Unternehmensanwendungen bestätigen.",
      "Die installierten Treiber auf vollständige Kompatibilität mit der Hardware prüfen."
    ],
    "correctAnswer": 0,
    "explanation": "Windows kann anhand eines Product Keys oder einer digitalen Lizenz aktiviert werden. Die Aktivierung hilft, die Installation einer entsprechenden Berechtigung zuzuordnen; sie ersetzt nicht die betriebliche Dokumentation der erworbenen Nutzungsrechte.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-200",
    "category": "Betriebssysteme",
    "topic": "Lizenzierung",
    "difficulty": "medium",
    "question": "Warum ist Lizenzmanagement in Unternehmen wichtig?",
    "answers": [
      "Es gleicht eingesetzte Software mit vorhandenen Nutzungsrechten und dem künftigen Bedarf ab.",
      "Es gleicht Benutzerkennwörter zwischen allen installierten Anwendungen automatisch ab.",
      "Es ersetzt die Prüfung, welche Sicherheitsupdates auf den Geräten installiert sind.",
      "Es weist jeder aktivierten Installation unabhängig vom Vertrag zusätzliche Nutzungsrechte zu."
    ],
    "correctAnswer": 0,
    "explanation": "Lizenzmanagement dokumentiert eingesetzte Produkte, vorhandene Nutzungsrechte und relevante Zuordnungen. Das unterstützt nachvollziehbare Beschaffung und Nutzung; technische Aktivierung und vertragliche Berechtigung sind dabei zu unterscheiden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "hardware-001",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein DDR4-PC soll mit zwei identischen RAM-Modulen im Dual-Channel-Modus betrieben werden. Welche Bestückungsregel ist maßgeblich?",
    "answers": [
      "Die Module nach Handbuch auf beide Speicherkanäle verteilen",
      "Die Module innerhalb desselben Speicherkanals zusammenfassen",
      "Die räumlich benachbarten Slots ohne Prüfung ihrer Kanalzuordnung wählen",
      "Die Slots anhand ihrer kürzesten Entfernung zur CPU auswählen"
    ],
    "correctAnswer": 0,
    "explanation": "Dual Channel erfordert die passende Belegung beider Speicherkanäle. Welche Steckplätze dafür vorgesehen sind, beschreibt das Mainboard-Handbuch; räumliche Nähe allein ist kein Kriterium.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-002",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Vorhandene DDR4-UDIMMs sollen in einem Desktop-Mainboard weiterverwendet werden, das ausschließlich DDR5 unterstützt. Welche Aussage ist richtig?",
    "answers": [
      "Ein niedrigerer eingestellter Speichertakt ermöglicht den Einbau",
      "Die Module sind mit den DDR5-Steckplätzen nicht kompatibel",
      "Ein aktueller DDR5-Treiber stellt die elektrische Kompatibilität her",
      "Eine gleiche Kontaktzahl macht die Module austauschbar"
    ],
    "correctAnswer": 1,
    "explanation": "DDR4 und DDR5 unterscheiden sich mechanisch und elektrisch. Weder niedrigere Taktraten noch ein Treiber machen DDR4-UDIMMs zu passenden DDR5-Modulen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-003",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Arbeitsplatz benötigt eine sehr schnelle SSD für Betriebssystem und große Projektdateien. Welche Schnittstelle bietet typischerweise die höchste Übertragungsrate?",
    "answers": [
      "SATA III",
      "USB 2.0",
      "NVMe über PCIe",
      "SATA II"
    ],
    "correctAnswer": 2,
    "explanation": "NVMe-SSDs kommunizieren über PCIe und erreichen typischerweise deutlich höhere Übertragungsraten als SATA-SSDs.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-004",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Zwei Festplatten mit jeweils 4 TB werden als RAID 1 verwendet. Wie groß ist die nutzbare Speicherkapazität?",
    "answers": [
      "2 TB",
      "4 TB",
      "8 TB",
      "16 TB"
    ],
    "correctAnswer": 1,
    "explanation": "Bei RAID 1 werden die Daten gespiegelt. Zwei 4-TB-Laufwerke stellen deshalb insgesamt 4 TB nutzbare Kapazität bereit.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-005",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum wird ECC-Arbeitsspeicher besonders häufig in Servern eingesetzt?",
    "answers": [
      "Er verschlüsselt die Daten zwischen CPU und RAM",
      "Er erkennt und korrigiert bestimmte Speicherfehler",
      "Er hält den RAM-Inhalt bei Stromausfall ohne Versorgung",
      "Er verteilt Speicherzugriffe auf zusätzliche Kanäle"
    ],
    "correctAnswer": 1,
    "explanation": "ECC-Speicher kann bestimmte Bitfehler erkennen und korrigieren und erhöht dadurch die Zuverlässigkeit des Systems.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-006",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine PCIe-4.0-x16-Grafikkarte wird in einem elektrisch mit x16 angebundenen PCIe-5.0-Slot betrieben. Welche höchste Link-Konfiguration ist bei störungsfreiem Betrieb zu erwarten?",
    "answers": [
      "PCIe 5.0 x16",
      "PCIe 4.0 x16",
      "PCIe 4.0 x8",
      "PCIe 3.0 x16"
    ],
    "correctAnswer": 1,
    "explanation": "Karte und Steckplatz handeln eine gemeinsam unterstützte Generation und Lane-Anzahl aus. Hier begrenzt die Karte die Generation auf PCIe 4.0.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-007",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein PC schaltet unter CPU-Last ab; kurz zuvor erreicht die CPU ihre Temperaturgrenze. Welche Prüfung passt am unmittelbarsten zu diesem Befund?",
    "answers": [
      "Kühlersitz, Lüfterfunktion und Wärmeübergang prüfen",
      "RAM-Timings und Speichertakt auf Stabilität prüfen",
      "Netzteilanschlüsse und Versorgungsspannungen prüfen",
      "SSD-Zustand und Fehlerprotokoll des Laufwerks prüfen"
    ],
    "correctAnswer": 0,
    "explanation": "Bei nachgewiesener Überhitzung ist zuerst die Wärmeabfuhr zu prüfen. Andere Hardwarefehler können ebenfalls Abstürze verursachen, erklären den Temperaturbefund aber nicht unmittelbar.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-008",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum sollte ein Netzteil nicht ausschließlich nach der typischen Leistungsaufnahme eines PCs dimensioniert werden?",
    "answers": [
      "Die typische Aufnahme entspricht bereits der nötigen Dauerleistung",
      "Lastspitzen und geplante Erweiterungen benötigen zusätzlichen Spielraum",
      "Die CPU-TDP deckt den Leistungsbedarf des gesamten PCs ab",
      "Die Effizienzklasse gibt die verfügbare Leistungsreserve vor"
    ],
    "correctAnswer": 1,
    "explanation": "Bei der Dimensionierung müssen die gesamte Hardware, mögliche Lastspitzen und eine angemessene Leistungsreserve berücksichtigt werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-009",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine CPU besitzt acht physische Kerne und stellt mit aktiviertem SMT insgesamt 16 logische Prozessoren bereit. Welche Aussage trifft zu?",
    "answers": [
      "Jeder logische Prozessor besitzt eigene vollständige Ausführungseinheiten.",
      "Die beiden logischen Prozessoren eines Kerns müssen denselben Programmcode ausführen.",
      "Je zwei logische Prozessoren teilen sich Ressourcen eines Kerns",
      "Bei aktivem SMT verdoppelt sich die Taktfrequenz jedes physischen Kerns."
    ],
    "correctAnswer": 2,
    "explanation": "Bei zwei SMT-Kontexten pro Kern erscheinen acht physische Kerne als 16 logische Prozessoren. Ressourcen eines Kerns werden geteilt; die Anwendungsleistung verdoppelt sich dadurch nicht automatisch.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-010",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Benutzer benötigt mehr Arbeitsspeicher. Im PC sind bereits zwei Module mit jeweils 8 GB installiert. Wie viel RAM steht insgesamt zur Verfügung?",
    "answers": [
      "8 GB",
      "16 GB",
      "32 GB",
      "64 GB"
    ],
    "correctAnswer": 1,
    "explanation": "Zwei Module mit jeweils 8 GB ergeben zusammen 16 GB Arbeitsspeicher.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-011",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat der Cache eines Prozessors hauptsächlich?",
    "answers": [
      "Häufig benötigte Daten und Befehle mit geringer Zugriffszeit bereitstellen",
      "Den virtuellen Adressraum auf dem Massenspeicher vergrößern",
      "Programmbefehle vor der Ausführung in Maschinencode übersetzen",
      "Speicherzugriffe durch zusätzliche externe RAM-Kanäle beschleunigen"
    ],
    "correctAnswer": 0,
    "explanation": "Der CPU-Cache ist ein sehr schneller Speicher für häufig benötigte Daten und Befehle und reduziert dadurch Zugriffe auf den langsameren Arbeitsspeicher.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-012",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein PC verliert nach dem vollständigen Trennen vom Strom regelmäßig Datum und Uhrzeit. Welche Komponente sollte zuerst überprüft werden?",
    "answers": [
      "Die CMOS-/RTC-Batterie des Mainboards",
      "Der CPU-Kühler",
      "Das SATA-Datenkabel",
      "Der Arbeitsspeicher"
    ],
    "correctAnswer": 0,
    "explanation": "Die Mainboard-Batterie versorgt unter anderem die Echtzeituhr, wenn der Rechner vom Stromnetz getrennt ist. Eine schwache Batterie kann zum Verlust von Datum und Uhrzeit führen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-013",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Eigenschaften legt der Formfaktor eines Mainboards insbesondere fest?",
    "answers": [
      "Abmessungen und Befestigungspunkte der Hauptplatine",
      "Unterstützte CPU-Sockel und Prozessorfamilien",
      "Zulässige Speichergenerationen und RAM-Taktraten",
      "Unterstützte PCIe-Generationen und Lane-Anzahlen"
    ],
    "correctAnswer": 0,
    "explanation": "Formfaktoren wie ATX oder Micro-ATX definieren unter anderem Größe, Befestigungspunkte und grundlegende mechanische Eigenschaften eines Mainboards.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-014",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine SSD befindet sich in einem M.2-Steckplatz. Welche Aussage ist daraus allein noch NICHT ableitbar?",
    "answers": [
      "Ob die SSD SATA oder PCIe/NVMe verwendet",
      "Dass das Laufwerk die Bauform M.2 verwendet",
      "Dass es direkt auf dem Mainboard montiert sein kann",
      "Dass kein klassisches 3,5-Zoll-Gehäuse erforderlich ist"
    ],
    "correctAnswer": 0,
    "explanation": "M.2 beschreibt zunächst eine Bauform bzw. Schnittstellenform. M.2-SSDs können je nach Gerät beispielsweise SATA oder PCIe/NVMe verwenden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-015",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Wozu dienen S.M.A.R.T.-Daten bei HDDs und SSDs?",
    "answers": [
      "Zustands- und Fehlerindikatoren eines Laufwerks bereitstellen",
      "Ungenutzte Flash-Blöcke zur Wiederverwendung freigeben",
      "Dateisystemfehler in Verzeichniseinträgen reparieren",
      "Eine zweite aktuelle Kopie aller Nutzdaten anlegen"
    ],
    "correctAnswer": 0,
    "explanation": "S.M.A.R.T. stellt Zustands- und Diagnosewerte eines Laufwerks bereit. Auffällige Werte können Hinweise auf mögliche Probleme liefern.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-016",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Prozessor reduziert bei sehr hoher Temperatur automatisch seine Taktfrequenz. Wie wird dieses Verhalten bezeichnet?",
    "answers": [
      "Thermal Throttling",
      "Dual-Channel",
      "Hot Swapping",
      "Overprovisioning"
    ],
    "correctAnswer": 0,
    "explanation": "Beim Thermal Throttling reduziert ein Prozessor seine Leistung beziehungsweise Taktfrequenz, um eine zu hohe Temperatur zu begrenzen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-017",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Komponente versorgt das Mainboard typischerweise über einen 24-poligen ATX-Stecker mit Strom?",
    "answers": [
      "Das Netzteil",
      "Die Grafikkarte",
      "Die SSD",
      "Der CPU-Kühler"
    ],
    "correctAnswer": 0,
    "explanation": "Der 24-polige ATX-Hauptstromanschluss verbindet das Netzteil mit dem Mainboard und versorgt es mit den benötigten Versorgungsspannungen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-018",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Unternehmen benötigt für einen Archiv-PC viel Speicherplatz zu möglichst niedrigen Kosten pro Terabyte. Sehr hohe Zugriffsgeschwindigkeit ist nicht erforderlich. Welche Lösung ist typischerweise geeignet?",
    "answers": [
      "Eine große HDD",
      "Eine kleine NVMe-SSD",
      "Mehr CPU-Cache",
      "Zusätzlicher Arbeitsspeicher"
    ],
    "correctAnswer": 0,
    "explanation": "HDDs bieten typischerweise viel Speicherkapazität zu niedrigeren Kosten pro Terabyte als SSDs und eignen sich daher für große Datenmengen ohne hohe Geschwindigkeitsanforderungen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-019",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aussage beschreibt eine typische integrierte GPU im Vergleich zu einer dedizierten Desktop-Grafikkarte?",
    "answers": [
      "Sie ist in den Prozessor integriert und nutzt häufig einen Teil des Systemspeichers.",
      "Sie befindet sich auf einer separaten Erweiterungskarte und benötigt einen eigenen PCIe-Steckplatz.",
      "Sie besitzt grundsätzlich einen vom Systemspeicher getrennten VRAM auf einer eigenen Grafikkarte.",
      "Sie übernimmt nur die Bildausgabe; Grafikberechnungen führt bei ihr ausschließlich die CPU aus."
    ],
    "correctAnswer": 0,
    "explanation": "Eine integrierte GPU ist bei heutigen Desktop-Systemen häufig Teil des Prozessors und nutzt Systemspeicher. Eine dedizierte Grafikkarte besitzt eine separate GPU und typischerweise eigenen VRAM; auch integrierte GPUs führen Grafikberechnungen aus.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-020",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Zwei Notebooks besitzen jeweils eine USB-C-Buchse. Welche Aussage lässt sich aus der identischen Buchsenform ableiten?",
    "answers": [
      "Die tatsächlich unterstützten Datenraten müssen separat geprüft werden",
      "Beide Buchsen unterstützen dieselbe maximale Datenrate",
      "Beide Buchsen unterstützen die Bildausgabe per DisplayPort",
      "Beide Buchsen unterstützen dieselbe maximale Ladeleistung"
    ],
    "correctAnswer": 0,
    "explanation": "USB-C bezeichnet die Steckverbindung. Datenrate, Videoausgabe und Ladefunktionen ergeben sich aus der jeweiligen Implementierung.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-021",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Desktop-PC besitzt eine integrierte GPU und eine separate Grafikkarte. Der Monitor soll sein Videosignal unmittelbar von der separaten Grafikkarte erhalten. Welcher Anschluss ist normalerweise zu verwenden?",
    "answers": [
      "HDMI am Anschlussfeld des Mainboards",
      "HDMI an der separaten Grafikkarte",
      "DisplayPort am Anschlussfeld des Mainboards",
      "DVI am Anschlussfeld des Mainboards"
    ],
    "correctAnswer": 1,
    "explanation": "Für eine direkte Verbindung zur separaten Grafikkarte wird deren Videoausgang verwendet. Mainboard-Ausgänge gehören üblicherweise zur integrierten Grafik.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-022",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine CPU soll auf einem vorhandenen Mainboard eingesetzt werden. Welche Prüfung bestätigt die Unterstützung am zuverlässigsten?",
    "answers": [
      "CPU-Supportliste und erforderliche BIOS-/UEFI-Version prüfen",
      "Die Übereinstimmung der Sockelbezeichnung als Freigabe verwenden",
      "Die gleiche Leistungsaufnahme wie bei der bisherigen CPU als Freigabe verwenden",
      "Die Unterstützung derselben RAM-Generation als ausreichenden Nachweis verwenden"
    ],
    "correctAnswer": 0,
    "explanation": "Ein passender Sockel ist notwendig, aber nicht ausreichend. Die CPU-Supportliste des Mainboardherstellers nennt unterstützte Modelle und gegebenenfalls die erforderliche Firmwareversion.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-023",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Rechner soll kurze Stromausfälle überbrücken und bei einem längeren Ausfall kontrolliert heruntergefahren werden können. Welche Komponente eignet sich dafür?",
    "answers": [
      "Eine Steckdosenleiste mit Überspannungsschutz",
      "Eine ausreichend dimensionierte USV",
      "Ein PC-Netzteil mit höherer Nennleistung",
      "Ein Spannungsstabilisator ohne Energiespeicher"
    ],
    "correctAnswer": 1,
    "explanation": "Eine unterbrechungsfreie Stromversorgung kann einen Rechner bei einem Stromausfall für begrenzte Zeit weiter versorgen und ein kontrolliertes Herunterfahren ermöglichen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-024",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Vier Festplatten mit jeweils 2 TB werden in einem RAID 5 zusammengefasst. Welche nutzbare Kapazität steht typischerweise zur Verfügung?",
    "answers": [
      "2 TB",
      "4 TB",
      "8 TB",
      "6 TB"
    ],
    "correctAnswer": 3,
    "explanation": "Bei RAID 5 entspricht die nutzbare Kapazität bei gleich großen Laufwerken der Kapazität von n−1 Laufwerken. Bei vier Laufwerken mit je 2 TB ergeben sich daher 6 TB.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-025",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Eigenschaft besitzt RAID 5 zusätzlich zur Verteilung der Daten auf mehrere Laufwerke?",
    "answers": [
      "Vollständige Spiegelkopien auf jeweils zwei Laufwerken",
      "Zwei unabhängige Paritätsinformationen pro Stripe",
      "Verteilte Parität zur Rekonstruktion bei einem Laufwerksausfall",
      "Striping über alle Laufwerke ohne zusätzliche Redundanz"
    ],
    "correctAnswer": 2,
    "explanation": "RAID 5 verteilt Daten und Paritätsinformationen über mehrere Laufwerke. Dadurch kann der Verbund typischerweise den Ausfall eines einzelnen Laufwerks verkraften.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-026",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Netzteil liefert dem PC unter einer bestimmten Last 400 W Ausgangsleistung. Was bedeutet ein höherer Wirkungsgrad des Netzteils?",
    "answers": [
      "Für dieselbe Ausgangsleistung wird weniger Leistung aus dem Stromnetz aufgenommen",
      "Für dieselbe Ausgangsleistung wird mehr Leistung aus dem Stromnetz aufgenommen",
      "Die Leistungsaufnahme bleibt gleich, aber die Nennleistung steigt",
      "Die Nennleistung sinkt im gleichen Verhältnis wie die Verlustleistung"
    ],
    "correctAnswer": 0,
    "explanation": "Ein höherer Wirkungsgrad bedeutet geringere Umwandlungsverluste. Für dieselbe nutzbare Ausgangsleistung muss daher weniger Leistung aus dem Stromnetz aufgenommen werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-027",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine Netzwerkkarte unterstützt 100 Mbit/s, 1 Gbit/s und 2,5 Gbit/s. Der Switch-Port unterstützt 100 Mbit/s und 1 Gbit/s. Welche höchste Link-Geschwindigkeit handeln beide bei geeigneter Verkabelung aus?",
    "answers": [
      "100 Mbit/s",
      "1,75 Gbit/s",
      "1 Gbit/s",
      "2,5 Gbit/s"
    ],
    "correctAnswer": 2,
    "explanation": "Bei automatischer Aushandlung wird hier die höchste von beiden Seiten unterstützte Geschwindigkeit gewählt: 1 Gbit/s.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-028",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe übernimmt UEFI beziehungsweise die System-Firmware beim Start eines PCs?",
    "answers": [
      "Sie lädt nach dem Kernelstart die Benutzerprofile",
      "Sie initialisiert Hardware und startet den ausgewählten Bootloader",
      "Sie verteilt nach der Anmeldung CPU-Zeit an Anwendungen",
      "Sie verwaltet im laufenden Betrieb die Zugriffsrechte auf Dateien"
    ],
    "correctAnswer": 1,
    "explanation": "UEFI initialisiert und konfiguriert grundlegende Hardware beim Systemstart und startet anschließend den Bootloader beziehungsweise übergibt an den weiteren Bootvorgang.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-029",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein M.2-Slot ist mechanisch passend, führt laut Handbuch aber keine PCIe-Lanes, sondern nur SATA-Signale. Kann eine reine PCIe-NVMe-SSD dort betrieben werden?",
    "answers": [
      "Ja, mit auf SATA begrenzter Datenrate",
      "Ja, nach einer Formatierung als GPT-Datenträger",
      "Nein, dem Slot fehlt die erforderliche PCIe-Anbindung",
      "Ja, nach Auswahl eines NVMe-Treibers im Betriebssystem"
    ],
    "correctAnswer": 2,
    "explanation": "Eine mechanisch passende Verbindung reicht nicht aus. Die SSD benötigt PCIe-Signale; Formatierung oder Treiber können eine fehlende elektrische Anbindung nicht ersetzen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-030",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Server soll mit vier identischen Festplatten betrieben werden. Gefordert sind Ausfallsicherheit bei Ausfall einer einzelnen Platte und gleichzeitig möglichst viel nutzbare Kapazität. Welche RAID-Stufe ist unter diesen Bedingungen am sinnvollsten?",
    "answers": [
      "RAID 0",
      "RAID 1",
      "RAID 5",
      "RAID 10"
    ],
    "correctAnswer": 2,
    "explanation": "RAID 5 verteilt Daten und Parität über alle Laufwerke. Bei vier Platten bleibt die Kapazität von drei Laufwerken nutzbar und der Ausfall einer einzelnen Platte kann toleriert werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-031",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine Grafikkarte besitzt einen mechanischen x16-Anschluss, ist aber elektrisch mit PCIe 4.0 x8 angebunden. Der Slot unterstützt PCIe 4.0 x16. Welche höchste Link-Konfiguration ist zu erwarten?",
    "answers": [
      "PCIe 4.0 x16",
      "PCIe 4.0 x8",
      "PCIe 3.0 x16",
      "PCIe 3.0 x8"
    ],
    "correctAnswer": 1,
    "explanation": "Die Karte begrenzt die Verbindung auf acht Lanes. Die mechanische Länge des Anschlusses erzeugt keine zusätzlichen elektrischen Lanes.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-032",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Das Handbuch eines Mainboards nennt: Bei einer PCIe-SSD in M.2_2 sind SATA_5 und SATA_6 deaktiviert. Eine SATA-Festplatte hängt an SATA_5 und wird nach dem SSD-Einbau nicht mehr erkannt. SATA_1 ist frei und bleibt aktiv. Welche Änderung ermöglicht die Nutzung beider Laufwerke?",
    "answers": [
      "Die SATA-Festplatte an SATA_1 anschließen.",
      "Die SATA-Festplatte an SATA_6 anschließen.",
      "Für SATA_5 eine niedrigere Übertragungsrate einstellen.",
      "Die Bootpriorität der SATA-Festplatte erhöhen."
    ],
    "correctAnswer": 0,
    "explanation": "M.2_2 und SATA_5/SATA_6 können laut Handbuch nicht gleichzeitig genutzt werden. SATA_1 bleibt verfügbar; ein Portwechsel beseitigt diesen Anschlusskonflikt, eine geänderte Geschwindigkeit oder Bootpriorität nicht.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-033",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Windows-Rechner besitzt 32 GB RAM und eine ausreichend große Auslagerungsdatei. Es sind 20 GB physischer RAM belegt, während 38 GB zugesicherter Speicher angezeigt werden. Welche Aussage ist richtig?",
    "answers": [
      "Zugesicherter Speicher kann durch RAM und Auslagerungsdatei abgesichert sein",
      "Die 38 GB müssen vollständig gleichzeitig im physischen RAM liegen",
      "Die Differenz von 18 GB ist genau die aktuelle Belegung der Auslagerungsdatei",
      "Die Differenz von 6 GB entspricht genau dem Speicher der Grafikkarte"
    ],
    "correctAnswer": 0,
    "explanation": "Commit und physische RAM-Belegung messen unterschiedliche Größen. Die Auslagerungsdatei erweitert das Commit-Limit; aus der Differenz dieser Anzeigen lässt sich ihre tatsächliche Belegung nicht direkt berechnen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-034",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine Workstation besitzt ein Netzteil mit 850 W Nennleistung und 80-PLUS-Zertifizierung. Welche Aussage zur 850-W-Angabe ist korrekt?",
    "answers": [
      "Die spezifizierte maximale Ausgangsleistung unter den vorgesehenen Betriebsbedingungen",
      "Die spezifizierte Leistungsaufnahme aus dem Stromnetz bei jeder CPU-Auslastung",
      "Die an der Steckdose gemessene Spitzenleistung einschließlich Umwandlungsverlusten",
      "Die Verlustleistung bei Erreichen der höchsten Effizienzklasse"
    ],
    "correctAnswer": 0,
    "explanation": "Die Nennleistung gibt die spezifizierte maximale Ausgangsleistung unter den vorgesehenen Bedingungen an. Bei einer gegebenen Last nimmt das Netzteil wegen seiner Verluste mehr Leistung aus dem Stromnetz auf, als es an die Komponenten abgibt.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-035",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Hauptaufgabe hat die CPU?",
    "answers": [
      "Maschinenbefehle ausführen und Rechen- sowie Steueroperationen bearbeiten",
      "Aktuell verwendete Programme und Daten als Arbeitsspeicher bereitstellen.",
      "Grafikdaten für die Bildausgabe mit spezialisierten parallelen Recheneinheiten verarbeiten.",
      "Programmdateien und Benutzerdaten dauerhaft auf einem Massenspeicher ablegen."
    ],
    "correctAnswer": 0,
    "explanation": "Die CPU führt Maschinenbefehle aus und koordiniert zentrale Rechen- und Steuerungsaufgaben.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-036",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Eigenschaft beschreibt RAM am besten?",
    "answers": [
      "Flüchtiger Speicher für aktuell verwendete Programme und Daten",
      "Nichtflüchtiger Flash-Speicher für installierte Programme und Dateien",
      "Nichtflüchtiger Speicher für grundlegenden Firmwarecode",
      "Magnetischer Speicher für große dauerhaft abgelegte Datenmengen"
    ],
    "correctAnswer": 0,
    "explanation": "RAM ist flüchtig: Ohne Strom geht sein Inhalt normalerweise verloren.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-037",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein PC wird durch häufiges Auslagern aktiver Programmdaten auf die SSD gebremst. Was kann eine passende RAM-Erweiterung bewirken?",
    "answers": [
      "Mehr benötigte Daten bleiben im RAM, sodass weniger ausgelagert werden muss",
      "Die vorhandene SSD bietet danach mehr physische Flash-Kapazität für Auslagerungsdaten",
      "Die Zugriffszeit bereits im RAM liegender Daten sinkt allein durch die größere Kapazität",
      "Die Erweiterung erhöht automatisch den Takt aller vorhandenen Speichermodule"
    ],
    "correctAnswer": 0,
    "explanation": "Zusätzlicher RAM kann den beschriebenen Speicherdruck verringern. Er verändert weder die SSD-Schnittstelle noch die physische Ausstattung der CPU.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-038",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bedeutet Dual Channel bei Arbeitsspeicher?",
    "answers": [
      "Zwei Speicherkanäle übertragen parallel und können die Bandbreite erhöhen",
      "Zwei Module bilden Spiegelkopien zur Korrektur von Speicherfehlern",
      "Zwei Speicherkanäle halbieren die Zugriffszeit jeder einzelnen Speicherzelle",
      "Zwei Speicherkanäle verdoppeln die Kapazität jedes einzelnen Moduls"
    ],
    "correctAnswer": 0,
    "explanation": "Dual Channel erhöht potenziell die Speicherbandbreite durch parallele Nutzung zweier Kanäle.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-039",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Informationen stellt das SPD eines RAM-Moduls der Plattform unter anderem zur Verfügung?",
    "answers": [
      "Kenndaten des Moduls und unterstützte Speicherparameter",
      "Die Zuordnung virtueller Adressen zu physischen RAM-Seiten",
      "Die zuletzt im Modul gespeicherten Benutzerdokumente",
      "Die Prüfsummen sämtlicher laufenden Programme"
    ],
    "correctAnswer": 0,
    "explanation": "Serial Presence Detect stellt Moduldaten bereit, die die Firmware zur Speicherkonfiguration verwenden kann. Es speichert nicht den laufenden Inhalt des Arbeitsspeichers.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-040",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat ein Netzteil im PC?",
    "answers": [
      "Wechselspannung aus dem Stromnetz in geeignete Gleichspannungen umwandeln",
      "Gleichspannung aus dem Stromnetz in mehrere Wechselspannungen umwandeln",
      "Die Netzwechselspannung mit unveränderter Spannung im PC verteilen",
      "Die niedrigen Spannungen der Komponenten auf Netzspannung anheben"
    ],
    "correctAnswer": 0,
    "explanation": "Das PC-Netzteil versorgt Komponenten mit den benötigten Gleichspannungen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-041",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Beim Netzteiltausch sollen vorhandene modulare Kabel weiterverwendet werden. Welche Prüfung ist erforderlich?",
    "answers": [
      "Die Freigabe der Kabel für das konkrete Netzteilmodell prüfen",
      "Die gleiche Steckerform auf der Netzteilseite als Kompatibilitätsnachweis verwenden",
      "Die gleiche 80-PLUS-Stufe beider Netzteile als Freigabe verwenden",
      "Die gleiche Nennleistung beider Netzteile als Freigabe verwenden"
    ],
    "correctAnswer": 0,
    "explanation": "Die Belegung modularer Netzteilanschlüsse ist nicht universell einheitlich. Nur ausdrücklich kompatible Kabel dürfen übernommen werden; falsche Belegung kann Komponenten beschädigen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-042",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Die Komponenten eines PCs benötigen zusammen 500 W Ausgangsleistung vom Netzteil. Für die Planung werden 20 % auf diesen Wert aufgeschlagen. Welche Nennleistung ergibt die Rechnung?",
    "answers": [
      "600 W",
      "520 W",
      "625 W",
      "1000 W"
    ],
    "correctAnswer": 0,
    "explanation": "Der Aufschlag beträgt 0,20 × 500 W = 100 W; zusammen sind es 600 W. Das ist eine Planungsrechnung, keine vollständige Prüfung von Lastspitzen und Anschlüssen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-043",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine SSD bietet hohe sequenzielle Transferraten, soll aber viele kleine, zufällig verteilte Dateien bedienen. Welche Messwerte sind dafür besonders aussagekräftig?",
    "answers": [
      "Latenz und IOPS bei kleinen zufälligen Zugriffen",
      "Maximale Transferrate bei großen sequenziellen Dateien",
      "Nennkapazität und Größe des Laufwerksgehäuses",
      "Datenrate des Anschlusses ohne Messung des Laufwerks"
    ],
    "correctAnswer": 0,
    "explanation": "Bei kleinen zufälligen Zugriffen sind Antwortzeit und I/O-Operationen pro Sekunde unter passender Last wichtig. Eine hohe sequenzielle Datenrate allein beschreibt diese Leistung nicht.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-044",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aussage beschreibt die übliche Anbindung interner SATA- und NVMe-SSDs in einem PC?",
    "answers": [
      "NVMe-SSDs verwenden PCIe; SATA-SSDs verwenden SATA.",
      "NVMe-SSDs verwenden SATA; SATA-SSDs verwenden PCIe.",
      "Beide verwenden SATA und unterscheiden sich lediglich durch ihre Firmware.",
      "Beide verwenden PCIe und unterscheiden sich lediglich durch ihre Gehäuseform."
    ],
    "correctAnswer": 0,
    "explanation": "Bei internen PC-SSDs arbeitet NVMe über PCIe. SATA-SSDs nutzen eine SATA-Verbindung, häufig mit AHCI. Beide können Daten nichtflüchtig in Flash-Speicher ablegen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-045",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bedeutet bei einem M.2-Modul die Größenangabe 2280?",
    "answers": [
      "22 mm Breite und 80 mm Länge",
      "22 mm Länge und 80 mm Breite",
      "22 mm Breite und 8,0 mm Länge",
      "2,2 mm Breite und 80 mm Länge"
    ],
    "correctAnswer": 0,
    "explanation": "Die Baugrößenangabe 2280 steht für 22 mm Breite und 80 mm Länge. Sie legt weder Speicherkapazität noch Übertragungsprotokoll fest.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-046",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Eine M.2-PCIe-4.0-x4-SSD wird in einem kompatiblen M.2-PCIe-3.0-x2-Slot betrieben. Welche Anbindung ist maximal möglich?",
    "answers": [
      "PCIe 3.0 x2",
      "PCIe 3.0 x4",
      "PCIe 4.0 x2",
      "PCIe 4.0 x4"
    ],
    "correctAnswer": 0,
    "explanation": "Die gemeinsam unterstützte Generation und Lane-Anzahl begrenzen den Link auf PCIe 3.0 x2. Bauform und nominelle Fähigkeiten der SSD allein bestimmen die Verbindung nicht.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-047",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein PC erreicht nach dem Einschalten keinen Bootloader. Die DRAM-Diagnose-LED bleibt laut Handbuch dauerhaft an. Welcher Bereich sollte zuerst geprüft werden?",
    "answers": [
      "RAM-Bestückung und Speicherinitialisierung",
      "CPU-Stromversorgung und Prozessorinitialisierung",
      "Grafikkartensitz und Grafikinitialisierung",
      "Erkennung des Systemlaufwerks und Bootauswahl"
    ],
    "correctAnswer": 0,
    "explanation": "Die herstellerspezifische DRAM-Anzeige weist hier auf die Speicherinitialisierung hin. Bedeutung und Prüfschritte sind dem Mainboard-Handbuch zu entnehmen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-048",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist Secure Boot?",
    "answers": [
      "UEFI prüft Boot-Komponenten anhand seiner Signatur- und Vertrauensrichtlinien",
      "UEFI verschlüsselt die Nutzdaten des Systemlaufwerks vor jedem Start",
      "UEFI vergleicht das Benutzerkennwort mit dem Kennwort des Laufwerks",
      "UEFI prüft vor dem Start die physische Unversehrtheit aller Komponenten"
    ],
    "correctAnswer": 0,
    "explanation": "Secure Boot prüft kryptografisch signierte Boot-Komponenten gegen hinterlegte Vertrauensanker.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-049",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat TPM in modernen Windows-Systemen typischerweise?",
    "answers": [
      "Kryptografische Schlüssel schützen und Plattformmessungen unterstützen",
      "Den gesamten Inhalt des Arbeitsspeichers dauerhaft verschlüsselt speichern",
      "Die Zugriffsrechte auf Benutzerdateien unabhängig vom Betriebssystem festlegen",
      "Den laufenden Netzwerkverkehr anhand von Paketregeln filtern"
    ],
    "correctAnswer": 0,
    "explanation": "Ein TPM unterstützt u. a. sichere Schlüsselablage und Funktionen wie BitLocker.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-050",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Zwei PCIe-Verbindungen nutzen dieselbe Generation und dieselbe Kodierung. Eine ist x4, die andere x8. Wie unterscheiden sich ihre theoretischen Bandbreiten pro Richtung?",
    "answers": [
      "x8 bietet die doppelte Bandbreite von x4",
      "x8 bietet dieselbe Bandbreite wie x4",
      "x8 bietet die vierfache Bandbreite von x4",
      "x8 bietet die halbe Bandbreite von x4"
    ],
    "correctAnswer": 0,
    "explanation": "Bei gleicher Generation skaliert die theoretische Bandbreite mit der Zahl der Lanes. Acht statt vier Lanes verdoppeln sie; die praktische Anwendungsleistung muss nicht im selben Verhältnis steigen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-051",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine passive Adapterkarte ohne PCIe-Switch soll vier NVMe-SSDs an einem x16-Slot betreiben. Laut Adapterhandbuch benötigt jede SSD einen eigenen x4-Link. Welche Plattformfunktion muss dafür unterstützt werden?",
    "answers": [
      "PCIe-Bifurkation des Slots in x4/x4/x4/x4",
      "PCIe-Link-Training eines einzigen durchgehenden x16-Links",
      "PCIe-Resizable-BAR zur Vergrößerung des adressierbaren Gerätebereichs",
      "PCIe-ASPM zur Anpassung der Energiesparzustände"
    ],
    "correctAnswer": 0,
    "explanation": "PCIe-Bifurkation teilt die Lanes eines Slots in mehrere unabhängige Links auf. CPU, Mainboard, Firmware und Slotkonfiguration müssen die vom Adapter benötigte Aufteilung unterstützen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-052",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist die Hauptaufgabe einer GPU?",
    "answers": [
      "Grafikoperationen und geeignete parallele Rechenaufgaben beschleunigen",
      "Den gesamten seriellen Programmablauf des Betriebssystems übernehmen",
      "Programmdateien vor jedem Start dauerhaft in Flash-Zellen ablegen",
      "Die Ausführung aller CPU-Befehle ohne Softwareanpassung beschleunigen"
    ],
    "correctAnswer": 0,
    "explanation": "GPUs sind auf viele parallele Rechenoperationen spezialisiert.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-053",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum besitzt eine dedizierte Grafikkarte eigenen VRAM?",
    "answers": [
      "Damit Texturen, Bildpuffer und Rechendaten mit hoher Bandbreite verfügbar sind",
      "Damit Texturen ohne Verwaltung durch Anwendung und Grafiktreiber bereitstehen.",
      "Damit CPU und GPU sämtliche Speicherzugriffe über denselben System-RAM-Controller ausführen.",
      "Damit sich der lokale Grafikspeicher allein durch zusätzliche System-RAM-Module erweitern lässt."
    ],
    "correctAnswer": 0,
    "explanation": "Lokaler VRAM hält unter anderem Texturen, Bildpuffer und Rechendaten nahe an der GPU bereit. Seine hohe Bandbreite unterstützt Grafik- und Rechenaufgaben; er ist kein dauerhafter Dateispeicher und wird durch mehr System-RAM nicht physisch größer.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-054",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein CPU-Kern?",
    "answers": [
      "Eine physische Verarbeitungseinheit, die einen Befehlsstrom ausführen kann.",
      "Ein logischer SMT-Kontext, der einen physischen Kern mitbenutzt",
      "Ein Cache-Bereich, der bereits berechnete Ergebnisse speichert",
      "Ein Taktzyklus, in dem ein Maschinenbefehl verarbeitet wird"
    ],
    "correctAnswer": 0,
    "explanation": "Ein CPU-Kern besitzt unter anderem Einheiten zum Dekodieren und Ausführen von Maschinenbefehlen. Mehrere Kerne können parallel arbeiten; mehrere SMT-Kontexte innerhalb eines Kerns teilen sich dagegen Ausführungsressourcen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-055",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Zwei SMT-Threads laufen auf demselben physischen CPU-Kern. Warum kann ihr gemeinsamer Durchsatz geringer sein als der von zwei vergleichbaren physischen Kernen?",
    "answers": [
      "Sie konkurrieren um gemeinsam genutzte Ausführungsressourcen",
      "Die Aktivierung zweier SMT-Kontexte halbiert grundsätzlich den Kerntakt.",
      "SMT-Kontexte müssen abwechselnd ganze Programme bis zum Ende ausführen.",
      "Jeder SMT-Kontext erhält einen eigenen vollständigen Satz von Ausführungseinheiten."
    ],
    "correctAnswer": 0,
    "explanation": "SMT-Kontexte teilen sich Ressourcen eines Kerns. Zusätzliche physische Kerne bringen weitere Ausführungsressourcen mit; der Nutzen hängt deshalb von der Arbeitslast ab.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-056",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum ist doppelte Kernzahl nicht automatisch doppelte Anwendungsleistung?",
    "answers": [
      "Serielle Programmanteile und andere Engpässe begrenzen die Skalierung",
      "Die Kernzahl bestimmt unabhängig vom Programm die gesamte Rechenzeit",
      "Die Kernzahl ersetzt den Einfluss der Speicherbandbreite auf die Laufzeit",
      "Die Kernzahl legt die Zahl ausführbarer Befehle jedes einzelnen Threads fest"
    ],
    "correctAnswer": 0,
    "explanation": "Skalierung hängt von Parallelisierbarkeit, Synchronisation, Speicherzugriff und anderen Flaschenhälsen ab.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-057",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Die CPU benötigt einen Datenblock, der nicht im L1-Datencache liegt. Was bedeutet dieser L1-Cache-Miss?",
    "answers": [
      "Der Block muss aus einer weiteren Cache-Ebene oder dem Hauptspeicher geholt werden",
      "Die CPU legt den angeforderten Wert erst bei einem späteren Schreibzugriff fest.",
      "Der Block muss direkt aus dem RAM kommen, auch wenn L2 eine gültige Kopie enthält.",
      "Das Betriebssystem muss den Block aus der Auslagerungsdatei laden, auch wenn er im RAM liegt."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Miss bedeutet zunächst nur, dass die angefragten Daten in dieser Cache-Ebene fehlen. Sie können noch in einer nachgeordneten Cache-Ebene oder im RAM vorhanden sein.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-058",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche RAID-Stufe spiegelt Daten auf zwei Laufwerke?",
    "answers": [
      "RAID 0",
      "RAID 1",
      "RAID 5",
      "JBOD"
    ],
    "correctAnswer": 1,
    "explanation": "RAID 1 speichert identische Datenkopien auf mindestens zwei Laufwerken.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-059",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Eigenschaft hat RAID 0?",
    "answers": [
      "Striping ohne Redundanz.",
      "Spiegelung mit vollständiger Redundanz.",
      "Parität mit Ausfalltoleranz für zwei Laufwerke.",
      "Verkettung ganzer Laufwerke ohne blockweises Striping."
    ],
    "correctAnswer": 0,
    "explanation": "RAID 0 verteilt Daten auf Laufwerke, bietet aber keine Redundanz.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-060",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Auf einem RAID-1-Volume wird versehentlich eine Datei gelöscht. Weshalb hilft die Spiegelung allein normalerweise nicht bei der Wiederherstellung?",
    "answers": [
      "Die Löschung wird auf beide Spiegelmitglieder angewendet",
      "Die Spiegelung hält gelöschte Dateien als ältere Version auf dem zweiten Laufwerk",
      "Das zweite Laufwerk enthält nach jeder Löschung eine unveränderte Offline-Kopie",
      "Der RAID-Controller verschiebt gelöschte Dateien in einen getrennten Archivbereich"
    ],
    "correctAnswer": 0,
    "explanation": "RAID 1 hält den aktuellen Datenbestand redundant, nicht automatisch frühere Versionen. Für versehentlich gelöschte Dateien sind beispielsweise geeignete Backups oder vorhandene Snapshots nötig.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-061",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Mindestanzahl an Laufwerken benötigt klassisches RAID 5?",
    "answers": [
      "2",
      "3",
      "4",
      "5"
    ],
    "correctAnswer": 1,
    "explanation": "RAID 5 verteilt Daten und einfache Parität über mindestens drei Laufwerke.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-062",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein klassisches RAID 5 verwendet vier Laufwerke mit 2 TB, 2 TB, 4 TB und 4 TB. Es nutzt pro Laufwerk höchstens die Kapazität des kleinsten Laufwerks. Wie viel ist ohne Verwaltungs- und Dateisystemverluste nutzbar?",
    "answers": [
      "4 TB",
      "6 TB",
      "8 TB",
      "10 TB"
    ],
    "correctAnswer": 1,
    "explanation": "Pro Laufwerk sind 2 TB anrechenbar. Bei RAID 5 steht die Kapazität von n−1 Laufwerken zur Verfügung: 3 × 2 TB = 6 TB.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-063",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Zwei USVs haben dieselbe maximale Ausgangsleistung in Watt. Was wird zusätzlich benötigt, um ihre Überbrückungszeit bei gleicher Last zu vergleichen?",
    "answers": [
      "Die Laufzeitkurven für die vorgesehene Last",
      "Die maximale Scheinleistung in VA",
      "Die geregelte Ausgangsspannung in Volt",
      "Die maximale Ausgangsleistung in Watt"
    ],
    "correctAnswer": 0,
    "explanation": "Gleiche maximale Ausgangsleistung bedeutet nicht gleiche gespeicherte Energie oder Laufzeit. Maßgeblich sind unter anderem Batterieausstattung, Zustand und lastabhängige Laufzeitdaten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-064",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum ist Kühlung für CPU und GPU wichtig?",
    "answers": [
      "Sie führt Verlustwärme ab und begrenzt dadurch die Bauteiltemperatur",
      "Sie verringert die elektrische Leistungsaufnahme direkt auf den TDP-Wert",
      "Sie verhindert Spannungsschwankungen durch eine Regelung der Stromversorgung",
      "Sie ersetzt die Temperaturüberwachung durch feste Lüfterdrehzahlen"
    ],
    "correctAnswer": 0,
    "explanation": "Kühlsysteme führen Verlustwärme ab und helfen, Komponenten innerhalb zulässiger Temperaturen zu betreiben.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-065",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat Wärmeleitpaste zwischen CPU und Kühler?",
    "answers": [
      "Mikroskopische Unebenheiten füllen und isolierende Luftspalte verringern",
      "Den Abstand zwischen CPU und Kühler möglichst groß halten",
      "Den Kühler thermisch von der CPU entkoppeln",
      "Den Anpressdruck der Kühlerbefestigung ersetzen"
    ],
    "correctAnswer": 0,
    "explanation": "Wärmeleitpaste reduziert Luftspalte zwischen Heatspreader und Kühlerboden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-066",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist TDP im Hardwarekontext grob?",
    "answers": [
      "Ein thermischer Auslegungswert nach den Vorgaben des CPU-Herstellers",
      "Eine garantierte Obergrenze jeder kurzzeitigen elektrischen Leistungsspitze",
      "Die benötigte Nennleistung des Netzteils für den vollständigen PC",
      "Die aus der Steckdose aufgenommene Leistung im Leerlauf"
    ],
    "correctAnswer": 0,
    "explanation": "TDP ist kein universell identischer Messwert für reale Spitzenaufnahme, sondern primär ein thermischer Planungswert.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-067",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein DDR5-Modul wird mit On-Die-ECC beworben. Welche Aussage zu einem vollständigen ECC-Speichersystem ist richtig?",
    "answers": [
      "On-Die-ECC im DRAM ersetzt den ECC-Schutz des Speicherpfads nicht",
      "On-Die-ECC macht die ECC-Unterstützung des Speichercontrollers überflüssig",
      "On-Die-ECC bedeutet, dass das Modul grundsätzlich ein Registered DIMM ist",
      "On-Die-ECC sichert die Datenübertragung zur CPU durch zusätzliche Busleitungen ab"
    ],
    "correctAnswer": 0,
    "explanation": "On-Die-ECC korrigiert bestimmte Fehler innerhalb des DRAM-Chips. ECC über den Speicherpfad benötigt passende Module und Unterstützung durch Speichercontroller und Plattform.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-068",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Mainboard unterstützt eine neue CPU erst ab einer neueren BIOS-Version. Die alte, unterstützte CPU ist noch eingebaut; ein Update ohne startfähige CPU wird nicht unterstützt. Welche Reihenfolge ist sinnvoll?",
    "answers": [
      "Firmware mit der alten CPU nach Herstellervorgabe aktualisieren, dann die CPU tauschen",
      "Neue CPU einsetzen und das Firmware-Update erst nach deren erfolgreichem Start planen",
      "Neue CPU einsetzen und fehlende Unterstützung durch ein CMOS-Reset ersetzen",
      "Neue CPU einsetzen und die CPU-Unterstützung durch einen Betriebssystemtreiber nachrüsten"
    ],
    "correctAnswer": 0,
    "explanation": "Mit der noch unterstützten CPU lässt sich die erforderliche Firmware installieren. Ein CMOS-Reset oder Betriebssystemtreiber ersetzt die benötigte CPU-Unterstützung der Firmware nicht.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-069",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bestätigt eine 80-PLUS-Zertifizierung eines Netzteils?",
    "answers": [
      "Erreichen definierter Wirkungsgrade bei festgelegten Prüfbedingungen",
      "Bereitstellen von 80 Prozent der Nennleistung als dauerhaft nutzbare Leistung",
      "Nachweis der Lebensdauer sämtlicher Bauteile unter Dauerlast",
      "Nachweis einer bestimmten Anzahl von Stromanschlüssen für Grafikkarten"
    ],
    "correctAnswer": 0,
    "explanation": "80 PLUS bewertet Wirkungsgradstufen unter festgelegten Lastbedingungen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-070",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welchen Vorteil bietet eine dynamisch erweiterbare VHDX-Datei gegenüber einer sofort vollständig belegten virtuellen Festplatte?",
    "answers": [
      "Sie belegt anfangs weniger Host-Speicherplatz und wächst bei Bedarf",
      "Sie reserviert ihre gesamte virtuelle Kapazität sofort im Host-Dateisystem",
      "Sie erweitert beim Wachsen die physische Kapazität des Host-Laufwerks",
      "Sie gibt gelöschten Gast-Speicherplatz in jedem Fall sofort an den Host zurück"
    ],
    "correctAnswer": 0,
    "explanation": "Bei einer dynamisch erweiterbaren VHDX wird der Host-Speicherplatz bedarfsabhängig belegt. Der Host muss weiteres Wachstum ermöglichen; das Löschen im Gast verkleinert die Datei nicht in jedem Fall unmittelbar.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-071",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine VM und alle ihre Hyper-V-Checkpoint-Dateien liegen auf demselben physischen Laufwerk. Was fehlt gegenüber einem unabhängig gespeicherten Backup?",
    "answers": [
      "Eine wiederherstellbare Kopie bei vollständigem Ausfall dieses Laufwerks",
      "Die Möglichkeit, einen früheren erfassten VM-Zustand auszuwählen",
      "Die Möglichkeit, Änderungen an den virtuellen Datenträgern zu erfassen",
      "Die Möglichkeit, einen Test innerhalb der VM rückgängig zu machen"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Checkpoint hängt von den zugehörigen VM-Dateien ab. Liegen alle auf demselben ausgefallenen Laufwerk, fehlt eine unabhängige Wiederherstellungsquelle.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-072",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist die Aufgabe von Sysprep bei Windows-Images?",
    "answers": [
      "Eine Windows-Installation für Generalisierung und erneute Bereitstellung vorbereiten",
      "Eine vorhandene Windows-Partition als vollständige Image-Datei erfassen",
      "Eine beschädigte Windows-Komponentenablage aus einer Quelle reparieren",
      "Ein Windows-Volume in ein anderes Dateisystem konvertieren"
    ],
    "correctAnswer": 0,
    "explanation": "Sysprep kann systemspezifische Informationen generalisieren und eine Installation für Deployment vorbereiten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-073",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum ist es problematisch, viele identische Windows-VMs nur durch simples Kopieren ohne Generalisierung zu verteilen?",
    "answers": [
      "Systemspezifische Informationen werden ohne geeignete Vorbereitung mitkopiert",
      "Das Kopieren führt zugleich die vollständige Generalisierung der Windows-Installation aus",
      "Die Vergabe einer neuen VM-Kennung entfernt dabei auch die systemspezifischen Windows-Daten",
      "Identische virtuelle Hardware macht jede Vorbereitung des Windows-Images überflüssig"
    ],
    "correctAnswer": 0,
    "explanation": "Beim Bereitstellen eines Windows-Images auf weiteren Rechnern oder VMs müssen installationsspezifische Informationen mit einem unterstützten Verfahren generalisiert werden, beispielsweise mit Sysprep /generalize. Eine neue VM-Kennung allein generalisiert die Windows-Installation im Gast nicht.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-074",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aussage zu BitLocker ist korrekt?",
    "answers": [
      "BitLocker kann Laufwerke verschlüsseln und dabei Schlüssel z. B. über TPM absichern.",
      "BitLocker ist ein RAID-Level.",
      "BitLocker ersetzt UEFI.",
      "BitLocker ist ein Netzwerkprotokoll auf Port 443."
    ],
    "correctAnswer": 0,
    "explanation": "BitLocker ist Microsofts Laufwerksverschlüsselung und kann mit TPM zusammenarbeiten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-075",
    "category": "Hardware",
    "topic": "CPU",
    "difficulty": "medium",
    "question": "Ein CPU-Datenblatt nennt einen Basistakt und einen höheren maximalen Turbotakt. Was bedeutet die höhere Angabe?",
    "answers": [
      "Sie ist ein unter bestimmten Betriebsbedingungen erreichbarer Takt",
      "Sie ist der garantierte Dauertakt aller Kerne bei jeder Last",
      "Sie ist der externe Takt des angeschlossenen Arbeitsspeichers",
      "Sie ist ein von Last und Temperatur unabhängiger Mindesttakt im Netzbetrieb"
    ],
    "correctAnswer": 0,
    "explanation": "Der erreichbare Turbotakt hängt unter anderem von aktiven Kernen, Last, Temperatur und Leistungsgrenzen ab. Er ist keine Zusage für dauerhaften All-Core-Betrieb.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-076",
    "category": "Hardware",
    "topic": "CPU",
    "difficulty": "medium",
    "question": "Was beschreibt die Taktfrequenz eines Prozessors am ehesten?",
    "answers": [
      "Die Anzahl ausgeführter Maschinenbefehle pro Sekunde",
      "Die Anzahl der Taktzyklen pro Sekunde",
      "Die Anzahl parallel laufender Softwareprozesse",
      "Die Datenübertragungen des Arbeitsspeichers pro Sekunde"
    ],
    "correctAnswer": 1,
    "explanation": "Die Taktfrequenz wird in Hertz angegeben und beschreibt Taktzyklen pro Sekunde.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-077",
    "category": "Hardware",
    "topic": "CPU",
    "difficulty": "medium",
    "question": "Welchen Vorteil können mehrere CPU-Kerne bieten?",
    "answers": [
      "Ein einzelner serieller Thread wird automatisch auf alle Kerne verteilt",
      "Die Taktfrequenz jedes Kerns steigt im Verhältnis zur Kernzahl",
      "Mehrere ausführungsbereite Threads können gleichzeitig bearbeitet werden",
      "Die Latenz jedes Speicherzugriffs sinkt im Verhältnis zur Kernzahl"
    ],
    "correctAnswer": 2,
    "explanation": "Mehrere Kerne können verschiedene Threads oder Prozesse gleichzeitig bearbeiten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-078",
    "category": "Hardware",
    "topic": "CPU",
    "difficulty": "medium",
    "question": "Warum lässt sich die Leistung zweier CPUs nicht allein anhand ihrer GHz-Zahl vergleichen?",
    "answers": [
      "Der höchste Turbotakt genügt auch bei unterschiedlichen Architekturen als Vergleich",
      "Die Kernzahl ersetzt den Einfluss der Leistung pro Takt bei jedem Programm",
      "Die Nennfrequenz beschreibt bereits Speicherzugriffe und Wartezeiten",
      "Architektur, Leistung pro Takt und Parallelisierung der Anwendung wirken ebenfalls"
    ],
    "correctAnswer": 3,
    "explanation": "Neben der Frequenz wirken unter anderem Architektur, IPC, Cache und Kernzahl auf die reale Leistung.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-079",
    "category": "Hardware",
    "topic": "CPU",
    "difficulty": "medium",
    "question": "Welche Beziehung zwischen L1- und L3-Cache ist bei einer typischen Desktop-CPU zu erwarten?",
    "answers": [
      "L1 hat meist weniger Kapazität und eine geringere Zugriffslatenz.",
      "L1 hat meist weniger Kapazität und eine höhere Zugriffslatenz.",
      "L1 hat meist mehr Kapazität und eine geringere Zugriffslatenz.",
      "L1 hat meist mehr Kapazität und eine höhere Zugriffslatenz."
    ],
    "correctAnswer": 0,
    "explanation": "Kleine L1-Caches liegen besonders nahe an der Ausführung. Größere nachgeordnete Caches können mehr Daten halten, haben aber typischerweise höhere Zugriffslatenzen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-080",
    "category": "Hardware",
    "topic": "CPU",
    "difficulty": "medium",
    "question": "Warum läuft ein für x86-64 übersetztes Programm nicht ohne Weiteres nativ auf einer ARM64-CPU?",
    "answers": [
      "Da beide Architekturen 64 Bit verwenden, kann nur das Betriebssystem die native Ausführung verhindern.",
      "Die Prozessoren verwenden unterschiedliche Maschinenbefehlssätze",
      "Die Architekturen unterscheiden sich nur in der Byte-Reihenfolge gespeicherter Zahlen.",
      "Jede der beiden Architekturen benötigt grundsätzlich eine andere Quellprogrammiersprache."
    ],
    "correctAnswer": 1,
    "explanation": "Nativ ausgeführter Maschinencode muss zum Befehlssatz der CPU passen. Eine geeignete Neuübersetzung oder eine unterstützte Emulationsschicht kann nötig sein.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-081",
    "category": "Hardware",
    "topic": "Mainboard",
    "difficulty": "medium",
    "question": "Welche Aufgabe hat das Mainboard?",
    "answers": [
      "Es speichert die Nutzdaten der Anwendungen in seinem Firmware-Flash",
      "Es übernimmt die Funktion des Netzteils für die Versorgung aus dem Stromnetz",
      "Es stellt Sockel, Steckplätze und Verbindungen zwischen Komponenten bereit",
      "Es führt die Maschinenbefehle der Programme anstelle der CPU aus"
    ],
    "correctAnswer": 2,
    "explanation": "Das Mainboard stellt Sockel, Steckplätze, Anschlüsse und Datenverbindungen zwischen Komponenten bereit.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-082",
    "category": "Hardware",
    "topic": "Mainboard",
    "difficulty": "medium",
    "question": "Eine CPU soll in einen passenden Sockel eingesetzt werden. Welche Orientierung ist maßgeblich?",
    "answers": [
      "Die Ausrichtung des aufgedruckten Modellnamens zum Gehäuselüfter",
      "Die Position des benachbarten RAM-Slots unabhängig von der CPU-Markierung",
      "Die Richtung des später montierten Lüfterkabels",
      "Die übereinstimmenden Positionsmarkierungen und Kodierungen von CPU und Sockel"
    ],
    "correctAnswer": 3,
    "explanation": "Markierungen und mechanische Kodierungen zeigen die vorgesehene Einbaulage. Die CPU wird nach Herstellervorgabe ohne erzwungenes Einsetzen montiert.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-083",
    "category": "Hardware",
    "topic": "Mainboard",
    "difficulty": "medium",
    "question": "Wofür wird ein PCIe-x16-Steckplatz typischerweise verwendet?",
    "answers": [
      "Für leistungsfähige Erweiterungskarten wie Grafikkarten",
      "Für SATA-Festplatten mit 3,5-Zoll-Bauform",
      "Für DDR-Arbeitsspeichermodule des Systems",
      "Für den direkten Anschluss eines Netzwerkkabels"
    ],
    "correctAnswer": 0,
    "explanation": "PCIe x16 wird häufig für Grafikkarten und andere Karten mit hohem Bandbreitenbedarf genutzt.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-084",
    "category": "Hardware",
    "topic": "Mainboard",
    "difficulty": "medium",
    "question": "Was bezeichnet x4 in der Angabe eines ausgehandelten PCIe-Links?",
    "answers": [
      "Vier Gigabyte übertragene Daten pro Sekunde",
      "Vier aktive Daten-Lanes",
      "Die vierte PCIe-Generation",
      "Vier gleichzeitig angeschlossene Erweiterungskarten"
    ],
    "correctAnswer": 1,
    "explanation": "x4 bezeichnet vier Lanes des Links. Die PCIe-Generation wird zusätzlich angegeben und bestimmt mit der Lane-Anzahl die theoretische Bandbreite.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-085",
    "category": "Hardware",
    "topic": "Mainboard",
    "difficulty": "medium",
    "question": "Eine PCIe-x16-Karte steckt mechanisch in einem x16-Slot, der elektrisch nur mit x4 angebunden ist. Was ist die wahrscheinlichste Folge?",
    "answers": [
      "Die mechanische Länge stellt unabhängig von der Verdrahtung 16 Lanes bereit",
      "Die PCIe-Generation steigt zum Ausgleich der fehlenden Lanes",
      "Die Karte kann funktionieren, die x4-Anbindung begrenzt aber die Bandbreite",
      "Die Karte erhält die x16-Bandbreite durch parallele Nutzung des System-RAM"
    ],
    "correctAnswer": 2,
    "explanation": "Mechanische Größe und elektrische Lane-Anbindung können sich unterscheiden; weniger Lanes begrenzen die Bandbreite.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-086",
    "category": "Hardware",
    "topic": "Arbeitsspeicher",
    "difficulty": "medium",
    "question": "Welche Aussage über den Refresh herkömmlichen DRAMs ist richtig?",
    "answers": [
      "Refresh ist nur für Zellen nötig, deren Inhalt das laufende Programm gerade verändert.",
      "Refresh überträgt den Inhalt regelmäßig auf einen Datenträger und liest ihn danach zurück.",
      "Refresh wird nur beim Einschalten durchgeführt; danach hält die Versorgung allein jede Zellladung konstant.",
      "Refresh frischt die Zellladung regelmäßig auf, auch wenn die gespeicherten Daten unverändert bleiben."
    ],
    "correctAnswer": 3,
    "explanation": "DRAM speichert Bits als elektrische Ladung, die nicht unbegrenzt erhalten bleibt. Refresh frischt den Zellinhalt auf, solange der Speicher versorgt wird.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-087",
    "category": "Hardware",
    "topic": "Arbeitsspeicher",
    "difficulty": "medium",
    "question": "Für ein Notebook sind austauschbare DDR4-SO-DIMMs vorgesehen. Welches Merkmal unterscheidet sie von üblichen Desktop-DDR4-UDIMMs?",
    "answers": [
      "Die kürzere Modulplatine mit einer anderen Kontaktanordnung",
      "Die identische Modulplatine mit lediglich anders bedrucktem Aufkleber",
      "Die identische Kontaktanordnung bei ausschließlich geringerer Speicherkapazität",
      "Die gleiche mechanische Bauform bei grundsätzlich doppelter Datenrate"
    ],
    "correctAnswer": 0,
    "explanation": "SO-DIMMs sind kompakter als Desktop-DIMMs und benötigen passende Steckplätze. Die gemeinsame DDR-Generation macht die Bauformen nicht austauschbar.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-088",
    "category": "Hardware",
    "topic": "Arbeitsspeicher",
    "difficulty": "hard",
    "question": "Ein DDR4-Speicherkanal überträgt 3200 Millionen Transfers pro Sekunde bei 64 Bit Datenbreite. Welche theoretische Datenrate ergibt sich ohne Zusatzbits und Verwaltungsaufwand?",
    "answers": [
      "12,8 GB/s",
      "25,6 GB/s",
      "51,2 GB/s",
      "204,8 GB/s"
    ],
    "correctAnswer": 1,
    "explanation": "64 Bit entsprechen 8 Byte. 3200 Millionen Transfers pro Sekunde × 8 Byte ergeben 25,6 Milliarden Byte pro Sekunde, also 25,6 GB/s.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-089",
    "category": "Hardware",
    "topic": "Arbeitsspeicher",
    "difficulty": "hard",
    "question": "Ein Mainboard unterstützt laut Handbuch asymmetrischen Dual-Channel-Betrieb: Der gleich große Anteil beider Kanäle arbeitet parallel, der Rest im Single-Channel-Modus. Kanal A enthält 8 GB, Kanal B 16 GB. Wie verteilen sich die 24 GB?",
    "answers": [
      "8 GB Dual Channel und 16 GB Single Channel",
      "24 GB Dual Channel und 0 GB Single Channel",
      "16 GB Dual Channel und 8 GB Single Channel",
      "0 GB Dual Channel und 24 GB Single Channel"
    ],
    "correctAnswer": 2,
    "explanation": "Je 8 GB aus beiden Kanälen bilden zusammen 16 GB im Dual-Channel-Bereich. Die übrigen 8 GB des größeren Moduls arbeiten nach der genannten Regel im Single-Channel-Modus.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-090",
    "category": "Hardware",
    "topic": "Arbeitsspeicher",
    "difficulty": "medium",
    "question": "Was beschreibt die RAM-Kapazität in GB?",
    "answers": [
      "Die Zahl der Datenübertragungen des Moduls pro Sekunde",
      "Die Wartezeit zwischen Speicherbefehl und Datenbereitstellung",
      "Die Breite des Datenbusses zwischen Speicher und Controller",
      "Die Datenmenge, die der Arbeitsspeicher gleichzeitig aufnehmen kann"
    ],
    "correctAnswer": 3,
    "explanation": "Die Kapazität gibt die verfügbare Menge an Arbeitsspeicher an.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-091",
    "category": "Hardware",
    "topic": "Massenspeicher",
    "difficulty": "medium",
    "question": "Warum sind die Zugriffszeiten einer SSD auf zufällig verteilte Daten typischerweise kürzer als bei einer HDD?",
    "answers": [
      "Es entfallen mechanische Positionierung und Rotationswartezeit",
      "SSDs speichern zufällig angeforderte Daten grundsätzlich als zusammenhängende Datei.",
      "Bei SSDs bestimmt allein die maximale Schnittstellenbandbreite die Zugriffszeit.",
      "SSDs halten den gesamten Inhalt des Laufwerks dauerhaft in einem DRAM-Puffer."
    ],
    "correctAnswer": 0,
    "explanation": "SSDs greifen elektronisch auf Speicherzellen zu. HDDs benötigen bei zufälligen Zugriffen zusätzlich Zeit für die Positionierung der Köpfe und das Vorbeidrehen des Zielsektors.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-092",
    "category": "Hardware",
    "topic": "Massenspeicher",
    "difficulty": "medium",
    "question": "Welche Komponente besitzt eine klassische HDD?",
    "answers": [
      "NAND-Flash ohne bewegliche Mechanik",
      "Magnetische Scheiben und bewegliche Schreib-Lese-Köpfe",
      "Ausschließlich flüchtigen DRAM-Speicher",
      "Nur optische Speicherflächen mit Laserzugriff"
    ],
    "correctAnswer": 1,
    "explanation": "HDDs speichern Daten magnetisch auf rotierenden Scheiben.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-093",
    "category": "Hardware",
    "topic": "Massenspeicher",
    "difficulty": "medium",
    "question": "Eine 2,5-Zoll-SATA-SSD wird in einem Desktop ohne Backplane eingebaut. Welche beiden Verbindungen benötigt sie üblicherweise?",
    "answers": [
      "Ein SATA-Datenkabel ohne zusätzliche Stromverbindung",
      "Ein SATA-Stromanschluss ohne Datenverbindung",
      "Ein SATA-Datenkabel und ein SATA-Stromanschluss",
      "Ein PCIe-Zusatzstromkabel und ein SATA-Stromanschluss"
    ],
    "correctAnswer": 2,
    "explanation": "Bei dieser Bauform sind Datenübertragung und Stromversorgung getrennt angeschlossen. Eine Backplane könnte beide Anschlüsse gemeinsam aufnehmen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-094",
    "category": "Hardware",
    "topic": "Massenspeicher",
    "difficulty": "medium",
    "question": "Eine SSD schreibt anfangs sehr schnell, wird bei einem langen Kopiervorgang aber deutlich langsamer. Temperatur und Link-Konfiguration bleiben unauffällig. Welche Erklärung ist mit diesem Befund vereinbar?",
    "answers": [
      "Der PCIe-Link wechselt wegen des größeren Dateiumfangs in eine ältere Generation.",
      "Die SSD drosselt wegen Erreichens ihrer thermischen Schutzgrenze.",
      "Das Dateisystem hat seine zulässige Maximalgröße für diese Datei erreicht.",
      "Weitere Daten werden nach Ausschöpfen des schnellen Puffers langsamer in den NAND-Speicher geschrieben."
    ],
    "correctAnswer": 3,
    "explanation": "Manche SSDs nutzen einen schnellen, begrenzten Schreibpuffer, etwa einen SLC-Cache. Nach dessen Auslastung kann die anhaltende Schreibrate deutlich niedriger sein als die anfängliche Spitzenrate.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-095",
    "category": "Hardware",
    "topic": "Massenspeicher",
    "difficulty": "hard",
    "question": "Eine NVMe-SSD auf einem PCIe-Adapter wird vom gestarteten Betriebssystem als Datenlaufwerk erkannt. Warum beweist das noch nicht, dass der PC davon booten kann?",
    "answers": [
      "Die Firmware benötigt zusätzlich Unterstützung für den NVMe-Bootpfad",
      "Die Betriebssystemerkennung beweist bereits jede notwendige Firmwarefunktion",
      "Der PCIe-Adapter stellt durch seine mechanische Passform automatisch einen Firmware-Bootdienst bereit",
      "Eine Formatierung des Dateisystems ergänzt die fehlende NVMe-Unterstützung der Firmware"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Betriebssystemtreiber kann ein Laufwerk ansprechen, das die Firmware nicht als Bootgerät unterstützt. Für den Systemstart muss auch die vorgelagerte Bootkette passend unterstützt und eingerichtet sein.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-096",
    "category": "Hardware",
    "topic": "RAID",
    "difficulty": "medium",
    "question": "Ein RAID 10 besteht aus den Spiegelpaaren A/B und C/D. Laufwerk A ist ausgefallen. Welcher einzelne weitere Laufwerksausfall führt zum Verlust eines vollständigen Spiegelpaares?",
    "answers": [
      "Laufwerk C",
      "Laufwerk B",
      "Laufwerk D",
      "Keiner dieser einzelnen weiteren Ausfälle"
    ],
    "correctAnswer": 1,
    "explanation": "Fällt nach A auch B aus, sind beide Kopien dieses Spiegelpaares verloren. Ein Ausfall in einem anderen Paar kann tolerierbar sein, sofern dessen Gegenstück intakt bleibt.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-097",
    "category": "Hardware",
    "topic": "RAID",
    "difficulty": "medium",
    "question": "Welche klassische RAID-Stufe verwendet zwei unabhängige Paritätsinformationen und toleriert damit den Ausfall beliebiger zwei Laufwerke?",
    "answers": [
      "RAID 0",
      "RAID 5",
      "RAID 6",
      "RAID 1 mit genau zwei Laufwerken"
    ],
    "correctAnswer": 2,
    "explanation": "RAID 6 nutzt doppelte verteilte Parität. Bei intakten übrigen Daten können zwei ausgefallene Laufwerke rekonstruiert werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-098",
    "category": "Hardware",
    "topic": "RAID",
    "difficulty": "medium",
    "question": "Ein RAID 5 meldet nach dem Ausfall eines Laufwerks den Zustand 'degraded'. Die Daten sind noch erreichbar. Welche Aussage trifft zu?",
    "answers": [
      "Die verbleibenden Laufwerke enthalten jetzt vollständige Einzelkopien aller Daten",
      "Der Verbund besitzt weiterhin Schutz gegen den Ausfall eines weiteren Laufwerks",
      "Der Zustand bedeutet, dass ein aktuelles externes Backup bereits erstellt wurde",
      "Die Redundanz ist aufgebraucht; ein weiterer Laufwerksausfall kann zum Datenverlust führen"
    ],
    "correctAnswer": 3,
    "explanation": "RAID 5 kann einen Laufwerksausfall überbrücken. Bis zum erfolgreichen Wiederaufbau fehlt diese Redundanz; Backupstatus und Austausch sind nach Betriebsverfahren zu prüfen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-099",
    "category": "Hardware",
    "topic": "RAID",
    "difficulty": "medium",
    "question": "Ein klassisches RAID 1 spiegelt eine 2-TB- und eine 4-TB-Festplatte. Es wird nur der auf beiden Laufwerken vorhandene Bereich genutzt. Wie viel ist ohne Verwaltungsverluste nutzbar?",
    "answers": [
      "2 TB",
      "3 TB",
      "4 TB",
      "6 TB"
    ],
    "correctAnswer": 0,
    "explanation": "Der gemeinsame Bereich ist auf die kleinere Festplatte begrenzt. Spiegelung stellt daher 2 TB nutzbare Kapazität bereit; der zusätzliche Bereich der größeren Platte vergrößert diesen Spiegel nicht.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-100",
    "category": "Hardware",
    "topic": "RAID",
    "difficulty": "medium",
    "question": "Welche Mindestanzahl an Laufwerken benötigt RAID 1 üblicherweise?",
    "answers": [
      "Ein Laufwerk",
      "Zwei Laufwerke",
      "Drei Laufwerke",
      "Vier Laufwerke"
    ],
    "correctAnswer": 1,
    "explanation": "Für eine Spiegelung werden mindestens zwei Laufwerke benötigt.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-101",
    "category": "Hardware",
    "topic": "Grafik und Display",
    "difficulty": "medium",
    "question": "Eine Anwendung unterstützt für ihre Berechnung wahlweise CPU- oder GPU-Ausführung. Was ist nötig, damit eine geeignete dedizierte GPU diese Berechnung übernimmt?",
    "answers": [
      "Die Auswahl der GPU allein durch den angeschlossenen Monitor erzwingen",
      "Die Programmdateien auf einen schnelleren Datenträger kopieren",
      "Den von Anwendung und Treiber unterstützten GPU-Rechenpfad verwenden",
      "Den Rechenprozess mit höherer CPU-Priorität ausführen"
    ],
    "correctAnswer": 2,
    "explanation": "Eine vorhandene GPU beschleunigt nicht automatisch jeden Programmcode. Anwendung und Treiber müssen einen geeigneten GPU-Rechenpfad unterstützen und nutzen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-102",
    "category": "Hardware",
    "topic": "Grafik und Display",
    "difficulty": "medium",
    "question": "Eine Grafikaufgabe benötigt mehr lokalen Grafikspeicher, als die dedizierte GPU besitzt. Welche Folge ist je nach Anwendung möglich?",
    "answers": [
      "Die GPU kann bei gleichem Speicherbedarf mit unveränderter Transferlast weiterarbeiten",
      "Zusätzlicher System-RAM erhöht unmittelbar die lokale VRAM-Kapazität",
      "Eine höhere Rechentaktrate vergrößert die Zahl lokal speicherbarer Daten",
      "Auslagerung in Systemspeicher, Leistungseinbußen oder ein Abbruch"
    ],
    "correctAnswer": 3,
    "explanation": "Reicht der lokale Grafikspeicher nicht aus, können zusätzliche Transfers oder Speicherfehler auftreten. Das Verhalten hängt von Anwendung, Treiber und Speicherverwaltung ab.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-103",
    "category": "Hardware",
    "topic": "Grafik und Display",
    "difficulty": "medium",
    "question": "Welche Schnittstelle kann typischerweise digitales Bild und Ton übertragen?",
    "answers": [
      "HDMI",
      "PS/2",
      "SATA",
      "RJ11"
    ],
    "correctAnswer": 0,
    "explanation": "HDMI überträgt digitale Video- und Audiosignale.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-104",
    "category": "Hardware",
    "topic": "Grafik und Display",
    "difficulty": "medium",
    "question": "Mehrere unabhängige Monitorsignale sollen über einen DisplayPort-Ausgang zu einem geeigneten Hub übertragen werden. Welche Funktion ist dafür vorgesehen?",
    "answers": [
      "HDCP",
      "Multi-Stream Transport (MST)",
      "Adaptive-Sync",
      "Display Stream Compression (DSC)"
    ],
    "correctAnswer": 1,
    "explanation": "MST transportiert mehrere Bildströme über einen DisplayPort-Link. Grafiklösung, Software und Hub müssen die gewünschte Konfiguration unterstützen; die verfügbare Linkbandbreite wird geteilt.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-105",
    "category": "Hardware",
    "topic": "Grafik und Display",
    "difficulty": "medium",
    "question": "Ein Monitor unterstützt 144 Hz, läuft aber nur mit 60 Hz. Was sollte zuerst geprüft werden?",
    "answers": [
      "Prüfen, ob im Grafiktreiber eine Bildratenbegrenzung für Spiele aktiv ist.",
      "Prüfen, welches Farbprofil dem Monitor zugeordnet ist.",
      "Anzeigemodus, Grafikausgang und Kabel für die gewünschte Frequenz prüfen",
      "Prüfen, ob die Anwendung mehr als 60 Bilder pro Sekunde berechnet."
    ],
    "correctAnswer": 2,
    "explanation": "Für die Bildwiederholfrequenz des Monitors müssen der gewählte Anzeigemodus sowie Monitor, Grafikausgang und Kabel zusammenpassen. Die von einer Anwendung berechnete Bildrate und ein Farbprofil legen die eingestellte Monitorfrequenz nicht fest.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-106",
    "category": "Hardware",
    "topic": "Netzteil und Energie",
    "difficulty": "medium",
    "question": "Das PC-Netzteil liefert unter anderem 12 V. Welche Baugruppe erzeugt daraus auf dem Mainboard die passende niedrige Versorgungsspannung für die CPU?",
    "answers": [
      "Der Chipsatz für die SATA-Anschlüsse",
      "Der Taktgenerator des Mainboards",
      "Der RTC-Baustein mit seiner Batterie",
      "Die Spannungswandlerstufe (VRM)"
    ],
    "correctAnswer": 3,
    "explanation": "Die VRM regelt die Versorgung der CPU auf die benötigte Spannung. Das Netzteil und die CPU-Spannungsregelung erfüllen damit unterschiedliche Aufgaben.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-107",
    "category": "Hardware",
    "topic": "Netzteil und Energie",
    "difficulty": "medium",
    "question": "Auf dem Typenschild eines Netzteils ist für den gemeinsamen 12-V-Ausgang ein Grenzwert von 40 A angegeben. Welche maximale Leistung entspricht diesem Wert?",
    "answers": [
      "480 W",
      "40 W",
      "120 W",
      "520 W"
    ],
    "correctAnswer": 0,
    "explanation": "Für Gleichspannung gilt P = U × I. Bei 12 V und 40 A ergibt sich 480 W. Weitere Gesamt- oder kombinierte Grenzwerte des Netzteils sind zusätzlich zu beachten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-108",
    "category": "Hardware",
    "topic": "Netzteil und Energie",
    "difficulty": "medium",
    "question": "Ein PC benötigt laut Planung mindestens 500 W Netzteil-Nennleistung und zwei passende GPU-Stromstecker. Das Budget beträgt 100 €. Welches Angebot erfüllt alle Vorgaben?",
    "answers": [
      "450 W, zwei passende GPU-Stecker, 70 €",
      "550 W, zwei passende GPU-Stecker, 90 €",
      "550 W, ein passender GPU-Stecker, 80 €",
      "750 W, zwei passende GPU-Stecker, 130 €"
    ],
    "correctAnswer": 1,
    "explanation": "Nur das 550-W-Angebot für 90 € erfüllt Leistung, Anschlusszahl und Budget zugleich. Eine Zertifizierung allein würde fehlende Leistung oder Anschlüsse nicht ersetzen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-109",
    "category": "Hardware",
    "topic": "Netzteil und Energie",
    "difficulty": "medium",
    "question": "Was beschreibt der Wirkungsgrad eines Netzteils?",
    "answers": [
      "Aufgenommene Leistung geteilt durch abgegebene Leistung",
      "Verlustleistung geteilt durch aufgenommene Leistung",
      "Abgegebene Leistung geteilt durch aufgenommene Leistung",
      "Abgegebene Leistung geteilt durch Verlustleistung"
    ],
    "correctAnswer": 2,
    "explanation": "Ein höherer Wirkungsgrad bedeutet geringere Verluste bei gleicher abgegebener Leistung.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-110",
    "category": "Hardware",
    "topic": "Netzteil und Energie",
    "difficulty": "medium",
    "question": "Welche Folge hat ein niedrigerer Netzteilwirkungsgrad bei gleicher PC-Last?",
    "answers": [
      "Die Stromaufnahme sinkt bei gleicher abgegebener Leistung",
      "Die abgegebene Leistung steigt bei unveränderter PC-Last",
      "Die Verlustleistung sinkt trotz größerer Umwandlungsverluste",
      "Mehr elektrische Leistung wird im Netzteil als Wärme umgesetzt"
    ],
    "correctAnswer": 3,
    "explanation": "Verlustleistung wird überwiegend als Wärme abgegeben.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-111",
    "category": "Hardware",
    "topic": "Kühlung",
    "difficulty": "medium",
    "question": "Was unterscheidet eine passive CPU-Kühlung von einer aktiven Kühlung mit Lüfter?",
    "answers": [
      "Sie führt Wärme ohne einen eigenen angetriebenen Lüfter am Kühlkörper ab",
      "Sie nutzt einen eigenen Lüfter, der seine Drehzahl unabhängig von der Temperatur hält.",
      "Sie transportiert Wärme ausschließlich über eine elektrisch angetriebene Flüssigkeitspumpe.",
      "Sie verwendet einen eigenen Lüfter, der erst ab einer Temperaturschwelle anläuft."
    ],
    "correctAnswer": 0,
    "explanation": "Passive Kühler geben Wärme über ihre Oberfläche ohne eigenen Lüfter ab. Auslegung, Umgebung und gegebenenfalls Gehäuseluftstrom begrenzen die abführbare Wärmeleistung.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-112",
    "category": "Hardware",
    "topic": "SSD-Schreibausdauer",
    "difficulty": "medium",
    "question": "Im Datenblatt einer SSD ist eine Schreibausdauer von 600 TBW angegeben. Was beschreibt dieser Wert?",
    "answers": [
      "Die maximal gleichzeitig speicherbare Datenmenge",
      "Die maximal pro Sekunde übertragbare Datenmenge",
      "Die insgesamt aus dem Laufwerk gelesene Datenmenge",
      "Die spezifizierte insgesamt schreibbare Datenmenge"
    ],
    "correctAnswer": 3,
    "explanation": "TBW beschreibt die spezifizierte Schreibausdauer als kumulierte Datenmenge in Terabyte. Der Wert bezeichnet weder die Speicherkapazität noch einen festen Zeitpunkt, an dem die SSD ausfällt.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-113",
    "category": "Hardware",
    "topic": "Kühlung",
    "difficulty": "medium",
    "question": "Ein Tower ist für Lufteinlass vorne und Luftauslass hinten ausgelegt. Welche Lüfteranordnung unterstützt diesen Luftweg?",
    "answers": [
      "Vorne ausblasend und hinten einblasend",
      "Vorne einblasend und hinten einblasend",
      "Vorne einblasend und hinten ausblasend",
      "Vorne ausblasend und hinten ausblasend"
    ],
    "correctAnswer": 2,
    "explanation": "Die vorgesehene Anordnung führt kühlere Luft vorne zu und erwärmte Luft hinten ab. Andere Gehäuse können andere sinnvolle Luftwege besitzen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-114",
    "category": "Hardware",
    "topic": "Kühlung",
    "difficulty": "medium",
    "question": "Unter CPU-Dauerlast fällt der Takt. Die Temperatur bleibt deutlich unter der thermischen Grenze; die Diagnose meldet gleichzeitig ein erreichtes CPU-Leistungslimit. Welche Erklärung passt am besten?",
    "answers": [
      "Die CPU senkt wegen fehlender ausführungsbereiter Arbeit automatisch ihren Takt.",
      "Die CPU senkt den Takt wegen eines aktivierten festen Frequenzlimits unterhalb des Basistakts.",
      "Die CPU hat ihre thermische Schutzgrenze erreicht",
      "Die Leistungsregelung senkt den Takt zur Einhaltung des Leistungslimits"
    ],
    "correctAnswer": 3,
    "explanation": "Taktbegrenzung kann auch durch elektrische Leistungsgrenzen entstehen. Hier sprechen Temperatur und Diagnose für ein Power-Limit statt für thermische Drosselung.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-115",
    "category": "Hardware",
    "topic": "Kühlung",
    "difficulty": "medium",
    "question": "Warum sollte ein Kühlkörper regelmäßig von starkem Staub befreit werden?",
    "answers": [
      "Staub kann den Luftdurchsatz und den Wärmeübergang verschlechtern",
      "Staub verbessert als zusätzliche Oberflächenschicht die Wärmeabgabe an die Luft.",
      "Staub verringert den Strömungswiderstand zwischen den Kühlrippen.",
      "Staub verbessert den thermischen Kontakt zwischen Kühlerboden und Heatspreader."
    ],
    "correctAnswer": 0,
    "explanation": "Staubschichten können Lüfter und Kühlrippen beeinträchtigen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-116",
    "category": "Hardware",
    "topic": "Schnittstellen",
    "difficulty": "medium",
    "question": "Ein USB-C-Dock verwendet für Bildausgabe DisplayPort Alt Mode, keine USB-Grafiklösung. Das Notebook liefert am angeschlossenen USB-C-Port Daten und Strom, aber kein DisplayPort Alt Mode. Was ist zu erwarten?",
    "answers": [
      "Die Bildausgabe funktioniert nach Erhöhung der Ladeleistung",
      "Über diesen Port erhält das Dock kein benötigtes DisplayPort-Videosignal",
      "Ein anderes HDMI-Kabel ergänzt die fehlende Videofunktion des Notebook-Ports",
      "Ein zusätzlicher USB-Hub erzeugt das fehlende DisplayPort-Signal"
    ],
    "correctAnswer": 1,
    "explanation": "Das Dock benötigt in diesem Szenario DisplayPort Alt Mode vom Host. Passende Stecker, USB-Daten und Stromversorgung allein reichen dafür nicht aus.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-117",
    "category": "Hardware",
    "topic": "Schnittstellen",
    "difficulty": "medium",
    "question": "Warum kann ein USB-C-Kabel trotz passender Stecker ungeeignet für einen bestimmten Einsatz sein?",
    "answers": [
      "Die Steckerform legt auch die nutzbare Hochgeschwindigkeitsverkabelung fest",
      "Ein Kabel für hohe Ladeleistung unterstützt damit auch hohe Datenraten",
      "Kabel unterscheiden sich bei Datenrate, Belastbarkeit und unterstützten Betriebsarten",
      "Die maximale Datenrate des Hosts gleicht jede Begrenzung des Kabels aus"
    ],
    "correctAnswer": 2,
    "explanation": "Nicht jedes USB-C-Kabel unterstützt dieselben Geschwindigkeiten, Leistungen oder Alt-Modes.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-118",
    "category": "Hardware",
    "topic": "Schnittstellen",
    "difficulty": "medium",
    "question": "Was ermöglicht USB Power Delivery?",
    "answers": [
      "Die Reservierung der gesamten USB-Datenbandbreite für das Laden",
      "Die Übertragung von DisplayPort-Videosignalen über zusätzliche Leitungen",
      "Die dauerhafte Bereitstellung der höchsten Spannung ohne Geräteabstimmung",
      "Die Aushandlung einer von Quelle und Verbraucher unterstützten Stromversorgung"
    ],
    "correctAnswer": 3,
    "explanation": "USB PD erlaubt Geräten, geeignete Spannungs- und Leistungsprofile auszuhandeln.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-119",
    "category": "Hardware",
    "topic": "Schnittstellen",
    "difficulty": "medium",
    "question": "Welche Schnittstelle wird typischerweise für kabelgebundenes Ethernet verwendet?",
    "answers": [
      "RJ45",
      "HDMI",
      "SATA",
      "DisplayPort"
    ],
    "correctAnswer": 0,
    "explanation": "Kupferbasierte Ethernet-Verbindungen verwenden typischerweise RJ45-Steckverbindungen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-120",
    "category": "Hardware",
    "topic": "Schnittstellen",
    "difficulty": "medium",
    "question": "Welche ältere Schnittstelle wurde häufig für Tastatur und Maus verwendet?",
    "answers": [
      "SATA",
      "PS/2",
      "HDMI",
      "M.2"
    ],
    "correctAnswer": 1,
    "explanation": "PS/2 wurde lange für Tastaturen und Mäuse eingesetzt.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-121",
    "category": "Hardware",
    "topic": "Firmware und Boot",
    "difficulty": "medium",
    "question": "Was bewirkt ein nach Herstellervorgabe ausgeführtes CMOS-Reset typischerweise?",
    "answers": [
      "Es ersetzt die installierte Firmware durch die ursprüngliche Werksversion",
      "Es setzt den Inhalt des Systemlaufwerks auf den Auslieferungszustand zurück",
      "Es setzt Firmware-Konfigurationseinstellungen auf Vorgabewerte zurück",
      "Es entfernt die auf dem Systemlaufwerk installierten Gerätetreiber"
    ],
    "correctAnswer": 2,
    "explanation": "Ein CMOS-Reset betrifft Konfigurationseinstellungen. Es ist weder ein Firmware-Downgrade noch ein Löschen der Nutzdaten; danach müssen erforderliche Einstellungen gegebenenfalls erneut gesetzt werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-122",
    "category": "Hardware",
    "topic": "Firmware und Boot",
    "difficulty": "medium",
    "question": "Wozu dient die Bootreihenfolge im UEFI?",
    "answers": [
      "Sie legt fest, welche Gerätetreiber der Kernel zuerst lädt",
      "Sie legt fest, welches Benutzerkonto zuerst angemeldet wird",
      "Sie legt fest, welche Programme nach der Anmeldung automatisch starten",
      "Sie legt die Priorität der Firmware-Starteinträge fest"
    ],
    "correctAnswer": 3,
    "explanation": "Die Firmware versucht die konfigurierten Starteinträge nach ihrer Priorität. Ein Eintrag kann beispielsweise auf den Bootmanager eines Betriebssystems verweisen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-123",
    "category": "Hardware",
    "topic": "Servermanagement",
    "difficulty": "medium",
    "question": "Ein Serverbetriebssystem reagiert nicht mehr. Stromversorgung und Managementnetz sind verfügbar. Welche Lösung ermöglicht weiterhin Fernzugriff auf Hardwarestatus und Einschaltsteuerung?",
    "answers": [
      "Ein BMC mit eigener Management-Firmware",
      "Ein RDP-Dienst im Serverbetriebssystem",
      "Ein SSH-Dienst im Serverbetriebssystem",
      "Ein Monitoring-Agent im Serverbetriebssystem"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Baseboard Management Controller (BMC) arbeitet unabhängig vom Serverbetriebssystem. Bei vorhandener Stromversorgung und Netzverbindung ermöglicht er Hardwareüberwachung und Fernsteuerung.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-124",
    "category": "Hardware",
    "topic": "Firmware und Boot",
    "difficulty": "medium",
    "question": "Warum sollte ein TPM nicht unvorbereitet gelöscht oder zurückgesetzt werden, wenn darauf geschützte Schlüssel verwendet werden?",
    "answers": [
      "Das Löschen des TPM entfernt zugleich die Verschlüsselung aller betroffenen Laufwerke.",
      "Der Zugriff auf geschützte Schlüssel kann verloren gehen; Wiederherstellung muss vorbereitet sein",
      "Die im TPM geschützten Schlüssel werden dabei automatisch in das Benutzerprofil exportiert.",
      "Nach dem Reset erstellt das TPM dieselben bisherigen Schlüssel ohne Wiederherstellungsinformationen erneut."
    ],
    "correctAnswer": 1,
    "explanation": "Das Zurücksetzen kann im TPM geschütztes Schlüsselmaterial unzugänglich machen. Vorher sind Auswirkungen und unabhängige Wiederherstellungsmöglichkeiten nach dem vorgesehenen Verfahren zu klären.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-125",
    "category": "Hardware",
    "topic": "Firmware und Boot",
    "difficulty": "medium",
    "question": "Nach dem Wiederherstellen der Firmware-Standardwerte wird eine zuvor im UEFI-Modus installierte Systemplatte nicht mehr gestartet. Der Controller erkennt die Platte. Welche Einstellung sollte gezielt geprüft werden?",
    "answers": [
      "Die Einstellung für Netzwerkstart über PXE",
      "Die Auswahl des primären Grafikausgangs",
      "Den zur Installation passenden UEFI-/Legacy-Bootmodus",
      "Die Aktivierung der CPU-Virtualisierung"
    ],
    "correctAnswer": 2,
    "explanation": "Der Bootmodus muss zur vorhandenen Installation passen. Eine erkannte Platte ist nicht automatisch im gewählten Firmwaremodus startfähig; weitere Bootfehler müssen gegebenenfalls separat geprüft werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-126",
    "category": "Hardware",
    "topic": "Peripherie",
    "difficulty": "medium",
    "question": "Welches Gerät überträgt beim Digitalisieren eines Papierdokuments die erfassten Bilddaten als Eingabe an den PC?",
    "answers": [
      "Ein Monitor",
      "Ein Laserdrucker ohne Scanfunktion",
      "Ein Lautsprecher",
      "Ein Scanner"
    ],
    "correctAnswer": 3,
    "explanation": "Ein Scanner erfasst Informationen aus einem Papierdokument und liefert sie als digitale Eingabedaten an den Rechner.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-127",
    "category": "Hardware",
    "topic": "Peripherie",
    "difficulty": "medium",
    "question": "Welches Gerät ist primär ein Ausgabegerät?",
    "answers": [
      "Monitor",
      "Tastatur",
      "Scanner",
      "Maus"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Monitor stellt Informationen visuell dar.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-128",
    "category": "Hardware",
    "topic": "Peripherie",
    "difficulty": "medium",
    "question": "Welche Drucktechnologie verwendet Toner statt flüssiger Tinte?",
    "answers": [
      "Tintenstrahldruck",
      "Laserdruck",
      "Thermodirektdruck",
      "Nadeldruck"
    ],
    "correctAnswer": 1,
    "explanation": "Laserdrucker arbeiten typischerweise mit Tonerpulver.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-129",
    "category": "Hardware",
    "topic": "Peripherie",
    "difficulty": "medium",
    "question": "Welche Eigenschaften sind für einen Bürodrucker mit hohem monatlichem Textdruckvolumen besonders wichtig?",
    "answers": [
      "Hohe Fotoauflösung und randloser Farbdruck",
      "Großer Farbumfang und Unterstützung dicker Fotopapiere",
      "Passendes empfohlenes Druckvolumen und geringe Kosten je Textseite",
      "Viele Papierformate und ein besonders hochauflösendes Vorschaudisplay"
    ],
    "correctAnswer": 2,
    "explanation": "Bei hohem Druckvolumen sind Durchsatz, Verbrauchsmaterial und Seitenkosten entscheidend.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-130",
    "category": "Hardware",
    "topic": "Peripherie",
    "difficulty": "medium",
    "question": "Warum ist bei Headsets im Büro ein gerichtetes Mikrofon hilfreich?",
    "answers": [
      "Es verbessert vor allem die Geräuschunterdrückung im Kopfhörerausgang",
      "Es gleicht vor allem Aussetzer der Netzwerkübertragung aus",
      "Es erhöht vor allem die Lautstärke der entfernten Gesprächspartner",
      "Es kann Schall aus unerwünschten Richtungen bei der Aufnahme abschwächen"
    ],
    "correctAnswer": 3,
    "explanation": "Eine gerichtete Aufnahme kann Sprache gegenüber seitlichen Umgebungsgeräuschen hervorheben.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-131",
    "category": "Hardware",
    "topic": "Netzwerkhardware",
    "difficulty": "medium",
    "question": "Nach welchem Kriterium leitet ein gewöhnlicher Layer-2-Ethernet-Switch einen Unicast-Frame bei bekanntem Zielport weiter?",
    "answers": [
      "Nach der Ziel-MAC-Adresse",
      "Nach dem DNS-Namen des Empfängers",
      "Nach der TCP-Portnummer des Empfängers",
      "Nach dem Standardgateway des sendenden PCs"
    ],
    "correctAnswer": 0,
    "explanation": "Der Switch verwendet seine MAC-Adresstabelle, um den Zielport für eine bekannte Ziel-MAC-Adresse zu bestimmen. Bei unbekannten Zielen oder Broadcasts gelten andere Weiterleitungsregeln.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-132",
    "category": "Hardware",
    "topic": "Netzwerkhardware",
    "difficulty": "medium",
    "question": "Welche Kernaufgabe erfüllt ein Router beim IP-Routing?",
    "answers": [
      "Domainnamen in zugehörige IP-Adressen auflösen",
      "Pakete anhand von Routen zwischen IP-Netzen weiterleiten",
      "Endgeräten freie IP-Adressen per Lease zuweisen",
      "Ethernet-Frames anhand gelernter MAC-Adressen innerhalb eines LANs vermitteln"
    ],
    "correctAnswer": 1,
    "explanation": "Beim Routing wird anhand der Ziel-IP-Adresse und der Routingtabelle ein nächster Weg bestimmt. DNS, DHCP und Layer-2-Switching sind andere Funktionen, auch wenn ein Gerät mehrere davon kombiniert.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-133",
    "category": "Hardware",
    "topic": "Netzwerkhardware",
    "difficulty": "medium",
    "question": "Wozu dient ein Access Point?",
    "answers": [
      "Er übersetzt Domainnamen in zugehörige IP-Adressen",
      "Er stellt einen Übergang zwischen unterschiedlichen WAN-Zugangsstandards her",
      "Er stellt drahtlosen Clients den Zugang zum lokalen Netzwerk bereit",
      "Er vergibt bei jedem Verbindungsaufbau neue MAC-Adressen an die Clients"
    ],
    "correctAnswer": 2,
    "explanation": "Access Points stellen drahtlose Netzwerkanbindung bereit.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-134",
    "category": "Hardware",
    "topic": "Netzwerkhardware",
    "difficulty": "medium",
    "question": "Welche Komponente verbindet einen kabelgebundenen PC direkt mit einem Ethernet-Netz?",
    "answers": [
      "Grafikkarte bzw. Display-Adapter",
      "Soundkarte bzw. Audio-Interface",
      "TPM bzw. Sicherheitsmodul",
      "Netzwerkkarte bzw. Ethernet-Adapter"
    ],
    "correctAnswer": 3,
    "explanation": "Ein Ethernet-Adapter stellt die physische und logische Netzwerkschnittstelle des Rechners bereit.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-135",
    "category": "Hardware",
    "topic": "Netzwerkhardware",
    "difficulty": "medium",
    "question": "PC und Switch unterstützen 1 Gbit/s und verwenden Auto-Negotiation. Mit Kabel A entsteht ein 100-Mbit/s-Link, mit einem geprüften Kabel B am selben Port ein 1-Gbit/s-Link. Welcher nächste Schritt ist am besten begründet?",
    "answers": [
      "Kabel A und seine Steckverbindungen auf vollständige Aderpaarverbindung prüfen",
      "Die Gigabit-Fähigkeit des bereits mit Kabel B getesteten Switch-Ports erneut bestimmen.",
      "Den erfolgreichen Gigabit-Test der Netzwerkkarte unabhängig von Kabel A wiederholen.",
      "Die Netzwerkkarte auf 100 Mbit/s fest einstellen und den Kabeltest damit abschließen."
    ],
    "correctAnswer": 0,
    "explanation": "Der kontrollierte Kabeltausch grenzt die Ursache auf Kabel A oder dessen Kontakte ein. 1000BASE-T benötigt vier funktionsfähige Aderpaare; ein Leitungsproblem kann einen langsameren Link verursachen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-136",
    "category": "Hardware",
    "topic": "Arbeitsplatzplanung",
    "difficulty": "medium",
    "question": "Welche Information sollte vor der Auswahl eines Arbeitsplatz-PCs zuerst geklärt werden?",
    "answers": [
      "Welche Hersteller gerade die größte Modellpalette anbieten",
      "Welche Anwendungen, Arbeitslasten und Randbedingungen erfüllt werden müssen",
      "Welche Lieferanten die auffälligsten technischen Spitzenwerte bewerben",
      "Welche Ausstattung am bisherigen Arbeitsplatz am teuersten war"
    ],
    "correctAnswer": 1,
    "explanation": "Die Hardwareauswahl sollte vom tatsächlichen Bedarf und Nutzungsszenario ausgehen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-137",
    "category": "Hardware",
    "topic": "Arbeitsplatzplanung",
    "difficulty": "medium",
    "question": "Ein Büroarbeitsplatz nutzt Office, Browser und Videokonferenzen. Ein Praxistest zeigt, dass die integrierte Grafik die Anzeigeanforderungen erfüllt. Wo ist zusätzliche Ausstattung am ehesten bedarfsgerecht?",
    "answers": [
      "Bei einer dedizierten Grafikkarte für aufwendige 3D-Modellierung.",
      "Bei mehreren lokalen Hochleistungslaufwerken für große Videoprojekte.",
      "Bei ausreichend RAM, geeigneter Peripherie und zuverlässiger Anbindung",
      "Bei zusätzlichen Spezialkarten für professionelle Videoaufzeichnung."
    ],
    "correctAnswer": 2,
    "explanation": "Die nachgewiesenen Anforderungen bestimmen die Ausstattung. Bei bereits ausreichender Grafik sind RAM, Audio-/Videoperipherie und Anbindung sinnvoll nach dem tatsächlichen Bedarf zu planen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-138",
    "category": "Hardware",
    "topic": "Arbeitsplatzplanung",
    "difficulty": "medium",
    "question": "Für eine bestimmte CAD-Anwendung werden zwei kompatible Workstations verglichen. Welche Grundlage erlaubt die belastbarste Leistungsbewertung?",
    "answers": [
      "Ein Vergleich der beworbenen maximalen CPU-Taktraten.",
      "Ein Vergleich der GPU-Leistung in einem einzelnen Spielebenchmark.",
      "Ein Vergleich der RAM-Kapazität ohne Messung der CAD-Arbeitsabläufe.",
      "Repräsentative CAD-Tests sowie die Support- und Freigabelisten des Softwareanbieters"
    ],
    "correctAnswer": 3,
    "explanation": "CAD-Leistung hängt vom konkreten Programm und Arbeitsablauf ab. Repräsentative Tests und Freigaben sind aussagekräftiger als isolierte Spitzenwerte.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-139",
    "category": "Hardware",
    "topic": "Arbeitsplatzplanung",
    "difficulty": "medium",
    "question": "Warum sollte bei der Beschaffung auch die Garantie- und Supportdauer berücksichtigt werden?",
    "answers": [
      "Sie beeinflusst Serviceaufwand, Wiederherstellungsdauer und Folgekosten",
      "Sie legt die technische Rechenleistung für die gesamte Nutzungsdauer fest",
      "Sie bestimmt die Kapazität später einsetzbarer Arbeitsspeichermodule",
      "Sie verhindert Hardwaredefekte während der zugesagten Servicezeit"
    ],
    "correctAnswer": 0,
    "explanation": "Servicebedingungen sind Teil der Gesamtbetriebskosten und Verfügbarkeit.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-140",
    "category": "Hardware",
    "topic": "Arbeitsplatzplanung",
    "difficulty": "medium",
    "question": "Was bedeutet TCO bei der Bewertung eines Arbeitsplatzsystems?",
    "answers": [
      "Der Anschaffungspreis nach Abzug sämtlicher Rabatte",
      "Die relevanten Gesamtkosten über Anschaffung und Nutzungsdauer",
      "Die Summe der Kosten für Strom und Verbrauchsmaterial ohne Anschaffung",
      "Der Wiederverkaufswert des Systems am Ende der Nutzungsdauer"
    ],
    "correctAnswer": 1,
    "explanation": "Total Cost of Ownership berücksichtigt neben Anschaffung auch laufende und indirekte Kosten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-141",
    "category": "Hardware",
    "topic": "Ergonomie",
    "difficulty": "medium",
    "question": "Wie sollte die Oberkante eines typischen Büro-Monitors ungefähr positioniert sein?",
    "answers": [
      "Mit der Bildschirmmitte auf Augenhöhe, auch wenn die oberste Zeile einen Blick nach oben erfordert.",
      "Mit der Unterkante auf Augenhöhe und der Bildschirmfläche darüber.",
      "So, dass die oberste sichtbare Zeile nicht über Augenhöhe liegt und der Blick leicht nach unten fällt.",
      "Mit einer für alle Beschäftigten identischen Höhe über der Tischplatte."
    ],
    "correctAnswer": 2,
    "explanation": "Als Grundorientierung sollte die oberste sichtbare Bildschirmzeile nicht über Augenhöhe liegen. Höhe, Neigung und Sehabstand werden an die Person angepasst, sodass die Anzeige mit entspannter Kopfhaltung und leicht gesenktem Blick gelesen werden kann.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-142",
    "category": "Hardware",
    "topic": "Ergonomie",
    "difficulty": "medium",
    "question": "Warum ist ein höhenverstellbarer Monitorständer sinnvoll?",
    "answers": [
      "Er ersetzt die Anpassung von Sitzhöhe und Sitzhaltung",
      "Er vergrößert die native Auflösung bei unveränderter Bildschirmfläche",
      "Er passt den Sehabstand unabhängig vom Standort des Monitors an",
      "Er erlaubt die Anpassung der Bildschirmhöhe an Benutzer und Sitzposition"
    ],
    "correctAnswer": 3,
    "explanation": "Verstellbarkeit erleichtert eine ergonomische Anpassung des Arbeitsplatzes.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-143",
    "category": "Hardware",
    "topic": "Ergonomie",
    "difficulty": "medium",
    "question": "An einem Büroarbeitsplatz mit Fenstern sollen Blendung und Reflexionen auf dem Bildschirm verringert werden. Welche Grundanordnung ist meist günstig?",
    "answers": [
      "Die Blickrichtung möglichst parallel zur Fensterfront wählen",
      "Die Bildschirmfläche direkt zum Fenster ausrichten",
      "Das Fenster unmittelbar hinter dem Bildschirm im Blickfeld platzieren",
      "Den Bildschirm ohne Änderung der Position stärker nach oben neigen"
    ],
    "correctAnswer": 0,
    "explanation": "Bei einer Blickrichtung parallel zur Fensterfront fällt Tageslicht seitlich ein. Ergänzend können Blendschutz und angepasste Beleuchtung nötig sein.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-144",
    "category": "Hardware",
    "topic": "Ergonomie",
    "difficulty": "medium",
    "question": "Warum ist die passende Größe von Tastatur und Maus relevant?",
    "answers": [
      "Sie ersetzt Pausen durch eine unveränderte Handhaltung",
      "Sie kann eine entspanntere Haltung und gut erreichbare Bedienung ermöglichen",
      "Sie legt unabhängig von der Sitzposition die optimale Armhöhe fest",
      "Sie beseitigt die Wirkung einer ungünstigen Tischhöhe"
    ],
    "correctAnswer": 1,
    "explanation": "Geeignete Eingabegeräte können Belastungen durch ungünstige Haltung reduzieren.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-145",
    "category": "Hardware",
    "topic": "Ergonomie",
    "difficulty": "medium",
    "question": "Ein Nutzer arbeitet viele Stunden täglich an zwei Monitoren. Welche Anordnung ist sinnvoll, wenn beide gleich häufig genutzt werden?",
    "answers": [
      "Beide Monitore nebeneinander deutlich rechts von Tastatur und Sitzposition aufstellen.",
      "Einen Monitor mittig und den zweiten deutlich seitlich davon aufstellen.",
      "Beide nahe beieinander und möglichst symmetrisch im zentralen Sichtbereich aufstellen",
      "Beide Monitore übereinander anordnen, mit dem oberen oberhalb der Augenhöhe."
    ],
    "correctAnswer": 2,
    "explanation": "Eine symmetrische Anordnung kann unnötige Kopf- und Rumpfdrehungen reduzieren.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-146",
    "category": "Hardware",
    "topic": "Hardware-Sicherheit",
    "difficulty": "medium",
    "question": "Warum ist ESD-Schutz beim Arbeiten an PC-Komponenten wichtig?",
    "answers": [
      "Entladungen sind erst oberhalb der menschlichen Wahrnehmungsschwelle für Halbleiter relevant.",
      "Entladungen können Halbleiter nur schädigen, wenn die Baugruppe gerade eingeschaltet ist.",
      "Entladungen verursachen ausschließlich sofort erkennbare vollständige Bauteilausfälle.",
      "Entladungen können empfindliche Halbleiter auch ohne spürbaren Schlag schädigen"
    ],
    "correctAnswer": 3,
    "explanation": "Schon kleine elektrostatische Entladungen können Halbleiterbauteile schädigen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-147",
    "category": "Hardware",
    "topic": "Hardware-Sicherheit",
    "difficulty": "medium",
    "question": "Welche Maßnahme reduziert das ESD-Risiko bei Hardwarearbeiten?",
    "answers": [
      "Geeignete ESD-Arbeitsfläche und korrekt angeschlossenen Potentialausgleich nutzen",
      "Ein gewöhnliches Baumwolltuch ohne Potentialausgleich als ESD-Unterlage verwenden",
      "Eine Kunststofffolie als isolierende Ablage über die Arbeitsfläche legen",
      "Komponenten allein durch das Ausschalten des PCs vor statischer Aufladung schützen"
    ],
    "correctAnswer": 0,
    "explanation": "ESD-Armband, geeignete Arbeitsfläche und korrekter Potentialausgleich reduzieren elektrostatische Risiken.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-148",
    "category": "Hardware",
    "topic": "Hardware-Sicherheit",
    "difficulty": "medium",
    "question": "Wo sollte ein ausgebautes RAM-Modul möglichst angefasst werden?",
    "answers": [
      "Direkt an den goldfarbenen Kontakten für besseren Halt",
      "An den Kanten, ohne Kontakte und Bauteile unnötig zu berühren",
      "Nur an den Speicherchips mit beiden Händen",
      "An den Kontaktflächen mit einem gewöhnlichen trockenen Tuch"
    ],
    "correctAnswer": 1,
    "explanation": "Das Anfassen an den Kanten schützt Kontakte und Bauteile vor Verschmutzung und ESD-Risiken.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-149",
    "category": "Hardware",
    "topic": "Hardware-Sicherheit",
    "difficulty": "medium",
    "question": "Welche Vorgehensweise ist vor dem Öffnen eines Desktop-PCs sinnvoll?",
    "answers": [
      "Das Gerät in den Standby versetzen und anschließend die Module ausbauen",
      "Das Betriebssystem herunterfahren, den Netzstecker aber eingesteckt lassen und sofort mit dem Ausbau beginnen.",
      "Das Gerät herunterfahren, die Versorgung trennen und ESD-Schutz beachten",
      "Das Gerät per Bildschirmsperre sichern und anschließend das Gehäuse öffnen"
    ],
    "correctAnswer": 2,
    "explanation": "Vor Hardwarearbeiten sollten Stromversorgung und elektrostatische Risiken kontrolliert werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-150",
    "category": "Hardware",
    "topic": "Fehlersuche",
    "difficulty": "medium",
    "question": "Ein PC zeigt nach dem Einschalten kein Bild. Welche Prüfung ist als erster Schritt sinnvoll?",
    "answers": [
      "Das Betriebssystem von einem Installationsmedium neu aufsetzen.",
      "Den Grafikkartentreiber im abgesicherten Modus neu installieren.",
      "Die RAM-Timings in der Firmware manuell anpassen.",
      "Stromversorgung, Kabelverbindung und gewählten Monitoreingang kontrollieren"
    ],
    "correctAnswer": 3,
    "explanation": "Bei 'kein Bild' sollten zunächst einfache physische Ursachen ausgeschlossen werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-151",
    "category": "Hardware",
    "topic": "Fehlersuche",
    "difficulty": "medium",
    "question": "Nach dem Einbau eines zusätzlichen RAM-Moduls zeigt bereits die UEFI-Speicherübersicht unverändert nur die bisherige Kapazität. Welche Prüfung ist am sinnvollsten?",
    "answers": [
      "Sitz, Bestückungsregeln und Spezifikation des neuen Moduls prüfen",
      "Die Größe der Windows-Auslagerungsdatei anpassen.",
      "Die dem Grafikadapter im Betriebssystem zugewiesenen Speicherwerte erhöhen.",
      "Die maximale Speichernutzung einer einzelnen Anwendung ändern."
    ],
    "correctAnswer": 0,
    "explanation": "Wenn bereits die Firmware das neue Modul nicht erkennt, sind Sitz, unterstützte Spezifikation und Bestückungsregeln vorrangig. Einstellungen der später gestarteten Anwendungen oder der Auslagerungsdatei beheben diese Erkennung nicht.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-152",
    "category": "Hardware",
    "topic": "Fehlersuche",
    "difficulty": "medium",
    "question": "Nach dem Einbau einer leistungsstärkeren Grafikkarte startet ein PC unter kombinierter CPU-/GPU-Last neu. Temperaturen sind unauffällig; mit der alten Karte bleibt er stabil. Welcher Bereich sollte gezielt geprüft werden?",
    "answers": [
      "Die Kühlung der CPU anhand von Temperaturgrenzen und Kühlerkontakt",
      "Netzteilbelastbarkeit, GPU-Stromanschlüsse und Kabelverbindungen",
      "Die Einstellungen der Energiesparzustände von Monitor und USB-Geräten",
      "Die Stromversorgung der RTC und den Zustand der Mainboard-Batterie"
    ],
    "correctAnswer": 1,
    "explanation": "Der Zusammenhang mit der neuen Karte und hoher Last macht die Stromversorgung zu einem begründeten Prüfpunkt. Er beweist noch keinen Netzteildefekt; weitere Stabilitätsursachen bleiben möglich.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-153",
    "category": "Hardware",
    "topic": "Fehlersuche",
    "difficulty": "medium",
    "question": "Eine neue SATA-SSD wird im UEFI und in der Windows-Datenträgerverwaltung erkannt, erscheint aber nicht im Explorer. Welche Prüfung ist jetzt am sinnvollsten?",
    "answers": [
      "Prüfen, ob im UEFI der SATA-Port vollständig deaktiviert ist.",
      "Prüfen, ob die SSD wegen fehlender Stromversorgung gar nicht erkannt werden kann.",
      "Prüfen, ob ein verwendbares Volume mit Dateisystem und Laufwerksbuchstaben vorhanden ist",
      "Prüfen, ob die neue Daten-SSD in der Bootreihenfolge vor dem Systemlaufwerk steht."
    ],
    "correctAnswer": 2,
    "explanation": "Die Erkennung zeigt, dass die grundlegende Verbindung funktioniert. Im Explorer benötigt ein gewöhnliches Datenlaufwerk ein geeignetes eingebundenes Volume. Vor Initialisierung oder Formatierung sind vorhandene Daten zu berücksichtigen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-154",
    "category": "Hardware",
    "topic": "Fehlersuche",
    "difficulty": "medium",
    "question": "Ein USB-Gerät funktioniert an einem Port, aber nicht an einem anderen. Was liegt nahe?",
    "answers": [
      "Das Gerät ist durch den erfolgreichen Test an einem Port nachweislich an allen Ports unterstützt",
      "Alle Ports des PCs müssen denselben Controller und dieselben Fähigkeiten besitzen",
      "Ein passender Stecker belegt identische Strom- und Datenfähigkeiten aller Ports",
      "Der betroffene Port, seine Eigenschaften oder seine Konfiguration sollten geprüft werden"
    ],
    "correctAnswer": 3,
    "explanation": "Wenn dasselbe Gerät an einem anderen Port funktioniert, sollte der problematische Port gezielt untersucht werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-155",
    "category": "Hardware",
    "topic": "Notebooks",
    "difficulty": "medium",
    "question": "Welcher Vorteil ist für ein Notebook gegenüber einem Desktop-PC typisch?",
    "answers": [
      "Display, Eingabe und Akkubetrieb sind in einem mobilen Gerät integriert",
      "CPU und GPU lassen sich meist wie normale Desktop-Steckkarten tauschen",
      "Die kompakte Bauform stellt mehr Platz für austauschbare Erweiterungskarten bereit",
      "Die integrierte Anzeige macht externe Stromversorgung auf längeren Reisen entbehrlich"
    ],
    "correctAnswer": 0,
    "explanation": "Notebooks integrieren Display, Eingabe, Akku und Rechner in einem mobilen Gerät.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-156",
    "category": "Hardware",
    "topic": "Notebooks",
    "difficulty": "medium",
    "question": "Zwei Notebooks werden für mobile Arbeit verglichen. Welche Angabe beschreibt die erwartbare Arbeitszeit ohne Netzanschluss am aussagekräftigsten?",
    "answers": [
      "Die Akkukapazität ohne Berücksichtigung des Verbrauchs",
      "Die gemessene Laufzeit unter einem vergleichbaren Arbeitsprofil",
      "Die maximale Nennleistung des mitgelieferten Ladegeräts",
      "Die höchste kurzzeitig erreichbare CPU-Taktfrequenz"
    ],
    "correctAnswer": 1,
    "explanation": "Die Laufzeit hängt von nutzbarer Akkuenergie und Verbrauch ab. Vergleichbare Arbeitslast, Displayhelligkeit und Testbedingungen sind deshalb wichtig.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-157",
    "category": "Hardware",
    "topic": "Notebooks",
    "difficulty": "medium",
    "question": "Welche RAM-Ausführung lässt sich nicht durch den üblichen Austausch eines gesteckten Speichermoduls aufrüsten?",
    "answers": [
      "Ein frei zugängliches DDR4-SO-DIMM",
      "Ein vom Hersteller als austauschbar vorgesehenes DDR5-SO-DIMM",
      "Direkt auf der Hauptplatine verlötete Speicherchips",
      "Ein kompatibles DDR4-UDIMM in einem Sockel"
    ],
    "correctAnswer": 2,
    "explanation": "Verlötete Speicherchips sind keine steckbaren Aufrüstmodule. Ein üblicher RAM-Tausch setzt einen geeigneten Sockel und die Unterstützung des Geräts voraus.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-158",
    "category": "Hardware",
    "topic": "Notebooks",
    "difficulty": "medium",
    "question": "Warum kann ein sehr dünnes Notebook trotz schneller CPU unter Dauerlast langsamer werden?",
    "answers": [
      "Der maximale Turbotakt ist unabhängig von Lastdauer und Kühlung als Dauertakt zugesichert.",
      "Ein dünneres Gehäuse vergrößert bei gleicher Verlustleistung automatisch die Kühlreserve.",
      "Die CPU kann ihre Temperatur nur durch vollständiges Abschalten, nicht durch Taktänderung beeinflussen.",
      "Die kompakte Kühlung kann die dauerhaft abführbare Wärme und damit den Takt begrenzen"
    ],
    "correctAnswer": 3,
    "explanation": "Kompakte Kühlung kann langfristige Leistungsaufnahme und Takt unter hoher Last begrenzen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-159",
    "category": "Hardware",
    "topic": "Nachhaltigkeit",
    "difficulty": "medium",
    "question": "Welche Maßnahme kann die Nutzungsdauer eines Arbeitsplatz-PCs verlängern?",
    "answers": [
      "Reparierbarkeit, Aufrüstoptionen und verfügbare Ersatzteile einplanen",
      "Den höchsten kurzfristigen Turbotakt als Lebensdauernachweis verwenden",
      "Eine längere Garantie als Ersatz für erforderliche Wartung betrachten",
      "Die Gehäusegröße als alleinigen Nachweis der Aufrüstbarkeit verwenden"
    ],
    "correctAnswer": 0,
    "explanation": "Aufrüstbarkeit, Ersatzteilversorgung und Wartung können die Lebensdauer verlängern.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-160",
    "category": "Hardware",
    "topic": "Nachhaltigkeit",
    "difficulty": "medium",
    "question": "Warum ist Energieeffizienz bei vielen Arbeitsplatzrechnern wirtschaftlich relevant?",
    "answers": [
      "Der Wirkungsgrad bestimmt die gesamten Betriebskosten unabhängig von den Nutzungsstunden",
      "Kleine Verbrauchsunterschiede summieren sich über Gerätezahl und Einsatzdauer",
      "Die höchste Netzteil-Nennleistung führt zum niedrigsten Stromverbrauch im Büro",
      "Die einmaligen Anschaffungskosten enthalten bereits den Stromverbrauch der Nutzungsjahre"
    ],
    "correctAnswer": 1,
    "explanation": "Bei vielen Geräten können auch kleine Verbrauchsunterschiede über Jahre relevante Kosten verursachen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-161",
    "category": "Hardware",
    "topic": "Nachhaltigkeit",
    "difficulty": "medium",
    "question": "Was ist bei der Entsorgung alter IT-Hardware zu beachten?",
    "answers": [
      "Die Geräte nach Entfernen der Inventaraufkleber ohne Datenprüfung weitergeben",
      "Die Datenträger wegen des Recyclingprozesses ungeprüft im Gerät belassen",
      "Datenbehandlung und geeignete Rückgabe- oder Verwertungswege organisieren",
      "Den Lagerstatus im Inventar ändern und damit die Entsorgung abschließen"
    ],
    "correctAnswer": 2,
    "explanation": "Vor Wiederverwendung oder Entsorgung müssen Daten sicher behandelt und gesetzliche Entsorgungswege beachtet werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-162",
    "category": "Hardware",
    "topic": "Nachhaltigkeit",
    "difficulty": "medium",
    "question": "Ein alter PC wird ausgemustert, die SSD enthält vertrauliche Daten. Welche Maßnahme ist geeignet?",
    "answers": [
      "Die Partition schnell formatieren und den leeren Explorer als Löschbeleg verwenden",
      "Das Benutzerkonto entfernen und die verbleibende SSD unverändert weitergeben",
      "Die Partitionstabelle löschen und damit auch alle Flash-Zellen als gelöscht behandeln",
      "Ein freigegebenes SSD-Löschverfahren durchführen und prüfen oder den Datenträger fachgerecht vernichten"
    ],
    "correctAnswer": 3,
    "explanation": "Dateilöschung, Schnellformatierung oder das Entfernen der Partitionstabelle reichen als Nachweis sicherer Sanitization nicht aus. Für die SSD ist ein geeignetes freigegebenes Verfahren samt Ergebnisprüfung erforderlich; alternativ kommt fachgerechte Vernichtung infrage.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-163",
    "category": "Hardware",
    "topic": "Kompatibilität",
    "difficulty": "medium",
    "question": "CPU, Mainboard und RAM eines Neubaus sind kompatibel. Das Gehäuse unterstützt nur Mini-ITX, das ausgewählte Mainboard ist ATX. Welche Schlussfolgerung ist richtig?",
    "answers": [
      "Mainboard und Gehäuse sind mechanisch nicht passend ausgewählt",
      "Eine passende I/O-Blende macht die unterschiedlichen Board-Abmessungen kompatibel",
      "Das Weglassen ungenutzter Abstandshalter schafft den fehlenden Innenraum",
      "Ein Netzteil im ATX-Format bestätigt zugleich die Unterstützung von ATX-Mainboards"
    ],
    "correctAnswer": 0,
    "explanation": "Die freigegebenen Mainboard-Formate des Gehäuses begrenzen den Einbau. Elektrische Kompatibilität zwischen CPU und Board beseitigt eine mechanische Unverträglichkeit nicht.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-164",
    "category": "Hardware",
    "topic": "Kompatibilität",
    "difficulty": "medium",
    "question": "Eine Grafikkarte ist 330 mm lang. Das Gehäuse bietet mit montiertem Front-Radiator 310 mm Platz, ohne ihn 350 mm. Was gilt für den Einbau mit unverändert montiertem Radiator?",
    "answers": [
      "Die Karte passt, weil der PCIe-x16-Steckplatz ihre Länge ausgleicht.",
      "Die Karte passt nicht, weil der verfügbare Freiraum um 20 mm zu kurz ist.",
      "Die Karte passt, weil ausschließlich der Gehäusewert ohne Radiator maßgeblich ist.",
      "Die Karte passt, wenn ihre Höhe die zulässige Slotblende nicht überschreitet."
    ],
    "correctAnswer": 1,
    "explanation": "Maßgeblich ist der tatsächlich verfügbare Platz mit den eingebauten Komponenten. 330 mm Kartenlänge überschreiten die 310 mm Freiraum um 20 mm.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-165",
    "category": "Hardware",
    "topic": "Kompatibilität",
    "difficulty": "medium",
    "question": "Eine elektrisch passende M.2-SSD im Format 22110 soll ein vorhandenes 2280-Modul ersetzen. Welche zusätzliche mechanische Prüfung ist erforderlich?",
    "answers": [
      "Ob die gemeinsame Breite von 22 mm bereits alle mechanischen Anforderungen erfüllt.",
      "Ob die vorhandene Schraubposition bei 80 mm auch ein 110-mm-Modul sicher befestigt.",
      "Ob Länge, Freiraum und Befestigung für das längere Modul vorhanden sind",
      "Ob die elektrische Kontaktierung allein die Fixierung ohne passenden Abstandshalter ersetzt."
    ],
    "correctAnswer": 2,
    "explanation": "22110 steht für 22 mm Breite und 110 mm Länge, 2280 für 80 mm Länge. Elektrisch passende Geräte können mechanisch zu lang sein oder keine passende Befestigung finden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-166",
    "category": "Hardware",
    "topic": "Kompatibilität",
    "difficulty": "medium",
    "question": "Ein Gehäuse erlaubt laut Datenblatt CPU-Kühler bis 160 mm. Der gewählte Kühler ist einschließlich Lüfter 168 mm hoch. Welche Bewertung ist korrekt?",
    "answers": [
      "Die Höhe des Lüfters darf bei der Gehäusegrenze grundsätzlich unberücksichtigt bleiben.",
      "Die passende Sockelhalterung belegt zugleich ausreichenden Abstand zur Seitenwand.",
      "Die Angabe von 160 mm bezeichnet den Mindestabstand; höhere Kühler sind dadurch freigegeben.",
      "Der Kühler überschreitet die freigegebene Höhe und passt so nicht"
    ],
    "correctAnswer": 3,
    "explanation": "168 mm liegen 8 mm über der Gehäusefreigabe. Ein elektrischer oder thermischer Eignungsnachweis ersetzt die mechanische Passform nicht.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-167",
    "category": "Hardware",
    "topic": "Kompatibilität",
    "difficulty": "medium",
    "question": "Warum ist die Anzahl der benötigten Monitoranschlüsse vor dem Kauf wichtig?",
    "answers": [
      "Grafiklösung und gegebenenfalls Dock müssen die gewünschte Display-Konfiguration unterstützen",
      "Die Anzahl passender Buchsen belegt bereits jede gleichzeitig mögliche Auflösung",
      "Ein passiver Verteiler erzeugt aus jedem Bildsignal mehrere unabhängige Desktops",
      "Die Zahl der Monitore legt allein den erforderlichen Grafikspeicher fest"
    ],
    "correctAnswer": 0,
    "explanation": "Die gewünschte Monitoranzahl und Auflösung müssen von den vorhandenen Ausgängen unterstützt werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-168",
    "category": "Hardware",
    "topic": "Qualitätssicherung",
    "difficulty": "medium",
    "question": "Was sollte nach dem Aufbau eines neuen Arbeitsplatz-PCs erfolgen?",
    "answers": [
      "Den erfolgreichen ersten Start als vollständigen Abnahmetest dokumentieren",
      "Die vereinbarten Funktionen und Anforderungen anhand definierter Prüfschritte testen",
      "Die technischen Datenblätter anstelle von Funktionsprüfungen abhaken",
      "Die Abnahme auf das Vorhandensein sämtlicher bestellter Verpackungen beschränken"
    ],
    "correctAnswer": 1,
    "explanation": "Ein Abnahmetest prüft, ob das System erwartungsgemäß und entsprechend den Anforderungen funktioniert.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-169",
    "category": "Hardware",
    "topic": "Qualitätssicherung",
    "difficulty": "medium",
    "question": "Warum ist eine Hardwareinventarisierung sinnvoll?",
    "answers": [
      "Sie ersetzt die Prüfung des tatsächlichen Hardwarezustands bei einer Störung",
      "Sie hält automatisch alle Gerätetreiber auf dem aktuellen Stand",
      "Sie macht Geräte, Konfigurationen und Zuordnungen nachvollziehbar",
      "Sie weist allein durch Erfassung die ordnungsgemäße Datenlöschung nach"
    ],
    "correctAnswer": 2,
    "explanation": "Inventardaten unterstützen Verwaltung, Support, Austausch und Lizenz- beziehungsweise Lebenszyklusplanung.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-170",
    "category": "Hardware",
    "topic": "Qualitätssicherung",
    "difficulty": "medium",
    "question": "Welche Information gehört sinnvoll in eine Arbeitsplatzdokumentation?",
    "answers": [
      "Die allgemeinen Werbedaten der Baureihe ohne Zuordnung zum konkreten Gerät",
      "Die ursprüngliche Bestellung ohne die tatsächlich verbaute Konfiguration",
      "Die geplante Testliste ohne Ergebnisse oder Datum der Durchführung",
      "Gerätezuordnung, tatsächliche Konfiguration und dokumentierte Prüfergebnisse"
    ],
    "correctAnswer": 3,
    "explanation": "Technische Dokumentation sollte relevante Konfigurationen und Prüfergebnisse nachvollziehbar festhalten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-171",
    "category": "Hardware",
    "topic": "Qualitätssicherung",
    "difficulty": "medium",
    "question": "Warum ist eine Checkliste bei der Einrichtung vieler ähnlicher Arbeitsplätze hilfreich?",
    "answers": [
      "Sie unterstützt einen wiederholbaren Ablauf und macht ausgelassene Schritte sichtbar",
      "Sie ersetzt die Anpassung an abweichende Benutzeranforderungen",
      "Sie bestätigt bestandene Tests bereits durch das Vorhandensein der Prüfpunkte",
      "Sie macht Versionsänderungen des Einrichtungsprozesses entbehrlich"
    ],
    "correctAnswer": 0,
    "explanation": "Checklisten unterstützen konsistente Abläufe und dokumentierbare Qualität.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-172",
    "category": "Hardware",
    "topic": "Qualitätssicherung",
    "difficulty": "medium",
    "question": "Was ist ein sinnvoller Bestandteil einer Übergabe an einen Benutzer?",
    "answers": [
      "Die Übergabe auf die technischen Datenblätter der Komponenten beschränken",
      "Relevante Bedienung erklären und auf Dokumentation sowie Supportweg hinweisen",
      "Die Einweisung durch einen vollständig protokollierten Leistungstest ersetzen",
      "Die Benutzeranforderungen erst nach Abschluss der Übergabe erheben"
    ],
    "correctAnswer": 1,
    "explanation": "Eine zielgruppengerechte Einweisung gehört zu einer vollständigen Arbeitsplatzübergabe.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-173",
    "category": "Hardware",
    "topic": "IT-Sicherheit",
    "difficulty": "medium",
    "question": "Warum sollte ein Arbeitsplatzrechner bei Abwesenheit gesperrt werden?",
    "answers": [
      "Die CPU erhält dadurch zusätzliche Rechenkerne",
      "Die SSD wird dadurch automatisch physisch verschlüsselt",
      "Unbefugter Zugriff auf Daten und Anwendungen wird erschwert",
      "Der Monitor kann dadurch höhere Bildraten anzeigen"
    ],
    "correctAnswer": 2,
    "explanation": "Eine gesperrte Sitzung schützt vor direktem Zugriff durch andere Personen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-174",
    "category": "Hardware",
    "topic": "IT-Sicherheit",
    "difficulty": "medium",
    "question": "Welche Aufgabe kann ein Kensington-Schloss erfüllen?",
    "answers": [
      "Es verhindert das Auslesen eines ausgebauten unverschlüsselten Datenträgers",
      "Es erkennt die Manipulation angeschlossener USB-Geräte",
      "Es sperrt eine offene Benutzersitzung bei Abwesenheit",
      "Es erschwert das unbefugte Mitnehmen eines physisch befestigten Geräts"
    ],
    "correctAnswer": 3,
    "explanation": "Ein Kensington-Schloss ist eine mechanische Sicherung für Geräte.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-175",
    "category": "Hardware",
    "topic": "IT-Sicherheit",
    "difficulty": "medium",
    "question": "Warum ist ein Sichtschutzfilter in bestimmten Arbeitsumgebungen sinnvoll?",
    "answers": [
      "Er erschwert das Lesen des Bildschirms aus seitlichen Blickwinkeln",
      "Er verhindert Screenshots durch Programme auf dem Rechner",
      "Er verschlüsselt den Inhalt auf dem Kabel zum Monitor",
      "Er sperrt den Bildschirm automatisch beim Verlassen des Arbeitsplatzes"
    ],
    "correctAnswer": 0,
    "explanation": "Privacy-Filter reduzieren die Lesbarkeit des Bildschirms aus seitlichen Blickwinkeln.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-176",
    "category": "Hardware",
    "topic": "IT-Sicherheit",
    "difficulty": "medium",
    "question": "Ein mobiles Notebook soll gegen unbefugte Anmeldung, Offline-Auslesen nach Verlust und einfaches Mitnehmen geschützt werden. Welche Kombination adressiert alle drei Ziele?",
    "answers": [
      "Starke Anmeldung, aktuelle Sicherheitsupdates und physische Sicherung",
      "Laufwerksverschlüsselung, starke Anmeldung und angemessene physische Sicherung",
      "Laufwerksverschlüsselung, Datensicherung und Inventarisierung",
      "Physische Sicherung, Sichtschutzfilter und regelmäßige Datensicherung"
    ],
    "correctAnswer": 1,
    "explanation": "Schutz mobiler Geräte umfasst technische Authentisierung, Verschlüsselung und physischen Schutz.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-177",
    "category": "Hardware",
    "topic": "Leistungsberechnung",
    "difficulty": "medium",
    "question": "Ein PC benötigt 250 W und zwei Monitore jeweils 30 W. Wie hoch ist die Gesamtleistung?",
    "answers": [
      "280 W",
      "340 W",
      "310 W",
      "500 W"
    ],
    "correctAnswer": 2,
    "explanation": "250 W + 30 W + 30 W = 310 W.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-178",
    "category": "Hardware",
    "topic": "Leistungsberechnung",
    "difficulty": "medium",
    "question": "Ein Gerät mit 100 W läuft 10 Stunden. Wie viel Energie verbraucht es?",
    "answers": [
      "0,1 kWh",
      "10 kWh",
      "100 kWh",
      "1 kWh"
    ],
    "correctAnswer": 3,
    "explanation": "100 W × 10 h = 1000 Wh = 1 kWh.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-179",
    "category": "Hardware",
    "topic": "Leistungsberechnung",
    "difficulty": "hard",
    "question": "Ein Arbeitsplatz benötigt durchschnittlich 200 W und läuft an 220 Arbeitstagen jeweils 8 Stunden. Wie hoch ist der Jahresverbrauch ungefähr?",
    "answers": [
      "352 kWh",
      "35,2 kWh",
      "176 kWh",
      "880 kWh"
    ],
    "correctAnswer": 0,
    "explanation": "0,2 kW × 8 h × 220 = 352 kWh.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-180",
    "category": "Hardware",
    "topic": "Leistungsberechnung",
    "difficulty": "medium",
    "question": "Ein Netzteil nimmt 500 W aus dem Stromnetz auf und liefert 450 W an den PC. Wie hoch ist der Wirkungsgrad?",
    "answers": [
      "80 %",
      "90 %",
      "95 %",
      "110 %"
    ],
    "correctAnswer": 1,
    "explanation": "450 W / 500 W × 100 = 90 %.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-181",
    "category": "Hardware",
    "topic": "Leistungsberechnung",
    "difficulty": "hard",
    "question": "Ein PC verbraucht 0,3 kW und läuft 6 Stunden. Der Strompreis beträgt 0,35 €/kWh. Welche Kosten entstehen ungefähr?",
    "answers": [
      "0,35 €",
      "1,80 €",
      "0,63 €",
      "6,30 €"
    ],
    "correctAnswer": 2,
    "explanation": "0,3 kW × 6 h = 1,8 kWh; 1,8 × 0,35 € = 0,63 €.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-182",
    "category": "Hardware",
    "topic": "Virtualisierung",
    "difficulty": "medium",
    "question": "Welche Kombination beschreibt typische einer VM zugewiesene Ressourcen?",
    "answers": [
      "Ausschließlich ganze physische CPU-Kerne und vollständige physische Laufwerke",
      "Virtuelle Datenträger, aber keine konfigurierbaren CPU- oder RAM-Ressourcen",
      "Arbeitsspeicher und virtuelle Prozessoren, jedoch zwingend alle Host-Ressourcen exklusiv",
      "Virtuelle Prozessoren, Arbeitsspeicher und virtuelle Datenträger"
    ],
    "correctAnswer": 3,
    "explanation": "Virtuelle Maschinen erhalten definierte Anteile beziehungsweise virtuelle Abbildungen von Host-Ressourcen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-183",
    "category": "Hardware",
    "topic": "Virtualisierung",
    "difficulty": "medium",
    "question": "Mehrere VMs verwenden feste RAM-Zuweisungen auf einem Host mit begrenztem Arbeitsspeicher. Warum sollten diese Zuweisungen am Bedarf ausgerichtet sein?",
    "answers": [
      "Übermäßige Zuweisungen können den Speicher für Host und andere VMs verknappen",
      "Eine feste Zuweisung vergrößert automatisch die physische RAM-Kapazität",
      "Nicht benötigter Gast-RAM steht bei fester Zuweisung in jedem Fall sofort allen VMs zur Verfügung",
      "Der Host benötigt neben dem an VMs zugewiesenen RAM keinen eigenen Arbeitsspeicher"
    ],
    "correctAnswer": 0,
    "explanation": "Auch der Host und weitere VMs benötigen RAM. Feste Zuweisungen sollten zur Arbeitslast passen; dynamische Speicherverfahren haben zusätzliche, plattformspezifische Regeln.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-184",
    "category": "Hardware",
    "topic": "Virtualisierung",
    "difficulty": "medium",
    "question": "Welche Erweiterungen unterstützen die hardwaregestützte Virtualisierung der CPU-Ausführung durch einen Hypervisor?",
    "answers": [
      "Intel VT-d beziehungsweise AMD-Vi für I/O-Virtualisierung",
      "Intel VT-x beziehungsweise AMD-V für CPU-Virtualisierung",
      "SMT beziehungsweise Hyper-Threading für logische Prozessoren",
      "AVX beziehungsweise vergleichbare SIMD-Befehlserweiterungen"
    ],
    "correctAnswer": 1,
    "explanation": "Moderne Hypervisoren nutzen häufig Hardwarevirtualisierungsfunktionen der CPU.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-185",
    "category": "Hardware",
    "topic": "Virtualisierung",
    "difficulty": "medium",
    "question": "Was unterscheidet einen Hyper-V-Produktionsprüfpunkt vom Standardprüfpunkt einer laufenden VM hinsichtlich des Arbeitsspeichers?",
    "answers": [
      "Beide speichern den laufenden RAM-Zustand in gleicher Weise",
      "Nur der Produktionsprüfpunkt speichert den laufenden RAM-Zustand",
      "Der Standardprüfpunkt erfasst den RAM-Zustand, der Produktionsprüfpunkt nicht",
      "Keine der beiden Prüfpunktarten kann virtuelle Datenträger erfassen"
    ],
    "correctAnswer": 2,
    "explanation": "Standardprüfpunkte erfassen unter anderem den Speicherzustand einer laufenden VM. Produktionsprüfpunkte verwenden Konsistenzmechanismen des Gasts und speichern diesen laufenden RAM-Zustand nicht.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-186",
    "category": "Hardware",
    "topic": "Hardware-Grundlagen",
    "difficulty": "medium",
    "question": "Was beschreibt ein Bit?",
    "answers": [
      "Eine Informationseinheit mit vier möglichen Zuständen",
      "Eine Gruppe aus acht binären Stellen",
      "Eine dezimale Ziffer mit zehn möglichen Werten",
      "Eine binäre Informationseinheit mit zwei möglichen Zuständen"
    ],
    "correctAnswer": 3,
    "explanation": "Ein Bit kann einen von zwei binären Zuständen darstellen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-187",
    "category": "Hardware",
    "topic": "Hardware-Grundlagen",
    "difficulty": "medium",
    "question": "Wie viele Bit enthält ein Byte?",
    "answers": [
      "8 Bit",
      "2 Bit",
      "16 Bit",
      "32 Bit"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Byte besteht aus acht Bit.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-188",
    "category": "Hardware",
    "topic": "Hardware-Grundlagen",
    "difficulty": "medium",
    "question": "Was bedeutet eine Datenrate von 100 Mbit/s bei dezimalem Präfix, ohne Berücksichtigung von Protokoll-Overhead?",
    "answers": [
      "100 Millionen Byte pro Sekunde",
      "100 Millionen Bit pro Sekunde",
      "100 Megabyte gespeicherte Daten insgesamt",
      "100 Millionen Taktzyklen pro Sekunde"
    ],
    "correctAnswer": 1,
    "explanation": "Mbit/s bezeichnet Millionen Bit pro Sekunde. Byte pro Sekunde, Speicherkapazität und Taktfrequenz sind andere Größen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-189",
    "category": "Hardware",
    "topic": "Hardware-Grundlagen",
    "difficulty": "medium",
    "question": "Was ist Firmware?",
    "answers": [
      "Mechanische Bauteile, die ohne gespeicherten Programmcode arbeiten",
      "Temporäre Benutzerprozesse, die nur im Arbeitsspeicher laufen",
      "Gerätenahe Software, die grundlegende Hardwarefunktionen steuert",
      "Dokumentdateien, die ausschließlich von Office-Programmen genutzt werden"
    ],
    "correctAnswer": 2,
    "explanation": "Firmware steuert grundlegende Funktionen von Hardware und liegt meist in nichtflüchtigem Speicher.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-190",
    "category": "Hardware",
    "topic": "Hardware-Grundlagen",
    "difficulty": "medium",
    "question": "Warum sollte die Stromversorgung während des Schreibens eines Firmware-Updates nicht unterbrochen werden?",
    "answers": [
      "Die Unterbrechung erhöht die vorgesehene Spannung der Speicherbausteine",
      "Die Unterbrechung führt bei jedem Gerät automatisch zur Wiederherstellung der alten Version",
      "Die Unterbrechung betrifft ausschließlich die gerade geöffneten Benutzerdateien",
      "Unvollständig geschriebener Firmwarecode kann den nächsten Gerätestart verhindern"
    ],
    "correctAnswer": 3,
    "explanation": "Wird startrelevanter Firmwarecode unvollständig geschrieben, kann das Gerät nicht mehr regulär starten. Ob ein Wiederherstellungsverfahren verfügbar ist, hängt vom Gerät ab.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-191",
    "category": "Hardware",
    "topic": "Beschaffung",
    "difficulty": "medium",
    "question": "Zwei Angebote nennen denselben Grundpreis für einen PC. Bei Angebot A sind Betriebssystemlizenz und Lieferung enthalten; bei B werden sie zusätzlich berechnet. Wie entsteht eine vergleichbare Preisgrundlage?",
    "answers": [
      "Die Kosten derselben benötigten Ausstattung einschließlich Lizenz und Lieferung gegenüberstellen.",
      "Ausschließlich die beiden identischen Grundpreise gegenüberstellen.",
      "Bei Angebot B nur die Lieferkosten berücksichtigen und die benötigte Lizenz ausklammern.",
      "Bei Angebot A die enthaltene Lizenz erneut aufschlagen und bei B den Grundpreis verwenden."
    ],
    "correctAnswer": 0,
    "explanation": "Vergleichbar sind die Preise für denselben benötigten Lieferumfang. Enthaltene Leistungen werden nicht doppelt berechnet, erforderliche Zusatzleistungen aber in beiden Angeboten berücksichtigt.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-192",
    "category": "Hardware",
    "topic": "Beschaffung",
    "difficulty": "medium",
    "question": "Hardware wird in 8 Kalendertagen geliefert. Danach benötigen Einrichtung und Test zusammen 3 weitere Kalendertage. Der Arbeitsplatz muss in 10 Kalendertagen bereitstehen; parallel kann nichts vorgezogen werden. Welche Aussage trifft zu?",
    "answers": [
      "Der Termin passt, weil die Lieferung vor dem zehnten Tag erfolgt",
      "Der Ablauf benötigt 11 Tage und überschreitet den Termin um einen Tag",
      "Der Ablauf benötigt 8 Tage, weil Einrichtung zur Lieferung zählt",
      "Der Ablauf benötigt 5 Tage, weil die Einrichtung von der Lieferzeit abgezogen wird"
    ],
    "correctAnswer": 1,
    "explanation": "Die aufeinanderfolgenden Schritte benötigen 8 + 3 = 11 Kalendertage. Der Bereitstellungstermin wird um einen Tag überschritten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-193",
    "category": "Hardware",
    "topic": "Beschaffung",
    "difficulty": "medium",
    "question": "Was beschreibt eine Mindestanforderung?",
    "answers": [
      "Ein Wunschmerkmal, das bei guter Gesamtbewertung entfallen darf",
      "Ein Bewertungskriterium, dessen Gewicht erst den Ausschluss bestimmt",
      "Eine verbindliche Eigenschaft, deren Nichterfüllung das Angebot ausschließt",
      "Ein optionaler Vorteil, der einen fehlenden Pflichtpunkt ausgleichen kann"
    ],
    "correctAnswer": 2,
    "explanation": "Mindestanforderungen sind Ausschlusskriterien, wenn sie nicht erfüllt werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-194",
    "category": "Hardware",
    "topic": "Beschaffung",
    "difficulty": "medium",
    "question": "Zwei Geräte erfüllen alle Muss-Kriterien. Gerät A kostet 900 € mit 3 Jahren Vor-Ort-Service, Gerät B 850 € mit 1 Jahr Bring-in-Service. Was ist die beste nächste Vorgehensweise?",
    "answers": [
      "Den Preisvorteil von 50 € als Nachweis geringerer Gesamtkosten verwenden",
      "Den längeren Service ohne Betrachtung der betrieblichen Anforderungen als ausschlaggebend werten",
      "Beide Servicearten wegen gleicher technischer Muss-Kriterien als gleichwertig behandeln",
      "Preis- und Serviceunterschiede anhand der festgelegten Anforderungen und Gewichtungen bewerten"
    ],
    "correctAnswer": 3,
    "explanation": "Wenn Muss-Kriterien erfüllt sind, sollten weitere gewichtete Kriterien die Entscheidung unterstützen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-195",
    "category": "Hardware",
    "topic": "Beschaffung",
    "difficulty": "medium",
    "question": "Was ist ein Vorteil standardisierter Arbeitsplatz-Hardware im Unternehmen?",
    "answers": [
      "Gemeinsame Treiber, Ersatzteile und Verfahren können den Betrieb vereinfachen",
      "Ein Standardmodell erfüllt ohne Prüfung jede fachliche Spezialanforderung",
      "Eine einheitliche Baureihe benötigt während ihrer Nutzung keine Firmwarepflege",
      "Die Standardisierung macht eine Anpassung an unterschiedliche Benutzeranforderungen entbehrlich"
    ],
    "correctAnswer": 0,
    "explanation": "Einheitliche Plattformen können Betrieb, Support und Ersatzteilmanagement vereinfachen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-196",
    "category": "Hardware",
    "topic": "Praxisfälle",
    "difficulty": "medium",
    "question": "Ein Dock besitzt drei Videoausgänge. Laut Hersteller unterstützt es an diesem Notebook gleichzeitig höchstens zwei Displays. Reichen die drei Buchsen für drei unabhängige Monitore?",
    "answers": [
      "Ja, die Buchsenanzahl bestimmt die gleichzeitige Displayanzahl",
      "Nein, die dokumentierte Grenze für diese Kombination beträgt zwei Displays",
      "Ja, ein passiver Splitter hebt die Grenze auf drei unabhängige Displays an",
      "Ja, eine niedrigere Desktop-Skalierung hebt die dokumentierte Displaygrenze auf"
    ],
    "correctAnswer": 1,
    "explanation": "Die Zahl physischer Buchsen ist keine Zusage für deren gleichzeitige Nutzung. Maßgeblich sind die freigegebenen Displaykonfigurationen für Notebook, Dock, Auflösungen und Bildraten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-197",
    "category": "Hardware",
    "topic": "Praxisfälle",
    "difficulty": "medium",
    "question": "Ein Arbeitsplatz soll besonders leise sein. Welche Maßnahme ist sinnvoll?",
    "answers": [
      "Die Lüfter auf eine feste niedrige Drehzahl einstellen, ohne den Betrieb unter Last zu prüfen.",
      "Die Auswahl auf einen kleinen Kühlkörper und hohe Lüfterdrehzahl für dieselbe Wärmelast ausrichten.",
      "Ausreichende Kühlfläche, geeignete Lüfter und eine temperaturabhängige Regelung vorsehen",
      "Die Lüfterregelung ausschließlich nach der Leerlauftemperatur auslegen."
    ],
    "correctAnswer": 2,
    "explanation": "Große effiziente Kühler können bei gleicher Kühlleistung mit niedrigeren Drehzahlen arbeiten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-198",
    "category": "Hardware",
    "topic": "Praxisfälle",
    "difficulty": "medium",
    "question": "Ein Büro-PC soll fünf Jahre eingesetzt werden. Welche Auswahlstrategie ist sinnvoll?",
    "answers": [
      "Die höchste heutige Benchmarkpunktzahl als alleinigen Nachweis für fünf Jahre Eignung verwenden",
      "Den niedrigsten Kaufpreis ohne Betrachtung späterer Wartungs- und Erweiterungskosten wählen",
      "Die Netzteil-Nennleistung als alleinige Reserve für sämtliche zukünftigen Anforderungen nutzen",
      "Erwartbaren Bedarf, Leistungsreserve, Wartbarkeit und verfügbare Erweiterungen gemeinsam bewerten"
    ],
    "correctAnswer": 3,
    "explanation": "Eine länger geplante Nutzung profitiert von Reserve, Wartbarkeit und passenden Erweiterungsmöglichkeiten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-199",
    "category": "Hardware",
    "topic": "Praxisfälle",
    "difficulty": "medium",
    "question": "Große Videodateien werden von einer externen SSD über USB 2.0 kopiert. Beide SSDs können wesentlich schneller arbeiten; die Quelle unterstützt auch einen schnelleren USB-Modus. Welche Aufrüstung beseitigt den beschriebenen Schnittstellenengpass?",
    "answers": [
      "Ein passender schnellerer USB-Port samt geeignetem Kabel",
      "Eine interne Ziel-SSD mit mehr Kapazität bei unveränderter USB-Verbindung",
      "Mehr CPU-Kerne bei unveränderter USB-Verbindung",
      "Eine Grafikkarte mit mehr VRAM bei unveränderter USB-Verbindung"
    ],
    "correctAnswer": 0,
    "explanation": "Die langsame USB-2.0-Verbindung begrenzt den Transfer. Ein gemeinsam unterstützter schnellerer Übertragungsmodus kann diesen Engpass verringern; anschließend können andere Grenzen maßgeblich werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-200",
    "category": "Hardware",
    "topic": "Praxisfälle",
    "difficulty": "medium",
    "question": "Ein PC wird hauptsächlich für Videokonferenzen eingesetzt. Welche Hardware ist besonders relevant?",
    "answers": [
      "Hohe Grafikleistung und großer lokaler Massenspeicher",
      "Geeignete Audio-/Videoperipherie und zuverlässige Netzwerkanbindung",
      "Hohe Monitorauflösung und besonders große Akkukapazität",
      "Viele Erweiterungssteckplätze und eine hohe Netzteil-Nennleistung"
    ],
    "correctAnswer": 1,
    "explanation": "Für Videokonferenzen sind geeignete Audio-/Video-Geräte und Netzwerkqualität entscheidend.",
    "source": "hardware.csv"
  },
  {
    "id": "netzwerk-001",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe übernimmt ein Router hauptsächlich?",
    "answers": [
      "Er verbindet unterschiedliche IP-Netze und leitet Pakete zwischen ihnen weiter",
      "Er vermittelt Ethernet-Frames innerhalb eines VLANs anhand der Ziel-MAC-Adresse.",
      "Er weist Clients zeitlich begrenzte IP-Konfigurationen zu.",
      "Er beantwortet Anfragen zur Auflösung von DNS-Namen."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Router arbeitet zwischen unterschiedlichen IP-Netzen und entscheidet anhand seiner Routinginformationen, wohin Pakete weitergeleitet werden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-002",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Information benötigt ein Host, um ein Ziel in einem anderen IPv4-Netz zu erreichen?",
    "answers": [
      "Die Adresse eines geeigneten Standardgateways",
      "Die MAC-Adresse jedes Routers im Internet",
      "Die Seriennummer des Zielgeräts",
      "Die lokale Benutzerkennung des Zielsystems"
    ],
    "correctAnswer": 0,
    "explanation": "Für Ziele außerhalb des eigenen Subnetzes sendet ein Host die Pakete normalerweise an sein Standardgateway.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-003",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Wozu dient die Subnetzmaske beziehungsweise Präfixlänge bei IPv4?",
    "answers": [
      "Sie trennt den Netzanteil vom Hostanteil einer IP-Adresse",
      "Sie legt unabhängig von der IP-Adresse die Adresse des Standardgateways fest.",
      "Sie legt fest, welcher TCP-Port für Verbindungen ins Zielnetz verwendet wird.",
      "Sie bestimmt unabhängig von der IP-Adresse die Adresse des DNS-Servers."
    ],
    "correctAnswer": 0,
    "explanation": "Die Subnetzmaske beziehungsweise Präfixlänge legt fest, welcher Teil einer IP-Adresse das Netz und welcher Teil den Host beschreibt.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-004",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat DHCP in einem typischen LAN?",
    "answers": [
      "Es kann Clients automatisch Netzwerkkonfigurationen wie IP-Adresse, Subnetzmaske und Gateway zuweisen",
      "Es ordnet angefragten Hostnamen die zugehörigen DNS-Ressourceneinträge zu.",
      "Es übersetzt private Quelladressen und Ports am Übergang ins Internet.",
      "Es ermittelt die Ziel-MAC-Adresse für eine bekannte lokale IPv4-Adresse."
    ],
    "correctAnswer": 0,
    "explanation": "DHCP automatisiert die Vergabe wichtiger Netzwerkeinstellungen und reduziert dadurch den manuellen Konfigurationsaufwand.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-005",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe übernimmt DNS hauptsächlich?",
    "answers": [
      "Es löst Namen wie server.example in IP-Adressen auf",
      "Es verteilt IPv4-Adressen und weitere Konfigurationswerte als zeitlich begrenzte Leases.",
      "Es ermittelt zu einer lokalen IPv4-Adresse die Ethernet-MAC-Adresse.",
      "Es wählt für jedes IP-Paket den nächsten Router aus."
    ],
    "correctAnswer": 0,
    "explanation": "DNS ordnet menschenlesbare Namen den zugehörigen IP-Adressen beziehungsweise anderen DNS-Ressourceneinträgen zu.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-006",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein PC kann die IP-Adresse eines Webservers erreichen, aber dessen Hostname nicht auflösen. Welcher Dienst sollte zuerst überprüft werden?",
    "answers": [
      "DNS",
      "DHCP",
      "NTP",
      "SNMP"
    ],
    "correctAnswer": 0,
    "explanation": "Wenn die Kommunikation per IP funktioniert, aber die Namensauflösung fehlschlägt, liegt der Verdacht besonders auf der DNS-Konfiguration oder dem DNS-Dienst.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-007",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aussage beschreibt ARP in einem IPv4-LAN am besten?",
    "answers": [
      "ARP ermittelt zu einer bekannten IPv4-Adresse die zugehörige MAC-Adresse im lokalen Netz",
      "ARP ermittelt die IPv4-Adresse zu einem DNS-Hostnamen.",
      "ARP weist einem neuen Client eine freie IPv4-Adresse als Lease zu.",
      "ARP bestimmt die IP-Adresse des Routers für ein entferntes Zielnetz."
    ],
    "correctAnswer": 0,
    "explanation": "ARP wird im lokalen IPv4-Netz verwendet, um die MAC-Adresse zu einer bekannten IP-Adresse zu ermitteln.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-008",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Eigenschaft stellt TCP selbst bereit, die UDP selbst nicht bereitstellt?",
    "answers": [
      "Einen geordneten, zuverlässigen Bytestrom zwischen den Endpunkten.",
      "Die Erhaltung von Nachrichtengrenzen durch einzelne Datagramme.",
      "Die Übertragung ohne vorherigen Verbindungsaufbau.",
      "Einen festen Transportheader von nur acht Byte."
    ],
    "correctAnswer": 0,
    "explanation": "TCP ordnet empfangene Daten und wiederholt bei Bedarf Übertragungen innerhalb einer Verbindung. UDP bietet Datagramme ohne eigene Zustell- oder Reihenfolgegarantie; Anwendungen können zusätzliche Verfahren implementieren.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-009",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Mehrere Gruppen von Switch-Ports sollen auf derselben Infrastruktur getrennte Layer-2-Broadcast-Domänen bilden. Welche Technik ist dafür vorgesehen?",
    "answers": [
      "VLAN",
      "Link Aggregation",
      "Port Mirroring",
      "Network Address Translation"
    ],
    "correctAnswer": 0,
    "explanation": "VLANs ermöglichen die logische Trennung von Broadcast-Domänen auf gemeinsam genutzter Switch-Hardware.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-010",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Host mit der Adresse 192.168.10.130/26 möchte 192.168.10.190 erreichen. Welche Aussage ist korrekt?",
    "answers": [
      "Beide Adressen liegen im selben /26-Subnetz",
      "Die Adressen liegen in unterschiedlichen /26-Subnetzen und benötigen für die Kommunikation einen Router",
      "192.168.10.190 ist die Netzadresse des Subnetzes",
      "192.168.10.130 ist eine Broadcastadresse"
    ],
    "correctAnswer": 0,
    "explanation": "Ein /26-Netz besitzt Blöcke zu 64 Adressen. Der Bereich 192.168.10.128 bis 192.168.10.191 gehört zu demselben Subnetz, daher liegen beide Hosts im gleichen Netz.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-011",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Switch empfängt einen Ethernet-Frame mit einer Ziel-MAC-Adresse, die noch nicht in seiner MAC-Tabelle bekannt ist. Wie verhält er sich normalerweise?",
    "answers": [
      "Er sendet den Frame über alle geeigneten Ports des VLANs außer dem Eingangsport",
      "Er verwirft den Frame immer sofort",
      "Er sendet den Frame ausschließlich an das Standardgateway",
      "Er ersetzt die Ziel-MAC-Adresse durch eine Broadcastadresse"
    ],
    "correctAnswer": 0,
    "explanation": "Bei einem unbekannten Unicast-Ziel führt ein Switch normalerweise Flooding innerhalb des betreffenden VLANs durch, bis er die Ziel-MAC gelernt hat.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-012",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein DHCP-Client erreicht Geräte und den DNS-Server im eigenen IPv4-Subnetz. Ziele in anderen Netzen sind nicht erreichbar; dafür sind keine spezifischen Routen eingerichtet. Welcher Eintrag sollte zuerst geprüft werden?",
    "answers": [
      "Das konfigurierte Standardgateway.",
      "Der konfigurierte DNS-Suchsuffix.",
      "Die lokale Zuordnung des eigenen Hostnamens.",
      "Der für die Namensauflösung verwendete DNS-Cache."
    ],
    "correctAnswer": 0,
    "explanation": "Für entfernte Netze wird hier die Standardroute benötigt. Ein fehlendes oder falsches Gateway ist ein begründeter Prüfpunkt; auch Routing- oder Filterprobleme können die Erreichbarkeit verhindern.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-013",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Zwei private IPv4-Clients verbinden sich gleichzeitig mit derselben Server-IP und demselben TCP-Zielport. Beide nutzen per PAT dieselbe öffentliche IPv4-Adresse. Wie werden ihre Verbindungen dort unterschieden?",
    "answers": [
      "Durch unterschiedliche übersetzte TCP-Quellports.",
      "Durch denselben TCP-Quellport bei unveränderten übrigen Verbindungsdaten.",
      "Durch die privaten Quell-IP-Adressen als zusätzliche Felder im TCP-Header.",
      "Durch abwechselnde Nutzung derselben Verbindung ohne getrennte Zuordnung."
    ],
    "correctAnswer": 0,
    "explanation": "Für diese Verbindungen müssen sich die externen Quellports unterscheiden. Die PAT-Tabelle ordnet die Rückpakete den internen IP-Adressen und Ports zu.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-014",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Zwei Switches sind mit einer Verbindung gekoppelt, über die mehrere VLANs transportiert werden sollen. Welche Konfiguration ist dafür typischerweise erforderlich?",
    "answers": [
      "Ein Trunk-Link mit VLAN-Kennzeichnung, zum Beispiel nach IEEE 802.1Q",
      "Ein ausschließlich ungetaggter Access-Port für genau ein VLAN",
      "Eine Link-Aggregation ohne Konfiguration der benötigten VLANs.",
      "Eine Portspiegelung des Verkehrs auf den zweiten Switch."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Trunk transportiert Verkehr mehrerer VLANs über eine gemeinsame Verbindung. IEEE 802.1Q kennzeichnet Frames dabei mit VLAN-Informationen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-015",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Hauptaufgabe erfüllt ein gewöhnlicher Layer-2-Switch in einem Ethernet-Netz?",
    "answers": [
      "Er leitet Frames anhand von MAC-Adressen gezielt an passende Ports weiter",
      "Er verteilt IP-Adressen mit zeitlich begrenzten Leases.",
      "Er wählt Routen zwischen unterschiedlichen IP-Subnetzen anhand der Ziel-IP-Adresse.",
      "Er beantwortet DNS-Abfragen aus einer Zone oder einem Resolvercache."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Switch lernt MAC-Adressen an seinen Ports und leitet Ethernet-Frames gezielt innerhalb des lokalen Netzes weiter.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-016",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Hauptaufgabe hat eine Portnummer bei TCP oder UDP?",
    "answers": [
      "Sie identifiziert einen Prozess bzw. Dienst auf einem Host.",
      "Sie identifiziert den Hersteller der Netzwerkkarte.",
      "Sie legt die Subnetzmaske des Zielnetzes fest.",
      "Sie bestimmt den nächsten Router im Netzwerk."
    ],
    "correctAnswer": 0,
    "explanation": "Ports gehören zur Transportschicht und helfen dem Betriebssystem, Daten dem richtigen Prozess oder Dienst zuzuordnen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-017",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welches Protokoll dient typischerweise der Übertragung von E-Mails zwischen Mailservern?",
    "answers": [
      "IMAP",
      "SMTP",
      "POP3",
      "HTTP"
    ],
    "correctAnswer": 1,
    "explanation": "SMTP ist das Anwendungsprotokoll zum Senden und Weiterleiten von E-Mails.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-018",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welcher Unterschied zwischen IMAP und POP3 ist für mehrere Endgeräte besonders wichtig?",
    "answers": [
      "IMAP verwaltet Ordner und Zustände auf dem Server; POP3 bietet dafür keine vergleichbare Ordnersynchronisation.",
      "POP3 synchronisiert serverseitige Ordner und Lesemarkierungen; IMAP bietet nur den Download einzelner Nachrichten.",
      "IMAP verwaltet nur ausgehende Nachrichten; POP3 synchronisiert die empfangenen Nachrichten zwischen Geräten.",
      "Beide Protokolle gleichen Ordner und Lesemarkierungen auf mehreren Geräten auf dieselbe Weise ab."
    ],
    "correctAnswer": 0,
    "explanation": "IMAP ermöglicht serverseitige Mailordner und Statusinformationen. POP3 dient primär dem Abruf von Nachrichten und bietet keine entsprechende Synchronisation von Ordnern und Lesestatus.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-019",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Standardportnummer ist HTTPS zugeordnet?",
    "answers": [
      "22",
      "53",
      "80",
      "443"
    ],
    "correctAnswer": 3,
    "explanation": "HTTPS verwendet standardmäßig Port 443. HTTP/1.1 und HTTP/2 nutzen dafür üblicherweise TLS über TCP; HTTP/3 verwendet QUIC über UDP.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-020",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Standardportnummer ist HTTP zugeordnet?",
    "answers": [
      "25",
      "53",
      "80",
      "443"
    ],
    "correctAnswer": 2,
    "explanation": "HTTP verwendet standardmäßig TCP-Port 80.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-021",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Standardportnummer ist SSH zugeordnet?",
    "answers": [
      "21",
      "22",
      "23",
      "25"
    ],
    "correctAnswer": 1,
    "explanation": "SSH verwendet standardmäßig TCP-Port 22.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-022",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Standardportnummer wird typischerweise für DNS verwendet?",
    "answers": [
      "25",
      "53",
      "67",
      "110"
    ],
    "correctAnswer": 1,
    "explanation": "DNS verwendet Port 53, je nach Vorgang über UDP oder TCP.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-023",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum kann derselbe Portnummernwert sowohl bei TCP als auch bei UDP existieren?",
    "answers": [
      "TCP und UDP besitzen getrennte Portnummernräume.",
      "Ein Dienst muss bei TCP und UDP zwingend dieselbe Portnummer verwenden.",
      "Ein belegter TCP-Port blockiert automatisch dieselbe Portnummer für UDP.",
      "Die Portnummer allein legt eindeutig fest, ob TCP oder UDP verwendet wird."
    ],
    "correctAnswer": 0,
    "explanation": "TCP und UDP sind unterschiedliche Transportprotokolle und verwalten ihre Portnummern jeweils separat.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-024",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Client verbindet sich von 192.168.5.20:53142 mit einem HTTPS-Server auf 203.0.113.10:443. Wofür steht 53142?",
    "answers": [
      "Für die dynamische Quellportnummer des Clients.",
      "Für die Quellportnummer des Servers in diesem Verbindungsaufbau.",
      "Für die Zielportnummer des HTTPS-Dienstes auf dem Server.",
      "Für eine allgemein reservierte Standardportnummer des HTTPS-Protokolls."
    ],
    "correctAnswer": 0,
    "explanation": "Der Client verwendet üblicherweise eine dynamische bzw. ephemere Quellportnummer, während der Server auf dem bekannten Zielport 443 lauscht.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-025",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Zuordnung beschreibt Ziel-IP-Adresse und TCP-Zielport bei einer Verbindung zu einem Server?",
    "answers": [
      "Ziel-IP: adressiertes System; Zielport: angesprochener Dienst auf diesem System.",
      "Ziel-IP: angesprochener Dienst; Zielport: adressiertes System.",
      "Ziel-IP: nächster Router; Zielport: physischer Anschluss am Switch.",
      "Ziel-IP: sendendes System; Zielport: Quellport des Clients."
    ],
    "correctAnswer": 0,
    "explanation": "Die IP-Adresse adressiert den Netzwerkendpunkt. Der TCP-Zielport ermöglicht dort die Zuordnung zum angesprochenen Dienst.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-026",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Auf welcher OSI-Schicht arbeiten TCP und UDP?",
    "answers": [
      "Schicht 2 – Sicherung",
      "Schicht 3 – Vermittlung",
      "Schicht 4 – Transport",
      "Schicht 7 – Anwendung"
    ],
    "correctAnswer": 2,
    "explanation": "TCP und UDP sind Transportprotokolle und gehören zur OSI-Schicht 4.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-027",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Auf welcher OSI-Schicht arbeitet IPv4 hauptsächlich?",
    "answers": [
      "Schicht 1",
      "Schicht 2",
      "Schicht 3",
      "Schicht 4"
    ],
    "correctAnswer": 2,
    "explanation": "IPv4 gehört zur Vermittlungsschicht bzw. Network Layer, also OSI-Schicht 3.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-028",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Adresse ist typisch für die OSI-Schicht 2?",
    "answers": [
      "MAC-Adresse",
      "IPv4-Adresse",
      "TCP-Port",
      "DNS-Name"
    ],
    "correctAnswer": 0,
    "explanation": "Ethernet und MAC-Adressen gehören zur Sicherungsschicht, also Layer 2.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-029",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Zuordnung ist korrekt?",
    "answers": [
      "Switch – Layer 2 – MAC-Adresse",
      "Switch – Layer 3 – TCP-Port",
      "Router – Layer 2 – DNS-Name",
      "Router – Layer 4 – MAC-Adresse"
    ],
    "correctAnswer": 0,
    "explanation": "Ein klassischer Layer-2-Switch leitet Frames anhand von MAC-Adressen weiter.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-030",
    "category": "Netzwerk",
    "topic": "Routing",
    "difficulty": "medium",
    "question": "Ein Router hat passende Routen für 10.0.0.0/8, 10.20.0.0/16, 10.20.30.0/24 sowie eine Standardroute. Welche Route wählt er für 10.20.30.40 nach Longest Prefix Match?",
    "answers": [
      "10.20.30.0/24",
      "10.20.0.0/16",
      "10.0.0.0/8",
      "0.0.0.0/0"
    ],
    "correctAnswer": 0,
    "explanation": "Bei der Zielsuche wird die passende Route mit dem längsten Präfix verwendet. Hier stimmt das /24-Präfix am spezifischsten mit dem Ziel überein.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-031",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welches Protokoll verwendet der Befehl ping bei IPv4?",
    "answers": [
      "ARP",
      "ICMPv4",
      "TCP",
      "UDP"
    ],
    "correctAnswer": 1,
    "explanation": "ping verwendet ICMP Echo Request und Echo Reply.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-032",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche ICMPv4-Nachricht meldet bei traceroute typischerweise, dass die TTL eines Pakets unterwegs abgelaufen ist?",
    "answers": [
      "Time Exceeded",
      "Destination Unreachable",
      "Echo Reply",
      "Redirect"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Router verwirft ein Paket, dessen TTL beim Weiterleiten abläuft, und kann ICMP Time Exceeded zurücksenden. Aus solchen Antworten lassen sich Zwischenstationen erkennen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-033",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat das TTL-Feld in IPv4?",
    "answers": [
      "Es begrenzt, wie viele Router ein Paket durchlaufen kann.",
      "Es gibt die verbleibende Nutzdatenlänge des IP-Pakets an.",
      "Es enthält die Routingkosten bis zum Zielnetz.",
      "Es legt die Prioritätsklasse des IP-Pakets fest."
    ],
    "correctAnswer": 0,
    "explanation": "Jeder Router reduziert TTL. Bei 0 wird das Paket verworfen, damit es nicht endlos im Netz zirkuliert.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-034",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Wie ermittelt traceroute Zwischenstationen auf einem IP-Pfad?",
    "answers": [
      "Es erhöht TTL beziehungsweise Hop Limit der Proben schrittweise und wertet ICMP-Antworten aus.",
      "Es fragt die vollständige Routingtabelle ausschließlich beim Zielhost ab.",
      "Es liest die MAC-Tabellen aller Switches entlang des Pfads aus.",
      "Es bestimmt Routeradressen aus den Quellports der Zielanwendung."
    ],
    "correctAnswer": 0,
    "explanation": "Zwischenrouter können beim Ablauf von TTL oder Hop Limit eine ICMP-Fehlermeldung senden. Fehlende Antworten sind möglich, etwa durch Filterung oder Ratenbegrenzung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-035",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Windows-Client erhält keine DHCPv4-Konfiguration und verwendet APIPA. Aus welchem Bereich stammt seine automatisch gewählte Link-Local-Adresse?",
    "answers": [
      "169.254.0.0/16",
      "127.0.0.0/8",
      "172.16.0.0/12",
      "224.0.0.0/4"
    ],
    "correctAnswer": 0,
    "explanation": "APIPA verwendet IPv4-Link-Local-Adressen aus 169.254.0.0/16, wenn keine passende DHCP-Konfiguration verfügbar ist. Damit ist Kommunikation auf dem lokalen Link möglich, aber kein reguläres Routing ins Internet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-036",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Windows-Client erhält 169.254.44.18/16. Was ist die wahrscheinlichste Ursache?",
    "answers": [
      "Der Client konnte keinen DHCP-Server erreichen.",
      "Der DNS-Server hat einen falschen A-Record geliefert.",
      "Der Router hat den TCP-Port 443 blockiert.",
      "Der Switch hat automatisch ein /16-VLAN erzeugt."
    ],
    "correctAnswer": 0,
    "explanation": "Eine APIPA-Adresse deutet typischerweise darauf hin, dass die automatische DHCP-Konfiguration nicht erfolgreich war.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-037",
    "category": "Netzwerk",
    "topic": "DHCP",
    "difficulty": "medium",
    "question": "Welche Reihenfolge beschreibt einen typischen erfolgreichen erstmaligen DHCPv4-Lease-Bezug?",
    "answers": [
      "DHCPDISCOVER → DHCPOFFER → DHCPREQUEST → DHCPACK",
      "DHCPREQUEST → DHCPDISCOVER → DHCPACK → DHCPOFFER",
      "DHCPOFFER → DHCPACK → DHCPDISCOVER → DHCPREQUEST",
      "DHCPDISCOVER → DHCPREQUEST → DHCPOFFER → DHCPACK"
    ],
    "correctAnswer": 0,
    "explanation": "Der Client sucht Server, erhält Angebote, fordert eine angebotene Konfiguration an und erhält die Bestätigung. Eine Verlängerung kann anders ablaufen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-038",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche UDP-Ports nutzt DHCPv4 für Server und Client?",
    "answers": [
      "53 und 54",
      "67 und 68",
      "80 und 443",
      "110 und 143"
    ],
    "correctAnswer": 1,
    "explanation": "DHCP nutzt typischerweise UDP 67 auf Serverseite und UDP 68 auf Clientseite.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-039",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "medium",
    "question": "Welcher DNS-Ressourceneintrag ordnet einem Hostnamen eine IPv6-Adresse zu?",
    "answers": [
      "AAAA",
      "A",
      "MX",
      "PTR"
    ],
    "correctAnswer": 0,
    "explanation": "AAAA enthält eine IPv6-Adresse. A enthält eine IPv4-Adresse, MX nennt Mailserver und PTR wird unter anderem für Rückwärtsauflösung verwendet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-040",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein DNS-Client erhält über UDP eine Antwort mit gesetztem TC-Bit. Wie kann er die vollständige Antwort regulär erneut anfordern?",
    "answers": [
      "Er wiederholt die Anfrage über TCP.",
      "Er verwendet die abgeschnittene Antwort als vollständigen Datensatz.",
      "Er behandelt das TC-Bit als Nachweis, dass der angefragte Name nicht existiert.",
      "Er fragt denselben Namen mit einem anderen Record-Typ ab, um den ursprünglichen Datensatz unverändert zu erhalten."
    ],
    "correctAnswer": 0,
    "explanation": "TC kennzeichnet eine abgeschnittene DNS-Antwort. Die Wiederholung über TCP ermöglicht die vollständige Übertragung; DNS unterstützt beide Transportprotokolle.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-041",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Ethernet-Host benötigt die MAC-Adresse einer lokalen IPv4-Zieladresse und hat keinen passenden ARP-Eintrag. An welche Ethernet-Zieladresse sendet er die gewöhnliche ARP-Anfrage?",
    "answers": [
      "An ff:ff:ff:ff:ff:ff als Broadcast.",
      "An die eigene MAC-Adresse als Unicast.",
      "An die MAC-Adresse des DNS-Servers als Unicast.",
      "An die MAC-Adresse des Standardgateways als Unicast."
    ],
    "correctAnswer": 0,
    "explanation": "Die Broadcast-Anfrage erreicht die Teilnehmer des lokalen Broadcast-Bereichs. Der gesuchte Teilnehmer kann mit seiner MAC-Adresse antworten.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-042",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Zwei Hosts liegen im selben IPv4-Subnetz auf einem gemeinsamen Ethernet-Link. Welche Ziel-MAC verwendet der sendende Host für einen Unicast an den anderen?",
    "answers": [
      "Die MAC-Adresse des Zielhosts.",
      "Die MAC-Adresse des Standardgateways.",
      "Die MAC-Adresse des DNS-Servers.",
      "Die eigene MAC-Adresse."
    ],
    "correctAnswer": 0,
    "explanation": "Bei einem direkt erreichbaren Ziel wird dessen MAC-Adresse verwendet. Falls sie noch nicht im Cache steht, kann ARP sie ermitteln.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-043",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein IPv4-Host sendet einen Unicast an ein entferntes Netz. Die passende Route führt über das lokale Standardgateway. Welche Ziel-MAC-Adresse verwendet der erste Ethernet-Frame?",
    "answers": [
      "Die MAC-Adresse des Standardgateways.",
      "Die MAC-Adresse des entfernten Zielhosts.",
      "Die MAC-Adresse des lokalen DNS-Servers.",
      "Die MAC-Adresse des sendenden Hosts."
    ],
    "correctAnswer": 0,
    "explanation": "Die Ziel-IP-Adresse bleibt die des entfernten Hosts. Auf dem ersten Ethernet-Link ist das Gateway der nächste Hop und damit das MAC-Ziel.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-044",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Wann verwendet ein IPv4-Host eine vorhandene Standardroute?",
    "answers": [
      "Wenn keine spezifischere passende Route für das Ziel vorhanden ist.",
      "Wenn die Standardroute als erster Eintrag in der angezeigten Tabelle steht.",
      "Wenn ihre Metrik niedriger als die einer spezifischeren passenden Route ist.",
      "Immer wenn das Ziel nicht lokal ist, auch bei einer passenden spezifischeren Route."
    ],
    "correctAnswer": 0,
    "explanation": "Die Standardroute deckt Ziele ab, für die keine spezifischere passende Route gewählt wird. Sie verweist häufig auf einen Router im lokalen Netz.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-045",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Wie viele Bits hat eine IPv4-Adresse?",
    "answers": [
      "16",
      "32",
      "48",
      "128"
    ],
    "correctAnswer": 1,
    "explanation": "IPv4-Adressen bestehen aus 32 Bits.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-046",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Wie viele Bits hat eine klassische MAC-Adresse bei Ethernet?",
    "answers": [
      "32",
      "40",
      "48",
      "64"
    ],
    "correctAnswer": 2,
    "explanation": "Eine klassische Ethernet-MAC-Adresse ist 48 Bit bzw. 6 Byte lang.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-047",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Subnetzmaske entspricht /26?",
    "answers": [
      "255.255.255.64",
      "255.255.255.128",
      "255.255.255.192",
      "255.255.255.224"
    ],
    "correctAnswer": 2,
    "explanation": "/26 bedeutet 26 gesetzte Bits: 255.255.255.192.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-048",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Wie groß ist die Blockgröße im letzten Oktett bei einem /27-Subnetz?",
    "answers": [
      "16",
      "32",
      "64",
      "128"
    ],
    "correctAnswer": 1,
    "explanation": "/27 hat 5 Hostbits, also 32 Adressen pro Block.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-049",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welches Netz enthält die Adresse 192.168.20.150/26?",
    "answers": [
      "192.168.20.64/26",
      "192.168.20.128/26",
      "192.168.20.150/26",
      "192.168.20.192/26"
    ],
    "correctAnswer": 1,
    "explanation": "Bei /26 sind die Blöcke 0–63, 64–127, 128–191 und 192–255. 150 liegt im Netz 128/26.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-050",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "hard",
    "question": "Welche Broadcast-Adresse gehört zu 10.10.8.173/27?",
    "answers": [
      "10.10.8.159",
      "10.10.8.175",
      "10.10.8.191",
      "10.10.8.223"
    ],
    "correctAnswer": 2,
    "explanation": "Die /27-Blöcke sind 32 Adressen groß. 173 liegt im Block 160–191, dessen Broadcast 191 ist.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-051",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Wie viele nutzbare Hostadressen hat ein klassisches IPv4-/26-Subnetz?",
    "answers": [
      "30",
      "62",
      "64",
      "126"
    ],
    "correctAnswer": 1,
    "explanation": "Ein IPv4-/26-Subnetz enthält 64 Adressen. Im klassischen Subnetzmodell sind Netz- und Broadcastadresse nicht für Hosts nutzbar; es bleiben 62 Hostadressen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-052",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein IPv4-/24-Netz wird vollständig in /28-Netze zerlegt. Wie viele /28-Subnetze entstehen?",
    "answers": [
      "4",
      "8",
      "16",
      "32"
    ],
    "correctAnswer": 2,
    "explanation": "Von /24 auf /28 werden 4 zusätzliche Netzbits verwendet: 2^4 = 16 Subnetze.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-053",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ermöglicht VLSM bei der Planung von IPv4-Subnetzen?",
    "answers": [
      "Unterschiedliche Präfixlängen innerhalb eines größeren Adressblocks.",
      "Eine einzige feste Präfixlänge für alle Teilnetze eines Adressblocks.",
      "Überlappende Hostbereiche ohne zusätzliche Trennung der Netze.",
      "Eine identische Broadcastadresse für alle geplanten Teilnetze."
    ],
    "correctAnswer": 0,
    "explanation": "Mit Variable Length Subnet Masking werden unterschiedlich große, nicht überlappende Subnetze an den jeweiligen Adressbedarf angepasst.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-054",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Host hat 192.168.30.150/26. Welches Ziel betrachtet er als lokal?",
    "answers": [
      "192.168.30.20",
      "192.168.30.100",
      "192.168.30.130",
      "192.168.30.220"
    ],
    "correctAnswer": 2,
    "explanation": "192.168.30.150/26 liegt im Netz 128–191. Daher ist 130 lokal erreichbar.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-055",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "hard",
    "question": "PC-A hat 10.0.0.20/24 und PC-B 10.0.0.130/25 auf demselben Ethernet-Link. Es gibt keine weiteren Routen und keinen Router. Warum können ihre lokalen Erreichbarkeitsentscheidungen voneinander abweichen?",
    "answers": [
      "A betrachtet B als lokal, B betrachtet A als entfernt.",
      "Beide betrachten den jeweils anderen als direkt lokal erreichbar.",
      "A betrachtet B als entfernt, während B A als lokal betrachtet.",
      "Beide betrachten den jeweils anderen als außerhalb ihres lokalen Netzes."
    ],
    "correctAnswer": 0,
    "explanation": "A verwendet 10.0.0.0/24 und betrachtet .130 als lokal. B verwendet 10.0.0.128/25; .20 liegt außerhalb dieses Netzes. Ohne passende Route unterscheiden sich ihre Entscheidungen über den nächsten Hop.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-056",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist die Netzadresse von 192.168.50.70/26?",
    "answers": [
      "192.168.50.0",
      "192.168.50.64",
      "192.168.50.70",
      "192.168.50.127"
    ],
    "correctAnswer": 1,
    "explanation": "70 liegt im /26-Block 64–127, daher ist 192.168.50.64 die Netzadresse.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-057",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist die Broadcast-Adresse des Netzes 192.168.50.64/26?",
    "answers": [
      "192.168.50.63",
      "192.168.50.126",
      "192.168.50.127",
      "192.168.50.128"
    ],
    "correctAnswer": 2,
    "explanation": "Der Block reicht von 64 bis 127. Die letzte Adresse ist die Broadcast-Adresse.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-058",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche IPv4-Adressbereiche sind privat?",
    "answers": [
      "10.0.0.0/8, 172.16.0.0/12 und 192.168.0.0/16",
      "11.0.0.0/8, 172.0.0.0/8 und 193.168.0.0/16",
      "100.0.0.0/8, 169.254.0.0/16 und 224.0.0.0/4",
      "127.0.0.0/8, 192.0.0.0/8 und 240.0.0.0/4"
    ],
    "correctAnswer": 0,
    "explanation": "Diese drei Bereiche sind für private IPv4-Netze reserviert.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-059",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist 127.0.0.1?",
    "answers": [
      "Eine typische IPv4-Loopback-Adresse.",
      "Die erste öffentliche IPv4-Adresse eines Routers.",
      "Eine APIPA-Adresse.",
      "Eine Multicast-Adresse."
    ],
    "correctAnswer": 0,
    "explanation": "127.0.0.1 bezeichnet üblicherweise localhost über die Loopback-Schnittstelle.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-060",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Was testet ping localhost in erster Linie?",
    "answers": [
      "Die lokale TCP/IP-Implementierung bzw. Loopback-Funktion.",
      "Die Verbindung zum Default Gateway.",
      "Die DNS-Auflösung im Internet.",
      "Die physische Verbindung zum Switch."
    ],
    "correctAnswer": 0,
    "explanation": "Loopback-Pakete verlassen den Rechner nicht. Damit wird vor allem der lokale Netzwerkstack getestet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-061",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist der Hauptunterschied zwischen einem Hub und einem Switch?",
    "answers": [
      "Ein Hub wiederholt Signale an die anderen Ports; ein Switch kann bekannte Unicast-Ziele gezielt weiterleiten.",
      "Ein Hub lernt Quell-MAC-Adressen; ein Switch wiederholt jedes Signal unverändert.",
      "Ein Hub trennt die Kollisionsdomänen seiner Ports; ein Switch fasst sie zu einer gemeinsamen zusammen.",
      "Ein Hub und ein Switch leiten jeden Unicast unabhängig von der Zieladresse an alle anderen Ports weiter."
    ],
    "correctAnswer": 0,
    "explanation": "Hubs arbeiten als einfache Wiederholer, Switches lernen MAC-Adressen und trennen Kollisionsdomänen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-062",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist eine Kollisionsdomäne bei einem klassischen Ethernet-Hub?",
    "answers": [
      "Alle angeschlossenen Geräte teilen sich dieselbe Kollisionsdomäne.",
      "Jeder Hub-Port bildet immer eine eigene Kollisionsdomäne.",
      "Nur der Router gehört zur Kollisionsdomäne.",
      "Eine Kollisionsdomäne entspricht immer exakt einem VLAN."
    ],
    "correctAnswer": 0,
    "explanation": "Bei einem Hub teilen alle angeschlossenen Stationen das gemeinsame Medium und damit die Kollisionsdomäne.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-063",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Wozu dient CSMA/CD in klassischem gemeinsam genutztem Ethernet?",
    "answers": [
      "Kollisionen erkennen und nach einem Verfahren erneut senden.",
      "Feste Zeitschlitze zentral an alle sendebereiten Stationen verteilen.",
      "Das Senderecht mit einem umlaufenden Token weiterreichen.",
      "Für jede Station dauerhaft eine eigene Frequenz reservieren."
    ],
    "correctAnswer": 0,
    "explanation": "CSMA/CD regelt den Zugriff auf ein gemeinsam genutztes Ethernet-Medium und das Verhalten nach Kollisionen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-064",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum spielt CSMA/CD in modernen Full-Duplex-Switch-Netzen praktisch keine Rolle mehr?",
    "answers": [
      "Weil Punkt-zu-Punkt-Full-Duplex-Verbindungen keine klassischen Ethernet-Kollisionen erzeugen.",
      "Weil Full-Duplex-Ethernet vor jedem Frame ein Token vom Switch anfordert.",
      "Weil Full-Duplex-Ethernet Kollisionen ausschließlich durch zufällige Wartezeiten vermeidet.",
      "Weil Full-Duplex-Ethernet beide Richtungen in feste, abwechselnde Zeitschlitze aufteilt."
    ],
    "correctAnswer": 0,
    "explanation": "Bei Full-Duplex sendet und empfängt jede Verbindung gleichzeitig ohne gemeinsames Kollisionsmedium.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-065",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Switch empfängt an Port 3 einen Frame mit Quell-MAC A und Ziel-MAC B. Welchen dynamischen Eintrag kann er daraus unmittelbar lernen?",
    "answers": [
      "MAC A ist über Port 3 erreichbar.",
      "MAC B ist über Port 3 erreichbar.",
      "MAC A ist über den Port des Standardgateways erreichbar.",
      "MAC B ist über jeden Port des VLANs erreichbar."
    ],
    "correctAnswer": 0,
    "explanation": "Der Switch lernt aus Quell-MAC, Eingangsport und VLAN. Die Ziel-MAC dient anschließend zur Weiterleitungsentscheidung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-066",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Switch empfängt einen Unicast-Frame an Port 3. Die Ziel-MAC ist im selben VLAN ebenfalls an Port 3 gelernt. Wie behandelt ein gewöhnlicher Layer-2-Switch diesen Frame?",
    "answers": [
      "Er leitet ihn nicht über einen anderen Port weiter.",
      "Er flutet ihn über alle anderen Ports des VLANs.",
      "Er sendet ihn unverändert über Port 3 zurück.",
      "Er ersetzt die Zieladresse durch die MAC-Adresse des Routers."
    ],
    "correctAnswer": 0,
    "explanation": "Der Zielteilnehmer liegt nach der Tabelle am selben Port wie die Quelle. Eine zusätzliche Weiterleitung durch den Switch ist deshalb nicht erforderlich.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-067",
    "category": "Netzwerk",
    "topic": "VLAN",
    "difficulty": "medium",
    "question": "Ein Switch erhält einen Ethernet-Broadcast an einem Access-Port in VLAN 10. Welche weiteren Ports erhalten ihn bei normaler VLAN-Weiterleitung?",
    "answers": [
      "Die dafür weiterleitenden Ports von VLAN 10.",
      "Alle weiterleitenden Ports unabhängig von ihrer VLAN-Zugehörigkeit.",
      "Nur die Ports mit einem bereits gelernten Unicast-Eintrag für den Absender.",
      "Nur einen beliebigen Access-Port desselben VLANs."
    ],
    "correctAnswer": 0,
    "explanation": "Ethernet-Broadcasts bleiben innerhalb der jeweiligen VLAN-Broadcast-Domäne. Auf einem passenden Trunk kann der Frame ebenfalls transportiert werden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-068",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aussage zu VLAN und Subnetz ist am treffendsten?",
    "answers": [
      "VLAN und IP-Subnetz sind unterschiedliche Konzepte, werden in der Praxis aber häufig einander zugeordnet.",
      "Ein VLAN und ein IP-Subnetz bezeichnen beide ausschließlich eine Layer-3-Routingtabelle.",
      "Zwei IP-Subnetze auf demselben ungetrennten Ethernet-LAN bilden automatisch zwei VLANs.",
      "Ein VLAN-Tag ersetzt die IP-Präfixlänge bei der Entscheidung, ob ein Ziel lokal liegt."
    ],
    "correctAnswer": 0,
    "explanation": "VLAN ist Layer 2, IP-Subnetting Layer 3. In typischen Designs wird oft ein Subnetz pro VLAN verwendet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-069",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bedeutet eine IP-MTU von 1500 Byte auf einer Ethernet-Schnittstelle?",
    "answers": [
      "Ein vollständiges IP-Paket einschließlich IP-Header darf dort bis zu 1500 Byte groß sein.",
      "Allein die TCP-Nutzdaten dürfen dort stets 1500 Byte groß sein.",
      "Der gesamte Ethernet-Frame einschließlich Ethernet-Header und FCS ist auf 1500 Byte begrenzt.",
      "Jedes IP-Paket muss dort mindestens 1500 Byte groß sein."
    ],
    "correctAnswer": 0,
    "explanation": "Die IP-MTU begrenzt das vollständige IP-Paket, das der Link transportiert. Ethernet-Header und FCS zählen nicht zu diesen 1500 Byte.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-070",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat das FCS-Feld in einem Ethernet-Frame?",
    "answers": [
      "Fehler bei der Übertragung erkennen.",
      "Fehler automatisch durch erneutes Senden korrigieren.",
      "Mehrfach empfangene Frames anhand ihrer Reihenfolge aussortieren.",
      "Verlorene Frames anhand fortlaufender Sequenznummern identifizieren."
    ],
    "correctAnswer": 0,
    "explanation": "FCS dient der Fehlererkennung auf Frame-Ebene, nicht der automatischen Fehlerkorrektur.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-071",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aussage zu ICMP und Ports ist korrekt?",
    "answers": [
      "ICMP verwendet keine TCP- oder UDP-Portnummern.",
      "ICMP verwendet immer TCP-Port 1.",
      "ICMP verwendet immer UDP-Port 0.",
      "ICMP verwendet dieselben Ports wie DNS."
    ],
    "correctAnswer": 0,
    "explanation": "ICMP wird direkt über IP transportiert und besitzt keine TCP-/UDP-Ports.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-072",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein TCP-Segment ist nachweislich am vorgesehenen Zielhost angekommen. Dort lauscht kein Dienst auf dem Zielport. Welche Funktion hat für dieses Segment bereits funktioniert?",
    "answers": [
      "Die IP-Zustellung zum Zielhost.",
      "Der erfolgreiche TCP-Verbindungsaufbau.",
      "Die Annahme der Daten durch den Zieldienst.",
      "Die Verarbeitung der Anwendungsanfrage."
    ],
    "correctAnswer": 0,
    "explanation": "Die nachgewiesene Ankunft bestätigt die IP-Zustellung dieses Segments. Sie beweist weder einen erfolgreichen TCP-Verbindungsaufbau noch einen laufenden Anwendungsdienst.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-073",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche vier Angaben unterscheiden TCP-Verbindungen innerhalb eines gewöhnlichen IP-Netzwerkstacks?",
    "answers": [
      "Quell-IP-Adresse, Quellport, Ziel-IP-Adresse und Zielport.",
      "Quell-IP-Adresse, Ziel-IP-Adresse, TTL und Paketlänge.",
      "Quellport, Zielport, Sequenznummer und Bestätigungsnummer.",
      "Quell-MAC-Adresse, Ziel-MAC-Adresse, VLAN-ID und EtherType."
    ],
    "correctAnswer": 0,
    "explanation": "Eine TCP-Verbindung wird durch das Paar ihrer Socket-Endpunkte identifiziert. Bei protokollübergreifender Betrachtung gehört zusätzlich die Unterscheidung TCP oder UDP zum üblichen Fünfertupel.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-074",
    "category": "Netzwerk",
    "topic": "HTTP/HTTPS",
    "difficulty": "medium",
    "question": "Ein HTTPS-Dienst lauscht auf Port 8443 statt auf 443. Welche URL adressiert diesen Dienst ausdrücklich?",
    "answers": [
      "https://example.com:8443/",
      "https://example.com/8443",
      "https://8443.example.com/",
      "https://example.com/?port=8443"
    ],
    "correctAnswer": 0,
    "explanation": "Eine ausdrücklich angegebene Portnummer steht hinter dem Hostnamen, getrennt durch einen Doppelpunkt. Ein Pfad, eine Subdomain oder ein Abfrageparameter ändert den Verbindungsport nicht.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-075",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Reihenfolge beschreibt die Kapselung von Anwendungsdaten beim Versand über TCP, IPv4 und Ethernet?",
    "answers": [
      "Anwendungsdaten → TCP-Segment → IPv4-Paket → Ethernet-Frame.",
      "Anwendungsdaten → IPv4-Paket → TCP-Segment → Ethernet-Frame.",
      "Anwendungsdaten → Ethernet-Frame → IPv4-Paket → TCP-Segment.",
      "Anwendungsdaten → TCP-Segment → Ethernet-Frame → IPv4-Paket."
    ],
    "correctAnswer": 0,
    "explanation": "TCP-Daten werden im IP-Paket transportiert, das wiederum in einem Ethernet-Frame liegt. Die beteiligten Protokolle ergänzen ihre jeweiligen Steuerinformationen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-076",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Was beschreibt eine Netzwerktopologie?",
    "answers": [
      "Die Regeln zur Vergabe von IP-Adressen und Präfixen.",
      "Wie Geräte verbunden sind und wie Daten übertragen werden",
      "Die Zuordnung von Nutzern zu Berechtigungsgruppen.",
      "Die Auswahl von Protokollen für einzelne Anwendungsdienste."
    ],
    "correctAnswer": 1,
    "explanation": "Eine Netzwerktopologie beschreibt die Verbindung der Geräte und den Weg der Datenübertragung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-077",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Was beschreibt die physische Topologie eines Netzwerks?",
    "answers": [
      "Die tatsächlichen Geräte und die physischen Verbindungen zwischen ihnen.",
      "Die IP-Präfixe und die Regeln zur Weiterleitung zwischen ihnen.",
      "Die Zugriffsrechte der Benutzer auf gemeinsame Ressourcen.",
      "Die Zuordnung von Anwendungsdiensten zu Transportports."
    ],
    "correctAnswer": 0,
    "explanation": "Die physische Topologie beschreibt den realen Aufbau der Verbindungen. Der logische Kommunikationsweg kann davon abweichen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-078",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Mehrere Rechner sind sternförmig an einen klassischen Ethernet-Hub angeschlossen. Wie lässt sich ihre gemeinsame Nutzung des Mediums logisch beschreiben?",
    "answers": [
      "Als gemeinsames Medium, das funktional einem Bus entspricht.",
      "Als getrennte Punkt-zu-Punkt-Verbindungen mit unabhängiger Full-Duplex-Nutzung.",
      "Als Ring mit fest weitergereichtem Senderecht.",
      "Als vollständiges Mesh mit einer eigenen Verbindung für jedes Rechnerpaar."
    ],
    "correctAnswer": 0,
    "explanation": "Der Hub wiederholt Signale auf dem gemeinsamen Medium. Deshalb unterscheidet sich die physische Sternverkabelung vom logischen gemeinsamen Bus.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-079",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Woran erkennt man eine Sterntopologie?",
    "answers": [
      "Alle Geräte teilen sich ein Hauptkabel",
      "Alle Geräte sind einzeln mit einem zentralen Verteiler verbunden",
      "Alle Geräte bilden einen geschlossenen Kreis",
      "Jedes Gerät ist direkt mit jedem anderen verbunden"
    ],
    "correctAnswer": 1,
    "explanation": "Bei der Sterntopologie ist jedes Endgerät separat mit einem zentralen Verteiler, z. B. einem Switch, verbunden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-080",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Was passiert in einer Sterntopologie typischerweise, wenn nur das Kabel eines einzelnen PCs ausfällt?",
    "answers": [
      "Das gesamte Netz fällt aus",
      "Nur dieser PC ist betroffen",
      "Alle Switches starten neu",
      "Die Broadcastadresse ändert sich"
    ],
    "correctAnswer": 1,
    "explanation": "Ein einzelner Kabel- oder PC-Ausfall bleibt bei der Sterntopologie normalerweise lokal.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-081",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Welcher Nachteil ist typisch für die Sterntopologie?",
    "answers": [
      "Der zentrale Verteiler kann ein Single Point of Failure sein",
      "Jede zusätzliche Station benötigt eine direkte Leitung zu allen vorhandenen Stationen.",
      "Alle Stationen müssen an den beiden Enden einer gemeinsamen Leitung abgeschlossen werden.",
      "Der Ausfall eines Endgeräts unterbricht grundsätzlich den Datenweg zwischen allen anderen Endgeräten."
    ],
    "correctAnswer": 0,
    "explanation": "Fällt der zentrale Switch aus, kann die gesamte Sternstruktur ausfallen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-082",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Warum lassen sich Fehler einzelner Anschlussleitungen in einer einfachen Sterntopologie häufig gut eingrenzen?",
    "answers": [
      "Weil jede Anschlussleitung sämtliche Teilnehmer gemeinsam trägt.",
      "Weil sich jede Anschlussleitung einem bestimmten Endgerät zuordnen lässt.",
      "Weil die Leitungen ohne Zuordnung zu Switch-Ports arbeiten.",
      "Weil Fehler an einer Anschlussleitung auf allen anderen Leitungen identisch auftreten."
    ],
    "correctAnswer": 1,
    "explanation": "Getrennte Anschlussleitungen und zugehörige Switch-Ports helfen dabei, einen Fehler einem einzelnen Anschluss zuzuordnen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-083",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Was kennzeichnet eine Bustopologie?",
    "answers": [
      "Alle Geräte hängen an einer gemeinsamen Bus-Leitung",
      "Alle Geräte sind mit einem zentralen Switch verbunden",
      "Jedes Gerät hat eine direkte Verbindung zu jedem anderen Gerät.",
      "Jedes Gerät verbindet sich mit genau zwei Nachbarn zu einem geschlossenen Ring."
    ],
    "correctAnswer": 0,
    "explanation": "Bei der Bustopologie teilen sich die Geräte ein gemeinsames Hauptkabel.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-084",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Welche Aufgabe haben Abschlusswiderstände an den beiden Enden eines klassischen Koaxial-Ethernet-Busses?",
    "answers": [
      "Sie verstärken abgeschwächte Signale vor der Rückübertragung.",
      "Sie verhindern Signalreflexionen an den Kabelenden",
      "Sie erzeugen ein gemeinsames Taktsignal für die angeschlossenen Stationen.",
      "Sie teilen das gemeinsame Kabel in getrennte Kollisionsdomänen."
    ],
    "correctAnswer": 1,
    "explanation": "Terminatoren an beiden Enden verhindern, dass Signale zurückreflektiert werden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-085",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Geräte stehen entlang einer geraden Strecke. Welchen Verkabelungsvorteil kann ein gemeinsamer Bus gegenüber einzelnen Leitungen zu einem entfernten Zentralverteiler haben?",
    "answers": [
      "Es kann insgesamt weniger Kabel erforderlich sein.",
      "Für jedes Gerätepaar steht automatisch eine eigene Leitung bereit.",
      "Ein Kabelbruch kann stets über eine zweite Busleitung umgangen werden.",
      "Jeder Teilnehmer erhält durch die Busform eine unabhängige Full-Duplex-Strecke."
    ],
    "correctAnswer": 0,
    "explanation": "Ein gemeinsamer Bus kann bei geeigneter Anordnung Kabel sparen. Daraus folgen weder unabhängige Verbindungen noch automatische Redundanz.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-086",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Welche Einschränkung hat ein klassischer gemeinsam genutzter Half-Duplex-Ethernet-Bus bei hoher Sendelast?",
    "answers": [
      "Kollisionen und erneute Sendeversuche können den nutzbaren Durchsatz verringern.",
      "Jeder Teilnehmer erhält unabhängig von den anderen die volle Buskapazität.",
      "Ein zentrales Token garantiert jedem Teilnehmer eine feste Sendezeit.",
      "Gleichzeitiges Senden verschiedener Teilnehmer wird auf getrennte Leitungen verteilt."
    ],
    "correctAnswer": 0,
    "explanation": "Alle Teilnehmer teilen sich das Medium. CSMA/CD behandelt Kollisionen durch Abbruch und erneuten Versuch nach einer Wartezeit.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-087",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Welche Beschreibung passt zu einer einfachen Ringtopologie mit mindestens vier Teilnehmern?",
    "answers": [
      "Die Teilnehmer sind zu einer geschlossenen Kette mit jeweils zwei Nachbarn verbunden.",
      "Alle Teilnehmer besitzen jeweils eine Verbindung zu einem zentralen Verteiler.",
      "Alle Teilnehmer hängen an einer gemeinsamen linearen Leitung.",
      "Jeder Teilnehmer ist direkt mit jedem anderen Teilnehmer verbunden."
    ],
    "correctAnswer": 0,
    "explanation": "Bei einer einfachen Ringtopologie besitzt jeder Teilnehmer zwei Nachbarn. Die Verbindungen bilden einen geschlossenen Ring, unabhängig von der räumlichen Anordnung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-089",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Was kennzeichnet eine Baumtopologie bzw. erweiterte Sterntopologie?",
    "answers": [
      "Mehrere Sterne werden hierarchisch miteinander verbunden",
      "Alle Geräte hängen an exakt einem Koaxialkabel",
      "Es gibt keine zentralen Verteiler",
      "Jedes Gerät ist mit jedem anderen direkt verbunden"
    ],
    "correctAnswer": 0,
    "explanation": "Mehrere Sternstrukturen werden hierarchisch zu einem Baum verbunden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-090",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Ein Verteiler verbindet einen Unterbaum ohne redundanten Uplink mit dem übrigen Netz. Was kann sein vollständiger Ausfall bewirken?",
    "answers": [
      "Die über ihn angebundenen Geräte verlieren den Zugang zum übrigen Netz.",
      "Nur das zuletzt sendende Endgerät verliert den Zugang zum übrigen Netz.",
      "Alle anderen Unterbäume verlieren unabhängig von ihrem Weg ebenfalls den Zugang.",
      "Die nachgeordneten Geräte wechseln ohne weitere Verbindung automatisch zu einem anderen Verteiler."
    ],
    "correctAnswer": 0,
    "explanation": "Ohne alternativen Weg hängt der Zugang dieses Unterbaums vom betroffenen Verteiler ab. Welche lokalen Verbindungen erhalten bleiben, hängt vom konkreten Aufbau ab.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-091",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Was ist eine Punkt-zu-Punkt-Topologie?",
    "answers": [
      "Eine direkte Verbindung zwischen exakt zwei Geräten",
      "Ein Ring aus zwei Switches und mehreren Clients",
      "Ein Bus mit zwei Terminatoren",
      "Ein vollständig vermaschtes Netz aus fünf Geräten."
    ],
    "correctAnswer": 0,
    "explanation": "Punkt-zu-Punkt bedeutet eine direkte Verbindung zwischen genau zwei Partnern.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-092",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Sechs Geräte sollen mit je einer eigenen bidirektionalen Punkt-zu-Punkt-Verbindung pro Gerätepaar vollständig vermascht werden. Wie viele Verbindungen sind erforderlich?",
    "answers": [
      "15",
      "6",
      "12",
      "30"
    ],
    "correctAnswer": 0,
    "explanation": "Jedes der sechs Geräte benötigt Verbindungen zu fünf anderen. Da jede Verbindung zwei Geräte verbindet, zählt man 6 × 5 / 2 = 15.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-093",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Woran erkennt man ein vollständig vermaschtes Netz aus mindestens drei Teilnehmern?",
    "answers": [
      "Wenn jedes Gerät mit genau einem Switch verbunden ist",
      "Wenn jeder Teilnehmer direkt mit jedem anderen verbunden ist",
      "Wenn nur benachbarte Teilnehmer einer offenen Kette direkt miteinander verbunden sind.",
      "Wenn alle Geräte ein gemeinsames Kabel verwenden"
    ],
    "correctAnswer": 1,
    "explanation": "Full Mesh bedeutet direkte Verbindung jedes Teilnehmers mit jedem anderen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-095",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Welchen Vorteil kann ein vermaschtes Netz bei Ausfall einer einzelnen Verbindung bieten?",
    "answers": [
      "Ein geeigneter Routing- oder Weiterleitungsmechanismus kann einen verbleibenden Alternativweg nutzen.",
      "Der Ausfall wird durch die Vermaschung automatisch zu zusätzlicher Bandbreite.",
      "Alle Verbindungen können ohne gemeinsames Weiterleitungsverfahren gleichzeitig denselben Frame vervielfachen.",
      "Ein defekter Endpunkt bleibt allein durch zusätzliche Leitungen zwischen anderen Geräten erreichbar."
    ],
    "correctAnswer": 0,
    "explanation": "Vermaschung kann alternative Wege bereitstellen. Die tatsächliche Ausfallsicherheit hängt auch von Protokollen, Konfiguration und unabhängigen Komponenten ab.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-096",
    "category": "Netzwerk",
    "topic": "Netzwerkarten",
    "difficulty": "medium",
    "question": "Welche Netzwerkart verbindet Geräte in der direkten Umgebung einer Person über wenige Meter?",
    "answers": [
      "PAN",
      "LAN",
      "MAN",
      "WAN"
    ],
    "correctAnswer": 0,
    "explanation": "PAN steht für Personal Area Network und umfasst die direkte persönliche Umgebung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-097",
    "category": "Netzwerk",
    "topic": "Netzwerkarten",
    "difficulty": "medium",
    "question": "Welche Netzwerkart passt typischerweise zu einem Raum, Gebäude oder Firmengelände?",
    "answers": [
      "PAN",
      "LAN",
      "MAN",
      "GAN"
    ],
    "correctAnswer": 1,
    "explanation": "LAN ist ein lokales Netzwerk in einem begrenzten Gebiet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-098",
    "category": "Netzwerk",
    "topic": "Netzwerkarten",
    "difficulty": "medium",
    "question": "Welche Netzwerkart beschreibt typischerweise ein Netz im Gebiet einer Stadt oder eines Ballungsraums?",
    "answers": [
      "PAN",
      "LAN",
      "MAN",
      "GAN"
    ],
    "correctAnswer": 2,
    "explanation": "MAN steht für Metropolitan Area Network und bezeichnet typischerweise ein Netz im metropolitanen Gebiet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-099",
    "category": "Netzwerk",
    "topic": "Netzwerkarten",
    "difficulty": "medium",
    "question": "Welche Netzwerkart verbindet große Entfernungen wie mehrere Städte oder Länder?",
    "answers": [
      "PAN",
      "LAN",
      "WAN",
      "VLAN"
    ],
    "correctAnswer": 2,
    "explanation": "WAN steht für Wide Area Network.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-100",
    "category": "Netzwerk",
    "topic": "Netzwerkarten",
    "difficulty": "medium",
    "question": "Was beschreibt ein GAN am besten?",
    "answers": [
      "Ein Netzwerk innerhalb eines Zimmers",
      "Ein weltweites Netzwerk über Länder und Kontinente",
      "Eine direkte Verbindung zwischen zwei Geräten",
      "Ein lokales Funknetz"
    ],
    "correctAnswer": 1,
    "explanation": "GAN steht für Global Area Network.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-101",
    "category": "Netzwerk",
    "topic": "Netzwerkarchitektur",
    "difficulty": "medium",
    "question": "Welche Rollen können Teilnehmer in einer Peer-to-Peer-Anwendung übernehmen?",
    "answers": [
      "Sie können sowohl Ressourcen anbieten als auch Ressourcen anderer Teilnehmer nutzen.",
      "Sie dürfen ausschließlich Ressourcen eines dauerhaft festgelegten Zentralservers nutzen.",
      "Sie können Ressourcen anbieten, aber niemals selbst Ressourcen anfordern.",
      "Ein Teilnehmer darf nur Ressourcen anbieten, solange er selbst keine fremden Ressourcen nutzt."
    ],
    "correctAnswer": 0,
    "explanation": "Peers können Anbieter und Nutzer sein. Einzelne P2P-Systeme verwenden trotzdem zusätzliche zentrale Dienste, etwa für die Suche nach Teilnehmern.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-102",
    "category": "Netzwerk",
    "topic": "Netzwerkarchitektur",
    "difficulty": "medium",
    "question": "Eine P2P-Anwendung hält dieselbe Datei bei mehreren unabhängig erreichbaren Peers bereit; die Suche hängt nicht von einem einzelnen Server ab. Welcher Vorteil ergibt sich daraus?",
    "answers": [
      "Die Datei kann beim Ausfall eines einzelnen Anbieters weiterhin verfügbar sein.",
      "Jeder Peer muss nur noch einen festen Teil der Datei dauerhaft speichern.",
      "Die Dateiübertragung benötigt keine Authentisierung oder Zugriffsregeln mehr.",
      "Alle Peers erhalten automatisch dieselbe verfügbare Übertragungsrate."
    ],
    "correctAnswer": 0,
    "explanation": "Mehrere erreichbare Kopien verringern die Abhängigkeit von einem einzelnen Anbieter. Sicherheit, Leistung und andere Ausfallpunkte müssen weiterhin berücksichtigt werden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-103",
    "category": "Netzwerk",
    "topic": "Netzwerkarchitektur",
    "difficulty": "medium",
    "question": "In einem kleinen P2P-Dateifreigabenetz verwaltet jeder Nutzer seine Freigaberechte selbst. Welche organisatorische Schwierigkeit entsteht daraus?",
    "answers": [
      "Einheitliche Zugriffsregeln müssen auf mehreren unabhängigen Geräten abgestimmt werden.",
      "Alle Freigaben können ausschließlich an einem zentralen Server geändert werden.",
      "Eine lokal geänderte Freigaberegel wird ohne Abstimmung automatisch auf allen PCs wirksam.",
      "Das Entfernen eines Benutzers an einem PC entzieht automatisch dessen Rechte auf allen anderen PCs."
    ],
    "correctAnswer": 0,
    "explanation": "Dezentral verwaltete Freigaben können uneinheitliche Rechte und zusätzlichen Abstimmungsaufwand verursachen. Das ist eine Verwaltungsfrage, keine feste Begrenzung der Teilnehmerzahl.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-104",
    "category": "Netzwerk",
    "topic": "Netzwerkarchitektur",
    "difficulty": "medium",
    "question": "Was ist die Grundidee eines Client-Server-Netzwerks?",
    "answers": [
      "Clients bieten die Dienste an, während Server ausschließlich als anfragende Nutzer auftreten.",
      "Server bieten Dienste und Ressourcen an, die Clients nutzen",
      "Jeder Teilnehmer muss denselben Dienst gleichzeitig anbieten und nutzen.",
      "Ein Rechner ist unabhängig vom angesprochenen Dienst für seine gesamte Laufzeit ausschließlich Client oder Server."
    ],
    "correctAnswer": 1,
    "explanation": "Im Client-Server-Modell stellen Server Dienste/Ressourcen bereit und Clients greifen darauf zu.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-105",
    "category": "Netzwerk",
    "topic": "Client-Server",
    "difficulty": "medium",
    "question": "Ein Webserver beantwortet Browseranfragen und fragt selbst einen Datenbankdienst ab. Welche Rollen übernimmt er dabei?",
    "answers": [
      "Gegenüber dem Browser Server, gegenüber der Datenbank Client.",
      "Gegenüber dem Browser Client, gegenüber der Datenbank Server.",
      "In beiden Beziehungen ausschließlich Server.",
      "In beiden Beziehungen ausschließlich Client."
    ],
    "correctAnswer": 0,
    "explanation": "Client und Server beschreiben Rollen in einer konkreten Dienstbeziehung. Ein System kann in verschiedenen Beziehungen unterschiedliche Rollen übernehmen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-106",
    "category": "Netzwerk",
    "topic": "IPv4",
    "difficulty": "medium",
    "question": "Was bedeutet bei 192.168.10.15/24 die Angabe /24?",
    "answers": [
      "Die ersten 24 Bit bilden den Hostanteil.",
      "Die ersten 24 Bit gehören zum Netzpräfix",
      "Die letzten 24 Bit gehören zum Host",
      "Das gesamte IPv4-Adressformat besteht aus 24 Bit."
    ],
    "correctAnswer": 1,
    "explanation": "/24 bezeichnet die Länge des Netzpräfixes in Bit.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-107",
    "category": "Netzwerk",
    "topic": "IPv4",
    "difficulty": "medium",
    "question": "Welche Subnetzmaske entspricht einem /24-Netz?",
    "answers": [
      "255.0.0.0",
      "255.255.0.0",
      "255.255.255.0",
      "255.255.255.255"
    ],
    "correctAnswer": 2,
    "explanation": "/24 entspricht 255.255.255.0.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-108",
    "category": "Netzwerk",
    "topic": "IPv4",
    "difficulty": "medium",
    "question": "Welche Adresse ist im Beispielnetz 192.168.10.0/24 die Netzadresse?",
    "answers": [
      "192.168.10.0",
      "192.168.10.1",
      "192.168.10.254",
      "192.168.10.255"
    ],
    "correctAnswer": 0,
    "explanation": "Im /24-Beispiel ist .0 die Netzadresse.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-109",
    "category": "Netzwerk",
    "topic": "IPv4",
    "difficulty": "medium",
    "question": "Welche Adresse ist im Beispielnetz 192.168.10.0/24 die Broadcastadresse?",
    "answers": [
      "192.168.10.0",
      "192.168.10.1",
      "192.168.10.254",
      "192.168.10.255"
    ],
    "correctAnswer": 3,
    "explanation": "Im /24-Beispiel ist .255 die Broadcastadresse.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-110",
    "category": "Netzwerk",
    "topic": "IPv4",
    "difficulty": "medium",
    "question": "Wofür ist eine Broadcastadresse im jeweiligen lokalen Broadcast-Bereich vorgesehen?",
    "answers": [
      "Um genau einen einzelnen Host anzusprechen",
      "Um alle Geräte im jeweiligen Netzwerksegment anzusprechen",
      "Um nur Teilnehmer einer ausdrücklich gewählten Multicast-Gruppe anzusprechen.",
      "Ein durch Routing ausgewähltes Mitglied einer Anycast-Gruppe anzusprechen."
    ],
    "correctAnswer": 1,
    "explanation": "Broadcast ist für Nachrichten an alle Teilnehmer des jeweiligen Netzes vorgesehen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-111",
    "category": "Netzwerk",
    "topic": "IPv4",
    "difficulty": "medium",
    "question": "Wie viele Bit enthält ein IPv4-Oktett?",
    "answers": [
      "4",
      "8",
      "16",
      "32"
    ],
    "correctAnswer": 1,
    "explanation": "Ein IPv4-Oktett besteht aus 8 Bit.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-112",
    "category": "Netzwerk",
    "topic": "IPv4",
    "difficulty": "medium",
    "question": "Welchem Dezimalwert entspricht das Binärmuster 10000000?",
    "answers": [
      "64",
      "128",
      "192",
      "255"
    ],
    "correctAnswer": 1,
    "explanation": "Das höchstwertige Bit eines Oktetts hat den Wert 128.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-113",
    "category": "Netzwerk",
    "topic": "IPv4",
    "difficulty": "medium",
    "question": "Welche Binärdarstellung entspricht dem Dezimalwert 192 in einem Oktett?",
    "answers": [
      "10000000",
      "11000000",
      "11100000",
      "11111111"
    ],
    "correctAnswer": 1,
    "explanation": "192 = 128 + 64, also 11000000.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-114",
    "category": "Netzwerk",
    "topic": "Subnetting",
    "difficulty": "medium",
    "question": "Was ist die Grundidee des IPv4-Subnettings?",
    "answers": [
      "Einen IP-Adressblock in kleinere Teilnetze mit längeren Präfixen aufzuteilen.",
      "Mehrere Teilnetze durch ein kürzeres gemeinsames Präfix zusammenzufassen.",
      "Private Quelladressen beim Weiterleiten durch öffentliche Adressen zu ersetzen.",
      "Hostnamen in numerische Zieladressen aufzulösen."
    ],
    "correctAnswer": 0,
    "explanation": "Subnetting unterteilt einen Adressblock mithilfe längerer Präfixe. Getrennte Layer-2-Broadcast-Domänen erfordern zusätzlich einen entsprechenden Netzaufbau, etwa VLANs.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-117",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "medium",
    "question": "Welches Verfahren nutzt WLAN beim klassischen Zugriff konkurrierender Stationen auf das Funkmedium?",
    "answers": [
      "CSMA/CD",
      "CSMA/CA",
      "Token Passing",
      "Feste Zeitschlitzvergabe"
    ],
    "correctAnswer": 1,
    "explanation": "Der klassische konkurrenzbasierte WLAN-Zugriff verwendet CSMA/CA. Er kombiniert die Beurteilung des Mediums mit Warteverfahren, um gleichzeitige Sendeversuche zu reduzieren.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-118",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "medium",
    "question": "Wozu dient der zufällige Backoff beim konkurrenzbasierten WLAN-Zugriff mit CSMA/CA?",
    "answers": [
      "Er verteilt konkurrierende Sendeversuche zeitlich, um gleichzeitige Starts seltener zu machen.",
      "Er vergibt jeder Station dauerhaft dieselbe feste Sendezeit.",
      "Er beseitigt Übertragungsfehler durch nachträgliche Änderung des empfangenen Frames.",
      "Er synchronisiert die Sendestarts aller wartenden Stationen auf denselben Zeitpunkt."
    ],
    "correctAnswer": 0,
    "explanation": "Zufällige Wartezeiten reduzieren die Wahrscheinlichkeit gleichzeitiger Sendeversuche. Kollisionen und andere Übertragungsfehler werden dadurch nicht ausgeschlossen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-119",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "medium",
    "question": "Welches Zugriffsverfahren nutzt klassisches gemeinsam genutztes Half-Duplex-Ethernet?",
    "answers": [
      "CSMA/CA",
      "CSMA/CD",
      "Token Passing",
      "Fest zugeteilte Zeitschlitze"
    ],
    "correctAnswer": 1,
    "explanation": "CSMA/CD wurde für gemeinsam genutztes Half-Duplex-Ethernet entwickelt. Full-Duplex-Ethernet verwendet dieses Kollisionsverfahren nicht.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-120",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "medium",
    "question": "Was macht CSMA/CD bei einer Kollision?",
    "answers": [
      "Es erkennt die Kollision während der Übertragung und stoppt",
      "Es setzt die Übertragung mit höherer Sendeleistung bis zum Frame-Ende fort.",
      "Es überlässt dem Empfänger allein die Auswahl des erfolgreich gesendeten Frames.",
      "Es wiederholt den vollständigen Frame grundsätzlich sofort ohne Backoff."
    ],
    "correctAnswer": 0,
    "explanation": "Nach Erkennung einer Kollision wird ein Jam-Signal gesendet und der Sendeversuch abgebrochen. Ein weiterer Versuch erfolgt nach dem vorgesehenen Backoff-Verfahren.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-121",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "Wozu dient das OSI-Modell hauptsächlich?",
    "answers": [
      "Als Referenzmodell für Kommunikation zwischen technischen Systemen",
      "Als verbindliche Festlegung einer einzigen Hardware für alle Netzwerke.",
      "Als konkretes Routingprotokoll für den Austausch von Internet-Routen.",
      "Als Ersatz für die tatsächlich implementierten Übertragungsprotokolle."
    ],
    "correctAnswer": 0,
    "explanation": "Das OSI-Modell ist ein Referenzmodell für die Kommunikation zwischen technischen Systemen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-122",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "Wie viele Schichten hat das OSI-Modell?",
    "answers": [
      "4",
      "5",
      "6",
      "7"
    ],
    "correctAnswer": 3,
    "explanation": "Das OSI-Modell besteht aus sieben Schichten.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-123",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "Welche Reihenfolge beginnt oben bei Schicht 7?",
    "answers": [
      "Anwendung, Darstellung, Sitzung",
      "Bitübertragung, Sicherung, Vermittlung",
      "Transport, Vermittlung, Sicherung",
      "Sitzung, Anwendung, Darstellung"
    ],
    "correctAnswer": 0,
    "explanation": "Schicht 7 bis 5 lauten Anwendung, Darstellung, Sitzung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-124",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "Welche OSI-Schichten gelten als anwendungsorientiert?",
    "answers": [
      "1 bis 3",
      "1 bis 4",
      "5 bis 7",
      "2 bis 5"
    ],
    "correctAnswer": 2,
    "explanation": "Schichten 7 bis 5 werden als anwendungsorientiert bezeichnet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-125",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "Welche OSI-Schichten bilden die untere Gruppe von der Bitübertragung bis einschließlich zur Transportschicht?",
    "answers": [
      "1 bis 4",
      "4 bis 7",
      "5 bis 7",
      "2 bis 6"
    ],
    "correctAnswer": 0,
    "explanation": "Zur unteren Gruppe gehören Bitübertragung, Sicherung, Vermittlung und Transport, also die Schichten 1 bis 4.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-126",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "In welcher Richtung verarbeitet ein sendendes Endsystem eine Anwendungsnachricht im OSI-Modell?",
    "answers": [
      "Von Schicht 1 nach 7",
      "Von Schicht 7 nach 1",
      "Von Schicht 7 direkt zu Schicht 1 unter Auslassung der Zwischenschichten.",
      "Von Schicht 4 zu Schicht 7 und anschließend direkt zu Schicht 1."
    ],
    "correctAnswer": 1,
    "explanation": "Beim Senden werden die Schichten von oben nach unten durchlaufen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-127",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "In welcher Richtung durchlaufen Daten beim Empfangen das OSI-Modell?",
    "answers": [
      "Von Schicht 1 nach 7",
      "Von Schicht 7 nach 1",
      "Nur Schicht 3 nach 2",
      "Es gibt keine Reihenfolge"
    ],
    "correctAnswer": 0,
    "explanation": "Beim Empfangen werden die Schichten von unten nach oben durchlaufen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-128",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "Welche OSI-Schicht ist für Kabel, Funkwellen oder Lichtpulse zuständig?",
    "answers": [
      "Schicht 1 Bitübertragung",
      "Schicht 3 Vermittlung",
      "Schicht 5 Sitzung",
      "Schicht 7 Anwendung"
    ],
    "correctAnswer": 0,
    "explanation": "Die Bitübertragungsschicht überträgt Bits über physische Medien.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-129",
    "category": "Netzwerk",
    "topic": "Ethernet",
    "difficulty": "medium",
    "question": "Woran erkennt ein Empfänger bei einem Ethernet-II-Frame, welches Protokoll unmittelbar in dessen Nutzlast folgt?",
    "answers": [
      "Am EtherType-Feld.",
      "An der Quell-MAC-Adresse.",
      "An der Frame Check Sequence.",
      "An der Präambel."
    ],
    "correctAnswer": 0,
    "explanation": "Das EtherType-Feld kennzeichnet das unmittelbar transportierte Protokoll, etwa IPv4 oder IPv6. Es identifiziert nicht den Anwendungsdienst.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-130",
    "category": "Netzwerk",
    "topic": "Routing",
    "difficulty": "medium",
    "question": "Ein Router leitet ein IPv4-Paket ohne NAT zum nächsten Ethernet-Netz weiter. Welche Aussage zur Zieladressierung ist richtig?",
    "answers": [
      "Die Ziel-IP bleibt erhalten; der neue Ethernet-Frame erhält die MAC-Adresse des nächsten Hops.",
      "Die Ziel-IP wird grundsätzlich durch die IP-Adresse des Routers ersetzt.",
      "Ziel-IP und Ziel-MAC des ersten Frames bleiben auf allen Ethernet-Links unverändert.",
      "Die Ziel-IP bleibt erhalten; als Ziel-MAC wird auf jedem Link die MAC des Absenders verwendet."
    ],
    "correctAnswer": 0,
    "explanation": "Routing verändert ohne NAT nicht die Ziel-IP. Die Link-Layer-Adressierung wird für den jeweiligen nächsten Link neu gebildet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-131",
    "category": "Netzwerk",
    "topic": "TCP",
    "difficulty": "medium",
    "question": "Welche Reihenfolge beschreibt den üblichen Aufbau einer TCP-Verbindung ohne gleichzeitigen Verbindungsstart beider Seiten?",
    "answers": [
      "SYN → SYN/ACK → ACK",
      "ACK → SYN → FIN",
      "SYN → FIN → ACK",
      "SYN/ACK → ACK → SYN"
    ],
    "correctAnswer": 0,
    "explanation": "Der initiierende Endpunkt sendet SYN. Die Gegenseite bestätigt mit SYN/ACK; das folgende ACK bestätigt deren Sequenznummer.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-132",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "Welche OSI-Schicht ist im Referenzmodell für Dialogsteuerung und Synchronisationspunkte zwischen kommunizierenden Anwendungen vorgesehen?",
    "answers": [
      "Schicht 2",
      "Schicht 4",
      "Schicht 5",
      "Schicht 7"
    ],
    "correctAnswer": 2,
    "explanation": "Die Sitzungsschicht ist Schicht 5. Zu ihren Modellfunktionen gehören Dialogsteuerung und Synchronisation; eine TCP-Verbindung ist dagegen eine Transportverbindung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-133",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "Welche OSI-Schicht befasst sich im Referenzmodell mit der gemeinsamen Darstellung und Umwandlung von Datenformaten?",
    "answers": [
      "Schicht 3",
      "Schicht 5",
      "Schicht 6",
      "Schicht 7"
    ],
    "correctAnswer": 2,
    "explanation": "Die Darstellungsschicht ist Schicht 6. Sie behandelt die Repräsentation der ausgetauschten Daten, nicht die grafische Anzeige auf einem Bildschirm.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-134",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "Welche OSI-Schicht stellt Netzwerkdienste für Anwendungen bereit?",
    "answers": [
      "Schicht 1",
      "Schicht 4",
      "Schicht 6",
      "Schicht 7"
    ],
    "correctAnswer": 3,
    "explanation": "Schicht 7 ist die Anwendungsschicht.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-135",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "Eine Technikerin wählt für die Fehlersuche ausdrücklich die Bottom-up-Strategie des OSI-Modells. Womit beginnt sie?",
    "answers": [
      "Mit dem physischen Link, etwa Kabel, Signal oder Funkverbindung.",
      "Mit der Bedeutung des HTTP-Statuscodes der Anwendung.",
      "Mit der Darstellung empfangener Textzeichen.",
      "Mit den serverseitigen Berechtigungen eines Anwendungsordners."
    ],
    "correctAnswer": 0,
    "explanation": "Bottom-up beginnt bei den unteren Schichten. Je nach Fehlerbild können auch Top-down oder andere systematische Strategien sinnvoll sein.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-136",
    "category": "Netzwerk",
    "topic": "Anwendungsschicht",
    "difficulty": "medium",
    "question": "Was ist ein Protokoll im Netzwerk-Kontext?",
    "answers": [
      "Ein vereinbarter Satz von Regeln für die Kommunikation",
      "Eine Aufzeichnung bereits stattgefundener Netzwerkereignisse.",
      "Eine Liste der aktuell konfigurierten IP-Adressen.",
      "Die physische Verbindung zwischen zwei Netzwerkkarten."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Protokoll legt Regeln wie Reihenfolge, Format und Antworten fest.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-137",
    "category": "Netzwerk",
    "topic": "HTTP-HTTPS",
    "difficulty": "medium",
    "question": "Wofür steht HTTP?",
    "answers": [
      "Hypertext Transfer Protocol",
      "Host Transmission Routing Process",
      "High Transfer Protection",
      "Hyperlink Tunnel Relay Protocol"
    ],
    "correctAnswer": 0,
    "explanation": "HTTP steht für Hypertext Transfer Protocol.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-138",
    "category": "Netzwerk",
    "topic": "HTTP-HTTPS",
    "difficulty": "medium",
    "question": "Wie läuft eine typische HTTP-Kommunikation ab?",
    "answers": [
      "Request vom Client, Response vom Server",
      "Response vom Client, Request vom Server",
      "Request und Response ausschließlich vom Client",
      "Request und Response ausschließlich vom Server"
    ],
    "correctAnswer": 0,
    "explanation": "HTTP folgt typischerweise dem Anfrage-Antwort-Prinzip.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-139",
    "category": "Netzwerk",
    "topic": "HTTP-HTTPS",
    "difficulty": "medium",
    "question": "Was bedeutet HTTP-Statuscode 200?",
    "answers": [
      "Not Found",
      "OK",
      "Forbidden",
      "Timeout"
    ],
    "correctAnswer": 1,
    "explanation": "200 steht für eine erfolgreiche Antwort.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-140",
    "category": "Netzwerk",
    "topic": "HTTP-HTTPS",
    "difficulty": "medium",
    "question": "Was bedeutet HTTP-Statuscode 404?",
    "answers": [
      "OK",
      "Not Found",
      "Internal Server Error",
      "Request Timeout"
    ],
    "correctAnswer": 1,
    "explanation": "404 Not Found bedeutet, dass der Server keine aktuelle Darstellung der Zielressource gefunden hat oder ihre Existenz nicht offenlegen will. Der Code beschreibt keine Unterbrechung der Netzwerkverbindung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-141",
    "category": "Netzwerk",
    "topic": "HTTP-HTTPS",
    "difficulty": "medium",
    "question": "Welche Aussage gilt für HTTP ohne TLS oder einen anderen geschützten Transport?",
    "answers": [
      "Die TCP-Prüfsumme verhindert das gezielte Mitlesen und Verändern der Inhalte.",
      "Daten werden unverschlüsselt als Klartext übertragen",
      "Ein Passwort bei der Anmeldung verschlüsselt automatisch die HTTP-Verbindung.",
      "Nur Anmeldedaten sind ungeschützt; alle übrigen Inhalte werden automatisch verschlüsselt."
    ],
    "correctAnswer": 1,
    "explanation": "HTTP allein bietet keinen kryptografischen Vertraulichkeits- oder Integritätsschutz. Ein Angreifer auf dem Übertragungsweg kann ungeschützte Inhalte mitlesen oder verändern.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-142",
    "category": "Netzwerk",
    "topic": "HTTP-HTTPS",
    "difficulty": "medium",
    "question": "Was ist HTTPS vereinfacht gesagt?",
    "answers": [
      "HTTP mit verschlüsselter Übertragung",
      "HTTP mit Verschlüsselung nur des URL-Pfads",
      "HTTP mit Verschlüsselung nur der DNS-Abfrage",
      "HTTP mit Schutz allein durch die Portnummer 443"
    ],
    "correctAnswer": 0,
    "explanation": "HTTPS schützt die HTTP-Kommunikation durch Verschlüsselung, typischerweise TLS.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-143",
    "category": "Netzwerk",
    "topic": "HTTP-HTTPS",
    "difficulty": "medium",
    "question": "Welches Protokoll gilt als moderner Nachfolger von SSL?",
    "answers": [
      "SSH",
      "TLS",
      "IPsec",
      "S/MIME"
    ],
    "correctAnswer": 1,
    "explanation": "TLS ist der moderne Nachfolger von SSL.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-144",
    "category": "Netzwerk",
    "topic": "TLS",
    "difficulty": "medium",
    "question": "Was schützt Anwendungsdaten einer TLS-Verbindung vor unbemerkter Manipulation während der Übertragung?",
    "answers": [
      "Die kryptografische Integritätsprüfung der geschützten Daten.",
      "Die Gültigkeitsdauer des Serverzertifikats allein.",
      "Die gewöhnliche TCP-Prüfsumme allein.",
      "Eine Verschlüsselung ohne kryptografischen Manipulationsschutz."
    ],
    "correctAnswer": 0,
    "explanation": "TLS schützt reguläre Anwendungsdaten kryptografisch vor unbemerkter Manipulation. Dieser Schutz ersetzt weder die Prüfung der Serveridentität noch die Sicherheit der Endsysteme.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-145",
    "category": "Netzwerk",
    "topic": "E-Mail",
    "difficulty": "medium",
    "question": "Welcher TCP-Zielport ist für SMTP-Übertragung zwischen Mailservern standardmäßig vorgesehen?",
    "answers": [
      "25",
      "110",
      "143",
      "587"
    ],
    "correctAnswer": 0,
    "explanation": "Port 25 dient dem SMTP-Transport zwischen Mailservern. Port 587 ist für Message Submission vorgesehen; 110 und 143 gehören zu POP3 und IMAP.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-146",
    "category": "Netzwerk",
    "topic": "E-Mail",
    "difficulty": "medium",
    "question": "Ein SMTP-Server bestätigt nach dem vollständigen Nachrichteninhalt die Annahme mit 250. Was folgt daraus?",
    "answers": [
      "Er hat die Verantwortung für Zustellung oder Weiterleitung übernommen.",
      "Der Empfänger hat die Nachricht bereits gelesen.",
      "Die Nachricht wurde auf allen Geräten des Empfängers synchronisiert.",
      "Die Nachricht liegt bereits im endgültigen Postfach des Empfängers."
    ],
    "correctAnswer": 0,
    "explanation": "Die SMTP-Annahme bestätigt die Übernahme durch diesen Server. Sie beweist weder das Lesen der Nachricht noch den Abschluss aller nachfolgenden Zustellschritte.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-147",
    "category": "Netzwerk",
    "topic": "E-Mail",
    "difficulty": "medium",
    "question": "Ein IMAP-Mailprogramm soll bereits gelesene Nachrichten ohne Netzwerkverbindung anzeigen. Welche Voraussetzung ist dafür auf dem Gerät erforderlich?",
    "answers": [
      "Die benötigten Nachrichten müssen zuvor lokal zwischengespeichert worden sein.",
      "Die Nachrichten müssen zuvor ausschließlich auf dem Server gespeichert worden sein.",
      "Es genügt, wenn die Ordnerliste zuvor lokal zwischengespeichert wurde.",
      "Die Nachrichten müssen nur als gelesen auf dem Server markiert sein; eine lokale Kopie ist unnötig."
    ],
    "correctAnswer": 0,
    "explanation": "IMAP greift auf eine serverseitige Mailbox zu. Offlinezugriff setzt geeignete lokale Kopien voraus und hängt von der Cache-Konfiguration des Mailprogramms ab.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-148",
    "category": "Netzwerk",
    "topic": "E-Mail-Protokolle",
    "difficulty": "medium",
    "question": "Welche Aussage beschreibt die Speicherung bei einer typischen IMAP-Nutzung am besten?",
    "answers": [
      "Die Mailbox liegt auf dem Server; Clients können zusätzlich lokale Kopien halten.",
      "Die Mailbox liegt ausschließlich auf dem zuletzt verbundenen Client.",
      "Jede Nachricht wird beim ersten Abruf zwingend vom Server gelöscht.",
      "Jeder Client benötigt ein getrenntes Postfach ohne gemeinsamen serverseitigen Zustand."
    ],
    "correctAnswer": 0,
    "explanation": "IMAP verwaltet Nachrichten und Zustände in serverseitigen Mailboxen. Lokale Caches sind zusätzlich möglich und keine zwingend unabhängige Sicherung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-149",
    "category": "Netzwerk",
    "topic": "E-Mail",
    "difficulty": "medium",
    "question": "Welche Aussage über den Nachrichtenabruf mit POP3 ist korrekt?",
    "answers": [
      "Der Abruf einer Nachricht allein löscht sie noch nicht vom Server.",
      "Jede erfolgreich abgerufene Nachricht wird sofort zwingend gelöscht.",
      "POP3 gleicht serverseitige Unterordner und Lesestatus wie IMAP ab.",
      "POP3 ersetzt SMTP beim Versand an fremde Mailserver."
    ],
    "correctAnswer": 0,
    "explanation": "RETR ruft eine Nachricht ab. Eine Löschung erfordert einen eigenen Löschauftrag und dessen Umsetzung beim vorgesehenen Sitzungsabschluss.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-150",
    "category": "Netzwerk",
    "topic": "E-Mail-Protokolle",
    "difficulty": "medium",
    "question": "Eine Nutzerin liest eine Mail auf dem Handy und sie erscheint auch auf dem Laptop als gelesen. Welches Protokoll passt am besten?",
    "answers": [
      "SMTP",
      "POP3",
      "IMAP",
      "FTP"
    ],
    "correctAnswer": 2,
    "explanation": "IMAP synchronisiert den Zustand der Mailbox über mehrere Geräte.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-151",
    "category": "Netzwerk",
    "topic": "FTP-SFTP",
    "difficulty": "medium",
    "question": "Wofür wird FTP verwendet?",
    "answers": [
      "Dateien hoch- und herunterladen",
      "Domains in IP-Adressen auflösen",
      "E-Mails synchronisieren",
      "Sitzungen für VoIP aufbauen"
    ],
    "correctAnswer": 0,
    "explanation": "FTP dient der Dateiübertragung zwischen Client und Server.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-152",
    "category": "Netzwerk",
    "topic": "FTP-SFTP",
    "difficulty": "medium",
    "question": "Welches Sicherheitsproblem hat klassisches FTP ohne TLS oder einen anderen geschützten Transport?",
    "answers": [
      "Es verhindert die Prüfung von Benutzername und Passwort auf dem Server.",
      "Daten und Passwörter können unverschlüsselt übertragen werden",
      "Es verschlüsselt zwar Dateinamen, lässt aber nur die Dateigröße ungeschützt.",
      "Es schützt Zugangsdaten allein durch die Nutzung einer separaten Datenverbindung."
    ],
    "correctAnswer": 1,
    "explanation": "Klassisches FTP bietet selbst keine Verschlüsselung für Zugangsdaten und Dateiinhalt. Ein Angreifer auf dem Übertragungsweg kann diese Daten bei ungeschütztem Transport mitlesen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-153",
    "category": "Netzwerk",
    "topic": "FTP-SFTP",
    "difficulty": "medium",
    "question": "Was ist SFTP?",
    "answers": [
      "Eine sichere, verschlüsselte Dateiübertragung über SSH",
      "FTP, dessen Steuer- und Datenverbindungen ausschließlich durch TLS geschützt werden.",
      "Eine HTTP-Erweiterung für Dateioperationen über Webressourcen.",
      "Ein Protokoll zur gemeinsamen Nutzung von Dateien und Druckern in Windows-Netzen."
    ],
    "correctAnswer": 0,
    "explanation": "SFTP verwendet SSH für eine verschlüsselte Dateiübertragung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-154",
    "category": "Netzwerk",
    "topic": "Dateiübertragung",
    "difficulty": "medium",
    "question": "Welche Zuordnung unterscheidet FTPS und SFTP korrekt?",
    "answers": [
      "FTPS erweitert FTP um TLS; SFTP verwendet üblicherweise SSH.",
      "FTPS verwendet SSH; SFTP erweitert FTP um TLS.",
      "FTPS und SFTP sind zwei Namen für dasselbe Protokoll auf Port 21.",
      "FTPS und SFTP verwenden dieselben FTP-Kommandos und unterscheiden sich nur durch ihre Portnummer."
    ],
    "correctAnswer": 0,
    "explanation": "FTPS und SFTP sind unterschiedliche Protokolle und nicht ohne Weiteres austauschbar. Ein Client muss das vom Server angebotene Verfahren unterstützen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-155",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "medium",
    "question": "Welcher DNS-Record nennt die für den E-Mail-Empfang einer Domain vorgesehenen Mailserver?",
    "answers": [
      "MX",
      "AAAA",
      "CNAME",
      "PTR"
    ],
    "correctAnswer": 0,
    "explanation": "MX-Einträge nennen Mailserver und eine Präferenz für deren Auswahl. Die Adressen der Servernamen werden anschließend gesondert aufgelöst.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-156",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "medium",
    "question": "Wozu dient ein DNS-CNAME-Record?",
    "answers": [
      "Er verweist von einem Aliasnamen auf einen anderen Domainnamen.",
      "Er speichert unmittelbar eine IPv4-Adresse zu einem Hostnamen.",
      "Er legt die bevorzugten Mailserver einer Domain fest.",
      "Er ordnet einer IP-Adresse einen Namen in einer Reverse-Zone zu."
    ],
    "correctAnswer": 0,
    "explanation": "CNAME beschreibt einen Alias. Zur Ermittlung der Zieladresse muss der kanonische Zielname weiter aufgelöst werden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-157",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "medium",
    "question": "Was begrenzt der TTL-Wert eines gewöhnlich gecachten DNS-Ressourceneintrags?",
    "answers": [
      "Wie lange der Eintrag regulär im Cache weiterverwendet werden darf.",
      "Wie viele Router eine DNS-Anfrage passieren darf.",
      "Wie lange eine TCP-Verbindung zum DNS-Server offen bleiben muss.",
      "Wie viele alternative DNS-Server gleichzeitig befragt werden dürfen."
    ],
    "correctAnswer": 0,
    "explanation": "Die DNS-TTL ist eine Zeitangabe für die reguläre Cache-Nutzung. Sie ist nicht die Hop-Begrenzung eines IP-Pakets.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-158",
    "category": "Netzwerk",
    "topic": "DNS-Diagnose",
    "difficulty": "medium",
    "question": "Welche Einstellung fragt im interaktiven Windows-nslookup anschließend gezielt Mail-Exchanger-Einträge ab?",
    "answers": [
      "set type=MX",
      "set type=A",
      "set type=PTR",
      "set type=NS"
    ],
    "correctAnswer": 0,
    "explanation": "Mit set type=MX wird der Typ folgender DNS-Abfragen auf MX gesetzt. Anschließend kann die zu untersuchende Domain eingegeben werden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-159",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "medium",
    "question": "Was zeichnet einen für eine DNS-Zone autoritativen Nameserver aus?",
    "answers": [
      "Er beantwortet Anfragen für diese Zone aus deren maßgeblichem Datenbestand.",
      "Er speichert ausschließlich zufällig zuvor abgefragte fremde Antworten im Cache.",
      "Er leitet alle Anfragen für seine Zone an einen vorgeschalteten Resolver weiter.",
      "Er muss jede Frage zur eigenen Zone zunächst an einen Root-Server weiterreichen."
    ],
    "correctAnswer": 0,
    "explanation": "Ein autoritativer Server ist für die Daten seiner Zone zuständig. Ein rekursiver Resolver beschafft Antworten für Clients und kann sie zwischenspeichern.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-160",
    "category": "Netzwerk",
    "topic": "Netzwerkdiagnose",
    "difficulty": "medium",
    "question": "traceroute liefert Antworten mehrerer Router auf dem Weg zu einem Ziel. Was lässt sich daraus über den Rückweg der Antwortpakete sicher ableiten?",
    "answers": [
      "Er muss nicht dieselben Router in umgekehrter Reihenfolge durchlaufen.",
      "Er ist immer exakt die Umkehrung des angezeigten Hinwegs.",
      "Er durchläuft genauso viele Router wie der angezeigte Hinweg.",
      "Er lässt sich aus der Laufzeit jeder Antwort eindeutig bestimmen."
    ],
    "correctAnswer": 0,
    "explanation": "IP-Routen können richtungsabhängig sein und sich ändern. Die beobachteten Antworten beweisen daher keinen symmetrischen Rückweg.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-161",
    "category": "Netzwerk",
    "topic": "Datendarstellung",
    "difficulty": "medium",
    "question": "Ein 16-Bit-Feld hat den Wert 0x1234 und wird in Network Byte Order, also Big Endian, übertragen. Welche Bytefolge steht auf dem Netz?",
    "answers": [
      "0x12, 0x34",
      "0x34, 0x12",
      "0x01, 0x23",
      "0x21, 0x43"
    ],
    "correctAnswer": 0,
    "explanation": "Bei Big Endian steht das höchstwertige Byte zuerst. Eine einheitliche Byteordnung verhindert, dass verschiedene Rechner denselben Feldinhalt unterschiedlich interpretieren.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-162",
    "category": "Netzwerk",
    "topic": "OSI Schicht 6",
    "difficulty": "medium",
    "question": "Welche drei Aufgaben werden der OSI-Schicht 6 zugeordnet?",
    "answers": [
      "Übersetzen, Verschlüsseln, Komprimieren",
      "Routing, Switching, NAT",
      "Senden, Empfangen, Löschen",
      "Adressieren, Drucken, Speichern"
    ],
    "correctAnswer": 0,
    "explanation": "Die Darstellungsschicht übersetzt Formate, verschlüsselt und komprimiert.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-163",
    "category": "Netzwerk",
    "topic": "OSI Schicht 6",
    "difficulty": "medium",
    "question": "Welches der folgenden Verfahren ist eine Zeichencodierung für Unicode?",
    "answers": [
      "UTF-8",
      "Base64",
      "AES",
      "SHA-256"
    ],
    "correctAnswer": 0,
    "explanation": "UTF-8 codiert Unicode-Zeichen in Bytefolgen. Base64 stellt Binärdaten als Text dar; AES ist ein Verschlüsselungsverfahren und SHA-256 eine Hashfunktion.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-164",
    "category": "Netzwerk",
    "topic": "OSI Schicht 6",
    "difficulty": "medium",
    "question": "Welche Gruppe enthält ausschließlich Datenformate beziehungsweise Zeichencodierungen?",
    "answers": [
      "JPEG, PNG, UTF-8, JSON, gzip",
      "HTTP, SMTP, DNS, FTP",
      "TCP, UDP, IP, ARP",
      "SIP, RPC, NetBIOS, PPTP"
    ],
    "correctAnswer": 0,
    "explanation": "JPEG und PNG beschreiben Bildformate, UTF-8 eine Zeichencodierung, JSON ein Datenaustauschformat und gzip ein komprimiertes Datenformat.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-165",
    "category": "Netzwerk",
    "topic": "OSI Schicht 6",
    "difficulty": "medium",
    "question": "Was ist ASCII?",
    "answers": [
      "Eine Zeichencodierung für Buchstaben, Zahlen und Zeichen",
      "Ein Verfahren zur verlustfreien Dateikompression",
      "Ein Verfahren zur Darstellung beliebiger Binärdaten als druckbaren Text",
      "Ein Verfahren zur kryptografischen Integritätsprüfung"
    ],
    "correctAnswer": 0,
    "explanation": "ASCII codiert Zeichen als Zahlenwerte.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-166",
    "category": "Netzwerk",
    "topic": "OSI Schicht 6",
    "difficulty": "medium",
    "question": "Wie viele Zeichenplätze hat das ursprüngliche ASCII-System?",
    "answers": [
      "64",
      "128",
      "256",
      "1024"
    ],
    "correctAnswer": 1,
    "explanation": "Das ursprüngliche ASCII umfasst 128 Zeichenplätze.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-167",
    "category": "Netzwerk",
    "topic": "OSI Schicht 6",
    "difficulty": "medium",
    "question": "Warum reicht ASCII für moderne internationale Texte nicht aus?",
    "answers": [
      "Sein begrenzter Zeichenvorrat enthält viele Zeichen anderer Schriftsysteme nicht.",
      "Seine Codes ändern ihre Bedeutung je nach eingestellter Sprache.",
      "Es benötigt für jedes Zeichen mindestens vier Bytes.",
      "Es kann auf Rechnern mit unterschiedlicher Byteordnung nicht ausgetauscht werden."
    ],
    "correctAnswer": 0,
    "explanation": "ASCII hat zu wenige Zeichenplätze für Umlaute, viele Schriftsysteme und Emojis.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-168",
    "category": "Netzwerk",
    "topic": "Zeichencodierung",
    "difficulty": "medium",
    "question": "Wie werden die Zeichen des ursprünglichen 7-Bit-ASCII-Bereichs in UTF-8 codiert?",
    "answers": [
      "Mit denselben einzelnen Bytewerten wie in ASCII.",
      "Immer mit zwei Bytes in umgekehrter Reihenfolge.",
      "Immer mit vier Bytes pro Zeichen.",
      "Innerhalb des ASCII-Bereichs wahlweise mit einem bis vier Bytes pro Zeichen."
    ],
    "correctAnswer": 0,
    "explanation": "Die ASCII-Zeichen U+0000 bis U+007F behalten in UTF-8 ihre Bytewerte. Zeichen außerhalb dieses Bereichs benötigen mehrere Bytes.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-169",
    "category": "Netzwerk",
    "topic": "Zeichencodierung",
    "difficulty": "medium",
    "question": "Ein korrekt als UTF-8 gespeichertes ä erscheint nach dem Decodieren als Ã¤. Welche Ursache passt besonders gut?",
    "answers": [
      "Die UTF-8-Bytes wurden als Windows-1252 interpretiert.",
      "Die UTF-8-Bytes wurden korrekt nach UTF-8 decodiert.",
      "Die verwendete Schriftart besitzt lediglich keine Glyphe für ä.",
      "Eine korrekt rückgängig gemachte verlustfreie Kompression hat die Zeichen verändert."
    ],
    "correctAnswer": 0,
    "explanation": "Das UTF-8-Bytepaar für ä wird bei falscher Interpretation als Windows-1252 zu zwei anderen Zeichen. Sender und Empfänger müssen dieselbe passende Zeichencodierung verwenden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-170",
    "category": "Netzwerk",
    "topic": "HTTP",
    "difficulty": "medium",
    "question": "Ein HTTP-Server sendet unkomprimierten Text, setzt aber Content-Encoding: gzip. Warum kann der Client den Inhalt nicht korrekt verarbeiten?",
    "answers": [
      "Er versucht aufgrund des Headers eine gzip-Dekompression auf ungeeigneten Daten.",
      "Er behandelt gzip als Zeichencodierung und vertauscht deshalb Groß- und Kleinbuchstaben.",
      "Er kann den falschen Header immer allein anhand des MIME-Typs automatisch korrigieren.",
      "Er entfernt nur den gzip-Header aus dem Text, ohne eine Dekompression zu versuchen."
    ],
    "correctAnswer": 0,
    "explanation": "Content-Encoding muss zu den tatsächlich angewendeten Inhaltscodierungen passen. Ein falscher Header kann zur fehlgeschlagenen Dekompression führen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-171",
    "category": "Netzwerk",
    "topic": "TLS",
    "difficulty": "medium",
    "question": "TCP zu einem HTTPS-Server funktioniert. Der Server erlaubt nur TLS 1.3, der Client unterstützt höchstens TLS 1.2. Was verhindert hier den erfolgreichen TLS-Aufbau?",
    "answers": [
      "Es gibt keine gemeinsam unterstützte zulässige TLS-Version.",
      "Die DNS-Antwort enthält zwingend eine falsche IPv4-Adresse.",
      "Der TCP-Dreiwege-Handshake muss daher noch unvollständig sein.",
      "Der HTTP-Statuscode 404 blockiert die Auswahl der TLS-Version."
    ],
    "correctAnswer": 0,
    "explanation": "Client und Server müssen eine zulässige gemeinsame TLS-Version unterstützen. Eine bereits bestehende TCP-Verbindung löst diese Protokollinkompatibilität nicht.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-172",
    "category": "Netzwerk",
    "topic": "Datendarstellung",
    "difficulty": "medium",
    "question": "Ein API-Zugangswert wird nur mit Base64 codiert und ohne weiteren Schutz übertragen. Welche Aussage ist richtig?",
    "answers": [
      "Die Codierung lässt sich ohne geheimen Schlüssel rückgängig machen.",
      "Base64 schützt den Wert mit einem geheimen symmetrischen Schlüssel.",
      "Base64 beweist die Identität des Empfängers durch ein Zertifikat.",
      "Base64 verhindert unbemerkte Manipulation durch eine digitale Signatur."
    ],
    "correctAnswer": 0,
    "explanation": "Base64 ist eine reversible Darstellung von Bytes als Text und keine Verschlüsselung. Vertrauliche Werte benötigen einen geeigneten geschützten Transport.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-173",
    "category": "Netzwerk",
    "topic": "Anwendungssitzungen",
    "difficulty": "medium",
    "question": "Eine Webanwendung erkennt eine angemeldete Sitzung anhand eines gültigen Sitzungstokens. Kann sie diese Sitzung nach dem Aufbau einer neuen TCP-Verbindung weiter zuordnen?",
    "answers": [
      "Ja, wenn der Client das weiterhin gültige Token erneut mitsendet.",
      "Nein, eine Anwendungssitzung ist immer genau eine TCP-Verbindung.",
      "Nur wenn der neue TCP-Quellport dem vorherigen entspricht.",
      "Nein, ein neuer TLS-Handshake macht das Sitzungstoken automatisch ungültig."
    ],
    "correctAnswer": 0,
    "explanation": "Eine Anwendungssitzung kann unabhängig von einer einzelnen Transportverbindung verwaltet werden. Entscheidend sind die Sitzungsregeln der Anwendung und das gültige Token.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-174",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Zwei Anwendungen sollen in einer OSI-Sitzung geregelt abwechselnd senden. Welche Sitzungsfunktion passt dazu?",
    "answers": [
      "Dialogsteuerung",
      "Wahl des nächsten IP-Routers",
      "Zuordnung einer Ziel-MAC-Adresse",
      "Erkennung des elektrischen Signals"
    ],
    "correctAnswer": 0,
    "explanation": "Die Dialogsteuerung kann im OSI-Sitzungsmodell die Reihenfolge beziehungsweise das Senderecht der Kommunikationspartner koordinieren.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-175",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Wozu dienen Checkpoints in der Sitzungsschicht?",
    "answers": [
      "Nach einer Unterbrechung an einem definierten Punkt fortsetzen zu können",
      "Eine Unterbrechung durch zusätzliche Prüfsummen vollständig zu verhindern",
      "Den gesamten Übertragungsfortschritt nach jeder Nachricht zu verwerfen",
      "Die Zustellung aller künftigen Daten ohne weitere Bestätigung zu garantieren"
    ],
    "correctAnswer": 0,
    "explanation": "Vereinbarte Synchronisationspunkte erlauben im OSI-Sitzungsmodell eine koordinierte Wiederaufnahme. Das setzt Unterstützung und passenden Zustand auf den beteiligten Seiten voraus.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-176",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Welche Aufgabe wird der Sitzungsschicht (Schicht 5) im OSI-Modell zugeordnet?",
    "answers": [
      "Aufbau, Steuerung und Beendigung von Sitzungen zwischen Anwendungen",
      "Weiterleitung von Paketen zwischen unterschiedlichen IP-Netzen",
      "Vermittlung von Ethernet-Frames anhand von MAC-Adressen",
      "Übertragung einzelner Bits über ein physisches Medium"
    ],
    "correctAnswer": 0,
    "explanation": "Die Sitzungsschicht koordiniert den Aufbau, die Steuerung und die Beendigung von Sitzungen beziehungsweise Dialogen zwischen Anwendungen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-177",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Welche ältere Dienstschnittstelle umfasst Namens-, Datagramm- und Sitzungsdienste und ist aus klassischen Windows-Netzen bekannt?",
    "answers": [
      "NetBIOS",
      "DNS",
      "mDNS",
      "SMB"
    ],
    "correctAnswer": 0,
    "explanation": "NetBIOS stellt unter anderem Namens- und Sitzungsdienste bereit. NetBIOS over TCP/IP bildet diese Dienste auf IP-Netze ab; moderne Kommunikation setzt NetBIOS nicht generell voraus.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-178",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Wofür steht RPC?",
    "answers": [
      "Remote Procedure Call",
      "Routing Process Channel",
      "Reliable Packet Control",
      "Remote Port Connection"
    ],
    "correctAnswer": 0,
    "explanation": "RPC steht für Remote Procedure Call.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-179",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Was ermöglicht RPC vereinfacht?",
    "answers": [
      "Eine Funktion auf einem entfernten Rechner auszuführen",
      "Eine lokale Funktion innerhalb desselben Prozesses aufzurufen",
      "Den Code vom Server zu laden und ausschließlich lokal auszuführen",
      "Dateien eines entfernten Rechners als lokales Laufwerk einzubinden"
    ],
    "correctAnswer": 0,
    "explanation": "RPC erlaubt den Aufruf von Funktionen auf entfernten Systemen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-180",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Wofür steht SIP?",
    "answers": [
      "Session Initiation Protocol",
      "Secure Internet Packet",
      "System IP Protocol",
      "Simple Interface Port"
    ],
    "correctAnswer": 0,
    "explanation": "SIP steht für Session Initiation Protocol.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-181",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Welche Aufgabe hat SIP bei VoIP hauptsächlich?",
    "answers": [
      "Verbindungsaufbau, Steuerung und Beenden eines Gesprächs",
      "Übertragung der eigentlichen Sprachdaten",
      "Codierung und Decodierung der Sprachsamples.",
      "Ausgleich schwankender Ankunftszeiten durch einen Audiopuffer."
    ],
    "correctAnswer": 0,
    "explanation": "SIP signalisiert und steuert Sitzungen; die eigentlichen Sprachdaten sind nicht seine Hauptaufgabe.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-182",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Was bedeutet SIP-Status 180 Ringing?",
    "answers": [
      "Die Gegenstelle hat den bereits angenommenen Anruf beendet.",
      "Die Gegenstelle alarmiert den Benutzer; der Anruf ist noch nicht angenommen.",
      "Die Gegenstelle meldet, dass das angeforderte Ziel nicht existiert.",
      "Die Gegenstelle lehnt den Anruf wegen eines Besetztzustands ab."
    ],
    "correctAnswer": 1,
    "explanation": "180 Ringing ist eine vorläufige SIP-Antwort. Sie signalisiert das Anrufen beziehungsweise Alarmieren des Benutzers, aber noch keine erfolgreiche Annahme des Gesprächs.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-183",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Was bedeutet SIP-Status 486 Busy Here?",
    "answers": [
      "Gespräch angenommen",
      "Nummer unbekannt",
      "Gegenstelle ist besetzt",
      "Anruf dauerhaft umgeleitet"
    ],
    "correctAnswer": 2,
    "explanation": "486 Busy Here signalisiert eine besetzte Gegenstelle.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-184",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Welcher OSI-Schicht wird SIP als Signalisierungsprotokoll zugeordnet?",
    "answers": [
      "Anwendungsschicht 7",
      "Sitzungsschicht 5",
      "Transportschicht 4",
      "Vermittlungsschicht 3"
    ],
    "correctAnswer": 0,
    "explanation": "SIP ist ein Anwendungsprotokoll zur Signalisierung. Der Begriff Session im Protokollnamen bestimmt nicht seine OSI-Zuordnung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-185",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Wofür wurde PPTP verwendet?",
    "answers": [
      "Für VPN-Tunneling",
      "Für dynamischen Routenaustausch",
      "Für automatische IPv4-Konfiguration",
      "Für Ethernet-Link-Aggregation"
    ],
    "correctAnswer": 0,
    "explanation": "PPTP ist ein älteres VPN-Tunneling-Protokoll.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-186",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Wie wird PPTP aus heutiger Sicherheitssicht bewertet?",
    "answers": [
      "Als zeitgemäße erste Wahl für neue sichere VPN-Installationen.",
      "Als veraltetes Verfahren mit bekannten Sicherheitsproblemen.",
      "Als sicher, sobald MS-CHAPv2 ohne weitere Änderungen aktiviert ist.",
      "Als unabhängig vom Authentisierungsverfahren gleichwertig mit aktuellen VPN-Verfahren."
    ],
    "correctAnswer": 1,
    "explanation": "PPTP gilt als veraltet und sicherheitsproblematisch. Für neue Installationen sollte ein zeitgemäßes, sicher konfiguriertes VPN-Verfahren gewählt werden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-187",
    "category": "Netzwerk",
    "topic": "TCP-Diagnose",
    "difficulty": "medium",
    "question": "Eine Anwendung meldet Connection reset by peer. Im Mitschnitt ist ein TCP-Segment mit gesetztem RST-Flag zu sehen. Auf welcher Ebene wirkt dieser Reset unmittelbar?",
    "answers": [
      "Auf der Transportschicht durch TCP.",
      "Auf der Sicherungsschicht durch Ethernet.",
      "Auf der Vermittlungsschicht durch IP.",
      "Auf der Anwendungsschicht durch einen HTTP-Statuscode."
    ],
    "correctAnswer": 0,
    "explanation": "TCP-RST beendet beziehungsweise verweigert eine Transportverbindung abrupt. Die auslösende Ursache kann in Anwendung, System oder Netzwerk liegen; die Fehlermeldung allein lokalisiert diese Ursache nicht.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-188",
    "category": "Netzwerk",
    "topic": "HTTP",
    "difficulty": "medium",
    "question": "Was bedeutet eine HTTP-Antwort mit Status 408 Request Timeout?",
    "answers": [
      "Der Server hat innerhalb seiner Wartezeit keine vollständige Anfrage erhalten.",
      "Der Client hat innerhalb seiner Wartezeit keine DNS-Antwort erhalten.",
      "Der Server hat innerhalb seiner Wartezeit keinen TCP-SYN empfangen.",
      "Der Browser hat nach dem Anzeigen der Seite seine Anmeldung regulär beendet."
    ],
    "correctAnswer": 0,
    "explanation": "408 ist ein HTTP-Status auf Anwendungsebene. Er beschreibt die serverseitige Wartezeit auf eine vollständige Anfrage und ist kein allgemeiner Nachweis einer abgelaufenen Anmeldung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-189",
    "category": "Netzwerk",
    "topic": "HTTP-Diagnose",
    "difficulty": "medium",
    "question": "Die DNS-Auflösung und der TCP-Verbindungsaufbau zu einem Webserver funktionieren. Der Server antwortet auf die Anfrage mit HTTP 404. Welche Schlussfolgerung ist korrekt?",
    "answers": [
      "HTTP-Ressourcenpfad und Serverkonfiguration sind sinnvolle Prüfpunkte.",
      "Die DNS-Auflösung des Servernamens ist fehlgeschlagen.",
      "Der TCP-Verbindungsaufbau zum Webserver wurde blockiert.",
      "Die physische Netzwerkverbindung zum Client ist unterbrochen."
    ],
    "correctAnswer": 0,
    "explanation": "Die empfangene HTTP-Antwort belegt für diesen Austausch funktionierende Kommunikation bis zur Anwendung. 404 bezeichnet eine nicht gefundene oder nicht offengelegte Ressource; die Ursache kann etwa im Pfad oder in der Serverkonfiguration liegen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-190",
    "category": "Netzwerk",
    "topic": "OSI Szenarien",
    "difficulty": "medium",
    "question": "Ein WLAN-Signal ist so schwach, dass Bits fehlerhaft ankommen. Welche Schicht ist am ehesten betroffen?",
    "answers": [
      "Schicht 1 Bitübertragung",
      "Schicht 4 Transport",
      "Schicht 6 Darstellung",
      "Schicht 7 Anwendung"
    ],
    "correctAnswer": 0,
    "explanation": "Schwaches Funk- oder Kabelsignal ist ein physisches Problem der Bitübertragungsschicht.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-191",
    "category": "Netzwerk",
    "topic": "Routing",
    "difficulty": "medium",
    "question": "Welches IPv4-Präfix bezeichnet die Standardroute?",
    "answers": [
      "0.0.0.0/0",
      "0.0.0.0/32",
      "127.0.0.0/8",
      "255.255.255.255/32"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Präfix der Länge 0 passt zu jeder IPv4-Zieladresse. Es wird verwendet, wenn keine spezifischere passende Route ausgewählt wird.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-192",
    "category": "Netzwerk",
    "topic": "TLS",
    "difficulty": "medium",
    "question": "Ein Reverse Proxy beendet die HTTPS-Verbindung des Browsers und leitet die Anfrage per unverschlüsseltem HTTP zum Backend weiter. Welcher Abschnitt ist durch diese HTTPS-Verbindung geschützt?",
    "answers": [
      "Der Abschnitt zwischen Browser und Reverse Proxy.",
      "Die gesamte Strecke einschließlich des unverschlüsselten Backend-Abschnitts.",
      "Ausschließlich der Abschnitt zwischen Reverse Proxy und Backend.",
      "Beide Abschnitte, sofern der Proxy dieselbe HTTP-Anfrage unverändert weiterleitet."
    ],
    "correctAnswer": 0,
    "explanation": "Die TLS-Verbindung endet am Proxy. Für den Backend-Abschnitt ist bei Bedarf ein eigener Schutz erforderlich.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-193",
    "category": "Netzwerk",
    "topic": "TCP",
    "difficulty": "medium",
    "question": "Ein TCP-Empfänger hat lückenlos die Datenbytes mit Sequenznummern 1000 bis einschließlich 1499 empfangen. Welche nächste erwartete Sequenznummer bestätigt er, wenn keine SYN- oder FIN-Flags beteiligt sind?",
    "answers": [
      "1500",
      "1499",
      "500",
      "1000"
    ],
    "correctAnswer": 0,
    "explanation": "Die kumulative Bestätigung nennt die nächste erwartete Sequenznummer. Nach den 500 Bytes von 1000 bis 1499 ist das 1500.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-194",
    "category": "Netzwerk",
    "topic": "HTTP",
    "difficulty": "medium",
    "question": "Ein HTTP-Server hat eine Anfrage verstanden, verweigert aber ihre Ausführung. Welcher Statuscode beschreibt dies grundsätzlich?",
    "answers": [
      "403 Forbidden",
      "404 Not Found",
      "200 OK",
      "301 Moved Permanently"
    ],
    "correctAnswer": 0,
    "explanation": "403 bedeutet, dass der Server die verstandene Anfrage nicht ausführen will. Ein erneuter Versuch mit unveränderten Angaben muss daher nicht helfen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-195",
    "category": "Netzwerk",
    "topic": "OSI Szenarien",
    "difficulty": "medium",
    "question": "Ein Webserver meldet nach einem unerwarteten Fehler HTTP 500 Internal Server Error. Auf welcher Ebene wird dieser Statuscode ausgetauscht?",
    "answers": [
      "Schicht 1",
      "Schicht 4",
      "Schicht 6",
      "Schicht 7"
    ],
    "correctAnswer": 3,
    "explanation": "HTTP-Statuscodes gehören zur Anwendungsebene. 500 meldet eine unerwartete serverseitige Bedingung, die die Bearbeitung verhindert; die konkrete Ursache muss weiter untersucht werden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-196",
    "category": "Netzwerk",
    "topic": "E-Mail-Protokolle",
    "difficulty": "medium",
    "question": "Welche Abfolge beschreibt den üblichen Weg einer E-Mail vom Absender bis zum Empfänger?",
    "answers": [
      "SMTP-Submission vom Client, SMTP zwischen Mailservern, Abruf oder Synchronisation per IMAP",
      "IMAP vom Absenderclient, DNS zwischen Mailservern, Versand per FTP",
      "POP3 vom Absenderclient, HTTP zwischen Mailservern, Synchronisation per SMTP",
      "FTP vom Absenderclient, IMAP zwischen Mailservern, Zustellung per DNS"
    ],
    "correctAnswer": 0,
    "explanation": "Der Absenderclient übergibt die Nachricht per SMTP-Submission an seinen Mailserver. Zwischen Mailservern wird ebenfalls SMTP verwendet. Der Empfänger greift beispielsweise per IMAP auf seine Mailbox zu.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-197",
    "category": "Netzwerk",
    "topic": "OSI Szenarien",
    "difficulty": "medium",
    "question": "Du möchtest ein Firmenlogo verschlüsselt auf einen Webserver übertragen. Welches Protokoll passt?",
    "answers": [
      "FTP",
      "SFTP",
      "POP3",
      "DNS"
    ],
    "correctAnswer": 1,
    "explanation": "SFTP ermöglicht verschlüsselte Dateiübertragung über SSH.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-198",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "medium",
    "question": "Welcher DNS-Record wird in einer Reverse-DNS-Zone verwendet, um einer IP-Adresse einen Namen zuzuordnen?",
    "answers": [
      "PTR",
      "MX",
      "AAAA",
      "CNAME"
    ],
    "correctAnswer": 0,
    "explanation": "PTR-Einträge dienen unter anderem der Rückwärtsauflösung. Vorwärts- und Rückwärtsdaten werden getrennt gepflegt und müssen nicht automatisch übereinstimmen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-199",
    "category": "Netzwerk",
    "topic": "HTTP/3",
    "difficulty": "medium",
    "question": "Welcher Transport wird für HTTP/3 verwendet?",
    "answers": [
      "QUIC über UDP.",
      "TLS über TCP.",
      "SCTP über IP.",
      "DTLS direkt über UDP."
    ],
    "correctAnswer": 0,
    "explanation": "HTTP/3 verwendet QUIC als Transport. QUIC nutzt UDP und integriert den TLS-Handshake; daraus folgt nicht, dass HTTPS grundsätzlich auf TCP beschränkt ist.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-200",
    "category": "Netzwerk",
    "topic": "MTU/MSS",
    "difficulty": "medium",
    "question": "Eine IPv4-Verbindung hat eine Pfad-MTU von 1500 Byte. IPv4- und TCP-Header sind jeweils 20 Byte lang, ohne Optionen. Wie viele TCP-Nutzdaten passen ohne Fragmentierung in ein solches Paket?",
    "answers": [
      "1460 Byte",
      "1480 Byte",
      "1500 Byte",
      "1540 Byte"
    ],
    "correctAnswer": 0,
    "explanation": "Von der IP-MTU werden beide Header abgezogen: 1500 − 20 − 20 = 1460 Byte. Zusätzliche Header oder Optionen können die verfügbare Nutzlast weiter verringern.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-201",
    "category": "Netzwerk",
    "topic": "Firewall",
    "difficulty": "medium",
    "question": "Ein Client öffnet eine erlaubte TCP-Verbindung von Port 53000 zu einem HTTPS-Server auf Port 443. Was nutzt eine zustandsbehaftete Firewall zur Zuordnung der Antwort zu dieser Verbindung?",
    "answers": [
      "Den gespeicherten TCP-Verbindungszustand und die passenden Endpunkte in Gegenrichtung.",
      "Nur die Tatsache, dass der Antwort-Zielport ebenfalls 443 ist.",
      "Nur die Quell-IP-Adresse unabhängig von Ziel, Ports und Verbindungszustand.",
      "Nur die vorherige DNS-Antwort unabhängig von den TCP-Endpunkten."
    ],
    "correctAnswer": 0,
    "explanation": "Die Antwort kommt typischerweise von Serverport 443 an Clientport 53000. Eine Stateful Firewall kann sie anhand der gespeicherten Verbindung und ihrer Regeln zuordnen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-202",
    "category": "Netzwerk",
    "topic": "E-Mail-Diagnose",
    "difficulty": "medium",
    "question": "Ein Mailserver weist neue eingehende Nachrichten ausdrücklich wegen eines ausgeschöpften Postfachkontingents ab. Welche Maßnahme adressiert diese Ursache?",
    "answers": [
      "Speicherplatz im betroffenen Postfach freigeben oder dessen Kontingent erhöhen.",
      "Nur den lokalen Mailcache löschen, ohne serverseitige Nachrichten zu entfernen.",
      "Nur den betroffenen IMAP-Ordner im Client ausblenden.",
      "Nur die SMTP-Portnummer im Client ändern, ohne den Speicherbedarf zu verringern."
    ],
    "correctAnswer": 0,
    "explanation": "Das Kontingent begrenzt den verfügbaren serverseitigen Postfachspeicher. Die bestätigte Ursache wird durch Freigabe von Speicher oder eine zulässige Quotenänderung behoben.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-203",
    "category": "Netzwerk",
    "topic": "TLS",
    "difficulty": "medium",
    "question": "Ein Browser verbindet sich mit https://shop.example.com. Die Zertifikatskette ist vertrauenswürdig und zeitlich gültig, das Zertifikat gilt aber ausschließlich für mail.example.com. Was ist das Problem?",
    "answers": [
      "Die bestätigte Serveridentität passt nicht zum angefragten Hostnamen.",
      "Die Vertrauenskette muss allein deshalb kryptografisch ungültig sein.",
      "Der Browser muss wegen der gleichen Hauptdomain jeden Subdomainnamen akzeptieren.",
      "Die Gültigkeitsdauer ersetzt die Prüfung des Hostnamens vollständig."
    ],
    "correctAnswer": 0,
    "explanation": "Zur Serverauthentisierung muss der angefragte Name zu einer zulässigen Identität des Zertifikats passen. Eine vertrauenswürdige Signatur und gültige Zeitspanne allein reichen nicht.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-204",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "hard",
    "question": "Ein Unternehmen möchte einfache Fehlersuche und lokale Ausfälle einzelner PCs, akzeptiert aber einen zentralen kritischen Switch. Welche Topologie passt am besten?",
    "answers": [
      "Stern",
      "Bus",
      "Ring",
      "Punkt-zu-Punkt"
    ],
    "correctAnswer": 0,
    "explanation": "Diese Eigenschaften entsprechen der Sterntopologie.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-205",
    "category": "Netzwerk",
    "topic": "Spanning Tree",
    "difficulty": "medium",
    "question": "Drei Layer-2-Switches sind innerhalb desselben VLANs zu einem Dreieck verbunden. Welche Aufgabe erfüllt ein korrekt arbeitendes Spanning Tree Protocol?",
    "answers": [
      "Es bildet durch geeignete Portzustände eine schleifenfreie aktive Weiterleitungsstruktur.",
      "Es verteilt jeden Broadcast gleichzeitig über alle Verbindungen des Dreiecks.",
      "Es ersetzt die VLAN-Trennung durch eine gemeinsame dynamische Routingtabelle.",
      "Es verwendet alle redundanten Links wie einen automatisch gebündelten Kanal."
    ],
    "correctAnswer": 0,
    "explanation": "STP hält eine schleifenfreie aktive Layer-2-Struktur aufrecht. Bei Änderungen können andere Verbindungen für die Weiterleitung nutzbar werden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-206",
    "category": "Netzwerk",
    "topic": "Spanning Tree",
    "difficulty": "medium",
    "question": "Welche Bridge wird in einer gemeinsamen STP-Instanz als Root Bridge gewählt?",
    "answers": [
      "Die Bridge mit der niedrigsten Bridge-ID.",
      "Die Bridge mit der höchsten Bridge-ID.",
      "Die Bridge mit den meisten belegten Access-Ports.",
      "Die Bridge mit der zuletzt gelernten MAC-Adresse."
    ],
    "correctAnswer": 0,
    "explanation": "Die Root-Wahl basiert auf der Bridge-ID, die unter anderem Priorität und MAC-Adresse enthält. Die niedrigste ID gewinnt.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-207",
    "category": "Netzwerk",
    "topic": "Netzarchitekturen",
    "difficulty": "medium",
    "question": "Mehrere PCs sind sternförmig an einen Switch angeschlossen und tauschen Dateien über eine P2P-Anwendung aus. Welche Aussage ist korrekt?",
    "answers": [
      "Physische Sterntopologie und P2P-Anwendungsarchitektur lassen sich kombinieren.",
      "P2P erfordert eine direkte physische Leitung zwischen jedem PC-Paar.",
      "Eine Sterntopologie zwingt jede Anwendung zum Client-Server-Modell.",
      "P2P erfordert eine gemeinsame koaxiale Busleitung."
    ],
    "correctAnswer": 0,
    "explanation": "Physische Topologie und Dienstarchitektur beschreiben unterschiedliche Aspekte. Gleichberechtigte Peers können über ein geswitchtes Sternnetz kommunizieren.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-208",
    "category": "Netzwerk",
    "topic": "Client-Server",
    "difficulty": "medium",
    "question": "Zwei Server bieten denselben Dienst hinter einem Load Balancer an. Einer beantwortet dessen Anwendungs-Health-Check nicht mehr. Wozu dient dieser Check?",
    "answers": [
      "Der Load Balancer kann neue Anfragen auf geeignete Server beschränken.",
      "Der Load Balancer kann laufende Transaktionen ohne weiteren Zustand vollständig rekonstruieren.",
      "Der Load Balancer kann damit alle Datenänderungen zwischen den Servern replizieren.",
      "Der Load Balancer kann dadurch auf Wiederholungen fehlgeschlagener Anfragen verzichten."
    ],
    "correctAnswer": 0,
    "explanation": "Health-Checks helfen, nicht funktionsfähige Dienstinstanzen aus der Verteilung zu nehmen. Sie ersetzen keine Replikation oder abgestimmte Anwendungsarchitektur.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-209",
    "category": "Netzwerk",
    "topic": "HTTP",
    "difficulty": "medium",
    "question": "Mehrere HTTP/1.1-Websites verwenden dieselbe Server-IP und denselben Port. Welches Request-Feld nennt den gewünschten Hostnamen?",
    "answers": [
      "Host",
      "Content-Length",
      "Content-Encoding",
      "User-Agent"
    ],
    "correctAnswer": 0,
    "explanation": "Das Host-Feld nennt die Ziel-Authority und ermöglicht die Zuordnung zum gewünschten virtuellen Host. Es ist keine DNS-Abfrage.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-210",
    "category": "Netzwerk",
    "topic": "Anwendungsschicht",
    "difficulty": "medium",
    "question": "Ein Browser lädt eine Seite über HTTP/1.1, TLS und TCP. Welche Aussage beschreibt das Zusammenspiel mit den Protokollebenen?",
    "answers": [
      "Der Browser nutzt Anwendungsprotokolle und darunterliegende Netzwerkfunktionen.",
      "Der gesamte Browser einschließlich Grafikdarstellung entspricht genau einer OSI-Schicht.",
      "Jede verwendete OSI-Schicht muss in einem separaten Programm ausgeführt werden.",
      "Die HTTP-Implementierung übernimmt unmittelbar die elektrische Signalerzeugung am Kabel."
    ],
    "correctAnswer": 0,
    "explanation": "OSI-Schichten ordnen Kommunikationsaufgaben. Sie sind keine starre Aufteilung ganzer Programme oder Prozesse.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-211",
    "category": "Netzwerk",
    "topic": "Anwendungsschicht",
    "difficulty": "medium",
    "question": "Welches Protokoll gehört typischerweise zur Anwendungsschicht?",
    "answers": [
      "HTTP",
      "Ethernet",
      "IP",
      "ARP"
    ],
    "correctAnswer": 0,
    "explanation": "HTTP ist ein Anwendungsprotokoll.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-212",
    "category": "Netzwerk",
    "topic": "HTTP",
    "difficulty": "medium",
    "question": "Welche Anforderung entspricht der vorgesehenen Semantik von HTTP GET?",
    "answers": [
      "Eine Darstellung der Zielressource abrufen.",
      "Eine Ressource durch den mitgesendeten Inhalt ersetzen.",
      "Die Zielressource ausdrücklich löschen.",
      "Eine neue Serverkonfiguration zwingend speichern."
    ],
    "correctAnswer": 0,
    "explanation": "GET dient dem Abruf und ist als sichere Methode definiert: Der Client fordert keine Zustandsänderung an. Protokollierung oder andere Nebenwirkungen können trotzdem auftreten.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-213",
    "category": "Netzwerk",
    "topic": "HTTP",
    "difficulty": "medium",
    "question": "Wozu dient das HTTP-Feld Content-Type bei einer Antwort mit Nachrichteninhalt?",
    "answers": [
      "Es beschreibt den Medientyp der übertragenen Darstellung.",
      "Es nennt die auf den Inhalt angewendete Kompression.",
      "Es gibt die Länge der übertragenen Darstellung in Bytes an.",
      "Es legt die Zeit fest, bis zu der ein Cache die Antwort verwenden darf."
    ],
    "correctAnswer": 0,
    "explanation": "Content-Type beschreibt den Medientyp, etwa text/html oder application/json. Content-Encoding beschreibt dagegen eine angewendete Inhaltscodierung wie gzip.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-214",
    "category": "Netzwerk",
    "topic": "HTTP",
    "difficulty": "medium",
    "question": "Ein HTTP-Server antwortet mit 301 Moved Permanently und einem Location-Feld. Was teilt er damit mit?",
    "answers": [
      "Die Ressource hat dauerhaft eine andere URI, die im Location-Feld genannt wird.",
      "Die Ressource hat nur vorübergehend eine andere URI, die nicht gespeichert werden sollte.",
      "Die Anfrage wurde wegen fehlender Berechtigung abgewiesen.",
      "Die Ressource ist unverändert verfügbar, der Client soll nur seine lokale Kopie verwenden."
    ],
    "correctAnswer": 0,
    "explanation": "301 signalisiert eine dauerhafte neue URI. Ein Client kann unter Berücksichtigung seiner Regeln der angegebenen Zieladresse folgen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-215",
    "category": "Netzwerk",
    "topic": "HTTP",
    "difficulty": "medium",
    "question": "Ein HTTP-Reverse-Proxy erhält vom angesprochenen Upstream eine ungültige Antwort. Welcher Status beschreibt dieses Gateway-Problem?",
    "answers": [
      "502 Bad Gateway",
      "504 Gateway Timeout",
      "503 Service Unavailable",
      "403 Forbidden"
    ],
    "correctAnswer": 0,
    "explanation": "502 meldet eine ungültige Antwort vom Upstream. 504 bezeichnet dagegen das Ausbleiben einer rechtzeitigen Upstream-Antwort.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-216",
    "category": "Netzwerk",
    "topic": "Anwendungsschicht",
    "difficulty": "medium",
    "question": "Welche Kombination besteht nur aus typischen Protokollen/Diensten der Anwendungsschicht?",
    "answers": [
      "HTTP, SMTP, DNS",
      "IP, ARP, Ethernet",
      "TCP, UDP, IP",
      "MAC, VLAN, CSMA/CD"
    ],
    "correctAnswer": 0,
    "explanation": "HTTP, SMTP und DNS sind typische Dienste/Protokolle auf Anwendungsebene.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-217",
    "category": "Netzwerk",
    "topic": "HTTP",
    "difficulty": "medium",
    "question": "Welche Eigenschaft unterscheidet eine reguläre Antwort auf HTTP HEAD von einer entsprechenden Antwort auf GET?",
    "answers": [
      "Die HEAD-Antwort enthält keinen Nachrichteninhalt.",
      "Die HEAD-Antwort enthält keinen Statuscode.",
      "Die HEAD-Antwort darf keine Metadaten der Ressource enthalten.",
      "Die HEAD-Antwort muss die Ressource auf dem Server verändern."
    ],
    "correctAnswer": 0,
    "explanation": "HEAD fordert die Antwortmetadaten ähnlich wie GET an, aber ohne den Nachrichteninhalt.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-218",
    "category": "Netzwerk",
    "topic": "HTTP",
    "difficulty": "medium",
    "question": "HTTP wird als zustandsloses Protokoll beschrieben. Wie kann eine Webanwendung trotzdem mehrere Anfragen derselben Anmeldung zuordnen?",
    "answers": [
      "Sie verwendet zusätzliche Anwendungsmechanismen wie ein Sitzungstoken.",
      "Sie setzt voraus, dass HTTP jede Anmeldung ohne Kennung dauerhaft wiedererkennt.",
      "Sie verwendet ausschließlich die aktuelle TCP-Portnummer als dauerhafte Benutzerkennung.",
      "Sie behandelt jede neue TLS-Verbindung automatisch als Anmeldung desselben Benutzers."
    ],
    "correctAnswer": 0,
    "explanation": "HTTP definiert nicht automatisch eine dauerhafte Benutzersitzung. Anwendungen ergänzen eigene Zustands- und Identifikationsmechanismen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-219",
    "category": "Netzwerk",
    "topic": "TLS",
    "difficulty": "medium",
    "question": "Wozu dient Server Name Indication (SNI) im TLS-Handshake?",
    "answers": [
      "Der Client nennt den gewünschten Servernamen zur Auswahl der TLS-Konfiguration.",
      "Der Client bestätigt damit bereits die Vertrauenswürdigkeit des Serverzertifikats.",
      "Der Server übermittelt damit bereits den vollständigen HTTP-Antwortinhalt.",
      "Der Client wählt damit die IPv4-Adresse durch eine DNS-Abfrage aus."
    ],
    "correctAnswer": 0,
    "explanation": "SNI kann bei mehreren virtuellen Hosts helfen, früh die passende TLS-Konfiguration beziehungsweise das Zertifikat auszuwählen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-220",
    "category": "Netzwerk",
    "topic": "TCP",
    "difficulty": "medium",
    "question": "Eine Anwendung sendet zwei Nachrichten nacheinander über dieselbe TCP-Verbindung. Welche Aussage zu einem Leseaufruf beim Empfänger ist richtig?",
    "answers": [
      "Er kann Teile einer Nachricht oder Daten mehrerer Nachrichten liefern.",
      "Er liefert grundsätzlich genau eine vollständige gesendete Nachricht.",
      "Er liefert grundsätzlich genau ein ursprüngliches TCP-Segment.",
      "Er erhält die ursprünglichen Nachrichtengrenzen automatisch durch das PSH-Flag."
    ],
    "correctAnswer": 0,
    "explanation": "TCP stellt einen Bytestrom bereit und erhält keine Anwendungsnachrichtengrenzen. Die Anwendung braucht ein Framing, etwa Längenfelder oder Trennzeichen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-221",
    "category": "Netzwerk",
    "topic": "E-Mail",
    "difficulty": "medium",
    "question": "Welcher TCP-Port ist standardmäßig für SMTP Message Submission durch einen Mailclient vorgesehen, wobei TLS per STARTTLS ausgehandelt werden kann?",
    "answers": [
      "587",
      "25",
      "143",
      "993"
    ],
    "correctAnswer": 0,
    "explanation": "Port 587 ist für Message Submission vorgesehen. Port 25 dient dem Server-zu-Server-Transport; Submission mit implizitem TLS verwendet üblicherweise 465.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-222",
    "category": "Netzwerk",
    "topic": "IMAP",
    "difficulty": "medium",
    "question": "Welcher TCP-Port ist standardmäßig für IMAP mit implizitem TLS vorgesehen?",
    "answers": [
      "993",
      "143",
      "995",
      "465"
    ],
    "correctAnswer": 0,
    "explanation": "Bei IMAP mit implizitem TLS beginnt unmittelbar nach dem TCP-Aufbau der TLS-Handshake. Der Standardport ist 993.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-223",
    "category": "Netzwerk",
    "topic": "DNSSEC",
    "difficulty": "medium",
    "question": "Was kann ein validierender Resolver mit DNSSEC für korrekt signierte und vertrauenswürdig verknüpfte DNS-Daten prüfen?",
    "answers": [
      "Authentizität des Ursprungs und Integrität der DNS-Daten.",
      "Vertraulichkeit sämtlicher DNS-Anfragen auf dem Übertragungsweg.",
      "Vertrauenswürdigkeit der Inhalte der dadurch gefundenen Website.",
      "Berechtigung des abfragenden Benutzers zum Lesen der Website."
    ],
    "correctAnswer": 0,
    "explanation": "DNSSEC ermöglicht kryptografische Datenvalidierung über eine Vertrauenskette. Es verschlüsselt die DNS-Abfrage nicht und bewertet keinen Website-Inhalt.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-224",
    "category": "Netzwerk",
    "topic": "SFTP-Diagnose",
    "difficulty": "medium",
    "question": "Eine SFTP-Verbindung ist authentisiert. Das Auflisten eines Verzeichnisses funktioniert, das Hochladen meldet Permission denied. Was sollte gezielt geprüft werden?",
    "answers": [
      "Die Schreibberechtigung des Kontos für das Zielverzeichnis.",
      "Ausschließlich die Auflösung des bereits verbundenen Servernamens.",
      "Die unterstützten SSH-Versionen vor dem bereits abgeschlossenen Handshake.",
      "Die Erreichbarkeit des bereits erfolgreich verwendeten TCP-Ports."
    ],
    "correctAnswer": 0,
    "explanation": "Authentisierung und Autorisierung sind verschieden. Lesezugriff kann funktionieren, während Schreibrechte oder serverseitige Einschränkungen den Upload verhindern.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-225",
    "category": "Netzwerk",
    "topic": "VoIP-Diagnose",
    "difficulty": "medium",
    "question": "Ein VoIP-Anruf wird per SIP aufgebaut, aber es ist keine Sprache hörbar. Welche zusätzliche Prüfung ist sinnvoll?",
    "answers": [
      "Den ausgehandelten RTP-Pfad einschließlich Filter- und NAT-Regeln prüfen.",
      "Aus dem SIP-Aufbau folgern, dass auch der Medienpfad funktionieren muss.",
      "Sämtliche Sprachdaten ausschließlich in SIP-Statusantworten suchen.",
      "Eine erneute SIP-Registrierung als vollständigen Audiotest betrachten."
    ],
    "correctAnswer": 0,
    "explanation": "Signalisierung und Medien können unterschiedliche Ports und Wege nutzen. Ein SIP-Aufbau beweist keine funktionierende RTP-Übertragung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-226",
    "category": "Netzwerk",
    "topic": "E-Mail/MIME",
    "difficulty": "medium",
    "question": "Wozu dient eine MIME-Nachricht mit Content-Type: multipart/mixed?",
    "answers": [
      "Sie fasst mehrere Inhaltsteile wie Text und Dateianhänge zusammen.",
      "Sie nennt ausschließlich gleichwertige Darstellungen desselben Inhalts.",
      "Sie verschlüsselt sämtliche Inhaltsteile automatisch Ende zu Ende.",
      "Sie legt die SMTP-Relay-Server und deren Reihenfolge fest."
    ],
    "correctAnswer": 0,
    "explanation": "multipart/mixed ermöglicht mehrere Teile mit jeweils eigenen Inhaltsangaben. Es ist keine automatische Verschlüsselung; alternative Darstellungen haben einen anderen Multipart-Subtyp.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-227",
    "category": "Netzwerk",
    "topic": "SMTP",
    "difficulty": "medium",
    "question": "Welche Angabe legt in einer SMTP-Transaktion die tatsächlichen Envelope-Empfänger fest?",
    "answers": [
      "Die angenommenen RCPT-TO-Kommandos.",
      "Ausschließlich das sichtbare To-Feld im Nachrichteninhalt.",
      "Ausschließlich das Reply-To-Feld der Nachricht.",
      "Ausschließlich das im Mailprogramm angezeigte From-Feld."
    ],
    "correctAnswer": 0,
    "explanation": "SMTP transportiert Empfänger im Envelope unabhängig von den sichtbaren Inhalts-Headern. So kann eine Bcc-Zustellung erfolgen, ohne den Empfänger im sichtbaren To-Feld zu nennen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-228",
    "category": "Netzwerk",
    "topic": "TLS",
    "difficulty": "medium",
    "question": "Eine Website wird mit einer gültig authentisierten HTTPS-Verbindung geladen. Welche Schlussfolgerung ist trotzdem nicht gerechtfertigt?",
    "answers": [
      "Der Betreiber ist vertrauenswürdig und seine Angebote sind frei von Betrug.",
      "Die Verbindung schützt die übertragenen Anwendungsdaten.",
      "Die geprüfte Zertifikatsidentität passt zum angefragten Hostnamen.",
      "Die geschützten Daten werden unterwegs auf unbemerkte Veränderung geprüft."
    ],
    "correctAnswer": 0,
    "explanation": "HTTPS schützt die Verbindung und authentisiert den angesprochenen Host im Rahmen der Zertifikatsprüfung. Auch betrügerische Websites können gültige Zertifikate besitzen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-229",
    "category": "Netzwerk",
    "topic": "VLSM",
    "difficulty": "medium",
    "question": "Ein IPv4-/24-Block soll Teilnetze für 60, 28 und 12 nutzbare Hosts bereitstellen. Welche Präfixfolge erfüllt die Anforderungen jeweils mit dem kleinsten klassischen Subnetz?",
    "answers": [
      "/26, /27 und /28",
      "/27, /28 und /29",
      "/25, /26 und /27",
      "/26, /28 und /28"
    ],
    "correctAnswer": 0,
    "explanation": "Die klassischen Hostkapazitäten sind 62, 30 und 14. Diese Blöcke lassen sich passend ausgerichtet und ohne Überlappung in einem /24 unterbringen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-230",
    "category": "Netzwerk",
    "topic": "Subnetting",
    "difficulty": "medium",
    "question": "Zwei unterschiedliche IPv4-Subnetze sind auf demselben ungetrennten Ethernet-VLAN konfiguriert. Was gilt für einen gewöhnlichen Ethernet-Broadcast ohne zusätzliche Filter?",
    "answers": [
      "Er kann Teilnehmer beider IP-Subnetze innerhalb dieses VLANs erreichen.",
      "Er bleibt allein aufgrund der IP-Präfixe auf eines der Subnetze beschränkt.",
      "Er muss vor der Zustellung an jeden Teilnehmer vom Standardgateway geroutet werden.",
      "Er wird nur von Teilnehmern empfangen, deren Standardgateway im ersten IP-Subnetz liegt."
    ],
    "correctAnswer": 0,
    "explanation": "IP-Subnetting allein trennt keine Ethernet-Broadcast-Domäne. Ob der empfangene Inhalt anschließend auf IP-Ebene verarbeitet wird, ist eine weitere Frage.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-231",
    "category": "Netzwerk",
    "topic": "Subnetting",
    "difficulty": "medium",
    "question": "Ein Gastnetz und ein internes Netz liegen in getrennten VLANs und werden geroutet. Wie lässt sich der Zugriff der Gäste auf interne Server gezielt beschränken?",
    "answers": [
      "Durch geeignete Firewall- oder ACL-Regeln am kontrollierten Übergang.",
      "Allein durch unterschiedliche IP-Präfixe bei uneingeschränkt erlaubtem Routing.",
      "Allein durch unterschiedliche Namen der beiden WLAN-SSIDs.",
      "Allein durch kürzere DHCP-Lease-Zeiten im Gastnetz."
    ],
    "correctAnswer": 0,
    "explanation": "Trennung schafft kontrollierbare Übergänge. Die gewünschte Zugriffspolitik muss dort mit passenden Regeln durchgesetzt werden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-232",
    "category": "Netzwerk",
    "topic": "IPv6",
    "difficulty": "medium",
    "question": "Wie lang ist eine vollständige IPv6-Adresse?",
    "answers": [
      "128 Bit",
      "32 Bit",
      "48 Bit",
      "64 Bit"
    ],
    "correctAnswer": 0,
    "explanation": "Eine IPv6-Adresse umfasst 128 Bit. Eine Präfixlänge wie /64 bezeichnet nur den Präfixanteil, nicht die Gesamtlänge der Adresse.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-233",
    "category": "Netzwerk",
    "topic": "IPv6",
    "difficulty": "medium",
    "question": "Warum darf die Nullgruppen-Abkürzung :: in einer einzelnen IPv6-Adresse höchstens einmal vorkommen?",
    "answers": [
      "Sonst wäre die Verteilung der ausgelassenen Nullgruppen nicht eindeutig.",
      "Weil :: stets genau eine Nullgruppe ersetzt und längere Folgen nicht darstellen kann.",
      "Weil IPv6-Adressen höchstens eine Nullgruppe enthalten dürfen.",
      "Weil jede Abkürzung automatisch eine neue Präfixlänge festlegt."
    ],
    "correctAnswer": 0,
    "explanation": ":: ersetzt eine zusammenhängende Folge von Nullgruppen. Zwei solche Stellen ließen nicht eindeutig erkennen, wie viele Gruppen jeweils fehlen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-234",
    "category": "Netzwerk",
    "topic": "IPv6",
    "difficulty": "medium",
    "question": "Welche Aussage über Broadcast bei IPv6 ist korrekt?",
    "answers": [
      "IPv6 hat keine Broadcastadressen; entsprechende Gruppenfunktionen nutzen Multicast.",
      "IPv6 verwendet ::1 als Broadcastadresse für den gesamten Link.",
      "IPv6 verwendet die höchste Adresse jedes /64-Präfixes als Broadcast.",
      "IPv6 verwendet eine Adresse aus 128 gesetzten Bits als universellen Broadcast."
    ],
    "correctAnswer": 0,
    "explanation": "IPv6 ersetzt Broadcastfunktionen durch geeignete Multicastgruppen. ::1 ist Loopback und keine Gruppenadresse.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-235",
    "category": "Netzwerk",
    "topic": "IPv6",
    "difficulty": "medium",
    "question": "Über welche regulären Nachrichten lernt ein IPv6-Host automatisch verfügbare Standardrouter auf seinem Link?",
    "answers": [
      "ICMPv6 Router Advertisements.",
      "ICMPv6 Neighbor Advertisements ohne Router Advertisement.",
      "DHCPv6-Reply-Nachrichten zur reinen Adressvergabe.",
      "ICMPv6 Echo Replies des nächstgelegenen Hosts."
    ],
    "correctAnswer": 0,
    "explanation": "Router Advertisements können einen Router mit entsprechender Lebensdauer als Standardrouter bekannt machen. DHCPv6 allein liefert im üblichen Verfahren keinen Standardgateway-Eintrag.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-236",
    "category": "Netzwerk",
    "topic": "IPv6",
    "difficulty": "medium",
    "question": "Welche der folgenden IPv6-Adressen ist eine Link-Local-Unicast-Adresse?",
    "answers": [
      "fe80::1234",
      "2001:db8::1234",
      "ff02::1",
      "::1"
    ],
    "correctAnswer": 0,
    "explanation": "fe80::1234 liegt im Link-Local-Bereich. ff02::1 ist Multicast, ::1 Loopback und 2001:db8::/32 ist für Dokumentationsbeispiele vorgesehen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-237",
    "category": "Netzwerk",
    "topic": "DHCP",
    "difficulty": "medium",
    "question": "Ein DHCPv4-Server steht in einem anderen IP-Subnetz als die Clients. Welche Funktion ermöglicht die reguläre Vermittlung ihrer anfänglichen DHCP-Broadcasts zum Server?",
    "answers": [
      "Ein passend konfigurierter DHCP-Relay-Agent.",
      "Eine DHCP-Reservierung ohne Relay-Agent",
      "Eine längere DHCP-Lease-Dauer ohne Relay-Agent",
      "Gewöhnliches IP-Routing ohne Relay-Agent"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Relay vermittelt DHCP-Nachrichten zwischen Clientnetz und Server. Router leiten lokale DHCP-Broadcasts nicht einfach wie gewöhnlichen Unicast weiter.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-238",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "medium",
    "question": "Wofür steht CA in CSMA/CA?",
    "answers": [
      "Collision Avoidance",
      "Connection Address",
      "Cable Access",
      "Client Assignment"
    ],
    "correctAnswer": 0,
    "explanation": "CA steht für Collision Avoidance.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-239",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "medium",
    "question": "Wofür steht CD in CSMA/CD?",
    "answers": [
      "Collision Detection",
      "Client Discovery",
      "Cable Distribution",
      "Connection Delay"
    ],
    "correctAnswer": 0,
    "explanation": "CD steht für Collision Detection.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-240",
    "category": "Netzwerk",
    "topic": "WLAN",
    "difficulty": "medium",
    "question": "Zwei WLAN-Stationen erreichen denselben Access Point, können sich gegenseitig aber nicht hören. Warum können ihre Übertragungen dennoch kollidieren?",
    "answers": [
      "Beide können das Medium lokal für frei halten und gleichzeitig zum Access Point senden.",
      "Der Access Point kann aufgrund derselben SSID keine Frames verschiedener Sender unterscheiden.",
      "Das Abhören prüft nur die Auslastung des IP-Routers, nicht das lokale Funkmedium.",
      "Die gegenseitige Funkabschattung sorgt zwangsläufig für identische Backoff-Werte."
    ],
    "correctAnswer": 0,
    "explanation": "Beim Hidden-Node-Problem erkennen Stationen die Übertragungen der jeweils anderen nicht. Ihre Signale können sich trotzdem am gemeinsamen Empfänger überlagern.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-241",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "medium",
    "question": "Nach einer erkannten Kollision sendet eine Ethernet-Station ein Jam-Signal und bricht die Übertragung ab. Was bestimmt, wann sie erneut sendet?",
    "answers": [
      "Eine zufällige Backoff-Zeit",
      "Ein für alle beteiligten Stationen identischer fester Soforttermin.",
      "Eine anhand der Quell-MAC dauerhaft festgelegte Wartezeit.",
      "Ein vom Empfänger nach jeder Kollision zugewiesener exklusiver Zeitschlitz."
    ],
    "correctAnswer": 0,
    "explanation": "CSMA/CD verwendet vor dem erneuten Sendeversuch eine zufällige Wartezeit. Der binäre exponentielle Backoff vergrößert nach weiteren Kollisionen den möglichen Wartebereich.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-242",
    "category": "Netzwerk",
    "topic": "WLAN",
    "difficulty": "medium",
    "question": "Welche optionale WLAN-Funktion kann die Auswirkungen versteckter Stationen auf längere Datenübertragungen verringern?",
    "answers": [
      "Ein RTS/CTS-Austausch vor der Datenübertragung.",
      "Das Abschalten der physikalischen Trägerprüfung.",
      "Das Verbergen des SSID-Namens in regulären Beacons.",
      "Eine identische feste Backoff-Zeit für alle Stationen."
    ],
    "correctAnswer": 0,
    "explanation": "RTS/CTS kann das Medium über kurze Kontrollframes reservieren und Hidden-Node-Konflikte verringern. Das Verfahren verursacht Zusatzaufwand und beseitigt nicht jede Störung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-243",
    "category": "Netzwerk",
    "topic": "Link Aggregation",
    "difficulty": "medium",
    "question": "Zwei 1-Gbit/s-Links bilden ein Aggregat. Jeder Datenfluss wird per Hash vollständig einem Mitgliedslink zugeordnet. Welche Aussage zu einem einzelnen großen Datenfluss ist richtig?",
    "answers": [
      "Er bleibt auf die Kapazität seines ausgewählten 1-Gbit/s-Links begrenzt.",
      "Er nutzt automatisch beide Links gleichzeitig mit insgesamt 2 Gbit/s.",
      "Er wechselt für jedes Byte abwechselnd zwischen beiden Links.",
      "Er muss auf beiden Links vollständig doppelt übertragen werden."
    ],
    "correctAnswer": 0,
    "explanation": "Bei einer Zuordnung pro Datenfluss nutzt ein einzelner Flow nur einen Mitgliedslink. Mehrere geeignet verteilte Flows können zusammen die Kapazität mehrerer Links nutzen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-244",
    "category": "Netzwerk",
    "topic": "WLAN",
    "difficulty": "medium",
    "question": "Nach einem WLAN-Unicast bleibt die erwartete Empfangsbestätigung aus. Was lässt sich daraus sicher schließen?",
    "answers": [
      "Die erfolgreiche Übertragung wurde dem Sender nicht bestätigt.",
      "Es hat mit Sicherheit eine Kollision mit genau einer anderen Station stattgefunden.",
      "Der Empfänger hat den Datenframe mit Sicherheit nie erhalten.",
      "Die IP-Adresse des Empfängers ist mit Sicherheit falsch."
    ],
    "correctAnswer": 0,
    "explanation": "Datenframe oder ACK können verloren gegangen sein, etwa durch Störungen. Ein fehlendes ACK beweist daher weder eine bestimmte Ursache noch das sichere Ausbleiben des Datenempfangs.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-245",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "medium",
    "question": "Worin unterscheiden sich CSMA/CA und CSMA/CD?",
    "answers": [
      "CA versucht Kollisionen zu vermeiden, CD erkennt sie während der Übertragung",
      "CA erkennt Kollisionen sicher während des eigenen Sendens; CD arbeitet nur mit vorab verteilten Tokens.",
      "CA und CD vermeiden jede Kollision allein durch das Abhören eines freien Mediums.",
      "CA und CD beginnen jeden Sendeversuch ohne vorherige Prüfung des gemeinsam genutzten Mediums."
    ],
    "correctAnswer": 0,
    "explanation": "Beide prüfen das gemeinsam genutzte Medium. CSMA/CA versucht Kollisionen durch abgestimmtes Warten zu vermeiden; CSMA/CD erkennt sie während des Sendens und bricht die Übertragung ab.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-246",
    "category": "Netzwerk",
    "topic": "FTP-SFTP",
    "difficulty": "medium",
    "question": "Wofür steht FTP?",
    "answers": [
      "File Transfer Protocol",
      "Fast Transport Port",
      "File Tunnel Protection",
      "Frame Transfer Process"
    ],
    "correctAnswer": 0,
    "explanation": "FTP steht für File Transfer Protocol.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-247",
    "category": "Netzwerk",
    "topic": "FTP",
    "difficulty": "medium",
    "question": "Welche Aussage über klassisches FTP ist korrekt?",
    "answers": [
      "Steuerkommandos und Dateidaten werden über getrennte TCP-Verbindungen übertragen.",
      "Steuerkommandos und Dateidaten verwenden grundsätzlich dieselbe TCP-Verbindung.",
      "Der Steuerkanal wird vor jedem Datenkanal zwingend dauerhaft geschlossen.",
      "Der Datenkanal muss bei aktivem und passivem FTP stets denselben Server-Zielport verwenden."
    ],
    "correctAnswer": 0,
    "explanation": "FTP trennt den Steuerkanal vom Datenkanal. Deshalb kann eine Anmeldung funktionieren, obwohl eine Datenverbindung durch Netz- oder Filterkonfiguration scheitert.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-248",
    "category": "Netzwerk",
    "topic": "FTP",
    "difficulty": "medium",
    "question": "Wer baut bei passivem FTP die TCP-Datenverbindung auf?",
    "answers": [
      "Der Client verbindet sich mit dem vom Server angekündigten Datenport.",
      "Der Server verbindet sich mit einem vom Client angekündigten Datenport.",
      "Der Server verbindet sich immer von seinem Steuerport mit dem Client-Steuerport.",
      "Client und Server verwenden die bestehende Steuerverbindung ohne separaten Datenkanal."
    ],
    "correctAnswer": 0,
    "explanation": "Im passiven Modus stellt der Server einen Datenport bereit, zu dem der Client eine Verbindung aufbaut. Passende Server- und Firewallkonfiguration bleibt erforderlich.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-249",
    "category": "Netzwerk",
    "topic": "FTP-SFTP",
    "difficulty": "medium",
    "question": "Wofür steht SFTP?",
    "answers": [
      "SSH File Transfer Protocol",
      "Secure File Text Process",
      "Simple FTP Tunnel Protocol",
      "System File Transfer Port"
    ],
    "correctAnswer": 0,
    "explanation": "SFTP steht für SSH File Transfer Protocol.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-250",
    "category": "Netzwerk",
    "topic": "SFTP",
    "difficulty": "medium",
    "question": "Ein Client unterstützt ausschließlich klassisches FTP. Kann er allein durch Wahl von Port 22 mit einem gewöhnlichen SFTP-Dienst kommunizieren?",
    "answers": [
      "Nein, er benötigt Unterstützung für SFTP über SSH.",
      "Ja, die Portnummer übersetzt FTP-Kommandos automatisch in SFTP.",
      "Ja, SFTP akzeptiert neben seinen eigenen Nachrichten unveränderte FTP-Kommandos.",
      "Ja, sofern der FTP-Client lediglich TLS auf seinem Steuerkanal unterstützt."
    ],
    "correctAnswer": 0,
    "explanation": "SFTP ist ein eigenes Dateiübertragungsprotokoll über SSH. Ein Wechsel des Ports macht einen reinen FTP-Client nicht zu einem SFTP-Client.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-251",
    "category": "Netzwerk",
    "topic": "SFTP",
    "difficulty": "medium",
    "question": "Eine Datei wird per SFTP sicher zu einem Server übertragen. Was folgt daraus über ihre Speicherung auf dem Server?",
    "answers": [
      "Die Übertragung allein garantiert keine verschlüsselte Speicherung auf dem Server.",
      "Die Datei ist auf dem Server automatisch mit dem SSH-Hostschlüssel verschlüsselt.",
      "Auch ein berechtigter Serverprozess kann die gespeicherte Datei danach nicht mehr lesen.",
      "Die gespeicherte Datei bleibt genau so lange verschlüsselt, wie die SSH-Verbindung besteht."
    ],
    "correctAnswer": 0,
    "explanation": "SFTP schützt den Transport. Verschlüsselung im Ruhezustand, Dateiberechtigungen und Backups müssen auf dem Zielsystem gesondert geregelt werden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-252",
    "category": "Netzwerk",
    "topic": "FTP-SFTP",
    "difficulty": "medium",
    "question": "Welche Aussage vergleicht klassisches FTP ohne TLS mit SFTP korrekt?",
    "answers": [
      "Beide übertragen Zugangsdaten und Dateiinhalte ohne Verschlüsselung.",
      "FTP bietet dabei keinen Verschlüsselungsschutz; SFTP schützt die Übertragung über SSH.",
      "FTP verschlüsselt nur die Zugangsdaten; SFTP verschlüsselt nur die Dateiinhalte.",
      "FTP schützt die Übertragung über SSH; SFTP benötigt dafür TLS."
    ],
    "correctAnswer": 1,
    "explanation": "Klassisches FTP ohne TLS schützt Zugangsdaten und Dateiinhalt nicht durch Verschlüsselung. SFTP verwendet SSH für eine geschützte Dateiübertragung. FTP mit TLS wird als FTPS bezeichnet und ist ein anderes Verfahren.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-254",
    "category": "Netzwerk",
    "topic": "Netzwerkarten",
    "difficulty": "medium",
    "question": "Ein Smartphone verbindet sich per Bluetooth mit einer Smartwatch. Welche Netzwerkkategorie passt am besten?",
    "answers": [
      "PAN",
      "LAN",
      "MAN",
      "WAN"
    ],
    "correctAnswer": 0,
    "explanation": "PAN umfasst Geräte in unmittelbarer persönlicher Umgebung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-255",
    "category": "Netzwerk",
    "topic": "Inter-VLAN-Routing",
    "difficulty": "medium",
    "question": "Ein PC und ein Netzwerkdrucker liegen in unterschiedlichen VLANs und unterschiedlichen IPv4-Subnetzen. Welche Voraussetzung ist für regulären IP-Zugriff zwischen ihnen erforderlich?",
    "answers": [
      "Passendes Layer-3-Routing und erlaubter Verkehr zwischen den Netzen.",
      "Nur eine zusätzliche Layer-2-Trunk-Verbindung ohne Routing zwischen den Subnetzen.",
      "Nur eine identische TCP-Portnummer auf PC und Drucker ohne passenden Routingpfad.",
      "Nur einen statischen ARP-Eintrag für den Drucker ohne passende Route."
    ],
    "correctAnswer": 0,
    "explanation": "Verschiedene VLANs sind getrennte Layer-2-Domänen. Zwischen unterschiedlichen IP-Subnetzen benötigt der Zugriff einen passenden Routingpfad und zulässige Zugriffsregeln.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-256",
    "category": "Netzwerk",
    "topic": "Netzwerkleistung",
    "difficulty": "medium",
    "question": "Eine kleine Testnachricht benötigt 3 ms zum Ziel, ihre Antwort 5 ms zurück. Verarbeitung und weitere Wartezeiten seien vernachlässigbar. Wie groß ist die Round-Trip Time?",
    "answers": [
      "8 ms",
      "3 ms",
      "4 ms",
      "5 ms"
    ],
    "correctAnswer": 0,
    "explanation": "Die RTT umfasst Hin- und Rückweg: 3 ms + 5 ms = 8 ms. Die beiden Richtungen müssen nicht dieselbe Verzögerung haben.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-257",
    "category": "Netzwerk",
    "topic": "VPN/Routing",
    "difficulty": "medium",
    "question": "Zwei Standorte verwenden beide 192.168.1.0/24 und sollen per Site-to-Site-VPN verbunden werden. Warum ist das bei gewöhnlichem Routing problematisch?",
    "answers": [
      "Lokale und entfernte Ziele können dieselben IPv4-Adressen besitzen.",
      "Gleiche Präfixe ermöglichen automatisch eine eindeutige Unterscheidung zwischen lokalem und entferntem Ziel.",
      "Private Adressen dürfen grundsätzlich nicht durch ein Site-to-Site-VPN transportiert werden.",
      "Der VPN-Tunnel kann nur Netze mit unterschiedlich langen Präfixen verbinden."
    ],
    "correctAnswer": 0,
    "explanation": "Überlappende Adressräume verhindern eine eindeutige gewöhnliche Zielzuordnung. Häufig wird eine Seite umadressiert; speziell geplante Übersetzung kann eine Alternative sein.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-258",
    "category": "Netzwerk",
    "topic": "Netzwerkarten",
    "difficulty": "medium",
    "question": "Welche Reihenfolge geht grob von kleiner zu größer?",
    "answers": [
      "PAN → LAN → MAN → WAN → GAN",
      "GAN → WAN → MAN → LAN → PAN",
      "LAN → PAN → GAN → MAN → WAN",
      "PAN → WAN → LAN → GAN → MAN"
    ],
    "correctAnswer": 0,
    "explanation": "Diese Reihenfolge folgt der typischen geografischen Reichweite.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-259",
    "category": "Netzwerk",
    "topic": "Netzwerkleistung",
    "difficulty": "medium",
    "question": "Eine Datenübertragung durchläuft nacheinander Links mit 1 Gbit/s, 100 Mbit/s und 1 Gbit/s. Ohne Parallelwege und ohne sonstige Begrenzungen: Welche obere Grenze setzt der langsamste Link dem dauerhaften Durchsatz?",
    "answers": [
      "100 Mbit/s",
      "1 Gbit/s",
      "2,1 Gbit/s",
      "700 Mbit/s"
    ],
    "correctAnswer": 0,
    "explanation": "Ein durchgängiger Datenstrom muss jeden Link passieren. Der 100-Mbit/s-Link ist der Engpass; Protokollaufwand kann den Nutzdatendurchsatz weiter reduzieren.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-260",
    "category": "Netzwerk",
    "topic": "Netzwerkleistung",
    "difficulty": "medium",
    "question": "Was bezeichnet Jitter bei der Übertragung von Echtzeit-Audiodaten?",
    "answers": [
      "Schwankungen der Paketlaufzeiten beziehungsweise Ankunftsabstände.",
      "Die mittlere konstante Verzögerung aller Pakete ohne zeitliche Schwankung.",
      "Den Anteil vollständig verlorener Pakete an allen gesendeten Paketen.",
      "Die maximal verfügbare Datenrate für den Audiostrom."
    ],
    "correctAnswer": 0,
    "explanation": "Zeitliche Schwankungen können die gleichmäßige Wiedergabe stören. Ein Jitterpuffer kann sie teilweise ausgleichen, erhöht dabei aber die Wiedergabeverzögerung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-261",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "medium",
    "question": "Wofür steht DNS?",
    "answers": [
      "Domain Name System",
      "Data Network Session",
      "Digital Naming Service Protocol",
      "Domain Node Switch"
    ],
    "correctAnswer": 0,
    "explanation": "DNS steht für Domain Name System.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-262",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "medium",
    "question": "Eine DNS-Antwort ohne CNAME-Weiterleitung meldet für den abgefragten Namen NXDOMAIN. Was bedeutet dieser Status?",
    "answers": [
      "Der angefragte Name existiert laut dieser DNS-Antwort nicht.",
      "Der Name existiert, hat aber lediglich keinen AAAA-Eintrag.",
      "Der DNS-Server hat überhaupt keine Antwort gesendet.",
      "Die Antwort wurde ausschließlich wegen ihrer Größe über TCP übertragen."
    ],
    "correctAnswer": 0,
    "explanation": "NXDOMAIN ist eine negative Antwort über die Existenz des Namens. Das Fehlen nur eines Record-Typs bei existierendem Namen ist davon zu unterscheiden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-263",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "medium",
    "question": "Warum ist DNS für Nutzer praktisch?",
    "answers": [
      "Menschen können sich Namen leichter merken als IP-Adressen",
      "Es verschlüsselt jedes Passwort",
      "Es ersetzt Router",
      "Es verhindert jede Kollision"
    ],
    "correctAnswer": 0,
    "explanation": "DNS erlaubt die Nutzung lesbarer Namen statt schwer merkbarer Zahlen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-264",
    "category": "Netzwerk",
    "topic": "DNS-Diagnose",
    "difficulty": "medium",
    "question": "Was bewirkt unter Windows der Befehl nslookup example.com 192.0.2.53?",
    "answers": [
      "Er fragt example.com gezielt beim DNS-Server 192.0.2.53 ab.",
      "Er trägt 192.0.2.53 dauerhaft als IP-Adresse von example.com in die Hosts-Datei ein.",
      "Er ändert den DNS-Server aller Netzwerkadapter dauerhaft auf 192.0.2.53.",
      "Er fragt den Namen von 192.0.2.53 ab und verwendet example.com dafür als DNS-Server."
    ],
    "correctAnswer": 0,
    "explanation": "Das zweite Argument bezeichnet den für diese Abfrage verwendeten DNS-Server. Der Befehl ändert dadurch nicht die dauerhafte Adapterkonfiguration.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-265",
    "category": "Netzwerk",
    "topic": "MTU-Diagnose",
    "difficulty": "medium",
    "question": "Ein Router kann ein IPv4-Unicast-Paket wegen einer kleineren Ausgangs-MTU nicht weiterleiten; DF ist gesetzt. Welche reguläre Reaktion unterstützt die Path MTU Discovery?",
    "answers": [
      "Paket verwerfen und ICMP Destination Unreachable mit Fragmentation Needed zurückmelden.",
      "Das Paket trotz gesetztem DF fragmentieren und die Fragmente weiterleiten.",
      "Das DF-Bit löschen und das Paket ohne Größenprüfung unverändert weiterleiten.",
      "ICMP Time Exceeded zurückmelden, obwohl die TTL nicht abgelaufen ist."
    ],
    "correctAnswer": 0,
    "explanation": "Bei gesetztem DF darf der Router das Paket nicht fragmentieren. Die ICMP-Meldung informiert den Absender über das Größenproblem und kann die Anpassung der Paketgröße ermöglichen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-266",
    "category": "Netzwerk",
    "topic": "DNS/HTTP",
    "difficulty": "medium",
    "question": "Ein Browser öffnet https://example.com/docs/start.html. Welcher Teil wird für eine gewöhnliche DNS-Adressabfrage des Zielhosts verwendet?",
    "answers": [
      "example.com",
      "https://example.com/docs/start.html",
      "/docs/start.html",
      "https"
    ],
    "correctAnswer": 0,
    "explanation": "Die DNS-Adressauflösung betrifft den Hostnamen. Der Pfad wird anschließend im HTTP-Austausch verwendet; das URL-Schema bestimmt unter anderem das Zugriffsverfahren.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-267",
    "category": "Netzwerk",
    "topic": "SMTP",
    "difficulty": "medium",
    "question": "Ein SMTP-Server weist einen Zustellversuch mit einem 4xx-Status vorübergehend zurück. Welche Behandlung passt grundsätzlich dazu?",
    "answers": [
      "Ein späterer erneuter Zustellversuch nach den Regeln der Warteschlange.",
      "Die Nachricht als erfolgreich zugestellt und gelesen markieren.",
      "Unbegrenzt und ohne Wartezeit erneut senden, bis irgendeine Antwort eintrifft.",
      "Den Fehler grundsätzlich wie eine endgültige 5xx-Ablehnung behandeln."
    ],
    "correctAnswer": 0,
    "explanation": "4xx steht für einen vorübergehenden negativen Abschluss. Ein sendender Mailserver kann nach angemessener Wartezeit erneut versuchen; dauerhaft erfolglose Zustellung muss schließlich gemeldet werden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-268",
    "category": "Netzwerk",
    "topic": "IMAP",
    "difficulty": "medium",
    "question": "Ein Client legt per IMAP eine Nachricht im Ordner Gesendet ab. Was beweist dieser Vorgang allein über die Zustellung an die Empfänger?",
    "answers": [
      "Er beweist keine Zustellung; das Speichern einer Kopie ist vom Versand getrennt.",
      "Er beweist, dass alle Empfänger die Nachricht bereits gelesen haben.",
      "Er beweist, dass der SMTP-Server die Nachricht zum Versand angenommen hat.",
      "Er beweist, dass die Nachricht bereits in allen Empfängerpostfächern liegt."
    ],
    "correctAnswer": 0,
    "explanation": "IMAP kann eine Kopie in einem Serverordner speichern. Daraus folgt keine SMTP-Annahme oder Zustellung; dafür müssen die Ergebnisse des Versandvorgangs geprüft werden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-269",
    "category": "Netzwerk",
    "topic": "E-Mail-Protokolle",
    "difficulty": "medium",
    "question": "Welches Protokoll ist mit lokalem E-Mail-Abruf und möglichem Löschen vom Server verbunden?",
    "answers": [
      "SMTP",
      "IMAP",
      "POP3",
      "HTTPS"
    ],
    "correctAnswer": 2,
    "explanation": "POP3 lädt E-Mails typischerweise auf das Gerät.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-270",
    "category": "Netzwerk",
    "topic": "IMAP",
    "difficulty": "medium",
    "question": "Ein IMAP-Client blendet als gelöscht markierte Nachrichten aus. Warum kann der belegte Speicherplatz auf dem Server trotzdem unverändert bleiben?",
    "answers": [
      "Die Löschmarkierung allein entfernt die Nachrichten noch nicht aus dem Postfach.",
      "Der Speicher wird erst durch das Leeren des lokalen Client-Caches freigegeben.",
      "IMAP schreibt nach jeder Löschmarkierung eine feste Wartezeit von 24 Stunden vor.",
      "Der Server benötigt zusätzlich eine SMTP-Bestätigung für jede gelöschte Nachricht."
    ],
    "correctAnswer": 0,
    "explanation": "Als gelöscht markierte IMAP-Nachrichten können weiterhin im Postfach liegen. Erst ihre Entfernung, etwa durch EXPUNGE, beseitigt sie aus diesem Postfach; die Oberfläche kann Markierung und Entfernung getrennt ausführen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-271",
    "category": "Netzwerk",
    "topic": "E-Mail-Diagnose",
    "difficulty": "medium",
    "question": "Ein Mailclient ruft Nachrichten erfolgreich per IMAP ab. Beim SMTP-Versand erreicht er den Submission-Server, der die Anmeldung ausdrücklich ablehnt. Was sollte zuerst geprüft werden?",
    "answers": [
      "Die SMTP-Anmeldeangaben und die Berechtigung zur Message Submission.",
      "Ausschließlich die Abonnementliste der bereits lesbaren IMAP-Ordner.",
      "Ausschließlich die DNS-Auflösung, obwohl die Ablehnung vom gewünschten SMTP-Server stammt.",
      "Die Möglichkeit, unveränderte SMTP-Kommandos an den IMAP-Abrufport zu schicken."
    ],
    "correctAnswer": 0,
    "explanation": "Abruf und Submission sind getrennte Dienste und können unterschiedliche Einstellungen verlangen. Die konkrete Ablehnung weist auf die SMTP-Authentisierung beziehungsweise deren Zulässigkeit hin.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-272",
    "category": "Netzwerk",
    "topic": "IMAP",
    "difficulty": "medium",
    "question": "Wozu dient der IMAP-Befehl IDLE bei einer bestehenden unterstützten Verbindung?",
    "answers": [
      "Er ermöglicht dem Server, Änderungen mitzuteilen, ohne ständig neue Polling-Kommandos zu benötigen.",
      "Er veranlasst den Server, die TCP-Verbindung für jede Änderung neu zum Client aufzubauen.",
      "Er aktiviert regelmäßige vollständige Downloads aller Nachrichten unabhängig von Änderungen.",
      "Er ersetzt die serverseitigen Zustandsmeldungen durch lokale Cache-Prüfungen ohne Serverkontakt."
    ],
    "correctAnswer": 0,
    "explanation": "Im IDLE-Modus kann der Server dem verbundenen Client etwa Mailboxänderungen melden. Das garantiert keine sofortige Synchronisation eines ausgeschalteten oder getrennten Geräts.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-273",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein IPv4-Host soll ein Ziel außerhalb seines lokalen Subnetzes erreichen. Eine spezifische Route ist nicht eingerichtet. Welche Gateway-Angabe benötigt seine Standardroute?",
    "answers": [
      "Die Adresse eines erreichbaren Routers im lokalen Netz.",
      "Die Adresse des für Namensauflösung verwendeten DNS-Servers.",
      "Die Adresse des für die Adressvergabe verwendeten DHCP-Servers.",
      "Die Broadcastadresse des lokalen Subnetzes."
    ],
    "correctAnswer": 0,
    "explanation": "Die Standardroute führt über einen erreichbaren nächsten Router. DNS- und DHCP-Server haben andere Aufgaben; die Broadcastadresse ist kein geeigneter nächster Hop.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-274",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Layer-2-Switch erhält einen Unicast-Frame mit noch unbekannter Ziel-MAC-Adresse. Wie behandelt er ihn im normalen Weiterleitungsbetrieb?",
    "answers": [
      "Er flutet ihn über die weiterleitenden Ports desselben VLANs außer dem Eingangsport.",
      "Er lernt die Ziel-MAC-Adresse am Eingangsport und sendet ihn dorthin zurück.",
      "Er puffert ihn grundsätzlich, bis die Zieladresse durch einen späteren Quellframe gelernt wird.",
      "Er ersetzt die Ziel-MAC-Adresse durch die MAC-Adresse des Standardgateways."
    ],
    "correctAnswer": 0,
    "explanation": "Unbekannter Unicast wird normalerweise innerhalb des VLANs geflutet. Ein Switch lernt MAC-Adressen anhand der Quelladresse empfangener Frames und ihres Eingangsports.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-275",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Wie können mehrere private IPv4-Clients bei NAPT/PAT gleichzeitig TCP-Verbindungen über dieselbe öffentliche IPv4-Adresse nutzen?",
    "answers": [
      "Die Übersetzungstabelle ordnet interne Verbindungen unterschiedlichen externen Quellports zu.",
      "Der Router setzt alle internen und externen TCP-Quellports auf denselben festen Wert.",
      "Die Clients müssen dieselbe private IPv4-Adresse und dieselbe MAC-Adresse verwenden.",
      "Die Zuordnung erfolgt ausschließlich über den DNS-Namen des entfernten Servers."
    ],
    "correctAnswer": 0,
    "explanation": "NAPT/PAT übersetzt Adressen und Transportportnummern. Zusammen mit dem Protokoll und den beteiligten Endpunkten ermöglichen Tabelleneinträge die Zuordnung des Rückverkehrs.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-276",
    "category": "Netzwerk",
    "topic": "Switching",
    "difficulty": "medium",
    "question": "Ein dynamischer MAC-Eintrag wurde auf einem Switch durch Aging entfernt. Ein Unicast-Frame für diese MAC kommt an, bevor die Adresse erneut gelernt wurde. Was geschieht im normalen Betrieb?",
    "answers": [
      "Der Frame wird innerhalb seines VLANs über die anderen weiterleitenden Ports geflutet.",
      "Der Frame wird weiterhin ausschließlich über den früher gespeicherten Port gesendet.",
      "Der Frame wird grundsätzlich bis zum nächsten Frame des Zielgeräts gepuffert.",
      "Der Frame wird wegen des abgelaufenen MAC-Eintrags grundsätzlich verworfen."
    ],
    "correctAnswer": 0,
    "explanation": "Nach Ablauf des dynamischen Eintrags ist das Ziel unbekannt. Normales Unknown-Unicast-Flooding gilt, bis ein neuer Quellframe die Zuordnung wieder lernen lässt.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-277",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Zwei Hosts besitzen gültige IPv4-Link-Local-Adressen 169.254.44.18/16 und 169.254.60.20/16 auf demselben Ethernet-Link. Es gibt keine Filter. Welche Kommunikation ist damit möglich?",
    "answers": [
      "Die Hosts können direkt miteinander über diesen Link kommunizieren.",
      "Die Hosts benötigen für ihre direkte Kommunikation zwingend ein Standardgateway.",
      "Die Hosts erreichen damit über gewöhnliches IP-Routing beliebige Internetziele.",
      "Die Hosts benötigen wegen der unterschiedlichen dritten Oktette einen Router."
    ],
    "correctAnswer": 0,
    "explanation": "Beide Adressen gehören zum selben Link-Local-Präfix. Direkte Kommunikation auf dem Link ist möglich; Router leiten IPv4-Link-Local-Verkehr nicht regulär in andere Links weiter.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-278",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein IPv4-Subnetz benötigt mindestens 100 nutzbare Hostadressen. Welches Präfix liefert im klassischen Modell mit Netz- und Broadcastadresse das kleinste passende Subnetz?",
    "answers": [
      "/25",
      "/26",
      "/27",
      "/24"
    ],
    "correctAnswer": 0,
    "explanation": "Ein /25 hat 128 Adressen und klassisch 126 nutzbare Hostadressen. Ein /26 bietet nur 62; ein /24 wäre größer als erforderlich.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-279",
    "category": "Netzwerk",
    "topic": "CIDR",
    "difficulty": "hard",
    "question": "Welches einzelne IPv4-Präfix fasst 192.168.50.0/26 und 192.168.50.64/26 exakt zusammen, ohne weitere Adressen einzuschließen?",
    "answers": [
      "192.168.50.0/25",
      "192.168.50.0/24",
      "192.168.50.128/25",
      "192.168.50.0/27"
    ],
    "correctAnswer": 0,
    "explanation": "Die beiden angrenzenden /26-Blöcke decken .0 bis .127 ab. Dieser korrekt ausgerichtete Bereich entspricht 192.168.50.0/25.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-280",
    "category": "Netzwerk",
    "topic": "IPv6",
    "difficulty": "medium",
    "question": "Welche IPv6-Adresse bezeichnet die Loopback-Schnittstelle des eigenen Hosts?",
    "answers": [
      "::1",
      "::",
      "fe80::1",
      "ff02::1"
    ],
    "correctAnswer": 0,
    "explanation": "::1 ist die IPv6-Loopbackadresse. :: ist die unspezifizierte Adresse, fe80::1 liegt im Link-Local-Bereich und ff02::1 adressiert alle Knoten auf dem lokalen Link.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-281",
    "category": "Netzwerk",
    "topic": "IPv4",
    "difficulty": "hard",
    "question": "Ein Host verwendet 192.168.10.70/26. Welche der folgenden Adressen ist als Routeradresse seines lokalen Standardgateways geeignet?",
    "answers": [
      "192.168.10.65",
      "192.168.10.64",
      "192.168.10.127",
      "192.168.10.129"
    ],
    "correctAnswer": 0,
    "explanation": "Das Subnetz reicht von .64 bis .127; normale Hostadressen liegen zwischen .65 und .126. .64 ist Netzadresse, .127 Broadcast und .129 liegt im nächsten Subnetz.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-282",
    "category": "Netzwerk",
    "topic": "Kapselung",
    "difficulty": "medium",
    "question": "Ein Endsystem empfängt über Ethernet ein IPv4-Paket mit einem TCP-Segment. Was übergibt IPv4 nach seiner Verarbeitung an TCP?",
    "answers": [
      "Das im IPv4-Paket enthaltene TCP-Segment.",
      "Den vollständigen Ethernet-Frame einschließlich FCS.",
      "Nur die Anwendungsdaten ohne TCP-Header",
      "Das vollständige IPv4-Paket einschließlich IP-Header"
    ],
    "correctAnswer": 0,
    "explanation": "Beim Entkapseln verarbeitet jede beteiligte Protokollinstanz ihre Steuerinformationen und übergibt die passende Nutzlast an das nächste Protokoll.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-283",
    "category": "Netzwerk",
    "topic": "Datendarstellung",
    "difficulty": "medium",
    "question": "Welches Ziel unterscheidet verlustfreie Kompression von Verschlüsselung?",
    "answers": [
      "Kompression reduziert bei geeigneten Daten die Größe, ohne die Information zu verlieren.",
      "Kompression macht Daten ohne geheimen Schlüssel grundsätzlich unlesbar.",
      "Kompression bestätigt die Identität des Kommunikationspartners.",
      "Kompression verhindert gezielte Änderungen durch einen Angreifer."
    ],
    "correctAnswer": 0,
    "explanation": "Verlustfreie Kompression ermöglicht die Wiederherstellung der Originaldaten und kann Übertragungsvolumen sparen. Sie bietet allein keine Vertraulichkeit, Authentizität oder Manipulationssicherheit.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-284",
    "category": "Netzwerk",
    "topic": "Verteilte Anwendungen",
    "difficulty": "hard",
    "question": "Eine Buchungs-API kann bei jedem Aufruf eine neue Buchung erzeugen. Der Client sendet eine Anfrage, erhält jedoch keine Antwort. Warum ist ein sofortiges Wiederholen riskant?",
    "answers": [
      "Die erste Buchung kann bereits erfolgt sein, obwohl die Antwort verloren ging.",
      "Eine fehlende Antwort beweist, dass der Server die Anfrage nicht verarbeitet hat.",
      "Eine neue Verbindung macht die vorherige Buchung automatisch ungültig.",
      "Der Server erkennt wiederholte Aufträge auch ohne eindeutige Kennung immer automatisch."
    ],
    "correctAnswer": 0,
    "explanation": "Eine fehlende Antwort beweist nicht, dass die Anfrage nicht verarbeitet wurde. Eine Wiederholung kann deshalb eine zweite Buchung erzeugen. Eindeutige Auftragskennungen oder eine idempotente Verarbeitung können solche Doppelbuchungen verhindern.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-285",
    "category": "Netzwerk",
    "topic": "SSH/SFTP",
    "difficulty": "medium",
    "question": "Ein SFTP-Client meldet bei einem bekannten Server einen unerwartet geänderten SSH-Hostschlüssel. Welche Reaktion ist sinnvoll?",
    "answers": [
      "Den neuen Fingerabdruck über einen unabhängigen vertrauenswürdigen Weg prüfen.",
      "Den neuen Schlüssel ungeprüft akzeptieren, weil SFTP immer den richtigen Server erreicht.",
      "Die Hostschlüsselprüfung dauerhaft deaktivieren und erneut verbinden.",
      "Nur das Benutzerpasswort ändern und den neuen Schlüssel automatisch übernehmen."
    ],
    "correctAnswer": 0,
    "explanation": "Die Änderung kann berechtigt sein, aber auch auf eine falsche Gegenstelle hinweisen. Die Hostschlüsselprüfung authentisiert den Server und sollte unabhängig verifiziert werden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-286",
    "category": "Netzwerk",
    "topic": "FTPS",
    "difficulty": "medium",
    "question": "Ein FTPS-Steuerkanal ist durch TLS geschützt. Was gilt für die separate Datenverbindung?",
    "answers": [
      "Ihre TLS-Absicherung muss ebenfalls ausgehandelt werden.",
      "Sie ist allein durch den geschützten Steuerkanal automatisch verschlüsselt.",
      "Sie übernimmt den Steuerkanal ohne eigenen Verbindungsaufbau.",
      "Sie bleibt bei FTPS grundsätzlich unverschlüsselt."
    ],
    "correctAnswer": 0,
    "explanation": "FTPS behandelt den Schutz von Steuer- und Datenkanal getrennt. Für verschlüsselte Dateiübertragungen muss auch der Datenkanal geschützt sein, beispielsweise nach Aushandlung von PROT P.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-287",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "medium",
    "question": "Ein autoritativer DNS-A-Eintrag wurde geändert. Ein Resolver hat noch den früheren Wert mit verbleibender TTL im Cache. Warum kann ein Client vorübergehend noch die alte Adresse erhalten?",
    "answers": [
      "Der Resolver darf den noch gültigen gecachten Wert regulär weiterverwenden.",
      "Ein autoritativer A-Eintrag darf nach seiner ersten Nutzung grundsätzlich nicht mehr geändert werden.",
      "Eine neue Adresse wird erst wirksam, wenn zusätzlich der MX-Eintrag geändert wurde.",
      "Eine Adressänderung setzt die TTL sämtlicher bereits gecachter Einträge automatisch auf null."
    ],
    "correctAnswer": 0,
    "explanation": "Änderungen autoritativer Daten löschen entfernte Caches nicht automatisch. Vorhandene Einträge können bis zum Ablauf ihrer Cache-Gültigkeit weiterwirken.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-288",
    "category": "Netzwerk",
    "topic": "POP3",
    "difficulty": "medium",
    "question": "Ein POP3-Client hat Nachrichten zum Löschen markiert. Was löst im normalen Ablauf ihre Löschung aus?",
    "answers": [
      "Das reguläre Beenden der Abrufsitzung mit QUIT.",
      "Bereits das vorherige Herunterladen der Nachrichten mit RETR.",
      "Allein das Setzen der Löschmarkierung, unabhängig vom Sitzungsabschluss.",
      "Ein unerwarteter Verbindungsabbruch vor dem regulären Abschluss."
    ],
    "correctAnswer": 0,
    "explanation": "POP3 markiert Nachrichten zunächst zur Löschung. Bei regulärem Abschluss der Abrufsitzung mit QUIT verarbeitet der Server die Löschaufträge. Ein vorheriger Verbindungsabbruch führt nicht zu dieser regulären Löschverarbeitung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "Programmierung-001",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Syntaxfehler in einem Programm?",
    "answers": [
      "Ein Fehler in der Schreibweise oder Struktur des Quellcodes",
      "Ein zu langsamer Prozessor",
      "Eine falsche IP-Adresse",
      "Ein defektes Netzteil"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Syntaxfehler entsteht, wenn der Quellcode nicht den grammatikalischen Regeln der Programmiersprache entspricht.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-002",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat ein Kommentar im Quellcode hauptsächlich?",
    "answers": [
      "Er erklärt oder dokumentiert Code für Menschen, ohne normalerweise ausgeführt zu werden",
      "Er erhöht automatisch die Programmgeschwindigkeit",
      "Er ersetzt eine Variable",
      "Er kompiliert das Programm"
    ],
    "correctAnswer": 0,
    "explanation": "Kommentare dienen der Dokumentation und Lesbarkeit des Codes und werden normalerweise nicht als Programmlogik ausgeführt.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-003",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Was beschreibt ein Algorithmus am besten?",
    "answers": [
      "Eine eindeutige Folge von Schritten zur Lösung eines Problems",
      "Eine Hardwarekomponente zur Datenspeicherung",
      "Eine Art Netzwerkprotokoll",
      "Eine grafische Benutzeroberfläche"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Algorithmus ist eine klar definierte Abfolge von Schritten, mit der eine Aufgabe oder ein Problem gelöst werden kann.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-004",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein JavaScript-Programm zählt erfolgreiche Anmeldungen. Zu Beginn gilt let anmeldungen = 0;. Welche Anweisung muss bei jeder erfolgreichen Anmeldung ausgeführt werden?",
    "answers": [
      "anmeldungen = anmeldungen + 1;",
      "anmeldungen = 1;",
      "anmeldungen = 0;",
      "anmeldungen = anmeldungen * 2;"
    ],
    "correctAnswer": 0,
    "explanation": "Der bisherige Zählerstand muss um 1 steigen: aus 0 wird 1, danach 2 usw. Eine erneute Zuweisung von 0 oder 1 verliert den bisherigen Stand; Verdoppeln zählt die Anmeldungen nicht.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-005",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Anweisung wird typischerweise verwendet, um eine Bedingung zu prüfen und abhängig davon Code auszuführen?",
    "answers": [
      "if",
      "return",
      "import",
      "class"
    ],
    "correctAnswer": 0,
    "explanation": "Mit einer if-Anweisung kann geprüft werden, ob eine Bedingung erfüllt ist, und entsprechend unterschiedlicher Code ausgeführt werden.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-006",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine Geräteliste kann unterschiedlich viele Einträge enthalten. Ein Programm soll für jeden Eintrag denselben Ausgabeschritt ausführen. Welche Struktur passt dazu?",
    "answers": [
      "Eine Schleife über die Einträge der Liste.",
      "Eine if-Abfrage, ob die Liste Einträge enthält.",
      "Eine Sortierung der Liste nach Gerätenamen.",
      "Eine Zuweisung der Liste an eine weitere Variable."
    ],
    "correctAnswer": 0,
    "explanation": "Die Schleife führt den Ausgabeschritt für jeden Eintrag aus. Eine if-Abfrage entscheidet nur über einen Zweig; Sortieren und Zuweisen wiederholen den Ausgabeschritt nicht.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-007",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Mehrere Programmteile berechnen Nettopreise aus Bruttopreis und Steuersatz. Welchen Vorteil bietet eine gemeinsame Funktion mit diesen beiden Parametern?",
    "answers": [
      "Die Berechnung wird einmal definiert und mit unterschiedlichen Argumenten aufgerufen.",
      "Nach dem ersten Aufruf wird dessen Ergebnis für alle späteren Aufrufe übernommen.",
      "Die aufrufenden Programmteile müssen bei jedem Aufruf dieselben Argumente übergeben.",
      "Der Aufruf ersetzt die übergebenen Zahlenvariablen automatisch durch den Nettopreis."
    ],
    "correctAnswer": 0,
    "explanation": "Eine Funktion kann dieselbe Berechnung mit unterschiedlichen Argumenten ausführen und den jeweiligen Nettopreis zurückgeben. Das Bündeln der Logik vermeidet mehrfach gepflegte Kopien; es bewirkt weder eine automatische Ergebnisspeicherung noch das Überschreiben der übergebenen Zahlenvariablen.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-008",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein JavaScript-Programm soll drei Gerätenamen als drei einzelne Elemente eines Arrays speichern. Welche Initialisierung passt?",
    "answers": [
      "const namen = [\"srv01\", \"srv02\", \"srv03\"];",
      "const namen = \"srv01, srv02, srv03\";",
      "const namen = [\"srv01, srv02, srv03\"];",
      "const namen = { srv01: true, srv02: true, srv03: true };"
    ],
    "correctAnswer": 0,
    "explanation": "Eckige Klammern mit drei durch Kommas getrennten Zeichenketten erzeugen ein Array mit drei Elementen. Ein Komma innerhalb einer Zeichenkette trennt keine Arrayelemente; geschweifte Klammern erzeugen hier ein Objekt.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-009",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Welcher Datentyp ist für die direkte Darstellung der Information „Druckauftrag abgeschlossen: ja oder nein“ vorgesehen?",
    "answers": [
      "Boolean",
      "Ganzzahl",
      "Zeichenkette",
      "Fließkommazahl"
    ],
    "correctAnswer": 0,
    "explanation": "Boolean stellt die beiden Wahrheitswerte true und false dar. Damit lässt sich unmittelbar speichern, ob der Druckauftrag abgeschlossen ist.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-010",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bewirkt return innerhalb einer Funktion?",
    "answers": [
      "Es beendet die Funktion und kann einen Wert an den Aufrufer zurückgeben",
      "Es startet das gesamte Programm neu",
      "Es erzeugt automatisch eine Schleife",
      "Es löscht die Funktion aus dem Speicher"
    ],
    "correctAnswer": 0,
    "explanation": "return beendet die aktuelle Funktionsausführung und kann dem aufrufenden Code einen Ergebniswert übergeben.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-011",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Schreibweise erzeugt in JavaScript eine Konstante namens score mit dem Wert 10?",
    "answers": [
      "const score = 10;",
      "score == 10;",
      "function score = 10;",
      "array score = 10;"
    ],
    "correctAnswer": 0,
    "explanation": "Mit const wird eine Variable deklariert, deren Bindung anschließend nicht neu zugewiesen werden kann.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-012",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Was liefert der Ausdruck 5 > 3 in JavaScript?",
    "answers": [
      "true",
      "false",
      "5",
      "3"
    ],
    "correctAnswer": 0,
    "explanation": "Da 5 größer als 3 ist, ergibt der Vergleich den booleschen Wert true.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-013",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Welcher Index bezeichnet normalerweise das erste Element eines JavaScript-Arrays?",
    "answers": [
      "0",
      "1",
      "-1",
      "10"
    ],
    "correctAnswer": 0,
    "explanation": "JavaScript-Arrays sind nullbasiert. Das erste Element befindet sich daher am Index 0.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-014",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "hard",
    "question": "Gegeben ist der Code: let value = 5; if (value > 3) { value = value * 2; } Welchen Wert besitzt value anschließend?",
    "answers": [
      "5",
      "8",
      "10",
      "25"
    ],
    "correctAnswer": 2,
    "explanation": "Da 5 größer als 3 ist, wird der Code im if-Block ausgeführt. 5 × 2 ergibt 10.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-015",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "hard",
    "question": "Eine Schleife lautet: for (let i = 0; i < 4; i++) { console.log(i); } Wie oft wird console.log ausgeführt?",
    "answers": [
      "3-mal",
      "4-mal",
      "5-mal",
      "Unendlich oft"
    ],
    "correctAnswer": 1,
    "explanation": "Die Schleife läuft mit i = 0, 1, 2 und 3. Sobald i den Wert 4 erreicht, ist die Bedingung i < 4 nicht mehr erfüllt.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-016",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "hard",
    "question": "Eine Funktion ist definiert als function add(a, b) { return a + b; }. Welches Ergebnis liefert add(4, 7)?",
    "answers": [
      "3",
      "11",
      "28",
      "47"
    ],
    "correctAnswer": 1,
    "explanation": "Die Parameter a und b erhalten die Werte 4 und 7. Die Funktion gibt deren Summe 11 zurück.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-017",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Gegeben ist JavaScript-Code:\nconst values = [10, 20, 30, 40];\nvalues[1] = values[0] + values[2];\nWelche Werte enthält values anschließend?",
    "answers": [
      "[10, 40, 30, 40]",
      "[10, 20, 30, 40]",
      "[40, 20, 30, 40]",
      "[10, 60, 30, 40]"
    ],
    "correctAnswer": 0,
    "explanation": "values[0] ist 10 und values[2] ist 30. Ihre Summe 40 ersetzt den bisherigen Wert 20 an Index 1; die übrigen Elemente bleiben erhalten. const verhindert eine Neuzuweisung der Array-Bindung, aber keine Änderung ihrer Elemente.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-019",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "In JavaScript gilt const eingabe = \"42\";. Welcher Ausdruck liefert den Zahlenwert 50?",
    "answers": [
      "Number(eingabe) + 8",
      "eingabe + 8",
      "Number(eingabe + 8)",
      "Boolean(eingabe) + 8"
    ],
    "correctAnswer": 0,
    "explanation": "Number(eingabe) wandelt \"42\" in die Zahl 42 um; plus 8 ergibt 50. eingabe + 8 verkettet zu \"428\", dessen nachträgliche Umwandlung 428 ergibt. Boolean(\"42\") ist true und wird bei der Addition zu 1, sodass 9 entsteht.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-020",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine Datei darf nur gespeichert werden, wenn der Benutzer angemeldet ist und die Eingabe gültig ist. Welche Bedingung drückt beides aus?",
    "answers": [
      "angemeldet && eingabeGueltig",
      "angemeldet || eingabeGueltig",
      "!angemeldet && eingabeGueltig",
      "angemeldet == eingabeGueltig"
    ],
    "correctAnswer": 0,
    "explanation": "&& ist nur dann wahr, wenn beide Teilbedingungen wahr sind.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-023",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Konfigurationsfeld erlaubt laut Vorgabe nur ganze Portnummern von 1 bis 65535 einschließlich. p liegt bereits als JavaScript-Zahl vor. Welche Bedingung akzeptiert genau die erlaubten Werte?",
    "answers": [
      "Number.isInteger(p) && p >= 1 && p <= 65535",
      "Number.isInteger(p) && p >= 1",
      "p >= 1 && p <= 65535",
      "Number.isInteger(p) && p > 1 && p < 65535"
    ],
    "correctAnswer": 0,
    "explanation": "Die Prüfung muss Ganzzahligkeit sowie beide eingeschlossenen Grenzen verlangen. Ohne obere Grenze wird z. B. 65536 akzeptiert, ohne Ganzzahlprüfung 1.5; strikte Vergleiche schließen die erlaubten Werte 1 und 65535 aus.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-025",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine Funktion soll den Gesamtpreis für mehrere gleiche Artikel berechnen, ohne Rabatte oder Zuschläge:\nfunction gesamtpreis(einzelpreis, anzahl) {\n  return einzelpreis + anzahl;\n}\nDer Test gesamtpreis(4, 3) liefert 7 statt 12. Welche Ersetzung der return-Anweisung behebt den Rechenfehler auch für andere gültige Preise und Stückzahlen?",
    "answers": [
      "return einzelpreis * anzahl;",
      "return einzelpreis + anzahl + 5;",
      "return 12;",
      "return einzelpreis * 3;"
    ],
    "correctAnswer": 0,
    "explanation": "Der Gesamtpreis ergibt sich aus Einzelpreis mal Stückzahl. Alle vier Varianten liefern für den genannten Test 12, aber nur einzelpreis * anzahl setzt die Regel auch für andere Eingaben um; z. B. muss gesamtpreis(5, 2) den Wert 10 liefern.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-027",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "In JavaScript ist ein Gerät so gespeichert:\nlet geraet = { name: \"srv01\", ip: \"192.0.2.10\", status: \"offline\" };\nWelche Anweisung setzt den Status auf \"online\" und erhält name und ip?",
    "answers": [
      "geraet.status = \"online\";",
      "geraet.name = \"online\";",
      "geraet.status === \"online\";",
      "geraet = { status: \"online\" };"
    ],
    "correctAnswer": 0,
    "explanation": "Die Zuweisung an geraet.status ändert gezielt diese Eigenschaft. Die anderen Varianten ändern den Namen, vergleichen nur einen Wert oder ersetzen das gesamte Objekt und verlieren dabei name und ip.",
    "source": "programming.csv"
  },
  {
    "id": "rechnungen-001",
    "category": "Rechnungen",
    "topic": "Prozentrechnung",
    "difficulty": "medium",
    "question": "Ein Artikel kostet 200 €. Der Preis wird um 10 % erhöht. Wie hoch ist der neue Preis?",
    "answers": [
      "210 €",
      "220 €",
      "190 €",
      "180 €"
    ],
    "correctAnswer": 1,
    "explanation": "10 % von 200 € sind 20 €. Der neue Preis beträgt deshalb 220 €.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-002",
    "category": "Rechnungen",
    "topic": "Rabatt",
    "difficulty": "medium",
    "question": "Ein Monitor kostet 300 €. Der Kunde erhält 20 % Rabatt. Wie viel muss er bezahlen?",
    "answers": [
      "240 €",
      "260 €",
      "280 €",
      "220 €"
    ],
    "correctAnswer": 0,
    "explanation": "20 % von 300 € sind 60 €. Nach Abzug des Rabatts bleiben 240 €.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-003",
    "category": "Rechnungen",
    "topic": "Prozentrechnung",
    "difficulty": "medium",
    "question": "Ein Preis steigt von 100 € auf 125 €. Um wie viel Prozent ist der Preis gestiegen?",
    "answers": [
      "20 %",
      "25 %",
      "15 %",
      "30 %"
    ],
    "correctAnswer": 1,
    "explanation": "Die Erhöhung beträgt 25 € bezogen auf 100 €. Das entspricht 25 %.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-004",
    "category": "Rechnungen",
    "topic": "Dreisatz",
    "difficulty": "medium",
    "question": "5 Kabel kosten zusammen 40 €. Wie viel kosten 8 Kabel bei gleichem Stückpreis?",
    "answers": [
      "56 €",
      "60 €",
      "64 €",
      "72 €"
    ],
    "correctAnswer": 2,
    "explanation": "Ein Kabel kostet 8 €. Acht Kabel kosten daher 64 €.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-005",
    "category": "Rechnungen",
    "topic": "Netto-Brutto",
    "difficulty": "medium",
    "question": "Ein Produkt kostet netto 100 €. Die Mehrwertsteuer beträgt 19 %. Wie hoch ist der Bruttopreis?",
    "answers": [
      "109 €",
      "119 €",
      "121 €",
      "129 €"
    ],
    "correctAnswer": 1,
    "explanation": "19 % von 100 € sind 19 €. Netto plus Mehrwertsteuer ergibt 119 € brutto.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-006",
    "category": "Rechnungen",
    "topic": "Rabatt",
    "difficulty": "medium",
    "question": "Ein Kunde erhält 15 % Rabatt auf einen Preis von 400 €. Wie hoch ist der Rabattbetrag?",
    "answers": [
      "45 €",
      "50 €",
      "60 €",
      "70 €"
    ],
    "correctAnswer": 2,
    "explanation": "15 % von 400 € sind 60 €. Gefragt ist nur der Rabattbetrag, nicht der Endpreis.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-007",
    "category": "Rechnungen",
    "topic": "Dreisatz",
    "difficulty": "medium",
    "question": "3 Mitarbeiter benötigen für eine Aufgabe 12 Stunden. Wie viele Arbeitsstunden sind das insgesamt?",
    "answers": [
      "4 Stunden",
      "12 Stunden",
      "24 Stunden",
      "36 Stunden"
    ],
    "correctAnswer": 3,
    "explanation": "3 Mitarbeiter mal 12 Stunden ergeben insgesamt 36 Arbeitsstunden.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-008",
    "category": "Rechnungen",
    "topic": "Prozentrechnung",
    "difficulty": "medium",
    "question": "Von 500 Geräten sind 25 defekt. Wie hoch ist der prozentuale Anteil der defekten Geräte?",
    "answers": [
      "2 %",
      "5 %",
      "10 %",
      "20 %"
    ],
    "correctAnswer": 1,
    "explanation": "25 von 500 entsprechen 5 %.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-009",
    "category": "Rechnungen",
    "topic": "Netto-Brutto",
    "difficulty": "medium",
    "question": "Der Bruttopreis beträgt 119 €. Darin sind 19 % Mehrwertsteuer enthalten. Wie hoch ist der Nettopreis?",
    "answers": [
      "90 €",
      "100 €",
      "110 €",
      "113 €"
    ],
    "correctAnswer": 1,
    "explanation": "119 € entsprechen 119 %. Der Nettopreis von 100 % beträgt 100 €.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-010",
    "category": "Rechnungen",
    "topic": "Kostenbegriffe",
    "difficulty": "medium",
    "question": "Was bedeutet „Einzelkosten“?",
    "answers": [
      "Kosten, die direkt einem bestimmten Auftrag oder Produkt zugerechnet werden können",
      "Kosten, die immer gleich hoch bleiben",
      "Kosten, die nur für die Verwaltung entstehen",
      "Kosten, die auf alle Kunden gleich verteilt werden"
    ],
    "correctAnswer": 0,
    "explanation": "Einzelkosten können einem bestimmten Kostenträger direkt zugerechnet werden.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-011",
    "category": "Rechnungen",
    "topic": "Kostenbegriffe",
    "difficulty": "medium",
    "question": "Was bedeutet „Gemeinkosten“?",
    "answers": [
      "Kosten, die nur bei einem einzelnen Auftrag entstehen",
      "Kosten, die nicht direkt einem bestimmten Kostenträger zugerechnet werden können",
      "Kosten, die ausschließlich aus Material bestehen",
      "Kosten, die immer variabel sind"
    ],
    "correctAnswer": 1,
    "explanation": "Gemeinkosten sind nicht direkt zurechenbar und müssen verteilt beziehungsweise umgelegt werden.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-012",
    "category": "Rechnungen",
    "topic": "Kostenbegriffe",
    "difficulty": "medium",
    "question": "Was bedeutet „Fixkosten“?",
    "answers": [
      "Kosten, die mit jeder zusätzlichen Einheit steigen",
      "Kosten, die nur bei Gewinn entstehen",
      "Kosten, die unabhängig von der Beschäftigungs- oder Absatzmenge anfallen",
      "Kosten, die immer einem einzelnen Auftrag zugeordnet werden"
    ],
    "correctAnswer": 2,
    "explanation": "Fixkosten bleiben grundsätzlich unabhängig von der Menge bestehen, zum Beispiel Miete oder Gehälter.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-013",
    "category": "Rechnungen",
    "topic": "Kostenbegriffe",
    "difficulty": "medium",
    "question": "Was bedeutet „variable Kosten“?",
    "answers": [
      "Kosten, die sich mit der Produktions- oder Auftragsmenge verändern",
      "Kosten, die unabhängig von der Menge immer gleich bleiben",
      "Kosten, die nur für die Geschäftsführung entstehen",
      "Kosten, die nie einem Projekt zugeordnet werden können"
    ],
    "correctAnswer": 0,
    "explanation": "Variable Kosten verändern sich mit der Menge, zum Beispiel Material oder nutzungsabhängige Cloud-Kosten.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-014",
    "category": "Rechnungen",
    "topic": "Kostenbegriffe",
    "difficulty": "medium",
    "question": "Was bedeutet das Wort „zurechenbar“ in der Kostenrechnung?",
    "answers": [
      "Eine Ausgabe kann einem bestimmten Auftrag oder Produkt zugeordnet werden",
      "Eine Ausgabe muss sofort bezahlt werden",
      "Eine Ausgabe wird vom Kunden zurückerstattet",
      "Eine Ausgabe bleibt jedes Jahr gleich"
    ],
    "correctAnswer": 0,
    "explanation": "„Zurechenbar“ bedeutet, dass eine Kostenposition einem bestimmten Kostenträger zugeordnet werden kann.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-015",
    "category": "Rechnungen",
    "topic": "Kostenbegriffe",
    "difficulty": "medium",
    "question": "Was bedeutet „Gemeinkosten werden auf Kostenträger umgelegt“?",
    "answers": [
      "Die Kosten werden vollständig gelöscht",
      "Die Kosten werden nur einem einzigen Kunden berechnet",
      "Die Kosten werden nach einem bestimmten Schlüssel auf Produkte oder Aufträge verteilt",
      "Die Kosten werden als Gewinn verbucht"
    ],
    "correctAnswer": 2,
    "explanation": "„Umgelegt“ bedeutet hier, dass die Gemeinkosten nach einem Verteilungsschlüssel auf Kostenträger verteilt werden.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-016",
    "category": "Rechnungen",
    "topic": "Kostenbegriffe",
    "difficulty": "medium",
    "question": "Was sind „Selbstkosten“?",
    "answers": [
      "Nur die variablen Kosten eines Produkts",
      "Die Summe aus Einzelkosten und Gemeinkosten",
      "Nur Material- und Personalkosten",
      "Der Verkaufspreis inklusive Gewinn"
    ],
    "correctAnswer": 1,
    "explanation": "Die Selbstkosten umfassen alle Kosten der Leistungserbringung und bestehen aus Einzel- und Gemeinkosten.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-017",
    "category": "Rechnungen",
    "topic": "Kostenbegriffe",
    "difficulty": "medium",
    "question": "Was beschreibt die „kurzfristige Preisuntergrenze“?",
    "answers": [
      "Die Selbstkosten plus Gewinn",
      "Nur die Fixkosten",
      "Die variablen beziehungsweise direkt zurechenbaren Kosten",
      "Den höchsten möglichen Verkaufspreis"
    ],
    "correctAnswer": 2,
    "explanation": "Kurzfristig kann ein Preis die variablen Kosten decken und trotzdem zur Deckung der Fixkosten beitragen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-018",
    "category": "Rechnungen",
    "topic": "Kostenbegriffe",
    "difficulty": "medium",
    "question": "Was beschreibt die „langfristige Preisuntergrenze“?",
    "answers": [
      "Die Selbstkosten",
      "Nur die Materialkosten",
      "Nur die variablen Kosten",
      "Den Listenverkaufspreis"
    ],
    "correctAnswer": 0,
    "explanation": "Langfristig müssen sämtliche Kosten gedeckt werden, daher entspricht die Preisuntergrenze den Selbstkosten.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-019",
    "category": "Rechnungen",
    "topic": "Kostenbegriffe",
    "difficulty": "medium",
    "question": "Was sind „Herstellkosten“?",
    "answers": [
      "Nur die Materialeinzelkosten",
      "Materialkosten plus Fertigungskosten",
      "Selbstkosten plus Gewinn",
      "Verwaltungskosten plus Vertriebskosten"
    ],
    "correctAnswer": 1,
    "explanation": "Die Herstellkosten ergeben sich aus Material- und Fertigungskosten.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-020",
    "category": "Rechnungen",
    "topic": "Deckungsbeitrag",
    "difficulty": "medium",
    "question": "Was beschreibt der Deckungsbeitrag pro Stück?",
    "answers": [
      "Wie viel vom Verkaufspreis nach Abzug der variablen Kosten übrig bleibt",
      "Wie hoch die Fixkosten pro Jahr sind",
      "Wie viel Gewinn das Unternehmen insgesamt erzielt",
      "Wie hoch die Selbstkosten sind"
    ],
    "correctAnswer": 0,
    "explanation": "Der Stückdeckungsbeitrag ist Verkaufspreis minus variable Kosten pro Stück.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-021",
    "category": "Rechnungen",
    "topic": "Deckungsbeitrag",
    "difficulty": "medium",
    "question": "Wie wird der Gesamtdeckungsbeitrag berechnet?",
    "answers": [
      "Verkaufspreis minus Fixkosten",
      "Stückdeckungsbeitrag mal Absatzmenge",
      "Fixkosten mal Absatzmenge",
      "Selbstkosten plus Gewinn"
    ],
    "correctAnswer": 1,
    "explanation": "Der Gesamtdeckungsbeitrag ist Stückdeckungsbeitrag multipliziert mit der Absatzmenge.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-022",
    "category": "Rechnungen",
    "topic": "Deckungsbeitrag",
    "difficulty": "medium",
    "question": "Was bedeutet ein positiver Deckungsbeitrag I?",
    "answers": [
      "Das Produkt trägt zur Deckung der Fixkosten bei",
      "Das Produkt verursacht garantiert einen Gesamtverlust",
      "Alle Fixkosten sind bereits vollständig gedeckt",
      "Das Produkt hat keine variablen Kosten"
    ],
    "correctAnswer": 0,
    "explanation": "Ein positiver DB I bedeutet, dass nach Abzug der variablen Kosten noch ein positiver Beitrag verbleibt.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-023",
    "category": "Rechnungen",
    "topic": "Deckungsbeitrag",
    "difficulty": "medium",
    "question": "Was berücksichtigt der Deckungsbeitrag II zusätzlich zum Deckungsbeitrag I?",
    "answers": [
      "Mehrwertsteuer",
      "Produktfixe Kosten",
      "Alle Gemeinkosten des gesamten Unternehmens",
      "Nur Materialkosten"
    ],
    "correctAnswer": 1,
    "explanation": "DB II ergibt sich aus DB I minus produktfixe Kosten.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-024",
    "category": "Rechnungen",
    "topic": "Break-Even",
    "difficulty": "medium",
    "question": "Was ist der Break-Even-Point?",
    "answers": [
      "Der Punkt mit dem höchsten Gewinn",
      "Der Punkt, an dem Erlöse und Gesamtkosten gleich hoch sind",
      "Der niedrigste Einkaufspreis",
      "Der Zeitpunkt, an dem keine Fixkosten mehr existieren"
    ],
    "correctAnswer": 1,
    "explanation": "Am Break-Even-Point ist das Ergebnis null, also weder Gewinn noch Verlust.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-025",
    "category": "Rechnungen",
    "topic": "Break-Even",
    "difficulty": "medium",
    "question": "Welcher deutsche Begriff wird für „Break-Even-Point“ verwendet?",
    "answers": [
      "Preisuntergrenze",
      "Gewinnschwelle",
      "Deckungsquote",
      "Kostenstelle"
    ],
    "correctAnswer": 1,
    "explanation": "Der Break-Even-Point wird auch als Gewinnschwelle bezeichnet.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-026",
    "category": "Rechnungen",
    "topic": "Break-Even",
    "difficulty": "medium",
    "question": "Was bedeutet „weder Gewinn noch Verlust“?",
    "answers": [
      "Das Unternehmen arbeitet genau kostendeckend",
      "Das Unternehmen hat keine Fixkosten",
      "Der Umsatz beträgt null",
      "Das Unternehmen erzielt maximalen Gewinn"
    ],
    "correctAnswer": 0,
    "explanation": "Am Break-Even decken die Erlöse genau die Gesamtkosten.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-027",
    "category": "Rechnungen",
    "topic": "Break-Even",
    "difficulty": "medium",
    "question": "Was beschreibt die „Sicherheitsspanne“ beim Break-Even?",
    "answers": [
      "Den Abstand zwischen tatsächlichem Absatz und Break-Even-Menge",
      "Die Höhe der Mehrwertsteuer",
      "Die Differenz zwischen Einkaufspreis und Verkaufspreis",
      "Die jährlichen Fixkosten"
    ],
    "correctAnswer": 0,
    "explanation": "Die Sicherheitsspanne zeigt, wie weit der tatsächliche Absatz über der Break-Even-Menge liegt.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-028",
    "category": "Rechnungen",
    "topic": "Wirtschaftlichkeit",
    "difficulty": "medium",
    "question": "Was misst die Wirtschaftlichkeit?",
    "answers": [
      "Das Verhältnis von Ertrag zu Aufwand in Geldeinheiten",
      "Nur die Anzahl produzierter Stücke",
      "Die Zahl der Mitarbeiter",
      "Nur die Höhe der Fixkosten"
    ],
    "correctAnswer": 0,
    "explanation": "Die Wirtschaftlichkeit wird als Ertrag geteilt durch Aufwand berechnet.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-029",
    "category": "Rechnungen",
    "topic": "Wirtschaftlichkeit",
    "difficulty": "medium",
    "question": "Was bedeutet „Ertrag“ im Zusammenhang mit der Wirtschaftlichkeit?",
    "answers": [
      "Die eingesetzten Kosten",
      "Der wirtschaftliche Wert beziehungsweise die erzielte Leistung in Geldeinheiten",
      "Die Anzahl der Mitarbeiter",
      "Nur der Gewinn nach Steuern"
    ],
    "correctAnswer": 1,
    "explanation": "Bei der Wirtschaftlichkeit wird der Ertrag dem Aufwand gegenübergestellt.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-030",
    "category": "Rechnungen",
    "topic": "Wirtschaftlichkeit",
    "difficulty": "medium",
    "question": "Was bedeutet „Aufwand“ in der Formel zur Wirtschaftlichkeit?",
    "answers": [
      "Die eingesetzten wirtschaftlichen Mittel beziehungsweise Kosten",
      "Der erzielte Umsatz",
      "Die Absatzmenge",
      "Der Deckungsbeitrag pro Stück"
    ],
    "correctAnswer": 0,
    "explanation": "Der Aufwand beschreibt den wirtschaftlichen Einsatz, der dem Ertrag gegenübergestellt wird.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-031",
    "category": "Rechnungen",
    "topic": "Wirtschaftlichkeit",
    "difficulty": "medium",
    "question": "Was bedeutet eine Wirtschaftlichkeit von 1,25?",
    "answers": [
      "Der Aufwand ist höher als der Ertrag",
      "Das Unternehmen arbeitet wirtschaftlich",
      "Das Unternehmen arbeitet genau kostendeckend",
      "Das Unternehmen hat 25 % Verlust"
    ],
    "correctAnswer": 1,
    "explanation": "Ein Wert über 1 bedeutet, dass der Ertrag den Aufwand übersteigt.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-032",
    "category": "Rechnungen",
    "topic": "Wirtschaftlichkeit",
    "difficulty": "medium",
    "question": "Was bedeutet eine Wirtschaftlichkeit von genau 1,0?",
    "answers": [
      "25 % Gewinn",
      "Unwirtschaftlich",
      "Kostendeckend",
      "Keine variablen Kosten"
    ],
    "correctAnswer": 2,
    "explanation": "Bei 1,0 sind Ertrag und Aufwand gleich hoch.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-033",
    "category": "Rechnungen",
    "topic": "Wirtschaftlichkeit",
    "difficulty": "medium",
    "question": "Was bedeutet eine Wirtschaftlichkeit kleiner als 1,0?",
    "answers": [
      "Der Ertrag ist höher als der Aufwand",
      "Das Unternehmen arbeitet unwirtschaftlich",
      "Das Unternehmen ist automatisch am Break-Even",
      "Die Produktivität ist sehr hoch"
    ],
    "correctAnswer": 1,
    "explanation": "Ein Wert unter 1 bedeutet, dass der Aufwand höher als der Ertrag ist.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-034",
    "category": "Rechnungen",
    "topic": "Produktivität",
    "difficulty": "medium",
    "question": "Was misst die Produktivität?",
    "answers": [
      "Ertrag geteilt durch Aufwand in Euro",
      "Output im Verhältnis zum Input in Mengeneinheiten",
      "Gewinn geteilt durch Kapital",
      "Fixkosten geteilt durch Deckungsbeitrag"
    ],
    "correctAnswer": 1,
    "explanation": "Produktivität beschreibt das Verhältnis von Output zu Input in Mengeneinheiten.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-035",
    "category": "Rechnungen",
    "topic": "Produktivität",
    "difficulty": "medium",
    "question": "Ein Helpdesk bearbeitet 600 Tickets mit 5 Mitarbeitern. Welche Größe wird mit 600 / 5 berechnet?",
    "answers": [
      "Wirtschaftlichkeit",
      "ROI",
      "Arbeitsproduktivität",
      "Break-Even-Umsatz"
    ],
    "correctAnswer": 2,
    "explanation": "Tickets pro Mitarbeiter sind eine mengenmäßige Produktivitätskennzahl.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-036",
    "category": "Rechnungen",
    "topic": "TCO",
    "difficulty": "medium",
    "question": "Was bedeutet „Total Cost of Ownership“?",
    "answers": [
      "Nur der Anschaffungspreis eines Systems",
      "Alle Kosten eines Systems über seine gesamte Nutzungsdauer",
      "Nur Wartungs- und Reparaturkosten",
      "Der Gewinn, den ein System erzeugt"
    ],
    "correctAnswer": 1,
    "explanation": "TCO erfasst die Gesamtkosten einer Investition über die gesamte Lebensdauer.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-037",
    "category": "Rechnungen",
    "topic": "TCO",
    "difficulty": "medium",
    "question": "Was sind „Anschaffungskosten“?",
    "answers": [
      "Kosten für den Kauf beziehungsweise die erstmalige Beschaffung eines Systems",
      "Kosten für tägliche Stromnutzung",
      "Kosten für Schulungen nach fünf Jahren",
      "Gewinn aus dem Verkauf eines Systems"
    ],
    "correctAnswer": 0,
    "explanation": "Anschaffungskosten entstehen bei der Beschaffung beziehungsweise Einrichtung einer Investition.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-038",
    "category": "Rechnungen",
    "topic": "TCO",
    "difficulty": "medium",
    "question": "Was sind „Betriebskosten“ im TCO-Kontext?",
    "answers": [
      "Laufende Kosten wie Strom, Lizenzen oder Cloud-Nutzung",
      "Nur der Kaufpreis der Hardware",
      "Nur Entsorgungskosten",
      "Der erwartete Gewinn"
    ],
    "correctAnswer": 0,
    "explanation": "Betriebskosten fallen während des laufenden Betriebs eines Systems an.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-039",
    "category": "Rechnungen",
    "topic": "TCO",
    "difficulty": "medium",
    "question": "Was gehört typischerweise zu den Wartungskosten?",
    "answers": [
      "Support, Reparaturen und Updates",
      "Nur der Kaufpreis",
      "Nur Werbung",
      "Nur Mehrwertsteuer"
    ],
    "correctAnswer": 0,
    "explanation": "Wartungskosten umfassen unter anderem Support, Reparaturen und Updates.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-040",
    "category": "Rechnungen",
    "topic": "TCO",
    "difficulty": "medium",
    "question": "Was bedeutet „Nutzungsdauer“?",
    "answers": [
      "Die Zeitspanne, über die ein System verwendet wird",
      "Die Dauer einer einzelnen Reparatur",
      "Die Arbeitszeit eines Mitarbeiters pro Tag",
      "Die Lieferzeit eines Produkts"
    ],
    "correctAnswer": 0,
    "explanation": "Die Nutzungsdauer ist der Zeitraum, über den eine Investition beziehungsweise ein System genutzt wird.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-041",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Was misst der ROI?",
    "answers": [
      "Wie rentabel eine Investition im Verhältnis zum eingesetzten Kapital ist",
      "Wie viele Stücke produziert werden",
      "Wie hoch die Fixkosten sind",
      "Wann ein Produkt geliefert wird"
    ],
    "correctAnswer": 0,
    "explanation": "Der ROI setzt den Gewinn ins Verhältnis zum eingesetzten Kapital und wird in Prozent angegeben.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-042",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Was bedeutet „eingesetztes Kapital“ beim ROI?",
    "answers": [
      "Das Kapital, das für die Investition eingesetzt beziehungsweise gebunden wurde",
      "Der Umsatz des gesamten Unternehmens",
      "Nur die variablen Kosten",
      "Die Absatzmenge"
    ],
    "correctAnswer": 0,
    "explanation": "Beim ROI wird der Gewinn auf das für die Investition eingesetzte Kapital bezogen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-043",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Was beschreibt die Amortisationsdauer?",
    "answers": [
      "Wie lange es dauert, bis sich eine Investition durch Rückflüsse zurückgezahlt hat",
      "Wie lange ein Mitarbeiter täglich arbeitet",
      "Wie lange ein Produkt im Lager liegt",
      "Wie lange eine Rechnung gültig ist"
    ],
    "correctAnswer": 0,
    "explanation": "Die Amortisationsdauer zeigt, nach welcher Zeit die Investition wirtschaftlich zurückgeflossen ist.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-044",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Was bedeutet „Rückfluss“ bei der Amortisationsrechnung?",
    "answers": [
      "Ein wirtschaftlicher Mittelzufluss, der zur Rückzahlung der Investition beiträgt",
      "Eine zusätzliche Ausgabe",
      "Eine neue Fixkostenposition",
      "Eine Preisreduzierung"
    ],
    "correctAnswer": 0,
    "explanation": "Der Rückfluss ist der Betrag, der aus der Investition zurückkommt und zur Amortisation beiträgt.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-045",
    "category": "Rechnungen",
    "topic": "Deckungsbeitrag",
    "difficulty": "medium",
    "question": "Ein Produkt kostet 80 €. Die variablen Stückkosten betragen 50 €. Wie hoch ist der Stückdeckungsbeitrag?",
    "answers": [
      "20 €",
      "30 €",
      "50 €",
      "130 €"
    ],
    "correctAnswer": 1,
    "explanation": "Deckungsbeitrag pro Stück = 80 € - 50 € = 30 €.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-046",
    "category": "Rechnungen",
    "topic": "Deckungsbeitrag",
    "difficulty": "medium",
    "question": "Ein Service kostet 100 € pro Monat. Die variablen Kosten betragen 25 € pro Kunde. Wie hoch ist der Deckungsbeitrag pro Kunde?",
    "answers": [
      "25 €",
      "75 €",
      "100 €",
      "125 €"
    ],
    "correctAnswer": 1,
    "explanation": "100 € - 25 € = 75 € Deckungsbeitrag.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-047",
    "category": "Rechnungen",
    "topic": "Deckungsbeitrag",
    "difficulty": "medium",
    "question": "Der Stückdeckungsbeitrag beträgt 40 € und es werden 200 Stück verkauft. Wie hoch ist der Gesamtdeckungsbeitrag?",
    "answers": [
      "8.000 €",
      "240 €",
      "5.000 €",
      "40.200 €"
    ],
    "correctAnswer": 0,
    "explanation": "Gesamtdeckungsbeitrag = 40 € × 200 = 8.000 €.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-048",
    "category": "Rechnungen",
    "topic": "Deckungsbeitrag",
    "difficulty": "medium",
    "question": "Der Gesamtdeckungsbeitrag beträgt 15.000 € und die Fixkosten betragen 12.000 €. Wie hoch ist das Betriebsergebnis?",
    "answers": [
      "3.000 €",
      "27.000 €",
      "12.000 €",
      "-3.000 €"
    ],
    "correctAnswer": 0,
    "explanation": "Betriebsergebnis = Gesamtdeckungsbeitrag - Fixkosten = 3.000 €.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-049",
    "category": "Rechnungen",
    "topic": "Deckungsbeitrag",
    "difficulty": "medium",
    "question": "Ein Produkt wird für 60 € verkauft. Die variablen Kosten betragen 45 €. Wie hoch ist der Deckungsbeitrag in Prozent vom Verkaufspreis?",
    "answers": [
      "15 %",
      "20 %",
      "25 %",
      "75 %"
    ],
    "correctAnswer": 2,
    "explanation": "Der Deckungsbeitrag beträgt 15 €. 15 / 60 × 100 = 25 %.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-050",
    "category": "Rechnungen",
    "topic": "Break-Even",
    "difficulty": "medium",
    "question": "Die Fixkosten betragen 6.000 €. Der Deckungsbeitrag pro Stück beträgt 30 €. Wie hoch ist die Break-Even-Menge?",
    "answers": [
      "180 Stück",
      "200 Stück",
      "30 Stück",
      "6.030 Stück"
    ],
    "correctAnswer": 1,
    "explanation": "BEP = Fixkosten / Stückdeckungsbeitrag = 6.000 / 30 = 200 Stück.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-051",
    "category": "Rechnungen",
    "topic": "Break-Even",
    "difficulty": "medium",
    "question": "Ein Unternehmen verkauft ein Produkt für 50 €. Die variablen Kosten betragen 20 €. Die Fixkosten betragen 9.000 €. Welcher Wert wird zuerst für die Break-Even-Berechnung benötigt?",
    "answers": [
      "Der Stückdeckungsbeitrag von 30 €",
      "Der Umsatz von 9.000 €",
      "Die Mehrwertsteuer",
      "Der Gewinnzuschlag"
    ],
    "correctAnswer": 0,
    "explanation": "Zuerst wird der Stückdeckungsbeitrag berechnet: 50 € - 20 € = 30 €.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-052",
    "category": "Rechnungen",
    "topic": "Break-Even",
    "difficulty": "medium",
    "question": "Bei einer Break-Even-Menge von 300 Stück und einem Verkaufspreis von 40 € pro Stück beträgt der Break-Even-Umsatz:",
    "answers": [
      "7.500 €",
      "12.000 €",
      "340 €",
      "40 €"
    ],
    "correctAnswer": 1,
    "explanation": "Break-Even-Umsatz = 300 × 40 € = 12.000 €.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-053",
    "category": "Rechnungen",
    "topic": "Break-Even",
    "difficulty": "medium",
    "question": "Ein Unternehmen liegt mit seiner Absatzmenge genau am Break-Even-Point. Wie hoch ist sein Betriebsergebnis?",
    "answers": [
      "Positiv",
      "Negativ",
      "Null",
      "Es kann nicht bestimmt werden"
    ],
    "correctAnswer": 2,
    "explanation": "Am Break-Even sind Erlöse und Gesamtkosten gleich hoch. Das Ergebnis ist null.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-054",
    "category": "Rechnungen",
    "topic": "Wirtschaftlichkeit",
    "difficulty": "medium",
    "question": "Ein Projekt erzielt 120.000 € Ertrag bei 100.000 € Aufwand. Wie hoch ist die Wirtschaftlichkeit?",
    "answers": [
      "0,83",
      "1,00",
      "1,20",
      "20,00"
    ],
    "correctAnswer": 2,
    "explanation": "Wirtschaftlichkeit = 120.000 / 100.000 = 1,20.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-055",
    "category": "Rechnungen",
    "topic": "Wirtschaftlichkeit",
    "difficulty": "medium",
    "question": "Ein Projekt hat eine Wirtschaftlichkeit von 0,90. Welche Aussage ist richtig?",
    "answers": [
      "Der Ertrag ist größer als der Aufwand",
      "Das Projekt arbeitet kostendeckend",
      "Der Aufwand ist größer als der Ertrag",
      "Die Produktivität beträgt 90 Stück"
    ],
    "correctAnswer": 2,
    "explanation": "Ein Wert unter 1 bedeutet, dass der Aufwand den Ertrag übersteigt.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-056",
    "category": "Rechnungen",
    "topic": "Wirtschaftlichkeit",
    "difficulty": "medium",
    "question": "Ein Unternehmen erzielt 50.000 € Ertrag bei 50.000 € Aufwand. Wie hoch ist die Wirtschaftlichkeit?",
    "answers": [
      "0,5",
      "1,0",
      "2,0",
      "50.000"
    ],
    "correctAnswer": 1,
    "explanation": "50.000 / 50.000 = 1,0. Das Unternehmen arbeitet kostendeckend.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-057",
    "category": "Rechnungen",
    "topic": "Produktivität",
    "difficulty": "medium",
    "question": "Ein Helpdesk löst 1.200 Tickets mit 6 Mitarbeitern. Wie hoch ist die Produktivität pro Mitarbeiter?",
    "answers": [
      "72 Tickets",
      "200 Tickets",
      "1.206 Tickets",
      "7.200 Tickets"
    ],
    "correctAnswer": 1,
    "explanation": "1.200 / 6 = 200 Tickets pro Mitarbeiter.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-058",
    "category": "Rechnungen",
    "topic": "Produktivität",
    "difficulty": "medium",
    "question": "Ein Team produziert mit 5 Mitarbeitern 20 Module. Nach einer Verbesserung produziert es 25 Module mit denselben 5 Mitarbeitern. Was ist passiert?",
    "answers": [
      "Die Produktivität ist gestiegen",
      "Die Produktivität ist gesunken",
      "Die Wirtschaftlichkeit muss gesunken sein",
      "Die Fixkosten wurden null"
    ],
    "correctAnswer": 0,
    "explanation": "Bei gleichem Input wird mehr Output erzeugt. Damit steigt die Produktivität.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-059",
    "category": "Rechnungen",
    "topic": "TCO",
    "difficulty": "medium",
    "question": "Ein Server kostet 10.000 € in der Anschaffung. Zusätzlich entstehen über die Nutzungsdauer 8.000 € Betriebskosten und 2.000 € Wartungskosten. Wie hoch ist die TCO dieser drei Positionen?",
    "answers": [
      "10.000 €",
      "18.000 €",
      "20.000 €",
      "80.000 €"
    ],
    "correctAnswer": 2,
    "explanation": "TCO = 10.000 € + 8.000 € + 2.000 € = 20.000 €.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-060",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Eine Investition kostet 50.000 €. Der jährliche Rückfluss beträgt 10.000 €. Wie lange beträgt die statische Amortisationsdauer?",
    "answers": [
      "2 Jahre",
      "5 Jahre",
      "10 Jahre",
      "50 Jahre"
    ],
    "correctAnswer": 1,
    "explanation": "Amortisation = Investition / jährlicher Rückfluss = 50.000 / 10.000 = 5 Jahre.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-061",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Der Gewinn einer Investition beträgt 20.000 € und das eingesetzte Kapital 100.000 €. Wie hoch ist der ROI?",
    "answers": [
      "5 %",
      "20 %",
      "50 %",
      "120 %"
    ],
    "correctAnswer": 1,
    "explanation": "ROI = 20.000 / 100.000 × 100 = 20 %.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-062",
    "category": "Rechnungen",
    "topic": "Break-Even",
    "difficulty": "medium",
    "question": "Was ist der „Ist-Absatz“?",
    "answers": [
      "Die tatsächlich erreichte Absatzmenge",
      "Die maximal mögliche Absatzmenge",
      "Die geplante Absatzmenge für nächstes Jahr",
      "Die Break-Even-Menge"
    ],
    "correctAnswer": 0,
    "explanation": "„Ist“ bezeichnet in solchen Aufgaben den tatsächlich vorhandenen oder erreichten Wert.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-063",
    "category": "Rechnungen",
    "topic": "Break-Even",
    "difficulty": "medium",
    "question": "Ein Betrieb verkauft mehr als die Break-Even-Menge. Was beschreibt die „Sicherheitsspanne“?",
    "answers": [
      "Wie weit der tatsächliche Absatz über der Break-Even-Menge liegt",
      "Den Unterschied zwischen zwei Verkaufspreisen",
      "Die Höhe der Fixkosten",
      "Die maximale Produktionskapazität"
    ],
    "correctAnswer": 0,
    "explanation": "Die Sicherheitsspanne ist die Differenz zwischen Ist-Absatz und Break-Even-Menge.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-064",
    "category": "Rechnungen",
    "topic": "Break-Even",
    "difficulty": "medium",
    "question": "Was bedeutet „gewichteter BEP“ in einer Aufgabe mit mehreren Produktvarianten?",
    "answers": [
      "Ein Break-Even unter Berücksichtigung der jeweiligen Anteile der Varianten",
      "Ein BEP, der in Kilogramm angegeben wird",
      "Nur der BEP des teuersten Produkts",
      "Der durchschnittliche Verkaufspreis ohne Kosten"
    ],
    "correctAnswer": 0,
    "explanation": "Bei mehreren Varianten werden deren Anteile beziehungsweise Gewichtungen berücksichtigt.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-065",
    "category": "Rechnungen",
    "topic": "Wirtschaftlichkeit",
    "difficulty": "medium",
    "question": "Was bedeutet „Erlöse erzielt“?",
    "answers": [
      "Einnahmen beziehungsweise Erträge wurden erwirtschaftet",
      "Kosten wurden bezahlt",
      "Produkte wurden vernichtet",
      "Mitarbeiter wurden eingestellt"
    ],
    "correctAnswer": 0,
    "explanation": "„Erzielen“ bedeutet in diesem Zusammenhang wirtschaftlich erreichen oder erwirtschaften.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-066",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Was bedeutet „Return on Investment (ROI)“?",
    "answers": [
      "Das Verhältnis von Gewinn zum eingesetzten Kapital",
      "Das Verhältnis von Umsatz zu Fixkosten",
      "Die Zeit bis zum Break-Even",
      "Die Summe aller Betriebskosten"
    ],
    "correctAnswer": 0,
    "explanation": "Der ROI misst die Rentabilität einer Investition und setzt den Gewinn ins Verhältnis zum eingesetzten Kapital.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-067",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Was bedeutet „eingesetztes Kapital“?",
    "answers": [
      "Das Kapital, das für die Investition eingesetzt wurde",
      "Der gesamte Jahresumsatz",
      "Nur die laufenden Kosten",
      "Die Absatzmenge"
    ],
    "correctAnswer": 0,
    "explanation": "Bei einer Investition ist das eingesetzte Kapital der dafür aufgewendete Geldbetrag, also die Investitionssumme.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-068",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Was ist die „Investitionssumme“?",
    "answers": [
      "Der insgesamt investierte Geldbetrag",
      "Der jährliche Gewinn",
      "Die Summe aller verkauften Stücke",
      "Die Differenz zwischen Erlös und Kosten"
    ],
    "correctAnswer": 0,
    "explanation": "Die Investitionssumme ist der Geldbetrag, der in eine Investition eingebracht wird.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-069",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Eine Investition bringt 18.000 € Mehrerlös und verursacht 5.000 € zusätzliche Kosten. Wie hoch ist der jährliche Gewinn aus der Investition?",
    "answers": [
      "13.000 €",
      "18.000 €",
      "23.000 €",
      "5.000 €"
    ],
    "correctAnswer": 0,
    "explanation": "Gewinn = Mehrerlös - zusätzliche Kosten = 13.000 €.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-070",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Eine Investition kostet 50.000 € und erzeugt 13.000 € jährlichen Gewinn. Wie hoch ist der ROI?",
    "answers": [
      "13 %",
      "20 %",
      "26 %",
      "38 %"
    ],
    "correctAnswer": 2,
    "explanation": "ROI = 13.000 / 50.000 × 100 = 26 %.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-071",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Ein Ticketsystem spart jährlich 6.200 € ein und verursacht 1.800 € laufende Kosten. Wie hoch ist der jährliche Nettoeffekt?",
    "answers": [
      "4.400 €",
      "6.200 €",
      "8.000 €",
      "1.800 €"
    ],
    "correctAnswer": 0,
    "explanation": "6.200 € - 1.800 € = 4.400 €.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-072",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Was bedeutet „amortisiert“?",
    "answers": [
      "Die Investition wurde durch Rückflüsse wirtschaftlich ausgeglichen",
      "Die Investition verursacht keine laufenden Kosten mehr",
      "Die Investition wurde verkauft",
      "Der Umsatz wurde verdoppelt"
    ],
    "correctAnswer": 0,
    "explanation": "Eine Investition ist amortisiert, wenn ihre ursprünglichen Kosten durch Rückflüsse ausgeglichen wurden.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-073",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Ein Unternehmen setzt 200.000 € Kapital ein und erzielt 36.000 € Gewinn. Wie hoch ist der ROI?",
    "answers": [
      "12 %",
      "18 %",
      "36 %",
      "72 %"
    ],
    "correctAnswer": 1,
    "explanation": "ROI = 36.000 / 200.000 × 100 = 18 %.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-074",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Was bedeutet „Umsatzrentabilität“ in der DuPont-Formel?",
    "answers": [
      "Gewinn im Verhältnis zum Umsatz",
      "Umsatz im Verhältnis zum Kapital",
      "Gewinn im Verhältnis zu den Fixkosten",
      "Kosten im Verhältnis zum Umsatz"
    ],
    "correctAnswer": 0,
    "explanation": "Die Umsatzrentabilität in Prozent berechnet sich als Gewinn / Umsatz × 100.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-075",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Was bedeutet „Kapitalumschlag“?",
    "answers": [
      "Umsatz im Verhältnis zum eingesetzten Kapital",
      "Gewinn im Verhältnis zum Umsatz",
      "Fixkosten im Verhältnis zum Kapital",
      "Investition im Verhältnis zur Nutzungsdauer"
    ],
    "correctAnswer": 0,
    "explanation": "Der Kapitalumschlag wird als Umsatz / eingesetztes Kapital berechnet.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-076",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Projekt A hat einen ROI von 35 %, Projekt B von 32 %. Welches Projekt ist nach ROI rentabler?",
    "answers": [
      "Projekt A",
      "Projekt B",
      "Beide gleich",
      "Nicht bestimmbar"
    ],
    "correctAnswer": 0,
    "explanation": "Bei ansonsten gleicher Betrachtung zeigt der höhere ROI die höhere Rentabilität.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-077",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Die Gewinne über vier Jahre betragen -7.000 €, 17.000 €, 24.000 € und 30.000 €. Was bedeutet „kumulierten Gewinn berechnen“?",
    "answers": [
      "Alle vier Jahresergebnisse addieren",
      "Nur Jahr 4 verwenden",
      "Den Durchschnitt bilden",
      "Nur positive Jahre berücksichtigen"
    ],
    "correctAnswer": 0,
    "explanation": "Kumuliert bedeutet, die Werte über den betrachteten Zeitraum zu summieren.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-078",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "45 Neukunden erzielen je 1.200 € Jahresumsatz. Wie hoch ist der gesamte zusätzliche Jahresumsatz?",
    "answers": [
      "45.000 €",
      "54.000 €",
      "1.245 €",
      "27.000 €"
    ],
    "correctAnswer": 1,
    "explanation": "45 × 1.200 € = 54.000 €.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-079",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Der zusätzliche Umsatz beträgt 54.000 € und die Marge 25 %. Wie hoch ist der daraus resultierende Gewinn vor Kampagnenkosten?",
    "answers": [
      "13.500 €",
      "21.600 €",
      "25.000 €",
      "54.000 €"
    ],
    "correctAnswer": 0,
    "explanation": "54.000 × 0,25 = 13.500 €.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-080",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Die alten Geräte kosten jährlich 14.400 € im Betrieb, die neuen 7.600 €. Wie hoch ist die jährliche Einsparung?",
    "answers": [
      "6.800 €",
      "7.600 €",
      "14.400 €",
      "22.000 €"
    ],
    "correctAnswer": 0,
    "explanation": "14.400 € - 7.600 € = 6.800 €.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-081",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Was bedeutet „Nettonutzen“ in der Formel „Erlöse + Einsparungen − laufende Kosten“?",
    "answers": [
      "Der verbleibende wirtschaftliche Nutzen nach Abzug der laufenden Kosten",
      "Nur der Umsatz",
      "Nur die Einsparungen",
      "Die Investitionssumme"
    ],
    "correctAnswer": 0,
    "explanation": "Erlöse und Einsparungen erhöhen den Nettonutzen. Laufende Kosten vermindern ihn. Die Investitionssumme wird in dieser Formel nicht abgezogen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-082",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Was bedeutet „Gesamt-ROI der gewählten Kombination“?",
    "answers": [
      "Der ROI der gemeinsam ausgewählten Investitionen als Gesamtbetrachtung",
      "Der höchste Einzel-ROI",
      "Nur der ROI der billigsten Investition",
      "Die Summe der Prozentwerte ohne Bezug auf Kapital"
    ],
    "correctAnswer": 0,
    "explanation": "Die Kombination wird als gemeinsame Investition mit gemeinsamem Gewinn und Kapital betrachtet.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-083",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Was ist „Umsatzrentabilität“?",
    "answers": [
      "Gewinn im Verhältnis zum Umsatz",
      "Umsatz im Verhältnis zum Kapital",
      "Kapital im Verhältnis zum Gewinn",
      "Kosten im Verhältnis zum Umsatz"
    ],
    "correctAnswer": 0,
    "explanation": "Umsatzrentabilität = Gewinn / Umsatz × 100.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-084",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Ein Unternehmen erzielt 50.000 € Gewinn bei 500.000 € Umsatz. Wie hoch ist die Umsatzrentabilität?",
    "answers": [
      "5 %",
      "10 %",
      "50 %",
      "100 %"
    ],
    "correctAnswer": 1,
    "explanation": "50.000 / 500.000 × 100 = 10 %.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-085",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Ein Unternehmen erzielt 1.000.000 € Umsatz bei 500.000 € eingesetztem Kapital. Wie hoch ist der Kapitalumschlag?",
    "answers": [
      "0,5",
      "1",
      "2",
      "5"
    ],
    "correctAnswer": 2,
    "explanation": "Kapitalumschlag = 1.000.000 / 500.000 = 2.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-086",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Die Umsatzrentabilität beträgt 10 % und der Kapitalumschlag 2. Wie hoch ist der ROI nach der DuPont-Formel?",
    "answers": [
      "5 %",
      "10 %",
      "20 %",
      "200 %"
    ],
    "correctAnswer": 2,
    "explanation": "ROI = 10 % × 2 = 20 %.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-087",
    "category": "Rechnungen",
    "topic": "ROI-Amortisation",
    "difficulty": "medium",
    "question": "Über welche zwei Größen kann der ROI in der DuPont-Betrachtung beeinflusst werden?",
    "answers": [
      "Umsatzrentabilität und Kapitalumschlag",
      "Fixkosten und Absatzmenge",
      "TCO und Break-Even",
      "Stückpreis und Mehrwertsteuer"
    ],
    "correctAnswer": 0,
    "explanation": "Die DuPont-Formel zerlegt den ROI in Umsatzrentabilität und Kapitalumschlag.",
    "source": "rechnungen.csv"
  },
  {
    "id": "wiso-001",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Wie kommt ein Kaufvertrag grundsätzlich zustande?",
    "answers": [
      "Durch zwei übereinstimmende Willenserklärungen, normalerweise Angebot und Annahme",
      "Allein durch die Ausstellung einer Rechnung",
      "Nur durch eine schriftliche Unterschrift beider Parteien",
      "Erst nach vollständiger Bezahlung"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Vertrag kommt grundsätzlich durch zwei übereinstimmende Willenserklärungen zustande. Typischerweise sind dies Angebot und Annahme.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-002",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Händler übergibt einem Kunden einen Laptop unter wirksam vereinbartem einfachem Eigentumsvorbehalt. Der Kaufpreis ist noch nicht vollständig bezahlt; der Kunde nutzt das Gerät. Welche Zuordnung ist nach deutschem Zivilrecht zutreffend?",
    "answers": [
      "Der Kunde ist unmittelbarer Besitzer; der Händler bleibt Eigentümer.",
      "Der Händler ist unmittelbarer Besitzer; der Kunde ist Eigentümer.",
      "Der Kunde ist sowohl unmittelbarer Besitzer als auch Eigentümer.",
      "Der Händler ist sowohl unmittelbarer Besitzer als auch Eigentümer."
    ],
    "correctAnswer": 0,
    "explanation": "Die tatsächliche Sachherrschaft liegt beim Kunden. Beim einfachen Eigentumsvorbehalt geht das Eigentum grundsätzlich erst mit vollständiger Zahlung über.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-003",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine Verbraucherin kauft in Deutschland einen neuen Laptop bei einem Händler. Zusätzlich gibt der Hersteller eine freiwillige Garantie. Wie verhält sich diese zu den gesetzlichen Mängelrechten aus dem Kaufvertrag?",
    "answers": [
      "Die Garantie ergänzt die gesetzlichen Mängelrechte gegen den Händler.",
      "Die Garantie ersetzt die gesetzlichen Mängelrechte gegen den Händler.",
      "Die gesetzlichen Mängelrechte entstehen erst nach Ablauf der Garantie.",
      "Die gesetzlichen Mängelrechte können nur beim Hersteller geltend gemacht werden."
    ],
    "correctAnswer": 0,
    "explanation": "Gesetzliche Mängelrechte richten sich grundsätzlich gegen den Verkäufer. Eine zusätzliche Herstellergarantie ist im zugesagten Umfang verbindlich und verdrängt diese Rechte nicht.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-004",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Beschäftigter in Deutschland wird morgens vor Arbeitsbeginn arbeitsunfähig krank und kann seinen Arbeitgeber erreichen. Wann muss er nach dem Entgeltfortzahlungsgesetz die Arbeitsunfähigkeit und ihre voraussichtliche Dauer mitteilen?",
    "answers": [
      "Unverzüglich, ohne erst einen ärztlichen Nachweis abzuwarten.",
      "Erst nach dem Arztbesuch, sobald ein ärztlicher Nachweis vorliegt.",
      "Erst nach drei Kalendertagen, wenn die Erkrankung noch andauert.",
      "Erst bei der Rückkehr, wenn die tatsächliche Dauer bekannt ist."
    ],
    "correctAnswer": 0,
    "explanation": "Die unverzügliche Mitteilung ist von den Regeln zum ärztlichen Nachweis zu unterscheiden; ein späterer Arzttermin rechtfertigt grundsätzlich kein Warten mit der Krankmeldung.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-005",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Sozialversicherung sichert Einkommensausfälle bei Arbeitslosigkeit ab?",
    "answers": [
      "Arbeitslosenversicherung",
      "Pflegeversicherung",
      "Unfallversicherung",
      "Rentenversicherung"
    ],
    "correctAnswer": 0,
    "explanation": "Die Arbeitslosenversicherung soll unter bestimmten Voraussetzungen Einkommensausfälle durch Arbeitslosigkeit absichern und unterstützt außerdem bei der Arbeitsvermittlung.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-006",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Leistungen gehören in Deutschland typischerweise zur gesetzlichen Unfallversicherung für Beschäftigte?",
    "answers": [
      "Behandlung und Rehabilitation nach versicherten Arbeits- und Wegeunfällen.",
      "Ärztliche Behandlung gewöhnlicher Erkrankungen ohne Bezug zur Arbeit.",
      "Einkommensersatz während versicherter Arbeitslosigkeit und Arbeitssuche.",
      "Unterstützung im Alltag bei dauerhaft bestehender Pflegebedürftigkeit."
    ],
    "correctAnswer": 0,
    "explanation": "Die gesetzliche Unfallversicherung umfasst insbesondere versicherte Arbeits- und Wegeunfälle sowie anerkannte Berufskrankheiten; die übrigen Leistungen gehören anderen Sozialversicherungszweigen zu.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-008",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Betrieb vergleicht Geräte nach Preis, Verbrauch und Service mit unterschiedlicher Gewichtung. Welche Methode eignet sich?",
    "answers": [
      "Eine Nutzwertanalyse mit gewichteten Kriterien und Bewertungen je Alternative.",
      "Ein Preisvergleich, der ausschließlich den niedrigsten Kaufpreis berücksichtigt.",
      "Eine Mindestanforderungsprüfung, bei der alle Kriterien gleich wichtig sind.",
      "Eine Absatzprognose, die nur vergangene Verkaufszahlen fortschreibt."
    ],
    "correctAnswer": 0,
    "explanation": "Eine Nutzwertanalyse macht unterschiedliche Kriterien, ihre Gewichtung und die Bewertung der Alternativen gemeinsam sichtbar.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-009",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aussage beschreibt das Prinzip von Angebot und Nachfrage in einer Marktwirtschaft am besten?",
    "answers": [
      "Steigt bei gleichbleibendem Angebot die Nachfrage deutlich, kann der Marktpreis steigen",
      "Eine steigende Nachfrage führt grundsätzlich immer zu sinkenden Preisen",
      "Der Preis wird ausschließlich durch Produktionskosten bestimmt",
      "Angebot und Nachfrage haben keinen Einfluss auf Marktpreise"
    ],
    "correctAnswer": 0,
    "explanation": "Bei ansonsten unveränderten Bedingungen kann eine höhere Nachfrage bei gleichem Angebot zu einem höheren Gleichgewichtspreis führen.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-010",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Betrieb besitzt Maschinen, kann aber eine fällige Rechnung mangels Zahlungsmitteln nicht bezahlen. Welche Größe ist betroffen?",
    "answers": [
      "Die Liquidität.",
      "Die Produktivität.",
      "Die Umsatzrentabilität.",
      "Der Marktanteil."
    ],
    "correctAnswer": 0,
    "explanation": "Liquidität bezeichnet die Fähigkeit, fällige Zahlungen rechtzeitig zu leisten. Maschinenvermögen steht nicht ohne Weiteres als Zahlungsmittel zur Verfügung.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-011",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Hauptleistung schuldet ein Laptopverkäufer nach dem Bürgerlichen Gesetzbuch?",
    "answers": [
      "Den Laptop frei von Mängeln übergeben und das Eigentum daran verschaffen.",
      "Den Laptop für die vereinbarte Dauer zum Gebrauch überlassen und zurücknehmen.",
      "Den Kunden beim Einsatz beraten, ohne einen bestimmten Erfolg zu schulden.",
      "Den Kontakt zu einem anderen Verkäufer vermitteln und den Abschluss ermöglichen."
    ],
    "correctAnswer": 0,
    "explanation": "Beim Kauf einer Sache schuldet der Verkäufer Übergabe und Eigentumsverschaffung sowie Freiheit von Sach- und Rechtsmängeln; der Käufer schuldet Kaufpreiszahlung und Abnahme.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-012",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Händler bietet einen Laptop für 1.000 € an. Der Kunde antwortet: „Ich kaufe ihn nur für 900 €.“ Wie bewertet man diese Antwort nach dem Bürgerlichen Gesetzbuch?",
    "answers": [
      "Als Ablehnung des ursprünglichen Angebots verbunden mit einem neuen Angebot.",
      "Als unveränderte Annahme mit einem bereits vereinbarten Kaufpreis von 1.000 €.",
      "Als Annahme, die den Kaufpreis ohne weitere Zustimmung auf 900 € senkt.",
      "Als Widerruf eines bereits durch das Händlerangebot geschlossenen Vertrags."
    ],
    "correctAnswer": 0,
    "explanation": "Eine Annahme mit geänderten Bedingungen gilt als Ablehnung und neues Angebot. Der ursprüngliche Kaufvertrag ist dadurch noch nicht zustande gekommen.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-013",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aussage ist nach dem Bürgerlichen Gesetzbuch ein verbindliches Kaufangebot?",
    "answers": [
      "„Ich verkaufe Ihnen diesen Laptop für 900 €; daran bin ich bis Freitag gebunden.“",
      "„Unsere Laptops kosten ab 900 €; Modell und Ausstattung wählen Sie noch aus.“",
      "„Sie interessieren sich für diesen Laptop; den Preis nennen wir nach Ihrer Anfrage.“",
      "„Hier ist unser Prospekt zum Laptop für 900 €; alle Angaben sind unverbindlich.“"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Angebot muss die wesentlichen Vertragsbedingungen bestimmen und einen Bindungswillen erkennen lassen. Im ersten Fall sind Sache, Preis und Vertragspartner festgelegt.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-014",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein deutscher Online-Shop zeigt Waren unverbindlich an. Auf die Bestellung folgen eine reine Eingangsbestätigung und später eine ausdrückliche Annahme. Wann entsteht der Kaufvertrag?",
    "answers": [
      "Mit Zugang der separaten Annahmeerklärung beim Kunden.",
      "Mit dem Aufruf der Produktseite durch den Kunden.",
      "Mit Zugang der automatischen Eingangsbestätigung beim Kunden.",
      "Mit dem späteren Zugang der Rechnung beim Kunden."
    ],
    "correctAnswer": 0,
    "explanation": "Die ausdrücklich als reine Eingangsbestätigung bezeichnete Nachricht ist keine Annahme. Erst die zugegangene separate Annahmeerklärung vervollständigt hier den Vertrag.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-015",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bedeutet Rabatt in einer Kalkulation?",
    "answers": [
      "Preisnachlass auf einen Ausgangspreis.",
      "Zuschlag für verspätete Zahlung.",
      "Steuer auf den Nettopreis.",
      "Kosten für Lagerhaltung."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Rabatt reduziert den Preis nach den vereinbarten Bedingungen.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-016",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bedeutet Skonto?",
    "answers": [
      "Preisnachlass bei Zahlung innerhalb einer bestimmten kurzen Frist.",
      "Preisaufschlag für Expresslieferung.",
      "Umsatzsteuer auf Dienstleistungen.",
      "Rabatt ausschließlich für Großhändler."
    ],
    "correctAnswer": 0,
    "explanation": "Skonto ist ein zeitlich gebundener Nachlass für schnelle Zahlung.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-017",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine Rechnung über 1.000 € bietet 2 % Skonto bei fristgerechter Zahlung. Wie hoch ist der Skontoabzug?",
    "answers": [
      "20 €",
      "2 €",
      "50 €",
      "200 €"
    ],
    "correctAnswer": 0,
    "explanation": "2 % von 1.000 € sind 20 €; der Skontobetrag ist unabhängig davon, ob der Kunde den Abzug tatsächlich nutzt.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-018",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Von 200 € netto gehen zuerst 10 % Rabatt ab, dann 2 % Skonto vom Rest. Ohne Umsatzsteuer und Nebenkosten: Wie hoch ist nur der Skontoabzug?",
    "answers": [
      "3,60 €",
      "4,00 €",
      "20,00 €",
      "23,60 €"
    ],
    "correctAnswer": 0,
    "explanation": "Nach Rabatt bleiben 200 € × 0,90 = 180 €. Das Skonto beträgt 180 € × 0,02 = 3,60 €; der Rabatt gehört nicht zum Skontoabzug.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-019",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist die Zielgruppe eines Dienstleistungsangebots?",
    "answers": [
      "Potenzielle Kunden mit ähnlichen Bedürfnissen, die das Angebot ansprechen soll.",
      "Wettbewerber mit ähnlichen Leistungen, deren Preise beobachtet werden sollen.",
      "Zulieferer mit ähnlichen Vorleistungen, deren Angebote eingeholt werden sollen.",
      "Beschäftigte mit ähnlichen Aufgaben, deren Arbeitszeiten geplant werden sollen."
    ],
    "correctAnswer": 0,
    "explanation": "Die Zielgruppe beschreibt die Kunden, auf deren Bedürfnisse ein Angebot und seine Kommunikation ausgerichtet werden.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-020",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Werbung soll Aufmerksamkeit, Interesse, Kaufwunsch und Handlung auslösen. Welche Maßnahme führt unmittelbar zur Buchung einer Beratung?",
    "answers": [
      "Ein Buchungslink mit auswählbaren Beratungsterminen.",
      "Ein auffälliges Motiv zur ersten Wahrnehmung der Anzeige.",
      "Ein Vergleich zur Erläuterung der Leistungsmerkmale.",
      "Ein Kundenbericht zur Vorstellung des persönlichen Nutzens."
    ],
    "correctAnswer": 0,
    "explanation": "Die Handlungsphase soll eine konkrete Reaktion ermöglichen. Ein direkt nutzbarer Buchungslink setzt dieses Ziel um; die anderen Maßnahmen dienen eher vorgelagerten Wirkungsstufen.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-021",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Perspektive gehört bei SWOT typischerweise zur internen Analyse?",
    "answers": [
      "Stärken und Schwächen",
      "Chancen und Risiken",
      "Markt und Gesetzgebung",
      "Kunden und Wettbewerber ausschließlich"
    ],
    "correctAnswer": 0,
    "explanation": "Strengths und Weaknesses beziehen sich auf interne Faktoren; Opportunities und Threats auf externe.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-022",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Eine neue gesetzliche Vorgabe erhöht nur die Kosten eines Softwareanbieters. Wie ist das in einer Stärken-Schwächen-Chancen-Risiken-Analyse einzuordnen?",
    "answers": [
      "Als externes Risiko.",
      "Als externe Chance.",
      "Als interne Stärke.",
      "Als interne Schwäche."
    ],
    "correctAnswer": 0,
    "explanation": "Die gesetzliche Änderung stammt aus dem Unternehmensumfeld und wirkt sich im beschriebenen Fall nachteilig aus; sie ist daher ein externes Risiko.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-023",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Wie lässt sich am besten prüfen, ob ein Team Kundensysteme nach Ausfällen selbstständig wiederherstellen kann?",
    "answers": [
      "Ergebnisse praxisnaher Wiederherstellungsaufgaben für die einzelnen Teammitglieder.",
      "Die Anzahl besuchter Schulungstage für die einzelnen Teammitglieder.",
      "Die Dauer der Betriebszugehörigkeit der einzelnen Teammitglieder.",
      "Die Höhe der vereinbarten Gehälter der einzelnen Teammitglieder."
    ],
    "correctAnswer": 0,
    "explanation": "Praktische Aufgaben prüfen die benötigte Handlungsfähigkeit unmittelbar. Schulungsdauer, Betriebszugehörigkeit und Gehalt allein belegen diese konkrete Kompetenz nicht.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-024",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Support kostet monatlich 120 € mit Nachtbereitschaft oder 90 € nur zu Bürozeiten. Welche Aussage zum Vergleich ist begründet?",
    "answers": [
      "Vor einem Preis-Leistungs-Vergleich müssen die unterschiedlichen Betreuungszeiten berücksichtigt werden.",
      "Die 90 € belegen bereits niedrigere Kosten je identischer Betreuungsleistung beim Wettbewerber.",
      "Die 120 € belegen bereits einen höheren Gewinn je Kunde beim eigenen Unternehmen.",
      "Die gleiche Branche genügt bereits, um beide Preise als gleichwertige Leistungen zu vergleichen."
    ],
    "correctAnswer": 0,
    "explanation": "Preise sind nur im Zusammenhang mit dem Leistungsumfang vergleichbar. Aus den beiden Preisen allein folgen weder gleiche Leistungen noch die jeweiligen Kosten oder Gewinne.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-025",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Welches Dokument hält die Ziele und Anforderungen des Auftraggebers vor der technischen Ausarbeitung fest?",
    "answers": [
      "Das Lastenheft.",
      "Das Pflichtenheft.",
      "Das Abnahmeprotokoll.",
      "Der Projektstatusbericht."
    ],
    "correctAnswer": 0,
    "explanation": "Das Lastenheft beschreibt die Ziele und Anforderungen aus Auftraggebersicht. Das Pflichtenheft konkretisiert anschließend die vorgesehene Umsetzung aus Auftragnehmersicht.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-026",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Das Lastenheft fordert tägliche Datensicherungen. Welche Aussage konkretisiert die Umsetzung im Pflichtenheft?",
    "answers": [
      "Ein Sicherungsdienst startet täglich um 23 Uhr und schreibt die Daten verschlüsselt auf den vorgesehenen Sicherungsspeicher.",
      "Die Fachabteilung benötigt eine tägliche Sicherung, damit wichtige Geschäftsdaten wiederherstellbar bleiben.",
      "Im gestrigen Abnahmetest konnte die bereitgestellte Sicherung erfolgreich wiederhergestellt werden.",
      "Die Projektleitung berichtet jeden Freitag über den Stand der Arbeiten an der Datensicherung."
    ],
    "correctAnswer": 0,
    "explanation": "Das Pflichtenheft beschreibt, wie die Anforderung umgesetzt werden soll. Bedarf, späteres Testergebnis und Berichtsorganisation erfüllen andere Dokumentationsaufgaben.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-027",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Geschäftsdaten müssen nach einem Ausfall binnen 60 Minuten vollständig wiederherstellbar sein. Geplant sind nächtliche Sicherungen. Welcher Nachweis prüft das Ziel direkt?",
    "answers": [
      "Ein Wiederherstellungstest der festgelegten Daten mit Zeitmessung und Vollständigkeitsprüfung.",
      "Ein Protokoll über den erfolgreichen Abschluss der nächtlichen Sicherung.",
      "Eine Herstellerangabe zur maximalen Übertragungsrate des Sicherungsspeichers.",
      "Ein Nachweis, dass ausreichend Speicherplatz für die Sicherungen vorhanden ist."
    ],
    "correctAnswer": 0,
    "explanation": "Eine erfolgreiche Sicherung allein belegt weder Wiederherstellungsdauer noch Vollständigkeit. Der praktische Wiederherstellungstest prüft beide geforderten Merkmale.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-028",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Supportanbieter vergleicht seine Abläufe und Bearbeitungszeiten mit Branchenbestwerten, um sich zu verbessern. Welche Methode nutzt er?",
    "answers": [
      "Benchmarking.",
      "Eine Zielgruppenanalyse.",
      "Eine Nutzwertanalyse.",
      "Eine Deckungsbeitragsrechnung."
    ],
    "correctAnswer": 0,
    "explanation": "Benchmarking vergleicht geeignete Leistungs- oder Prozesswerte mit Referenzen, um Ansatzpunkte für Verbesserungen zu erkennen.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-029",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Welches Kriterium erfasst die Stakeholder eines Projekts am umfassendsten?",
    "answers": [
      "Personen oder Gruppen können das Projekt beeinflussen oder von seinen Auswirkungen betroffen sein.",
      "Personen oder Gruppen besitzen stimmberechtigte Kapitalanteile an dem Unternehmen, das das Projekt finanziert.",
      "Personen oder Gruppen sind vertraglich mit der Durchführung der einzelnen Projektarbeiten beauftragt.",
      "Personen oder Gruppen haben einen Kaufvertrag über das geplante Projektergebnis abgeschlossen."
    ],
    "correctAnswer": 0,
    "explanation": "Stakeholder sind Interessierte und Betroffene innerhalb und außerhalb des Projekts. Anteilseigner, Auftragnehmer oder Käufer können dazugehören, bilden aber jeweils nur einen Teil der möglichen Gruppen.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-030",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Eine Nutzwertanalyse gewichtet Qualität mit 60 %, Service mit 40 %. A erhält 4 bzw. 3 Punkte, B erhält 3 bzw. 5. Mehr Punkte sind besser. Welche Gesamtwerte stimmen?",
    "answers": [
      "B erreicht 3,8 Punkte, A erreicht 3,6 Punkte.",
      "B erreicht 8 Punkte, A erreicht 7 Punkte.",
      "A erreicht 4 Punkte, B erreicht 3 Punkte.",
      "B erreicht 4,2 Punkte, A erreicht 3,4 Punkte."
    ],
    "correctAnswer": 0,
    "explanation": "A: 4 × 0,60 + 3 × 0,40 = 3,6. B: 3 × 0,60 + 5 × 0,40 = 3,8. B liegt bei den angegebenen Gewichten vorn.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-031",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Bei gleichen Einzelbewertungen gewinnt A mit höherem Preisgewicht, B mit höherem Servicegewicht. Beide Nutzwertrechnungen sind korrekt. Was folgt daraus?",
    "answers": [
      "Die Empfehlung hängt von den Prioritäten ab; die Gewichtung muss zum Beschaffungsziel begründet werden.",
      "Mindestens eine Rechnung muss fehlerhaft sein, weil gleiche Einzelpunkte dieselbe Rangfolge verlangen.",
      "Die Angebote sind unabhängig von den Prioritäten gleichwertig, weil beide einmal auf Platz eins stehen.",
      "Die stärkere Servicegewichtung liefert allein wegen des qualitativen Kriteriums das objektiv richtige Ergebnis."
    ],
    "correctAnswer": 0,
    "explanation": "Gewichte drücken Prioritäten aus. Eine geänderte Rangfolge bei anderen Gewichten zeigt die Abhängigkeit der Empfehlung von diesen Prioritäten und sollte transparent gemacht werden.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-033",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "A kostet netto 1.000 € plus 400 € jährlich, B 1.600 € plus 150 € jährlich. Beide werden vier Jahre gleichwertig genutzt. Weitere Kosten, Zinsen und Restwerte entfallen. Was ist günstiger?",
    "answers": [
      "B ist über vier Jahre um 400 € günstiger.",
      "A ist über vier Jahre um 600 € günstiger.",
      "B ist über vier Jahre um 250 € günstiger.",
      "Beide kosten über vier Jahre jeweils 2.600 €."
    ],
    "correctAnswer": 0,
    "explanation": "A kostet 1.000 € + 4 × 400 € = 2.600 €. B kostet 1.600 € + 4 × 150 € = 2.200 € und damit 400 € weniger.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-034",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Bei unverändert 1.000 € Monatsmiete werden statt 100 nun 200 Geräte bearbeitet. Wie ändern sich die gesamte Miete und ihr Anteil je Gerät?",
    "answers": [
      "Die Monatsmiete bleibt gleich; der Anteil je Gerät sinkt von 10 € auf 5 €.",
      "Die Monatsmiete verdoppelt sich; der Anteil je Gerät bleibt bei 10 €.",
      "Die Monatsmiete bleibt gleich; der Anteil je Gerät bleibt bei 10 €.",
      "Die Monatsmiete halbiert sich; der Anteil je Gerät sinkt auf 2,50 €."
    ],
    "correctAnswer": 0,
    "explanation": "Die Miete bleibt im angegebenen Bereich als Fixkostenblock bei 1.000 €. Dieser Betrag verteilt sich auf mehr Geräte: 1.000 € / 200 = 5 € je Gerät.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-036",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Wozu dient ein positiver Deckungsbeitrag?",
    "answers": [
      "Er steht zur Deckung von Fixkosten und danach für einen Gewinn zur Verfügung.",
      "Er bezeichnet den Gewinn nach Abzug sämtlicher variabler und fixer Kosten.",
      "Er entspricht dem gesamten Erlös vor Abzug der variablen Kosten.",
      "Er entspricht dem Betrag der variablen Kosten der verkauften Menge."
    ],
    "correctAnswer": 0,
    "explanation": "Nach Abzug der variablen Kosten vom Erlös verbleibt der Deckungsbeitrag. Erst nach Abzug der Fixkosten vom gesamten Deckungsbeitrag ergibt sich das Betriebsergebnis.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-038",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Schuldner zahlt eine fällige, berechtigte Forderung schuldhaft nicht. Eine Mahnung ist erforderlich und geht ihm zu. Was gilt nach dem Bürgerlichen Gesetzbuch?",
    "answers": [
      "Diese erste Mahnung kann den Zahlungsverzug auslösen.",
      "Zahlungsverzug setzt hier erst nach der dritten Mahnung ein.",
      "Nach dieser Mahnung muss grundsätzlich noch ein Monat vergehen.",
      "Zahlungsverzug setzt hier erst nach einem gerichtlichen Mahnbescheid ein."
    ],
    "correctAnswer": 0,
    "explanation": "Bei Vorliegen der Voraussetzungen genügt grundsätzlich eine zugegangene Mahnung nach Fälligkeit. Drei Mahnungen oder ein gerichtliches Verfahren sind dafür nicht erforderlich.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-040",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Wie hängen Nettopreis, Umsatzsteuerbetrag und Bruttopreis zusammen?",
    "answers": [
      "Bruttopreis = Nettopreis + Umsatzsteuerbetrag.",
      "Nettopreis = Bruttopreis + Umsatzsteuerbetrag.",
      "Umsatzsteuerbetrag = Nettopreis + Bruttopreis.",
      "Bruttopreis = Nettopreis − Umsatzsteuerbetrag."
    ],
    "correctAnswer": 0,
    "explanation": "Der Bruttopreis enthält den Nettopreis und den darauf entfallenden Umsatzsteuerbetrag. Der Nettopreis enthält diesen Steuerbetrag noch nicht.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-045",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Kunde schreibt: „Bitte nennen Sie unverbindlich Preis und Lieferzeit für diesen Server. Dies ist keine Bestellung.“ Was ist diese Nachricht?",
    "answers": [
      "Als Anfrage zur Vorbereitung eines möglichen Kaufs.",
      "Als verbindliches Angebot zum Kauf des Servers.",
      "Als Annahme eines bereits erhaltenen Verkäuferangebots.",
      "Als Ablehnung eines Angebots verbunden mit einem neuen Kaufangebot."
    ],
    "correctAnswer": 0,
    "explanation": "Der Kunde möchte zunächst Informationen und erklärt ausdrücklich noch keinen verbindlichen Kaufwillen. Die Nachricht ist daher eine Anfrage.",
    "source": "wiso.csv"
  }
];
