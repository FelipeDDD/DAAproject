// Generated from quiz-data/*.csv by scripts/sync-quiz-data.mjs. Do not edit.
export default [
  {
    "id": "betriebssysteme-001",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Hauptaufgabe übernimmt ein Betriebssystem zwischen Hardware und Anwendungssoftware?",
    "answers": [
      "Es verwaltet Ressourcen und stellt Anwendungen standardisierte Dienste zur Verfügung",
      "Es ersetzt die Firmware des Mainboards vollständig",
      "Es speichert ausschließlich Benutzerdaten",
      "Es erhöht automatisch die Taktfrequenz der CPU"
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
      "Das gesamte Betriebssystem muss abgestürzt sein",
      "Wahrscheinlich ist nur der betreffende Prozess blockiert oder fehlerhaft",
      "Der Arbeitsspeicher wurde vollständig gelöscht",
      "Die Festplatte wurde automatisch formatiert"
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
    "question": "Wozu dient virtueller Arbeitsspeicher hauptsächlich?",
    "answers": [
      "Er ersetzt dauerhaft den physischen RAM durch die CPU",
      "Er ermöglicht dem Betriebssystem, Speicherbereiche bei Bedarf auf einen Massenspeicher auszulagern",
      "Er erhöht automatisch die Anzahl der CPU-Kerne",
      "Er speichert ausschließlich BIOS-Einstellungen"
    ],
    "correctAnswer": 1,
    "explanation": "Virtueller Arbeitsspeicher erweitert den nutzbaren Adressraum und ermöglicht das Auslagern von Speicherseiten auf einen Massenspeicher, wenn physischer RAM knapp wird.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-004",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum ist ständiges starkes Auslagern auf eine SSD oder HDD meist ein Hinweis auf ein Leistungsproblem?",
    "answers": [
      "Massenspeicher ist deutlich langsamer als Arbeitsspeicher",
      "Die CPU kann während des Auslagerns keine Befehle ausführen",
      "Virtueller Speicher funktioniert nur mit HDDs",
      "Beim Auslagern werden Dateien dauerhaft gelöscht"
    ],
    "correctAnswer": 0,
    "explanation": "Wenn häufig Speicherseiten zwischen RAM und Massenspeicher übertragen werden, entstehen deutlich höhere Zugriffszeiten als bei direktem Zugriff auf den Arbeitsspeicher.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-005",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat ein Gerätetreiber?",
    "answers": [
      "Er ermöglicht dem Betriebssystem die Kommunikation mit bestimmter Hardware",
      "Er verwaltet ausschließlich Benutzerkennwörter",
      "Er ersetzt das Dateisystem",
      "Er erstellt automatisch Sicherungskopien aller Dateien"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Gerätetreiber stellt die notwendige Schnittstelle zwischen Betriebssystem und einer bestimmten Hardwarekomponente bereit.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-006",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Benutzer besitzt Leserechte auf eine Datei, aber keine Schreibrechte. Welche Aktion sollte ihm normalerweise möglich sein?",
    "answers": [
      "Die Datei lesen, aber nicht verändern",
      "Die Datei verändern, aber nicht öffnen",
      "Die Zugriffsrechte anderer Benutzer ändern",
      "Die Datei unabhängig von weiteren Rechten löschen"
    ],
    "correctAnswer": 0,
    "explanation": "Leserechte erlauben den Zugriff auf den Inhalt. Änderungen am Inhalt erfordern normalerweise zusätzliche Schreibrechte.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-007",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aussage beschreibt den Unterschied zwischen einem Prozess und einem Thread am besten?",
    "answers": [
      "Ein Prozess besitzt einen eigenen Ausführungskontext, während mehrere Threads innerhalb eines Prozesses Ressourcen gemeinsam nutzen können",
      "Ein Thread ist immer ein vollständig separates Betriebssystem",
      "Ein Prozess kann grundsätzlich nur einen einzigen Thread besitzen",
      "Threads werden ausschließlich auf Massenspeichern ausgeführt"
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
      "Sie können Sicherheitslücken schließen und Fehler beheben",
      "Sie erhöhen grundsätzlich die physische Speicherkapazität",
      "Sie ersetzen automatisch jede installierte Hardware",
      "Sie verhindern vollständig alle zukünftigen Sicherheitsangriffe"
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
      "Es organisiert Dateien und Verzeichnisse auf einem Datenträger",
      "Es bestimmt ausschließlich die Geschwindigkeit der CPU",
      "Es ersetzt den Arbeitsspeicher",
      "Es konfiguriert automatisch das Netzwerkprotokoll"
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
    "question": "Warum kann ein 64-Bit-Betriebssystem gegenüber einem 32-Bit-System Vorteile bei großen Arbeitsspeichermengen haben?",
    "answers": [
      "Es kann einen wesentlich größeren Adressraum unterstützen",
      "Es benötigt grundsätzlich keine Gerätetreiber",
      "Es verwendet immer doppelt so viele CPU-Kerne",
      "Es verdoppelt automatisch die Geschwindigkeit jeder Anwendung"
    ],
    "correctAnswer": 0,
    "explanation": "Ein 64-Bit-System kann einen wesentlich größeren Speicheradressraum verwenden als ein 32-Bit-System und dadurch große RAM-Mengen besser unterstützen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-011",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Prozess fordert Speicher an, greift aber zunächst nicht auf alle angeforderten Seiten zu. Warum kann der tatsächlich belegte physische RAM zunächst kleiner sein als der reservierte virtuelle Adressraum?",
    "answers": [
      "Speicherseiten können erst bei tatsächlichem Zugriff physisch zugeordnet werden",
      "Virtueller Speicher benötigt grundsätzlich keinen physischen Speicher",
      "Die CPU speichert alle Seiten dauerhaft im Cache",
      "Reservierter Speicher wird automatisch auf andere Rechner verteilt"
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
      "Virtuelle Adressräume und Speicherschutz isolieren Prozesse voneinander",
      "Jeder Prozess läuft grundsätzlich auf einer eigenen CPU",
      "Der Arbeitsspeicher wird physisch in exakt gleich große Prozessbereiche geteilt",
      "Prozesse dürfen nur auf SSDs zugreifen"
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
      "Änderungen an Dateisystemstrukturen werden protokolliert und können dadurch leichter konsistent wiederhergestellt werden",
      "Alle Dateien werden automatisch vollständig gespiegelt",
      "Journaling ersetzt jede Form von Backup",
      "Die Festplatte benötigt dadurch keinen Cache mehr"
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
    "question": "Ein Prozess besitzt mehrere Threads. Einer dieser Threads blockiert auf eine langsame Ein-/Ausgabeoperation. Welche Aussage ist bei einem modernen Betriebssystem grundsätzlich richtig?",
    "answers": [
      "Andere Threads desselben Prozesses können weiterhin ausgeführt werden, sofern sie nicht von derselben Ressource abhängig sind",
      "Der gesamte Rechner muss warten, bis die Operation beendet ist",
      "Alle Threads werden automatisch beendet",
      "Der blockierte Thread wird automatisch in einen separaten Prozess umgewandelt"
    ],
    "correctAnswer": 0,
    "explanation": "Threads werden vom Scheduler einzeln verwaltet. Blockiert ein Thread auf I/O, können andere ausführbare Threads weiterhin Rechenzeit erhalten.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-016",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Hauptaufgabe hat ein Betriebssystem?",
    "answers": [
      "Hardware verwalten und Dienste/Schnittstellen für Anwendungen bereitstellen.",
      "Nur Webseiten darstellen.",
      "Ausschließlich Netzwerkpakete routen.",
      "Nur Dateien komprimieren."
    ],
    "correctAnswer": 0,
    "explanation": "Das Betriebssystem vermittelt zwischen Hardware, Benutzern und Anwendungen und verwaltet Ressourcen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-017",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Prozess?",
    "answers": [
      "Eine laufende Instanz eines Programms.",
      "Eine Partition auf einer Festplatte.",
      "Ein Eintrag in der MAC-Adresstabelle.",
      "Eine BIOS-Einstellung."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Programm auf Datenträger ist nicht dasselbe wie ein laufender Prozess im Arbeitsspeicher.",
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
      "Ein Benutzerkonto mit Administratorrechten.",
      "Eine physische CPU.",
      "Ein Dateisystem-Ordner."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Prozess kann einen oder mehrere Threads besitzen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-019",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Dateisystem?",
    "answers": [
      "Eine Struktur zur Organisation und Verwaltung von Dateien und Metadaten auf Datenträgern.",
      "Eine Methode zur IP-Adressvergabe.",
      "Ein CPU-Befehlssatz.",
      "Ein E-Mail-Protokoll."
    ],
    "correctAnswer": 0,
    "explanation": "Dateisysteme wie NTFS oder ext4 organisieren Dateien, Verzeichnisse und Metadaten.",
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
      "ReFS ausschließlich",
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
      "Sie steuern, welche Benutzer oder Gruppen welche Operationen auf Dateien und Ordnern ausführen dürfen.",
      "Sie legen nur die physische Position auf der SSD fest.",
      "Sie bestimmen die CPU-Taktfrequenz.",
      "Sie sind identisch mit IP-Subnetzmasken."
    ],
    "correctAnswer": 0,
    "explanation": "Berechtigungen regeln Zugriffsrechte auf Ressourcen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-023",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "hard",
    "question": "Warum ist das Prinzip der geringsten Rechte sinnvoll?",
    "answers": [
      "Benutzer und Dienste erhalten nur die Rechte, die sie für ihre Aufgabe benötigen.",
      "Alle Benutzer erhalten Administratorrechte, damit weniger Supportfälle entstehen.",
      "Rechte werden zufällig verteilt, um Angriffe zu erschweren.",
      "Nur Gastkonten dürfen auf Dateien zugreifen."
    ],
    "correctAnswer": 0,
    "explanation": "Least Privilege reduziert mögliche Schäden durch Fehler oder kompromittierte Konten.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-024",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist der Unterschied zwischen lokaler Benutzeranmeldung und Domänenanmeldung?",
    "answers": [
      "Lokale Konten werden auf dem einzelnen Rechner verwaltet, Domänenkonten zentral über eine Domäneninfrastruktur.",
      "Domänenkonten funktionieren nur ohne Netzwerk.",
      "Lokale Konten benötigen zwingend einen Domain Controller.",
      "Es gibt keinen Unterschied."
    ],
    "correctAnswer": 0,
    "explanation": "Domänenkonten ermöglichen zentrale Verwaltung über Dienste wie Active Directory.",
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
      "ifconfig ausschließlich",
      "format",
      "taskkill"
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
    "question": "Was bewirkt ipconfig /release bei DHCP?",
    "answers": [
      "Der Client gibt seine aktuelle DHCP-Lease für die Schnittstelle frei.",
      "Der Client löscht alle Dateien im DNS-Cache.",
      "Der Router setzt seine Routingtabelle zurück.",
      "Die Netzwerkkarte erhält eine neue MAC-Adresse."
    ],
    "correctAnswer": 0,
    "explanation": "Mit /release wird eine aktuelle DHCP-Konfiguration freigegeben.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-027",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bewirkt ipconfig /renew?",
    "answers": [
      "Der Client fordert eine DHCP-Konfiguration bzw. Lease an oder erneuert sie.",
      "Der PC startet neu.",
      "Der DNS-Server wird deinstalliert.",
      "Alle TCP-Verbindungen werden permanent blockiert."
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
      "Den lokalen DNS-Resolver-Cache leeren.",
      "Die ARP-Tabelle des Switches löschen.",
      "Alle DHCP-Leases im Netzwerk löschen.",
      "Die UEFI-Konfiguration zurücksetzen."
    ],
    "correctAnswer": 0,
    "explanation": "Der lokale DNS-Cache wird geleert, sodass Namen neu aufgelöst werden müssen.",
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
      "dir",
      "copy",
      "shutdown"
    ],
    "correctAnswer": 0,
    "explanation": "ping sendet ICMP Echo Requests.",
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
      "netstat -r ausschließlich",
      "chkdsk"
    ],
    "correctAnswer": 0,
    "explanation": "tracert verwendet u. a. TTL-Werte, um Zwischenstationen sichtbar zu machen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-032",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Wozu dient nslookup?",
    "answers": [
      "DNS-Abfragen und Namensauflösung untersuchen.",
      "Dateisystemfehler reparieren.",
      "Windows-Dienste starten.",
      "RAM testen."
    ],
    "correctAnswer": 0,
    "explanation": "nslookup ist ein Werkzeug für DNS-Abfragen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-033",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Windows-Dienst?",
    "answers": [
      "Ein Hintergrundprozess bzw. eine Systemkomponente, die meist ohne direkte Benutzeroberfläche arbeitet.",
      "Ein physischer USB-Port.",
      "Eine Partition mit Bootloader.",
      "Ein Eintrag in der DNS-Zone."
    ],
    "correctAnswer": 0,
    "explanation": "Dienste stellen Hintergrundfunktionen wie Netzwerk- oder Systemservices bereit.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-034",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "hard",
    "question": "Warum kann das Neustarten eines Dienstes ein Problem beheben, ohne den gesamten PC neu zu starten?",
    "answers": [
      "Nur die betroffene Hintergrundkomponente wird neu initialisiert.",
      "Der Arbeitsspeicher wird physisch ausgetauscht.",
      "Das BIOS wird neu geflasht.",
      "Die CPU erhält automatisch mehr Kerne."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Dienst kann isoliert beendet und neu gestartet werden, wodurch sein Zustand zurückgesetzt wird.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-035",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist der Unterschied zwischen Herunterfahren und hartem Ausschalten einer VM?",
    "answers": [
      "Herunterfahren lässt das Gastbetriebssystem sauber Dienste und Dateisysteme beenden; hartes Ausschalten entspricht eher Stromverlust.",
      "Es gibt keinen technischen Unterschied.",
      "Hartes Ausschalten erstellt automatisch ein Backup.",
      "Herunterfahren löscht immer die virtuelle Festplatte."
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
      "Ein softwarebasiertes Computersystem mit virtueller Hardware, auf dem ein Gastbetriebssystem läuft.",
      "Eine komprimierte Datei ohne eigenes Betriebssystem.",
      "Ein physischer Switch im Rechenzentrum.",
      "Ein DNS-Eintrag für Server."
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
      "Software bzw. Firmware, die virtuelle Maschinen und deren Ressourcen verwaltet.",
      "Ein Dateisystemtreiber.",
      "Ein E-Mail-Protokoll.",
      "Ein Tool zur Passwortgenerierung."
    ],
    "correctAnswer": 0,
    "explanation": "Hypervisoren wie Hyper-V koordinieren virtuelle CPUs, RAM, Datenträger und Netzwerkgeräte.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-038",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "hard",
    "question": "Was ist der grundlegende Unterschied zwischen Typ-1- und Typ-2-Hypervisor?",
    "answers": [
      "Typ 1 läuft direkt auf der Hardware bzw. als Bare-Metal-Plattform, Typ 2 auf einem Host-Betriebssystem.",
      "Typ 1 kann nur Linux, Typ 2 nur Windows virtualisieren.",
      "Typ 1 unterstützt kein Netzwerk, Typ 2 schon.",
      "Typ 2 verwendet keine virtuelle Hardware."
    ],
    "correctAnswer": 0,
    "explanation": "Die Einordnung bezieht sich auf die Schicht, auf der der Hypervisor betrieben wird.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-039",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Snapshot/Checkpoint einer VM?",
    "answers": [
      "Ein gespeicherter Zustandspunkt, zu dem die VM später zurückgesetzt werden kann.",
      "Ein vollständiges externes Backup mit Langzeitaufbewahrung.",
      "Ein TCP-Port für Hyper-V.",
      "Eine feste MAC-Adresse."
    ],
    "correctAnswer": 0,
    "explanation": "Checkpoints sind nützlich für Tests, ersetzen aber keine unabhängige Backupstrategie.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-040",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "hard",
    "question": "Warum können viele lange Checkpoint-Ketten problematisch sein?",
    "answers": [
      "Sie erhöhen Komplexität, Speicherbedarf und können Performance sowie Wiederherstellung erschweren.",
      "Sie deaktivieren grundsätzlich das Gastbetriebssystem.",
      "Sie verdoppeln immer die CPU-Leistung.",
      "Sie ersetzen automatisch alle VHDX-Dateien durch ISO-Dateien."
    ],
    "correctAnswer": 0,
    "explanation": "Differencing Disks und lange Ketten können Verwaltung und I/O aufwendiger machen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-041",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Bootloader?",
    "answers": [
      "Ein Programm, das den Start des Betriebssystems einleitet.",
      "Ein DHCP-Dienst.",
      "Ein RAM-Test ausschließlich im Browser.",
      "Ein Protokoll zur Dateiübertragung."
    ],
    "correctAnswer": 0,
    "explanation": "UEFI/BIOS lädt typischerweise einen Bootloader, der anschließend das Betriebssystem startet.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-042",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "hard",
    "question": "Welche Reihenfolge ist vereinfacht plausibel?",
    "answers": [
      "UEFI/BIOS → Bootloader → Betriebssystemkernel → Dienste/Benutzerumgebung",
      "DNS → Switch → UEFI → RAM",
      "Betriebssystemkernel → UEFI → Bootloader → CPU",
      "TCP → Bootloader → DHCP → Dateisystem"
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
      "Der zentrale Teil eines Betriebssystems, der u. a. Hardware und Prozesse verwaltet.",
      "Ein Benutzerkonto.",
      "Ein Backup-Format.",
      "Eine VLAN-Konfiguration."
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
      "Speicherplatz auf Massenspeicher, der als Ergänzung zum RAM genutzt werden kann.",
      "Ein zweiter CPU-Cache ausschließlich im BIOS.",
      "Eine Kopie der MAC-Adresstabelle.",
      "Ein DNS-Server."
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
    "question": "Warum kann starke Auslagerung ein System spürbar verlangsamen?",
    "answers": [
      "Massenspeicher ist im Vergleich zu RAM deutlich langsamer und erzeugt zusätzliche I/O.",
      "Die CPU deaktiviert dann automatisch alle Kerne.",
      "Auslagerung reduziert die Netzwerkkarte auf 10 Mbit/s.",
      "Swap blockiert grundsätzlich die GPU."
    ],
    "correctAnswer": 0,
    "explanation": "Wenn häufig Seiten zwischen RAM und Datenträger verschoben werden, entsteht hoher I/O-Aufwand.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-046",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist der Unterschied zwischen Administrator- und Standardbenutzerkonto?",
    "answers": [
      "Administratorkonten können weitreichende Systemänderungen durchführen, Standardkonten sind stärker eingeschränkt.",
      "Standardbenutzer können keine Programme starten.",
      "Administratoren dürfen keine Netzwerkverbindungen aufbauen.",
      "Es gibt unter modernen Betriebssystemen keinen Unterschied."
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
      "Administrative Änderungen kontrollieren und eine bewusste Rechteerhöhung anfordern.",
      "DHCP-Adressen verteilen.",
      "SSD-Blöcke defragmentieren.",
      "IPv6 in IPv4 übersetzen."
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
    "question": "Welche Aussage zu Linux sudo ist korrekt?",
    "answers": [
      "Es erlaubt berechtigten Benutzern, einzelne Befehle mit erhöhten Rechten auszuführen.",
      "Es ist ein Dateisystem.",
      "Es ersetzt den Linux-Kernel.",
      "Es ist ein DNS-Protokoll."
    ],
    "correctAnswer": 0,
    "explanation": "sudo ermöglicht kontrollierte Rechteerhöhung für bestimmte Befehle.",
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
    "question": "Welche Aufgabe hat der Linux-Befehl sudo apt update?",
    "answers": [
      "Paketlisten aus den konfigurierten Paketquellen aktualisieren.",
      "Alle installierten Pakete zwangsläufig auf eine neue Major-Version upgraden.",
      "Die Festplatte formatieren.",
      "Die IP-Adresse automatisch erneuern."
    ],
    "correctAnswer": 0,
    "explanation": "apt update aktualisiert die Informationen über verfügbare Pakete.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-052",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat sudo apt upgrade typischerweise?",
    "answers": [
      "Installierte Pakete auf verfügbare neuere Versionen aktualisieren.",
      "Die Paketquellen löschen.",
      "Das Dateisystem von ext4 auf NTFS umstellen.",
      "Den Rechner in eine Windows-Domäne aufnehmen."
    ],
    "correctAnswer": 0,
    "explanation": "apt upgrade aktualisiert installierte Pakete unter Beachtung der Paketverwaltung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-053",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "hard",
    "question": "Warum sollte man vor tiefgreifenden Systemänderungen einen Wiederherstellungsplan besitzen?",
    "answers": [
      "Fehler können das System unbrauchbar machen; ein Rückweg reduziert Ausfallzeit und Datenverlust.",
      "Weil jede Änderung automatisch die CPU beschädigt.",
      "Weil Backups die Netzwerkgeschwindigkeit verdoppeln.",
      "Weil ohne Backup keine Benutzerkonten existieren dürfen."
    ],
    "correctAnswer": 0,
    "explanation": "Änderungsmanagement und Wiederherstellbarkeit sind zentrale Betriebsprinzipien.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-054",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bedeutet 'Patchen' eines Betriebssystems?",
    "answers": [
      "Updates zur Fehlerbehebung, Sicherheit oder Funktion installieren.",
      "Den RAM physisch austauschen.",
      "Eine neue MAC-Adresse anlöten.",
      "Nur die Bildschirmauflösung ändern."
    ],
    "correctAnswer": 0,
    "explanation": "Patches schließen Fehler und Sicherheitslücken oder verbessern Funktionen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-055",
    "category": "Betriebssysteme",
    "topic": null,
    "difficulty": "hard",
    "question": "Warum sollten Systeme nicht dauerhaft mit nicht benötigten Diensten betrieben werden?",
    "answers": [
      "Jeder zusätzliche Dienst kann Ressourcen verbrauchen und die Angriffsfläche vergrößern.",
      "Nicht benötigte Dienste erhöhen automatisch die CPU-Kernzahl.",
      "Dienste beeinflussen nur die Bildschirmfarbe.",
      "Ein deaktivierter Dienst verhindert grundsätzlich Updates."
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
    "question": "Was ist ein typischer Vorteil regelmäßiger Betriebssystem-Updates?",
    "answers": [
      "Sie schließen Sicherheitslücken und beheben Fehler",
      "Sie erhöhen automatisch den physischen RAM",
      "Sie ersetzen Gerätetreiber immer vollständig",
      "Sie formatieren die Systempartition"
    ],
    "correctAnswer": 0,
    "explanation": "Regelmäßige Updates verbessern Sicherheit, Stabilität und beheben bekannte Fehler",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-057",
    "category": "Betriebssysteme",
    "topic": "Virtualisierung",
    "difficulty": "hard",
    "question": "Was ist ein typischer Unterschied zwischen Host und Gast in einer Virtualisierungsumgebung?",
    "answers": [
      "Der Host stellt die physische Hardware und Ressourcen bereit, der Gast läuft als virtuelles System",
      "Der Gast besitzt immer mehr RAM als der Host",
      "Der Host ist immer Linux und der Gast immer Windows",
      "Der Gast verwaltet die physische CPU direkt ohne Hypervisor"
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
      "Dateien und Ordner verwalten",
      "Treiber kompilieren",
      "RAM reservieren",
      "BIOS aktualisieren"
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
      "Editor",
      "Paint",
      "Datenträgerbereinigung"
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
      "Hardware und Treiber verwalten",
      "Benutzerpasswörter speichern",
      "Dateien komprimieren",
      "Webseiten öffnen"
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
      "Rechner",
      "Zwischenablage",
      "Editor"
    ],
    "correctAnswer": 0,
    "explanation": "Die Ereignisanzeige protokolliert System-, Anwendungs- und Sicherheitsereignisse.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-062",
    "category": "Betriebssysteme",
    "topic": "Windows",
    "difficulty": "medium",
    "question": "Was ist ein Windows-Dienst?",
    "answers": [
      "Ein Hintergrundprozess, der Systemfunktionen bereitstellt",
      "Ein Benutzerkonto",
      "Ein Dateiformat",
      "Eine Partition"
    ],
    "correctAnswer": 0,
    "explanation": "Windows-Dienste laufen häufig im Hintergrund und stellen bestimmte Funktionen bereit.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-063",
    "category": "Betriebssysteme",
    "topic": "Linux",
    "difficulty": "medium",
    "question": "Welcher Befehl zeigt unter Linux den Inhalt eines Verzeichnisses an?",
    "answers": [
      "ls",
      "cd",
      "pwd",
      "rm"
    ],
    "correctAnswer": 0,
    "explanation": "ls listet Dateien und Verzeichnisse auf.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-064",
    "category": "Betriebssysteme",
    "topic": "Linux",
    "difficulty": "medium",
    "question": "Welcher Linux-Befehl zeigt das aktuelle Arbeitsverzeichnis?",
    "answers": [
      "pwd",
      "ls",
      "mkdir",
      "cat"
    ],
    "correctAnswer": 0,
    "explanation": "pwd zeigt den Pfad des aktuellen Verzeichnisses.",
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
      "Er erstellt ein Verzeichnis",
      "Er löscht ein Verzeichnis",
      "Er zeigt Prozesse",
      "Er ändert Dateirechte"
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
    "question": "Welcher Befehl zeigt den Inhalt einer Textdatei direkt im Terminal an?",
    "answers": [
      "cat",
      "mkdir",
      "ps",
      "chmod"
    ],
    "correctAnswer": 0,
    "explanation": "cat kann den Inhalt einer Textdatei im Terminal ausgeben.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-068",
    "category": "Betriebssysteme",
    "topic": "Linux",
    "difficulty": "medium",
    "question": "Wozu dient sudo unter Linux?",
    "answers": [
      "Einen Befehl mit erhöhten Rechten auszuführen",
      "Ein Verzeichnis zu löschen",
      "Den Rechner herunterzufahren",
      "Dateien zu komprimieren"
    ],
    "correctAnswer": 0,
    "explanation": "sudo erlaubt berechtigten Benutzern die Ausführung von Befehlen mit erhöhten Rechten.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-069",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Welches Dateisystem wird häufig auf modernen Windows-Systempartitionen verwendet?",
    "answers": [
      "NTFS",
      "ext4",
      "HFS+",
      "ISO 9660"
    ],
    "correctAnswer": 0,
    "explanation": "NTFS ist das übliche Dateisystem für moderne Windows-Systemlaufwerke.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-070",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Welches Dateisystem ist unter Linux weit verbreitet?",
    "answers": [
      "ext4",
      "NTFS",
      "APFS",
      "FAT12"
    ],
    "correctAnswer": 0,
    "explanation": "ext4 ist ein häufig verwendetes Linux-Dateisystem.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-071",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Welcher Nachteil von FAT32 ist im Alltag besonders relevant?",
    "answers": [
      "Einzelne Dateien dürfen maximal etwa 4 GB groß sein",
      "Es funktioniert nur mit Linux",
      "Es unterstützt keine USB-Sticks",
      "Es kann keine Ordner speichern"
    ],
    "correctAnswer": 0,
    "explanation": "FAT32 hat eine Dateigrößenbegrenzung von ungefähr 4 GB.",
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
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Was ist eine Partition?",
    "answers": [
      "Ein logisch abgegrenzter Bereich eines Datenträgers",
      "Ein Benutzerkonto",
      "Ein Prozess",
      "Ein Netzwerkprotokoll"
    ],
    "correctAnswer": 0,
    "explanation": "Partitionen teilen einen Datenträger in logisch getrennte Bereiche.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-074",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Was bedeutet es, ein Dateisystem zu formatieren?",
    "answers": [
      "Eine Speicherstruktur für Dateien und Verzeichnisse einzurichten",
      "RAM zu erweitern",
      "Die CPU zu übertakten",
      "Ein Benutzerkonto zu löschen"
    ],
    "correctAnswer": 0,
    "explanation": "Beim Formatieren wird auf einer Partition ein Dateisystem eingerichtet.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-075",
    "category": "Betriebssysteme",
    "topic": "Prozesse",
    "difficulty": "medium",
    "question": "Was ist ein Prozess?",
    "answers": [
      "Eine laufende Instanz eines Programms",
      "Ein Dateisystem",
      "Ein Benutzerkonto",
      "Ein Treiber"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Prozess ist ein aktuell ausgeführtes Programm mit eigenen Ressourcen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-076",
    "category": "Betriebssysteme",
    "topic": "Prozesse",
    "difficulty": "medium",
    "question": "Was ist ein Thread?",
    "answers": [
      "Ein Ausführungsstrang innerhalb eines Prozesses",
      "Eine Partition",
      "Ein Gerätetreiber",
      "Ein Dateityp"
    ],
    "correctAnswer": 0,
    "explanation": "Threads sind Ausführungsstränge innerhalb eines Prozesses.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-077",
    "category": "Betriebssysteme",
    "topic": "Prozesse",
    "difficulty": "hard",
    "question": "Warum kann ein Programm mehrere Threads verwenden?",
    "answers": [
      "Um mehrere Aufgaben innerhalb eines Prozesses parallel oder nebenläufig zu bearbeiten",
      "Um mehrere Betriebssysteme gleichzeitig zu installieren",
      "Um automatisch mehr RAM einzubauen",
      "Um Dateisysteme zu wechseln"
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
      "Die von ihm belegten Ressourcen werden freigegeben",
      "Das Betriebssystem wird gelöscht",
      "Die CPU wird ausgeschaltet",
      "Alle Benutzer werden abgemeldet"
    ],
    "correctAnswer": 0,
    "explanation": "Beim Beenden eines Prozesses gibt das Betriebssystem dessen Ressourcen wieder frei.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-079",
    "category": "Betriebssysteme",
    "topic": "Arbeitsspeicher",
    "difficulty": "medium",
    "question": "Welche Aufgabe hat der RAM?",
    "answers": [
      "Aktuell benötigte Daten und Programme kurzfristig bereitzuhalten",
      "Daten dauerhaft ohne Strom zu speichern",
      "Das Betriebssystem zu starten",
      "Netzwerkpakete zu routen"
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
    "question": "Was bedeutet virtueller Speicher?",
    "answers": [
      "Datenträgerspeicher wird ergänzend zum RAM verwendet",
      "Mehrere CPUs werden kombiniert",
      "Ein virtuelles Netzwerk wird erstellt",
      "Dateien werden verschlüsselt"
    ],
    "correctAnswer": 0,
    "explanation": "Virtueller Speicher nutzt Datenträgerplatz, wenn zusätzlicher Arbeitsspeicher benötigt wird.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-081",
    "category": "Betriebssysteme",
    "topic": "Arbeitsspeicher",
    "difficulty": "medium",
    "question": "Was ist unter Linux Swap?",
    "answers": [
      "Speicher auf einem Datenträger zur Ergänzung des RAM",
      "Ein Dateisystemtreiber",
      "Ein Paketmanager",
      "Ein Bootloader"
    ],
    "correctAnswer": 0,
    "explanation": "Swap dient als Auslagerungsspeicher.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-082",
    "category": "Betriebssysteme",
    "topic": "Arbeitsspeicher",
    "difficulty": "hard",
    "question": "Warum ist Auslagerung auf SSD oder HDD deutlich langsamer als direkter RAM-Zugriff?",
    "answers": [
      "Massenspeicher hat wesentlich höhere Zugriffszeiten als RAM",
      "Swap verwendet keine Dateien",
      "RAM ist immer verschlüsselt",
      "Die CPU darf nicht auf SSDs zugreifen"
    ],
    "correctAnswer": 0,
    "explanation": "RAM besitzt wesentlich geringere Zugriffszeiten und höhere Bandbreite als Massenspeicher.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-083",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Warum gibt es unterschiedliche Benutzerrechte in einem Betriebssystem?",
    "answers": [
      "Um Zugriffe auf Dateien und Systemfunktionen zu kontrollieren",
      "Um die CPU schneller zu machen",
      "Um mehr Speicherplatz zu erzeugen",
      "Um Netzwerkkabel zu ersetzen"
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
    "question": "Was bedeutet unter Linux die Berechtigung 'x'?",
    "answers": [
      "execute",
      "export",
      "extract",
      "exit"
    ],
    "correctAnswer": 0,
    "explanation": "x steht für execute, also Ausführen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-088",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "hard",
    "question": "Welche Berechtigung benötigt ein Benutzer bei einer normalen Datei mindestens, um deren Inhalt verändern zu können?",
    "answers": [
      "write",
      "execute",
      "read-only",
      "owner"
    ],
    "correctAnswer": 0,
    "explanation": "Zum Ändern einer Datei wird Schreibberechtigung benötigt.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-089",
    "category": "Betriebssysteme",
    "topic": "Treiber",
    "difficulty": "medium",
    "question": "Welche Aufgabe hat ein Gerätetreiber?",
    "answers": [
      "Er ermöglicht die Kommunikation zwischen Betriebssystem und Hardware",
      "Er ersetzt das Betriebssystem",
      "Er speichert Benutzerpasswörter",
      "Er vergibt IP-Adressen"
    ],
    "correctAnswer": 0,
    "explanation": "Treiber stellen die Verbindung zwischen Hardware und Betriebssystem her.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-090",
    "category": "Betriebssysteme",
    "topic": "Treiber",
    "difficulty": "medium",
    "question": "Was kann passieren, wenn ein notwendiger Gerätetreiber fehlt?",
    "answers": [
      "Das Gerät funktioniert möglicherweise nicht korrekt",
      "Der RAM verdoppelt sich",
      "Das BIOS wird gelöscht",
      "Das Dateisystem ändert sich automatisch"
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
      "UEFI/BIOS",
      "Webbrowser",
      "Task-Manager",
      "Datei-Explorer"
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
    "question": "Welche Aufgabe hat ein Bootloader?",
    "answers": [
      "Ein Betriebssystem bzw. dessen Kernel zu laden",
      "Dateien zu komprimieren",
      "Benutzer zu erstellen",
      "Treiber zu deinstallieren"
    ],
    "correctAnswer": 0,
    "explanation": "Der Bootloader startet den Ladevorgang des Betriebssystems.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-093",
    "category": "Betriebssysteme",
    "topic": "Bootprozess",
    "difficulty": "hard",
    "question": "Warum kann die Bootreihenfolge im UEFI wichtig sein?",
    "answers": [
      "Sie bestimmt, von welchem Gerät zuerst nach einem bootfähigen System gesucht wird",
      "Sie bestimmt die CPU-Taktrate",
      "Sie vergibt Benutzerrechte",
      "Sie ändert das Dateisystem automatisch"
    ],
    "correctAnswer": 0,
    "explanation": "Die Bootreihenfolge legt fest, welche Geräte zuerst als Startmedium geprüft werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-094",
    "category": "Betriebssysteme",
    "topic": "Virtualisierung",
    "difficulty": "medium",
    "question": "Was ist eine virtuelle Maschine?",
    "answers": [
      "Ein softwarebasierter, isolierter Computer",
      "Ein physischer Switch",
      "Ein Dateisystem",
      "Ein Benutzerkonto"
    ],
    "correctAnswer": 0,
    "explanation": "Eine VM bildet einen Computer softwareseitig nach.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-095",
    "category": "Betriebssysteme",
    "topic": "Virtualisierung",
    "difficulty": "medium",
    "question": "Welches Programm verwaltet virtuelle Maschinen und deren virtuelle Hardware?",
    "answers": [
      "Hypervisor",
      "Bootloader",
      "Dateimanager",
      "Paketmanager"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Hypervisor stellt Ressourcen für virtuelle Maschinen bereit und verwaltet sie.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-096",
    "category": "Betriebssysteme",
    "topic": "Virtualisierung",
    "difficulty": "medium",
    "question": "Welcher Vorteil von Virtualisierung ist typisch?",
    "answers": [
      "Mehrere Betriebssysteme können auf einem Host betrieben werden",
      "Jede VM benötigt zwingend einen eigenen physischen PC",
      "RAM wird unbegrenzt",
      "Netzwerke werden überflüssig"
    ],
    "correctAnswer": 0,
    "explanation": "Virtualisierung ermöglicht mehrere getrennte Systeme auf derselben physischen Hardware.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-097",
    "category": "Betriebssysteme",
    "topic": "Virtualisierung",
    "difficulty": "hard",
    "question": "Was passiert, wenn mehreren virtuellen Maschinen zusammen mehr RAM zugewiesen wird, als der Host sinnvoll bereitstellen kann?",
    "answers": [
      "Es kann zu starkem Leistungsabfall oder Auslagerung kommen",
      "Die VMs erzeugen automatisch zusätzlichen physischen RAM",
      "Der Hypervisor deaktiviert das Dateisystem",
      "Die CPU wird verdoppelt"
    ],
    "correctAnswer": 0,
    "explanation": "Überbelegung von Arbeitsspeicher kann zu Auslagerung und deutlichen Performanceproblemen führen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-098",
    "category": "Betriebssysteme",
    "topic": "Systemverwaltung",
    "difficulty": "medium",
    "question": "Wozu dienen Betriebssystem-Updates?",
    "answers": [
      "Unter anderem Sicherheitslücken zu schließen und Fehler zu beheben",
      "Die Netzwerkkarte physisch zu ersetzen",
      "RAM dauerhaft zu vergrößern",
      "Dateisysteme automatisch zu löschen"
    ],
    "correctAnswer": 0,
    "explanation": "Updates liefern häufig Sicherheitskorrekturen, Fehlerbehebungen und Verbesserungen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-099",
    "category": "Betriebssysteme",
    "topic": "Systemverwaltung",
    "difficulty": "medium",
    "question": "Was ist ein Paketmanager unter Linux?",
    "answers": [
      "Ein Werkzeug zum Installieren, Aktualisieren und Entfernen von Softwarepaketen",
      "Ein Dateisystem",
      "Ein Bootloader",
      "Ein Gerätetreiber"
    ],
    "correctAnswer": 0,
    "explanation": "Paketmanager verwalten Software und deren Abhängigkeiten.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-100",
    "category": "Betriebssysteme",
    "topic": "Systemverwaltung",
    "difficulty": "hard",
    "question": "Warum ist die Installation von Software über einen Paketmanager oft vorteilhaft?",
    "answers": [
      "Abhängigkeiten und Updates können zentral verwaltet werden",
      "Programme erhalten automatisch Administratorrechte",
      "Das Betriebssystem benötigt danach keinen Kernel mehr",
      "Es verhindert jede Sicherheitslücke"
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
    "question": "Welche Hauptaufgabe übernimmt ein Betriebssystem?",
    "answers": [
      "Es verwaltet Hardware, Ressourcen und Anwendungen",
      "Es ersetzt dauerhaft alle Gerätetreiber",
      "Es speichert ausschließlich Benutzerdokumente",
      "Es stellt nur die grafische Oberfläche bereit"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Betriebssystem koordiniert Hardware, Prozesse, Speicher, Dateien, Benutzer und Anwendungen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-102",
    "category": "Betriebssysteme",
    "topic": "Windows Grundlagen",
    "difficulty": "medium",
    "question": "Was ist der Windows-Kernel?",
    "answers": [
      "Der zentrale Systemkern für grundlegende Betriebssystemfunktionen",
      "Eine Benutzeranwendung zur Dateiverwaltung",
      "Ein optionales Grafikthema für den Desktop",
      "Ein ausschließliches Werkzeug zur Datensicherung"
    ],
    "correctAnswer": 0,
    "explanation": "Der Kernel steuert zentrale Funktionen wie Prozess-, Speicher- und Hardwarezugriffe.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-103",
    "category": "Betriebssysteme",
    "topic": "Windows Grundlagen",
    "difficulty": "medium",
    "question": "Was bedeutet ein 64-Bit-Betriebssystem?",
    "answers": [
      "Es kann 64-Bit-Prozessorfunktionen und größere Adressräume nutzen",
      "Es kann gleichzeitig höchstens 64 Anwendungen im Benutzerprofil verwalten",
      "Es unterstützt ausschließlich Dateien mit einer Größe unter 64 Megabyte",
      "Es benötigt für den Betrieb zwingend einen Prozessor mit genau 64 Kernen"
    ],
    "correctAnswer": 0,
    "explanation": "64-Bit-Systeme können größere Adressräume und entsprechende CPU-Funktionen nutzen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-104",
    "category": "Betriebssysteme",
    "topic": "Windows Grundlagen",
    "difficulty": "medium",
    "question": "Welcher Vorteil ist mit einem 64-Bit-Windows gegenüber 32 Bit typischerweise verbunden?",
    "answers": [
      "Es kann deutlich mehr Arbeitsspeicher adressieren",
      "Es benötigt grundsätzlich keinen virtuellen Speicher",
      "Es kann nur 64-Bit-Dateisysteme verwenden",
      "Es startet immer doppelt so schnell"
    ],
    "correctAnswer": 0,
    "explanation": "Ein wesentlicher Vorteil ist der deutlich größere adressierbare Speicherbereich.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-105",
    "category": "Betriebssysteme",
    "topic": "Windows Grundlagen",
    "difficulty": "medium",
    "question": "Welche Windows-Edition ist typischerweise für professionelle Unternehmensfunktionen ausgelegt?",
    "answers": [
      "Windows Pro",
      "Windows Home Basic",
      "Windows Media Edition",
      "Windows Starter Plus"
    ],
    "correctAnswer": 0,
    "explanation": "Pro-Editionen enthalten typischerweise zusätzliche Verwaltungs- und Unternehmensfunktionen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-106",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Warum sollten Benutzer im Alltag möglichst ohne Administratorrechte arbeiten?",
    "answers": [
      "Das reduziert das Risiko unerwünschter Systemänderungen",
      "Das erhöht automatisch die CPU-Leistung",
      "Das vergrößert den verfügbaren Arbeitsspeicher",
      "Das beschleunigt grundsätzlich jede Netzwerkverbindung"
    ],
    "correctAnswer": 0,
    "explanation": "Das Prinzip der geringsten Rechte begrenzt Schäden durch Fehlbedienung oder Schadsoftware.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-107",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Was ist die Aufgabe der Benutzerkontensteuerung UAC?",
    "answers": [
      "Sie fordert bei privilegierten Änderungen eine Bestätigung an",
      "Sie verwaltet ausschließlich WLAN-Verbindungen",
      "Sie ersetzt Benutzerkennwörter vollständig",
      "Sie verschlüsselt automatisch alle Dateien"
    ],
    "correctAnswer": 0,
    "explanation": "UAC trennt normale Nutzung von administrativen Aktionen und fordert bei Bedarf Zustimmung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-108",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Was unterscheidet ein Standardkonto von einem Administratorkonto?",
    "answers": [
      "Ein Standardkonto besitzt weniger Rechte für Systemänderungen",
      "Ein Standardkonto kann keine eigenen Dateien speichern",
      "Ein Administratorkonto besitzt keinen Passwortschutz",
      "Ein Administratorkonto darf keine Programme starten"
    ],
    "correctAnswer": 0,
    "explanation": "Standardkonten sind bei systemweiten Änderungen stärker eingeschränkt.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-109",
    "category": "Betriebssysteme",
    "topic": "Benutzer und Rechte",
    "difficulty": "medium",
    "question": "Was ist eine lokale Benutzergruppe in Windows?",
    "answers": [
      "Eine Zusammenfassung von Konten mit gemeinsamen Berechtigungen",
      "Ein Ordner mit ausschließlich lokalen Dateien",
      "Eine Liste aller installierten Programme",
      "Ein Cache für Netzwerkverbindungen"
    ],
    "correctAnswer": 0,
    "explanation": "Gruppen vereinfachen die gemeinsame Zuweisung von Rechten und Berechtigungen.",
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
    "difficulty": "hard",
    "question": "Was beschreibt das Prinzip 'Least Privilege'?",
    "answers": [
      "Benutzer erhalten nur die Rechte, die sie für ihre Aufgaben benötigen",
      "Benutzer erhalten immer vollständige Administratorrechte",
      "Jeder Prozess erhält Zugriff auf sämtliche Systemressourcen",
      "Alle Freigaben werden grundsätzlich ohne Einschränkungen eingerichtet"
    ],
    "correctAnswer": 0,
    "explanation": "Least Privilege reduziert unnötige Rechte und damit potenzielle Angriffsflächen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-112",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Welches Dateisystem wird häufig für Windows-Systemlaufwerke verwendet?",
    "answers": [
      "NTFS",
      "ext4",
      "APFS",
      "HFS+"
    ],
    "correctAnswer": 0,
    "explanation": "NTFS ist das übliche Dateisystem für moderne Windows-Systempartitionen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-113",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Welchen Vorteil bietet NTFS gegenüber FAT32?",
    "answers": [
      "Es unterstützt unter anderem Berechtigungen und große Dateien",
      "Es funktioniert ausschließlich auf USB-Sticks",
      "Es erlaubt keine Ordnerhierarchien",
      "Es unterstützt nur Dateien bis etwa 4 GB"
    ],
    "correctAnswer": 0,
    "explanation": "NTFS bietet Funktionen wie ACL-Berechtigungen, Journaling und Unterstützung großer Dateien.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-114",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Was bedeutet eine NTFS-Berechtigung?",
    "answers": [
      "Sie steuert den Zugriff auf Dateien und Ordner",
      "Sie legt die CPU-Taktfrequenz fest",
      "Sie bestimmt die Bildschirmauflösung",
      "Sie steuert die Lüfterdrehzahl"
    ],
    "correctAnswer": 0,
    "explanation": "NTFS-Berechtigungen regeln, welche Benutzer oder Gruppen auf Objekte zugreifen dürfen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-115",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Was bedeutet 'Lesen' bei einer Dateiberechtigung?",
    "answers": [
      "Der Inhalt darf angezeigt beziehungsweise geöffnet werden",
      "Der Inhalt darf automatisch gelöscht werden",
      "Der Besitzer wird automatisch geändert",
      "Die Datei wird permanent verschlüsselt"
    ],
    "correctAnswer": 0,
    "explanation": "Leserechte ermöglichen den Zugriff auf den Inhalt ohne notwendigerweise Änderungen zu erlauben.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-116",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Was erlaubt die Berechtigung 'Ändern' typischerweise?",
    "answers": [
      "Dateien lesen, verändern und löschen",
      "Nur Dateinamen anzeigen",
      "Nur Dateien ausführen, aber nicht lesen",
      "Ausschließlich den Besitzer ändern"
    ],
    "correctAnswer": 0,
    "explanation": "Ändern umfasst typischerweise Lesen, Schreiben und Löschen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-117",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "hard",
    "question": "Welche Berechtigungen wirken typischerweise stärker: explizites Verweigern oder Erlauben?",
    "answers": [
      "Explizites Verweigern hat in der Regel Vorrang",
      "Explizites Erlauben hat immer Vorrang",
      "Beide werden grundsätzlich ignoriert",
      "Die Reihenfolge hängt nur vom Dateinamen ab"
    ],
    "correctAnswer": 0,
    "explanation": "Explizite Verweigerungen haben bei NTFS-Berechtigungen üblicherweise hohe Priorität.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-118",
    "category": "Betriebssysteme",
    "topic": "Dateisysteme",
    "difficulty": "medium",
    "question": "Wofür dient das NTFS-Journaling?",
    "answers": [
      "Dateisystemänderungen können konsistenter protokolliert und wiederhergestellt werden",
      "Benutzerkennwörter werden vollständig im Dateisystemprotokoll gespeichert",
      "Sicherungen werden automatisch durch eine zweite lokale Kopie ersetzt",
      "Die physische Speicherkapazität eines Laufwerks wird dynamisch erweitert"
    ],
    "correctAnswer": 0,
    "explanation": "Journaling hilft bei der Konsistenz des Dateisystems nach unerwarteten Unterbrechungen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-119",
    "category": "Betriebssysteme",
    "topic": "Datenträgerverwaltung",
    "difficulty": "medium",
    "question": "Wozu dient die Windows-Datenträgerverwaltung?",
    "answers": [
      "Partitionen und Volumes können verwaltet werden",
      "CPU-Kerne können aktiviert werden",
      "Benutzerkennwörter können zurückgesetzt werden",
      "Netzwerkports können gesperrt werden"
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
      "Eine logische Bezeichnung für ein Volume oder Laufwerk",
      "Die Seriennummer eines Prozessors",
      "Die Kennung eines Benutzerkontos",
      "Die Verschlüsselungsstufe einer Datei"
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
    "question": "Was passiert beim Formatieren eines Volumes?",
    "answers": [
      "Ein Dateisystem wird auf dem Volume eingerichtet",
      "Die CPU-Firmware wird aktualisiert",
      "Das Benutzerkonto wird gelöscht",
      "Die Netzwerkadresse wird geändert"
    ],
    "correctAnswer": 0,
    "explanation": "Formatieren richtet die logische Dateisystemstruktur auf einem Volume ein.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-122",
    "category": "Betriebssysteme",
    "topic": "Datenträgerverwaltung",
    "difficulty": "medium",
    "question": "Was ist eine Partition?",
    "answers": [
      "Ein logisch abgegrenzter Bereich eines Datenträgers",
      "Ein laufender Hintergrunddienst",
      "Eine virtuelle Benutzergruppe",
      "Ein installierter Gerätetreiber"
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
    "question": "Warum kann ein neues Laufwerk im Explorer fehlen, obwohl es erkannt wurde?",
    "answers": [
      "Es besitzt möglicherweise noch kein nutzbares Volume oder keinen Laufwerksbuchstaben",
      "Der verwendete Grafiktreiber unterstützt möglicherweise die aktuelle Bildschirmauflösung nicht",
      "Das Benutzerkonto besitzt möglicherweise zu wenige CPU-Ressourcen für den Explorer",
      "Die angeschlossene Tastatur wurde möglicherweise beim Systemstart nicht korrekt erkannt"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Datenträger muss oft initialisiert, partitioniert und mit einem Laufwerksbuchstaben versehen werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-124",
    "category": "Betriebssysteme",
    "topic": "Prozesse",
    "difficulty": "medium",
    "question": "Was ist ein Prozess?",
    "answers": [
      "Eine laufende Instanz eines Programms",
      "Ein dauerhaft gespeicherter Treiber",
      "Ein physischer Teil des Mainboards",
      "Ein Benutzerprofil auf dem Server"
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
    "question": "Welche Information zeigt der Task-Manager?",
    "answers": [
      "Auslastung und laufende Prozesse",
      "Nur die Dateiberechtigungen eines Ordners",
      "Nur die Netzwerkkonfiguration des Routers",
      "Nur die installierten Druckermodelle"
    ],
    "correctAnswer": 0,
    "explanation": "Der Task-Manager zeigt unter anderem Prozesse, Leistung und Autostartprogramme.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-126",
    "category": "Betriebssysteme",
    "topic": "Prozesse",
    "difficulty": "medium",
    "question": "Was bedeutet eine hohe CPU-Auslastung im Task-Manager?",
    "answers": [
      "Die CPU ist stark mit Verarbeitung beschäftigt",
      "Die SSD ist vollständig verschlüsselt",
      "Der Arbeitsspeicher ist zwingend defekt",
      "Das Netzwerk verwendet zu viele IP-Adressen"
    ],
    "correctAnswer": 0,
    "explanation": "Hohe CPU-Auslastung zeigt starke Rechenaktivität an.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-127",
    "category": "Betriebssysteme",
    "topic": "Prozesse",
    "difficulty": "medium",
    "question": "Was zeigt die Speicherauslastung im Task-Manager?",
    "answers": [
      "Wie viel Arbeitsspeicher aktuell verwendet wird",
      "Wie viel Speicherplatz auf der SSD frei ist",
      "Wie viele Benutzer angemeldet sind",
      "Wie viele Programme installiert sind"
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
    "question": "Wann ist das Beenden eines Prozesses sinnvoll?",
    "answers": [
      "Wenn eine Anwendung nicht mehr reagiert und kontrolliert beendet werden muss",
      "Wenn die Festplatte mehr freien Speicher benötigt",
      "Wenn ein Benutzer sein Kennwort ändern möchte",
      "Wenn ein Monitor eine andere Auflösung benötigt"
    ],
    "correctAnswer": 0,
    "explanation": "Nicht reagierende Prozesse können über den Task-Manager beendet werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-129",
    "category": "Betriebssysteme",
    "topic": "Prozesse",
    "difficulty": "hard",
    "question": "Welche Gefahr besteht beim Beenden eines unbekannten Systemprozesses?",
    "answers": [
      "Wichtige Systemfunktionen können beeinträchtigt werden",
      "Die SSD wird automatisch größer",
      "Der Monitor verliert dauerhaft seine Auflösung",
      "Das Netzwerkkabel kann elektrisch beschädigt werden"
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
      "Ein Hintergrundprozess für System- oder Anwendungsfunktionen",
      "Ein lokales Benutzerkonto für automatisierte Anmeldungen",
      "Ein Dateisystem speziell für externe und wechselbare Laufwerke",
      "Ein physischer Prozessorbereich für Hintergrundberechnungen"
    ],
    "correctAnswer": 0,
    "explanation": "Dienste laufen häufig ohne direkte Benutzeroberfläche im Hintergrund.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-131",
    "category": "Betriebssysteme",
    "topic": "Dienste",
    "difficulty": "medium",
    "question": "Welche Startart kann ein Windows-Dienst besitzen?",
    "answers": [
      "Automatisch",
      "Verschlüsselt",
      "Komprimiert",
      "Partitioniert"
    ],
    "correctAnswer": 0,
    "explanation": "Dienste können beispielsweise automatisch, manuell oder deaktiviert gestartet werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-132",
    "category": "Betriebssysteme",
    "topic": "Dienste",
    "difficulty": "medium",
    "question": "Was bedeutet die Startart 'Manuell' bei einem Dienst?",
    "answers": [
      "Der Dienst startet nur bei Bedarf oder durch einen Auslöser",
      "Der Dienst startet bei jedem Systemstart zwingend",
      "Der Dienst darf nie gestartet werden",
      "Der Dienst startet nur im abgesicherten Modus"
    ],
    "correctAnswer": 0,
    "explanation": "Manuell bedeutet, dass der Dienst nicht grundsätzlich bei jedem Start geladen wird.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-133",
    "category": "Betriebssysteme",
    "topic": "Dienste",
    "difficulty": "medium",
    "question": "Warum sollte man unbekannte Windows-Dienste nicht wahllos deaktivieren?",
    "answers": [
      "Abhängige Funktionen oder Anwendungen können ausfallen",
      "Die CPU-Taktfrequenz kann permanent verdoppelt werden",
      "Das Dateisystem wird automatisch gelöscht",
      "Der Benutzer verliert dauerhaft sein Kennwort"
    ],
    "correctAnswer": 0,
    "explanation": "Viele Dienste haben Abhängigkeiten und erfüllen zentrale Systemaufgaben.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-134",
    "category": "Betriebssysteme",
    "topic": "Dienste",
    "difficulty": "hard",
    "question": "Was beschreibt eine Dienstabhängigkeit?",
    "answers": [
      "Ein Dienst benötigt einen anderen Dienst für seine Funktion",
      "Ein Dienst benötigt zwingend einen zweiten Monitor",
      "Ein Dienst kann nur auf einer zweiten Partition laufen",
      "Ein Dienst funktioniert nur mit einem lokalen Benutzerkonto"
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
      "Eine Anwendung, die beim Anmelden oder Systemstart automatisch gestartet wird",
      "Ein Programm, das nur nach einem Absturz startet",
      "Ein Prozess, der ausschließlich im BIOS ausgeführt wird",
      "Ein Treiber, der niemals beendet werden kann"
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
      "Im Task-Manager im Bereich Autostart",
      "Nur in der Datenträgerverwaltung",
      "Nur im Geräte-Manager",
      "Nur in der Ereignisanzeige"
    ],
    "correctAnswer": 0,
    "explanation": "Der Task-Manager bietet eine Übersicht über viele Autostarteinträge.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-137",
    "category": "Betriebssysteme",
    "topic": "Autostart",
    "difficulty": "medium",
    "question": "Warum kann das Deaktivieren unnötiger Autostartprogramme sinnvoll sein?",
    "answers": [
      "Startzeit und Ressourcenverbrauch können reduziert werden",
      "Die SSD-Kapazität wird dadurch automatisch erhöht",
      "Windows erhält dadurch zusätzliche Benutzerkonten",
      "Die Netzwerkadresse wird dadurch dauerhaft geändert"
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
      "Er ermöglicht die Kommunikation zwischen Betriebssystem und Hardware",
      "Er ersetzt die eigentliche Hardware durch eine vollständig virtuelle Komponente",
      "Er speichert Benutzerdateien dauerhaft außerhalb des normalen Dateisystems",
      "Er verwaltet ausschließlich Kennwörter und Zugangsdaten von Netzwerkverbindungen"
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
    "question": "Wofür wird der Geräte-Manager verwendet?",
    "answers": [
      "Hardwaregeräte und zugehörige Treiber können geprüft und verwaltet werden",
      "Benutzerprofile und persönliche Dateien können vollständig archiviert werden",
      "Partitionen und Dateisysteme können erstellt und anschließend formatiert werden",
      "Domänenkonten und zentrale Gruppenrichtlinien können eingerichtet werden"
    ],
    "correctAnswer": 0,
    "explanation": "Der Geräte-Manager zeigt erkannte Hardware und deren Treiberstatus.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-140",
    "category": "Betriebssysteme",
    "topic": "Treiber",
    "difficulty": "medium",
    "question": "Was kann ein gelbes Warnsymbol im Geräte-Manager bedeuten?",
    "answers": [
      "Es besteht ein Problem mit Gerät oder Treiber",
      "Das Gerät arbeitet immer mit maximaler Leistung",
      "Das Gerät ist erfolgreich verschlüsselt",
      "Das Gerät befindet sich zwingend im Energiesparmodus"
    ],
    "correctAnswer": 0,
    "explanation": "Warnsymbole weisen auf Geräte- oder Treiberprobleme hin.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-141",
    "category": "Betriebssysteme",
    "topic": "Treiber",
    "difficulty": "medium",
    "question": "Warum kann ein Treiberupdate sinnvoll sein?",
    "answers": [
      "Fehler, Kompatibilität oder Sicherheit können verbessert werden",
      "Der physische Arbeitsspeicher wird ohne Hardwareänderung dauerhaft erweitert",
      "Das Systemlaufwerk wird beim Update automatisch neu formatiert",
      "Der Prozessor erhält durch den Treiber zusätzliche physische Rechenkerne"
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
    "question": "Welches Ziel haben Sicherheitsupdates?",
    "answers": [
      "Bekannte Sicherheitslücken zu schließen",
      "Die SSD-Kapazität zu erhöhen",
      "Den Prozessor physisch auszutauschen",
      "Alle Benutzerprofile zurückzusetzen"
    ],
    "correctAnswer": 0,
    "explanation": "Sicherheitsupdates beheben bekannte Schwachstellen in Software.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-144",
    "category": "Betriebssysteme",
    "topic": "Windows Update",
    "difficulty": "medium",
    "question": "Warum sollten Updates in Unternehmen geplant ausgerollt werden?",
    "answers": [
      "Kompatibilität und Betriebsunterbrechungen können kontrolliert werden",
      "Updates funktionieren nur während der Arbeitszeit",
      "Updates benötigen grundsätzlich Administratoren vor jedem Monitor",
      "Updates dürfen nur auf neuen Geräten installiert werden"
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
      "Ein größeres Update mit neuen oder geänderten Systemfunktionen",
      "Eine tägliche Aktualisierung der Systemuhr",
      "Ein Treiber ausschließlich für Drucker",
      "Eine Sicherung des Benutzerprofils"
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
    "question": "Wozu dient die Windows-Ereignisanzeige?",
    "answers": [
      "System-, Anwendungs- und Sicherheitsereignisse können analysiert werden",
      "Festplatten können physisch repariert werden",
      "Arbeitsspeicher kann erweitert werden",
      "Benutzer können direkt im BIOS angelegt werden"
    ],
    "correctAnswer": 0,
    "explanation": "Die Ereignisanzeige protokolliert viele wichtige System- und Anwendungsereignisse.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-148",
    "category": "Betriebssysteme",
    "topic": "Ereignisanzeige",
    "difficulty": "medium",
    "question": "Warum ist ein Zeitstempel in einem Ereignisprotokoll hilfreich?",
    "answers": [
      "Fehler können zeitlich mit anderen Vorgängen abgeglichen werden",
      "Die CPU erhält dadurch eine höhere Taktfrequenz",
      "Das Ereignis wird dadurch automatisch behoben",
      "Der Benutzer erhält dadurch Administratorrechte"
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
      "Relevante Fehler und Warnungen zum Problemzeitpunkt prüfen",
      "Alle Protokolle ohne Prüfung sofort löschen",
      "Nur erfolgreiche Ereignisse auswerten",
      "Jede Warnung automatisch als Hardwaredefekt behandeln"
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
    "question": "Welcher Befehl zeigt unter Windows die IP-Konfiguration?",
    "answers": [
      "ipconfig",
      "format",
      "taskkill",
      "mkdir"
    ],
    "correctAnswer": 0,
    "explanation": "ipconfig zeigt IP-Adresse, Subnetzmaske und weitere Netzwerkinformationen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-151",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "medium",
    "question": "Was zeigt 'ipconfig /all' zusätzlich an?",
    "answers": [
      "Detaillierte Adapter-, DHCP-, DNS- und Adressinformationen",
      "Detaillierte Angaben zur aktuellen Prozessor- und Speicherauslastung",
      "Detaillierte NTFS-Berechtigungen aller lokalen Benutzerverzeichnisse",
      "Detaillierte Versionsinformationen zu Windows und installierten Updates"
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
    "question": "Wozu dient der Befehl ping?",
    "answers": [
      "Er testet die Erreichbarkeit eines Netzwerkziels",
      "Er formatiert ein Netzlaufwerk",
      "Er erstellt ein Benutzerkonto",
      "Er beendet einen Hintergrunddienst"
    ],
    "correctAnswer": 0,
    "explanation": "ping prüft mit ICMP-Echo-Anfragen, ob ein Ziel erreichbar ist.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-153",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "medium",
    "question": "Was prüft 'ping 127.0.0.1' hauptsächlich?",
    "answers": [
      "Den lokalen TCP/IP-Stack",
      "Die physische Verbindung zum Internetprovider",
      "Die Funktion eines entfernten DNS-Servers",
      "Die Geschwindigkeit des WLAN-Routers"
    ],
    "correctAnswer": 0,
    "explanation": "Die Loopback-Adresse testet die lokale IP-Verarbeitung des Rechners.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-154",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "medium",
    "question": "Welcher Befehl zeigt den Weg über mehrere Router zu einem Ziel?",
    "answers": [
      "tracert",
      "hostname",
      "whoami",
      "chkdsk"
    ],
    "correctAnswer": 0,
    "explanation": "tracert zeigt die Zwischenstationen beziehungsweise Hops zu einem Ziel.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-155",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "medium",
    "question": "Wozu dient nslookup?",
    "answers": [
      "DNS-Namensauflösung kann geprüft werden",
      "NTFS-Berechtigungen können geändert werden",
      "Treiber können aktualisiert werden",
      "Prozesse können beendet werden"
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
      "Den Namen des lokalen Rechners",
      "Die MAC-Adresse des Routers",
      "Die Seriennummer der SSD",
      "Die Windows-Produkt-ID"
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
    "question": "Was kann 'ipconfig /release' bei DHCP bewirken?",
    "answers": [
      "Die aktuell bezogene DHCP-Adresse wird freigegeben",
      "Die Netzwerkkarte wird dauerhaft deaktiviert",
      "Das DNS-Protokoll wird deinstalliert",
      "Die lokale Firewall wird ausgeschaltet"
    ],
    "correctAnswer": 0,
    "explanation": "release gibt eine per DHCP erhaltene Konfiguration frei.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-158",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "medium",
    "question": "Was bewirkt 'ipconfig /renew' typischerweise?",
    "answers": [
      "Eine DHCP-Konfiguration wird neu angefordert",
      "Alle Netzwerkprofile werden gelöscht",
      "Der DNS-Server wird neu installiert",
      "Das Benutzerkonto wird erneuert"
    ],
    "correctAnswer": 0,
    "explanation": "renew fordert vom DHCP-Server eine neue oder erneuerte Lease an.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-159",
    "category": "Betriebssysteme",
    "topic": "Windows Netzwerk",
    "difficulty": "hard",
    "question": "Ein Rechner kann eine IP-Adresse anpingen, aber keinen Hostnamen. Welche Ursache ist besonders plausibel?",
    "answers": [
      "Die DNS-Namensauflösung funktioniert nicht korrekt",
      "Der Arbeitsspeicher ist vollständig ausgelastet",
      "Der Monitor verwendet die falsche Auflösung",
      "Die SSD besitzt kein Laufwerkslabel"
    ],
    "correctAnswer": 0,
    "explanation": "Wenn IP-Konnektivität funktioniert, aber Namen nicht, sollte DNS geprüft werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-160",
    "category": "Betriebssysteme",
    "topic": "Freigaben",
    "difficulty": "medium",
    "question": "Was ist eine Netzwerkfreigabe?",
    "answers": [
      "Ein Ordner oder eine Ressource, die über das Netzwerk bereitgestellt wird",
      "Ein ausschließlich lokaler Systemordner, auf den nur Windows selbst zugreifen kann",
      "Eine Partition ohne Dateisystem, die erst später einem Benutzer zugewiesen wird",
      "Ein Hintergrundprozess, der ausschließlich Kernel-Funktionen lokal ausführt"
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
      "Freigabeberechtigungen und NTFS-Berechtigungen",
      "BIOS-Berechtigungen und CPU-Berechtigungen",
      "Monitorrechte und Druckerrechte",
      "UEFI-Rechte und SATA-Rechte"
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
    "question": "Welche Berechtigung ist bei Netzwerkzugriff auf eine NTFS-Freigabe praktisch entscheidend?",
    "answers": [
      "Die wirksamste Einschränkung aus Freigabe- und NTFS-Rechten",
      "Immer ausschließlich die Freigabeberechtigung",
      "Immer ausschließlich die NTFS-Berechtigung",
      "Immer die Einstellung mit den meisten Rechten"
    ],
    "correctAnswer": 0,
    "explanation": "Die effektiven Rechte ergeben sich aus beiden Ebenen; restriktivere Rechte begrenzen den Zugriff.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-163",
    "category": "Betriebssysteme",
    "topic": "Freigaben",
    "difficulty": "medium",
    "question": "Wofür wird ein UNC-Pfad verwendet?",
    "answers": [
      "Für den Zugriff auf Netzwerkressourcen wie \\\\Server\\Freigabe",
      "Für die Angabe eines lokalen CPU-Sockels",
      "Für die Benennung einer Partitionstabelle",
      "Für die Beschreibung einer Bildschirmauflösung"
    ],
    "correctAnswer": 0,
    "explanation": "UNC-Pfade adressieren Netzwerkressourcen unabhängig von Laufwerksbuchstaben.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-164",
    "category": "Betriebssysteme",
    "topic": "Freigaben",
    "difficulty": "medium",
    "question": "Was ist ein Netzlaufwerk?",
    "answers": [
      "Eine Netzwerkfreigabe, die einem Laufwerksbuchstaben zugeordnet ist",
      "Eine Festplatte mit eingebautem WLAN-Modul",
      "Ein virtuelles DVD-Laufwerk ohne Netzwerkzugriff",
      "Eine SSD mit eigener IP-Adresse im PC"
    ],
    "correctAnswer": 0,
    "explanation": "Netzlaufwerke binden Freigaben bequem als Laufwerksbuchstaben ein.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-165",
    "category": "Betriebssysteme",
    "topic": "Windows Sicherheit",
    "difficulty": "medium",
    "question": "Welche Aufgabe hat die Windows-Firewall?",
    "answers": [
      "Netzwerkverkehr anhand von Regeln zu erlauben oder zu blockieren",
      "Arbeitsspeicher auf Fehler zu prüfen",
      "Festplatten automatisch zu defragmentieren",
      "Benutzerdateien dauerhaft zu archivieren"
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
      "Je nach Netzwerkumgebung können unterschiedliche Regeln gelten",
      "Jedes Profil verwendet ein anderes Dateisystem",
      "Jedes Profil benötigt eine eigene CPU",
      "Die Profile bestimmen ausschließlich das Desktopdesign"
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
      "Schadsoftware erkennen und blockieren",
      "IP-Adressen automatisch vergeben",
      "Partitionen erstellen und formatieren",
      "Druckertreiber installieren"
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
      "Neue bekannte Bedrohungen können besser erkannt werden",
      "Der Arbeitsspeicher wird dadurch schneller",
      "Die Netzwerkkarte erhält eine neue MAC-Adresse",
      "Die SSD wird dadurch größer"
    ],
    "correctAnswer": 0,
    "explanation": "Aktuelle Erkennungsdaten verbessern den Schutz gegen neu bekannte Schadsoftware.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-169",
    "category": "Betriebssysteme",
    "topic": "Windows Sicherheit",
    "difficulty": "hard",
    "question": "Warum ist ein deaktivierter Echtzeitschutz auf einem Arbeitsplatz riskant?",
    "answers": [
      "Schädliche Dateien können weniger unmittelbar erkannt werden",
      "Windows verliert dadurch automatisch seine Lizenz",
      "Die CPU arbeitet danach nur noch mit einem Kern",
      "Alle Netzwerkfreigaben werden automatisch gelöscht"
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
      "Laufwerke können verschlüsselt werden",
      "CPU-Kerne können virtualisiert werden",
      "Netzwerkpakete können priorisiert werden",
      "Druckaufträge können komprimiert werden"
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
      "Er kann bei bestimmten Sicherheits- oder Hardwareänderungen den Zugriff wieder ermöglichen",
      "Er ersetzt das normale Windows-Kennwort dauerhaft bei jeder Benutzeranmeldung",
      "Er vergrößert den verfügbaren Speicherplatz eines verschlüsselten Laufwerks automatisch",
      "Er startet Windows bei jedem Fehler automatisch im abgesicherten Modus"
    ],
    "correctAnswer": 0,
    "explanation": "Bei Sicherheitsprüfungen oder Änderungen kann Windows den Recovery Key verlangen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-172",
    "category": "Betriebssysteme",
    "topic": "BitLocker",
    "difficulty": "medium",
    "question": "Welches Hardwaremodul kann BitLocker unterstützen?",
    "answers": [
      "TPM",
      "GPU",
      "Soundkarte",
      "USB-Hub"
    ],
    "correctAnswer": 0,
    "explanation": "Ein TPM kann Schlüsselmaterial sicher an die Plattformkonfiguration binden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-173",
    "category": "Betriebssysteme",
    "topic": "BitLocker",
    "difficulty": "hard",
    "question": "Warum kann eine größere Firmware- oder Hardwareänderung eine BitLocker-Abfrage auslösen?",
    "answers": [
      "Die gemessene Systemkonfiguration kann von der erwarteten Konfiguration abweichen",
      "Die SSD verliert dadurch automatisch ihr Dateisystem",
      "Der Benutzername wird dadurch verändert",
      "Windows erkennt danach grundsätzlich keine USB-Geräte mehr"
    ],
    "correctAnswer": 0,
    "explanation": "BitLocker kann Plattformmessungen verwenden, um unerwartete Startänderungen zu erkennen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-174",
    "category": "Betriebssysteme",
    "topic": "Backup und Wiederherstellung",
    "difficulty": "medium",
    "question": "Warum ist ein Backup wichtig?",
    "answers": [
      "Daten können nach Verlust oder Beschädigung wiederhergestellt werden",
      "Die Rechenleistung des Systems kann ohne Hardwareänderung deutlich erhöht werden",
      "Benutzeranmeldungen und Zugriffsrechte werden durch das Backup vollständig ersetzt",
      "Hardwaredefekte können durch eine vorhandene Sicherung vollständig verhindert werden"
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
    "question": "Warum sollte ein Backup nicht ausschließlich auf demselben Datenträger liegen?",
    "answers": [
      "Ein Defekt des Datenträgers könnte Original und Sicherung gleichzeitig betreffen",
      "Das Betriebssystem könnte sonst grundsätzlich nicht mehr vom Systemlaufwerk starten",
      "Windows erlaubt auf einem Datenträger grundsätzlich keine zweite Kopie derselben Datei",
      "Der angemeldete Benutzer könnte dadurch automatisch zu viele Dateiberechtigungen erhalten"
    ],
    "correctAnswer": 0,
    "explanation": "Getrennte Speicherorte reduzieren gemeinsame Ausfallrisiken.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-176",
    "category": "Betriebssysteme",
    "topic": "Backup und Wiederherstellung",
    "difficulty": "medium",
    "question": "Was ist ein Wiederherstellungspunkt in Windows?",
    "answers": [
      "Ein gespeicherter Systemzustand für bestimmte Konfigurationsänderungen",
      "Eine vollständige Kopie aller persönlichen Dateien",
      "Ein Ersatz für jedes externe Backup",
      "Eine dauerhafte Kopie des gesamten Arbeitsspeichers"
    ],
    "correctAnswer": 0,
    "explanation": "Systemwiederherstellung kann bestimmte Systemdateien und Einstellungen auf einen früheren Zustand setzen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-177",
    "category": "Betriebssysteme",
    "topic": "Backup und Wiederherstellung",
    "difficulty": "medium",
    "question": "Was sollte nach Erstellung einer Datensicherung regelmäßig geprüft werden?",
    "answers": [
      "Ob die Sicherung tatsächlich wiederherstellbar ist",
      "Ob die Datei möglichst groß geworden ist",
      "Ob der Monitor ausgeschaltet bleibt",
      "Ob keine Protokolle erzeugt wurden"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Backup ist nur wertvoll, wenn die Wiederherstellung funktioniert.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-178",
    "category": "Betriebssysteme",
    "topic": "Backup und Wiederherstellung",
    "difficulty": "hard",
    "question": "Warum schützt eine reine Dateisynchronisation nicht zwingend wie ein Backup?",
    "answers": [
      "Gelöschte oder beschädigte Daten können synchron auf das Ziel übernommen werden",
      "Synchronisation speichert grundsätzlich keine Dateien",
      "Synchronisation funktioniert ausschließlich mit DVDs",
      "Synchronisation deaktiviert automatisch Dateiberechtigungen"
    ],
    "correctAnswer": 0,
    "explanation": "Synchronisation kann Änderungen inklusive Fehlern oder Löschungen spiegeln.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-179",
    "category": "Betriebssysteme",
    "topic": "Wiederherstellung",
    "difficulty": "medium",
    "question": "Wozu dient der abgesicherte Modus?",
    "answers": [
      "Windows startet mit einer reduzierten Auswahl an Treibern und Diensten",
      "Windows startet mit maximaler Grafikleistung",
      "Alle Benutzer erhalten Administratorrechte",
      "Alle Laufwerke werden automatisch formatiert"
    ],
    "correctAnswer": 0,
    "explanation": "Der abgesicherte Modus erleichtert Diagnose bei Treiber- oder Startproblemen.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-180",
    "category": "Betriebssysteme",
    "topic": "Wiederherstellung",
    "difficulty": "medium",
    "question": "Wann ist der abgesicherte Modus besonders nützlich?",
    "answers": [
      "Wenn ein Treiber oder Autostartprogramm den normalen Start stört",
      "Wenn die SSD mehr Speicherplatz benötigt",
      "Wenn ein Drucker neues Papier benötigt",
      "Wenn ein Benutzer ein neues Kennwort wünscht"
    ],
    "correctAnswer": 0,
    "explanation": "Mit reduziertem Startumfang können störende Komponenten leichter identifiziert werden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-181",
    "category": "Betriebssysteme",
    "topic": "Wiederherstellung",
    "difficulty": "medium",
    "question": "Was ist die Windows-Wiederherstellungsumgebung WinRE?",
    "answers": [
      "Eine Umgebung mit Werkzeugen zur Reparatur und Wiederherstellung",
      "Eine alternative Desktopumgebung für Spiele und Multimediaanwendungen",
      "Ein Dateisystem speziell für externe Sicherungs- und Installationslaufwerke",
      "Ein eigenständiges Programm ausschließlich zur Bearbeitung von Videos"
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
    "question": "Welche Funktion kann bei Startproblemen helfen?",
    "answers": [
      "Starthilfe beziehungsweise Startup Repair",
      "Datenträgerbereinigung für temporäre Systemdateien",
      "Bildschirmlupe für die barrierefreie Darstellung",
      "Zwischenablageverlauf für kopierte Texte und Dateien"
    ],
    "correctAnswer": 0,
    "explanation": "Die Starthilfe analysiert bestimmte Probleme, die den Windows-Start verhindern.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-183",
    "category": "Betriebssysteme",
    "topic": "Kommandozeile",
    "difficulty": "medium",
    "question": "Welcher Befehl zeigt den aktuellen Benutzer in Windows an?",
    "answers": [
      "whoami",
      "ipconfig",
      "dir",
      "format"
    ],
    "correctAnswer": 0,
    "explanation": "whoami zeigt die Identität des aktuell verwendeten Sicherheitskontexts.",
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
    "question": "Welcher Befehl wechselt in ein anderes Verzeichnis?",
    "answers": [
      "cd",
      "dir",
      "type",
      "hostname"
    ],
    "correctAnswer": 0,
    "explanation": "cd steht für change directory.",
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
    "question": "Welcher Befehl kann Prozesse in der CMD anzeigen?",
    "answers": [
      "tasklist",
      "netstat",
      "mkdir",
      "copy"
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
    "question": "Welcher Befehl kann einen Prozess gezielt beenden?",
    "answers": [
      "taskkill",
      "tracert",
      "hostname",
      "chkdsk"
    ],
    "correctAnswer": 0,
    "explanation": "taskkill kann Prozesse anhand verschiedener Kriterien beenden.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-189",
    "category": "Betriebssysteme",
    "topic": "PowerShell",
    "difficulty": "medium",
    "question": "Was ist PowerShell?",
    "answers": [
      "Eine Shell und Skriptumgebung zur Administration",
      "Ein Dateisystem ausschließlich für Windows",
      "Eine Hardwarekomponente auf dem Mainboard",
      "Ein Antivirenprogramm ohne Skriptfunktion"
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
    "question": "Welcher Vorteil von PowerShell gegenüber rein textbasierter Ausgabe ist typisch?",
    "answers": [
      "Viele Befehle geben strukturierte Objekte zurück",
      "PowerShell benötigt grundsätzlich keine Berechtigungen",
      "PowerShell kann ausschließlich Netzwerkbefehle ausführen",
      "PowerShell funktioniert nur ohne grafische Oberfläche"
    ],
    "correctAnswer": 0,
    "explanation": "PowerShell-Pipelines verarbeiten häufig Objekte mit Eigenschaften statt nur Text.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-191",
    "category": "Betriebssysteme",
    "topic": "Systeminformationen",
    "difficulty": "medium",
    "question": "Welches Windows-Werkzeug zeigt umfangreiche Systeminformationen?",
    "answers": [
      "msinfo32",
      "calc",
      "mspaint",
      "notepad"
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
      "Fehler und Updates können versionsabhängig sein",
      "Sie bestimmt die Größe des Arbeitsspeichers",
      "Sie legt die MAC-Adresse des Rechners fest",
      "Sie ersetzt die Seriennummer der Hardware"
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
      "Das Betriebssystem wird neu auf einem Zielsystem eingerichtet",
      "Nur ein Benutzerkonto wird neu angelegt",
      "Nur der Browser wird aktualisiert",
      "Nur die Netzwerkkarte wird zurückgesetzt"
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
      "Persönliche Daten könnten beim Installationsprozess verloren gehen",
      "Windows könnte ohne vorhandene Sicherung grundsätzlich nicht mehr gestartet werden",
      "Die Firmwareeinstellungen könnten ohne Backup nicht mehr geöffnet oder geändert werden",
      "Der Prozessor könnte während der Neuinstallation dauerhaft zu wenig Spannung erhalten"
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
    "question": "Von welchem Medium kann Windows typischerweise installiert werden?",
    "answers": [
      "Von einem bootfähigen USB-Stick",
      "Nur von einer internen HDD",
      "Nur über einen Druckeranschluss",
      "Nur aus dem Arbeitsspeicher"
    ],
    "correctAnswer": 0,
    "explanation": "Windows-Installationsmedien werden häufig als bootfähige USB-Sticks verwendet.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-197",
    "category": "Betriebssysteme",
    "topic": "Windows Installation",
    "difficulty": "medium",
    "question": "Warum muss die Bootreihenfolge für eine Installation eventuell geändert werden?",
    "answers": [
      "Der Rechner soll zunächst vom Installationsmedium starten",
      "Die SSD soll dadurch mehr Speicher erhalten",
      "Die CPU soll dadurch höher takten",
      "Der Benutzer soll dadurch Administrator werden"
    ],
    "correctAnswer": 0,
    "explanation": "Das Installationsmedium muss vor dem vorhandenen Betriebssystem ausgewählt werden können.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-198",
    "category": "Betriebssysteme",
    "topic": "Windows Installation",
    "difficulty": "medium",
    "question": "Was ist nach einer frischen Windows-Installation typischerweise zu prüfen?",
    "answers": [
      "Treiber, Updates, Aktivierung und benötigte Anwendungen",
      "Desktopdesign, Hintergrundbild, Farbschema und Mauszeiger",
      "Systemtöne, Lautstärkeeinstellung, Screensaver und Uhrformat",
      "Taskleistenposition, Symbolgröße, Fensterfarbe und Wallpaper"
    ],
    "correctAnswer": 0,
    "explanation": "Ein einsatzbereites System benötigt passende Treiber, aktuelle Updates und die erforderliche Software.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-199",
    "category": "Betriebssysteme",
    "topic": "Lizenzierung",
    "difficulty": "medium",
    "question": "Was ist die Windows-Aktivierung?",
    "answers": [
      "Eine Prüfung, ob die Windows-Lizenz ordnungsgemäß verwendet wird",
      "Eine Verschlüsselung sämtlicher Benutzerdateien",
      "Eine automatische Aktualisierung aller Treiber",
      "Eine Formatierung des Systemlaufwerks"
    ],
    "correctAnswer": 0,
    "explanation": "Aktivierung verbindet die Installation mit einer gültigen Lizenzberechtigung.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "betriebssysteme-200",
    "category": "Betriebssysteme",
    "topic": "Lizenzierung",
    "difficulty": "medium",
    "question": "Warum ist Lizenzmanagement in Unternehmen wichtig?",
    "answers": [
      "Nutzungsrechte und Lizenzbedarf müssen nachvollziehbar bleiben",
      "Lizenzen erhöhen automatisch die CPU-Leistung",
      "Lizenzen ersetzen jede Benutzerverwaltung",
      "Lizenzen machen Updates unnötig"
    ],
    "correctAnswer": 0,
    "explanation": "Unternehmen müssen eingesetzte Software und Nutzungsrechte kontrollieren.",
    "source": "betriebssysteme.csv"
  },
  {
    "id": "hardware-001",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein PC besitzt zwei identische RAM-Module. Wie sollten sie bei einem Mainboard mit vier RAM-Steckplätzen normalerweise eingesetzt werden, um Dual-Channel zu nutzen?",
    "answers": [
      "In die vom Mainboard-Handbuch vorgesehenen Dual-Channel-Steckplätze",
      "Direkt nebeneinander, unabhängig vom Mainboard",
      "Nur ein Modul darf eingesetzt werden",
      "In beliebige Steckplätze, da Dual-Channel automatisch immer aktiv ist"
    ],
    "correctAnswer": 0,
    "explanation": "Für Dual-Channel müssen die Module in den dafür vorgesehenen Speicherkanälen eingesetzt werden. Die genaue Belegung steht im Mainboard-Handbuch.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-002",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Mainboard unterstützt ausschließlich DDR5-Arbeitsspeicher. Welches RAM-Modul kann darin verwendet werden?",
    "answers": [
      "DDR4, wenn die Taktfrequenz gleich ist",
      "DDR5",
      "DDR3 oder DDR4 mit Adapter",
      "Jeder DIMM-Arbeitsspeicher"
    ],
    "correctAnswer": 1,
    "explanation": "DDR-Generationen sind elektrisch und mechanisch unterschiedlich. Ein DDR5-Mainboard benötigt kompatiblen DDR5-Arbeitsspeicher.",
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
      "Er erhöht automatisch die CPU-Taktfrequenz",
      "Er kann bestimmte Speicherfehler erkennen und korrigieren",
      "Er verdoppelt die verfügbare Speicherkapazität",
      "Er benötigt keine Speichercontroller"
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
    "question": "Eine PCIe-4.0-Grafikkarte wird in einen kompatiblen PCIe-5.0-x16-Steckplatz eingebaut. Was ist grundsätzlich zu erwarten?",
    "answers": [
      "Die Grafikkarte kann wegen der unterschiedlichen PCIe-Version nicht verwendet werden",
      "Die Grafikkarte arbeitet grundsätzlich mit ihrer unterstützten PCIe-Version",
      "Die Grafikkarte wird automatisch zu einer PCIe-5.0-Grafikkarte",
      "Der PCIe-Steckplatz wird dauerhaft beschädigt"
    ],
    "correctAnswer": 1,
    "explanation": "PCIe ist grundsätzlich abwärtskompatibel. Eine PCIe-4.0-Karte kann daher in einem kompatiblen PCIe-5.0-Steckplatz betrieben werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-007",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein PC schaltet sich unter hoher CPU-Last nach einiger Zeit ab. Die CPU-Temperatur steigt dabei stark an. Welche Maßnahme sollte zuerst geprüft werden?",
    "answers": [
      "CPU-Kühler, Lüfter und Wärmeübertragung kontrollieren",
      "Die SSD formatieren",
      "Mehr Arbeitsspeicher einbauen",
      "Die Bildschirmauflösung reduzieren"
    ],
    "correctAnswer": 0,
    "explanation": "Stark steigende CPU-Temperaturen unter Last deuten auf ein Problem mit Kühlung, Lüfter, Montage oder Wärmeübertragung hin.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-008",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum sollte ein Netzteil nicht ausschließlich nach der typischen Leistungsaufnahme eines PCs dimensioniert werden?",
    "answers": [
      "Weil ein Netzteil immer exakt doppelt so viel Leistung wie die CPU benötigt",
      "Weil Lastspitzen, weitere Komponenten und Leistungsreserve berücksichtigt werden sollten",
      "Weil die Leistung des Netzteils keinen Einfluss auf das System hat",
      "Weil Grafikkarten grundsätzlich ein eigenes Netzteil benötigen"
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
    "question": "Ein Prozessor besitzt 8 Kerne und unterstützt 16 Threads. Welche Aussage ist korrekt?",
    "answers": [
      "Der Prozessor besitzt 16 physische Kerne",
      "Jeder Thread benötigt einen eigenen RAM-Riegel",
      "Der Prozessor kann bis zu 16 Ausführungs-Threads gleichzeitig bereitstellen",
      "Die Anzahl der Threads entspricht der Anzahl der PCIe-Steckplätze"
    ],
    "correctAnswer": 2,
    "explanation": "Die 8 Kerne sind physische Recheneinheiten. Durch die unterstützte Multithreading-Technik können insgesamt 16 Threads bereitgestellt werden.",
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
      "Häufig benötigte Daten besonders schnell für die CPU bereitzustellen",
      "Dateien dauerhaft zu speichern",
      "Die Netzspannung für den Prozessor umzuwandeln",
      "Den Arbeitsspeicher bei Stromausfall zu sichern"
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
    "question": "Welche Aussage über den Formfaktor eines Mainboards ist korrekt?",
    "answers": [
      "Er beschreibt unter anderem Abmessungen und Befestigungspunkte des Mainboards",
      "Er bestimmt ausschließlich die Taktfrequenz der CPU",
      "Er gibt die maximale Geschwindigkeit einer SSD an",
      "Er legt die Bildschirmauflösung des Systems fest"
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
      "Zur Überwachung verschiedener Zustands- und Fehlerwerte des Laufwerks",
      "Zur automatischen Verschlüsselung aller Dateien",
      "Zur Erhöhung der Speicherkapazität",
      "Zur Einstellung der CPU-Taktfrequenz"
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
    "question": "Welche Aussage beschreibt den Unterschied zwischen integrierter und dedizierter Grafik am besten?",
    "answers": [
      "Dedizierte Grafikkarten besitzen typischerweise eigene Grafikressourcen und häufig eigenen Videospeicher",
      "Integrierte Grafik kann grundsätzlich keine Monitore ansteuern",
      "Dedizierte Grafik befindet sich immer innerhalb der CPU",
      "Integrierte Grafik besitzt grundsätzlich mehr Leistung als eine dedizierte Grafikkarte"
    ],
    "correctAnswer": 0,
    "explanation": "Eine dedizierte Grafikkarte ist eine separate Grafikeinheit und verfügt typischerweise über eigenen Videospeicher. Integrierte Grafik ist dagegen in CPU oder Chipsatz integriert und nutzt häufig gemeinsamen Systemspeicher.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-020",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Gerät besitzt einen USB-C-Anschluss. Welche Aussage ist korrekt?",
    "answers": [
      "Die Form des Anschlusses allein sagt nicht eindeutig aus, welche Datenrate und Funktionen unterstützt werden",
      "USB-C unterstützt immer automatisch Thunderbolt",
      "USB-C bietet grundsätzlich exakt dieselbe Datenrate",
      "USB-C kann ausschließlich zum Laden verwendet werden"
    ],
    "correctAnswer": 0,
    "explanation": "USB-C beschreibt zunächst den Steckertyp. Unterstützte Datenraten, Ladeleistungen und Funktionen wie DisplayPort oder Thunderbolt hängen vom jeweiligen Gerät und Standard ab.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-021",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein PC verfügt über eine CPU mit integrierter Grafikeinheit, aber zusätzlich ist eine dedizierte Grafikkarte eingebaut. Wo sollte der Monitor normalerweise angeschlossen werden, wenn die dedizierte Grafikkarte genutzt werden soll?",
    "answers": [
      "Am Grafikausgang des Mainboards",
      "Am Grafikausgang der dedizierten Grafikkarte",
      "Am Netzteil",
      "An einem freien USB-Anschluss"
    ],
    "correctAnswer": 1,
    "explanation": "Wenn die dedizierte Grafikkarte verwendet werden soll, wird der Monitor normalerweise direkt an deren Grafikausgang angeschlossen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-022",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Mainboard besitzt einen bestimmten CPU-Sockel. Was muss bei der Auswahl eines neuen Prozessors unbedingt geprüft werden?",
    "answers": [
      "Ob Prozessor und Mainboard einen kompatiblen Sockel und Chipsatz besitzen",
      "Ob die SSD dieselbe Taktfrequenz wie die CPU verwendet",
      "Ob das Netzteil vom gleichen Hersteller wie das Mainboard stammt",
      "Ob der Arbeitsspeicher dieselbe Anzahl an Kernen besitzt"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Prozessor muss mechanisch und elektrisch zum Sockel sowie zur unterstützten Plattform des Mainboards passen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-023",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Rechner soll kurze Stromausfälle überbrücken und bei einem längeren Ausfall kontrolliert heruntergefahren werden können. Welche Komponente eignet sich dafür?",
    "answers": [
      "Ein leistungsstärkerer CPU-Kühler",
      "Eine USV",
      "Ein zusätzlicher RAM-Riegel",
      "Ein USB-Hub"
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
      "Es speichert ausschließlich zwei vollständige Kopien aller Daten",
      "Es benötigt keine zusätzlichen Informationen zur Wiederherstellung",
      "Es verteilt Paritätsinformationen und kann den Ausfall eines Laufwerks tolerieren",
      "Es verdoppelt grundsätzlich die Geschwindigkeit jedes einzelnen Laufwerks"
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
      "Für dieselbe Ausgangsleistung wird weniger elektrische Leistung aus dem Stromnetz aufgenommen",
      "Der PC erhält automatisch eine höhere CPU-Taktfrequenz",
      "Das Netzteil kann unabhängig von seiner Nennleistung jede Grafikkarte versorgen",
      "Die Ausgangsspannung steigt automatisch mit dem Wirkungsgrad"
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
    "question": "Eine Netzwerkkarte unterstützt 2,5 Gbit/s, ist aber mit einem Switch-Port verbunden, der maximal 1 Gbit/s unterstützt. Welche Verbindungsgeschwindigkeit ist normalerweise zu erwarten?",
    "answers": [
      "2,5 Gbit/s, weil immer das schnellere Gerät bestimmt",
      "10 Gbit/s durch automatische Bündelung",
      "1 Gbit/s",
      "Die Verbindung funktioniert grundsätzlich nicht"
    ],
    "correctAnswer": 2,
    "explanation": "Bei der automatischen Aushandlung wird eine Geschwindigkeit verwendet, die beide Seiten unterstützen. Ist der Switch auf 1 Gbit/s begrenzt, wird die Verbindung normalerweise mit maximal 1 Gbit/s aufgebaut.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-028",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe übernimmt UEFI beziehungsweise die System-Firmware beim Start eines PCs?",
    "answers": [
      "Sie speichert dauerhaft alle persönlichen Dateien des Benutzers",
      "Sie initialisiert Hardware und startet beziehungsweise übergibt anschließend an den Bootvorgang des Betriebssystems",
      "Sie ersetzt grundsätzlich das Betriebssystem",
      "Sie dient ausschließlich zur Steuerung der Netzwerkkarte"
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
    "question": "Ein M.2-Steckplatz eines Mainboards unterstützt laut Handbuch ausschließlich SATA. Was passiert typischerweise, wenn dort eine reine PCIe-NVMe-SSD eingesetzt wird?",
    "answers": [
      "Die SSD arbeitet automatisch mit SATA-Geschwindigkeit",
      "Die SSD wird automatisch in eine SATA-SSD umgewandelt",
      "Die SSD kann in diesem Steckplatz nicht über ihr benötigtes PCIe/NVMe-Protokoll betrieben werden",
      "Die SSD verdoppelt die Anzahl der verfügbaren PCIe-Lanes"
    ],
    "correctAnswer": 2,
    "explanation": "M.2 beschreibt die Bauform, aber der Steckplatz muss auch das von der SSD verwendete Protokoll unterstützen. Ein ausschließlich für SATA ausgelegter M.2-Anschluss kann eine reine PCIe-NVMe-SSD nicht entsprechend betreiben.",
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
    "difficulty": "hard",
    "question": "Ein System besitzt eine PCIe-4.0-x16-Grafikkarte, die elektrisch nur acht Lanes nutzt. Sie wird in einem PCIe-4.0-x16-Steckplatz betrieben. Welche Aussage ist korrekt?",
    "answers": [
      "Die Karte nutzt automatisch 16 Lanes, weil der Steckplatz x16 ist",
      "Die Karte arbeitet mit maximal acht Lanes, da ihre eigene elektrische Anbindung dies begrenzt",
      "Die Karte kann in einem x16-Steckplatz nicht betrieben werden",
      "Die Karte wird automatisch zu PCIe 5.0 hochgestuft"
    ],
    "correctAnswer": 1,
    "explanation": "Die physische Länge des Steckplatzes bestimmt nicht automatisch die tatsächlich verwendete Lane-Anzahl. Eine Karte mit elektrischer x8-Anbindung nutzt maximal acht Lanes.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-032",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Mainboard stellt zwei M.2-Steckplätze bereit. Laut Handbuch teilt sich der zweite M.2-Steckplatz PCIe-Lanes mit einem SATA-Controller. Welche Folge kann der Einbau einer NVMe-SSD dort haben?",
    "answers": [
      "Bestimmte SATA-Anschlüsse können deaktiviert werden",
      "Die CPU verliert automatisch die Hälfte ihrer Kerne",
      "Der Arbeitsspeicher wechselt in Single-Channel",
      "Das Netzteil liefert weniger Spannung"
    ],
    "correctAnswer": 0,
    "explanation": "Bei Mainboards werden PCIe-Lanes teilweise zwischen Schnittstellen geteilt. Die Nutzung eines bestimmten M.2-Steckplatzes kann deshalb laut Handbuch einzelne SATA-Ports deaktivieren.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-033",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Rechner besitzt 32 GB RAM. Während einer Anwendung sind 20 GB physischer RAM belegt, gleichzeitig zeigt das Betriebssystem eine Commit-Nutzung von 38 GB. Welche Aussage erklärt dies am besten?",
    "answers": [
      "Commit kann auch Speicher umfassen, der durch Auslagerungsdatei abgesichert wird",
      "Der Rechner besitzt tatsächlich 38 GB physischen RAM",
      "Die CPU stellt automatisch zusätzlichen RAM bereit",
      "Die SSD wurde in echten Arbeitsspeicher umgewandelt"
    ],
    "correctAnswer": 0,
    "explanation": "Der zugesicherte virtuelle Speicher kann größer als der aktuell belegte physische RAM sein, weil auch Speicherbereiche berücksichtigt werden, die durch die Auslagerungsdatei abgesichert werden können.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-034",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Eine Workstation besitzt ein Netzteil mit 850 W Nennleistung und 80-PLUS-Zertifizierung. Welche Aussage zur 850-W-Angabe ist korrekt?",
    "answers": [
      "Sie beschreibt die maximale elektrische Leistung, die das Netzteil typischerweise an seine Ausgänge liefern kann",
      "Sie beschreibt immer exakt die Leistungsaufnahme aus der Steckdose",
      "Sie bedeutet, dass der PC ständig 850 W verbraucht",
      "Sie ist ausschließlich die maximale Leistung der Grafikkarte"
    ],
    "correctAnswer": 0,
    "explanation": "Die Nennleistung bezieht sich auf die Ausgangsleistung des Netzteils. Die Leistungsaufnahme aus dem Stromnetz ist aufgrund von Umwandlungsverlusten höher und hängt von Last und Wirkungsgrad ab.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-035",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Hauptaufgabe hat die CPU?",
    "answers": [
      "Befehle verarbeiten und Berechnungen bzw. Steuerungsaufgaben ausführen.",
      "Daten ausschließlich dauerhaft speichern.",
      "Nur Netzwerkpakete zwischen Subnetzen routen.",
      "Die Bildschirmauflösung dauerhaft im BIOS speichern."
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
      "Schneller flüchtiger Arbeitsspeicher.",
      "Permanenter Massenspeicher ohne Strombedarf.",
      "Nur-Lese-Speicher für Netzwerkadressen.",
      "Externer Speicher ausschließlich für Backups."
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
    "question": "Warum kann mehr RAM die Systemleistung verbessern?",
    "answers": [
      "Mehr aktive Daten und Programme können im schnellen Arbeitsspeicher gehalten werden.",
      "Die CPU erhöht dadurch automatisch ihren Basistakt.",
      "Die Netzwerkkarte erhält dadurch mehr MAC-Adressen.",
      "Die SSD verdoppelt dadurch ihre physische Kapazität."
    ],
    "correctAnswer": 0,
    "explanation": "Wenn weniger ausgelagert werden muss, können Programme schneller auf benötigte Daten zugreifen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-038",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bedeutet Dual Channel bei Arbeitsspeicher?",
    "answers": [
      "Zwei Speicherkanäle können parallel genutzt werden, wodurch die Speicherbandbreite steigen kann.",
      "Zwei Betriebssysteme verwenden denselben RAM unabhängig voneinander.",
      "Jedes RAM-Modul besitzt automatisch zwei CPUs.",
      "RAM wird gleichzeitig als SSD und Cache verwendet."
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
    "question": "Welche Aussage zu DDR4 und DDR5 ist korrekt?",
    "answers": [
      "Sie sind unterschiedliche RAM-Generationen und mechanisch/elektrisch nicht einfach austauschbar.",
      "DDR5 ist lediglich ein anderer Name für PCIe 5.0.",
      "DDR4 kann immer in jedem DDR5-Slot betrieben werden.",
      "DDR5 bezeichnet ausschließlich Grafikspeicher."
    ],
    "correctAnswer": 0,
    "explanation": "Mainboard und CPU müssen die jeweilige Speichergeneration unterstützen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-040",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat ein Netzteil im PC?",
    "answers": [
      "Netzspannung in geeignete Gleichspannungen für die Komponenten umwandeln.",
      "Netzwerkpakete filtern.",
      "RAM-Inhalte dauerhaft sichern.",
      "BIOS-Updates automatisch herunterladen."
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
    "question": "Warum sollte ein Netzteil nicht exakt auf die maximale Leistungsaufnahme der Komponenten dimensioniert werden?",
    "answers": [
      "Reserve für Lastspitzen, Effizienz und spätere Erweiterungen ist sinnvoll.",
      "Ein PC benötigt immer exakt doppelt so viel Leistung wie berechnet.",
      "Das Netzteil muss größer sein, damit RAM schneller läuft.",
      "Unter 100 % Auslastung kann eine CPU nicht starten."
    ],
    "correctAnswer": 0,
    "explanation": "Eine Leistungsreserve verbessert Planungssicherheit und vermeidet Betrieb am absoluten Limit.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-042",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein System benötigt unter Last etwa 500 W. Welche Wahl ist technisch am sinnvollsten, wenn rund 20 % Reserve vorgesehen sind?",
    "answers": [
      "Etwa 600 W oder etwas darüber, abhängig von Qualität und Lastprofil.",
      "Exakt 500 W, weil Reserve die Effizienz immer verschlechtert.",
      "250 W, weil das Netzteil Leistung nur bei Bedarf verdoppelt.",
      "1000 W zwingend, unabhängig von Komponenten und Effizienz."
    ],
    "correctAnswer": 0,
    "explanation": "500 W × 1,2 = 600 W. In der Praxis werden auch Qualität, Anschlüsse und Lastspitzen berücksichtigt.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-043",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Speicherart ist typischerweise schneller?",
    "answers": [
      "NVMe-SSD über PCIe",
      "SATA-HDD",
      "Optische DVD",
      "USB-2.0-Stick"
    ],
    "correctAnswer": 0,
    "explanation": "NVMe-SSDs nutzen PCIe und erreichen deutlich höhere Datenraten und geringere Latenzen als HDDs.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-044",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein wesentlicher Unterschied zwischen SATA-SSD und NVMe-SSD?",
    "answers": [
      "NVMe nutzt typischerweise PCIe und ein für Flash optimiertes Protokoll, SATA-SSDs nutzen die SATA-Schnittstelle.",
      "SATA-SSDs sind immer mechanische Festplatten.",
      "NVMe ist ausschließlich ein Dateisystem.",
      "SATA ist nur für RAM-Module vorgesehen."
    ],
    "correctAnswer": 0,
    "explanation": "NVMe ist ein Protokoll für nichtflüchtigen Speicher, meist über PCIe; SATA ist eine andere Schnittstelle/protokolltechnische Plattform.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-045",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was beschreibt M.2 am treffendsten?",
    "answers": [
      "Einen Formfaktor bzw. Steckverbinderstandard, über den verschiedene Schnittstellen möglich sind.",
      "Ein Dateisystem für SSDs.",
      "Eine RAID-Stufe.",
      "Eine CPU-Befehlssatzerweiterung."
    ],
    "correctAnswer": 0,
    "explanation": "M.2 beschreibt Bauform und Anschluss; M.2-Geräte können je nach Plattform z. B. SATA oder PCIe/NVMe nutzen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-046",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Warum ist 'M.2 = NVMe' technisch ungenau?",
    "answers": [
      "Weil M.2 ein Formfaktor ist und M.2-Laufwerke auch andere Schnittstellen wie SATA nutzen können.",
      "Weil NVMe nur für Arbeitsspeicher verwendet wird.",
      "Weil M.2 ausschließlich WLAN-Karten bezeichnet.",
      "Weil NVMe ein Dateisystem und M.2 ein Betriebssystem ist."
    ],
    "correctAnswer": 0,
    "explanation": "Formfaktor und Protokoll/Schnittstelle sind verschiedene Ebenen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-047",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat UEFI/BIOS beim Start eines PCs?",
    "answers": [
      "Hardware initialisieren und den Bootvorgang vorbereiten.",
      "Alle Benutzerdateien dauerhaft speichern.",
      "Nur Netzwerkports freigeben.",
      "Jede Anwendung des Betriebssystems kompilieren."
    ],
    "correctAnswer": 0,
    "explanation": "Firmware initialisiert Hardware, führt grundlegende Prüfungen aus und startet anschließend einen Bootloader.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-048",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist Secure Boot?",
    "answers": [
      "Eine UEFI-Funktion, die den Start nicht vertrauenswürdiger Boot-Komponenten erschweren soll.",
      "Eine Funktion, die jede SSD automatisch verschlüsselt.",
      "Ein RAID-Modus zur Datenspiegelung.",
      "Eine Firewall-Regel ausschließlich für TCP 443."
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
      "Kryptografische Schlüssel und vertrauenswürdige Plattformfunktionen unterstützen.",
      "Die CPU dauerhaft übertakten.",
      "Die Netzwerkkarte mit einer öffentlichen IP versehen.",
      "RAM-Fehler durch Parität ersetzen."
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
    "question": "Welche Aussage zu PCIe-Lanes ist korrekt?",
    "answers": [
      "Mehr Lanes können eine höhere mögliche Datenbandbreite einer Verbindung bereitstellen.",
      "Eine x16-Verbindung besitzt immer exakt 16 GB RAM.",
      "PCIe-Lanes bestimmen ausschließlich die CPU-Kernzahl.",
      "Eine x4-Verbindung ist mechanisch immer größer als x16."
    ],
    "correctAnswer": 0,
    "explanation": "PCIe x1/x4/x8/x16 beschreibt die Anzahl genutzter Datenlanes.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-051",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Warum kann eine PCIe-5.0-x16-Grafikkarte auch in einem PCIe-4.0-x16-Slot funktionieren?",
    "answers": [
      "PCIe ist in der Regel generationsübergreifend abwärtskompatibel, dann aber mit der niedrigeren Link-Geschwindigkeit.",
      "Die Grafikkarte schaltet automatisch auf SATA um.",
      "PCIe 5.0 verwendet keine elektrischen Kontakte.",
      "PCIe-Versionen sind nur Marketingnamen ohne technische Unterschiede."
    ],
    "correctAnswer": 0,
    "explanation": "PCIe-Geräte und Slots handeln normalerweise eine gemeinsam unterstützte Generation und Lane-Konfiguration aus.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-052",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist die Hauptaufgabe einer GPU?",
    "answers": [
      "Grafik- und stark parallelisierbare Berechnungen beschleunigen.",
      "IP-Adressen vergeben.",
      "Dateisysteme formatieren.",
      "BIOS-Passwörter speichern."
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
      "Damit Grafikdaten und Rechenressourcen schnell lokal verfügbar sind.",
      "Damit die CPU keinen Arbeitsspeicher mehr benötigt.",
      "Damit die Netzwerkkarte keine MAC-Adresse braucht.",
      "Damit UEFI ohne Mainboard starten kann."
    ],
    "correctAnswer": 0,
    "explanation": "VRAM speichert u. a. Texturen, Framebuffer und Daten für GPU-Berechnungen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-054",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein CPU-Kern?",
    "answers": [
      "Eine eigenständige Ausführungseinheit innerhalb eines Prozessors.",
      "Ein Steckplatz für RAM.",
      "Eine Partition auf einer SSD.",
      "Ein Netzwerkport auf dem Mainboard."
    ],
    "correctAnswer": 0,
    "explanation": "Mehrere Kerne ermöglichen echte parallele Verarbeitung mehrerer Threads.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-055",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was beschreibt ein CPU-Thread im Kontext von SMT/Hyper-Threading?",
    "answers": [
      "Einen logischen Ausführungskontext, von denen ein Kern mehrere bereitstellen kann.",
      "Ein physisches Stromkabel der CPU.",
      "Einen RAM-Kanal.",
      "Eine BIOS-Partition."
    ],
    "correctAnswer": 0,
    "explanation": "SMT stellt pro physischem Kern mehrere logische Prozessoren bereit.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-056",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Warum ist doppelte Kernzahl nicht automatisch doppelte Anwendungsleistung?",
    "answers": [
      "Nicht jede Software parallelisiert perfekt und weitere Engpässe können limitieren.",
      "Zusätzliche Kerne deaktivieren grundsätzlich den CPU-Cache.",
      "Betriebssysteme können nur einen Kern gleichzeitig verwenden.",
      "Mehr Kerne halbieren immer den RAM-Takt."
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
    "question": "Welche Aufgabe hat CPU-Cache?",
    "answers": [
      "Häufig benötigte Daten und Instruktionen sehr schnell nahe an den CPU-Kernen bereitstellen.",
      "Benutzerdateien dauerhaft archivieren.",
      "DNS-Anfragen speichern.",
      "VLAN-Konfigurationen zwischen Switches verteilen."
    ],
    "correctAnswer": 0,
    "explanation": "Cache reduziert die durchschnittliche Wartezeit auf Daten aus dem langsameren Hauptspeicher.",
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
      "Automatisches Cloud-Backup."
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
    "question": "Welche Aussage zu RAID und Backup ist korrekt?",
    "answers": [
      "RAID ersetzt kein Backup.",
      "RAID 1 schützt zuverlässig vor versehentlichem Löschen und Ransomware.",
      "Jedes RAID speichert automatisch eine Offsite-Kopie.",
      "Backup ist bei RAID 5 technisch unmöglich."
    ],
    "correctAnswer": 0,
    "explanation": "RAID erhöht je nach Stufe Verfügbarkeit oder Leistung, schützt aber nicht vor allen Datenverlustursachen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-061",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
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
    "question": "Welche Kapazität ist bei RAID 5 mit drei gleich großen 2-TB-Laufwerken ungefähr nutzbar?",
    "answers": [
      "2 TB",
      "4 TB",
      "6 TB",
      "8 TB"
    ],
    "correctAnswer": 1,
    "explanation": "Bei drei gleich großen Laufwerken entspricht die nutzbare Kapazität ungefähr (n−1) × Laufwerksgröße = 4 TB.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-063",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Hauptfunktion hat eine USV?",
    "answers": [
      "Bei Stromausfall kurzfristig Energie bereitstellen und Systeme geordnet weiterbetreiben bzw. herunterfahren lassen.",
      "Die CPU dauerhaft übertakten.",
      "Die Internetbandbreite verdoppeln.",
      "SSD-Fragmentierung verhindern."
    ],
    "correctAnswer": 0,
    "explanation": "Eine USV schützt vor Stromausfällen und je nach Typ auch vor weiteren Netzstörungen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-064",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum ist Kühlung für CPU und GPU wichtig?",
    "answers": [
      "Hohe Temperaturen können zu Drosselung, Instabilität und langfristiger Belastung führen.",
      "Nur gekühlte Komponenten erhalten eine IP-Adresse.",
      "Kühlung erhöht automatisch die SSD-Kapazität.",
      "Ohne Lüfter können Dateisysteme keine Rechte verwalten."
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
      "Mikroskopische Unebenheiten füllen und den Wärmeübergang verbessern.",
      "Die CPU elektrisch mit Strom versorgen.",
      "Die BIOS-Konfiguration speichern.",
      "Die Lüfterdrehzahl per Netzwerk steuern."
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
      "Ein thermischer Auslegungswert, der bei der Kühlungsplanung hilft.",
      "Die maximale SSD-Kapazität.",
      "Die Anzahl der PCIe-Lanes.",
      "Die garantierte tatsächliche Leistungsaufnahme in jedem Szenario."
    ],
    "correctAnswer": 0,
    "explanation": "TDP ist kein universell identischer Messwert für reale Spitzenaufnahme, sondern primär ein thermischer Planungswert.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-067",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bedeutet ECC-RAM?",
    "answers": [
      "Arbeitsspeicher, der bestimmte Speicherfehler erkennen und teilweise korrigieren kann.",
      "RAM mit integriertem Grafikprozessor.",
      "RAM, der ausschließlich über PCIe arbeitet.",
      "Ein Dateisystem für Server."
    ],
    "correctAnswer": 0,
    "explanation": "ECC wird häufig in Servern und Workstations eingesetzt, wenn Datenintegrität besonders wichtig ist.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-068",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Welche Komponente bestimmt maßgeblich, welche CPU in ein Mainboard passt?",
    "answers": [
      "CPU-Sockel und Chipsatz-/Firmware-Unterstützung.",
      "Die Anzahl der USB-Ports.",
      "Die Farbe des RAM-Slots.",
      "Die Größe der SSD-Partition."
    ],
    "correctAnswer": 0,
    "explanation": "Sockel, Chipsatz und BIOS/UEFI-Unterstützung müssen zur CPU passen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-069",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aussage zur 80-PLUS-Zertifizierung eines Netzteils ist korrekt?",
    "answers": [
      "Sie bezieht sich auf definierte Wirkungsgradanforderungen, nicht direkt auf Gesamtqualität oder maximale Leistung.",
      "Sie garantiert, dass das Netzteil exakt 80 % seiner Nennleistung liefert.",
      "Sie beschreibt die Anzahl verfügbarer PCIe-Lanes.",
      "Sie bedeutet, dass ein Netzteil mindestens 80 Jahre hält."
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
    "question": "Warum ist ein dynamisch wachsendes VHDX in Hyper-V praktisch?",
    "answers": [
      "Die Datei wächst mit dem tatsächlich benötigten Speicher bis zur Maximalgröße.",
      "Sie verwendet nie physischen Speicherplatz.",
      "Sie ist grundsätzlich schneller als jede feste virtuelle Festplatte.",
      "Sie kann ohne Host-Dateisystem betrieben werden."
    ],
    "correctAnswer": 0,
    "explanation": "Dynamische virtuelle Datenträger sparen zunächst Speicherplatz und wachsen bei Bedarf.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-071",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Was ist der Unterschied zwischen einem Hyper-V-Checkpoint und einem vollständigen Backup?",
    "answers": [
      "Ein Checkpoint ist primär ein kurzfristiger VM-Zustandspunkt und ersetzt kein unabhängiges Backup.",
      "Ein Checkpoint ist immer eine vollständige Offsite-Kopie.",
      "Ein Backup kann keine VM-Dateien enthalten.",
      "Checkpoints funktionieren nur bei ausgeschalteten VMs."
    ],
    "correctAnswer": 0,
    "explanation": "Checkpoints sind nützlich für Tests und Rücksetzpunkte, aber kein Ersatz für eine getrennte Backupstrategie.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-072",
    "category": "Hardware",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist die Aufgabe von Sysprep bei Windows-Images?",
    "answers": [
      "Eine Windows-Installation für Generalisierung, Imaging und erneute Bereitstellung vorbereiten.",
      "Die SSD physisch formatieren.",
      "IPv6 vollständig deaktivieren.",
      "Eine VM in ein VLAN konvertieren."
    ],
    "correctAnswer": 0,
    "explanation": "Sysprep kann systemspezifische Informationen generalisieren und eine Installation für Deployment vorbereiten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-073",
    "category": "Hardware",
    "topic": null,
    "difficulty": "hard",
    "question": "Warum ist es problematisch, viele identische Windows-VMs nur durch simples Kopieren ohne Generalisierung zu verteilen?",
    "answers": [
      "Systemspezifische Identitäten und Konfigurationen können unerwünscht dupliziert werden.",
      "Windows erkennt dann grundsätzlich keine CPU mehr.",
      "Hyper-V erlaubt nur eine VM pro Host.",
      "Kopierte VMs können keine virtuellen Netzwerkkarten besitzen."
    ],
    "correctAnswer": 0,
    "explanation": "Für sauberes Deployment wird ein generalisiertes Image bzw. geeigneter Klon-/Deployment-Prozess verwendet.",
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
    "question": "Welche Aufgabe übernimmt die CPU in einem Arbeitsplatzrechner hauptsächlich?",
    "answers": [
      "Sie führt Befehle aus und verarbeitet Daten",
      "Sie speichert Dateien dauerhaft auf Flash-Speicher",
      "Sie versorgt alle Komponenten direkt mit Netzspannung",
      "Sie stellt die Bildausgabe ohne weitere Hardware bereit"
    ],
    "correctAnswer": 0,
    "explanation": "Die CPU verarbeitet Programmbefehle und führt Rechen- und Steueroperationen aus.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-076",
    "category": "Hardware",
    "topic": "CPU",
    "difficulty": "medium",
    "question": "Was beschreibt die Taktfrequenz eines Prozessors am ehesten?",
    "answers": [
      "Die maximale Größe des Arbeitsspeichers",
      "Die Anzahl der Taktzyklen pro Sekunde",
      "Die Breite des PCIe-Steckplatzes",
      "Die dauerhafte Schreibrate einer SSD"
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
      "Alle Programme benötigen dadurch nur einen Thread",
      "Der Arbeitsspeicher wird dadurch nicht mehr benötigt",
      "Mehrere Aufgaben lassen sich parallel bearbeiten",
      "Die Leistungsaufnahme sinkt grundsätzlich auf null"
    ],
    "correctAnswer": 2,
    "explanation": "Mehrere Kerne können verschiedene Threads oder Prozesse gleichzeitig bearbeiten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-078",
    "category": "Hardware",
    "topic": "CPU",
    "difficulty": "hard",
    "question": "Warum lässt sich die Leistung zweier CPUs nicht allein anhand ihrer GHz-Zahl vergleichen?",
    "answers": [
      "Die GHz-Zahl gilt nur für Festplatten und nicht für Prozessoren",
      "Jede CPU führt pro Takt immer exakt gleich viele Befehle aus",
      "Die Taktfrequenz wird ausschließlich durch den Arbeitsspeicher bestimmt",
      "Architektur, IPC und Kernzahl beeinflussen die Leistung ebenfalls"
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
    "question": "Wozu dient der Cache eines Prozessors?",
    "answers": [
      "Häufig benötigte Daten besonders schnell bereitzuhalten",
      "Große Benutzerdateien dauerhaft zu archivieren",
      "Netzwerkadressen für andere Rechner zu vergeben",
      "Die Ausgangsspannung des Netzteils zu stabilisieren"
    ],
    "correctAnswer": 0,
    "explanation": "CPU-Cache ist kleiner, aber sehr schneller Speicher nahe an den Recheneinheiten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-080",
    "category": "Hardware",
    "topic": "CPU",
    "difficulty": "medium",
    "question": "Was bedeutet SMT bzw. Hyper-Threading vereinfacht?",
    "answers": [
      "Mehrere Mainboards teilen sich denselben Prozessor",
      "Ein physischer Kern kann mehrere Threads verwalten",
      "Der Prozessor arbeitet nur noch mit halbem Takt",
      "Jeder Thread erhält automatisch einen eigenen CPU-Kern"
    ],
    "correctAnswer": 1,
    "explanation": "SMT erlaubt einem physischen Kern, mehrere Ausführungsthreads zu verwalten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-081",
    "category": "Hardware",
    "topic": "Mainboard",
    "difficulty": "medium",
    "question": "Welche Aufgabe hat das Mainboard?",
    "answers": [
      "Es ersetzt den Massenspeicher für Benutzerdaten",
      "Es erzeugt die Netzspannung für externe Geräte",
      "Es verbindet und koordiniert die zentralen Hardwarekomponenten",
      "Es übernimmt ausschließlich die Audioausgabe"
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
    "question": "Warum muss der CPU-Sockel zum Prozessor passen?",
    "answers": [
      "Nur dadurch erhält die SSD genügend Speicherplatz",
      "Nur dadurch kann der Monitor die Auflösung erkennen",
      "Der Sockel bestimmt ausschließlich die Gehäusefarbe",
      "Mechanische und elektrische Schnittstelle müssen kompatibel sein"
    ],
    "correctAnswer": 3,
    "explanation": "Eine CPU benötigt einen passenden Sockel und Chipsatz beziehungsweise Firmware-Unterstützung.",
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
    "question": "Was bedeutet bei PCI Express die Angabe x4 oder x16?",
    "answers": [
      "Sie beschreibt die Zahl der CPU-Kerne",
      "Sie beschreibt die Anzahl der nutzbaren Daten-Lanes",
      "Sie beschreibt die Ausgangsspannung des Netzteils",
      "Sie beschreibt die Größe eines RAM-Moduls in Gigabyte"
    ],
    "correctAnswer": 1,
    "explanation": "Die Lane-Anzahl beeinflusst die maximal verfügbare PCIe-Bandbreite.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-085",
    "category": "Hardware",
    "topic": "Mainboard",
    "difficulty": "hard",
    "question": "Eine PCIe-x16-Karte steckt mechanisch in einem x16-Slot, der elektrisch nur mit x4 angebunden ist. Was ist die wahrscheinlichste Folge?",
    "answers": [
      "Die Karte erhält automatisch viermal mehr elektrische Leistung",
      "Der Steckplatz wird dadurch in einen SATA-Anschluss umgewandelt",
      "Die Karte kann funktionieren, besitzt aber weniger maximale Bandbreite",
      "Die Karte arbeitet zwingend mit vierfacher Taktfrequenz"
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
    "question": "Welche Eigenschaft unterscheidet RAM grundlegend von einer SSD?",
    "answers": [
      "RAM speichert Daten dauerhaft über viele Jahre",
      "RAM verwendet ausschließlich SATA als Schnittstelle",
      "RAM ist grundsätzlich langsamer als eine Festplatte",
      "RAM verliert seinen Inhalt normalerweise ohne Strom"
    ],
    "correctAnswer": 3,
    "explanation": "Arbeitsspeicher ist flüchtig und dient der schnellen temporären Datenhaltung.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-087",
    "category": "Hardware",
    "topic": "Arbeitsspeicher",
    "difficulty": "medium",
    "question": "Was kann passieren, wenn für laufende Programme zu wenig RAM verfügbar ist?",
    "answers": [
      "Das System lagert häufiger Daten auf Massenspeicher aus",
      "Die CPU erhält automatisch zusätzliche physische Kerne",
      "Der Monitor reduziert dauerhaft seine native Auflösung",
      "Das Mainboard deaktiviert sämtliche USB-Anschlüsse"
    ],
    "correctAnswer": 0,
    "explanation": "Bei RAM-Mangel kann das Betriebssystem Auslagerungsspeicher verwenden, was meist langsamer ist.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-088",
    "category": "Hardware",
    "topic": "Arbeitsspeicher",
    "difficulty": "medium",
    "question": "Was bedeutet Dual-Channel bei Arbeitsspeicher?",
    "answers": [
      "Zwei Betriebssysteme teilen sich ein RAM-Modul",
      "Zwei Speicherkanäle können parallel genutzt werden",
      "Jedes Modul besitzt automatisch doppelte Kapazität",
      "Der RAM arbeitet nur mit zwei verschiedenen Spannungen"
    ],
    "correctAnswer": 1,
    "explanation": "Dual-Channel erhöht die mögliche Speicherbandbreite durch parallele Kanäle.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-089",
    "category": "Hardware",
    "topic": "Arbeitsspeicher",
    "difficulty": "medium",
    "question": "Welche Konfiguration begünstigt typischerweise Dual-Channel-Betrieb?",
    "answers": [
      "Ein einzelnes Modul in einem beliebigen Steckplatz",
      "Vier unterschiedliche Module mit beliebigen Taktraten",
      "Zwei passende Module in den vorgesehenen Speicherkanälen",
      "Ein RAM-Modul zusammen mit einer NVMe-SSD"
    ],
    "correctAnswer": 2,
    "explanation": "Für Dual-Channel werden üblicherweise passende Module in den vom Mainboard vorgesehenen Slots verwendet.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-090",
    "category": "Hardware",
    "topic": "Arbeitsspeicher",
    "difficulty": "medium",
    "question": "Was beschreibt die RAM-Kapazität in GB?",
    "answers": [
      "Wie schnell die CPU ihren Basistakt verändert",
      "Wie viele Netzwerkgeräte angeschlossen werden dürfen",
      "Wie hoch die Ausgangsleistung des Netzteils ist",
      "Wie viele Daten gleichzeitig im Arbeitsspeicher gehalten werden können"
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
    "question": "Welcher Vorteil einer SSD gegenüber einer HDD ist typisch?",
    "answers": [
      "Deutlich geringere Zugriffszeiten",
      "Mechanische Schreibköpfe mit höherer Präzision",
      "Unbegrenzte Anzahl möglicher Schreibvorgänge",
      "Immer niedrigere Kosten pro Terabyte"
    ],
    "correctAnswer": 0,
    "explanation": "SSDs haben keine mechanischen Suchbewegungen und bieten daher sehr kurze Zugriffszeiten.",
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
    "question": "Welche Schnittstelle wird häufig von 2,5-Zoll-SATA-SSDs verwendet?",
    "answers": [
      "DIMM",
      "HDMI",
      "SATA",
      "RJ45"
    ],
    "correctAnswer": 2,
    "explanation": "2,5-Zoll-SSDs verwenden häufig SATA für Daten und einen passenden Stromanschluss.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-094",
    "category": "Hardware",
    "topic": "Massenspeicher",
    "difficulty": "medium",
    "question": "Was ist ein typischer Vorteil einer NVMe-SSD gegenüber einer SATA-SSD?",
    "answers": [
      "Sie benötigt zwingend rotierende Magnetscheiben",
      "Sie arbeitet ausschließlich über einen USB-2.0-Bus",
      "Sie besitzt grundsätzlich mehr Speicherzellen pro Gigabyte",
      "Sie kann über PCIe deutlich höhere Datenraten erreichen"
    ],
    "correctAnswer": 3,
    "explanation": "NVMe-SSDs nutzen PCIe und umgehen die Bandbreitengrenzen klassischer SATA-Verbindungen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-095",
    "category": "Hardware",
    "topic": "Massenspeicher",
    "difficulty": "hard",
    "question": "Warum bedeutet M.2 nicht automatisch NVMe?",
    "answers": [
      "M.2 beschreibt die Bauform, während verschiedene Schnittstellen möglich sind",
      "M.2 bezeichnet ausschließlich ein Dateisystem für SSDs",
      "M.2 legt nur die Kapazität und nicht die Bauform fest",
      "M.2 ist ein Protokoll, das ausschließlich HDDs verwenden"
    ],
    "correctAnswer": 0,
    "explanation": "M.2 ist ein Formfaktor; M.2-Laufwerke können je nach Gerät beispielsweise SATA oder PCIe/NVMe nutzen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-096",
    "category": "Hardware",
    "topic": "RAID",
    "difficulty": "medium",
    "question": "Welches Ziel hat RAID 1 hauptsächlich?",
    "answers": [
      "Kapazität ohne Redundanz maximal zu bündeln",
      "Daten durch Spiegelung redundant vorzuhalten",
      "Arbeitsspeicher auf zwei Kanäle aufzuteilen",
      "Netzwerkpakete auf mehrere Ports zu verteilen"
    ],
    "correctAnswer": 1,
    "explanation": "RAID 1 speichert identische Daten auf mindestens zwei Laufwerken.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-097",
    "category": "Hardware",
    "topic": "RAID",
    "difficulty": "medium",
    "question": "Welche Eigenschaft trifft auf RAID 0 zu?",
    "answers": [
      "Spiegelung aller Daten auf jedem Laufwerk",
      "Toleranz gegen den Ausfall eines beliebigen Laufwerks",
      "Hohe nutzbare Kapazität ohne Redundanz",
      "Automatische externe Datensicherung"
    ],
    "correctAnswer": 2,
    "explanation": "RAID 0 verteilt Daten auf mehrere Laufwerke, bietet aber keine Redundanz.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-098",
    "category": "Hardware",
    "topic": "RAID",
    "difficulty": "hard",
    "question": "Warum ersetzt ein RAID keine Datensicherung?",
    "answers": [
      "Es kann grundsätzlich keine defekten Laufwerke überbrücken",
      "Es speichert Daten ausschließlich im flüchtigen Arbeitsspeicher",
      "Es verhindert jede Wiederherstellung nach einem Hardwaredefekt",
      "Es schützt nicht zuverlässig vor Löschen, Schadsoftware oder Standortverlust"
    ],
    "correctAnswer": 3,
    "explanation": "RAID erhöht Verfügbarkeit, schützt aber nicht gegen alle Ursachen von Datenverlust.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-099",
    "category": "Hardware",
    "topic": "RAID",
    "difficulty": "medium",
    "question": "Wie viel nutzbare Kapazität bietet RAID 1 mit zwei gleich großen 2-TB-Laufwerken ungefähr?",
    "answers": [
      "2 TB",
      "1 TB",
      "3 TB",
      "4 TB"
    ],
    "correctAnswer": 0,
    "explanation": "Durch Spiegelung entspricht die nutzbare Kapazität ungefähr der Kapazität eines Laufwerks.",
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
    "question": "Welche Aufgabe übernimmt eine GPU hauptsächlich?",
    "answers": [
      "Benutzerdateien dauerhaft auf Magnetplatten zu speichern",
      "Die Netzspannung in Gleichspannung umzuwandeln",
      "Grafik- und stark parallelisierbare Berechnungen auszuführen",
      "IP-Adressen an andere Geräte zu vergeben"
    ],
    "correctAnswer": 2,
    "explanation": "GPUs sind auf Grafikberechnung und viele parallele Rechenoperationen spezialisiert.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-102",
    "category": "Hardware",
    "topic": "Grafik und Display",
    "difficulty": "medium",
    "question": "Was ist VRAM?",
    "answers": [
      "Nichtflüchtiger Speicher für UEFI-Einstellungen",
      "Virtueller Speicher auf der System-SSD",
      "Arbeitsspeicher ausschließlich für Netzwerkpakete",
      "Speicher, den die Grafikeinheit für Grafikdaten nutzt"
    ],
    "correctAnswer": 3,
    "explanation": "VRAM hält unter anderem Texturen, Framebuffer und weitere Grafikdaten.",
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
    "question": "Welche Schnittstelle ist bei PC-Monitoren besonders für hohe Auflösungen und Bildraten verbreitet?",
    "answers": [
      "Parallelport-Anschluss",
      "DisplayPort-Anschluss",
      "PS/2-Anschluss",
      "SATA-Anschluss"
    ],
    "correctAnswer": 1,
    "explanation": "DisplayPort ist für moderne Monitore mit hohen Auflösungen und Bildraten weit verbreitet.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-105",
    "category": "Hardware",
    "topic": "Grafik und Display",
    "difficulty": "medium",
    "question": "Ein Monitor unterstützt 144 Hz, läuft aber nur mit 60 Hz. Was sollte zuerst geprüft werden?",
    "answers": [
      "Ob die System-SSD im richtigen Dateisystem formatiert wurde",
      "Ob der Arbeitsspeicher eine gerade Kapazität in GB besitzt",
      "Einstellung, Kabel und Anschluss auf Unterstützung der gewünschten Bildrate",
      "Ob der Druckertreiber auf dem neuesten Stand ist"
    ],
    "correctAnswer": 2,
    "explanation": "Bildrate hängt unter anderem von Anzeigeeinstellung, Grafikausgang, Kabel und Monitorfähigkeiten ab.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-106",
    "category": "Hardware",
    "topic": "Netzteil und Energie",
    "difficulty": "medium",
    "question": "Welche Aufgabe hat ein PC-Netzteil?",
    "answers": [
      "Alle Programmdaten dauerhaft zu speichern",
      "Die Netzwerkkonfiguration des Betriebssystems zu verwalten",
      "Die Bildschirmauflösung automatisch festzulegen",
      "Netzspannung in geeignete Gleichspannungen für Komponenten umzuwandeln"
    ],
    "correctAnswer": 3,
    "explanation": "Das Netzteil versorgt interne Komponenten mit den benötigten Gleichspannungen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-107",
    "category": "Hardware",
    "topic": "Netzteil und Energie",
    "difficulty": "medium",
    "question": "Warum sollte ein Netzteil nicht nur exakt nach der typischen Leistungsaufnahme dimensioniert werden?",
    "answers": [
      "Lastspitzen und zukünftige Erweiterungen benötigen Reserve",
      "Ein Netzteil liefert grundsätzlich immer exakt seine Nennleistung",
      "Reserve reduziert automatisch die Speicherkapazität des Systems",
      "Ohne Reserve kann das Betriebssystem keine Updates installieren"
    ],
    "correctAnswer": 0,
    "explanation": "Eine sinnvolle Leistungsreserve berücksichtigt Lastspitzen und Erweiterungen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-108",
    "category": "Hardware",
    "topic": "Netzteil und Energie",
    "difficulty": "medium",
    "question": "Ein System benötigt unter Volllast etwa 400 W. Welche Netzteilwahl ist unter sonst gleichen Bedingungen plausibler?",
    "answers": [
      "Ein 250-W-Netzteil mit möglichst vielen Adaptern",
      "Ein hochwertiges 550-W-Netzteil mit ausreichenden Anschlüssen",
      "Ein 400-W-Netzteil ohne Leistungsreserve und ohne Zertifizierung",
      "Ein 2000-W-Netzteil unabhängig von Effizienz und Lastbereich"
    ],
    "correctAnswer": 1,
    "explanation": "Ein moderater Sicherheits- und Erweiterungsspielraum ist sinnvoll; extreme Überdimensionierung ist nicht automatisch besser.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-109",
    "category": "Hardware",
    "topic": "Netzteil und Energie",
    "difficulty": "medium",
    "question": "Was beschreibt der Wirkungsgrad eines Netzteils?",
    "answers": [
      "Das Verhältnis von RAM-Kapazität zu SSD-Kapazität",
      "Die Zahl der Lüfter pro installiertem Prozessor",
      "Das Verhältnis von abgegebener Nutzleistung zu aufgenommener Leistung",
      "Die Geschwindigkeit der Datenübertragung über PCIe"
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
      "Die SSD erhält automatisch eine höhere Datenrate",
      "Die CPU bekommt zusätzliche Prozessorkerne",
      "Der Monitor erhöht selbstständig die Auflösung",
      "Mehr elektrische Energie wird als Verlustwärme umgesetzt"
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
    "question": "Warum benötigt eine leistungsfähige CPU einen geeigneten Kühler?",
    "answers": [
      "Damit entstehende Wärme zuverlässig abgeführt wird",
      "Damit die CPU permanent Daten speichern kann",
      "Damit der Arbeitsspeicher als SSD verwendet wird",
      "Damit Netzwerkpakete schneller geroutet werden"
    ],
    "correctAnswer": 0,
    "explanation": "Ohne ausreichende Kühlung können Temperaturen steigen und Leistung oder Stabilität leiden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-112",
    "category": "Hardware",
    "topic": "Kühlung",
    "difficulty": "medium",
    "question": "Welche Aufgabe hat Wärmeleitpaste zwischen CPU und Kühler?",
    "answers": [
      "Den Prozessor elektrisch mit Netzspannung zu versorgen",
      "Kleine Unebenheiten zu füllen und den Wärmeübergang zu verbessern",
      "Die CPU dauerhaft mit dem Sockel zu verkleben",
      "Die Luftfeuchtigkeit im Gehäuse zu regulieren"
    ],
    "correctAnswer": 1,
    "explanation": "Wärmeleitpaste verbessert den thermischen Kontakt zwischen den Oberflächen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-113",
    "category": "Hardware",
    "topic": "Kühlung",
    "difficulty": "medium",
    "question": "Was ist ein typisches Ziel eines sinnvollen Airflows im PC-Gehäuse?",
    "answers": [
      "Alle Lüfter gegeneinander in die Mitte blasen lassen",
      "Warme Luft ausschließlich im Gehäuse zirkulieren lassen",
      "Kühle Luft zuführen und erwärmte Luft abführen",
      "Jede Öffnung des Gehäuses vollständig verschließen"
    ],
    "correctAnswer": 2,
    "explanation": "Ein gerichteter Luftstrom unterstützt die Wärmeabfuhr.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-114",
    "category": "Hardware",
    "topic": "Kühlung",
    "difficulty": "hard",
    "question": "Ein PC wird unter Last laut und die CPU taktet deutlich herunter. Welche Ursache ist besonders plausibel?",
    "answers": [
      "Der Monitor verwendet eine zu niedrige Bildwiederholrate",
      "Die SSD besitzt zu viel freien Speicherplatz",
      "Das Netzwerkkabel unterstützt eine zu hohe Datenrate",
      "Die CPU erreicht eine Temperaturgrenze und drosselt"
    ],
    "correctAnswer": 3,
    "explanation": "Thermal Throttling reduziert Takt und Leistung zum Schutz vor Überhitzung.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-115",
    "category": "Hardware",
    "topic": "Kühlung",
    "difficulty": "medium",
    "question": "Warum sollte ein Kühlkörper regelmäßig von starkem Staub befreit werden?",
    "answers": [
      "Staub kann Luftstrom und Wärmeabgabe verschlechtern",
      "Staub erhöht grundsätzlich die Kapazität des Arbeitsspeichers",
      "Staub verbessert automatisch den Wirkungsgrad des Netzteils",
      "Staub vergrößert die maximale PCIe-Bandbreite"
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
    "question": "Welche Aussage zu USB-C ist korrekt?",
    "answers": [
      "Jeder USB-C-Port unterstützt automatisch Thunderbolt und Video",
      "Die Steckerform allein sagt nicht alle unterstützten Funktionen aus",
      "USB-C bezeichnet ausschließlich eine bestimmte Datenrate",
      "USB-C kann grundsätzlich keine Stromversorgung übertragen"
    ],
    "correctAnswer": 1,
    "explanation": "USB-C beschreibt zunächst den Steckertyp; Datenrate, Video und Power Delivery hängen von der Implementierung ab.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-117",
    "category": "Hardware",
    "topic": "Schnittstellen",
    "difficulty": "hard",
    "question": "Warum kann ein USB-C-Kabel trotz passender Stecker ungeeignet für einen bestimmten Einsatz sein?",
    "answers": [
      "Jedes USB-C-Kabel besitzt immer exakt dieselben elektrischen Eigenschaften",
      "USB-C-Kabel können ausschließlich zum Laden und nie für Daten genutzt werden",
      "Kabel unterscheiden sich bei Datenrate, Stromleistung und unterstützten Modi",
      "Die Eignung hängt nur von der Länge des Dateinamens ab"
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
      "Automatische Spiegelung zweier Festplatten",
      "Direkte Vergabe von IPv4-Adressen an USB-Geräte",
      "Verdopplung der Taktfrequenz angeschlossener CPUs",
      "Aushandlung höherer Lade- und Versorgungsleistungen über USB"
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
    "question": "Welche Aufgabe übernimmt UEFI beim Start eines PCs?",
    "answers": [
      "Benutzerdateien aus der Cloud synchronisieren",
      "Anwendungsprogramme dauerhaft im RAM speichern",
      "Hardware initialisieren und den Start des Betriebssystems vorbereiten",
      "Netzwerkdrucker automatisch mit Papier versorgen"
    ],
    "correctAnswer": 2,
    "explanation": "UEFI initialisiert Komponenten und startet anschließend den Bootprozess.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-122",
    "category": "Hardware",
    "topic": "Firmware und Boot",
    "difficulty": "medium",
    "question": "Wozu dient die Bootreihenfolge im UEFI?",
    "answers": [
      "Sie bestimmt die Reihenfolge geöffneter Programme im Desktop",
      "Sie legt die Sortierung der Dateien auf der SSD fest",
      "Sie steuert die Reihenfolge der Netzwerkpakete im Switch",
      "Sie legt fest, welche Startmedien zuerst geprüft werden"
    ],
    "correctAnswer": 3,
    "explanation": "Die Bootreihenfolge bestimmt, von welchem Gerät zuerst gestartet werden soll.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-123",
    "category": "Hardware",
    "topic": "Firmware und Boot",
    "difficulty": "medium",
    "question": "Was ist Secure Boot?",
    "answers": [
      "Eine UEFI-Funktion zur Prüfung vertrauenswürdiger Boot-Komponenten",
      "Ein RAID-Modus zur Spiegelung der Systemfestplatte",
      "Ein Verfahren zur Kühlung des Prozessors beim Einschalten",
      "Ein USB-Modus zum schnelleren Laden externer Geräte"
    ],
    "correctAnswer": 0,
    "explanation": "Secure Boot prüft signierte und vertrauenswürdige Komponenten des Startvorgangs.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-124",
    "category": "Hardware",
    "topic": "Firmware und Boot",
    "difficulty": "medium",
    "question": "Wofür wird ein TPM häufig eingesetzt?",
    "answers": [
      "Zur Erweiterung der Anzahl verfügbarer CPU-Kerne",
      "Zur sicheren Speicherung kryptografischer Schlüssel und Messwerte",
      "Zur Erhöhung der maximalen SATA-Datenrate",
      "Zur Kühlung von Spannungswandlern auf dem Mainboard"
    ],
    "correctAnswer": 1,
    "explanation": "Ein TPM unterstützt hardwaregestützte Sicherheitsfunktionen wie Schlüsselverwaltung und Plattformmessungen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-125",
    "category": "Hardware",
    "topic": "Firmware und Boot",
    "difficulty": "medium",
    "question": "Ein PC startet nach einer Änderung der Bootreihenfolge vom falschen Datenträger. Welche Maßnahme ist naheliegend?",
    "answers": [
      "Die Bildschirmauflösung im Betriebssystem reduzieren",
      "Den Arbeitsspeicher auf Single-Channel umstellen",
      "Die Priorität der Bootgeräte im UEFI korrigieren",
      "Die Maus an einen anderen USB-Port anschließen"
    ],
    "correctAnswer": 2,
    "explanation": "Die Startreihenfolge wird in der Firmwarekonfiguration angepasst.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-126",
    "category": "Hardware",
    "topic": "Peripherie",
    "difficulty": "medium",
    "question": "Was ist ein Eingabegerät?",
    "answers": [
      "Ein Gerät zur dauerhaften Spannungsversorgung des Mainboards",
      "Ein Gerät zur Speicherung von Firmware auf dem Prozessor",
      "Ein Gerät zur Verteilung von Netzwerkadressen",
      "Ein Gerät zur Übermittlung von Benutzereingaben an den Rechner"
    ],
    "correctAnswer": 3,
    "explanation": "Tastaturen, Mäuse, Scanner und ähnliche Geräte liefern Eingaben an ein Computersystem.",
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
    "question": "Für ein Büro mit hohem monatlichem Textdruckvolumen ist welche Eigenschaft besonders wichtig?",
    "answers": [
      "Maximale Anzahl farbiger Gehäuse-LEDs",
      "Möglichst kleine Bildschirmdiagonale am Drucker",
      "Geeignete Druckleistung und wirtschaftliche Seitenkosten",
      "Eine besonders hohe Maus-Abtastrate"
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
      "Es erhöht automatisch die Bildschirmauflösung",
      "Es ersetzt die Netzwerkkarte des Rechners",
      "Es verdoppelt die verfügbare SSD-Kapazität",
      "Es kann Umgebungsgeräusche bei Sprachaufnahme reduzieren"
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
    "question": "Welche Aufgabe hat ein Switch in einem lokalen Ethernet-Netz?",
    "answers": [
      "Frames anhand von MAC-Adressen gezielt weiterzuleiten",
      "Domains automatisch in IP-Adressen umzuwandeln",
      "Dateien dauerhaft redundant zu speichern",
      "Netzspannung für alle PCs zu erzeugen"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Switch lernt MAC-Adressen und leitet Ethernet-Frames zwischen Ports weiter.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-132",
    "category": "Hardware",
    "topic": "Netzwerkhardware",
    "difficulty": "medium",
    "question": "Welche Aufgabe übernimmt ein Router typischerweise?",
    "answers": [
      "RAM-Module zwischen zwei Mainboards zu synchronisieren",
      "Pakete zwischen verschiedenen IP-Netzen weiterzuleiten",
      "Monitorsignale auf mehrere Bildschirme zu duplizieren",
      "Druckaufträge dauerhaft auf Toner zu speichern"
    ],
    "correctAnswer": 1,
    "explanation": "Router verbinden unterschiedliche IP-Netze und treffen Weiterleitungsentscheidungen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-133",
    "category": "Hardware",
    "topic": "Netzwerkhardware",
    "difficulty": "medium",
    "question": "Wozu dient ein Access Point?",
    "answers": [
      "Er ersetzt die CPU in einem Arbeitsplatzrechner",
      "Er speichert Benutzerdaten wie eine externe SSD",
      "Er ermöglicht WLAN-Geräten den Zugang zu einem Netzwerk",
      "Er wandelt SATA-Laufwerke in Arbeitsspeicher um"
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
    "difficulty": "hard",
    "question": "Ein Arbeitsplatz erreicht nur 100 Mbit/s statt 1 Gbit/s. Welche Hardwareprüfung ist sinnvoll?",
    "answers": [
      "Kabelkategorie, Adapter, Switch-Port und Aushandlung prüfen",
      "Monitorhelligkeit und Farbtiefe gemeinsam reduzieren",
      "SSD-Partition verkleinern und Papierkorb leeren",
      "CPU-Kühler drehen und Gehäuselüfter deaktivieren"
    ],
    "correctAnswer": 0,
    "explanation": "Die Link-Geschwindigkeit hängt unter anderem von Adapter, Gegenstelle und Verkabelung ab.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-136",
    "category": "Hardware",
    "topic": "Arbeitsplatzplanung",
    "difficulty": "medium",
    "question": "Welche Information sollte vor der Auswahl eines Arbeitsplatz-PCs zuerst geklärt werden?",
    "answers": [
      "Welche Gehäusefarbe im Lager am häufigsten vorhanden ist",
      "Welche Anwendungen und Anforderungen der Benutzer hat",
      "Wie viele Dateien sich bereits auf anderen PCs befinden",
      "Welche Tastatur zufällig am günstigsten angeboten wird"
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
    "question": "Ein Mitarbeiter arbeitet hauptsächlich mit Office, Browser und Videokonferenzen. Welche Priorität ist plausibel?",
    "answers": [
      "Mehrere High-End-GPUs unabhängig vom tatsächlichen Bedarf",
      "Maximale CPU-Kernzahl ohne Rücksicht auf Kosten und Verbrauch",
      "Ausgewogene Ausstattung statt einer extrem leistungsfähigen High-End-GPU",
      "Ein RAID-0-Verbund aus vielen Laufwerken nur für Textdokumente"
    ],
    "correctAnswer": 2,
    "explanation": "Die Ausstattung sollte zum Anwendungsszenario passen und wirtschaftlich dimensioniert sein.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-138",
    "category": "Hardware",
    "topic": "Arbeitsplatzplanung",
    "difficulty": "hard",
    "question": "Für einen CAD-Arbeitsplatz sind mehrere Komponentenangebote verfügbar. Welche Vorgehensweise ist am sinnvollsten?",
    "answers": [
      "Die teuersten Einzelteile unabhängig voneinander auswählen und anschließend kombinieren",
      "Nur nach dem höchsten Watt-Wert des Netzteils entscheiden",
      "Ausschließlich das optisch auffälligste Gehäuse als Auswahlkriterium verwenden",
      "Anforderungen definieren und kompatible Komponenten nach Leistung, Kosten und Support vergleichen"
    ],
    "correctAnswer": 3,
    "explanation": "Beschaffung sollte Anforderungen, Kompatibilität, Wirtschaftlichkeit und Support berücksichtigen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-139",
    "category": "Hardware",
    "topic": "Arbeitsplatzplanung",
    "difficulty": "medium",
    "question": "Warum sollte bei der Beschaffung auch die Garantie- und Supportdauer berücksichtigt werden?",
    "answers": [
      "Sie beeinflusst Ausfallrisiko, Serviceaufwand und Folgekosten",
      "Sie verändert automatisch die CPU-Architektur des Geräts",
      "Sie bestimmt die maximale Auflösung jedes Monitors",
      "Sie ersetzt sämtliche Maßnahmen zur Datensicherung"
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
      "Taktzyklen einer CPU pro Betriebssystem",
      "Gesamtkosten über Anschaffung und Nutzung hinweg",
      "Technische Kabellänge eines optischen Anschlusses",
      "Temperaturgrenze eines Computergehäuses"
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
      "Deutlich oberhalb des Kopfes",
      "Auf Höhe der Tischkante",
      "Etwa auf Augenhöhe oder leicht darunter",
      "Direkt unterhalb der Tastatur"
    ],
    "correctAnswer": 2,
    "explanation": "Eine eher gerade bis leicht nach unten gerichtete Blicklinie unterstützt ergonomisches Arbeiten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-142",
    "category": "Hardware",
    "topic": "Ergonomie",
    "difficulty": "medium",
    "question": "Warum ist ein höhenverstellbarer Monitorständer sinnvoll?",
    "answers": [
      "Die CPU erhält dadurch eine höhere Taktfrequenz",
      "Der Monitor benötigt dadurch kein Videosignal mehr",
      "Die SSD wird dadurch automatisch vor Datenverlust geschützt",
      "Bildschirmhöhe lässt sich an Benutzer und Sitzposition anpassen"
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
    "question": "Welche Maßnahme kann Blendungen auf einem Monitor reduzieren?",
    "answers": [
      "Monitor sinnvoll zur Fenster- und Lichtquelle ausrichten",
      "Bildschirm direkt gegenüber einer starken Lichtquelle platzieren",
      "Helligkeit grundsätzlich immer auf den Maximalwert setzen",
      "Den Monitor dauerhaft in einem steilen Winkel nach oben kippen"
    ],
    "correctAnswer": 0,
    "explanation": "Günstige Positionierung reduziert Reflexionen und Blendung.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-144",
    "category": "Hardware",
    "topic": "Ergonomie",
    "difficulty": "medium",
    "question": "Warum ist die passende Größe von Tastatur und Maus relevant?",
    "answers": [
      "Sie bestimmt die maximale Geschwindigkeit des Internetanschlusses",
      "Sie kann eine natürlichere Hand- und Armhaltung unterstützen",
      "Sie legt die Kapazität des Arbeitsspeichers fest",
      "Sie verändert die native Auflösung des Monitors"
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
      "Beide Monitore weit seitlich außerhalb des direkten Sichtfelds platzieren",
      "Einen Monitor direkt hinter dem anderen aufstellen",
      "Beide Monitore möglichst symmetrisch im zentralen Sichtbereich anordnen",
      "Die Monitore so hoch montieren, dass der Kopf dauerhaft angehoben wird"
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
      "Elektrostatische Entladung erhöht die Kapazität von RAM-Modulen",
      "Elektrostatische Entladung verbessert den Kontakt von PCIe-Karten",
      "Elektrostatische Entladung kalibriert automatisch Temperatursensoren",
      "Elektrostatische Entladung kann empfindliche Bauteile beschädigen"
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
      "Potentialausgleich durch geeignete ESD-Ausrüstung verwenden",
      "Komponenten auf stark statisch aufladendem Teppich ablegen",
      "Kontakte von RAM-Modulen möglichst häufig direkt berühren",
      "Das Netzteil während des Einbaus unter Last betreiben"
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
      "An beliebigen Stellen, solange der PC eingeschaltet bleibt"
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
      "PC unter Volllast weiterlaufen lassen und Lüfter blockieren",
      "Netzkabel angeschlossen lassen und Komponenten sofort herausziehen",
      "Gerät herunterfahren, Spannungsversorgung trennen und ESD-Schutz beachten",
      "Zuerst alle Datenkabel abziehen, während Dateien geschrieben werden"
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
      "Sofort das Betriebssystem vollständig neu installieren",
      "Alle Benutzerkonten des Rechners löschen",
      "Die interne SSD ohne weitere Diagnose formatieren",
      "Stromversorgung, Monitoranschluss und Eingangssignal prüfen"
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
    "question": "Ein neu eingebautes RAM-Modul wird nicht erkannt. Was sollte geprüft werden?",
    "answers": [
      "Sitz des Moduls, Slotbelegung und unterstützte Speicherspezifikation prüfen",
      "Monitoranschluss, Bildmodus und unterstützte Bildschirmauflösung prüfen",
      "Druckerwarteschlange, Treiberstatus und verfügbaren Tonervorrat prüfen",
      "Browsercache, gespeicherte Webseiten und aktive Erweiterungen prüfen"
    ],
    "correctAnswer": 0,
    "explanation": "Nicht erkannter RAM kann durch falschen Sitz, Slotwahl oder Inkompatibilität verursacht werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-152",
    "category": "Hardware",
    "topic": "Fehlersuche",
    "difficulty": "hard",
    "question": "Nach Einbau einer neuen Grafikkarte startet der PC unter Last plötzlich neu. Welche Ursache sollte geprüft werden?",
    "answers": [
      "Ob die Tastatur eine ausreichend hohe Polling-Rate besitzt",
      "Ob Netzteil, Stromstecker und Leistungsreserve zur Grafikkarte passen",
      "Ob der Drucker über genügend Papier im Fach verfügt",
      "Ob die Systemuhr auf die richtige Zeitzone eingestellt ist"
    ],
    "correctAnswer": 1,
    "explanation": "Lastabhängige Neustarts können unter anderem auf Probleme mit Stromversorgung oder Stabilität hinweisen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-153",
    "category": "Hardware",
    "topic": "Fehlersuche",
    "difficulty": "medium",
    "question": "Eine SATA-SSD wird im Betriebssystem nicht angezeigt. Welche Prüfung ist sinnvoll?",
    "answers": [
      "Monitoranschluss, Bildwiederholrate und gewählten Eingang überprüfen",
      "Mauseinstellungen, USB-Abfragerate und Zeigerbeschleunigung überprüfen",
      "Daten- und Stromanschluss, Firmware-Erkennung und Datenträgerverwaltung prüfen",
      "CPU-Kühler, Lüfterkurve und Wärmeleitpaste des Prozessors überprüfen"
    ],
    "correctAnswer": 2,
    "explanation": "Fehlende Laufwerke sollten von der physischen Verbindung über Firmware bis zur Datenträgerverwaltung geprüft werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-154",
    "category": "Hardware",
    "topic": "Fehlersuche",
    "difficulty": "medium",
    "question": "Ein USB-Gerät funktioniert an einem Port, aber nicht an einem anderen. Was liegt nahe?",
    "answers": [
      "Das gesamte Betriebssystem muss zwingend neu installiert werden",
      "Die CPU besitzt grundsätzlich zu wenige Kerne",
      "Die SSD ist automatisch vollständig verschlüsselt",
      "Der betroffene Port oder dessen Konfiguration könnte fehlerhaft sein"
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
      "Hohe Mobilität durch integrierten Akku und kompakte Bauform",
      "Grundsätzlich höhere Aufrüstbarkeit bei allen Komponenten",
      "Immer deutlich höhere Grafikleistung bei gleichem Preis",
      "Unbegrenzte Laufzeit ohne externe Energieversorgung"
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
    "question": "Warum sollte bei einem mobilen Arbeitsplatz die Akkulaufzeit berücksichtigt werden?",
    "answers": [
      "Sie bestimmt direkt die maximale SSD-Kapazität",
      "Sie beeinflusst die nutzbare Arbeitszeit ohne Netzanschluss",
      "Sie legt die Geschwindigkeit des Ethernet-Switches fest",
      "Sie ersetzt die Angabe zur Bildschirmhelligkeit vollständig"
    ],
    "correctAnswer": 1,
    "explanation": "Akkulaufzeit ist ein relevantes Auswahlkriterium für mobiles Arbeiten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-157",
    "category": "Hardware",
    "topic": "Notebooks",
    "difficulty": "medium",
    "question": "Welche Komponente ist bei vielen modernen Notebooks nur eingeschränkt austauschbar?",
    "answers": [
      "Internes Display und fest eingebaute Lautsprecher des Geräts",
      "Externe Maus und externe Tastatur am Arbeitsplatz",
      "Fest verlöteter Arbeitsspeicher oder andere integrierte Bauteile",
      "Externer Netzwerk-Switch und angeschlossenes Ethernet-Kabel"
    ],
    "correctAnswer": 2,
    "explanation": "Bei kompakten Geräten sind RAM, CPU oder Massenspeicher teilweise verlötet oder schwer zugänglich.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-158",
    "category": "Hardware",
    "topic": "Notebooks",
    "difficulty": "hard",
    "question": "Warum kann ein sehr dünnes Notebook trotz schneller CPU unter Dauerlast langsamer werden?",
    "answers": [
      "Dünne Geräte unterstützen grundsätzlich keinen Arbeitsspeicher",
      "Der Akku deaktiviert nach wenigen Minuten alle CPU-Kerne",
      "Das Display reduziert automatisch die PCIe-Bandbreite",
      "Begrenzte Kühlung kann zu thermischer Drosselung führen"
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
      "Aufrüstbare und reparierbare Komponenten berücksichtigen",
      "Geräte bei jedem kleinen Leistungsproblem vollständig ersetzen",
      "Ersatzteile grundsätzlich unabhängig von Kompatibilität auswählen",
      "Wartung und Reinigung dauerhaft vermeiden"
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
      "Effizienz erhöht automatisch die Anzahl der CPU-Kerne",
      "Stromkosten summieren sich über Gerätezahl und Nutzungsdauer",
      "Effizienz verdoppelt grundsätzlich die Lebensdauer jeder SSD",
      "Effizienz ersetzt sämtliche Kosten für Wartung und Support"
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
      "Datenträger müssen grundsätzlich funktionsfähig weitergegeben werden",
      "Akkus dürfen immer gemeinsam mit Hausmüll entsorgt werden",
      "Datenschutz und fachgerechte Entsorgung beziehungsweise Wiederverwertung",
      "Benutzerdaten müssen vor Weitergabe nicht berücksichtigt werden"
    ],
    "correctAnswer": 2,
    "explanation": "Vor Wiederverwendung oder Entsorgung müssen Daten sicher behandelt und gesetzliche Entsorgungswege beachtet werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-162",
    "category": "Hardware",
    "topic": "Nachhaltigkeit",
    "difficulty": "hard",
    "question": "Ein alter PC wird ausgemustert, die SSD enthält vertrauliche Daten. Welche Maßnahme ist geeignet?",
    "answers": [
      "Nur die Dateinamen ändern und den Datenträger anschließend weitergeben",
      "Den Desktop-Hintergrund entfernen und das Benutzerkonto umbenennen",
      "Die SSD lediglich vom SATA-Kabel trennen und unverändert verkaufen",
      "Daten nach festgelegtem Verfahren sicher löschen oder Datenträger fachgerecht vernichten"
    ],
    "correctAnswer": 3,
    "explanation": "Vertrauliche Daten müssen vor Weitergabe oder Entsorgung zuverlässig unzugänglich gemacht werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-163",
    "category": "Hardware",
    "topic": "Kompatibilität",
    "difficulty": "medium",
    "question": "Welche Komponenten müssen bei einem PC-Neubau besonders aufeinander abgestimmt sein?",
    "answers": [
      "CPU, Mainboard, RAM, Netzteil und Gehäuse",
      "Mauspad, Hintergrundbild, Lautstärke und Browserstartseite",
      "Druckerpapier, Tonerfarbe, Mauszeiger und Benutzername",
      "E-Mail-Adresse, Dateiname, Zeitzone und Desktop-Icon"
    ],
    "correctAnswer": 0,
    "explanation": "Zentrale Komponenten müssen mechanisch, elektrisch und funktional kompatibel sein.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-164",
    "category": "Hardware",
    "topic": "Kompatibilität",
    "difficulty": "medium",
    "question": "Warum muss die Länge einer Grafikkarte mit dem Gehäuse abgeglichen werden?",
    "answers": [
      "Die Länge bestimmt automatisch die Größe des Arbeitsspeichers",
      "Die Karte muss mechanisch in den verfügbaren Innenraum passen",
      "Die Länge verändert die Anzahl der CPU-Kerne",
      "Die Länge bestimmt die unterstützte Bildschirmauflösung"
    ],
    "correctAnswer": 1,
    "explanation": "Große Karten können mit Laufwerkskäfigen, Radiatoren oder Gehäusewänden kollidieren.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-165",
    "category": "Hardware",
    "topic": "Kompatibilität",
    "difficulty": "hard",
    "question": "Ein Mainboard besitzt einen M.2-Slot, aber die gewünschte SSD wird nicht erkannt. Welche Ursache ist möglich?",
    "answers": [
      "Die SSD ist zu schnell für jedes moderne Betriebssystem",
      "M.2-Laufwerke benötigen grundsätzlich einen HDMI-Anschluss",
      "Der Slot unterstützt nicht den benötigten SATA- oder PCIe-Modus",
      "Der CPU-Kühler verhindert automatisch jede M.2-Erkennung"
    ],
    "correctAnswer": 2,
    "explanation": "M.2-Slots können sich in unterstützten Protokollen und Lane-Anbindungen unterscheiden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-166",
    "category": "Hardware",
    "topic": "Kompatibilität",
    "difficulty": "medium",
    "question": "Warum sollte die maximale Kühlerhöhe des Gehäuses geprüft werden?",
    "answers": [
      "Ein hoher Kühler reduziert automatisch die SSD-Kapazität",
      "Die Kühlerhöhe bestimmt die Anzahl der Netzwerkports",
      "Die Kühlerhöhe legt die DDR-Generation des RAM fest",
      "Ein zu hoher CPU-Kühler kann mechanisch nicht ins Gehäuse passen"
    ],
    "correctAnswer": 3,
    "explanation": "Gehäuse geben einen maximal verfügbaren Raum für CPU-Kühler vor.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-167",
    "category": "Hardware",
    "topic": "Kompatibilität",
    "difficulty": "medium",
    "question": "Warum ist die Anzahl der benötigten Monitoranschlüsse vor dem Kauf wichtig?",
    "answers": [
      "Grafiklösung oder Dock müssen genügend passende Ausgänge besitzen",
      "Jeder Monitor benötigt einen eigenen CPU-Kern",
      "Die Zahl der Monitore bestimmt die SATA-Version der SSD",
      "Jeder Bildschirm benötigt einen separaten Arbeitsspeicherriegel"
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
      "Alle Diagnoseinformationen dauerhaft deaktivieren",
      "Funktion und vereinbarte Anforderungen systematisch testen",
      "Die Hardware ohne Test direkt an den Benutzer übergeben",
      "Die Firmwareeinstellungen grundsätzlich auf Zufallswerte setzen"
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
      "Inventarisierung erhöht automatisch die Rechenleistung des Systems",
      "Inventarisierung ersetzt jede Form von Datensicherung",
      "Geräte und relevante Komponenten lassen sich nachvollziehbar dokumentieren",
      "Inventarisierung legt die Bildschirmauflösung der Benutzer fest"
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
      "Nur die Farbe des Mauszeigers und die Position des Papierkorbs",
      "Nur persönliche Passwörter des Benutzers im Klartext",
      "Nur die zuletzt besuchte Webseite und Browserchronik",
      "Gerät, Konfiguration, Serien- oder Inventardaten und durchgeführte Tests"
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
      "Sie verbessert Wiederholbarkeit und reduziert vergessene Prüfschritte",
      "Sie macht technische Kenntnisse und Funktionsprüfungen vollständig überflüssig",
      "Sie sorgt unabhängig vom Inhalt automatisch für höhere Hardwareleistung",
      "Sie ersetzt sämtliche Benutzeranforderungen durch einen festen Standard"
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
      "Ausschließlich die Verpackung der Hardware ohne weitere Erklärung",
      "Kurze Einweisung in relevante Funktionen und Besonderheiten",
      "Weitergabe aller Administratorpasswörter ohne Schutzmaßnahmen",
      "Verzicht auf jede Dokumentation und Rückfragemöglichkeit"
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
      "Es verschlüsselt automatisch sämtliche Festplattendaten",
      "Es schützt Netzwerkverkehr durch TLS-Verschlüsselung",
      "Es ersetzt Benutzerkennwörter im Betriebssystem",
      "Es erschwert den physischen Diebstahl eines Geräts"
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
      "Seitliche Einsicht auf vertrauliche Bildschirminhalte wird erschwert",
      "Der Prozessor wird damit vor thermischer Überlastung geschützt",
      "Die Netzwerkkarte erhält damit eine höhere Datenrate",
      "Die SSD wird dadurch vor elektrischen Spannungsspitzen geschützt"
    ],
    "correctAnswer": 0,
    "explanation": "Privacy-Filter reduzieren die Lesbarkeit des Bildschirms aus seitlichen Blickwinkeln.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-176",
    "category": "Hardware",
    "topic": "IT-Sicherheit",
    "difficulty": "hard",
    "question": "Ein Notebook mit vertraulichen Daten wird regelmäßig mobil genutzt. Welche Kombination verbessert den Schutz sinnvoll?",
    "answers": [
      "Nur eine hohe Displayhelligkeit und ein großes Netzteil",
      "Geräteverschlüsselung, starke Anmeldung und physische Zugriffskontrolle",
      "Nur ein schneller Prozessor und möglichst viel Arbeitsspeicher",
      "Nur ein größeres Gehäuse und zusätzliche Lüfter"
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
    "question": "Welche Hardware-Ressource wird einer virtuellen Maschine typischerweise zugewiesen?",
    "answers": [
      "Nur eine feste Monitorauflösung ohne weitere Ressourcen",
      "Ausschließlich physische Tastaturkontakte des Hosts",
      "Nur die Seriennummer des Host-Gehäuses",
      "Virtuelle CPUs, Arbeitsspeicher und virtueller Massenspeicher"
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
    "question": "Warum sollte einer VM nicht unnötig viel RAM zugewiesen werden?",
    "answers": [
      "Der Host und andere VMs benötigen ebenfalls Arbeitsspeicher",
      "Mehr RAM verhindert grundsätzlich den Start jeder VM",
      "RAM-Zuweisung verändert die physische CPU-Sockelgröße",
      "Zusätzlicher RAM deaktiviert automatisch virtuelle Netzwerkkarten"
    ],
    "correctAnswer": 0,
    "explanation": "Zu großzügige Zuweisung kann Ressourcen des Hosts und anderer VMs einschränken.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-184",
    "category": "Hardware",
    "topic": "Virtualisierung",
    "difficulty": "hard",
    "question": "Welche CPU-Funktion kann für Hardwarevirtualisierung erforderlich sein?",
    "answers": [
      "Ein integrierter SATA-Controller mit RAID 0",
      "Unterstützung wie Intel VT-x oder AMD-V",
      "Ein DisplayPort-Ausgang mit hoher Bildrate",
      "Ein spezieller USB-A-Port mit Ladefunktion"
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
    "question": "Was ist ein Vorteil eines Snapshots einer VM?",
    "answers": [
      "Die physische SSD erhält dadurch automatisch mehr Kapazität",
      "Der Host benötigt danach keinen Arbeitsspeicher mehr",
      "Ein definierter Zustand kann für Tests schnell wiederhergestellt werden",
      "Der Snapshot ersetzt dauerhaft jede externe Datensicherung"
    ],
    "correctAnswer": 2,
    "explanation": "Snapshots sind nützlich für kurzfristige Zustandswiederherstellung, ersetzen aber kein vollständiges Backup.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-186",
    "category": "Hardware",
    "topic": "Hardware-Grundlagen",
    "difficulty": "medium",
    "question": "Was beschreibt ein Bit?",
    "answers": [
      "Eine Gruppe aus genau zehn Dezimalziffern",
      "Eine feste Einheit von 1024 Megabyte",
      "Eine physische Leitung mit acht Kupferadern",
      "Die kleinste binäre Informationseinheit mit 0 oder 1"
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
    "question": "Welche Einheit wird häufig für Datenübertragungsraten verwendet?",
    "answers": [
      "Watt pro Stunde",
      "Bit pro Sekunde",
      "Volt pro Meter",
      "Hertz pro Byte"
    ],
    "correctAnswer": 1,
    "explanation": "Netzwerk- und Schnittstellendatenraten werden häufig in bit/s und Vielfachen davon angegeben.",
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
    "difficulty": "hard",
    "question": "Warum sollte ein Firmware-Update nicht ohne Anlass unterbrochen werden?",
    "answers": [
      "Eine Unterbrechung erhöht automatisch die Speicherkapazität",
      "Das Gerät wechselt danach immer auf eine schnellere Schnittstelle",
      "Das Update wird ausschließlich im flüchtigen CPU-Cache gespeichert",
      "Ein unvollständiger Schreibvorgang kann das Gerät unstartbar machen"
    ],
    "correctAnswer": 3,
    "explanation": "Wird kritische Firmware unvollständig geschrieben, kann das Gerät nicht mehr korrekt starten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-191",
    "category": "Hardware",
    "topic": "Beschaffung",
    "difficulty": "medium",
    "question": "Was ist bei zwei technisch geeigneten Hardwareangeboten zusätzlich zum Kaufpreis sinnvoll zu vergleichen?",
    "answers": [
      "Garantie, Lieferzeit, Betriebskosten und Support",
      "Nur die Reihenfolge der Buchstaben im Produktnamen",
      "Nur die Farbe der Verpackung und Anzahl der Logos",
      "Nur die Größe des Herstellerfotos im Onlineshop"
    ],
    "correctAnswer": 0,
    "explanation": "Eine Beschaffungsentscheidung sollte relevante technische und wirtschaftliche Kriterien berücksichtigen.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-192",
    "category": "Hardware",
    "topic": "Beschaffung",
    "difficulty": "medium",
    "question": "Warum ist die Lieferzeit bei Hardwarebeschaffung relevant?",
    "answers": [
      "Sie bestimmt automatisch die Lebensdauer des Prozessors",
      "Sie kann den geplanten Bereitstellungstermin beeinflussen",
      "Sie verändert die Kapazität installierter SSDs",
      "Sie legt die Anzahl der PCIe-Lanes des Mainboards fest"
    ],
    "correctAnswer": 1,
    "explanation": "Nicht verfügbare Hardware kann Projekt- und Übergabetermine verzögern.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-193",
    "category": "Hardware",
    "topic": "Beschaffung",
    "difficulty": "medium",
    "question": "Was beschreibt eine Mindestanforderung?",
    "answers": [
      "Ein optionales Merkmal ohne Einfluss auf die Auswahl",
      "Ein Kriterium, das grundsätzlich nicht geprüft werden darf",
      "Eine Eigenschaft, die ein Angebot zwingend erfüllen muss",
      "Eine Eigenschaft, die nur nach dem Kauf definiert wird"
    ],
    "correctAnswer": 2,
    "explanation": "Mindestanforderungen sind Ausschlusskriterien, wenn sie nicht erfüllt werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-194",
    "category": "Hardware",
    "topic": "Beschaffung",
    "difficulty": "hard",
    "question": "Zwei Geräte erfüllen alle Muss-Kriterien. Gerät A kostet 900 € mit 3 Jahren Vor-Ort-Service, Gerät B 850 € mit 1 Jahr Bring-in-Service. Was ist die beste nächste Vorgehensweise?",
    "answers": [
      "Gerät B allein wegen des niedrigeren Kaufpreises automatisch wählen",
      "Gerät A allein wegen des höheren Kaufpreises automatisch wählen",
      "Beide Geräte verwerfen, weil ihre Preise unterschiedlich sind",
      "Die relevanten Kosten- und Servicekriterien gewichtet vergleichen"
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
      "Support, Ersatzteilhaltung und Rollout können einfacher werden",
      "Jeder Arbeitsplatz benötigt dadurch automatisch andere Treiber",
      "Die Geräte dürfen danach nicht mehr inventarisiert werden",
      "Standardisierung verhindert grundsätzlich jede spätere Aufrüstung"
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
    "question": "Ein Mitarbeiter benötigt drei Monitore für Analyseaufgaben. Was muss vor der Beschaffung geprüft werden?",
    "answers": [
      "Ob das Gehäuse mindestens drei interne SATA-Schächte besitzt",
      "Ob Grafiklösung, Dock und Anschlüsse drei Displays unterstützen",
      "Ob der Prozessor exakt drei physische Kerne besitzt",
      "Ob die Tastatur über drei verschiedene Layouts verfügt"
    ],
    "correctAnswer": 1,
    "explanation": "Anzahl, Auflösung und Bildrate der Monitore müssen von der Anzeigehardware unterstützt werden.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-197",
    "category": "Hardware",
    "topic": "Praxisfälle",
    "difficulty": "medium",
    "question": "Ein Arbeitsplatz soll besonders leise sein. Welche Maßnahme ist sinnvoll?",
    "answers": [
      "Alle Lüfter entfernen und sämtliche Öffnungen verschließen",
      "Nur Lüfter mit maximaler Drehzahl unabhängig von Temperatur nutzen",
      "Effiziente Kühlung mit großen, langsam drehenden Lüftern planen",
      "Die CPU ohne Kühlkörper betreiben und das Gehäuse offen lassen"
    ],
    "correctAnswer": 2,
    "explanation": "Große effiziente Kühler können bei gleicher Kühlleistung mit niedrigeren Drehzahlen arbeiten.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-198",
    "category": "Hardware",
    "topic": "Praxisfälle",
    "difficulty": "hard",
    "question": "Ein Büro-PC soll fünf Jahre eingesetzt werden. Welche Auswahlstrategie ist sinnvoll?",
    "answers": [
      "Nur die aktuell billigste Minimalhardware ohne Erweiterungsmöglichkeit wählen",
      "Ausschließlich die maximale RGB-Beleuchtung als Zukunftssicherheit bewerten",
      "Kompatibilität mit zukünftigen Peripheriegeräten grundsätzlich ignorieren",
      "Ausreichende Leistungsreserve, gute Wartbarkeit und verfügbare Schnittstellen berücksichtigen"
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
    "question": "Ein Benutzer kopiert regelmäßig sehr große Videodateien. Welche Aufrüstung bringt häufig den größten Vorteil?",
    "answers": [
      "Schneller Massenspeicher und passende schnelle Schnittstellen",
      "Eine Maus mit höherer Abfragerate",
      "Ein stärkeres Netzteil ohne Änderung anderer Komponenten",
      "Eine Tastatur mit zusätzlichen Funktionstasten"
    ],
    "correctAnswer": 0,
    "explanation": "Große Dateiübertragungen profitieren von hoher Speicher- und Schnittstellenbandbreite.",
    "source": "hardware.csv"
  },
  {
    "id": "hardware-200",
    "category": "Hardware",
    "topic": "Praxisfälle",
    "difficulty": "medium",
    "question": "Ein PC wird hauptsächlich für Videokonferenzen eingesetzt. Welche Hardware ist besonders relevant?",
    "answers": [
      "Mehrere High-End-GPUs und ein RAID-0-Verbund aus vier SSDs",
      "Webcam, Mikrofon, Lautsprecher oder Headset und stabile Netzwerkanbindung",
      "Eine sehr große HDD ohne Audio- oder Videoeingabegeräte",
      "Ein besonders leistungsstarkes Netzteil ohne angeschlossene Peripherie"
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
      "Er speichert dauerhaft alle Dateien der Clients",
      "Er ersetzt den Arbeitsspeicher der Endgeräte",
      "Er verteilt ausschließlich MAC-Adressen"
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
      "Sie verschlüsselt IP-Pakete automatisch",
      "Sie bestimmt die MAC-Adresse des Hosts",
      "Sie gibt ausschließlich die maximale Kabelstrecke an"
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
      "Es verschlüsselt automatisch den gesamten Netzwerkverkehr",
      "Es ersetzt DNS vollständig",
      "Es speichert Webseiten lokal auf jedem Client"
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
      "Es vergibt MAC-Adressen an Switches",
      "Es misst die elektrische Leistung eines Routers",
      "Es komprimiert Ethernet-Frames"
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
      "ARP vergibt automatisch IP-Adressen",
      "ARP verschlüsselt Daten zwischen zwei Routern",
      "ARP ersetzt TCP bei Dateiübertragungen"
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
    "question": "Welche Eigenschaft unterscheidet TCP typischerweise von UDP?",
    "answers": [
      "TCP stellt unter anderem eine verbindungsorientierte und zuverlässige Übertragung bereit",
      "UDP garantiert immer die Reihenfolge aller Pakete",
      "TCP funktioniert nur innerhalb eines lokalen Netzes",
      "UDP benötigt grundsätzlich mehr Overhead als TCP"
    ],
    "correctAnswer": 0,
    "explanation": "TCP verwendet unter anderem Verbindungsaufbau, Bestätigungen und Reihenfolgenkontrolle. UDP arbeitet verbindungslos und mit geringerem Protokollaufwand.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-009",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Unternehmen möchte mehrere logische Netze über dieselbe physische Switch-Infrastruktur trennen. Welche Technik eignet sich dafür?",
    "answers": [
      "VLAN",
      "NAT",
      "RAID",
      "S.M.A.R.T."
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
    "difficulty": "hard",
    "question": "Ein Client erhält per DHCP eine Adresse, kann aber nur Geräte im eigenen Subnetz erreichen. DNS-Auflösung funktioniert ebenfalls. Welche fehlerhafte Einstellung ist am wahrscheinlichsten?",
    "answers": [
      "Das Standardgateway fehlt oder ist falsch konfiguriert",
      "Die MAC-Adresse des Clients ist zu lang",
      "Der Switch verwendet Ethernet",
      "Der DNS-Server antwortet zu schnell"
    ],
    "correctAnswer": 0,
    "explanation": "Wenn lokale Kommunikation und DNS funktionieren, aber andere Netze nicht erreichbar sind, ist ein fehlendes oder falsches Standardgateway ein naheliegender Fehler.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-013",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "hard",
    "question": "Warum kann NAT dazu führen, dass mehrere private IPv4-Hosts eine einzige öffentliche IPv4-Adresse gemeinsam verwenden?",
    "answers": [
      "Der Router verändert Adressinformationen und kann Verbindungen zusätzlich über Portnummern zuordnen",
      "Alle internen Hosts erhalten dieselbe MAC-Adresse",
      "Private IPv4-Adressen werden automatisch zu IPv6-Adressen",
      "Der Switch speichert für jeden Host eine öffentliche IP-Adresse"
    ],
    "correctAnswer": 0,
    "explanation": "Bei NAT beziehungsweise PAT übersetzt der Router interne Adressen in eine öffentliche Adresse und unterscheidet parallele Verbindungen typischerweise über Transportprotokoll und Portinformationen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-014",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "hard",
    "question": "Zwei Switches sind mit einer Verbindung gekoppelt, über die mehrere VLANs transportiert werden sollen. Welche Konfiguration ist dafür typischerweise erforderlich?",
    "answers": [
      "Ein Trunk-Link mit VLAN-Kennzeichnung, zum Beispiel nach IEEE 802.1Q",
      "Ein ausschließlich ungetaggter Access-Port für genau ein VLAN",
      "Eine RAID-5-Konfiguration auf beiden Switches",
      "Ein DHCP-Relay ohne VLAN-Konfiguration"
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
    "question": "Welche Aufgabe hat ein Switch in einem Ethernet-Netzwerk hauptsächlich?",
    "answers": [
      "Er leitet Frames anhand von MAC-Adressen gezielt an passende Ports weiter",
      "Er vergibt automatisch öffentliche IP-Adressen",
      "Er ersetzt grundsätzlich den Router zum Internet",
      "Er wandelt jede IPv4-Adresse automatisch in IPv6 um"
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
    "question": "Welches Protokoll wird typischerweise zum Senden und Weiterleiten von E-Mails verwendet?",
    "answers": [
      "IMAP",
      "SMTP",
      "POP3",
      "ARP"
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
      "IMAP synchronisiert den Zustand der Mailbox auf dem Server, POP3 lädt Nachrichten typischerweise zum Client herunter.",
      "POP3 synchronisiert Ordner und Zustände serverseitig, IMAP arbeitet nur lokal.",
      "IMAP wird nur zum Senden, POP3 nur zum Verschlüsseln von E-Mails verwendet.",
      "POP3 verwendet IP-Adressen, IMAP ausschließlich MAC-Adressen."
    ],
    "correctAnswer": 0,
    "explanation": "IMAP eignet sich besonders für mehrere Endgeräte, weil Nachrichten und Ordner auf dem Server verwaltet und synchronisiert werden.",
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
    "explanation": "HTTPS verwendet standardmäßig TCP-Port 443.",
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
      "UDP verwendet Ports nur als Kommentar ohne technische Bedeutung.",
      "TCP-Portnummern werden automatisch in UDP-Portnummern umgerechnet.",
      "Nur Ports oberhalb von 49151 dürfen in beiden Protokollen vorkommen."
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
      "Für die MAC-Adresse des Clients.",
      "Für den Standardport von HTTPS.",
      "Für die VLAN-ID des Clients."
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
    "question": "Welche Aussage beschreibt den Unterschied zwischen IP-Adresse und Port am besten?",
    "answers": [
      "Die IP-Adresse adressiert den Host bzw. das Netz, der Port den Prozess bzw. Dienst.",
      "Die IP-Adresse adressiert nur Anwendungen, der Port nur Router.",
      "Die IP-Adresse ist nur für Layer 2, der Port nur für Layer 3 relevant.",
      "IP-Adresse und Port erfüllen dieselbe Aufgabe auf unterschiedlichen Betriebssystemen."
    ],
    "correctAnswer": 0,
    "explanation": "Die IP-Adresse gehört zur Vermittlungsschicht, Ports gehören zu TCP/UDP auf der Transportschicht.",
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
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Zuordnung ist korrekt?",
    "answers": [
      "Router – Layer 3 – IP-Adresse",
      "Router – Layer 2 – Portnummer",
      "Router – Layer 4 – MAC-Adresse",
      "Router – Layer 7 – VLAN-ID"
    ],
    "correctAnswer": 0,
    "explanation": "Router arbeiten primär auf Layer 3 und treffen Weiterleitungsentscheidungen anhand von IP-Netzen.",
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
      "SMTP"
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
    "question": "Welche ICMP -Nachricht ist für tracert/traceroute besonders wichtig?",
    "answers": [
      "Echo Redirect",
      "Time Exceeded",
      "Port Accepted",
      "Route Confirmed"
    ],
    "correctAnswer": 1,
    "explanation": "Router senden typischerweise ICMP Time Exceeded, wenn der TTL-Wert eines Pakets auf 0 fällt.",
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
      "Es legt die TCP-Zielportnummer fest.",
      "Es speichert die MAC-Adresse des Absenders.",
      "Es bestimmt die maximale Größe eines Ethernet-Frames."
    ],
    "correctAnswer": 0,
    "explanation": "Jeder Router reduziert TTL. Bei 0 wird das Paket verworfen, damit es nicht endlos im Netz zirkuliert.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-034",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "hard",
    "question": "Warum kann tracert die einzelnen Router auf dem Weg zum Ziel sichtbar machen?",
    "answers": [
      "Es sendet Pakete mit schrittweise erhöhtem TTL und wertet Time-Exceeded-Antworten aus.",
      "Es liest die vollständige Routingtabelle jedes Routers per SNMP aus.",
      "Es fordert von jedem Switch dessen MAC-Adresstabelle an.",
      "Es setzt die Zielportnummer bei jedem Paket auf die Nummer des nächsten Routers."
    ],
    "correctAnswer": 0,
    "explanation": "Mit TTL 1, 2, 3 usw. erreicht jedes Paket einen Hop weiter, bevor ein Router es verwirft und eine ICMP-Antwort zurücksendet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-035",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bedeutet APIPA unter Windows?",
    "answers": [
      "Automatische Vergabe einer 169.254.x.x-Adresse, wenn kein DHCP erreicht wird.",
      "Automatische Vergabe einer öffentlichen IPv4-Adresse durch DNS.",
      "Automatische Zuordnung einer MAC-Adresse zu einer VLAN-ID.",
      "Automatische Verschlüsselung aller Pakete im lokalen Netz."
    ],
    "correctAnswer": 0,
    "explanation": "Wenn DHCP nicht erreichbar ist, kann Windows sich selbst eine Link-Local-Adresse aus 169.254.0.0/16 geben.",
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
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat DHCP?",
    "answers": [
      "Netzwerkparameter wie IP-Adresse, Maske, Gateway und DNS automatisch verteilen.",
      "Domainnamen in MAC-Adressen umwandeln.",
      "E-Mails zwischen Mailservern weiterleiten.",
      "Ethernet-Frames anhand von Ports verschlüsseln."
    ],
    "correctAnswer": 0,
    "explanation": "DHCP automatisiert die Netzwerkkonfiguration von Clients.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-038",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche UDP-Ports werden typischerweise von DHCP verwendet?",
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
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat DNS?",
    "answers": [
      "Namen in IP-Adressen und weitere DNS-Daten auflösen.",
      "MAC-Adressen in TCP-Ports umwandeln.",
      "IP-Adressen automatisch an Clients vergeben.",
      "Pakete zwischen verschiedenen Subnetzen routen."
    ],
    "correctAnswer": 0,
    "explanation": "DNS stellt Namensauflösung und weitere verteilte Namensinformationen bereit.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-040",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum verwendet DNS neben UDP auch TCP?",
    "answers": [
      "Bestimmte DNS-Vorgänge oder größere Antworten benötigen TCP.",
      "UDP ist nur für IPv6 erlaubt.",
      "TCP wird ausschließlich für lokale Hosts ohne Router verwendet.",
      "TCP ist erforderlich, sobald eine DNS-Anfrage Port 53 erreicht."
    ],
    "correctAnswer": 0,
    "explanation": "DNS nutzt häufig UDP für normale Abfragen, kann aber z. B. bei bestimmten größeren Antworten oder Zonentransfers TCP verwenden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-041",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat ARP in einem IPv4-LAN?",
    "answers": [
      "Zu einer IPv4-Adresse die passende MAC-Adresse im lokalen Netz ermitteln.",
      "Zu einer MAC-Adresse den passenden TCP-Port bestimmen.",
      "Eine öffentliche IPv4-Adresse in eine private übersetzen.",
      "Den schnellsten Router im Internet auswählen."
    ],
    "correctAnswer": 0,
    "explanation": "ARP verbindet im lokalen IPv4-Netz die logische IPv4-Adressierung mit der MAC-Adressierung von Ethernet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-042",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Host möchte ein Ziel in derselben IPv4-Subnetz erreichen. Was benötigt er vor dem Senden eines Ethernet-Frames typischerweise?",
    "answers": [
      "Die MAC-Adresse des Zielhosts.",
      "Die MAC-Adresse des DNS-Servers.",
      "Den TCP-Port des Switches.",
      "Die öffentliche IP-Adresse des Routers."
    ],
    "correctAnswer": 0,
    "explanation": "Bei einem lokalen Ziel wird der Frame direkt an die MAC-Adresse des Zielhosts adressiert.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-043",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Host sendet an ein Ziel außerhalb seiner eigenen Subnetzmaske. Welche MAC-Adresse verwendet er typischerweise als Ethernet-Ziel?",
    "answers": [
      "Die MAC-Adresse des Default Gateways.",
      "Die MAC-Adresse des entfernten Zielhosts über das Internet.",
      "Die MAC-Adresse des DNS-Servers.",
      "Eine zufällig erzeugte MAC-Adresse."
    ],
    "correctAnswer": 0,
    "explanation": "Für entfernte Netze wird der Frame lokal an den nächsten Router bzw. das Default Gateway gesendet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-044",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Was beschreibt ein Default Gateway?",
    "answers": [
      "Den Router, an den ein Host Pakete für nicht lokal erreichbare Netze sendet.",
      "Den DHCP-Server, der immer die erste freie Adresse vergibt.",
      "Den DNS-Server, der unbekannte Namen verwirft.",
      "Den Switch-Port mit der niedrigsten Nummer."
    ],
    "correctAnswer": 0,
    "explanation": "Das Default Gateway ist der Standard-Nächste-Hop für Ziele außerhalb der lokalen Subnetze.",
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
    "question": "Wie groß ist die Blockgröße im letzten Oktett bei einer /27-Subnetz innerhalb eines /24-Netzes?",
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
    "question": "Wie viele nutzbare Hostadressen hat eine klassische /26-Subnetz?",
    "answers": [
      "30",
      "62",
      "64",
      "126"
    ],
    "correctAnswer": 1,
    "explanation": "Eine /26 enthält 64 Adressen. Klassisch sind Netzadresse und Broadcast nicht als Hostadressen nutzbar, also 62.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-052",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "hard",
    "question": "Eine /24 wird vollständig in /28-Netze zerlegt. Wie viele /28-Subnetze entstehen?",
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
    "difficulty": "hard",
    "question": "Welche Aussage beschreibt VLSM korrekt?",
    "answers": [
      "Unterschiedlich große Subnetze können innerhalb eines größeren Adressblocks geplant werden.",
      "Alle Subnetze eines Adressblocks müssen zwingend dieselbe Maske besitzen.",
      "VLSM bedeutet, dass ein Host gleichzeitig mehrere MAC-Adressen braucht.",
      "VLSM ist eine Methode zur automatischen Portvergabe bei TCP."
    ],
    "correctAnswer": 0,
    "explanation": "VLSM erlaubt unterschiedliche Präfixlängen und damit unterschiedlich große Subnetze innerhalb eines Adressplans.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-054",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "hard",
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
    "question": "PC-A ist 10.0.0.20/24, PC-B ist 10.0.0.130/25. Ohne Router: Warum kann die Kommunikation asymmetrisch problematisch werden?",
    "answers": [
      "A kann B als lokal betrachten, während B A als außerhalb seines /25-Netzes betrachtet.",
      "B verwendet automatisch TCP, A dagegen UDP.",
      "A und B besitzen zwingend dieselbe MAC-Adresse.",
      "Ein /24-Host darf grundsätzlich keine /25-Adresse ansprechen."
    ],
    "correctAnswer": 0,
    "explanation": "Unterschiedliche überlappende Masken können dazu führen, dass Hosts den jeweils anderen unterschiedlich als lokal oder entfernt einstufen.",
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
      "Ein Hub wiederholt Signale an alle Ports, ein Switch leitet Frames gezielt anhand gelernter MAC-Adressen weiter.",
      "Ein Hub routet IP-Pakete, ein Switch vergibt IP-Adressen.",
      "Ein Switch arbeitet ausschließlich mit DNS-Namen, ein Hub mit Ports.",
      "Ein Hub unterstützt VLANs, ein Switch grundsätzlich nicht."
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
      "IP-Adressen dynamisch verteilen.",
      "DNS-Namen verschlüsseln.",
      "VLAN-Tags zu entfernen."
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
      "Weil IPv6 CSMA/CD ersetzt hat.",
      "Weil Router jede Kollision automatisch korrigieren.",
      "Weil moderne Switches ausschließlich UDP verwenden."
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
    "question": "Welche Information lernt ein Layer-2-Switch?",
    "answers": [
      "Welche MAC-Adresse über welchen Port erreichbar ist.",
      "Welcher DNS-Name zu welchem TCP-Port gehört.",
      "Welche Anwendung welchen Benutzer angemeldet hat.",
      "Welche öffentliche IP-Adresse hinter einem NAT liegt."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Switch baut aus empfangenen Frames eine MAC-Adresstabelle auf.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-066",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Switch kennt die Ziel-MAC-Adresse eines Frames noch nicht. Was macht er typischerweise?",
    "answers": [
      "Er flutet den Frame über die relevanten Ports außer dem Eingangsport.",
      "Er sendet den Frame automatisch zum DNS-Server.",
      "Er verwirft jeden unbekannten Unicast-Frame sofort.",
      "Er ändert die Ziel-MAC-Adresse auf Broadcast und sendet nur zum Router."
    ],
    "correctAnswer": 0,
    "explanation": "Unknown Unicast wird typischerweise innerhalb des VLANs geflutet, bis der Switch die Adresse lernt.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-067",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bewirkt ein VLAN auf einem Switch?",
    "answers": [
      "Es trennt eine physische Switch-Infrastruktur in logische Layer-2-Broadcast-Domänen.",
      "Es erhöht automatisch die Anzahl verfügbarer TCP-Ports.",
      "Es wandelt IPv4-Adressen in IPv6-Adressen um.",
      "Es ersetzt die Subnetzmaske auf allen Clients."
    ],
    "correctAnswer": 0,
    "explanation": "VLANs schaffen getrennte logische Layer-2-Netze auf derselben physischen Infrastruktur.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-068",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "hard",
    "question": "Welche Aussage zu VLAN und Subnetz ist am treffendsten?",
    "answers": [
      "VLAN und IP-Subnetz sind unterschiedliche Konzepte, werden in der Praxis aber häufig einander zugeordnet.",
      "Ein VLAN ist exakt dasselbe wie eine Subnetzmaske.",
      "Jedes VLAN muss zwingend mehrere IP-Subnetze enthalten.",
      "Subnetze funktionieren nur, wenn VLAN-IDs mit der Netzadresse identisch sind."
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
    "question": "Was bedeutet MTU im Ethernet-Kontext typischerweise?",
    "answers": [
      "Maximale Nutzlastgröße eines Layer-3-Pakets, die ohne Fragmentierung in einen Frame passt.",
      "Maximale Anzahl MAC-Adressen pro Switch.",
      "Maximale Zahl von TCP-Ports pro Anwendung.",
      "Mindestzeit eines TTL-Wertes."
    ],
    "correctAnswer": 0,
    "explanation": "Bei klassischem Ethernet ist eine MTU von 1500 Byte für die IP-Nutzlast üblich.",
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
      "Den Ziel-TCP-Port festlegen.",
      "Die IP-Adresse des Gateways speichern."
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
    "difficulty": "hard",
    "question": "Ein Paket erreicht den richtigen Host, aber dort lauscht kein Prozess auf dem angesprochenen TCP-Port. Welche Ebene hat damit bereits korrekt funktioniert?",
    "answers": [
      "Die IP-Zustellung zum Host hat funktioniert; das Problem liegt beim Transport/Prozess-Ziel.",
      "Die MAC-Adresse des entfernten Internethosts muss falsch sein.",
      "DNS muss zwingend ausgefallen sein.",
      "Die Subnetzmaske kann nicht korrekt gewesen sein."
    ],
    "correctAnswer": 0,
    "explanation": "Wenn das Paket den Host erreicht, hat die Layer-3-Zustellung grundsätzlich funktioniert. Die Portzuordnung betrifft Layer 4 und den Zielprozess.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-073",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "hard",
    "question": "Welches Beispiel zeigt korrekt eine vollständige Identifikation einer TCP-Verbindung?",
    "answers": [
      "Quell-IP, Quellport, Ziel-IP, Zielport und Transportprotokoll.",
      "Nur Ziel-IP und MAC-Adresse.",
      "Nur Quellport und DNS-Name.",
      "VLAN-ID, TTL und Gateway-MAC ohne Ports."
    ],
    "correctAnswer": 0,
    "explanation": "TCP-Verbindungen werden durch die Kombination aus Quell-/Ziel-IP, Quell-/Zielport und Protokoll eindeutig beschrieben.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-074",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum muss ein Webserver nicht ausschließlich auf Port 443 betrieben werden?",
    "answers": [
      "Port 443 ist der Standard für HTTPS, technisch kann der Dienst auch auf einem anderen freien Port lauschen.",
      "HTTPS bestimmt seinen Port ausschließlich aus der MAC-Adresse.",
      "TCP erlaubt keine fest definierten Standardports.",
      "Jeder Server darf nur Ports oberhalb 49151 verwenden."
    ],
    "correctAnswer": 0,
    "explanation": "Standardports dienen der Konvention und Interoperabilität; technisch kann ein Dienst auf einem anderen Port laufen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-075",
    "category": "Netzwerk",
    "topic": null,
    "difficulty": "hard",
    "question": "Welche Aussage beschreibt Encapsulation korrekt?",
    "answers": [
      "Jede Netzwerkschicht ergänzt eigene Steuerinformationen um die Nutzdaten der höheren Schicht.",
      "Alle Schichten ersetzen denselben Header nacheinander vollständig.",
      "Nur Layer 7 besitzt Header, alle unteren Schichten übertragen reine Nutzdaten.",
      "Encapsulation bedeutet ausschließlich Verschlüsselung durch HTTPS."
    ],
    "correctAnswer": 0,
    "explanation": "Beim Kapseln werden z. B. Anwendungsdaten in TCP/UDP, dann IP und schließlich Ethernet eingebettet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-076",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Was beschreibt eine Netzwerktopologie?",
    "answers": [
      "Nur die IP-Adressen aller Geräte",
      "Wie Geräte verbunden sind und wie Daten übertragen werden",
      "Nur die verwendeten Betriebssysteme",
      "Nur die Kabellänge eines Netzwerks"
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
    "question": "Was beschreibt die physikalische Topologie eines Netzwerks?",
    "answers": [
      "Wie die Kabel tatsächlich verlegt sind",
      "Wie Daten logisch von A nach B reisen",
      "Welche Ports ein Server verwendet",
      "Welche IP-Adresse ein Router besitzt"
    ],
    "correctAnswer": 0,
    "explanation": "Die physikalische Topologie beschreibt die tatsächlich sichtbare Verkabelung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-078",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Was beschreibt die logische Topologie?",
    "answers": [
      "Die Position der Geräte im Raum",
      "Die Kabelfarbe",
      "Den digitalen Weg der Daten",
      "Die Größe des Serverraums"
    ],
    "correctAnswer": 2,
    "explanation": "Die logische Topologie beschreibt, wie Daten von A nach B gelangen.",
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
      "Es gibt keine Erweiterungsmöglichkeit",
      "Jedes Gerät benötigt zwingend zwei Netzwerkkarten",
      "Es gibt keine eigene Bandbreite zum Verteiler"
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
    "question": "Welcher Vorteil passt zur Sterntopologie?",
    "answers": [
      "Sehr geringer Kabelaufwand",
      "Leichte Fehlersuche",
      "Keine zentrale Komponente",
      "Keine Installationskosten"
    ],
    "correctAnswer": 1,
    "explanation": "Die getrennten Leitungen machen Fehler meist leichter lokalisierbar.",
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
      "Jedes Gerät besitzt zwei redundante Verbindungen",
      "Es gibt immer einen Server in der Mitte"
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
    "question": "Welche Aufgabe haben Terminatoren bei einer klassischen Bustopologie?",
    "answers": [
      "Sie vergeben IP-Adressen",
      "Sie verhindern Signalreflexionen an den Kabelenden",
      "Sie verschlüsseln Daten",
      "Sie ersetzen einen Switch"
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
    "question": "Welcher Vorteil ist typisch für die Bustopologie?",
    "answers": [
      "Extrem hohe Ausfallsicherheit",
      "Geringer Kabelaufwand",
      "Volle Redundanz",
      "Leichte Fehlersuche bei Kabelbruch"
    ],
    "correctAnswer": 1,
    "explanation": "Die Busstruktur benötigt vergleichsweise wenig Kabel.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-086",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Was ist ein typischer Nachteil der Bustopologie?",
    "answers": [
      "Hoher Verkabelungsaufwand",
      "Kollisionsgefahr und Geschwindigkeitsverlust",
      "Jedes Gerät benötigt einen eigenen Switch",
      "Keine Geräte können hinzugefügt werden"
    ],
    "correctAnswer": 1,
    "explanation": "Da sich Geräte ein Medium teilen, können Kollisionen und Leistungsprobleme auftreten.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-087",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Was beschreibt eine Ringtopologie am besten?",
    "answers": [
      "Alle Geräte sind kreisförmig miteinander verbunden",
      "Alle Geräte verbinden sich nur mit einem Server",
      "Alle Geräte teilen sich einen Terminator",
      "Nur zwei Geräte sind direkt verbunden"
    ],
    "correctAnswer": 0,
    "explanation": "Bei der Ringtopologie bilden die Teilnehmer einen Ring.",
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
    "difficulty": "hard",
    "question": "Was passiert bei einer Baumtopologie, wenn ein Verteiler in einem Unterbaum ausfällt?",
    "answers": [
      "Nur ein einzelnes Endgerät ist betroffen",
      "Der von diesem Verteiler abhängige Unterbaum kann unerreichbar werden",
      "Das gesamte Internet fällt aus",
      "Die IP-Adressen werden automatisch geändert"
    ],
    "correctAnswer": 1,
    "explanation": "Der Ausfall eines Verteilers betrifft typischerweise den daran hängenden Unterbaum.",
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
      "Ein vollständig vermaschtes Netz"
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
    "question": "Welcher Nachteil ist typisch für Punkt-zu-Punkt?",
    "answers": [
      "Keine Skalierbarkeit",
      "Keine Geschwindigkeit",
      "Hoher Verwaltungsaufwand durch viele Server",
      "Immer hohe Kollisionsgefahr"
    ],
    "correctAnswer": 0,
    "explanation": "Die direkte Verbindung ist einfach und schnell, aber nicht für große Netze skalierbar.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-093",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "medium",
    "question": "Wann spricht man von einem vollständig vermaschten Netz (Full Mesh)?",
    "answers": [
      "Wenn jedes Gerät mit genau einem Switch verbunden ist",
      "Wenn jeder Teilnehmer direkt mit jedem anderen verbunden ist",
      "Wenn nur zwei Geräte verbunden sind",
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
    "question": "Welcher Vorteil passt besonders zu einer Mesh-Topologie?",
    "answers": [
      "Extrem hohe Ausfallsicherheit",
      "Minimaler Verkabelungsaufwand",
      "Sehr einfacher Aufbau",
      "Keine alternativen Datenwege"
    ],
    "correctAnswer": 0,
    "explanation": "Mesh bietet mehrere mögliche Wege und dadurch hohe Ausfallsicherheit.",
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
    "question": "Welche Netzwerkart beschreibt ein Netz über eine Stadt oder Region?",
    "answers": [
      "PAN",
      "LAN",
      "MAN",
      "GAN"
    ],
    "correctAnswer": 2,
    "explanation": "MAN steht für Metropolitan Area Network.",
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
    "question": "Was kennzeichnet ein Peer-to-Peer-Netzwerk (P2P)?",
    "answers": [
      "Es gibt zwingend einen zentralen Server",
      "Alle Teilnehmer sind grundsätzlich gleichberechtigt",
      "Nur ein Client darf Ressourcen anbieten",
      "Es funktioniert nur mit WLAN"
    ],
    "correctAnswer": 1,
    "explanation": "P2P verzichtet auf eine zentrale Steuereinheit; Teilnehmer können gleichberechtigt Ressourcen anbieten.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-102",
    "category": "Netzwerk",
    "topic": "Netzwerkarchitektur",
    "difficulty": "medium",
    "question": "Welcher Vorteil kann ein Peer-to-Peer-Netzwerk bieten?",
    "answers": [
      "Kein Single Point of Failure",
      "Zentrale und einfache Verwaltung",
      "Keine Sicherheitsrisiken",
      "Nur ein Gerät muss laufen"
    ],
    "correctAnswer": 0,
    "explanation": "P2P besitzt nicht zwingend einen einzelnen zentralen Ausfallpunkt.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-103",
    "category": "Netzwerk",
    "topic": "Netzwerkarchitektur",
    "difficulty": "medium",
    "question": "Welcher Nachteil passt zu P2P?",
    "answers": [
      "Schwierige Verwaltung",
      "Zwingend sehr hohe Serverkosten",
      "Keine Skalierbarkeit",
      "Nur ein Gerät kann Daten senden"
    ],
    "correctAnswer": 0,
    "explanation": "Die dezentrale Struktur kann Verwaltung und Sicherheit erschweren.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-104",
    "category": "Netzwerk",
    "topic": "Netzwerkarchitektur",
    "difficulty": "medium",
    "question": "Was ist die Grundidee eines Client-Server-Netzwerks?",
    "answers": [
      "Clients stellen immer alle Dienste bereit",
      "Server bieten Dienste und Ressourcen an, die Clients nutzen",
      "Alle Geräte sind ohne Rollen gleichberechtigt",
      "Es gibt keine zentrale Ressource"
    ],
    "correctAnswer": 1,
    "explanation": "Im Client-Server-Modell stellen Server Dienste/Ressourcen bereit und Clients greifen darauf zu.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-105",
    "category": "Netzwerk",
    "topic": "Netzwerkarchitektur",
    "difficulty": "hard",
    "question": "Welche Aussage unterscheidet Client-Server am besten von P2P?",
    "answers": [
      "Client-Server kennt getrennte Rollen für Anbieter und Nutzer von Diensten",
      "P2P benötigt zwingend einen Hauptserver",
      "Client-Server funktioniert nur in WANs",
      "P2P besitzt niemals Sicherheitsrisiken"
    ],
    "correctAnswer": 0,
    "explanation": "Client-Server trennt typischerweise Server- und Clientrollen, während P2P dezentraler und gleichberechtigter ist.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-106",
    "category": "Netzwerk",
    "topic": "IPv4",
    "difficulty": "medium",
    "question": "Was bedeutet bei 192.168.10.15/24 die Angabe /24?",
    "answers": [
      "24 Geräte sind erlaubt",
      "Die ersten 24 Bit gehören zum Netzpräfix",
      "Die letzten 24 Bit gehören zum Host",
      "Port 24 wird verwendet"
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
    "question": "Wozu dient eine Broadcastadresse?",
    "answers": [
      "Um genau einen einzelnen Host anzusprechen",
      "Um alle Geräte im jeweiligen Netzwerksegment anzusprechen",
      "Um eine Domain in eine IP zu übersetzen",
      "Um Ports zu verschlüsseln"
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
    "difficulty": "hard",
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
    "question": "Was ist die Grundidee von Subnetting?",
    "answers": [
      "Ein großes Netzwerk in mehrere kleinere Unternetze aufzuteilen",
      "Alle Geräte in ein einziges großes Broadcastnetz zu legen",
      "DNS durch IP-Adressen zu ersetzen",
      "Nur WLAN-Geräte zu verbinden"
    ],
    "correctAnswer": 0,
    "explanation": "Subnetting teilt ein größeres Netzwerk in kleinere eigenständige Teilnetze.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-117",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "medium",
    "question": "Welches Zugriffsverfahren wird typischerweise bei WLAN verwendet?",
    "answers": [
      "CSMA/CD",
      "CSMA/CA",
      "ARP",
      "NAT"
    ],
    "correctAnswer": 1,
    "explanation": "CSMA/CA steht für Collision Avoidance und wird dort WLAN zugeordnet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-118",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "medium",
    "question": "Was versucht CSMA/CA zu tun?",
    "answers": [
      "Kollisionen erst nachträglich erkennen",
      "Vor dem Senden prüfen, ob das Medium frei ist",
      "IP-Adressen automatisch vergeben",
      "Pakete zu verschlüsseln"
    ],
    "correctAnswer": 1,
    "explanation": "CSMA/CA versucht Kollisionen vorab zu vermeiden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-119",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "medium",
    "question": "Welches Zugriffsverfahren wird klassisch mit kabelgebundenem Ethernet verbunden?",
    "answers": [
      "CSMA/CA",
      "CSMA/CD",
      "DNS",
      "DHCP"
    ],
    "correctAnswer": 1,
    "explanation": "CSMA/CD steht für Collision Detection und wird kabelgebundenen Netzen zugeordnet.",
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
      "Es verschlüsselt das Paket neu",
      "Es ändert die IP-Adresse",
      "Es startet DNS neu"
    ],
    "correctAnswer": 0,
    "explanation": "Collision Detection erkennt eine Kollision während der Übertragung und bricht die Sendung ab.",
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
      "Zur Vergabe von IP-Adressen",
      "Zum Speichern von Dateien",
      "Zum Entwerfen von Webseiten"
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
    "question": "Welche OSI-Schichten gelten als transportorientiert?",
    "answers": [
      "1 bis 4",
      "4 bis 7",
      "5 bis 7",
      "2 bis 6"
    ],
    "correctAnswer": 0,
    "explanation": "Schichten 4 bis 1 werden als transportorientiert bezeichnet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-126",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "In welcher Richtung durchlaufen Daten beim Senden das OSI-Modell?",
    "answers": [
      "Von Schicht 1 nach 7",
      "Von Schicht 7 nach 1",
      "Nur Schicht 4",
      "Zufällig"
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
    "topic": "OSI",
    "difficulty": "medium",
    "question": "Welche OSI-Schicht arbeitet mit MAC-Adressen im lokalen Netz?",
    "answers": [
      "Schicht 1",
      "Schicht 2",
      "Schicht 4",
      "Schicht 7"
    ],
    "correctAnswer": 1,
    "explanation": "Schicht 2 Sicherung wird mit MAC-Adressen und lokalem Netz verbunden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-130",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "Welche OSI-Schicht wird mit IP-Adressen und Routing verbunden?",
    "answers": [
      "Schicht 2",
      "Schicht 3",
      "Schicht 5",
      "Schicht 6"
    ],
    "correctAnswer": 1,
    "explanation": "Schicht 3 Vermittlung behandelt IP und Routing.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-131",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "Welche OSI-Schicht wird mit TCP/UDP verbunden?",
    "answers": [
      "Schicht 2",
      "Schicht 3",
      "Schicht 4",
      "Schicht 7"
    ],
    "correctAnswer": 2,
    "explanation": "TCP/UDP werden der Transportschicht 4 zugeordnet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-132",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "Welche OSI-Schicht hält Sitzungen bzw. Verbindungen aufrecht?",
    "answers": [
      "Schicht 2",
      "Schicht 4",
      "Schicht 5",
      "Schicht 7"
    ],
    "correctAnswer": 2,
    "explanation": "Schicht 5 ist die Sitzungsschicht.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-133",
    "category": "Netzwerk",
    "topic": "OSI",
    "difficulty": "medium",
    "question": "Welche OSI-Schicht ist für Formatierung, Übersetzung und Darstellung zuständig?",
    "answers": [
      "Schicht 3",
      "Schicht 5",
      "Schicht 6",
      "Schicht 7"
    ],
    "correctAnswer": 2,
    "explanation": "Schicht 6 ist die Darstellungsschicht.",
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
    "difficulty": "hard",
    "question": "Welche systematische Vorgehensweise eignet sich zur Fehlersuche anhand des OSI-Modells?",
    "answers": [
      "Von oben nach unten, beginnend mit der Anwendung",
      "Von unten nach oben, beginnend mit Kabel/WLAN",
      "Nur Schicht 7 prüfen",
      "Zuerst immer DNS löschen"
    ],
    "correctAnswer": 1,
    "explanation": "Die Fehlersuche erfolgt von unten nach oben: zuerst physische Verbindung, dann Netz, Verbindung und zuletzt Anwendung.",
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
      "Eine physische Netzwerkkarte",
      "Eine IP-Adresse",
      "Ein Dateiformat"
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
      "Nur Broadcasts",
      "Nur verschlüsselte UDP-Pakete"
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
      "Busy",
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
    "explanation": "404 bedeutet, dass die angeforderte Ressource nicht gefunden wurde.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-141",
    "category": "Netzwerk",
    "topic": "HTTP-HTTPS",
    "difficulty": "medium",
    "question": "Was ist der zentrale Sicherheitsnachteil von normalem HTTP?",
    "answers": [
      "Es funktioniert nur offline",
      "Daten werden unverschlüsselt als Klartext übertragen",
      "Es unterstützt keine Webseiten",
      "Es benötigt keinen Server"
    ],
    "correctAnswer": 1,
    "explanation": "Normales HTTP schützt den Inhalt nicht durch Verschlüsselung.",
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
      "HTTP ohne Server",
      "DNS über WLAN",
      "FTP mit Port 53"
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
      "FTP",
      "TLS",
      "SMTP",
      "POP3"
    ],
    "correctAnswer": 1,
    "explanation": "TLS ist der moderne Nachfolger von SSL.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-144",
    "category": "Netzwerk",
    "topic": "HTTP-HTTPS",
    "difficulty": "hard",
    "question": "Welche Aussage zu SSL/TLS ist korrekt?",
    "answers": [
      "SSL ist moderner als TLS",
      "TLS dient der sicheren Verschlüsselung im Internet",
      "TLS ersetzt DNS",
      "SSL/TLS sind reine Bildformate"
    ],
    "correctAnswer": 1,
    "explanation": "TLS dient der verschlüsselten Datenübertragung; SSL wird als veraltet beschrieben.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-145",
    "category": "Netzwerk",
    "topic": "E-Mail-Protokolle",
    "difficulty": "medium",
    "question": "Welches Protokoll dient primär zum Senden und Weiterleiten von E-Mails?",
    "answers": [
      "SMTP",
      "IMAP",
      "POP3",
      "DNS"
    ],
    "correctAnswer": 0,
    "explanation": "SMTP ist das Standardprotokoll zum Senden und Weiterleiten von E-Mails.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-146",
    "category": "Netzwerk",
    "topic": "E-Mail-Protokolle",
    "difficulty": "medium",
    "question": "Welche Aufgabe übernimmt SMTP NICHT?",
    "answers": [
      "E-Mails versenden",
      "E-Mails zwischen Mailservern weiterleiten",
      "E-Mails abrufen",
      "Mit einem Mailserver kommunizieren"
    ],
    "correctAnswer": 2,
    "explanation": "SMTP dient dem Versand, nicht dem Abruf von E-Mails.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-147",
    "category": "Netzwerk",
    "topic": "E-Mail-Protokolle",
    "difficulty": "medium",
    "question": "Welches Protokoll eignet sich besonders für dieselbe Mailbox auf Smartphone, Tablet und Laptop?",
    "answers": [
      "IMAP",
      "POP3",
      "FTP",
      "HTTP"
    ],
    "correctAnswer": 0,
    "explanation": "IMAP hält die Mails auf dem Server und synchronisiert Zustände zwischen Geräten.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-148",
    "category": "Netzwerk",
    "topic": "E-Mail-Protokolle",
    "difficulty": "medium",
    "question": "Wo bleiben E-Mails bei IMAP typischerweise gespeichert?",
    "answers": [
      "Nur lokal auf einem Gerät",
      "Auf dem Server",
      "Nur im Router",
      "Im DNS-Cache"
    ],
    "correctAnswer": 1,
    "explanation": "Bei IMAP bleiben die E-Mails auf dem Server.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-149",
    "category": "Netzwerk",
    "topic": "E-Mail-Protokolle",
    "difficulty": "medium",
    "question": "Welche Aussage beschreibt POP3 am besten?",
    "answers": [
      "Mails werden typischerweise heruntergeladen und danach vom Server entfernt",
      "Mails bleiben immer synchron auf mehreren Geräten",
      "Es sendet ausschließlich E-Mails",
      "Es verschlüsselt Webseiten"
    ],
    "correctAnswer": 0,
    "explanation": "POP3 wird als Abrufverfahren beschrieben, bei dem Mails lokal gespeichert und vom Server entfernt werden können.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-150",
    "category": "Netzwerk",
    "topic": "E-Mail-Protokolle",
    "difficulty": "hard",
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
    "question": "Was ist der wesentliche Sicherheitsnachteil von normalem FTP?",
    "answers": [
      "Es kann keine Dateien übertragen",
      "Daten und Passwörter können unverschlüsselt übertragen werden",
      "Es funktioniert nur lokal",
      "Es benötigt keinen Server"
    ],
    "correctAnswer": 1,
    "explanation": "Normales FTP wird als unsicher beschrieben, da Inhalte und Zugangsdaten im Klartext übertragen werden können.",
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
      "Ein DNS-Server",
      "Ein E-Mail-Protokoll",
      "Ein Webbrowser"
    ],
    "correctAnswer": 0,
    "explanation": "SFTP verwendet SSH für eine verschlüsselte Dateiübertragung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-154",
    "category": "Netzwerk",
    "topic": "FTP-SFTP",
    "difficulty": "hard",
    "question": "Welche Kombination ist korrekt?",
    "answers": [
      "FTP = verschlüsselt, SFTP = Klartext",
      "FTP = Klartext, SFTP = verschlüsselt",
      "FTP = DNS, SFTP = SMTP",
      "Beide sind ausschließlich E-Mail-Protokolle"
    ],
    "correctAnswer": 1,
    "explanation": "FTP überträgt Daten typischerweise unverschlüsselt, während SFTP eine verschlüsselte Verbindung nutzt.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-155",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "medium",
    "question": "Welche Hauptaufgabe hat DNS?",
    "answers": [
      "Namensauflösung von Domains zu IP-Adressen",
      "Vergabe von MAC-Adressen",
      "Verschlüsselung von Dateien",
      "Übertragung von E-Mails"
    ],
    "correctAnswer": 0,
    "explanation": "DNS übersetzt lesbare Namen in IP-Adressen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-156",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "medium",
    "question": "Welcher anschauliche Vergleich beschreibt die Aufgabe von DNS?",
    "answers": [
      "Telefonbuch des Internets",
      "Briefkasten",
      "Pizzabote",
      "Netzwerkkabel"
    ],
    "correctAnswer": 0,
    "explanation": "DNS wird als Telefonbuch bzw. Dolmetscher des Internets beschrieben.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-157",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "medium",
    "question": "Welcher Standard-Port wird für DNS verwendet?",
    "answers": [
      "21",
      "25",
      "53",
      "443"
    ],
    "correctAnswer": 2,
    "explanation": "DNS verwendet standardmäßig Port 53.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-158",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "medium",
    "question": "Welcher Befehl kann zur DNS-Analyse verwendet werden?",
    "answers": [
      "nslookup",
      "format",
      "mkdir",
      "taskkill"
    ],
    "correctAnswer": 0,
    "explanation": "nslookup wird zur Namensauflösung bzw. DNS-Analyse verwendet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-159",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "hard",
    "question": "Welche Aussage über DNS ist korrekt?",
    "answers": [
      "DNS sagt einem Webserver, welche Webseite er ausliefern soll",
      "DNS hilft dem Computer, die IP-Adresse zu einem Namen zu finden",
      "DNS verschlüsselt HTTP automatisch",
      "DNS ersetzt Routing"
    ],
    "correctAnswer": 1,
    "explanation": "DNS dient der Namensauflösung und nicht der Steuerung der Anwendung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-160",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "medium",
    "question": "Welcher Windows-Befehl zeigt die Route beziehungsweise die Hops zu einem Ziel?",
    "answers": [
      "tracert",
      "nslookup",
      "echo",
      "cls"
    ],
    "correctAnswer": 0,
    "explanation": "tracert zeigt die Stationen/Hops auf dem Weg zum Ziel.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-161",
    "category": "Netzwerk",
    "topic": "OSI Schicht 6",
    "difficulty": "medium",
    "question": "Was ist die Hauptaufgabe der Darstellungsschicht (Schicht 6)?",
    "answers": [
      "Daten passend, lesbar und sicher darstellen",
      "IP-Routen auswählen",
      "MAC-Adressen vergeben",
      "Kabelsignale erzeugen"
    ],
    "correctAnswer": 0,
    "explanation": "Schicht 6 kümmert sich um Darstellung, Formatumwandlung, Verschlüsselung und Kompression.",
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
    "question": "Welches Beispiel gehört zur Zeichencodierung und damit zur Darstellungsschicht?",
    "answers": [
      "UTF-8",
      "IP",
      "MAC",
      "TCP"
    ],
    "correctAnswer": 0,
    "explanation": "UTF-8 ist eine Zeichencodierung und wird der Darstellungsebene zugeordnet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-164",
    "category": "Netzwerk",
    "topic": "OSI Schicht 6",
    "difficulty": "medium",
    "question": "Welche Gruppe besteht aus Datenformaten beziehungsweise Standards und nicht aus Netzwerkprotokollen?",
    "answers": [
      "JPEG, PNG, UTF-8, JSON, gzip",
      "HTTP, SMTP, DNS, FTP",
      "TCP, UDP, IP, ARP",
      "SIP, RPC, NetBIOS, PPTP"
    ],
    "correctAnswer": 0,
    "explanation": "JPEG/PNG/UTF-8/JSON/gzip werden als Formate bzw. Standards genannt.",
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
      "Ein Routingprotokoll",
      "Ein Dateitransferprotokoll",
      "Eine Netzwerktopologie"
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
      "Es unterstützt nur englische Grundzeichen und zu wenige Zeichen",
      "Es ist verschlüsselt",
      "Es funktioniert nur im WLAN",
      "Es ist ein Bildformat"
    ],
    "correctAnswer": 0,
    "explanation": "ASCII hat zu wenige Zeichenplätze für Umlaute, viele Schriftsysteme und Emojis.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-168",
    "category": "Netzwerk",
    "topic": "OSI Schicht 6",
    "difficulty": "medium",
    "question": "Welche Codierung unterstützt internationale Zeichen umfassend?",
    "answers": [
      "UTF-8",
      "ASCII-7",
      "POP3",
      "FTP"
    ],
    "correctAnswer": 0,
    "explanation": "UTF-8 unterstützt eine sehr große Zahl internationaler Zeichen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-169",
    "category": "Netzwerk",
    "topic": "OSI Schicht 6",
    "difficulty": "hard",
    "question": "Eine Webseite zeigt 'Ã¤' statt 'ä'. Welche OSI-Schicht ist bei einem Darstellungs- oder Codierungsproblem am ehesten betroffen?",
    "answers": [
      "Schicht 2",
      "Schicht 3",
      "Schicht 6",
      "Schicht 7"
    ],
    "correctAnswer": 2,
    "explanation": "Ein fehlerhaft dargestelltes Zeichen deutet auf ein Encoding-/Darstellungsproblem in Schicht 6.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-170",
    "category": "Netzwerk",
    "topic": "OSI Schicht 6",
    "difficulty": "hard",
    "question": "Welcher OSI-Schicht lässt sich ERR_ENCODING_UNSUPPORTED am ehesten zuordnen?",
    "answers": [
      "Schicht 4",
      "Schicht 5",
      "Schicht 6",
      "Schicht 7"
    ],
    "correctAnswer": 2,
    "explanation": "Der Fehler betrifft Zeichencodierung oder Kompression und wird Schicht 6 zugeordnet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-171",
    "category": "Netzwerk",
    "topic": "OSI Schicht 6",
    "difficulty": "hard",
    "question": "Welcher OSI-Schicht lässt sich ERR_SSL_PROTOCOL_ERROR in diesem Schichtenmodell am ehesten zuordnen?",
    "answers": [
      "Schicht 1",
      "Schicht 3",
      "Schicht 6",
      "Schicht 7"
    ],
    "correctAnswer": 2,
    "explanation": "Ein SSL/TLS-Handshake- beziehungsweise Protokollfehler wird hier der Darstellungsschicht zugeordnet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-172",
    "category": "Netzwerk",
    "topic": "OSI Schicht 6",
    "difficulty": "medium",
    "question": "Welche Merkhilfe unterscheidet Schicht 7 von Schicht 6?",
    "answers": [
      "Schicht 7: WAS wird gesendet? Schicht 6: WIE sieht es aus?",
      "Schicht 7: Welche MAC? Schicht 6: Welche IP?",
      "Schicht 7: Welche Route? Schicht 6: Welche Leitung?",
      "Schicht 7: Welches Kabel? Schicht 6: Welcher Switch?"
    ],
    "correctAnswer": 0,
    "explanation": "Schicht 7 behandelt, WAS gesendet wird, während Schicht 6 beschreibt, WIE die Daten dargestellt werden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-173",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Was ist die Hauptaufgabe der Sitzungsschicht (Schicht 5)?",
    "answers": [
      "Sitzungen zwischen Geräten aufbauen, aufrechterhalten und beenden",
      "IP-Adressen vergeben",
      "Kabelsignale übertragen",
      "Dateiformate konvertieren"
    ],
    "correctAnswer": 0,
    "explanation": "Schicht 5 steuert Sitzungen bzw. logische Verbindungen zwischen Geräten.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-174",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Welche Aufgabe gehört zur Sitzungsschicht?",
    "answers": [
      "Dialogsteuerung",
      "Routing",
      "MAC-Adressierung",
      "Bitübertragung"
    ],
    "correctAnswer": 0,
    "explanation": "Die Sitzungsschicht regelt unter anderem, wer wann kommuniziert.",
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
      "IP-Adressen zu speichern",
      "Ports zu verschlüsseln",
      "MAC-Adressen zu ersetzen"
    ],
    "correctAnswer": 0,
    "explanation": "Checkpoints erleichtern die Wiederaufnahme nach Verbindungsabbrüchen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-176",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Welcher Merksatz beschreibt die Aufgabe von OSI-Schicht 5?",
    "answers": [
      "Wir treffen uns, bleiben verbunden und verabschieden uns",
      "Wir routen, bis wir das Ziel finden",
      "Wir übersetzen jedes Zeichen",
      "Wir senden nur Broadcasts"
    ],
    "correctAnswer": 0,
    "explanation": "Der Merksatz beschreibt Aufbau, Aufrechterhaltung und Ende einer Sitzung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-177",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "medium",
    "question": "Welche Technologie hilft Geräten im lokalen Netz, sich über Namen zu finden und Sitzungen aufzubauen?",
    "answers": [
      "NetBIOS",
      "FTP",
      "SMTP",
      "HTTPS"
    ],
    "correctAnswer": 0,
    "explanation": "NetBIOS übernimmt unter anderem Namensauflösung und Sitzungsverwaltung im lokalen Netz.",
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
      "Eine Domain in eine IP umzuwandeln",
      "E-Mails zu synchronisieren",
      "Eine Datei als JPEG zu komprimieren"
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
      "DNS-Auflösung",
      "Dateikompression"
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
      "Gespräch beendet",
      "Verbindung wird aufgebaut, es klingelt",
      "Nummer existiert nicht",
      "Gegenstelle ist besetzt"
    ],
    "correctAnswer": 1,
    "explanation": "180 Ringing bedeutet, dass die Gegenstelle klingelt.",
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
      "TLS-Fehler"
    ],
    "correctAnswer": 2,
    "explanation": "486 Busy Here signalisiert eine besetzte Gegenstelle.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-184",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "hard",
    "question": "Welche Aussage zu SIP-Statuscodes ist korrekt?",
    "answers": [
      "Sie gehören trotz Sitzungssteuerung zur Anwendungsebene",
      "Sie gehören immer zu Schicht 1",
      "Sie sind keine Statuscodes",
      "Sie ersetzen HTTP vollständig"
    ],
    "correctAnswer": 0,
    "explanation": "SIP-Statuscodes gehören zur Anwendungsebene, auch wenn SIP Sitzungen steuert.",
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
      "Für E-Mail-Synchronisation",
      "Für DNS",
      "Für Bildkompression"
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
      "Modern und empfohlen",
      "Veraltet und mit Sicherheitslücken",
      "Nur für WLAN geeignet",
      "Standard für Webseiten"
    ],
    "correctAnswer": 1,
    "explanation": "PPTP wird als veraltet und sicherheitsproblematisch beschrieben.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-187",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "hard",
    "question": "Welcher OSI-Schicht wird ECONNRESET (Connection Reset by Peer) in diesem Schichtenmodell zugeordnet?",
    "answers": [
      "Schicht 2",
      "Schicht 3",
      "Schicht 5",
      "Schicht 7"
    ],
    "correctAnswer": 2,
    "explanation": "ECONNRESET wird als abrupter Sitzungsabbruch und damit als Schicht-5-Problem eingeordnet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-188",
    "category": "Netzwerk",
    "topic": "OSI Schicht 5",
    "difficulty": "hard",
    "question": "Welcher OSI-Schicht wird HTTP 408 Request Timeout in diesem Schichtenmodell zugeordnet?",
    "answers": [
      "Schicht 1",
      "Schicht 4",
      "Schicht 5",
      "Schicht 7"
    ],
    "correctAnswer": 2,
    "explanation": "HTTP 408 wird hier als abgelaufene Sitzung in Schicht 5 eingeordnet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-189",
    "category": "Netzwerk",
    "topic": "OSI Szenarien",
    "difficulty": "hard",
    "question": "Ein Browser fordert per GET eine Webseite an. Welche Schicht steht dabei im Vordergrund?",
    "answers": [
      "Schicht 3 Vermittlung",
      "Schicht 5 Sitzung",
      "Schicht 6 Darstellung",
      "Schicht 7 Anwendung"
    ],
    "correctAnswer": 3,
    "explanation": "GET ist eine HTTP-Anfrage und wird der Anwendungsschicht zugeordnet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-190",
    "category": "Netzwerk",
    "topic": "OSI Szenarien",
    "difficulty": "hard",
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
    "topic": "OSI Szenarien",
    "difficulty": "hard",
    "question": "Ein Router sucht den besten Weg zu einem Zielnetz. Welche Schicht ist gemeint?",
    "answers": [
      "Schicht 2",
      "Schicht 3",
      "Schicht 5",
      "Schicht 7"
    ],
    "correctAnswer": 1,
    "explanation": "Routing gehört zur Vermittlungsschicht 3.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-192",
    "category": "Netzwerk",
    "topic": "OSI Szenarien",
    "difficulty": "hard",
    "question": "Eine Datei wird vor dem Versand gezippt und verschlüsselt. Welche Schicht passt am besten?",
    "answers": [
      "Schicht 1",
      "Schicht 4",
      "Schicht 6",
      "Schicht 7"
    ],
    "correctAnswer": 2,
    "explanation": "Kompression und Verschlüsselung werden der Darstellungsschicht 6 zugeordnet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-193",
    "category": "Netzwerk",
    "topic": "OSI Szenarien",
    "difficulty": "hard",
    "question": "TCP bestätigt die vollständige Ankunft von Paketen. Welche Schicht ist gemeint?",
    "answers": [
      "Schicht 2",
      "Schicht 4",
      "Schicht 5",
      "Schicht 7"
    ],
    "correctAnswer": 1,
    "explanation": "TCP gehört zur Transportschicht 4.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-194",
    "category": "Netzwerk",
    "topic": "OSI Szenarien",
    "difficulty": "hard",
    "question": "Ein Webserver ist erreichbar, antwortet aber mit 404 Not Found. Welche OSI-Schicht ist betroffen?",
    "answers": [
      "Schicht 3",
      "Schicht 5",
      "Schicht 6",
      "Schicht 7"
    ],
    "correctAnswer": 3,
    "explanation": "404 ist ein Anwendungsfehler: Die Verbindung funktioniert, aber die Ressource existiert nicht.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-195",
    "category": "Netzwerk",
    "topic": "OSI Szenarien",
    "difficulty": "hard",
    "question": "Ein Webserver-Skript stürzt ab und liefert 500 Internal Server Error. Welche Schicht ist betroffen?",
    "answers": [
      "Schicht 1",
      "Schicht 4",
      "Schicht 6",
      "Schicht 7"
    ],
    "correctAnswer": 3,
    "explanation": "500 Internal Server Error wird als Fehler der Anwendungsschicht eingeordnet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-196",
    "category": "Netzwerk",
    "topic": "OSI Szenarien",
    "difficulty": "hard",
    "question": "Eine Kundin möchte E-Mails auf Handy, Tablet und Laptop synchron halten. Was empfiehlst du?",
    "answers": [
      "POP3",
      "IMAP",
      "FTP",
      "PPTP"
    ],
    "correctAnswer": 1,
    "explanation": "IMAP ist für synchronisierte Mailboxen auf mehreren Geräten geeignet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-197",
    "category": "Netzwerk",
    "topic": "OSI Szenarien",
    "difficulty": "hard",
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
    "topic": "OSI Szenarien",
    "difficulty": "hard",
    "question": "Ein PC soll herausfinden, welche IP-Adresse hinter daa.de steckt. Welcher Dienst ist zuständig?",
    "answers": [
      "SMTP",
      "DNS",
      "FTP",
      "SIP"
    ],
    "correctAnswer": 1,
    "explanation": "DNS löst Domainnamen in IP-Adressen auf.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-199",
    "category": "Netzwerk",
    "topic": "OSI Szenarien",
    "difficulty": "hard",
    "question": "Welche Abfolge beschreibt das Versenden einer E-Mail durch die OSI-Schichten korrekt?",
    "answers": [
      "SMTP → UTF-8/TLS → Sitzung → TCP → IP → MAC/Frames → Signale",
      "DNS → FTP → POP3 → SIP → JPEG → MAC → Strom",
      "TCP → SMTP → IP → HTTPS → WLAN → ASCII → DNS",
      "MAC → IP → TCP → Sitzung → TLS → SMTP → Signale"
    ],
    "correctAnswer": 0,
    "explanation": "Von oben nach unten folgen Anwendung/SMTP, Darstellung/UTF-8-TLS, Sitzung, Transport/TCP, Vermittlung/IP, Sicherung/MAC und Bitübertragung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-200",
    "category": "Netzwerk",
    "topic": "OSI Szenarien",
    "difficulty": "hard",
    "question": "Was passiert laut OSI-Modell beim Empfangen einer Nachricht?",
    "answers": [
      "Die Daten durchlaufen die Schichten von 1 nach 7",
      "Die Daten durchlaufen die Schichten von 7 nach 1",
      "Nur Schicht 4 und 7 werden verwendet",
      "Die Reihenfolge ist beliebig"
    ],
    "correctAnswer": 0,
    "explanation": "Beim Empfangen werden die Daten von unten nach oben verarbeitet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-201",
    "category": "Netzwerk",
    "topic": "Protokolle",
    "difficulty": "hard",
    "question": "Welche Zuordnung ist vollständig korrekt?",
    "answers": [
      "SMTP=Senden, IMAP=Synchronisieren/Abrufen, DNS=Namensauflösung, SFTP=verschlüsselte Dateiübertragung",
      "SMTP=DNS, IMAP=Routing, DNS=Dateiübertragung, SFTP=E-Mail",
      "SMTP=Kompression, IMAP=Verschlüsselung, DNS=VoIP, SFTP=Broadcast",
      "SMTP=MAC, IMAP=TCP, DNS=JPEG, SFTP=ASCII"
    ],
    "correctAnswer": 0,
    "explanation": "Die vier Protokolle/Dienste erfüllen genau diese Aufgaben.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-202",
    "category": "Netzwerk",
    "topic": "Protokolle",
    "difficulty": "hard",
    "question": "Welche Aussage ist falsch?",
    "answers": [
      "SMTP dient dem Senden von E-Mails",
      "IMAP eignet sich für mehrere synchronisierte Geräte",
      "DNS löst Namen in IP-Adressen auf",
      "POP3 ist für Live-Synchronisation mehrerer Geräte optimiert"
    ],
    "correctAnswer": 3,
    "explanation": "IMAP unterstützt die Synchronisation über mehrere Geräte; POP3 ist dafür ungeeignet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-203",
    "category": "Netzwerk",
    "topic": "Protokolle",
    "difficulty": "hard",
    "question": "Welche Aussage über HTTP und HTTPS ist korrekt?",
    "answers": [
      "HTTP ist Klartext; HTTPS schützt die Übertragung durch TLS",
      "HTTPS ist unverschlüsselt, HTTP verschlüsselt",
      "HTTP dient nur E-Mail",
      "HTTPS ersetzt DNS"
    ],
    "correctAnswer": 0,
    "explanation": "HTTP wird als unverschlüsselt beschrieben, HTTPS nutzt Verschlüsselung.",
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
    "topic": "Topologien",
    "difficulty": "hard",
    "question": "Ein Netz soll trotz Ausfall einzelner Verbindungen alternative Wege bieten. Welche Topologie passt am besten?",
    "answers": [
      "Bus",
      "Ring",
      "Mesh",
      "Punkt-zu-Punkt"
    ],
    "correctAnswer": 2,
    "explanation": "Mesh bietet mehrere mögliche Wege und hohe Ausfallsicherheit.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-206",
    "category": "Netzwerk",
    "topic": "Topologien",
    "difficulty": "hard",
    "question": "Ein günstiges Alt-Netz verwendet ein gemeinsames Hauptkabel und Terminatoren an beiden Enden. Welche Topologie ist das?",
    "answers": [
      "Stern",
      "Bus",
      "Baum",
      "Mesh"
    ],
    "correctAnswer": 1,
    "explanation": "Gemeinsames Hauptkabel mit Terminatoren ist typisch für Bus.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-207",
    "category": "Netzwerk",
    "topic": "Netzwerkarchitektur",
    "difficulty": "hard",
    "question": "Welche Architektur passt zu einer kleinen Gruppe gleichberechtigter PCs, die direkt Ressourcen miteinander teilen, ohne zentralen Server?",
    "answers": [
      "Client-Server",
      "Peer-to-Peer",
      "WAN",
      "Full Mesh zwingend"
    ],
    "correctAnswer": 1,
    "explanation": "P2P verzichtet auf eine zentrale Serverrolle und ermöglicht direkte Ressourcenteilung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-208",
    "category": "Netzwerk",
    "topic": "Netzwerkarchitektur",
    "difficulty": "hard",
    "question": "Ein zentraler Server stellt Dateien und Dienste bereit, mehrere Arbeitsplätze greifen darauf zu. Welche Architektur liegt vor?",
    "answers": [
      "Peer-to-Peer",
      "Client-Server",
      "Bus",
      "PAN"
    ],
    "correctAnswer": 1,
    "explanation": "Das ist das klassische Client-Server-Prinzip.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-209",
    "category": "Netzwerk",
    "topic": "Anwendungsschicht",
    "difficulty": "medium",
    "question": "Welche Aufgabe hat die Anwendungsschicht im OSI-Modell?",
    "answers": [
      "Sie stellt Netzwerkdienste für Anwendungen bereit",
      "Sie überträgt elektrische Signale",
      "Sie berechnet Routingtabellen",
      "Sie verwaltet MAC-Adressen"
    ],
    "correctAnswer": 0,
    "explanation": "Schicht 7 bildet die Schnittstelle zwischen Anwendungen und Netzwerkdiensten.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-210",
    "category": "Netzwerk",
    "topic": "Anwendungsschicht",
    "difficulty": "medium",
    "question": "Welche Aussage zur Anwendungsschicht ist richtig?",
    "answers": [
      "Chrome selbst ist die Anwendungsschicht",
      "Die Schicht stellt Regeln und Netzwerkdienste für Programme bereit",
      "Sie ist ausschließlich für Kabel zuständig",
      "Sie vergibt IP-Adressen"
    ],
    "correctAnswer": 1,
    "explanation": "Nicht die App selbst ist die Schicht, sondern die Netzwerkfunktionen und Regeln, die sie nutzt.",
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
    "topic": "Anwendungsschicht",
    "difficulty": "medium",
    "question": "Ein Browser fordert eine Webseite mit GET an. Welche Schicht steht dabei im Vordergrund?",
    "answers": [
      "Schicht 2",
      "Schicht 4",
      "Schicht 6",
      "Schicht 7"
    ],
    "correctAnswer": 3,
    "explanation": "HTTP-GET gehört zur Anwendungsschicht.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-213",
    "category": "Netzwerk",
    "topic": "Anwendungsschicht",
    "difficulty": "medium",
    "question": "Was beschreibt Schicht 7 am besten?",
    "answers": [
      "WAS eine Anwendung über das Netzwerk anfordert oder sendet",
      "WIE Bits elektrisch übertragen werden",
      "WELCHE MAC-Adresse ein Switch lernt",
      "WIE ein Kabel verlegt ist"
    ],
    "correctAnswer": 0,
    "explanation": "Als Merkhilfe beschreibt Schicht 7, WAS gesendet wird.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-214",
    "category": "Netzwerk",
    "topic": "Anwendungsschicht",
    "difficulty": "hard",
    "question": "Ein Webserver liefert '404 Not Found', obwohl Netzwerk und Verschlüsselung funktionieren. Welche Schicht ist betroffen?",
    "answers": [
      "Schicht 3",
      "Schicht 5",
      "Schicht 6",
      "Schicht 7"
    ],
    "correctAnswer": 3,
    "explanation": "404 ist ein Fehler auf Anwendungsebene.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-215",
    "category": "Netzwerk",
    "topic": "Anwendungsschicht",
    "difficulty": "hard",
    "question": "Ein PHP-Skript stürzt ab und der Server antwortet mit 500 Internal Server Error. Welche Schicht passt?",
    "answers": [
      "Schicht 1",
      "Schicht 4",
      "Schicht 6",
      "Schicht 7"
    ],
    "correctAnswer": 3,
    "explanation": "Der Fehler liegt in der Anwendung bzw. im Webserver-Programm.",
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
    "topic": "Anwendungsschicht",
    "difficulty": "medium",
    "question": "Was passiert bei HTTP nach einer Client-Anfrage normalerweise?",
    "answers": [
      "Der Server sendet eine Response",
      "Der Router vergibt eine neue MAC-Adresse",
      "Der Client sendet automatisch SMTP",
      "Der Switch führt DNS aus"
    ],
    "correctAnswer": 0,
    "explanation": "HTTP folgt dem Request-Response-Prinzip.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-218",
    "category": "Netzwerk",
    "topic": "Anwendungsschicht",
    "difficulty": "hard",
    "question": "Welche Aussage ist FALSCH?",
    "answers": [
      "Schicht 7 stellt Netzwerkdienste für Software bereit",
      "HTTP gehört zur Anwendungsschicht",
      "404 kann auf Schicht 7 auftreten",
      "Schicht 7 überträgt Bits als Funkwellen"
    ],
    "correctAnswer": 3,
    "explanation": "Bits als Funkwellen gehören zur Bitübertragungsschicht 1.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-219",
    "category": "Netzwerk",
    "topic": "Anwendungsschicht",
    "difficulty": "medium",
    "question": "Welche Frage hilft beim Erkennen von Schicht 7?",
    "answers": [
      "Was wird gesendet?",
      "Wie sieht das Datenformat aus?",
      "Welches Kabel wird verwendet?",
      "Welche MAC-Adresse ist lokal?"
    ],
    "correctAnswer": 0,
    "explanation": "Für Schicht 7 hilft die Frage: WAS wird gesendet?",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-220",
    "category": "Netzwerk",
    "topic": "Protokolle",
    "difficulty": "medium",
    "question": "Was ist ein Netzwerkprotokoll?",
    "answers": [
      "Eine vereinbarte Regel für Kommunikation zwischen Geräten",
      "Ein physisches Netzwerkkabel",
      "Eine Subnetzmaske",
      "Ein Dateisystem"
    ],
    "correctAnswer": 0,
    "explanation": "Protokolle definieren Regeln wie Reihenfolge, Format und Antworten.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-221",
    "category": "Netzwerk",
    "topic": "Protokolle",
    "difficulty": "medium",
    "question": "Welches Protokoll ist für das Senden von E-Mails zuständig?",
    "answers": [
      "SMTP",
      "IMAP",
      "DNS",
      "SIP"
    ],
    "correctAnswer": 0,
    "explanation": "SMTP dient dem Senden und Weiterleiten von E-Mails.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-222",
    "category": "Netzwerk",
    "topic": "Protokolle",
    "difficulty": "medium",
    "question": "Welches Protokoll ist für synchronisierten E-Mail-Abruf auf mehreren Geräten geeignet?",
    "answers": [
      "POP3",
      "IMAP",
      "FTP",
      "HTTP"
    ],
    "correctAnswer": 1,
    "explanation": "IMAP hält die Mailbox auf dem Server synchron.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-223",
    "category": "Netzwerk",
    "topic": "Protokolle",
    "difficulty": "medium",
    "question": "Welches Protokoll löst Domainnamen in IP-Adressen auf?",
    "answers": [
      "SFTP",
      "SMTP",
      "DNS",
      "RPC"
    ],
    "correctAnswer": 2,
    "explanation": "DNS führt die Namensauflösung durch.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-224",
    "category": "Netzwerk",
    "topic": "Protokolle",
    "difficulty": "medium",
    "question": "Welches Protokoll eignet sich für verschlüsselte Dateiübertragung?",
    "answers": [
      "FTP",
      "SFTP",
      "POP3",
      "SIP"
    ],
    "correctAnswer": 1,
    "explanation": "SFTP überträgt Dateien verschlüsselt über SSH.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-225",
    "category": "Netzwerk",
    "topic": "Protokolle",
    "difficulty": "medium",
    "question": "Welches Protokoll wird für den Aufbau und die Steuerung von VoIP-Sitzungen verwendet?",
    "answers": [
      "SIP",
      "DNS",
      "FTP",
      "IMAP"
    ],
    "correctAnswer": 0,
    "explanation": "SIP steuert Aufbau, Verwaltung und Ende von VoIP-Sitzungen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-226",
    "category": "Netzwerk",
    "topic": "Protokolle",
    "difficulty": "hard",
    "question": "Welche Zuordnung ist korrekt?",
    "answers": [
      "SMTP = Senden, IMAP = Synchronisieren, DNS = Namensauflösung, SFTP = sichere Dateiübertragung",
      "SMTP = Routing, IMAP = Verschlüsselung, DNS = E-Mail, SFTP = VoIP",
      "SMTP = Namensauflösung, IMAP = Routing, DNS = Dateiübertragung, SFTP = Mailversand",
      "SMTP = MAC, IMAP = IP, DNS = TCP, SFTP = UDP"
    ],
    "correctAnswer": 0,
    "explanation": "Diese Zuordnung entspricht den üblichen Aufgaben der genannten Protokolle.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-227",
    "category": "Netzwerk",
    "topic": "Protokolle",
    "difficulty": "hard",
    "question": "Welche Aussage ist FALSCH?",
    "answers": [
      "FTP kann Dateien übertragen",
      "SFTP verschlüsselt die Dateiübertragung",
      "DNS dient der Namensauflösung",
      "SMTP ist für den synchronen E-Mail-Abruf gedacht"
    ],
    "correctAnswer": 3,
    "explanation": "SMTP dient dem Versand, nicht dem synchronen Abruf.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-228",
    "category": "Netzwerk",
    "topic": "Protokolle",
    "difficulty": "hard",
    "question": "Ein Nutzer öffnet Online-Banking mit Schloss-Symbol im Browser. Welche Kombination passt am besten?",
    "answers": [
      "HTTP ohne Verschlüsselung",
      "HTTPS mit TLS",
      "POP3 mit DNS",
      "FTP mit SIP"
    ],
    "correctAnswer": 1,
    "explanation": "HTTPS nutzt TLS zur verschlüsselten Übertragung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-229",
    "category": "Netzwerk",
    "topic": "Subnetting",
    "difficulty": "medium",
    "question": "Was bedeutet Subnetting?",
    "answers": [
      "Ein großes Netz in kleinere Teilnetze aufteilen",
      "Mehrere Domains zusammenführen",
      "Eine IP-Adresse verschlüsseln",
      "Alle Broadcasts zusammenlegen"
    ],
    "correctAnswer": 0,
    "explanation": "Subnetting segmentiert ein größeres Netzwerk in kleinere Unternetze.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-230",
    "category": "Netzwerk",
    "topic": "Subnetting",
    "difficulty": "medium",
    "question": "Welcher Vorteil kann durch Subnetting entstehen?",
    "answers": [
      "Weniger Broadcast- und Datenverkehr pro Teilnetz",
      "Mehr Kollisionen",
      "Keine IP-Adressen mehr nötig",
      "Alle Geräte sehen mehr fremden Verkehr"
    ],
    "correctAnswer": 0,
    "explanation": "Kleinere Segmente können Verkehr und Datenstau reduzieren.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-231",
    "category": "Netzwerk",
    "topic": "Subnetting",
    "difficulty": "medium",
    "question": "Welchen Sicherheitsvorteil kann die Segmentierung eines Netzwerks bieten?",
    "answers": [
      "Netzbereiche lassen sich voneinander trennen",
      "Jeder Host kann automatisch alles mitlesen",
      "Passwörter werden automatisch verschlüsselt",
      "Firewalls werden überflüssig"
    ],
    "correctAnswer": 0,
    "explanation": "Segmentierung kann verhindern, dass Geräte fremden Datenverkehr einfach mitverfolgen.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-232",
    "category": "Netzwerk",
    "topic": "Subnetting",
    "difficulty": "medium",
    "question": "Welche Angabe beschreibt die Länge des Netzanteils einer IPv4-Adresse?",
    "answers": [
      "Prefix wie /24",
      "MAC-Adresse",
      "Portnummer",
      "DNS-Name"
    ],
    "correctAnswer": 0,
    "explanation": "Die Präfixlänge gibt die Zahl der Netzbits an.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-233",
    "category": "Netzwerk",
    "topic": "Subnetting",
    "difficulty": "medium",
    "question": "Welche Subnetzmaske gehört zu /24?",
    "answers": [
      "255.0.0.0",
      "255.255.0.0",
      "255.255.255.0",
      "255.255.255.254"
    ],
    "correctAnswer": 2,
    "explanation": "/24 entspricht 24 gesetzten Netzbits und damit 255.255.255.0.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-234",
    "category": "Netzwerk",
    "topic": "Subnetting",
    "difficulty": "hard",
    "question": "Im Netz 192.168.10.0/24: Welche Adresse ist die Broadcastadresse?",
    "answers": [
      "192.168.10.0",
      "192.168.10.1",
      "192.168.10.254",
      "192.168.10.255"
    ],
    "correctAnswer": 3,
    "explanation": "Bei diesem /24-Netz ist .255 die Broadcastadresse.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-235",
    "category": "Netzwerk",
    "topic": "Subnetting",
    "difficulty": "hard",
    "question": "Im Netz 192.168.10.0/24: Welche Adresse ist die Netzadresse?",
    "answers": [
      "192.168.10.0",
      "192.168.10.1",
      "192.168.10.128",
      "192.168.10.255"
    ],
    "correctAnswer": 0,
    "explanation": "Die Adresse mit allen Hostbits 0 ist die Netzadresse.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-236",
    "category": "Netzwerk",
    "topic": "Subnetting",
    "difficulty": "hard",
    "question": "Welche Aussage zu /24 ist richtig?",
    "answers": [
      "24 Bit gehören zum Netzanteil",
      "24 Hosts sind maximal erlaubt",
      "24 Bit gehören ausschließlich zum Hostanteil",
      "Port 24 wird reserviert"
    ],
    "correctAnswer": 0,
    "explanation": "Die Präfixlänge /24 bezeichnet 24 Netzbits.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-237",
    "category": "Netzwerk",
    "topic": "Subnetting",
    "difficulty": "hard",
    "question": "Warum teilt man große Netze häufig in kleinere Subnetze?",
    "answers": [
      "Um Struktur, Performance und Trennung zu verbessern",
      "Um DNS abzuschaffen",
      "Um MAC-Adressen zu ersetzen",
      "Damit alle Hosts dieselbe Broadcastadresse weltweit verwenden"
    ],
    "correctAnswer": 0,
    "explanation": "Subnetting verbessert Strukturierung, reduziert unnötigen Verkehr und ermöglicht Trennung.",
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
    "topic": "CSMA",
    "difficulty": "medium",
    "question": "Was macht CSMA/CA vor dem Senden?",
    "answers": [
      "Es prüft, ob das Medium frei ist",
      "Es ändert die IP-Adresse",
      "Es verschlüsselt das Paket",
      "Es setzt den DNS-Cache zurück"
    ],
    "correctAnswer": 0,
    "explanation": "CSMA/CA versucht eine Kollision vorab zu vermeiden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-241",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "medium",
    "question": "Was macht CSMA/CD bei einer erkannten Kollision?",
    "answers": [
      "Es stoppt die Übertragung",
      "Es vergibt eine neue MAC-Adresse",
      "Es wechselt zu DNS",
      "Es aktiviert IMAP"
    ],
    "correctAnswer": 0,
    "explanation": "CSMA/CD erkennt eine Kollision während des Sendens und bricht ab.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-242",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "medium",
    "question": "Welches Zugriffsverfahren wird WLAN zugeordnet?",
    "answers": [
      "CSMA/CA",
      "CSMA/CD",
      "POP3",
      "ARP"
    ],
    "correctAnswer": 0,
    "explanation": "WLAN verwendet Collision Avoidance, also CSMA/CA.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-243",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "medium",
    "question": "Welches Zugriffsverfahren wird klassisch kabelgebundenem Ethernet zugeordnet?",
    "answers": [
      "CSMA/CA",
      "CSMA/CD",
      "SIP",
      "DNS"
    ],
    "correctAnswer": 1,
    "explanation": "Klassisches kabelgebundenes Ethernet verwendet Collision Detection, also CSMA/CD.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-244",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "hard",
    "question": "Warum ist 'erst lauschen, dann senden' typisch für CSMA/CA?",
    "answers": [
      "Weil Kollisionen möglichst vor dem Senden vermieden werden sollen",
      "Weil IP-Adressen überprüft werden",
      "Weil DNS langsamer ist",
      "Weil jedes Paket verschlüsselt werden muss"
    ],
    "correctAnswer": 0,
    "explanation": "Collision Avoidance versucht Konflikte vorab zu vermeiden.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-245",
    "category": "Netzwerk",
    "topic": "CSMA",
    "difficulty": "hard",
    "question": "Welche Aussage beschreibt den Unterschied am besten?",
    "answers": [
      "CA versucht Kollisionen zu vermeiden, CD erkennt sie während der Übertragung",
      "CA arbeitet nur mit E-Mail, CD nur mit Webseiten",
      "CA vergibt IPs, CD vergibt MACs",
      "Beide sind identisch"
    ],
    "correctAnswer": 0,
    "explanation": "Das ist der zentrale Unterschied zwischen Avoidance und Detection.",
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
    "topic": "FTP-SFTP",
    "difficulty": "medium",
    "question": "Welche Aufgabe erfüllt FTP?",
    "answers": [
      "Dateien zwischen Client und Server übertragen",
      "Domains auflösen",
      "E-Mails synchronisieren",
      "VoIP-Sitzungen starten"
    ],
    "correctAnswer": 0,
    "explanation": "FTP dient dem Upload und Download von Dateien.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-248",
    "category": "Netzwerk",
    "topic": "FTP-SFTP",
    "difficulty": "medium",
    "question": "Was ist das zentrale Sicherheitsproblem von normalem FTP?",
    "answers": [
      "Daten und Passwörter können unverschlüsselt übertragen werden",
      "Es kann keine Ordner übertragen",
      "Es funktioniert nur auf einem PC",
      "Es hat keine Serverunterstützung"
    ],
    "correctAnswer": 0,
    "explanation": "Normales FTP überträgt Informationen typischerweise unverschlüsselt.",
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
    "topic": "FTP-SFTP",
    "difficulty": "medium",
    "question": "Was macht SFTP sicherer als klassisches FTP?",
    "answers": [
      "Es nutzt einen verschlüsselten SSH-Tunnel",
      "Es verwendet ausschließlich Broadcasts",
      "Es ersetzt IP-Adressen",
      "Es nutzt POP3"
    ],
    "correctAnswer": 0,
    "explanation": "SFTP schützt die Übertragung durch SSH-Verschlüsselung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-251",
    "category": "Netzwerk",
    "topic": "FTP-SFTP",
    "difficulty": "hard",
    "question": "Du lädst Firmen-Dokumente über ein öffentliches WLAN auf einen Server. Welche Variante ist sinnvoller?",
    "answers": [
      "FTP",
      "SFTP",
      "POP3",
      "HTTP ohne TLS"
    ],
    "correctAnswer": 1,
    "explanation": "SFTP ist für verschlüsselte Dateiübertragung geeignet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-252",
    "category": "Netzwerk",
    "topic": "FTP-SFTP",
    "difficulty": "hard",
    "question": "Welche Aussage ist korrekt?",
    "answers": [
      "FTP und SFTP sind identisch verschlüsselt",
      "FTP ist typischerweise Klartext, SFTP verschlüsselt",
      "SFTP ist ein Mailprotokoll",
      "FTP ist ein DNS-Dienst"
    ],
    "correctAnswer": 1,
    "explanation": "Der wesentliche Sicherheitsunterschied liegt in der verschlüsselten Übertragung durch SFTP.",
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
    "topic": "Netzwerkarten",
    "difficulty": "medium",
    "question": "Ein Bürogebäude mit PCs und Druckern bildet typischerweise welches Netz?",
    "answers": [
      "PAN",
      "LAN",
      "MAN",
      "GAN"
    ],
    "correctAnswer": 1,
    "explanation": "Ein Gebäude gehört typischerweise zu einem LAN.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-256",
    "category": "Netzwerk",
    "topic": "Netzwerkarten",
    "difficulty": "medium",
    "question": "Ein Netz verbindet mehrere Standorte innerhalb einer Stadt. Welche Kategorie passt?",
    "answers": [
      "PAN",
      "LAN",
      "MAN",
      "GAN"
    ],
    "correctAnswer": 2,
    "explanation": "MAN deckt eine Stadt oder Region ab.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-257",
    "category": "Netzwerk",
    "topic": "Netzwerkarten",
    "difficulty": "medium",
    "question": "Mehrere Firmenstandorte in unterschiedlichen Bundesländern werden verbunden. Welche Kategorie passt am besten?",
    "answers": [
      "PAN",
      "LAN",
      "WAN",
      "Bluetooth"
    ],
    "correctAnswer": 2,
    "explanation": "WAN verbindet große geografische Entfernungen.",
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
    "topic": "Netzwerkarten",
    "difficulty": "hard",
    "question": "Welcher Unterschied zwischen LAN und MAN ist am treffendsten?",
    "answers": [
      "LAN ist lokal begrenzt, MAN erstreckt sich über Stadt/Region",
      "LAN ist immer drahtlos, MAN immer kabelgebunden",
      "LAN hat keine IP-Adressen",
      "MAN benötigt keine Router"
    ],
    "correctAnswer": 0,
    "explanation": "Der wesentliche Unterschied ist die räumliche Ausdehnung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-260",
    "category": "Netzwerk",
    "topic": "Netzwerkarten",
    "difficulty": "hard",
    "question": "Welche Aussage ist FALSCH?",
    "answers": [
      "PAN umfasst die direkte persönliche Umgebung",
      "LAN kann ein Firmengelände abdecken",
      "MAN kann eine Stadt verbinden",
      "WAN ist kleiner als PAN"
    ],
    "correctAnswer": 3,
    "explanation": "WAN deckt wesentlich größere Entfernungen als PAN ab.",
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
    "question": "Was liefert DNS typischerweise zu 'www.beispiel.de'?",
    "answers": [
      "Eine passende IP-Adresse",
      "Eine MAC-Adresse des lokalen Switches",
      "Ein Dateiformat",
      "Eine Portfreigabe"
    ],
    "correctAnswer": 0,
    "explanation": "DNS übersetzt Namen in IP-Adressen.",
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
    "topic": "DNS",
    "difficulty": "hard",
    "question": "Was macht 'nslookup www.google.de'?",
    "answers": [
      "Fragt DNS-Informationen bzw. die IP zum Namen ab",
      "Löscht die Netzwerkkarte",
      "Startet einen FTP-Upload",
      "Zeigt nur MAC-Adressen"
    ],
    "correctAnswer": 0,
    "explanation": "nslookup wird zur DNS-/Namensauflösungsanalyse verwendet.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-265",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "hard",
    "question": "Was zeigt 'tracert' primär?",
    "answers": [
      "Die Zwischenstationen/Hops zum Ziel",
      "Die IMAP-Mailbox",
      "Die CPU-Auslastung",
      "Die Subnetzmaske eines fremden Servers automatisch"
    ],
    "correctAnswer": 0,
    "explanation": "tracert zeigt den Weg über mehrere Stationen zum Ziel.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-266",
    "category": "Netzwerk",
    "topic": "DNS",
    "difficulty": "hard",
    "question": "Welche Aussage ist FALSCH?",
    "answers": [
      "DNS hilft bei der Namensauflösung",
      "DNS verwendet standardmäßig Port 53",
      "DNS sagt dem Webserver direkt, welche Datei er ausliefern soll",
      "nslookup kann DNS-Antworten prüfen"
    ],
    "correctAnswer": 2,
    "explanation": "DNS findet Adressen; es steuert nicht die Webanwendung.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-267",
    "category": "Netzwerk",
    "topic": "E-Mail-Protokolle",
    "difficulty": "medium",
    "question": "Welches Protokoll würdest du zum Versenden einer E-Mail verwenden?",
    "answers": [
      "SMTP",
      "IMAP",
      "POP3",
      "DNS"
    ],
    "correctAnswer": 0,
    "explanation": "SMTP dient dem Versand.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-268",
    "category": "Netzwerk",
    "topic": "E-Mail-Protokolle",
    "difficulty": "medium",
    "question": "Welches Protokoll lässt E-Mails auf dem Server und synchronisiert mehrere Geräte?",
    "answers": [
      "SMTP",
      "IMAP",
      "POP3",
      "FTP"
    ],
    "correctAnswer": 1,
    "explanation": "IMAP hält den Zustand der Mailbox serverseitig synchron.",
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
    "topic": "E-Mail-Protokolle",
    "difficulty": "hard",
    "question": "Du liest eine Mail auf dem Handy; am Laptop ist sie sofort ebenfalls als gelesen markiert. Warum?",
    "answers": [
      "Weil IMAP synchronisiert",
      "Weil SMTP synchronisiert",
      "Weil POP3 broadcastet",
      "Weil DNS den Status speichert"
    ],
    "correctAnswer": 0,
    "explanation": "IMAP synchronisiert Änderungen über mehrere Geräte.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-271",
    "category": "Netzwerk",
    "topic": "E-Mail-Protokolle",
    "difficulty": "hard",
    "question": "Welche Aussage ist korrekt?",
    "answers": [
      "SMTP sendet, IMAP und POP3 dienen dem Abruf",
      "IMAP sendet, SMTP löst Namen auf",
      "POP3 verschlüsselt Webseiten",
      "DNS synchronisiert E-Mails"
    ],
    "correctAnswer": 0,
    "explanation": "SMTP ist für Versand, IMAP/POP3 für Abruf.",
    "source": "netzwerk.csv"
  },
  {
    "id": "netzwerk-272",
    "category": "Netzwerk",
    "topic": "E-Mail-Protokolle",
    "difficulty": "hard",
    "question": "Für eine Nutzerin mit Handy, Tablet und Laptop: Welche Empfehlung passt am besten?",
    "answers": [
      "IMAP, weil die Mailbox synchron bleibt",
      "POP3, weil jede Mail nur auf einem Gerät liegen soll",
      "FTP, weil es E-Mails sortiert",
      "DNS, weil es gelesen/ungelesen synchronisiert"
    ],
    "correctAnswer": 0,
    "explanation": "Für mehrere Geräte ist IMAP die passende Wahl.",
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
    "question": "Welche Aufgabe hat eine Variable in einem Programm?",
    "answers": [
      "Sie speichert einen Wert, der im Programm verwendet werden kann",
      "Sie kompiliert automatisch den gesamten Quellcode",
      "Sie ersetzt eine Funktion",
      "Sie stellt eine Netzwerkverbindung her"
    ],
    "correctAnswer": 0,
    "explanation": "Eine Variable speichert einen Wert, auf den das Programm später zugreifen und den es gegebenenfalls verändern kann.",
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
    "question": "Wozu wird eine Schleife verwendet?",
    "answers": [
      "Um einen Programmabschnitt mehrfach auszuführen",
      "Um eine Datei dauerhaft zu verschlüsseln",
      "Um eine Variable automatisch zu löschen",
      "Um einen Webserver zu installieren"
    ],
    "correctAnswer": 0,
    "explanation": "Schleifen wie for oder while führen einen Codeblock wiederholt aus, solange die jeweilige Bedingung dies vorsieht.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-007",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aufgabe hat eine Funktion hauptsächlich?",
    "answers": [
      "Sie fasst wiederverwendbare Programmlogik unter einem Namen zusammen",
      "Sie speichert ausschließlich Bilder",
      "Sie ersetzt automatisch alle Variablen",
      "Sie dient nur zur Ausgabe von Fehlermeldungen"
    ],
    "correctAnswer": 0,
    "explanation": "Eine Funktion kapselt Programmlogik und kann mehrfach aufgerufen werden. Sie kann außerdem Parameter empfangen und Werte zurückgeben.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-008",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Array?",
    "answers": [
      "Eine geordnete Sammlung mehrerer Werte",
      "Eine einzelne boolesche Variable",
      "Eine Netzwerkadresse",
      "Eine Art Betriebssystem"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Array speichert mehrere Werte in einer geordneten Struktur, auf deren Elemente typischerweise über Indizes zugegriffen werden kann.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-009",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "medium",
    "question": "Welchen Wert kann eine boolesche Variable typischerweise annehmen?",
    "answers": [
      "Nur true oder false",
      "Nur ganze Zahlen",
      "Nur Zeichenketten",
      "Beliebige Dateien"
    ],
    "correctAnswer": 0,
    "explanation": "Der Datentyp Boolean repräsentiert zwei Wahrheitswerte: true und false.",
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
    "difficulty": "hard",
    "question": "Ein Array lautet const values = [10, 20, 30, 40];. Welchen Wert liefert values[2]?",
    "answers": [
      "10",
      "20",
      "30",
      "40"
    ],
    "correctAnswer": 2,
    "explanation": "Arrays beginnen in JavaScript beim Index 0. Die Indizes sind daher 0→10, 1→20, 2→30 und 3→40.",
    "source": "programming.csv"
  },
  {
    "id": "Programmierung-018",
    "category": "Programmierung",
    "topic": null,
    "difficulty": "hard",
    "question": "Welche Aussage beschreibt den Unterschied zwischen == und === in JavaScript am besten?",
    "answers": [
      "Beide Operatoren sind immer vollständig identisch",
      "=== vergleicht Wert und Typ ohne die Typumwandlung des ==-Vergleichs",
      "== darf nur für Zahlen verwendet werden",
      "=== weist einer Variablen einen neuen Wert zu"
    ],
    "correctAnswer": 1,
    "explanation": "Der strikte Gleichheitsoperator === vergleicht Wert und Datentyp ohne die implizite Typumwandlung, die bei == auftreten kann.",
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
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "In einer Aufgabe steht: „Nach Abzug eines Rabatts von 20 % beträgt der Preis 160 €.“ Was bedeutet „nach Abzug“?",
    "answers": [
      "Der Rabatt wird zum Preis addiert.",
      "Der Rabatt wird vom Preis abgezogen.",
      "Der Preis wird verdoppelt.",
      "Es wird nur der Rabattbetrag gesucht."
    ],
    "correctAnswer": 1,
    "explanation": "„Nach Abzug“ bedeutet, dass der Rabatt bereits vom ursprünglichen Preis subtrahiert wurde.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-011",
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
    "id": "rechnungen-012",
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
    "id": "rechnungen-013",
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
    "id": "rechnungen-014",
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
    "id": "rechnungen-015",
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
    "id": "rechnungen-016",
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
    "id": "rechnungen-017",
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
    "id": "rechnungen-018",
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
    "id": "rechnungen-019",
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
    "id": "rechnungen-020",
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
    "id": "rechnungen-021",
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
    "id": "rechnungen-022",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet in einem Aufgabentext „nach Abzug der variablen Kosten“?",
    "answers": [
      "Die variablen Kosten werden zum Preis addiert",
      "Die variablen Kosten werden vom Preis subtrahiert",
      "Die Fixkosten werden verdoppelt",
      "Der Verkaufspreis wird ignoriert"
    ],
    "correctAnswer": 1,
    "explanation": "„Nach Abzug“ bedeutet, dass ein Betrag abgezogen beziehungsweise subtrahiert wurde.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-023",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Ein Produkt trägt zur Deckung der Fixkosten bei“?",
    "answers": [
      "Der Deckungsbeitrag hilft dabei, die Fixkosten des Unternehmens zu bezahlen",
      "Die Fixkosten werden automatisch geringer",
      "Das Produkt verursacht keine variablen Kosten mehr",
      "Der Verkaufspreis entspricht immer den Selbstkosten"
    ],
    "correctAnswer": 0,
    "explanation": "Ein positiver Deckungsbeitrag steht zur Verfügung, um Fixkosten zu decken.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-024",
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
    "id": "rechnungen-025",
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
    "id": "rechnungen-026",
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
    "id": "rechnungen-027",
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
    "id": "rechnungen-028",
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
    "id": "rechnungen-029",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Eine Aufgabe fragt: „Ab welcher Absatzmenge beginnt das Unternehmen, Gewinn zu machen?“ Welche Kennzahl ist gesucht?",
    "answers": [
      "ROI",
      "TCO",
      "Break-Even-Point",
      "Produktivität"
    ],
    "correctAnswer": 2,
    "explanation": "Die Frage nach der notwendigen Absatzmenge bis zur Gewinnzone beschreibt den Break-Even-Point.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-030",
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
    "id": "rechnungen-031",
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
    "id": "rechnungen-032",
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
    "id": "rechnungen-033",
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
    "id": "rechnungen-034",
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
    "id": "rechnungen-035",
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
    "id": "rechnungen-036",
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
    "id": "rechnungen-037",
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
    "id": "rechnungen-038",
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
    "id": "rechnungen-039",
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
    "id": "rechnungen-040",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was ist der wichtigste Unterschied zwischen Wirtschaftlichkeit und Produktivität?",
    "answers": [
      "Wirtschaftlichkeit verwendet Geldeinheiten, Produktivität Mengeneinheiten",
      "Produktivität verwendet nur Euro, Wirtschaftlichkeit nur Stückzahlen",
      "Beide Kennzahlen sind identisch",
      "Wirtschaftlichkeit wird nur bei Verlust berechnet"
    ],
    "correctAnswer": 0,
    "explanation": "Wirtschaftlichkeit betrachtet Ertrag und Aufwand in Geld, Produktivität dagegen Output und Input in Mengen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-041",
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
    "id": "rechnungen-042",
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
    "id": "rechnungen-043",
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
    "id": "rechnungen-044",
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
    "id": "rechnungen-045",
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
    "id": "rechnungen-046",
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
    "id": "rechnungen-047",
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
    "id": "rechnungen-048",
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
    "id": "rechnungen-049",
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
    "id": "rechnungen-050",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Eine Aufgabe fragt: „Lohnt sich die Investition?“ Was soll normalerweise beurteilt werden?",
    "answers": [
      "Ob die Investition wirtschaftlich sinnvoll beziehungsweise rentabel ist",
      "Ob die Datei korrekt gespeichert wurde",
      "Ob die Fixkosten vollständig verschwinden",
      "Ob der Verkaufspreis höher als 1 € ist"
    ],
    "correctAnswer": 0,
    "explanation": "„Lohnt sich“ bedeutet, dass geprüft werden soll, ob eine Investition wirtschaftlich sinnvoll oder rentabel ist.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-051",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „beträgt“ in dem Satz „Der Verkaufspreis beträgt 120 €“?",
    "answers": [
      "Der Verkaufspreis wird um 120 € erhöht",
      "Der Verkaufspreis liegt bei 120 €",
      "Der Verkaufspreis wird halbiert",
      "Der Verkaufspreis wird noch berechnet"
    ],
    "correctAnswer": 1,
    "explanation": "„Beträgt“ bedeutet hier „ist“ beziehungsweise „hat den Wert“.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-052",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „mindestens 200 Stück“?",
    "answers": [
      "Genau 200 Stück und niemals mehr",
      "Höchstens 200 Stück",
      "200 Stück oder mehr",
      "Weniger als 200 Stück"
    ],
    "correctAnswer": 2,
    "explanation": "„Mindestens“ bedeutet, dass 200 die Untergrenze ist. Mehr ist möglich.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-053",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „höchstens 500 €“?",
    "answers": [
      "500 € oder weniger",
      "Genau 500 €",
      "500 € oder mehr",
      "Mehr als 500 €"
    ],
    "correctAnswer": 0,
    "explanation": "„Höchstens“ bezeichnet eine Obergrenze.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-054",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „zusätzliche 100 Stück“?",
    "answers": [
      "100 Stück weniger",
      "100 Stück zusätzlich zur bisherigen Menge",
      "Eine Gesamtmenge von genau 100 Stück",
      "100 Stück werden storniert"
    ],
    "correctAnswer": 1,
    "explanation": "„Zusätzlich“ bedeutet, dass die Menge zur bereits vorhandenen Menge hinzukommt.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-055",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „die Kosten steigen um 2.000 €“?",
    "answers": [
      "Die neuen Kosten betragen immer genau 2.000 €",
      "Von den Kosten werden 2.000 € abgezogen",
      "Zu den bisherigen Kosten kommen 2.000 € hinzu",
      "Die Kosten werden auf 2.000 € begrenzt"
    ],
    "correctAnswer": 2,
    "explanation": "„Steigen um“ bedeutet eine Erhöhung um den genannten Betrag.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-056",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „die Kosten sinken auf 800 €“?",
    "answers": [
      "Die Kosten werden um 800 € reduziert",
      "Der neue Wert der Kosten beträgt 800 €",
      "Zu den Kosten kommen 800 € hinzu",
      "Die Kosten sinken um genau 800 €"
    ],
    "correctAnswer": 1,
    "explanation": "„Sinken auf“ nennt den neuen Endwert. „Sinken um“ würde dagegen die Höhe der Verringerung angeben.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-057",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „der Preis sinkt um 20 €“?",
    "answers": [
      "Der neue Preis beträgt immer 20 €",
      "Vom bisherigen Preis werden 20 € abgezogen",
      "Der Preis wird auf 20 € gesetzt",
      "Zum bisherigen Preis kommen 20 € hinzu"
    ],
    "correctAnswer": 1,
    "explanation": "„Sinkt um 20 €“ bedeutet, dass der bisherige Preis um 20 € reduziert wird.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-058",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Ein Preis steigt von 100 € auf 130 €. Was bedeutet „auf 130 €“?",
    "answers": [
      "130 € ist die Höhe der Erhöhung",
      "130 € ist der neue Preis",
      "Der Preis wurde um 130 € erhöht",
      "Der alte Preis war 130 €"
    ],
    "correctAnswer": 1,
    "explanation": "„Auf“ bezeichnet bei einer Veränderung normalerweise den neuen Endwert.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-059",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „pro Stück“?",
    "answers": [
      "Für die gesamte Absatzmenge",
      "Für jede einzelne Einheit",
      "Nur für das erste Produkt",
      "Pro Jahr"
    ],
    "correctAnswer": 1,
    "explanation": "„Pro Stück“ bedeutet je einzelne verkaufte oder produzierte Einheit.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-060",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „insgesamt“ in einer Rechenaufgabe?",
    "answers": [
      "Nur einen einzelnen Teilbetrag",
      "Die Summe aller relevanten Werte",
      "Den kleinsten Wert",
      "Nur den Durchschnitt"
    ],
    "correctAnswer": 1,
    "explanation": "„Insgesamt“ weist darauf hin, dass ein Gesamtwert beziehungsweise eine Summe gesucht ist.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-061",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „anteilig“ bei Gemeinkosten?",
    "answers": [
      "Die gesamten Gemeinkosten werden einem einzigen Auftrag zugerechnet",
      "Nur ein entsprechender Anteil der Gemeinkosten wird zugerechnet",
      "Die Gemeinkosten werden vollständig ignoriert",
      "Die Gemeinkosten werden verdoppelt"
    ],
    "correctAnswer": 1,
    "explanation": "„Anteilig“ bedeutet, dass nur ein bestimmter Anteil eines Gesamtbetrags zugerechnet wird.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-062",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „die Fixkosten sind gedeckt“?",
    "answers": [
      "Die Fixkosten wurden vollständig durch Erlöse beziehungsweise Deckungsbeiträge ausgeglichen",
      "Die Fixkosten wurden abgeschafft",
      "Es entstehen keine variablen Kosten mehr",
      "Das Unternehmen hat automatisch hohen Gewinn"
    ],
    "correctAnswer": 0,
    "explanation": "„Gedeckt“ bedeutet, dass für diese Kosten genügend Erträge oder Deckungsbeiträge vorhanden sind.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-063",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „kein Verlust entsteht“?",
    "answers": [
      "Das Ergebnis ist mindestens null",
      "Das Unternehmen macht immer hohen Gewinn",
      "Die Fixkosten betragen null",
      "Es gibt keine Kosten"
    ],
    "correctAnswer": 0,
    "explanation": "Wenn kein Verlust entsteht, ist das Ergebnis null oder positiv.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-064",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Eine Aufgabe fragt „Lohnt sich der Zusatzauftrag aus Sicht des Deckungsbeitrags?“ Worauf soll besonders geachtet werden?",
    "answers": [
      "Ob der zusätzliche Verkaufspreis die zusätzlichen variablen Kosten übersteigt",
      "Ob die gesamte Firma keine Fixkosten hat",
      "Ob das Produkt besonders teuer aussieht",
      "Ob der Kunde bar bezahlt"
    ],
    "correctAnswer": 0,
    "explanation": "Für einen Zusatzauftrag ist aus Deckungsbeitragssicht entscheidend, ob ein positiver zusätzlicher Deckungsbeitrag entsteht.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-065",
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
    "id": "rechnungen-066",
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
    "id": "rechnungen-067",
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
    "id": "rechnungen-068",
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
    "id": "rechnungen-069",
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
    "id": "rechnungen-070",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Eine Aufgabe sagt „500 weitere Stück für 5 € pro Stück abnehmen“. Was bedeutet „abnehmen“ hier?",
    "answers": [
      "Die Stückzahl reduzieren",
      "Die Ware kaufen beziehungsweise übernehmen",
      "Den Preis senken",
      "Die Ware kostenlos zurückgeben"
    ],
    "correctAnswer": 1,
    "explanation": "Im wirtschaftlichen Kontext bedeutet „Ware abnehmen“, dass ein Kunde sie kauft beziehungsweise übernimmt.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-071",
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
    "id": "rechnungen-072",
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
    "id": "rechnungen-073",
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
    "id": "rechnungen-074",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet die Frage „Ab wie vielen Kunden ist der Service profitabel?“",
    "answers": [
      "Gesucht ist eine Mindestkundenzahl für einen positiven Gewinn",
      "Gesucht ist die maximale Kundenzahl",
      "Gesucht ist nur der Preis pro Kunde",
      "Gesucht sind ausschließlich die Fixkosten"
    ],
    "correctAnswer": 0,
    "explanation": "„Ab wie vielen“ fragt nach der unteren Grenze, ab der eine Bedingung erfüllt ist.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-075",
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
    "id": "rechnungen-076",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „die Gewinnzone“?",
    "answers": [
      "Ein Bereich, in dem Erlöse die Gesamtkosten übersteigen",
      "Ein Bereich ohne Umsatz",
      "Ein Bereich mit ausschließlich Fixkosten",
      "Ein Bereich unterhalb des Break-Even"
    ],
    "correctAnswer": 0,
    "explanation": "Oberhalb des Break-Even befindet sich das Unternehmen in der Gewinnzone.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-077",
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
    "id": "rechnungen-078",
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
    "id": "rechnungen-079",
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
    "id": "rechnungen-080",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „welche Abteilung arbeitet wirtschaftlicher?“",
    "answers": [
      "Welche Abteilung hat den höheren Wert bei Ertrag geteilt durch Aufwand",
      "Welche Abteilung hat mehr Mitarbeiter",
      "Welche Abteilung hat die höchsten Kosten",
      "Welche Abteilung verkauft mehr Stück unabhängig von den Kosten"
    ],
    "correctAnswer": 0,
    "explanation": "Zum Vergleich der Wirtschaftlichkeit wird das Verhältnis Ertrag zu Aufwand betrachtet.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-081",
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
    "id": "rechnungen-082",
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
    "id": "rechnungen-083",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „bei gleicher Besetzung“?",
    "answers": [
      "Die Zahl der Mitarbeiter bleibt gleich",
      "Alle Mitarbeiter werden ersetzt",
      "Die Kosten bleiben zwingend gleich",
      "Die Absatzmenge bleibt gleich"
    ],
    "correctAnswer": 0,
    "explanation": "„Besetzung“ bezeichnet hier die personelle Ausstattung. „Bei gleicher Besetzung“ bedeutet gleiche Mitarbeiterzahl.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-084",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Ausbringungsmenge“?",
    "answers": [
      "Die erzeugte beziehungsweise produzierte Menge",
      "Die Höhe der Fixkosten",
      "Der Einkaufspreis",
      "Die Arbeitszeit eines einzelnen Mitarbeiters"
    ],
    "correctAnswer": 0,
    "explanation": "„Ausbringungsmenge“ bezeichnet den Output beziehungsweise die produzierte Menge.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-085",
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
    "id": "rechnungen-086",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „einmalige Kosten“?",
    "answers": [
      "Kosten, die nur einmal anfallen",
      "Kosten, die jeden Monat anfallen",
      "Kosten, die mit jeder produzierten Einheit steigen",
      "Kosten ohne festen Betrag"
    ],
    "correctAnswer": 0,
    "explanation": "„Einmalig“ bedeutet, dass die Kosten nur zu einem bestimmten Zeitpunkt beziehungsweise einmal entstehen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-087",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „laufende Kosten“?",
    "answers": [
      "Kosten, die regelmäßig während des Betriebs anfallen",
      "Nur die Anschaffungskosten",
      "Ein einmaliger Gewinn",
      "Kosten, die bereits vollständig bezahlt wurden und nie wieder entstehen"
    ],
    "correctAnswer": 0,
    "explanation": "„Laufend“ bezeichnet regelmäßig wiederkehrende Kosten während des Betriebs.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-088",
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
    "id": "rechnungen-089",
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
    "id": "rechnungen-090",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „die Investition amortisiert sich nach drei Jahren“?",
    "answers": [
      "Nach drei Jahren wurde die Investition durch die Rückflüsse wirtschaftlich ausgeglichen",
      "Nach drei Jahren entstehen keine Betriebskosten mehr",
      "Nach drei Jahren wird die Investition automatisch verkauft",
      "Nach drei Jahren beträgt der ROI immer 100 %"
    ],
    "correctAnswer": 0,
    "explanation": "Die Amortisation beschreibt den Zeitraum, bis die ursprüngliche Investition durch Rückflüsse zurückverdient wurde.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-091",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Absatzmenge“?",
    "answers": [
      "Die Anzahl der verkauften Einheiten",
      "Die Höhe der Fixkosten",
      "Der Verkaufspreis einer Einheit",
      "Der Gewinn pro Jahr"
    ],
    "correctAnswer": 0,
    "explanation": "Die Absatzmenge ist die Menge der verkauften Produkte oder Leistungen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-092",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „im Quartal werden 2.000 Stück verkauft“?",
    "answers": [
      "2.000 Stück werden pro Monat verkauft",
      "2.000 Stück werden innerhalb von drei Monaten verkauft",
      "2.000 Stück werden pro Jahr verkauft",
      "2.000 Stück werden pro Woche verkauft"
    ],
    "correctAnswer": 1,
    "explanation": "Ein Quartal umfasst drei Monate.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-093",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was ist mit „Betriebsergebnis“ gemeint?",
    "answers": [
      "Das wirtschaftliche Ergebnis nach Abzug der relevanten Kosten",
      "Nur der Umsatz",
      "Nur die Absatzmenge",
      "Der Einkaufspreis"
    ],
    "correctAnswer": 0,
    "explanation": "Im Übungsblatt wird das Betriebsergebnis unter anderem als Gesamtdeckungsbeitrag minus Fixkosten berechnet.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-094",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „ein Großkunde“?",
    "answers": [
      "Ein Kunde mit besonders großer Nachfrage oder großem Auftragsvolumen",
      "Ein Kunde mit einem großen Gebäude",
      "Ein Kunde, der nur einmal bestellt",
      "Ein Lieferant"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Großkunde kauft typischerweise große Mengen oder hat ein bedeutendes Auftragsvolumen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-095",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was ist ein „Zusatzauftrag“?",
    "answers": [
      "Ein bereits stornierter Auftrag",
      "Ein zusätzlicher Auftrag neben den bisherigen Aufträgen",
      "Der erste Auftrag eines Unternehmens",
      "Ein Auftrag ohne Preis"
    ],
    "correctAnswer": 1,
    "explanation": "Ein Zusatzauftrag kommt zu den bereits vorhandenen Aufträgen hinzu.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-096",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was verlangt die Anweisung „Begründe“?",
    "answers": [
      "Nur eine Zahl nennen",
      "Eine Antwort mit einem nachvollziehbaren Grund erklären",
      "Eine Formel abschreiben",
      "Die Aufgabe überspringen"
    ],
    "correctAnswer": 1,
    "explanation": "„Begründe“ bedeutet, dass die Antwort erklärt und argumentativ gestützt werden soll.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-097",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Der Kunde möchte 500 Stück für 5 € pro Stück abnehmen“?",
    "answers": [
      "Der Kunde möchte 500 Stück für jeweils 5 € kaufen",
      "Der Kunde möchte die Produktion um 500 Stück reduzieren",
      "Der Kunde zahlt insgesamt nur 5 €",
      "Der Kunde gibt 500 Stück zurück"
    ],
    "correctAnswer": 0,
    "explanation": "„Abnehmen“ bedeutet im Handel, eine angebotene Menge zu kaufen beziehungsweise zu übernehmen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-098",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „die Nachfrage steigt“?",
    "answers": [
      "Weniger Kunden möchten das Produkt kaufen",
      "Mehr vom Produkt wird nachgefragt",
      "Der Verkaufspreis muss sinken",
      "Die Fixkosten verschwinden"
    ],
    "correctAnswer": 1,
    "explanation": "Steigende Nachfrage bedeutet, dass Kunden eine größere Menge kaufen möchten.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-099",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „die Fertigungskapazität ist auf 1.000 Stück begrenzt“?",
    "answers": [
      "Mindestens 1.000 Stück müssen produziert werden",
      "Es können maximal 1.000 Stück produziert werden",
      "Genau 1.000 Stück müssen verkauft werden",
      "Die Produktion kostet 1.000 €"
    ],
    "correctAnswer": 1,
    "explanation": "„Begrenzt auf“ bezeichnet hier die maximal verfügbare Produktionsmenge.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-100",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „200 weitere SSDs verkaufen“?",
    "answers": [
      "Insgesamt nur 200 SSDs verkaufen",
      "200 SSDs zusätzlich zur bisherigen Menge verkaufen",
      "200 SSDs weniger verkaufen",
      "200 SSDs kostenlos abgeben"
    ],
    "correctAnswer": 1,
    "explanation": "„Weitere“ bedeutet hier zusätzliche Einheiten.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-101",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „die HDD-Produktion um 200 Stück senken“?",
    "answers": [
      "Die neue HDD-Produktion beträgt automatisch 200 Stück",
      "200 Stück zur bisherigen Produktion hinzufügen",
      "200 Stück weniger produzieren",
      "Die Produktion auf null setzen"
    ],
    "correctAnswer": 2,
    "explanation": "„Um 200 Stück senken“ bedeutet, die bisherige Menge um 200 zu reduzieren.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-102",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Lohnt sich die Umstellung?“",
    "answers": [
      "Ist die Änderung wirtschaftlich vorteilhaft?",
      "Ist die Änderung technisch überhaupt möglich?",
      "Wie viele Mitarbeiter gibt es?",
      "Wie lautet der Produktname?"
    ],
    "correctAnswer": 0,
    "explanation": "„Lohnt sich“ fragt nach dem wirtschaftlichen Vorteil einer Änderung.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-103",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „ein Paket einstellen“ im wirtschaftlichen Kontext?",
    "answers": [
      "Den Preis des Pakets konfigurieren",
      "Das Paket nicht mehr anbieten",
      "Das Paket teurer machen",
      "Das Paket automatisch verlängern"
    ],
    "correctAnswer": 1,
    "explanation": "Ein Produkt oder Angebot „einstellen“ bedeutet hier, es aus dem Angebot zu nehmen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-104",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was sind „frei werdende Ressourcen“?",
    "answers": [
      "Ressourcen, die nach einer Änderung nicht mehr benötigt werden und anderweitig genutzt werden können",
      "Kostenlose Produkte",
      "Neue Fixkosten",
      "Nicht verwendbare Geräte"
    ],
    "correctAnswer": 0,
    "explanation": "„Frei werdend“ bedeutet, dass Kapazitäten verfügbar werden.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-105",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Fixkosten bleiben gleich“?",
    "answers": [
      "Die Fixkosten steigen",
      "Die Fixkosten sinken",
      "Die Fixkosten verändern sich nicht",
      "Es gibt keine Fixkosten mehr"
    ],
    "correctAnswer": 2,
    "explanation": "„Gleich bleiben“ bedeutet, dass sich der Wert nicht verändert.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-106",
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
    "id": "rechnungen-107",
    "category": "Rechnungen",
    "topic": "Break-Even",
    "difficulty": "medium",
    "question": "Was beschreibt die „Sicherheitsspanne“ im Übungsblatt?",
    "answers": [
      "Wie weit der tatsächliche Absatz über der Break-Even-Menge liegt",
      "Den Unterschied zwischen zwei Verkaufspreisen",
      "Die Höhe der Fixkosten",
      "Die maximale Produktionskapazität"
    ],
    "correctAnswer": 0,
    "explanation": "Die Sicherheitsspanne vergleicht Ist-Absatz und Break-Even-Menge. :contentReference[oaicite:3]{index=3}",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-108",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Eine Aufgabe fragt „Wie verändert sich der BEP, wenn die Fixkosten steigen?“ Was soll gemacht werden?",
    "answers": [
      "Nur den alten BEP nennen",
      "Den neuen BEP berechnen und mit dem alten vergleichen",
      "Nur die zusätzlichen Fixkosten nennen",
      "Den Verkaufspreis ändern"
    ],
    "correctAnswer": 1,
    "explanation": "„Wie verändert sich“ verlangt einen Vergleich des Zustands vor und nach der Änderung.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-109",
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
    "id": "rechnungen-110",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „40 % Premium- und 60 % Basis-Nutzer“?",
    "answers": [
      "Jeder Nutzer verwendet beide Versionen",
      "Die erwartete Nutzerverteilung beträgt 40 zu 60 Prozent",
      "Premium kostet 40 % mehr",
      "Es gibt insgesamt nur 100 Nutzer"
    ],
    "correctAnswer": 1,
    "explanation": "Die Prozentwerte beschreiben die erwartete Verteilung der Nutzer auf die beiden Varianten.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-111",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was ist eine „Anfangsinvestition“?",
    "answers": [
      "Eine regelmäßig monatlich anfallende Ausgabe",
      "Eine Investition, die zu Beginn eines Projekts oder Services anfällt",
      "Der jährliche Gewinn",
      "Der Break-Even-Umsatz"
    ],
    "correctAnswer": 1,
    "explanation": "Die Anfangsinvestition ist der Betrag, der zunächst für den Start eingesetzt werden muss.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-112",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „laufende Fixkosten“?",
    "answers": [
      "Einmalige Anschaffungskosten",
      "Regelmäßig wiederkehrende Fixkosten",
      "Variable Kosten pro Stück",
      "Gewinne eines Unternehmens"
    ],
    "correctAnswer": 1,
    "explanation": "„Laufend“ bezeichnet Kosten, die regelmäßig erneut anfallen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-113",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „monatlich profitabel“?",
    "answers": [
      "Der Service erzeugt auf Monatsbasis einen Gewinn",
      "Der Service wird jeden Monat teurer",
      "Der Service hat keine Kosten",
      "Der Service verkauft jeden Monat genau ein Produkt"
    ],
    "correctAnswer": 0,
    "explanation": "„Profitabel“ bedeutet gewinnbringend.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-114",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Nach wie vielen Monaten ist die Anfangsinvestition amortisiert?“",
    "answers": [
      "Wann ist die Investition durch die erwirtschafteten Rückflüsse ausgeglichen?",
      "Wann endet der Service?",
      "Wann steigen die Fixkosten?",
      "Wann wird die Investition erneut bezahlt?"
    ],
    "correctAnswer": 0,
    "explanation": "Die Frage sucht die Amortisationsdauer.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-115",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „vor und nach der Investition“?",
    "answers": [
      "Nur der Zustand nach der Investition",
      "Die beiden Situationen müssen miteinander verglichen werden",
      "Nur der alte Zustand",
      "Die Investition soll ignoriert werden"
    ],
    "correctAnswer": 1,
    "explanation": "„Vor und nach“ fordert einen Vergleich zweier Zustände.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-116",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „durchschnittlich 10 Teilnehmer“?",
    "answers": [
      "Immer genau 10 Teilnehmer an jedem einzelnen Termin",
      "Im Mittel sind es 10 Teilnehmer",
      "Mindestens 10 Teilnehmer",
      "Maximal 10 Teilnehmer"
    ],
    "correctAnswer": 1,
    "explanation": "„Durchschnittlich“ bedeutet im Mittel oder durchschnittlich über mehrere Fälle.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-117",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „maximaler Gewinn“?",
    "answers": [
      "Der kleinstmögliche Gewinn",
      "Der höchstmögliche Gewinn unter den gegebenen Bedingungen",
      "Der Break-Even-Point",
      "Der Umsatz ohne Kosten"
    ],
    "correctAnswer": 1,
    "explanation": "„Maximal“ bezeichnet den größtmöglichen Wert.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-118",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „zusätzliche Bestellungen sind nötig“?",
    "answers": [
      "Weitere Bestellungen werden benötigt",
      "Bestellungen müssen storniert werden",
      "Die vorhandenen Bestellungen reichen immer aus",
      "Die Bestellwerte müssen sinken"
    ],
    "correctAnswer": 0,
    "explanation": "„Nötig“ bedeutet notwendig oder erforderlich.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-119",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „den BEP halten“?",
    "answers": [
      "Den Break-Even trotz einer Veränderung auf dem gewünschten Niveau beibehalten",
      "Den Verkauf vollständig stoppen",
      "Den BEP ignorieren",
      "Die Fixkosten verdoppeln"
    ],
    "correctAnswer": 0,
    "explanation": "„Halten“ bedeutet hier, einen bestimmten Zustand beziehungsweise Wert beizubehalten.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-120",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was ist mit „Eigenbetrieb“ gemeint?",
    "answers": [
      "Der Service wird vom Unternehmen selbst betrieben",
      "Der Service wird vollständig von einem Partner betrieben",
      "Der Service wird kostenlos angeboten",
      "Der Service wird eingestellt"
    ],
    "correctAnswer": 0,
    "explanation": "Beim Eigenbetrieb übernimmt das Unternehmen den Betrieb selbst.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-121",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was ist mit „Partnermodell“ gemeint?",
    "answers": [
      "Das Unternehmen arbeitet beim Angebot mit einem Partner zusammen",
      "Das Unternehmen hat keine Kunden",
      "Das Unternehmen produziert ausschließlich Hardware",
      "Alle Kosten werden zu Fixkosten"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Partnermodell bezieht einen externen oder geschäftlichen Partner in die Leistung ein.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-122",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Modell A ist profitabler als Modell B“?",
    "answers": [
      "Modell A erzielt unter den betrachteten Bedingungen das bessere Gewinnergebnis",
      "Modell A hat immer höhere Kosten",
      "Modell A verkauft weniger",
      "Beide Modelle sind gleich"
    ],
    "correctAnswer": 0,
    "explanation": "„Profitabler“ bedeutet gewinnbringender.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-123",
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
    "id": "rechnungen-124",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Die Gesamtkosten betrugen 162.000 €“?",
    "answers": [
      "Die Gesamtkosten stiegen um 162.000 €",
      "Die Gesamtkosten hatten den Wert 162.000 €",
      "Die Gesamtkosten sanken auf null",
      "Der Gewinn betrug 162.000 €"
    ],
    "correctAnswer": 1,
    "explanation": "„Betrugen“ ist die Vergangenheitsform von „betragen“ und gibt einen Wert an.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-125",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „eine Rangfolge erstellen“?",
    "answers": [
      "Die Möglichkeiten in eine bestimmte Reihenfolge bringen",
      "Nur den schlechtesten Wert nennen",
      "Alle Werte addieren",
      "Eine zufällige Auswahl treffen"
    ],
    "correctAnswer": 0,
    "explanation": "Eine Rangfolge ordnet mehrere Alternativen beispielsweise vom besten zum schlechtesten Wert.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-126",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was ist ein „Anbieter“ in einer Aufgabe über zwei Serverlösungen?",
    "answers": [
      "Ein Unternehmen, das eine Ware oder Dienstleistung anbietet",
      "Der Kunde, der die Lösung kauft",
      "Ein Mitarbeiter der Buchhaltung",
      "Eine Kennzahl"
    ],
    "correctAnswer": 0,
    "explanation": "Der Anbieter stellt ein Produkt oder eine Dienstleistung zum Kauf beziehungsweise zur Nutzung bereit.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-127",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „erwartete Nutzungsdauer“?",
    "answers": [
      "Der Zeitraum, über den die Nutzung voraussichtlich stattfinden wird",
      "Die Garantiezeit muss exakt gleich lang sein",
      "Die Lieferzeit",
      "Die Dauer eines Arbeitstages"
    ],
    "correctAnswer": 0,
    "explanation": "„Erwartet“ zeigt, dass es sich um einen angenommenen zukünftigen Wert handelt.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-128",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Eigenentwicklung“ bei Software?",
    "answers": [
      "Das Unternehmen entwickelt die Software selbst",
      "Das Unternehmen kauft eine fertige Lizenz",
      "Die Software wird kostenlos bereitgestellt",
      "Die Software wird nicht genutzt"
    ],
    "correctAnswer": 0,
    "explanation": "Eigenentwicklung bedeutet Entwicklung durch das eigene Unternehmen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-129",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Upselling“ im Beispiel mit Standard- und Premium-Service?",
    "answers": [
      "Kunden werden zu einer höherwertigen beziehungsweise teureren Variante bewegt",
      "Der Preis wird für alle Kunden gesenkt",
      "Produkte werden nicht mehr verkauft",
      "Fixkosten werden abgeschafft"
    ],
    "correctAnswer": 0,
    "explanation": "Im Übungsblatt wird damit die Umwandlung von Standard-Arbeitsplätzen in Premium bezeichnet. :contentReference[oaicite:4]{index=4}",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-130",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „bei gleichbleibenden Kosten“?",
    "answers": [
      "Die Kosten verändern sich nicht",
      "Die Kosten werden vollständig gestrichen",
      "Die Kosten steigen proportional zum Umsatz",
      "Die Kosten werden halbiert"
    ],
    "correctAnswer": 0,
    "explanation": "„Gleichbleibend“ bedeutet unverändert.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-131",
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
    "id": "rechnungen-132",
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
    "explanation": "Im Übungsblatt entspricht das eingesetzte Kapital der Investitionssumme.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-133",
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
    "id": "rechnungen-134",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Mehrerlös“?",
    "answers": [
      "Zusätzlicher Erlös im Vergleich zum bisherigen Zustand",
      "Eine zusätzliche Ausgabe",
      "Ein geringerer Umsatz",
      "Eine Fixkostensteigerung"
    ],
    "correctAnswer": 0,
    "explanation": "„Mehrerlös“ bezeichnet zusätzlich erzielten Erlös.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-135",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „zusätzliche Kosten“?",
    "answers": [
      "Kosten, die zu den bisherigen Kosten hinzukommen",
      "Kosten, die bereits enthalten sind",
      "Kosten, die gestrichen werden",
      "Kosten, die nur bei Verlust entstehen"
    ],
    "correctAnswer": 0,
    "explanation": "Zusätzliche Kosten erhöhen die bisherigen Kosten.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-136",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Einsparung“?",
    "answers": [
      "Ein Betrag, der gegenüber dem bisherigen Zustand nicht mehr ausgegeben werden muss",
      "Eine zusätzliche Investition",
      "Ein höherer Verkaufspreis",
      "Ein Umsatzverlust"
    ],
    "correctAnswer": 0,
    "explanation": "Eine Einsparung reduziert den bisherigen Aufwand beziehungsweise die bisherigen Kosten.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-137",
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
    "id": "rechnungen-138",
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
    "id": "rechnungen-139",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „jährliche Einsparung“?",
    "answers": [
      "Ein Betrag, der jedes Jahr eingespart wird",
      "Ein einmaliger Rabatt",
      "Der jährliche Umsatz",
      "Die Investitionssumme"
    ],
    "correctAnswer": 0,
    "explanation": "„Jährlich“ bedeutet pro Jahr.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-140",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was sind „laufende Kosten“ einer Investition?",
    "answers": [
      "Regelmäßig wiederkehrende Kosten während der Nutzung",
      "Nur der einmalige Kaufpreis",
      "Der gesamte Gewinn",
      "Die anfängliche Investitionssumme"
    ],
    "correctAnswer": 0,
    "explanation": "Laufende Kosten fallen während des Betriebs wiederholt an.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-141",
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
    "id": "rechnungen-142",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „im ersten Jahr“?",
    "answers": [
      "Nur der Zeitraum des ersten Jahres wird betrachtet",
      "Alle zukünftigen Jahre werden addiert",
      "Nur der Investitionsmonat wird betrachtet",
      "Der Zeitraum spielt keine Rolle"
    ],
    "correctAnswer": 0,
    "explanation": "Die Betrachtung ist auf das erste Jahr begrenzt.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-143",
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
    "id": "rechnungen-144",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Kapital eingesetzt“?",
    "answers": [
      "Kapital wurde für einen wirtschaftlichen Zweck verwendet",
      "Kapital wurde vollständig vernichtet",
      "Kapital wurde nur auf ein Konto überwiesen",
      "Kapital wurde nicht genutzt"
    ],
    "correctAnswer": 0,
    "explanation": "„Eingesetzt“ bedeutet hier wirtschaftlich verwendet beziehungsweise investiert.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-145",
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
    "id": "rechnungen-146",
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
    "explanation": "Im Übungsblatt wird die Umsatzrentabilität als Gewinn / Umsatz × 100 berechnet.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-147",
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
    "id": "rechnungen-148",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was verlangt „Berechne den ROI über die DuPont-Formel und vergleiche“?",
    "answers": [
      "Den ROI über Umsatzrentabilität und Kapitalumschlag berechnen und mit dem direkten ROI vergleichen",
      "Nur den Gewinn berechnen",
      "Nur den Umsatz berechnen",
      "Die Investition ignorieren"
    ],
    "correctAnswer": 0,
    "explanation": "„Vergleiche“ bedeutet, die Ergebnisse gegenüberzustellen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-149",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „rentabler“?",
    "answers": [
      "Wirtschaftlich vorteilhafter beziehungsweise ertragreicher im Verhältnis zum eingesetzten Kapital",
      "Teurer",
      "Mit höheren Fixkosten",
      "Mit mehr Mitarbeitern"
    ],
    "correctAnswer": 0,
    "explanation": "„Rentabler“ bedeutet, dass eine Investition eine bessere Rentabilität aufweist.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-150",
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
    "id": "rechnungen-151",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Budget“?",
    "answers": [
      "Der verfügbare finanzielle Rahmen",
      "Der erzielte Gewinn",
      "Die Absatzmenge",
      "Die Höhe des ROI"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Budget legt fest, wie viel Geld für einen Zweck zur Verfügung steht.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-152",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Das Unternehmen hat nur 65.000 € Budget“?",
    "answers": [
      "Es stehen maximal 65.000 € zur Verfügung",
      "Mindestens 65.000 € müssen ausgegeben werden",
      "Das Unternehmen erzielt 65.000 € Gewinn",
      "Die Fixkosten betragen 65.000 €"
    ],
    "correctAnswer": 0,
    "explanation": "„Nur“ begrenzt hier den verfügbaren finanziellen Rahmen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-153",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was verlangt „Welche Empfehlung gibst du?“",
    "answers": [
      "Eine begründete Entscheidung auf Basis der berechneten Werte",
      "Nur eine Formel",
      "Nur den höchsten Preis nennen",
      "Keine Berechnung verwenden"
    ],
    "correctAnswer": 0,
    "explanation": "Eine Empfehlung sollte aus den Ergebnissen abgeleitet und begründet werden.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-154",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „erwartete Einsparungen“?",
    "answers": [
      "Voraussichtlich künftig eingesparte Kosten",
      "Bereits sicher erzielter Gewinn",
      "Einmalige Investitionskosten",
      "Ungeplante Zusatzkosten"
    ],
    "correctAnswer": 0,
    "explanation": "„Erwartet“ bezeichnet einen angenommenen zukünftigen Wert.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-155",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „kumuliert“?",
    "answers": [
      "Über mehrere Zeiträume aufsummiert",
      "Durchschnittlich pro Jahr",
      "Nur im letzten Jahr",
      "Um einen Prozentsatz reduziert"
    ],
    "correctAnswer": 0,
    "explanation": "„Kumuliert“ bedeutet, dass Werte fortlaufend addiert werden.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-156",
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
    "id": "rechnungen-157",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „In welchem Jahr wird der Break-Even erreicht?“",
    "answers": [
      "Gesucht ist das Jahr, in dem die kumulierten Erträge beziehungsweise Rückflüsse die relevanten Kosten ausgleichen",
      "Gesucht ist das Jahr mit dem höchsten Umsatz",
      "Gesucht ist nur das erste Jahr",
      "Gesucht ist die Nutzungsdauer"
    ],
    "correctAnswer": 0,
    "explanation": "Die Frage sucht den Zeitpunkt der Kostendeckung.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-158",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Marketingkampagne durchgeführt“?",
    "answers": [
      "Eine Marketingmaßnahme wurde umgesetzt",
      "Eine Investition wurde storniert",
      "Ein Produkt wurde eingestellt",
      "Ein Unternehmen wurde verkauft"
    ],
    "correctAnswer": 0,
    "explanation": "„Durchgeführt“ bedeutet umgesetzt beziehungsweise ausgeführt.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-159",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „neu gewonnene Kunden“?",
    "answers": [
      "Zusätzliche Kunden, die durch eine Maßnahme gewonnen wurden",
      "Alle bisherigen Kunden",
      "Verlorene Kunden",
      "Nur Premium-Kunden"
    ],
    "correctAnswer": 0,
    "explanation": "„Gewonnen“ bedeutet hier als neue Kunden gewonnen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-160",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Marge“?",
    "answers": [
      "Der Anteil beziehungsweise Unterschied zwischen Erlös und Kosten, der wirtschaftlich verbleibt",
      "Die Gesamtzahl der Kunden",
      "Die Investitionsdauer",
      "Die Höhe der Fixkosten"
    ],
    "correctAnswer": 0,
    "explanation": "Im Übungsblatt wird eine durchschnittliche Marge genutzt, um aus Umsatz einen wirtschaftlichen Gewinnanteil abzuleiten.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-161",
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
    "id": "rechnungen-162",
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
    "id": "rechnungen-163",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „mindestens bringen müssen, damit der ROI positiv ist“?",
    "answers": [
      "Gesucht ist die kleinste Anzahl, bei der ein positiver ROI entsteht",
      "Gesucht ist die größte mögliche Anzahl",
      "Gesucht ist nur der Umsatz",
      "Gesucht ist die Zahl der Mitarbeiter"
    ],
    "correctAnswer": 0,
    "explanation": "„Mindestens“ verlangt die Untergrenze, ab der die Bedingung erfüllt wird.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-164",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „alte Drucker behalten“?",
    "answers": [
      "Die bisherigen Geräte weiterhin nutzen",
      "Die Geräte sofort verkaufen",
      "Neue Geräte kaufen",
      "Die Drucker kostenlos abgeben"
    ],
    "correctAnswer": 0,
    "explanation": "„Behalten“ bedeutet nicht ersetzen oder abgeben.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-165",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Geräte ersetzen“?",
    "answers": [
      "Alte Geräte durch neue austauschen",
      "Zusätzliche Geräte behalten",
      "Geräte reparieren, ohne sie zu wechseln",
      "Den Verkaufspreis ändern"
    ],
    "correctAnswer": 0,
    "explanation": "„Ersetzen“ bedeutet, etwas durch etwas anderes auszutauschen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-166",
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
    "id": "rechnungen-167",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „über die 4-jährige Nutzungsdauer“?",
    "answers": [
      "Der gesamte Zeitraum von vier Jahren wird betrachtet",
      "Nur das vierte Jahr wird betrachtet",
      "Vier einzelne Monate werden betrachtet",
      "Nur das erste Jahr wird betrachtet"
    ],
    "correctAnswer": 0,
    "explanation": "Die Berechnung soll sich auf die komplette Nutzungsdauer von vier Jahren beziehen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-168",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „eine Schulungsakademie aufbauen“?",
    "answers": [
      "Eine neue Schulungseinrichtung schaffen beziehungsweise einrichten",
      "Eine Akademie schließen",
      "Nur einen Kurs kaufen",
      "Die Fixkosten reduzieren"
    ],
    "correctAnswer": 0,
    "explanation": "„Aufbauen“ bedeutet hier eine neue Struktur oder Einrichtung schaffen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-169",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „erwartete Schulungserlöse“?",
    "answers": [
      "Die voraussichtlich durch Schulungen erzielten Erlöse",
      "Die Kosten der Schulungen",
      "Die Investitionssumme",
      "Die eingesparten Fixkosten"
    ],
    "correctAnswer": 0,
    "explanation": "Es handelt sich um prognostizierte Erlöse aus den Schulungen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-170",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Einsparung externer Schulungen“?",
    "answers": [
      "Kosten für externe Schulungen müssen künftig nicht mehr oder in geringerem Umfang bezahlt werden",
      "Mehr externe Schulungen werden gebucht",
      "Der Umsatz sinkt",
      "Die Investitionssumme steigt"
    ],
    "correctAnswer": 0,
    "explanation": "Die eigene Akademie kann bisherige Ausgaben für externe Schulungen reduzieren.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-171",
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
    "explanation": "Im Übungsblatt wird der Nettonutzen aus Erlösen plus Einsparungen minus laufenden Kosten gebildet.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-172",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „bezogen auf Jahr 1“?",
    "answers": [
      "Die Berechnung bezieht sich nur auf das erste Jahr",
      "Die Berechnung gilt automatisch für alle Jahre",
      "Nur die Investitionssumme wird betrachtet",
      "Das erste Jahr wird ignoriert"
    ],
    "correctAnswer": 0,
    "explanation": "„Bezogen auf“ bedeutet hier, dass dieser Zeitraum die Grundlage der Berechnung ist.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-173",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „ab Jahr 2“?",
    "answers": [
      "Beginnend mit dem zweiten Jahr",
      "Nur im ersten Jahr",
      "Nach Ende der Nutzungsdauer",
      "Vor der Investition"
    ],
    "correctAnswer": 0,
    "explanation": "„Ab“ bezeichnet einen Startpunkt, hier das zweite Jahr.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-174",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „ein Gesamtbudget von 100.000 €“?",
    "answers": [
      "Für alle Investitionen zusammen stehen 100.000 € zur Verfügung",
      "Jede Investition darf 100.000 € kosten",
      "Der Gewinn beträgt 100.000 €",
      "Die Fixkosten betragen 100.000 €"
    ],
    "correctAnswer": 0,
    "explanation": "„Gesamtbudget“ bezeichnet den gesamten verfügbaren Betrag für alle betrachteten Maßnahmen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-175",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „eine Kombination von Investitionen“?",
    "answers": [
      "Mehrere Investitionen werden gemeinsam ausgewählt",
      "Nur eine Investition darf gewählt werden",
      "Die Investitionen werden addiert, ohne gewählt zu werden",
      "Alle Investitionen werden automatisch durchgeführt"
    ],
    "correctAnswer": 0,
    "explanation": "Eine Kombination besteht aus mehreren gemeinsam ausgewählten Alternativen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-176",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „den Gesamtgewinn maximieren“?",
    "answers": [
      "Den größtmöglichen Gesamtgewinn erreichen",
      "Den Gewinn auf null reduzieren",
      "Die Kosten maximieren",
      "Die Absatzmenge minimieren"
    ],
    "correctAnswer": 0,
    "explanation": "„Maximieren“ bedeutet, einen Wert so groß wie möglich zu machen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-177",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „innerhalb des Budgets“?",
    "answers": [
      "Die Gesamtkosten dürfen das verfügbare Budget nicht überschreiten",
      "Die Investition darf beliebig teuer sein",
      "Das Budget muss vollständig überschritten werden",
      "Nur der Gewinn zählt"
    ],
    "correctAnswer": 0,
    "explanation": "Die Auswahl muss unter der finanziellen Obergrenze bleiben.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-178",
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
    "id": "rechnungen-179",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Geschäftsjahr“?",
    "answers": [
      "Ein wirtschaftlicher Abrechnungszeitraum eines Unternehmens, meist ein Jahr",
      "Ein einzelner Arbeitstag",
      "Ein Quartal",
      "Die Nutzungsdauer eines PCs"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Geschäftsjahr ist der jährliche wirtschaftliche Abrechnungszeitraum des Unternehmens.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-180",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „Kennzahlen“?",
    "answers": [
      "Messgrößen, mit denen wirtschaftliche Sachverhalte bewertet werden",
      "Nur Preise von Produkten",
      "Ausschließlich Fixkosten",
      "Die Namen von Projekten"
    ],
    "correctAnswer": 0,
    "explanation": "Kennzahlen verdichten wirtschaftliche Informationen zu vergleichbaren Messgrößen.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-181",
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
    "id": "rechnungen-182",
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
    "id": "rechnungen-183",
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
    "id": "rechnungen-184",
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
    "id": "rechnungen-185",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „getrennt berechnen“ in „Umsatzrentabilität und Kapitalumschlag getrennt“?",
    "answers": [
      "Beide Kennzahlen einzeln berechnen",
      "Nur eine der beiden Kennzahlen berechnen",
      "Beide Werte sofort addieren",
      "Keine Zwischenschritte zeigen"
    ],
    "correctAnswer": 0,
    "explanation": "„Getrennt“ bedeutet einzeln beziehungsweise separat.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-186",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „den ROI auf 35 % steigern“?",
    "answers": [
      "Der neue Zielwert des ROI soll 35 % betragen",
      "Der ROI soll um exakt 35 Prozentpunkte steigen",
      "Der Gewinn soll 35 € betragen",
      "Der Umsatz soll sinken"
    ],
    "correctAnswer": 0,
    "explanation": "„Auf 35 %“ nennt den gewünschten Endwert.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-187",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „zwei rechnerische Wege nennen“?",
    "answers": [
      "Zwei unterschiedliche mathematische Möglichkeiten zur Zielerreichung angeben",
      "Die gleiche Rechnung zweimal schreiben",
      "Nur zwei Zahlen nennen",
      "Zwei Investitionen auswählen"
    ],
    "correctAnswer": 0,
    "explanation": "Es werden zwei verschiedene rechnerische Ansätze erwartet.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-188",
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
    "id": "rechnungen-189",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „nötiger Zielwert“?",
    "answers": [
      "Der Wert, der erreicht werden muss, um das gewünschte Ziel zu erfüllen",
      "Der aktuelle Wert",
      "Der kleinste vorhandene Wert",
      "Ein zufälliger Vergleichswert"
    ],
    "correctAnswer": 0,
    "explanation": "„Nötig“ bedeutet erforderlich, „Zielwert“ bezeichnet den gewünschten Wert.",
    "source": "rechnungen.csv"
  },
  {
    "id": "rechnungen-190",
    "category": "Rechnungen",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Eine Aufgabe fragt „Welche Investition ist rentabler?“ Was sollte verglichen werden?",
    "answers": [
      "Die Rentabilität, zum Beispiel anhand des ROI",
      "Nur der Kaufpreis",
      "Nur die Laufzeit",
      "Nur die Anzahl der Mitarbeiter"
    ],
    "correctAnswer": 0,
    "explanation": "„Rentabler“ bezieht sich auf das Verhältnis des wirtschaftlichen Erfolgs zum eingesetzten Kapital.",
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
    "question": "Ein Kunde besitzt eine gekaufte Sache bereits, hat aber aufgrund eines Eigentumsvorbehalts noch nicht das Eigentum daran erworben. Welche Aussage ist korrekt?",
    "answers": [
      "Besitz und Eigentum können bei unterschiedlichen Personen liegen",
      "Besitz und Eigentum bedeuten rechtlich immer dasselbe",
      "Der Kunde kann niemals Besitzer der Sache sein",
      "Eigentum entsteht immer automatisch bei Übergabe"
    ],
    "correctAnswer": 0,
    "explanation": "Besitz beschreibt die tatsächliche Herrschaft über eine Sache, während Eigentum die rechtliche Zuordnung bezeichnet. Beides kann auseinanderfallen.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-003",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist der wesentliche Unterschied zwischen gesetzlicher Gewährleistung und einer Garantie?",
    "answers": [
      "Die Gewährleistung ergibt sich aus gesetzlichen Regelungen, eine Garantie ist eine zusätzliche freiwillige Zusage",
      "Eine Garantie ist gesetzlich immer vorgeschrieben",
      "Gewährleistung gilt nur bei gebrauchten Waren",
      "Garantie und Gewährleistung sind rechtlich identisch"
    ],
    "correctAnswer": 0,
    "explanation": "Die Gewährleistung beruht auf gesetzlichen Ansprüchen bei Mängeln. Eine Garantie ist dagegen eine zusätzliche freiwillige Leistung des Herstellers oder Verkäufers.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-004",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Arbeitnehmer wird arbeitsunfähig krank. Welche Pflicht hat er gegenüber seinem Arbeitgeber grundsätzlich?",
    "answers": [
      "Die Arbeitsunfähigkeit und deren voraussichtliche Dauer unverzüglich mitteilen",
      "Er darf den Arbeitgeber erst nach einer Woche informieren",
      "Er muss während der Krankheit Urlaub beantragen",
      "Er muss selbstständig einen Ersatzmitarbeiter organisieren"
    ],
    "correctAnswer": 0,
    "explanation": "Arbeitnehmer müssen dem Arbeitgeber die Arbeitsunfähigkeit und die voraussichtliche Dauer grundsätzlich unverzüglich mitteilen.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-005",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Sozialversicherung schützt Arbeitnehmer hauptsächlich gegen die finanziellen Folgen von Arbeitslosigkeit?",
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
    "question": "Welche Aufgabe hat die gesetzliche Unfallversicherung hauptsächlich?",
    "answers": [
      "Sie schützt Beschäftigte bei Arbeitsunfällen und bestimmten Berufskrankheiten",
      "Sie bezahlt grundsätzlich alle privaten Freizeitunfälle",
      "Sie ersetzt die gesetzliche Krankenversicherung vollständig",
      "Sie finanziert ausschließlich die Altersrente"
    ],
    "correctAnswer": 0,
    "explanation": "Die gesetzliche Unfallversicherung ist insbesondere für Arbeitsunfälle, Wegeunfälle und anerkannte Berufskrankheiten zuständig.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-007",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Unternehmen erzielt dauerhaft höhere Einnahmen als Ausgaben. Wie wirkt sich dies grundsätzlich auf den Unternehmenserfolg aus?",
    "answers": [
      "Es entsteht grundsätzlich ein Gewinn",
      "Es entsteht zwingend ein Verlust",
      "Das Eigenkapital muss automatisch auf null sinken",
      "Die Liquidität muss zwingend negativ sein"
    ],
    "correctAnswer": 0,
    "explanation": "Wenn die Erträge beziehungsweise Einnahmen die entsprechenden Aufwendungen beziehungsweise Ausgaben übersteigen, entsteht grundsätzlich ein positiver Unternehmenserfolg.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-008",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum führen Unternehmen eine Nutzwertanalyse durch?",
    "answers": [
      "Um mehrere Alternativen anhand gewichteter qualitativer und quantitativer Kriterien zu vergleichen",
      "Um ausschließlich den billigsten Einkaufspreis zu bestimmen",
      "Um automatisch die Steuerlast des Unternehmens zu berechnen",
      "Um Mitarbeitergehälter festzulegen"
    ],
    "correctAnswer": 0,
    "explanation": "Eine Nutzwertanalyse ermöglicht einen strukturierten Vergleich verschiedener Alternativen anhand mehrerer Kriterien und ihrer Gewichtung.",
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
    "question": "Ein Unternehmen kann eine fällige Rechnung trotz vorhandener Vermögenswerte kurzfristig nicht bezahlen. Welches Problem liegt hauptsächlich vor?",
    "answers": [
      "Ein Liquiditätsproblem",
      "Ein Problem der Bildschirmauflösung",
      "Ein Produktivitätsgewinn",
      "Eine automatische Insolvenz unabhängig von weiteren Umständen"
    ],
    "correctAnswer": 0,
    "explanation": "Liquidität beschreibt die Fähigkeit, fällige Zahlungsverpflichtungen rechtzeitig erfüllen zu können. Vermögen allein bedeutet nicht automatisch, dass kurzfristig genügend Zahlungsmittel vorhanden sind.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-011",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Kaufvertrag?",
    "answers": [
      "Ein Vertrag, bei dem sich Verkäufer und Käufer zu Leistung und Gegenleistung verpflichten.",
      "Eine unverbindliche Werbung ohne rechtliche Wirkung.",
      "Ein Vertrag ausschließlich zwischen Arbeitnehmer und Arbeitgeber.",
      "Eine behördliche Genehmigung für Netzwerkbetrieb."
    ],
    "correctAnswer": 0,
    "explanation": "Beim Kaufvertrag schuldet der Verkäufer die Sache bzw. Leistung, der Käufer insbesondere die Zahlung des Kaufpreises.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-012",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Wann kommt ein Vertrag typischerweise zustande?",
    "answers": [
      "Durch zwei übereinstimmende Willenserklärungen, Angebot und Annahme.",
      "Erst nach vollständiger Bezahlung.",
      "Nur durch eine Rechnung.",
      "Automatisch durch jede Werbung."
    ],
    "correctAnswer": 0,
    "explanation": "Grundsätzlich entsteht ein Vertrag durch übereinstimmende Willenserklärungen.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-013",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Angebot im rechtlichen Sinn?",
    "answers": [
      "Eine empfangsbedürftige Willenserklärung, die so bestimmt ist, dass der Vertrag durch Annahme zustande kommen kann.",
      "Jede unverbindliche Produktwerbung.",
      "Nur eine mündliche Preisangabe ohne weitere Angaben.",
      "Eine Mahnung nach Zahlungsverzug."
    ],
    "correctAnswer": 0,
    "explanation": "Ein verbindliches Angebot muss die wesentlichen Vertragsbestandteile ausreichend bestimmen.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-014",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Welche Aussage zu einer invitatio ad offerendum ist typisch?",
    "answers": [
      "Sie ist eine Aufforderung an Kunden, ihrerseits ein Angebot abzugeben.",
      "Sie ist immer bereits ein verbindlicher Kaufvertrag.",
      "Sie ist eine Kündigungserklärung.",
      "Sie ist ausschließlich eine Zahlungserinnerung."
    ],
    "correctAnswer": 0,
    "explanation": "Viele Warenpräsentationen oder Online-Shop-Darstellungen gelten als Aufforderung zur Abgabe eines Angebots.",
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
    "question": "Ein Rechnungsbetrag beträgt 1.000 €. Es werden 2 % Skonto gewährt. Wie hoch ist der Skontobetrag?",
    "answers": [
      "2 €",
      "20 €",
      "50 €",
      "200 €"
    ],
    "correctAnswer": 1,
    "explanation": "2 % von 1.000 € sind 20 €.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-018",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Warum ist es in Kalkulationsaufgaben wichtig, Prozentwerte auf die richtige Bezugsgröße anzuwenden?",
    "answers": [
      "Weil 10 % je nach Ausgangsbetrag unterschiedliche absolute Beträge ergeben.",
      "Weil Prozente immer auf den Nettogewinn bezogen werden.",
      "Weil alle Prozentwerte in Euro umgerechnet werden müssen, bevor man multipliziert.",
      "Weil die Bezugsgröße nur bei Mehrwertsteuer relevant ist."
    ],
    "correctAnswer": 0,
    "explanation": "In Kalkulationsschemata ändern sich die Bezugsgrößen zwischen den Stufen.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-019",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was beschreibt eine Zielgruppe?",
    "answers": [
      "Eine Gruppe potenzieller Kunden mit gemeinsamen relevanten Merkmalen und Bedürfnissen.",
      "Nur die internen Mitarbeiter eines Unternehmens.",
      "Alle Unternehmen einer Branche ohne weitere Unterscheidung.",
      "Ausschließlich bestehende Lieferanten."
    ],
    "correctAnswer": 0,
    "explanation": "Zielgruppen helfen, Produkte, Beratung und Marketing gezielt auszurichten.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-020",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Wofür steht das AIDA-Modell?",
    "answers": [
      "Attention, Interest, Desire, Action",
      "Analysis, Integration, Data, Administration",
      "Attention, Information, Distribution, Accounting",
      "Action, Interest, Delivery, Agreement"
    ],
    "correctAnswer": 0,
    "explanation": "AIDA beschreibt vereinfacht Phasen der Werbewirkung von Aufmerksamkeit bis Handlung.",
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
    "question": "Welche Perspektive gehört bei SWOT typischerweise zur externen Analyse?",
    "answers": [
      "Chancen und Risiken",
      "Stärken und Schwächen",
      "Mitarbeiterkompetenzen ausschließlich",
      "Interne Prozesse ausschließlich"
    ],
    "correctAnswer": 0,
    "explanation": "Opportunities und Threats betrachten das Umfeld des Unternehmens.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-023",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Welche Analyse ist typischerweise eher intern?",
    "answers": [
      "Kompetenzanalyse der eigenen Mitarbeiter.",
      "Analyse neuer gesetzlicher Marktanforderungen.",
      "Benchmarking mit Wettbewerbern.",
      "Analyse technologischer Trends im Markt."
    ],
    "correctAnswer": 0,
    "explanation": "Eigene Mitarbeiterkompetenzen sind ein interner Faktor.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-024",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Welche Analyse ist typischerweise eher extern?",
    "answers": [
      "Analyse der Wettbewerber im Markt.",
      "Analyse der eigenen Maschinenkapazität.",
      "Analyse interner Prozesskosten.",
      "Analyse der eigenen Mitarbeiterzufriedenheit."
    ],
    "correctAnswer": 0,
    "explanation": "Wettbewerber gehören zum externen Unternehmensumfeld.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-025",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Lastenheft?",
    "answers": [
      "Beschreibung der Anforderungen aus Sicht des Auftraggebers – was soll erreicht werden?",
      "Detaillierte technische Umsetzung ausschließlich aus Sicht des Auftragnehmers.",
      "Eine Rechnung über geleistete Arbeitsstunden.",
      "Ein Protokoll zur Netzwerkauthentifizierung."
    ],
    "correctAnswer": 0,
    "explanation": "Das Lastenheft beschreibt typischerweise die Anforderungen und Ziele des Auftraggebers.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-026",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist ein Pflichtenheft?",
    "answers": [
      "Beschreibung, wie der Auftragnehmer die Anforderungen konkret umsetzen will.",
      "Liste aller gesetzlichen Feiertage.",
      "Nur eine Preisübersicht ohne technische Inhalte.",
      "Ein Dokument ausschließlich für den Einkauf."
    ],
    "correctAnswer": 0,
    "explanation": "Das Pflichtenheft konkretisiert die Umsetzung der Anforderungen aus dem Lastenheft.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-027",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Welche Zuordnung ist korrekt?",
    "answers": [
      "Lastenheft = Was?; Pflichtenheft = Wie?",
      "Lastenheft = Wie?; Pflichtenheft = Wer zahlt?",
      "Lastenheft = Rechnung; Pflichtenheft = Mahnung",
      "Lastenheft = nur Hardware; Pflichtenheft = nur Software"
    ],
    "correctAnswer": 0,
    "explanation": "Als Merkhilfe gilt: Lastenheft beschreibt, was gefordert ist; Pflichtenheft beschreibt, wie es umgesetzt wird.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-028",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist Benchmarking?",
    "answers": [
      "Systematischer Vergleich mit Referenzwerten oder anderen Unternehmen/Prozessen.",
      "Berechnung der Mehrwertsteuer.",
      "Ein Verfahren zur Passwortspeicherung.",
      "Eine arbeitsrechtliche Kündigung."
    ],
    "correctAnswer": 0,
    "explanation": "Benchmarking dient dazu, Leistung und Prozesse mit geeigneten Vergleichsgrößen zu bewerten.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-029",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was versteht man unter Stakeholdern?",
    "answers": [
      "Personen oder Gruppen, die ein Interesse an einem Projekt oder Unternehmen haben bzw. davon betroffen sind.",
      "Nur Aktionäre eines börsennotierten Unternehmens.",
      "Nur Kunden, die bereits bezahlt haben.",
      "Ausschließlich interne Führungskräfte."
    ],
    "correctAnswer": 0,
    "explanation": "Stakeholder können intern oder extern sein, z. B. Mitarbeiter, Kunden, Lieferanten oder Behörden.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-030",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist das Ziel einer Nutzwertanalyse?",
    "answers": [
      "Alternativen anhand gewichteter Kriterien systematisch vergleichen.",
      "Nur den günstigsten Anschaffungspreis auswählen.",
      "Nur technische Leistungswerte ohne Gewichtung betrachten.",
      "Verträge automatisch rechtlich prüfen."
    ],
    "correctAnswer": 0,
    "explanation": "Eine Nutzwertanalyse kombiniert Kriterien, Gewichtungen und Bewertungen zu einem strukturierten Vergleich.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-031",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Warum kann eine Nutzwertanalyse trotz Zahlen subjektive Elemente enthalten?",
    "answers": [
      "Gewichtung und Bewertung der Kriterien beruhen teilweise auf Einschätzungen.",
      "Weil Rechenoperationen mit Prozenten grundsätzlich subjektiv sind.",
      "Weil Preise nicht als Zahlen dargestellt werden können.",
      "Weil alle Kriterien zufällig ausgewählt werden müssen."
    ],
    "correctAnswer": 0,
    "explanation": "Die Methode strukturiert Entscheidungen, beseitigt aber subjektive Gewichtungen und Bewertungen nicht vollständig.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-032",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was bedeutet TCO im IT-Kontext?",
    "answers": [
      "Total Cost of Ownership – Gesamtkosten über den betrachteten Nutzungszeitraum.",
      "Technical Core Output – reine CPU-Leistung.",
      "Total Contract Order – Anzahl geschlossener Verträge.",
      "Transfer Cost Option – Netzwerkgebühr pro Paket."
    ],
    "correctAnswer": 0,
    "explanation": "TCO betrachtet neben Anschaffung oft auch Betrieb, Energie, Wartung, Support und weitere Folgekosten.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-033",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Warum kann das günstigste Gerät bei der Anschaffung langfristig teurer sein?",
    "answers": [
      "Höhere Betriebs-, Energie-, Wartungs- oder Supportkosten können den Preisvorteil übersteigen.",
      "Der Kaufpreis wird nachträglich automatisch verdoppelt.",
      "Günstige Geräte dürfen gesetzlich nicht abgeschrieben werden.",
      "TCO berücksichtigt nur den Listenpreis."
    ],
    "correctAnswer": 0,
    "explanation": "TCO betrachtet die gesamten Kosten über den Lebenszyklus, nicht nur den Anschaffungspreis.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-034",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was sind fixe Kosten?",
    "answers": [
      "Kosten, die innerhalb eines relevanten Bereichs nicht direkt mit der Beschäftigungsmenge schwanken.",
      "Kosten, die mit jeder produzierten Einheit proportional steigen.",
      "Nur Steuern auf den Gewinn.",
      "Ausschließlich Materialkosten."
    ],
    "correctAnswer": 0,
    "explanation": "Beispiele können Miete oder bestimmte Grundgebühren sein.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-035",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was sind variable Kosten?",
    "answers": [
      "Kosten, die sich mit der Leistungs- oder Produktionsmenge verändern.",
      "Kosten, die immer konstant bleiben.",
      "Nur Abschreibungen auf Gebäude.",
      "Kosten, die nie in Kalkulationen vorkommen."
    ],
    "correctAnswer": 0,
    "explanation": "Materialverbrauch oder mengenabhängige Kosten sind typische Beispiele.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-036",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist der Deckungsbeitrag vereinfacht?",
    "answers": [
      "Erlös minus variable Kosten.",
      "Erlös minus fixe Kosten.",
      "Fixkosten minus variable Kosten.",
      "Umsatzsteuer minus Skonto."
    ],
    "correctAnswer": 0,
    "explanation": "Der Deckungsbeitrag trägt zur Deckung fixer Kosten und danach zum Gewinn bei.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-037",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Produkt wird für 100 € verkauft, die variablen Kosten betragen 60 €. Wie hoch ist der Deckungsbeitrag pro Stück?",
    "answers": [
      "20 €",
      "40 €",
      "60 €",
      "160 €"
    ],
    "correctAnswer": 1,
    "explanation": "100 € − 60 € = 40 € Deckungsbeitrag.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-038",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist eine Mahnung?",
    "answers": [
      "Aufforderung an einen Schuldner, eine fällige Leistung zu erbringen.",
      "Eine Preisreduzierung vor Vertragsabschluss.",
      "Eine Form der Inventur.",
      "Ein technischer Projektplan."
    ],
    "correctAnswer": 0,
    "explanation": "Eine Mahnung weist auf eine fällige, noch nicht erbrachte Leistung hin und kann für Verzug relevant sein.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-039",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Welche Aussage zu Zahlungsverzug ist grundsätzlich zutreffend?",
    "answers": [
      "Unter bestimmten Voraussetzungen können Verzugszinsen und weitere Rechtsfolgen entstehen.",
      "Bei Verzug wird jeder Vertrag automatisch unwirksam.",
      "Verzugszinsen sind unabhängig von gesetzlichen oder vertraglichen Grundlagen frei wählbar.",
      "Verzug kann nur bei Barzahlungen entstehen."
    ],
    "correctAnswer": 0,
    "explanation": "Bei Verzug können je nach Voraussetzungen Verzugszinsen und weitere Ansprüche entstehen.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-040",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist der Unterschied zwischen Brutto- und Nettopreis?",
    "answers": [
      "Der Bruttopreis enthält typischerweise Umsatzsteuer, der Nettopreis nicht.",
      "Der Nettopreis enthält immer mehr Steuern als der Bruttopreis.",
      "Brutto und Netto unterscheiden sich nur bei Rabatten.",
      "Der Bruttopreis gilt nur für Unternehmen."
    ],
    "correctAnswer": 0,
    "explanation": "Im üblichen Preisverständnis enthält Brutto die Umsatzsteuer.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-041",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Ein Nettopreis beträgt 100 € und die Umsatzsteuer 19 %. Wie hoch ist der Bruttopreis?",
    "answers": [
      "100 €",
      "109 €",
      "119 €",
      "190 €"
    ],
    "correctAnswer": 2,
    "explanation": "100 € × 1,19 = 119 €.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-042",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Ein Bruttopreis beträgt 119 € bei 19 % Umsatzsteuer. Wie hoch ist der Nettopreis?",
    "answers": [
      "100 €",
      "96,39 €",
      "99,81 €",
      "113,05 €"
    ],
    "correctAnswer": 0,
    "explanation": "119 € / 1,19 = 100 €.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-043",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was beschreibt ein Stundensatz in einer Dienstleistungskalkulation?",
    "answers": [
      "Den berechneten Preis bzw. Kostensatz pro Arbeitsstunde nach dem gewählten Kalkulationsschema.",
      "Die maximale Arbeitszeit pro Woche.",
      "Nur den Bruttolohn des Mitarbeiters.",
      "Die Anzahl der Stunden bis zur Rechnungsstellung."
    ],
    "correctAnswer": 0,
    "explanation": "Ein Stundensatz kann Personalkosten, Gemeinkosten, Zuschläge und Gewinnanteile berücksichtigen.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-044",
    "category": "WiSo",
    "topic": null,
    "difficulty": "hard",
    "question": "Warum ist der direkte Stundenlohn eines Mitarbeiters nicht automatisch der verrechenbare Kundenstundensatz?",
    "answers": [
      "Zusätzliche Kosten wie Lohnnebenkosten, Gemeinkosten, unproduktive Zeiten und Gewinn müssen berücksichtigt werden.",
      "Weil Kundenstundensätze gesetzlich immer exakt doppelt so hoch sein müssen.",
      "Weil Arbeitslohn in Kalkulationen nicht vorkommen darf.",
      "Weil der Kundenstundensatz nur aus Umsatzsteuer besteht."
    ],
    "correctAnswer": 0,
    "explanation": "Der verrechenbare Stundensatz deckt typischerweise mehr als nur den direkten Lohn ab.",
    "source": "wiso.csv"
  },
  {
    "id": "wiso-045",
    "category": "WiSo",
    "topic": null,
    "difficulty": "medium",
    "question": "Was ist eine Anfrage eines Kunden in der Regel?",
    "answers": [
      "Eine Bitte um Informationen oder ein Angebot, häufig noch ohne unmittelbare Vertragsbindung.",
      "Immer bereits eine verbindliche Bestellung.",
      "Eine rechtskräftige Mahnung.",
      "Ein automatisch angenommener Kaufvertrag."
    ],
    "correctAnswer": 0,
    "explanation": "Eine Anfrage dient typischerweise der Informationsbeschaffung und ist noch keine Annahme eines Angebots.",
    "source": "wiso.csv"
  }
];
