# Projektdokumentation – FocusFighter

## Inhaltsverzeichnis

1. [Ausgangslage](#1-ausgangslage)
2. [Lösungsidee](#2-lösungsidee)
3. [Vorgehen & Artefakte](#3-vorgehen--artefakte)
    1. [Understand & Define](#31-understand--define)
    2. [Sketch](#32-sketch)
    3. [Decide](#33-decide)
    4. [Prototype](#34-prototype)
    5. [Validate](#35-validate)
4. [Erweiterungen](#4-erweiterungen)
5. [Projektorganisation](#5-projektorganisation)
6. [KI-Deklaration](#6-ki-deklaration)
7. [Anhang](#7-anhang)

---

## 1. Ausgangslage

- **Problem:** Kampfsport-Trainer (Boxen, MMA, Kickboxen) haben im Trainingsalltag keine einfache, digitale Lösung um Trainingsintervalle präzise zu steuern und Beobachtungen zu Athleten festzuhalten. Physische Stoppuhren bieten keine Dokumentationsmöglichkeit; allgemeine Timer-Apps kennen keine Kampfsport-spezifischen Modi wie Sparring-Runden oder HIIT-Intervalle.
- **Ziele:**
  - Digitaler Trainingstimer mit konfigurierbaren Runden, Arbeits- und Pausenzeiten
  - Integriertes Trainingsjournal zur Dokumentation von Einheiten und Athleten-Notizen
  - Personalisierte Benutzerkonten, damit jeder Trainer seine eigene Trainingshistorie verwaltet
  - Dashboard mit Wochenübersicht und persönlichem Wochenziel
- **Primäre Zielgruppe:** Kampfsport-Trainer in Vereinen und Studios (Boxen, MMA, Kickboxen), die regelmässig Gruppentrainings leiten und den Fortschritt ihrer Athleten dokumentieren möchten.
- **Weitere Stakeholder:** Athleten, die von strukturierten Trainingseinheiten profitieren; Vereinsleitungen, die Trainingsqualität sicherstellen möchten.

---

## 2. Lösungsidee

- **Kernfunktionalität:**
  1. **Authentifizierung:** Trainer erstellt einen persönlichen Account (E-Mail + Passwort). Alle Daten sind ausschliesslich dem eigenen Account zugeordnet.
  2. **Workout auswählen:** Auswahl aus 4 vorkonfigurierten Modi (Sparring, HIIT, Schattenboxen, Sandsack), jeweils mit sinnvollen Standardwerten.
  3. **Setup:** Runden, Arbeitszeit und Pausenzeit individuell anpassen; beim Sparring-Modus optional Kämpfer-Namen erfassen.
  4. **Timer:** Vollbild-Timer mit Prep-Phase (10 s), Arbeits- und Pausenphasen, Rundeninfo und Skip-Buttons. Tap-to-Pause auf dem gesamten Bildschirm.
  5. **Session speichern:** Nach dem Training werden Konfiguration und optionale Trainer-Notizen dauerhaft gespeichert.
  6. **Dashboard & Historie:** Wochenstatistik, Zielfortschritt und die letzten Einheiten auf einen Blick; vollständiges Trainingsjournal mit Datumsgruppierung.
- **Annahmen:** Trainer verfügen über ein Gerät mit Browser (Desktop oder Tablet) während des Trainings. Internetverbindung für Datenbankzugriff ist gegeben.
- **Abgrenzung:** Keine Athleten-eigenen Accounts; keine Video- oder Bildanalyse; keine Echtzeit-Synchronisation mehrerer Trainer.

---

## 3. Vorgehen & Artefakte

### 3.1 Understand & Define

- **Zielgruppenverständnis:** Interviews und Beobachtungen im Trainingsalltag zeigten, dass Trainer während einer Einheit wenig Zeit für Bedienung haben – die App muss mit minimalem Interaktionsaufwand bedienbar sein (grosse Tap-Flächen, Auto-Start des Timers). Notizen werden oft erst nach einer Übung erfasst, nicht live.
- **Wesentliche Erkenntnisse:**
  - Timer muss vollbildschirmfüllend und einhandbedienbar sein
  - Trainer kennen ihre Standard-Modi (Sparring 3 min/1 min etc.) und wollen Abweichungen schnell einstellen können
  - Historisierung und Notizen sind für die Trainingsplanung der nächsten Woche wichtig
  - Personalisierung (eigener Account) ist Voraussetzung für mehrere Trainer im gleichen Verein

### 3.2 Sketch

**Skizzen:** [docs/sketches.pdf](docs/sketches.pdf)

Es wurden vier Lösungsansätze skizziert und bewertet:

| Variante | Kernidee | Bewertung |
|---|---|---|
| **Quick Start** | Workout-Tabs (Fitness / Sparring / Sandsack) + Runden-Slider (3, 6, 9, 12) direkt auf dem Startscreen | ✅ Spart Zeit, eigene Presets wären cool — zu wenig Konfiguration |
| **Minimalistisch** | Nur grosser Ring-Timer (04:30) + Start-Button, keine Navigation | ✅ Erleichtert Fokus, weniger ablenkend — fehlende Dokumentation/History |
| **Session-Steuerung** | Timer mit Job-Access-Liste links + Gestensteuerung (Faust-Geste zum Pausieren) | ✅ Gute Idee, behebt das Handschuh-Problem — Geste schwer erkennbar |
| **Dashboard + Speech UI** | Vorherige Sessions als Liste + Sprachsteuerung über Mikrofon | ✅ Dokumentation und Sprachbefehle ideal für Handschuh-Nutzung |

**Entscheidungsprozess (Seite 2 der Skizzen):**
Die finale Lösung kombiniert Quick Start und Gestensteuerung: Workout-Liste → 5-Sekunden-Countdown → Vollbild-Timer mit grünem Hintergrund (signalisiert Action), überall antippbar zum Pausieren. Erhöht die Usability mit Handschuhen, spart Zeit mit dem Quick-Start-Menü.

### 3.3 Decide

- **Gewählte Variante & Begründung:** Variante B – Mehrseitige Navigation. Entscheidend war die Trennung zwischen dem Vollbild-Timer (keine Ablenkung während des Trainings) und dem Dashboard/History-Bereich (strukturierte Übersicht). Eine Sidebar-Navigation auf Desktop und eine Bottom-Bar auf Mobile entsprechen bekannten Nutzungsmustern und reduzieren die kognitive Last.
- **End-to-End-Ablauf:**
  1. Login / Registrierung → Dashboard
  2. Dashboard → „Workout starten" → Workout-Auswahl
  3. Workout-Auswahl → Setup-Konfiguration → Timer (Vollbild)
  4. Timer-Ende → Session speichern (mit optionalen Notizen) → Dashboard
  5. Dashboard / History → Vergangene Einheiten einsehen
- **Mockup:** [Figma – FocusFighters](https://www.figma.com/design/9Ur54AqWxJTMP7WU7QHRTO/FocusFighters?node-id=0-1&t=PDJLW4a8wrmmT660-1)

### 3.4 Prototype

#### 3.4.1 Entwurf (Design)

- **Informationsarchitektur:**

  | Route | Funktion |
  |---|---|
  | `/login` | Authentifizierung (Login & Registrierung) |
  | `/dashboard` | Wochenübersicht, letzte Einheiten, Schnellstart |
  | `/workouts` | Auswahl des Workout-Typs |
  | `/setup/[type]` | Konfiguration von Runden, Zeiten, Kämpfer-Namen |
  | `/workout` | Vollbild-Timer |
  | `/history` | Vollständiges Trainingsjournal |
  | `/settings` | Theme, Sprache, Wochenziel |

- **User Interface Design:**
  - **Dark-First-Design** mit tiefem Navy-Blau (`#050810`) als Hintergrund und Grün (`#2ecc71`) als Akzentfarbe – typisch für Kampfsport-Apps und reduziert Augenermüdung bei schlechter Beleuchtung in Sporthallen
  - **Timer-Screen:** Vollbild, farbkodiert (Grün = Arbeit, Orange = Pause, Rot = Pausiert). Kreisförmiger Fortschrittsring, grosse Zeitanzeige. Tap-to-Pause auf dem gesamten Bildschirm.
  - **Dashboard:** Glasmorphismus-Karten für Statistiken, grüner Fortschrittsbalken für das Wochenziel
  - **Responsiv:** Sidebar-Navigation ab 769 px, floating Bottom-Bar auf Mobile
  - **Light-Mode:** Warmes Off-White (`#f0ede8`), alle Texte explizit auf Lesbarkeit geprüft

- **Designentscheidungen:**
  - Farbkodierung der Timer-Phasen für sofortige visuelle Rückmeldung ohne Text lesen zu müssen
  - Auto-Start des 10-Sekunden-Countdowns beim Öffnen der Timer-Seite – eine Interaktion weniger beim Trainingsstart
  - Skip-Buttons für Runde und Pause oben links, klein und nicht im Hauptfokus, aber erreichbar

#### 3.4.2 Umsetzung (Technik)

- **Technologie-Stack:**
  - **Frontend:** SvelteKit 2 (Svelte 5 Runes), Vite 8
  - **UI-Bibliothek:** lucide-svelte (Icons)
  - **Backend:** SvelteKit Server-Side (Form Actions, Load Functions)
  - **Datenbank:** MongoDB Atlas (Cloud)
  - **Auth:** bcryptjs (Passwort-Hashing), eigene Session-Verwaltung mit Cookies
  - **Deployment:** Netlify (Adapter: `@sveltejs/adapter-netlify`)

- **Tooling:** VS Code mit Svelte-Extension, Claude Code (KI-Assistent), MongoDB Compass (DB-Verwaltung lokal)

- **Struktur & Komponenten:**

  ```
  src/
  ├── lib/
  │   ├── components/
  │   │   ├── Navbar.svelte      # Sidebar (Desktop) + Bottom-Bar (Mobile)
  │   │   └── Timer.svelte       # Vollbild-Timer-Komponente
  │   ├── server/
  │   │   └── db.js              # MongoDB-Verbindung & Collection-Helpers
  │   └── settingsStore.js       # Client-seitiger Store (Theme, Sprache, Wochenziel)
  └── routes/
      ├── +layout.svelte         # App-Shell, globale CSS-Variablen, Theme-System
      ├── login/                 # Authentifizierung (Login + Registrierung)
      ├── dashboard/             # Wochenstatistik, letzte Sessions
      ├── workouts/              # Workout-Typ-Auswahl
      ├── setup/[type]/          # Trainings-Konfiguration
      ├── workout/               # Timer-Seite (Vollbild)
      ├── history/               # Trainingsjournal
      └── settings/              # Einstellungen
  ```

- **Daten & Schnittstellen:**
  - **MongoDB-Datenbank:** `focus-fighters` mit drei Collections:
    - `trainers` – Benutzerdaten (E-Mail, gehashtes Passwort, Name)
    - `trainings` – Trainingseinheiten mit `trainerId`-Feld (Datentrennung pro User)
    - `sessions` – Login-Sessions (Cookie-basiert, 7 Tage gültig)
  - **Datenisolation:** Jede Datenbankabfrage filtert mit `{ trainerId: locals.user._id }` – kein Trainer sieht Daten eines anderen
  - **Client-State:** Theme, Sprache und Wochenziel werden via `localStorage` persistiert (kein Server-Round-Trip nötig)
  - **Workout-Übergabe:** Konfiguration wird via `sessionStorage` zwischen Setup- und Timer-Route übergeben

- **Deployment:** [https://focusfighters.netlify.app](https://focusfighters.netlify.app)

- **Besondere Entscheidungen:**
  - Session-Management selbst implementiert statt OAuth-Bibliothek – bewusste Vereinfachung für den Projektumfang
  - CSS-Theme-System vollständig über CSS Custom Properties (`--var`) und globale Overrides im Layout – ermöglicht Theme-Wechsel ohne JavaScript-Neurenderings
  - `settingsStore` setzt die `light-theme`-Klasse auf `<html>` statt nur auf eine App-Container-Div, damit `body`-Hintergrund und Scrollbereiche ausserhalb des Containers korrekt umgefärbt werden

### 3.5 Validate

- **URL der getesteten Version:** [https://focusfighters.netlify.app](https://focusfighters.netlify.app)
- **Ziele der Prüfung:**
  - Ist der Timer ohne Erklärung sofort bedienbar?
  - Können Nutzer ein angepasstes Workout konfigurieren und starten?
  - Ist die Trainingshistorie auffindbar und verständlich?
- **Vorgehen:** Moderierter Usability-Test, on-site, szenariobasiert
- **Stichprobe:** 2 Testpersonen (Noel, Alen) – beide mit Erfahrung im Kampfsport-Training
- **Aufgaben/Szenarien** _(aus UsabilityEvaluation.md)_:
  1. **Standard-Training starten:** Sparring-Einheit mit Standard-Zeiten starten, Timer soll selbstständig laufen
  2. **Benutzerdefiniertes HIIT einrichten:** 10 Runden, 30 s Arbeit, 15 s Pause konfigurieren und starten
  3. **Journal führen & Historie prüfen:** Notizen nach dem Training erfassen, vergangene Einheiten in der Historie einsehen
- **Kennzahlen & Beobachtungen:**

  | Aufgabe | Noel | Alen |
  |---|---|---|
  | Sparring starten | Erfolgreich | Erfolgreich |
  | HIIT konfigurieren | Erfolgreich | Erfolgreich |
  | Notizen & Historie | Erfolgreich | Erfolgreich |

  - Noel vermisste die Möglichkeit, eine laufende Runde zu überspringen
  - Alen wünschte sich ein konfigurierbares Wochenziel (Sessions pro Woche)
  - Noel regte Musik-/Playlist-Integration an
  - Alen schlug zusätzliche Trainingstypen vor

- **Zusammenfassung der Resultate:** Alle drei Kernaufgaben wurden von beiden Testpersonen erfolgreich und ohne Hilfe abgeschlossen. Die App-Struktur und der Timer waren intuitiv verständlich. Der grösste Optimierungsbedarf lag in der Steuerung des laufenden Timers (fehlender Skip) und der Personalisierung der Zielwerte.

- **Abgeleitete Verbesserungen** (priorisiert):
  1. ✅ **Skip-Button für Runden und Pausen** – umgesetzt (vgl. Kap. 4.1)
  2. ✅ **Konfigurierbares Wochenziel** – umgesetzt (vgl. Kap. 4.2)
  3. ⬜ **Zusätzliche Trainingstypen** – offen
  4. ⬜ **Musik-/Playlist-Integration** – offen

---

## 4. Erweiterungen

### 4.1 Skip-Button für Timer-Runden und Pausen

- **Beschreibung & Nutzen:** Während einer laufenden Arbeitsphase oder Pausenphase kann der Trainer die aktuelle Phase mit einem kleinen Button oben links überspringen und sofort in die nächste Phase wechseln. Dies ist im Trainingsalltag nötig, wenn eine Runde vorzeitig abgebrochen wird oder die Pause kürzer ausfallen soll.
- **Wo umgesetzt:**
  - **Frontend:** `src/lib/components/Timer.svelte` – Funktionen `skipRound()` und `skipRest()`, Button `.btn-skip-round` oben links positioniert; `e.stopPropagation()` verhindert, dass der Klick gleichzeitig Pause auslöst
- **Referenz:** Kap. 3.5 – Validierung, Issue von Noel
- **Aus Evaluation abgeleitet?:** Ja – Noel, Usability-Test

### 4.2 Konfigurierbares Wochenziel

- **Beschreibung & Nutzen:** In den Einstellungen kann jeder Trainer sein persönliches Wochenziel (Anzahl Einheiten pro Woche, 1–7) mit einem Stepper einstellen. Der Fortschrittsbalken und die `x / y`-Anzeige im Dashboard spiegeln den eingestellten Wert sofort wider.
- **Wo umgesetzt:**
  - **Frontend Settings:** `src/routes/settings/+page.svelte` – Stepper-Komponente mit +/−-Buttons, `changeWeeklyGoal()`-Funktion
  - **Store:** `src/lib/settingsStore.js` – `weeklyGoal: 5` als Default, persistiert in `localStorage`
  - **Dashboard:** `src/routes/dashboard/+page.svelte` – liest `$settings.weeklyGoal` statt hartkodierter `5`
- **Referenz:** Kap. 3.5 – Validierung, Issue von Alen
- **Aus Evaluation abgeleitet?:** Ja – Alen, Usability-Test

### 4.3 Benutzerauthentifizierung mit Account-Erstellung

- **Beschreibung & Nutzen:** Statt eines Bypass-Logins muss jeder Trainer einen eigenen Account erstellen (Name, E-Mail, Passwort mit Bestätigung). Trainingseinheiten sind über ein `trainerId`-Feld dem jeweiligen Account zugeordnet – kein Trainer sieht Daten eines anderen.
- **Wo umgesetzt:**
  - **Frontend:** `src/routes/login/+page.svelte` – Toggle zwischen Login- und Registrierungsmodus
  - **Backend:** `src/routes/login/+page.server.js` – Validierung, bcryptjs-Hashing (Stärke 12), Session-Erstellung
  - **Datenbank:** MongoDB `trainers`-Collection, `trainings`-Collection mit `trainerId`-Feld
- **Referenz:** Kap. 3.4.2 – Daten & Schnittstellen
- **Aus Evaluation abgeleitet?:** Nein – eigenständige Erweiterung für Produktionsreife

### 4.4 Dark / Light Mode

- **Beschreibung & Nutzen:** Die App unterstützt ein dunkles (Standard) und ein helles Theme. Das helle Theme verwendet ein warmes Off-White (`#f0ede8`) statt reinem Weiss, um Augenermüdung zu reduzieren. Alle Texte sind auf Lesbarkeit in beiden Modes geprüft.
- **Wo umgesetzt:**
  - **Store:** `src/lib/settingsStore.js` – `theme`-Wert, setzt `light-theme`-Klasse auf `<html>`
  - **Layout:** `src/routes/+layout.svelte` – CSS Custom Properties für beide Themes, globale Overrides für Komponenten mit hardkodierten Farben
- **Referenz:** Kap. 3.4.1 – UI Design
- **Aus Evaluation abgeleitet?:** Nein – eigenständige Erweiterung

---

## 5. Projektorganisation

- **Repository:** GitHub – privates Repository
- **Struktur:** SvelteKit-Standard-Struktur; Server-Logik in `+page.server.js`-Dateien, geteilte Logik in `src/lib/`
- **Commit-Praxis:** Feature-orientierte Commits mit beschreibenden Messages
- **Issue-Management:** Probleme und To-dos wurden direkt im Entwicklungsprozess adressiert; Usability-Issues aus dem Test als priorisierte Liste (vgl. Kap. 3.5)

---

## 6. KI-Deklaration

### 6.1 KI-Tools

- **Eingesetzte Tools:** Claude Code (Anthropic), Modell: Claude Sonnet 4.6 – direkt im VS Code via Claude Code Extension
- **Zweck & Umfang:**
  - Implementierung der Benutzerauthentifizierung (Login, Registrierung, Session-Verwaltung)
  - Aufbau und Debugging des Timer-Komponenten-Logik (State-Machine, Skip-Funktionen, Auto-Start)
  - Umsetzung des Dark/Light-Mode-Systems (CSS Custom Properties, globale Overrides)
  - Fehlerbehebung (Svelte-5-Syntaxfehler wie `{#else if}` statt `{:else if}`, escaped Template Literals)
  - Erweiterungen aus dem Usability-Test (Skip-Button, konfigurierbares Wochenziel, Empty-State im Dashboard)
  - Vollständige Datenbankstruktur in MongoDB (Collections, trainerId-basierte Isolation)
- **Eigene Leistung (Abgrenzung):**
  - Konzept, Problemdefinition und Zielgruppenbeschreibung
  - Design-Entscheidungen (Farbwelt, Layout-Struktur, Vollbild-Timer)
  - Usability-Tests: Testplanung, Durchführung, Aufgabenformulierung und Auswertung
  - Priorisierung der Verbesserungen aus dem Usability-Test
  - Qualitätssicherung und Review der KI-generierten Lösungen

### 6.2 Prompt-Vorgehen

Die KI wurde primär als interaktiver Entwicklungspartner eingesetzt, nicht als einmaliger Code-Generator. Typisches Vorgehen:
1. Kontext schaffen: Erst relevante Dateien lesen lassen, dann gezielt fragen
2. Aufgaben präzise beschreiben: Gewünschtes Verhalten statt technische Umsetzung vorgeben
3. Schrittweise vorgehen: Grössere Features in Teilschritte aufteilen (z. B. erst Store, dann UI, dann Dashboard-Integration)
4. Ergebnis prüfen: Nach jeder Änderung manuell im Browser getestet; `svelte-check` zur statischen Analyse

Beispiel-Prompt: *„Im Dashboard soll ein Leerzustand erscheinen wenn noch keine Trainings vorhanden sind – mit einem Button der zu /workouts führt und dem Text ‚Noch keine Trainings absolviert'."*

### 6.3 Reflexion

- **Nutzen:** KI beschleunigte repetitive Implementierungsarbeiten (Übersetzungsobjekte, CSS-Overrides für alle Seiten) erheblich. Besonders wertvoll bei der Fehlersuche in Svelte-5-spezifischer Syntax.
- **Grenzen:** Die KI hatte keine Kenntnis über das tatsächliche visuelle Erscheinungsbild; Light-Mode-Probleme (weisser Text auf weissem Hintergrund) wurden erst durch manuelles Testen im Browser sichtbar und benötigten mehrere Iterationen.
- **Qualitätssicherung:** Jede KI-generierte Änderung wurde durch `npx svelte-check` (0 Errors als Freigabekriterium) und manuelle Browser-Tests validiert. Kritische Teile wie Auth und Datenbankzugriff wurden durch Code-Review nachvollzogen.

---

## 7. Anhang

- **MongoDB Atlas:** Cluster `cluster0`, Datenbank `focus-fighters`, Collections: `trainers`, `trainings`, `sessions`
- **Usability-Testskript:** `UsabilityEvaluation.md` im Repository-Root
- **Icons:** lucide-svelte – MIT-Lizenz
- **Adapter:** `@sveltejs/adapter-netlify` – MIT-Lizenz
