// Generated from quiz-data/*.csv by scripts/sync-quiz-data.mjs. Do not edit.
export default [
  {
    "id": "betriebssysteme-001",
    "category": "Betriebssysteme",
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
    "id": "wiso-001",
    "category": "WiSo",
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
