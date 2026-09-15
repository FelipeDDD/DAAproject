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
    "id": "netzwerk-002",
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
    "id": "netzwerk-003",
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
    "id": "netzwerk-004",
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
    "id": "netzwerk-005",
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
    "id": "netzwerk-006",
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
    "id": "netzwerk-007",
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
    "id": "netzwerk-008",
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
    "id": "netzwerk-009",
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
    "id": "netzwerk-010",
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
    "id": "netzwerk-011",
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
    "id": "netzwerk-012",
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
    "id": "netzwerk-013",
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
    "id": "netzwerk-014",
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
    "id": "netzwerk-015",
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
    "id": "netzwerk-001",
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
    "id": "pruefungssprache-001",
    "category": "Prüfungssprache",
    "topic": "Aufgabenverben",
    "difficulty": "medium",
    "question": "Was bedeutet die Aufgabenanweisung „nennen“?",
    "answers": [
      "Etwas kurz aufzählen, ohne es ausführlich zu erklären",
      "Etwas mathematisch berechnen",
      "Eine Entscheidung ausführlich begründen",
      "Zwei Dinge miteinander vergleichen"
    ],
    "correctAnswer": 0,
    "explanation": "„Nennen“ bedeutet normalerweise, Begriffe oder Punkte kurz anzugeben.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-002",
    "category": "Prüfungssprache",
    "topic": "Aufgabenverben",
    "difficulty": "medium",
    "question": "Was bedeutet „beschreiben“?",
    "answers": [
      "Einen Sachverhalt in eigenen Worten darstellen",
      "Nur ein Stichwort nennen",
      "Eine Rechnung durchführen",
      "Nur eine Meinung äußern"
    ],
    "correctAnswer": 0,
    "explanation": "„Beschreiben“ bedeutet, einen Sachverhalt verständlich darzustellen.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-003",
    "category": "Prüfungssprache",
    "topic": "Aufgabenverben",
    "difficulty": "medium",
    "question": "Was bedeutet „erläutern“?",
    "answers": [
      "Etwas erklären und Zusammenhänge verständlich machen",
      "Nur einen Begriff nennen",
      "Eine Zahl schätzen",
      "Etwas auswendig abschreiben"
    ],
    "correctAnswer": 0,
    "explanation": "„Erläutern“ verlangt normalerweise mehr als nur eine kurze Nennung.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-004",
    "category": "Prüfungssprache",
    "topic": "Aufgabenverben",
    "difficulty": "medium",
    "question": "Was bedeutet „begründen“?",
    "answers": [
      "Eine Aussage mit nachvollziehbaren Argumenten erklären",
      "Nur das Ergebnis nennen",
      "Nur eine Formel angeben",
      "Ein Beispiel abschreiben"
    ],
    "correctAnswer": 0,
    "explanation": "Bei „begründen“ soll erklärt werden, warum eine Aussage oder Entscheidung sinnvoll ist.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-005",
    "category": "Prüfungssprache",
    "topic": "Aufgabenverben",
    "difficulty": "medium",
    "question": "Was bedeutet „berechnen“?",
    "answers": [
      "Einen Wert mit einer Rechnung ermitteln",
      "Etwas nur beschreiben",
      "Mehrere Begriffe nennen",
      "Eine Meinung formulieren"
    ],
    "correctAnswer": 0,
    "explanation": "„Berechnen“ bedeutet, einen Wert mathematisch zu bestimmen.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-006",
    "category": "Prüfungssprache",
    "topic": "Aufgabenverben",
    "difficulty": "medium",
    "question": "Was bedeutet „ermitteln“?",
    "answers": [
      "Einen Wert oder Sachverhalt feststellen beziehungsweise herausfinden",
      "Nur einen Text lesen",
      "Etwas ignorieren",
      "Eine Meinung ohne Grundlage geben"
    ],
    "correctAnswer": 0,
    "explanation": "„Ermitteln“ kann je nach Aufgabe durch Berechnung, Vergleich oder Analyse erfolgen.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-007",
    "category": "Prüfungssprache",
    "topic": "Aufgabenverben",
    "difficulty": "medium",
    "question": "Was bedeutet „vergleichen“?",
    "answers": [
      "Gemeinsamkeiten und Unterschiede gegenüberstellen",
      "Nur den größeren Wert nennen",
      "Nur eine Definition geben",
      "Eine Rechnung ohne Ergebnis durchführen"
    ],
    "correctAnswer": 0,
    "explanation": "Beim Vergleichen werden mindestens zwei Dinge gegenübergestellt.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-008",
    "category": "Prüfungssprache",
    "topic": "Aufgabenverben",
    "difficulty": "medium",
    "question": "Was bedeutet „beurteilen“?",
    "answers": [
      "Einen Sachverhalt anhand von Kriterien bewerten",
      "Nur einen Begriff nennen",
      "Nur Zahlen abschreiben",
      "Etwas zeichnen"
    ],
    "correctAnswer": 0,
    "explanation": "„Beurteilen“ verlangt eine Bewertung auf Basis nachvollziehbarer Kriterien.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-009",
    "category": "Prüfungssprache",
    "topic": "Aufgabenverben",
    "difficulty": "medium",
    "question": "Was bedeutet „bewerten“?",
    "answers": [
      "Einen Sachverhalt anhand eines Maßstabs oder von Kriterien einschätzen",
      "Nur beschreiben, was zu sehen ist",
      "Eine Zahl berechnen",
      "Einen Begriff übersetzen"
    ],
    "correctAnswer": 0,
    "explanation": "„Bewerten“ geht über eine reine Beschreibung hinaus und verlangt eine Einschätzung.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-010",
    "category": "Prüfungssprache",
    "topic": "Aufgabenverben",
    "difficulty": "medium",
    "question": "Was bedeutet „zuordnen“?",
    "answers": [
      "Elemente der passenden Kategorie oder Aussage zuweisen",
      "Alle Werte addieren",
      "Nur den ersten Begriff erklären",
      "Etwas neu berechnen"
    ],
    "correctAnswer": 0,
    "explanation": "„Zuordnen“ bedeutet, etwas der passenden Gruppe, Funktion oder Aussage zuzuweisen.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-011",
    "category": "Prüfungssprache",
    "topic": "Aufgabenverben",
    "difficulty": "medium",
    "question": "Was bedeutet „ableiten“?",
    "answers": [
      "Aus vorhandenen Informationen eine Folgerung entwickeln",
      "Nur eine Formel abschreiben",
      "Etwas auswendig nennen",
      "Eine Grafik zeichnen"
    ],
    "correctAnswer": 0,
    "explanation": "„Ableiten“ bedeutet, aus gegebenen Informationen logisch zu einer Schlussfolgerung zu kommen.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-012",
    "category": "Prüfungssprache",
    "topic": "Aufgabenverben",
    "difficulty": "medium",
    "question": "Was bedeutet „kennzeichnen“?",
    "answers": [
      "Etwas eindeutig markieren oder durch ein Merkmal kenntlich machen",
      "Etwas ausführlich begründen",
      "Eine Zahl berechnen",
      "Eine Alternative bewerten"
    ],
    "correctAnswer": 0,
    "explanation": "„Kennzeichnen“ bedeutet, etwas erkennbar zu markieren oder charakteristisch zu benennen.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-013",
    "category": "Prüfungssprache",
    "topic": "Aufgabenverben",
    "difficulty": "medium",
    "question": "Was bedeutet „darstellen“?",
    "answers": [
      "Einen Sachverhalt strukturiert wiedergeben",
      "Nur einen Wert berechnen",
      "Etwas nur beurteilen",
      "Eine falsche Antwort korrigieren"
    ],
    "correctAnswer": 0,
    "explanation": "„Darstellen“ bedeutet, Informationen geordnet und verständlich wiederzugeben.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-014",
    "category": "Prüfungssprache",
    "topic": "Aufgabenverben",
    "difficulty": "medium",
    "question": "Was bedeutet „erklären“?",
    "answers": [
      "Einen Sachverhalt so darstellen, dass Ursachen oder Zusammenhänge verständlich werden",
      "Nur einen Begriff nennen",
      "Nur ein Ergebnis angeben",
      "Etwas zufällig auswählen"
    ],
    "correctAnswer": 0,
    "explanation": "Beim Erklären sollen Zusammenhänge verständlich gemacht werden.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-015",
    "category": "Prüfungssprache",
    "topic": "Aufgabenverben",
    "difficulty": "medium",
    "question": "Was bedeutet „begrenzen“?",
    "answers": [
      "Eine Ober- oder Untergrenze festlegen",
      "Etwas verdoppeln",
      "Etwas vergleichen",
      "Etwas automatisch löschen"
    ],
    "correctAnswer": 0,
    "explanation": "„Begrenzen“ bedeutet, einen Wert oder Bereich einzuschränken.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-016",
    "category": "Prüfungssprache",
    "topic": "Prüfungsformulierungen",
    "difficulty": "medium",
    "question": "Was bedeutet „Nennen Sie zwei Vorteile“?",
    "answers": [
      "Zwei Vorteile kurz angeben",
      "Zwei Vorteile ausführlich berechnen",
      "Zwei Nachteile erklären",
      "Eine Entscheidung begründen"
    ],
    "correctAnswer": 0,
    "explanation": "Bei „nennen“ reicht normalerweise eine knappe Angabe der geforderten Punkte.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-017",
    "category": "Prüfungssprache",
    "topic": "Prüfungsformulierungen",
    "difficulty": "medium",
    "question": "Was bedeutet „Begründen Sie Ihre Antwort“?",
    "answers": [
      "Erklären, warum die Antwort richtig oder sinnvoll ist",
      "Nur Ja oder Nein schreiben",
      "Nur einen Wert nennen",
      "Die Aufgabe wiederholen"
    ],
    "correctAnswer": 0,
    "explanation": "Eine Begründung braucht nachvollziehbare Argumente.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-018",
    "category": "Prüfungssprache",
    "topic": "Prüfungsformulierungen",
    "difficulty": "medium",
    "question": "Was bedeutet „Erläutern Sie anhand eines Beispiels“?",
    "answers": [
      "Die Erklärung soll durch ein passendes Beispiel verdeutlicht werden",
      "Nur das Beispiel nennen",
      "Nur eine Definition schreiben",
      "Eine Rechnung durchführen"
    ],
    "correctAnswer": 0,
    "explanation": "„Anhand eines Beispiels“ bedeutet, dass das Beispiel zur Erklärung verwendet werden soll.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-019",
    "category": "Prüfungssprache",
    "topic": "Prüfungsformulierungen",
    "difficulty": "medium",
    "question": "Was bedeutet „Vergleichen Sie die beiden Lösungen“?",
    "answers": [
      "Gemeinsamkeiten und Unterschiede der beiden Lösungen darstellen",
      "Nur die bessere Lösung nennen",
      "Beide Lösungen addieren",
      "Nur die Kosten berechnen"
    ],
    "correctAnswer": 0,
    "explanation": "Ein Vergleich verlangt eine Gegenüberstellung beider Lösungen.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-020",
    "category": "Prüfungssprache",
    "topic": "Prüfungsformulierungen",
    "difficulty": "medium",
    "question": "Was bedeutet „Beurteilen Sie, welche Lösung geeigneter ist“?",
    "answers": [
      "Die Lösungen anhand sinnvoller Kriterien bewerten und eine Entscheidung treffen",
      "Nur technische Daten abschreiben",
      "Nur die billigere Lösung wählen",
      "Beide Lösungen als gleich bezeichnen"
    ],
    "correctAnswer": 0,
    "explanation": "„Beurteilen“ verlangt eine begründete Bewertung.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-021",
    "category": "Prüfungssprache",
    "topic": "Prüfungsformulierungen",
    "difficulty": "medium",
    "question": "Was bedeutet „Ermitteln Sie den benötigten Speicherplatz“?",
    "answers": [
      "Den erforderlichen Speicherplatz herausfinden beziehungsweise berechnen",
      "Nur den vorhandenen Speicher nennen",
      "Den Speicher erklären",
      "Eine Festplatte auswählen, ohne zu rechnen"
    ],
    "correctAnswer": 0,
    "explanation": "„Ermitteln“ verlangt hier das Bestimmen des gesuchten Werts.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-022",
    "category": "Prüfungssprache",
    "topic": "Prüfungsformulierungen",
    "difficulty": "medium",
    "question": "Was bedeutet „Berechnen Sie den prozentualen Anteil“?",
    "answers": [
      "Den Anteil als Prozentwert bestimmen",
      "Nur den Gesamtwert nennen",
      "Den Anteil beschreiben, ohne zu rechnen",
      "Nur die Differenz bilden"
    ],
    "correctAnswer": 0,
    "explanation": "Die Formulierung verlangt eine Prozentrechnung.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-023",
    "category": "Prüfungssprache",
    "topic": "Prüfungsformulierungen",
    "difficulty": "medium",
    "question": "Was bedeutet „Geben Sie das Ergebnis in Prozent an“?",
    "answers": [
      "Das Endergebnis soll als Prozentwert dargestellt werden",
      "Das Ergebnis soll in Euro angegeben werden",
      "Es darf keine Rechnung gezeigt werden",
      "Das Ergebnis muss gerundet werden"
    ],
    "correctAnswer": 0,
    "explanation": "„In Prozent angeben“ bestimmt die gewünschte Einheit des Ergebnisses.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-024",
    "category": "Prüfungssprache",
    "topic": "Prüfungsformulierungen",
    "difficulty": "medium",
    "question": "Was bedeutet „Runden Sie auf zwei Nachkommastellen“?",
    "answers": [
      "Das Ergebnis soll zwei Stellen nach dem Komma haben",
      "Das Ergebnis soll auf eine ganze Zahl gerundet werden",
      "Das Ergebnis soll verdoppelt werden",
      "Nur die ersten zwei Ziffern sollen verwendet werden"
    ],
    "correctAnswer": 0,
    "explanation": "„Nachkommastellen“ sind die Stellen rechts vom Komma.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-025",
    "category": "Prüfungssprache",
    "topic": "Prüfungsformulierungen",
    "difficulty": "medium",
    "question": "Was bedeutet „Gehen Sie davon aus, dass ...“?",
    "answers": [
      "Die folgende Annahme soll für die Aufgabe als gegeben betrachtet werden",
      "Die Aussage soll bewiesen werden",
      "Die Aussage soll ignoriert werden",
      "Es muss eine andere Annahme gewählt werden"
    ],
    "correctAnswer": 0,
    "explanation": "Diese Formulierung gibt eine Annahme vor, mit der weitergearbeitet werden soll.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-026",
    "category": "Prüfungssprache",
    "topic": "Prüfungsformulierungen",
    "difficulty": "medium",
    "question": "Was bedeutet „Unter der Annahme, dass ...“?",
    "answers": [
      "Die Berechnung oder Bewertung soll auf dieser Voraussetzung basieren",
      "Die Voraussetzung ist falsch",
      "Es darf keine Rechnung durchgeführt werden",
      "Nur eine Definition ist gefragt"
    ],
    "correctAnswer": 0,
    "explanation": "„Unter der Annahme“ gibt eine Voraussetzung für die weitere Bearbeitung vor.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-027",
    "category": "Prüfungssprache",
    "topic": "Prüfungsformulierungen",
    "difficulty": "medium",
    "question": "Was bedeutet „Berücksichtigen Sie dabei ...“?",
    "answers": [
      "Der genannte Faktor muss in die Lösung einbezogen werden",
      "Der genannte Faktor soll ignoriert werden",
      "Nur dieser Faktor darf genannt werden",
      "Der Faktor muss verdoppelt werden"
    ],
    "correctAnswer": 0,
    "explanation": "„Berücksichtigen“ bedeutet in die Überlegung oder Berechnung einbeziehen.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-028",
    "category": "Prüfungssprache",
    "topic": "Prüfungsformulierungen",
    "difficulty": "medium",
    "question": "Was bedeutet „Vernachlässigen Sie ...“?",
    "answers": [
      "Der genannte Faktor soll für diese Aufgabe nicht berücksichtigt werden",
      "Der Faktor soll besonders genau berechnet werden",
      "Der Faktor soll verdoppelt werden",
      "Der Faktor soll begründet werden"
    ],
    "correctAnswer": 0,
    "explanation": "„Vernachlässigen“ bedeutet hier, den Faktor nicht in die Berechnung einzubeziehen.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-029",
    "category": "Prüfungssprache",
    "topic": "Prüfungsformulierungen",
    "difficulty": "medium",
    "question": "Was bedeutet „Welche Aussage trifft zu?“?",
    "answers": [
      "Es soll die richtige Aussage ausgewählt werden",
      "Alle Aussagen sind automatisch richtig",
      "Es soll eine Rechnung durchgeführt werden",
      "Es soll nur die längste Aussage gewählt werden"
    ],
    "correctAnswer": 0,
    "explanation": "„Trifft zu“ bedeutet „ist richtig“.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-030",
    "category": "Prüfungssprache",
    "topic": "Prüfungsformulierungen",
    "difficulty": "medium",
    "question": "Was bedeutet „Welche Aussage trifft nicht zu?“?",
    "answers": [
      "Es soll die falsche Aussage gefunden werden",
      "Es soll die richtige Aussage gefunden werden",
      "Alle Aussagen sollen erklärt werden",
      "Es soll eine Zahl berechnet werden"
    ],
    "correctAnswer": 0,
    "explanation": "Das Wort „nicht“ kehrt die Auswahl um: Gesucht ist die unzutreffende Aussage.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-031",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „zutreffend“?",
    "answers": [
      "Richtig beziehungsweise passend",
      "Unmöglich",
      "Unvollständig",
      "Besonders teuer"
    ],
    "correctAnswer": 0,
    "explanation": "„Zutreffend“ bedeutet, dass eine Aussage richtig oder passend ist.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-032",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „unzulässig“?",
    "answers": [
      "Nicht erlaubt",
      "Empfohlen",
      "Besonders günstig",
      "Technisch schneller"
    ],
    "correctAnswer": 0,
    "explanation": "„Unzulässig“ bedeutet nicht erlaubt oder nicht gestattet.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-033",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „zulässig“?",
    "answers": [
      "Erlaubt beziehungsweise gestattet",
      "Verboten",
      "Unwirtschaftlich",
      "Unbekannt"
    ],
    "correctAnswer": 0,
    "explanation": "„Zulässig“ bedeutet erlaubt.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-034",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „erforderlich“?",
    "answers": [
      "Notwendig",
      "Optional",
      "Verboten",
      "Bereits abgeschlossen"
    ],
    "correctAnswer": 0,
    "explanation": "„Erforderlich“ bedeutet notwendig.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-035",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „ausreichend“?",
    "answers": [
      "Genug für den vorgesehenen Zweck",
      "Zu wenig",
      "Unzulässig",
      "Sehr teuer"
    ],
    "correctAnswer": 0,
    "explanation": "„Ausreichend“ bedeutet, dass etwas in genügendem Maß vorhanden ist.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-036",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „geeignet“?",
    "answers": [
      "Für den vorgesehenen Zweck passend",
      "Grundsätzlich verboten",
      "Immer die billigste Lösung",
      "Nicht verfügbar"
    ],
    "correctAnswer": 0,
    "explanation": "„Geeignet“ bedeutet passend oder verwendbar für einen bestimmten Zweck.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-037",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „zweckmäßig“?",
    "answers": [
      "Für den vorgesehenen Zweck sinnvoll und geeignet",
      "Besonders teuer",
      "Nur vorübergehend erlaubt",
      "Mathematisch exakt"
    ],
    "correctAnswer": 0,
    "explanation": "„Zweckmäßig“ beschreibt eine sinnvolle Lösung für den vorgesehenen Zweck.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-038",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „gegebenenfalls“?",
    "answers": [
      "Falls es notwendig oder passend ist",
      "Auf jeden Fall",
      "Unter keinen Umständen",
      "Nur am Ende"
    ],
    "correctAnswer": 0,
    "explanation": "„Gegebenenfalls“ bedeutet „wenn nötig“ beziehungsweise „falls erforderlich“.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-039",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet die Abkürzung „ggf.“?",
    "answers": [
      "gegebenenfalls",
      "gegeben für",
      "gegenübergestellt",
      "grundsätzlich gültig"
    ],
    "correctAnswer": 0,
    "explanation": "„ggf.“ steht für „gegebenenfalls“.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-040",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „beziehungsweise“ in vielen Prüfungsaufgaben?",
    "answers": [
      "Je nach Zusammenhang „oder genauer gesagt“ beziehungsweise „oder“",
      "Immer „und“",
      "Immer „aber“",
      "Immer „deshalb“"
    ],
    "correctAnswer": 0,
    "explanation": "„Beziehungsweise“ kann je nach Kontext präzisieren oder Alternativen verbinden.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-041",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „hinsichtlich“?",
    "answers": [
      "In Bezug auf",
      "Trotz",
      "Ohne",
      "Zusätzlich zu"
    ],
    "correctAnswer": 0,
    "explanation": "„Hinsichtlich“ bedeutet „bezüglich“ oder „in Bezug auf“.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-042",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „bezüglich“?",
    "answers": [
      "In Bezug auf",
      "Unterhalb von",
      "Anstelle von",
      "Ohne Berücksichtigung von"
    ],
    "correctAnswer": 0,
    "explanation": "„Bezüglich“ bezeichnet den Gegenstand, auf den sich eine Aussage bezieht.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-043",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „im Hinblick auf“?",
    "answers": [
      "In Bezug auf einen bestimmten Aspekt",
      "Ohne Bezug zu",
      "Trotz eines Aspekts",
      "Am Ende einer Aufgabe"
    ],
    "correctAnswer": 0,
    "explanation": "Die Formulierung lenkt die Betrachtung auf einen bestimmten Aspekt.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-044",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „entsprechend“?",
    "answers": [
      "Passend zu einer Vorgabe oder Situation",
      "Vollständig unabhängig davon",
      "Immer identisch",
      "Automatisch falsch"
    ],
    "correctAnswer": 0,
    "explanation": "„Entsprechend“ bedeutet einer Vorgabe oder einem Zusammenhang gemäß.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-045",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „vorgegeben“?",
    "answers": [
      "Bereits festgelegt und als gegeben anzunehmen",
      "Noch frei wählbar",
      "Nicht relevant",
      "Bereits falsch"
    ],
    "correctAnswer": 0,
    "explanation": "Ein vorgegebener Wert oder eine Vorgabe ist bereits festgelegt.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-046",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „jeweils“?",
    "answers": [
      "Für jedes genannte Element einzeln",
      "Nur einmal insgesamt",
      "Nur für das erste Element",
      "Immer gleichzeitig"
    ],
    "correctAnswer": 0,
    "explanation": "„Jeweils“ bedeutet für jedes einzelne Element beziehungsweise jeden einzelnen Fall.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-047",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „mindestens“?",
    "answers": [
      "Der genannte Wert ist die Untergrenze",
      "Der genannte Wert ist die Obergrenze",
      "Genau dieser Wert ist erlaubt",
      "Der Wert muss kleiner sein"
    ],
    "correctAnswer": 0,
    "explanation": "„Mindestens“ bedeutet gleich viel oder mehr.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-048",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „höchstens“?",
    "answers": [
      "Der genannte Wert ist die Obergrenze",
      "Der genannte Wert ist die Untergrenze",
      "Der Wert muss größer sein",
      "Genau dieser Wert ist verboten"
    ],
    "correctAnswer": 0,
    "explanation": "„Höchstens“ bedeutet gleich viel oder weniger.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-049",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „nicht mehr als 20“?",
    "answers": [
      "Höchstens 20",
      "Mindestens 20",
      "Mehr als 20",
      "Genau 21"
    ],
    "correctAnswer": 0,
    "explanation": "„Nicht mehr als“ bezeichnet eine Obergrenze.",
    "source": "pruefungssprache.csv"
  },
  {
    "id": "pruefungssprache-050",
    "category": "Prüfungssprache",
    "topic": "Textverständnis",
    "difficulty": "medium",
    "question": "Was bedeutet „nicht weniger als 20“?",
    "answers": [
      "Mindestens 20",
      "Höchstens 20",
      "Weniger als 20",
      "Genau 19"
    ],
    "correctAnswer": 0,
    "explanation": "„Nicht weniger als“ bezeichnet eine Untergrenze.",
    "source": "pruefungssprache.csv"
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
    "question": "Welcher deutsche Begriff wird im Material für „Break-Even-Point“ verwendet?",
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
    "question": "Eine Wirtschaftlichkeit von 1,25 bedeutet laut Material:",
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
    "explanation": "Wartungskosten umfassen laut Material unter anderem Support, Reparaturen und Updates.",
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
  }
];
