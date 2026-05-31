<script>
	import { settings } from '$lib/settingsStore';
	import { Sun, Moon, Languages, Target, Mic, MicOff, CheckCircle, RotateCcw } from 'lucide-svelte';
	import { enhance } from '$app/forms';

	const t = {
		de: {
			title: 'Einstellungen',
			subtitle: 'Personalisiere dein Trainingserlebnis',
			profile: 'Profil & Präferenzen',
			system: 'System',
			comingSoon: 'Demnächst verfügbar',
			theme: 'Erscheinungsbild',
			language: 'Sprache',
			dark: 'Dunkel',
			light: 'Hell',
			german: 'Deutsch',
			english: 'Englisch',
			weeklyGoal: 'Wochenziel (Einheiten)',
			voiceSection: 'Sprachsteuerung',
			voiceLabel: 'Sprachbefehle',
			voiceConfigured: 'Konfiguriert',
			voiceNotConfigured: 'Nicht eingerichtet',
			voiceSetup: 'Einrichten',
			voiceReset: 'Zurücksetzen',
			voiceNotSupported: 'Dein Browser unterstützt keine Spracherkennung (Chrome/Edge empfohlen)',
			wizardStopTitle: 'Stopp-Befehl',
			wizardStopHint: 'Sag jetzt laut dein Wort zum STOPPEN des Timers',
			wizardGoTitle: 'Weiter-Befehl',
			wizardGoHint: 'Sag jetzt laut dein Wort zum FORTSETZEN des Timers',
			wizardListening: 'Hört zu...',
			wizardHeard: 'Erkannt:',
			wizardConfirm: 'Bestätigen',
			wizardRetry: 'Nochmal',
			wizardDoneTitle: 'Sprachsteuerung aktiv',
			wizardStop: 'Stopp',
			wizardGo: 'Weiter',
			wizardPermission: 'Mikrofon-Zugriff wird angefragt...',
			wizardError: 'Fehler beim Mikrofon-Zugriff. Bitte Berechtigung prüfen.',
			logout: 'Abmelden'
		},
		en: {
			title: 'Settings',
			subtitle: 'Personalize your workout experience',
			profile: 'Profile & Preferences',
			system: 'System',
			comingSoon: 'Coming Soon',
			theme: 'Appearance',
			language: 'Language',
			dark: 'Dark',
			light: 'Light',
			german: 'German',
			english: 'English',
			weeklyGoal: 'Weekly Goal (Sessions)',
			voiceSection: 'Voice Control',
			voiceLabel: 'Voice Commands',
			voiceConfigured: 'Configured',
			voiceNotConfigured: 'Not set up',
			voiceSetup: 'Set up',
			voiceReset: 'Reset',
			voiceNotSupported: 'Your browser does not support speech recognition (Chrome/Edge recommended)',
			wizardStopTitle: 'Stop command',
			wizardStopHint: 'Say your word to STOP the timer now',
			wizardGoTitle: 'Resume command',
			wizardGoHint: 'Say your word to RESUME the timer now',
			wizardListening: 'Listening...',
			wizardHeard: 'Heard:',
			wizardConfirm: 'Confirm',
			wizardRetry: 'Try again',
			wizardDoneTitle: 'Voice control active',
			wizardStop: 'Stop',
			wizardGo: 'Resume',
			wizardPermission: 'Requesting microphone access...',
			wizardError: 'Microphone access error. Please check permissions.',
			logout: 'Logout'
		}
	};

	let currentT = $derived(t[$settings.language]);

	function toggleTheme() {
		settings.update(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
	}

	function setLanguage(lang) {
		settings.update(s => ({ ...s, language: lang }));
	}

	function changeWeeklyGoal(delta) {
		settings.update(s => ({
			...s,
			weeklyGoal: Math.min(7, Math.max(1, (s.weeklyGoal ?? 5) + delta))
		}));
	}

	// ── Voice Control Wizard ──
	let wizardStep = $state('idle'); // idle | permission | listen-stop | heard-stop | listen-go | heard-go | done | error | unsupported
	let heardWord = $state('');
	let pendingStop = $state('');
	let recognition = $state(null);

	const speechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

	function startVoiceSetup() {
		if (!speechSupported) { wizardStep = 'unsupported'; return; }
		wizardStep = 'permission';
		navigator.mediaDevices.getUserMedia({ audio: true })
			.then(() => { wizardStep = 'listen-stop'; listenOnce(onHeardStop); })
			.catch(() => { wizardStep = 'error'; });
	}

	function listenOnce(onResult) {
		if (recognition) { try { recognition.abort(); } catch {} }
		const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
		recognition = new SR();
		recognition.lang = $settings.language === 'de' ? 'de-DE' : 'en-US';
		recognition.continuous = false;
		recognition.interimResults = false;
		recognition.onresult = (e) => {
			const word = e.results[0][0].transcript.trim().toLowerCase().split(' ')[0];
			heardWord = word;
			onResult(word);
		};
		recognition.onerror = () => { wizardStep = 'error'; };
		recognition.start();
	}

	function onHeardStop(word) {
		pendingStop = word;
		wizardStep = 'heard-stop';
	}

	function confirmStop() {
		wizardStep = 'listen-go';
		listenOnce(onHeardGo);
	}

	function retryStop() {
		wizardStep = 'listen-stop';
		listenOnce(onHeardStop);
	}

	function onHeardGo(word) {
		heardWord = word;
		wizardStep = 'heard-go';
	}

	function confirmGo() {
		settings.update(s => ({ ...s, voiceControl: true, voiceStopCommand: pendingStop, voiceGoCommand: heardWord }));
		wizardStep = 'done';
	}

	function retryGo() {
		wizardStep = 'listen-go';
		listenOnce(onHeardGo);
	}

	function resetVoice() {
		if (recognition) { try { recognition.abort(); } catch {} }
		settings.update(s => ({ ...s, voiceControl: false, voiceStopCommand: '', voiceGoCommand: '' }));
		wizardStep = 'idle';
		heardWord = '';
		pendingStop = '';
	}
</script>

<div class="settings-page">
	<header class="header">
		<h1>{currentT.title}</h1>
		<p class="subtitle">{currentT.subtitle}</p>
	</header>

	<main class="content-area">
		<section class="settings-section">
			<h2>{currentT.system}</h2>
			<div class="settings-card">
				<div class="setting-item">
					<div class="setting-info">
						<div class="icon-wrapper">
							{#if $settings.theme === 'dark'}
								<Moon size={20} />
							{:else}
								<Sun size={20} />
							{/if}
						</div>
						<span>{currentT.theme}</span>
					</div>
					<button class="toggle-btn" onclick={toggleTheme}>
						<div class="toggle-slider" class:active={$settings.theme === 'light'}></div>
						<span class="toggle-label">{$settings.theme === 'dark' ? currentT.dark : currentT.light}</span>
					</button>
				</div>

				<div class="setting-item">
					<div class="setting-info">
						<div class="icon-wrapper">
							<Languages size={20} />
						</div>
						<span>{currentT.language}</span>
					</div>
					<div class="select-group">
						<button
							class="select-btn"
							class:active={$settings.language === 'de'}
							onclick={() => setLanguage('de')}
						>
							DE
						</button>
						<button
							class="select-btn"
							class:active={$settings.language === 'en'}
							onclick={() => setLanguage('en')}
						>
							EN
						</button>
					</div>
				</div>

				<div class="setting-item">
					<div class="setting-info">
						<div class="icon-wrapper">
							<Target size={20} />
						</div>
						<span>{currentT.weeklyGoal}</span>
					</div>
					<div class="stepper">
						<button
							class="stepper-btn"
							onclick={() => changeWeeklyGoal(-1)}
							disabled={$settings.weeklyGoal <= 1}
						>−</button>
						<span class="stepper-value">{$settings.weeklyGoal ?? 5}</span>
						<button
							class="stepper-btn"
							onclick={() => changeWeeklyGoal(1)}
							disabled={$settings.weeklyGoal >= 7}
						>+</button>
					</div>
				</div>
			</div>
		</section>

		<section class="settings-section">
			<h2>{currentT.voiceSection}</h2>
			<div class="settings-card">
				<div class="setting-item" style="flex-wrap: wrap; gap: 16px;">
					<div class="setting-info">
						<div class="icon-wrapper">
							{#if $settings.voiceControl}
								<Mic size={20} />
							{:else}
								<MicOff size={20} />
							{/if}
						</div>
						<div>
							<span>{currentT.voiceLabel}</span>
							{#if $settings.voiceControl && $settings.voiceStopCommand}
								<div class="voice-tags">
									<span class="voice-tag">{currentT.wizardStop}: <strong>"{$settings.voiceStopCommand}"</strong></span>
									<span class="voice-tag">{currentT.wizardGo}: <strong>"{$settings.voiceGoCommand}"</strong></span>
								</div>
							{/if}
						</div>
					</div>
					<div class="voice-actions">
						{#if $settings.voiceControl}
							<button class="voice-btn voice-btn-danger" onclick={resetVoice}>
								<RotateCcw size={14} /> {currentT.voiceReset}
							</button>
						{:else}
							<button class="voice-btn voice-btn-primary" onclick={startVoiceSetup}>
								<Mic size={14} /> {currentT.voiceSetup}
							</button>
						{/if}
					</div>
				</div>

				{#if wizardStep !== 'idle' && wizardStep !== 'done'}
					<div class="wizard-panel">
						{#if wizardStep === 'unsupported'}
							<p class="wizard-error">{currentT.voiceNotSupported}</p>

						{:else if wizardStep === 'error'}
							<p class="wizard-error">{currentT.wizardError}</p>
							<button class="voice-btn voice-btn-primary" onclick={startVoiceSetup}>
								{currentT.wizardRetry}
							</button>

						{:else if wizardStep === 'permission'}
							<div class="wizard-step">
								<div class="mic-pulse"></div>
								<p>{currentT.wizardPermission}</p>
							</div>

						{:else if wizardStep === 'listen-stop'}
							<div class="wizard-step">
								<div class="step-label">1 / 2 — {currentT.wizardStopTitle}</div>
								<div class="mic-pulse"></div>
								<p class="wizard-hint">{currentT.wizardStopHint}</p>
								<p class="listening-label">{currentT.wizardListening}</p>
							</div>

						{:else if wizardStep === 'heard-stop'}
							<div class="wizard-step">
								<div class="step-label">1 / 2 — {currentT.wizardStopTitle}</div>
								<p class="wizard-hint">{currentT.wizardHeard} <strong class="heard-word">"{pendingStop}"</strong></p>
								<div class="wizard-btns">
									<button class="voice-btn voice-btn-primary" onclick={confirmStop}>
										<CheckCircle size={14} /> {currentT.wizardConfirm}
									</button>
									<button class="voice-btn voice-btn-ghost" onclick={retryStop}>
										<RotateCcw size={14} /> {currentT.wizardRetry}
									</button>
								</div>
							</div>

						{:else if wizardStep === 'listen-go'}
							<div class="wizard-step">
								<div class="step-label">2 / 2 — {currentT.wizardGoTitle}</div>
								<div class="mic-pulse"></div>
								<p class="wizard-hint">{currentT.wizardGoHint}</p>
								<p class="listening-label">{currentT.wizardListening}</p>
							</div>

						{:else if wizardStep === 'heard-go'}
							<div class="wizard-step">
								<div class="step-label">2 / 2 — {currentT.wizardGoTitle}</div>
								<p class="wizard-hint">{currentT.wizardHeard} <strong class="heard-word">"{heardWord}"</strong></p>
								<div class="wizard-btns">
									<button class="voice-btn voice-btn-primary" onclick={confirmGo}>
										<CheckCircle size={14} /> {currentT.wizardConfirm}
									</button>
									<button class="voice-btn voice-btn-ghost" onclick={retryGo}>
										<RotateCcw size={14} /> {currentT.wizardRetry}
									</button>
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</section>

		<form method="POST" action="?/logout" use:enhance class="logout-section">
			<button type="submit" class="logout-btn">
				{currentT.logout}
			</button>
		</form>
	</main>
</div>

<style>
	.settings-page {
		min-height: 100vh;
		background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-darker) 100%);
		padding: 20px;
		display: flex;
		flex-direction: column;
	}

	.header {
		text-align: center;
		padding: 60px 20px 40px;
	}

	.header h1 {
		font-size: 56px;
		font-weight: 900;
		color: var(--primary-green);
		letter-spacing: -2px;
		text-transform: uppercase;
	}

	.subtitle {
		color: var(--text-muted);
		font-size: 18px;
		font-weight: 300;
	}

	.content-area {
		max-width: 800px;
		margin: 0 auto;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 40px;
		flex: 1;
	}

	h2 {
		font-size: 20px;
		font-weight: 700;
		margin-bottom: 20px;
		color: var(--text-light);
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.settings-card {
		background: var(--card-bg);
		border: 1px solid var(--nav-border);
		border-radius: 24px;
		padding: 8px;
		display: flex;
		flex-direction: column;
	}

	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		border-bottom: 1px solid var(--nav-border);
	}

	.setting-item:last-child {
		border-bottom: none;
	}

	.setting-info {
		display: flex;
		align-items: center;
		gap: 16px;
		font-weight: 600;
		color: var(--text-light);
	}

	.icon-wrapper {
		width: 40px;
		height: 40px;
		background: rgba(46, 204, 113, 0.1);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--primary-green);
	}

	/* Toggle Switch */
	.toggle-btn {
		background: var(--bg-darker);
		border: 1px solid var(--nav-border);
		padding: 6px 16px;
		border-radius: 30px;
		display: flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.toggle-slider {
		width: 20px;
		height: 20px;
		background: var(--primary-green);
		border-radius: 50%;
		transition: transform 0.3s ease;
	}

	.toggle-slider.active {
		transform: translateX(0); /* Simplified for this style */
	}

	.toggle-label {
		font-size: 14px;
		font-weight: 700;
		color: var(--text-muted);
	}

	/* Select Group */
	.select-group {
		display: flex;
		background: var(--bg-darker);
		padding: 4px;
		border-radius: 14px;
		border: 1px solid var(--nav-border);
	}

	.select-btn {
		padding: 8px 16px;
		border: none;
		background: transparent;
		color: var(--text-muted);
		font-weight: 700;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.select-btn.active {
		background: var(--primary-green);
		color: #000;
	}

	/* Stepper */
	.stepper {
		display: flex;
		align-items: center;
		gap: 4px;
		background: var(--bg-darker);
		border: 1px solid var(--nav-border);
		border-radius: 14px;
		padding: 4px;
	}

	.stepper-btn {
		width: 36px;
		height: 36px;
		border: none;
		background: transparent;
		color: var(--text-light);
		font-size: 20px;
		font-weight: 700;
		border-radius: 10px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s ease;
		line-height: 1;
	}

	.stepper-btn:hover:not(:disabled) {
		background: rgba(46, 204, 113, 0.15);
		color: #2ecc71;
	}

	.stepper-btn:disabled {
		opacity: 0.25;
		cursor: not-allowed;
	}

	.stepper-value {
		min-width: 32px;
		text-align: center;
		font-size: 18px;
		font-weight: 800;
		color: #2ecc71;
	}

	.placeholder-content {
		padding: 40px;
		text-align: center;
	}

	.coming-soon {
		color: var(--text-muted);
		font-weight: 600;
		text-transform: uppercase;
		font-size: 12px;
		letter-spacing: 2px;
	}

	.logout-section {
		margin-top: 20px;
		display: flex;
		justify-content: center;
	}

	.logout-btn {
		background: rgba(231, 76, 60, 0.1);
		color: #e74c3c;
		border: 1px solid rgba(231, 76, 60, 0.2);
		padding: 14px 40px;
		border-radius: 16px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		max-width: 400px;
	}

	.logout-btn:hover {
		background: #e74c3c;
		color: #fff;
	}

	/* ── Voice Control ── */
	.voice-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 6px;
	}

	.voice-tag {
		font-size: 12px;
		font-weight: 500;
		color: var(--text-muted);
		background: rgba(46, 204, 113, 0.1);
		border: 1px solid rgba(46, 204, 113, 0.2);
		border-radius: 20px;
		padding: 2px 10px;
	}

	.voice-actions {
		display: flex;
		gap: 8px;
		flex-shrink: 0;
	}

	.voice-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		border-radius: 10px;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		border: none;
		transition: all 0.2s ease;
	}

	.voice-btn-primary {
		background: #2ecc71;
		color: #000;
	}

	.voice-btn-primary:hover { filter: brightness(1.1); }

	.voice-btn-danger {
		background: rgba(231, 76, 60, 0.12);
		color: #e74c3c;
		border: 1px solid rgba(231, 76, 60, 0.2);
	}

	.voice-btn-danger:hover { background: rgba(231, 76, 60, 0.2); }

	.voice-btn-ghost {
		background: var(--bg-darker);
		color: var(--text-muted);
		border: 1px solid var(--nav-border);
	}

	.voice-btn-ghost:hover { color: var(--text-light); }

	/* Wizard panel */
	.wizard-panel {
		margin: 0 16px 16px;
		background: var(--bg-darker);
		border: 1px solid var(--nav-border);
		border-radius: 16px;
		padding: 24px;
	}

	.wizard-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		text-align: center;
	}

	.step-label {
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		color: #2ecc71;
	}

	.wizard-hint {
		font-size: 15px;
		color: var(--text-light);
		font-weight: 500;
	}

	.heard-word {
		color: #2ecc71;
		font-size: 18px;
	}

	.listening-label {
		font-size: 13px;
		color: var(--text-muted);
		font-style: italic;
	}

	.wizard-btns {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.wizard-error {
		color: #e74c3c;
		font-size: 14px;
		text-align: center;
		margin-bottom: 12px;
	}

	/* Pulsierender Mic-Kreis */
	.mic-pulse {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: rgba(46, 204, 113, 0.15);
		border: 2px solid #2ecc71;
		position: relative;
		animation: pulse 1.4s ease-in-out infinite;
	}

	.mic-pulse::after {
		content: '🎙';
		font-size: 22px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	@keyframes pulse {
		0%, 100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); }
		50% { box-shadow: 0 0 0 12px rgba(46, 204, 113, 0); }
	}

	@media (max-width: 600px) {
		.header h1 { font-size: 42px; }
		.setting-item { padding: 16px; }
	}
</style>
