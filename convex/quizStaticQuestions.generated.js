// Generated from quiz-data/*.csv by scripts/sync-quiz-data.mjs. Do not edit.
export default [
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
    "explanation": "Für Dual-Channel müssen die Module in den dafür vorgesehenen Speicherkanälen eingesetzt werden. Die genaue Belegung steht im Mainboard-Handbuch."
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
    "explanation": "DDR-Generationen sind elektrisch und mechanisch unterschiedlich. Ein DDR5-Mainboard benötigt kompatiblen DDR5-Arbeitsspeicher."
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
    "explanation": "NVMe-SSDs kommunizieren über PCIe und erreichen typischerweise deutlich höhere Übertragungsraten als SATA-SSDs."
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
    "explanation": "Bei RAID 1 werden die Daten gespiegelt. Zwei 4-TB-Laufwerke stellen deshalb insgesamt 4 TB nutzbare Kapazität bereit."
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
    "explanation": "ECC-Speicher kann bestimmte Bitfehler erkennen und korrigieren und erhöht dadurch die Zuverlässigkeit des Systems."
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
    "explanation": "PCIe ist grundsätzlich abwärtskompatibel. Eine PCIe-4.0-Karte kann daher in einem kompatiblen PCIe-5.0-Steckplatz betrieben werden."
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
    "explanation": "Stark steigende CPU-Temperaturen unter Last deuten auf ein Problem mit Kühlung, Lüfter, Montage oder Wärmeübertragung hin."
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
    "explanation": "Bei der Dimensionierung müssen die gesamte Hardware, mögliche Lastspitzen und eine angemessene Leistungsreserve berücksichtigt werden."
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
    "explanation": "Die 8 Kerne sind physische Recheneinheiten. Durch die unterstützte Multithreading-Technik können insgesamt 16 Threads bereitgestellt werden."
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
    "explanation": "Zwei Module mit jeweils 8 GB ergeben zusammen 16 GB Arbeitsspeicher."
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
    "explanation": "Der CPU-Cache ist ein sehr schneller Speicher für häufig benötigte Daten und Befehle und reduziert dadurch Zugriffe auf den langsameren Arbeitsspeicher."
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
    "explanation": "Die Mainboard-Batterie versorgt unter anderem die Echtzeituhr, wenn der Rechner vom Stromnetz getrennt ist. Eine schwache Batterie kann zum Verlust von Datum und Uhrzeit führen."
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
    "explanation": "Formfaktoren wie ATX oder Micro-ATX definieren unter anderem Größe, Befestigungspunkte und grundlegende mechanische Eigenschaften eines Mainboards."
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
    "explanation": "M.2 beschreibt zunächst eine Bauform bzw. Schnittstellenform. M.2-SSDs können je nach Gerät beispielsweise SATA oder PCIe/NVMe verwenden."
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
    "explanation": "S.M.A.R.T. stellt Zustands- und Diagnosewerte eines Laufwerks bereit. Auffällige Werte können Hinweise auf mögliche Probleme liefern."
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
    "explanation": "Beim Thermal Throttling reduziert ein Prozessor seine Leistung beziehungsweise Taktfrequenz, um eine zu hohe Temperatur zu begrenzen."
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
    "explanation": "Der 24-polige ATX-Hauptstromanschluss verbindet das Netzteil mit dem Mainboard und versorgt es mit den benötigten Versorgungsspannungen."
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
    "explanation": "HDDs bieten typischerweise viel Speicherkapazität zu niedrigeren Kosten pro Terabyte als SSDs und eignen sich daher für große Datenmengen ohne hohe Geschwindigkeitsanforderungen."
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
    "explanation": "Eine dedizierte Grafikkarte ist eine separate Grafikeinheit und verfügt typischerweise über eigenen Videospeicher. Integrierte Grafik ist dagegen in CPU oder Chipsatz integriert und nutzt häufig gemeinsamen Systemspeicher."
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
    "explanation": "USB-C beschreibt zunächst den Steckertyp. Unterstützte Datenraten, Ladeleistungen und Funktionen wie DisplayPort oder Thunderbolt hängen vom jeweiligen Gerät und Standard ab."
  },
  {
    "id": "programming-001",
    "category": "Programmierung",
    "difficulty": "medium",
    "question": "Qual linguagem está sendo usada no frontend deste projeto?",
    "answers": [
      "JavaScript",
      "Python",
      "Java",
      "C#"
    ],
    "correctAnswer": 0,
    "explanation": "O frontend do projeto foi escrito em JavaScript.",
    "media": {
      "type": "code",
      "language": "javascript",
      "content": "const score = 0;\nconsole.log(score);"
    }
  },
  {
    "id": "programming-002",
    "category": "Programmierung",
    "difficulty": "medium",
    "question": "Qual ferramenta renderiza o mundo 2D deste projeto?",
    "answers": [
      "Convex",
      "Phaser",
      "Tiled Server",
      "Vercel"
    ],
    "correctAnswer": 1,
    "explanation": "Phaser é responsável pela renderização e lógica do mundo 2D."
  },
  {
    "id": "programming-003",
    "category": "Programmierung",
    "difficulty": "medium",
    "question": "Quantos personagens fixos existem nesta primeira versão?",
    "answers": [
      "Dois",
      "Três",
      "Quatro",
      "Oito"
    ],
    "correctAnswer": 2,
    "media": {
      "type": "table",
      "columns": [
        "Personagem",
        "ID"
      ],
      "rows": [
        [
          "Michael",
          "michael"
        ],
        [
          "Jassine",
          "jassine"
        ],
        [
          "Sarina",
          "sarina"
        ],
        [
          "Felipe",
          "felipe"
        ]
      ]
    }
  }
];
