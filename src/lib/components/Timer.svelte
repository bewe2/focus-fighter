<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Mic } from 'lucide-svelte';
	import { settings } from '$lib/settingsStore';

	let {
		rounds = 3,
		workDuration = 180,
		restDuration = 60,
		workoutName = 'Training',
		fighter1 = '',
		fighter2 = '',
		onComplete = () => {},
		onStateChange = () => {}
	} = $props();

	const t = {
		de: {
			prep: 'Vorbereitung',
			work: 'Arbeit',
			rest: 'Pause',
			paused: 'Pausiert',
			round: 'Runde',
			start: 'Start',
			skip: 'Sofort starten',
			skipRound: 'Runde skippen',
			skipRest: 'Pause skippen',
			resume: 'Fortsetzen',
			tapToPause: 'Tippe um zu pausieren',
			remaining: 'verbleibend',
			lastRest: 'Letzte Pause!',
			nextRound: 'Nächste Runde',
			cancel: 'Abbrechen'
		},
		en: {
			prep: 'Preparation',
			work: 'Work',
			rest: 'Rest',
			paused: 'Paused',
			round: 'Round',
			start: 'Start',
			skip: 'Start now',
			skipRound: 'Skip Round',
			skipRest: 'Skip Rest',
			resume: 'Resume',
			tapToPause: 'Tap to pause',
			remaining: 'remaining',
			lastRest: 'Last Rest!',
			nextRound: 'Next Round',
			cancel: 'Cancel'
		}
	};

	let currentT = $derived(t[$settings.language]);

	let currentRound = $state(0);
	let timeLeft    = $state(10);
	let isRunning   = $state(false);
	let isPaused    = $state(false);
	let state       = $state('prep');
	let prevState   = $state('prep');
	let intervalId  = $state(null);

	const dark = $derived($settings.theme !== 'light');

	const stateConfig = $derived({
		prep: {
			label: currentT.prep,   color: '#2ecc71', duration: 10,
			bg:   dark ? 'linear-gradient(160deg, #0c1f30 0%, #0a0e27 65%)' : 'linear-gradient(160deg, #d8f5e8 0%, #f0ede8 70%)',
			text: dark ? '#ecf0f1' : '#1c1c2e',
		},
		work: {
			label: currentT.work,   color: '#2ecc71', duration: workDuration,
			bg:   dark ? 'linear-gradient(160deg, #0b4a28 0%, #061a0e 100%)' : 'linear-gradient(160deg, #a8f0cc 0%, #d5f5e4 100%)',
			text: dark ? '#ecf0f1' : '#0d2e1a',
		},
		rest: {
			label: currentT.rest,   color: '#f59e0b', duration: restDuration,
			bg:   dark ? 'linear-gradient(160deg, #4a3208 0%, #1c1204 100%)' : 'linear-gradient(160deg, #fde8a8 0%, #faf3d8 100%)',
			text: dark ? '#ecf0f1' : '#2e1e04',
		},
		paused: {
			label: currentT.paused, color: '#e74c3c', duration: 0,
			bg:   dark ? 'linear-gradient(160deg, #4a1010 0%, #1c0606 100%)' : 'linear-gradient(160deg, #fcc8c8 0%, #f9e8e8 100%)',
			text: dark ? '#ecf0f1' : '#2e0a0a',
		}
	});

	// ── Timer logic ──────────────────────────────────────────────────
	function startTimer() {
		isRunning = true;
		isPaused  = false;
		if (state === 'paused') state = prevState;
		intervalId = setInterval(() => {
			timeLeft -= 1;
			if (timeLeft <= 0) handleStateTransition();
		}, 1000);
	}

	function handleStateTransition() {
		if (state === 'prep') {
			state = 'work'; timeLeft = workDuration;
		} else if (state === 'work') {
			state = 'rest'; timeLeft = restDuration;
		} else if (state === 'rest') {
			currentRound += 1;
			if (currentRound >= rounds) { stopTimer(); onComplete(); }
			else { state = 'work'; timeLeft = workDuration; }
		}
		onStateChange({ state, currentRound, timeLeft });
	}

	function pauseWorkout() {
		isRunning = false; isPaused = true;
		prevState = state; state = 'paused';
		if (intervalId) clearInterval(intervalId);
	}

	function resumeWorkout() { startTimer(); }

	function stopTimer() {
		isRunning = false; isPaused = false;
		if (intervalId) clearInterval(intervalId);
	}

	function skipPrep() {
		state = 'work'; timeLeft = workDuration;
		if (!isRunning) startTimer();
	}

	function skipRound() {
		if (intervalId) clearInterval(intervalId);
		state = 'rest'; timeLeft = restDuration;
		intervalId = setInterval(() => { timeLeft -= 1; if (timeLeft <= 0) handleStateTransition(); }, 1000);
		onStateChange({ state, currentRound, timeLeft });
	}

	function skipRest() {
		if (intervalId) clearInterval(intervalId);
		currentRound += 1;
		if (currentRound >= rounds) { stopTimer(); onComplete(); }
		else {
			state = 'work'; timeLeft = workDuration;
			intervalId = setInterval(() => { timeLeft -= 1; if (timeLeft <= 0) handleStateTransition(); }, 1000);
			onStateChange({ state, currentRound, timeLeft });
		}
	}

	function exitWorkout() { stopTimer(); goto('/workouts'); }

	function handleFullScreenTap() {
		if (state === 'work' || state === 'rest') pauseWorkout();
	}

	// ── Voice Control ─────────────────────────────────────────────────
	let voiceRecognition = $state(null);
	let voiceListening   = $state(false);

	function initVoiceControl() {
		if (!$settings.voiceControl || !$settings.voiceStopCommand) return;
		const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SR) return;
		const r = new SR();
		r.lang = $settings.language === 'de' ? 'de-DE' : 'en-US';
		r.continuous = true; r.interimResults = false;
		r.onstart  = () => { voiceListening = true; };
		r.onend    = () => {
			voiceListening = false;
			if (voiceRecognition === r && (state === 'work' || state === 'rest' || state === 'paused'))
				try { r.start(); } catch {}
		};
		r.onresult = (e) => {
			const transcript = e.results[e.results.length - 1][0].transcript.toLowerCase().trim();
			const stopCmd = ($settings.voiceStopCommand || '').toLowerCase();
			const goCmd   = ($settings.voiceGoCommand   || '').toLowerCase();
			if (stopCmd && transcript.includes(stopCmd) && (state === 'work' || state === 'rest')) pauseWorkout();
			else if (goCmd && transcript.includes(goCmd) && state === 'paused') resumeWorkout();
		};
		r.onerror = () => { voiceListening = false; };
		voiceRecognition = r;
		try { r.start(); } catch {}
	}

	function destroyVoiceControl() {
		if (voiceRecognition) { const r = voiceRecognition; voiceRecognition = null; try { r.abort(); } catch {} }
		voiceListening = false;
	}

	onMount(() => {
		startTimer();
		initVoiceControl();
	});

	$effect(() => {
		return () => {
			if (intervalId) clearInterval(intervalId);
			destroyVoiceControl();
		};
	});

	// ── Helpers ───────────────────────────────────────────────────────
	function formatTime(seconds) {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}

	function getProgressPercent() {
		const d = stateConfig[state].duration;
		return d === 0 ? 0 : ((d - timeLeft) / d) * 100;
	}

	// circumference for r=96 → 2π×96 ≈ 603
	const C = 603;
</script>

<div class="timer-screen" style="background:{stateConfig[state].bg}; color:{stateConfig[state].text}">

	<!-- Skip (top-left, work/rest only) -->
	{#if state === 'work'}
		<button class="btn-skip-corner" onclick={(e) => { e.stopPropagation(); skipRound(); }}>
			⏭ {currentT.skipRound}
		</button>
	{:else if state === 'rest'}
		<button class="btn-skip-corner" onclick={(e) => { e.stopPropagation(); skipRest(); }}>
			⏭ {currentT.skipRest}
		</button>
	{/if}

	<!-- Top-right controls -->
	<div class="top-right">
		{#if voiceListening}
			<div class="mic-dot" title="Sprachsteuerung aktiv"><Mic size={13} /></div>
		{/if}
		<button class="btn-exit" onclick={exitWorkout} title={currentT.cancel}>✕</button>
	</div>

	<!-- ── PAUSED ── -->
	{#if state === 'paused'}
		<div class="center-view">
			<div class="round-badge">
				{currentT.round} {currentRound + 1} / {rounds}
			</div>

			<div class="ring-wrap">
				<svg viewBox="0 0 220 220" class="ring-svg">
					<circle cx="110" cy="110" r="96" class="ring-track"/>
					<circle cx="110" cy="110" r="96" class="ring-fill"
						style="stroke: rgba(231,76,60,0.35); stroke-dasharray: {(C * getProgressPercent()) / 100} {C}"/>
				</svg>
				<div class="time-num time-paused">{formatTime(timeLeft)}</div>
			</div>

			<div class="state-badge paused-badge">
				<span class="pip" style="background:#e74c3c"></span>
				{currentT.paused}
			</div>

			<p class="sub-info">{formatTime(timeLeft)} {currentT.remaining}</p>

			<button class="btn-resume" onclick={resumeWorkout}>{currentT.resume}</button>
		</div>

	<!-- ── PREP ── -->
	{:else if state === 'prep'}
		<div class="center-view">
			<div class="workout-name-top">{workoutName}</div>

			<div class="round-badge">
				{currentT.round} {currentRound + 1} / {rounds}
			</div>

			<div class="ring-wrap">
				<svg viewBox="0 0 220 220" class="ring-svg">
					<circle cx="110" cy="110" r="96" class="ring-track"/>
					<circle cx="110" cy="110" r="96" class="ring-fill"
						style="stroke: #2ecc71; stroke-dasharray: {(C * getProgressPercent()) / 100} {C}"/>
				</svg>
				<div class="time-num time-prep">{String(timeLeft).padStart(2, '0')}</div>
			</div>

			<div class="state-badge" style="color:#2ecc71; border-color:rgba(46,204,113,0.3); background:rgba(46,204,113,0.1)">
				<span class="pip" style="background:#2ecc71"></span>
				{stateConfig.prep.label}
			</div>

			{#if !isRunning}
				<button class="btn-action" onclick={startTimer}>{currentT.start}</button>
			{:else}
				<button class="btn-action btn-ghost" onclick={skipPrep}>{currentT.skip}</button>
			{/if}
		</div>

	<!-- ── WORK / REST ── -->
	{:else}
		{@const c = stateConfig[state].color}
		<div class="center-view fullscreen-tap" onclick={handleFullScreenTap}>

			<div class="workout-name-top">{workoutName}</div>

			<div class="round-badge">
				{currentT.round} {currentRound + 1} / {rounds}
			</div>

			<div class="ring-wrap">
				<svg viewBox="0 0 220 220" class="ring-svg">
					<circle cx="110" cy="110" r="96" class="ring-track"/>
					<circle cx="110" cy="110" r="96" class="ring-fill"
						style="stroke:{c}; stroke-dasharray:{(C * getProgressPercent()) / 100} {C}"/>
				</svg>
				<div class="time-num">{formatTime(timeLeft)}</div>
			</div>

			<div class="state-badge" style="color:{c}; border-color:{c}50; background:{c}18">
				<span class="pip" style="background:{c}"></span>
				{stateConfig[state].label}
			</div>

			{#if fighter1 && fighter2}
				<div class="matchup-info">
					{fighter1} <span class="vs" style="color:{c}">vs</span> {fighter2}
				</div>
			{:else if state === 'rest'}
				<div class="sub-info">
					{currentRound + 1 < rounds
						? `${currentT.nextRound} ${currentRound + 2} / ${rounds}`
						: currentT.lastRest}
				</div>
			{/if}

			<p class="tap-hint">{currentT.tapToPause}</p>
		</div>
	{/if}
</div>

<style>
	/* ── Base ── */
	.timer-screen {
		width: 100%;
		height: 100vh;
		color: #ecf0f1;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		transition: background 0.5s ease;
	}

	/* ── Corner controls ── */
	.btn-skip-corner {
		position: absolute;
		top: 20px;
		left: 20px;
		z-index: 100;
		background: rgba(128,128,128,0.15);
		color: inherit;
		opacity: 0.7;
		border: 1px solid rgba(128,128,128,0.2);
		border-radius: 20px;
		padding: 8px 14px;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.4px;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 5px;
	}
	.btn-skip-corner:hover  { background: rgba(128,128,128,0.25); opacity: 1; }
	.btn-skip-corner:active { transform: scale(0.95); }

	.top-right {
		position: absolute;
		top: 20px;
		right: 20px;
		z-index: 100;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.btn-exit {
		width: 40px;
		height: 40px;
		background: rgba(128,128,128,0.15);
		border: 1px solid rgba(128,128,128,0.2);
		color: inherit;
		opacity: 0.7;
		border-radius: 50%;
		font-size: 16px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}
	.btn-exit:hover { background: rgba(231,76,60,0.2); color: #e74c3c; border-color: rgba(231,76,60,0.3); opacity: 1; }

	.mic-dot {
		width: 32px;
		height: 32px;
		background: rgba(46,204,113,0.12);
		border: 1px solid rgba(46,204,113,0.3);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #2ecc71;
		animation: mic-blink 2s ease-in-out infinite;
	}
	@keyframes mic-blink { 0%,100%{opacity:1}50%{opacity:0.35} }

	/* ── Layout ── */
	.center-view {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 24px;
		padding: 100px 24px 60px;
		width: 100%;
		height: 100%;
	}

	.fullscreen-tap { cursor: pointer; user-select: none; }

	/* ── Workout name (top) ── */
	.workout-name-top {
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 4px;
		color: rgba(255,255,255,0.35);
	}

	/* ── Round badge ── */
	.round-badge {
		background: rgba(128,128,128,0.12);
		border: 1px solid rgba(128,128,128,0.18);
		border-radius: 50px;
		padding: 6px 18px;
		font-size: 14px;
		font-weight: 700;
		color: inherit;
		opacity: 0.7;
		letter-spacing: 0.5px;
	}

	/* ── Ring ── */
	.ring-wrap {
		position: relative;
		width: 300px;
		height: 300px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ring-svg {
		position: absolute;
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.ring-track {
		fill: none;
		stroke: rgba(128,128,128,0.18);
		stroke-width: 8;
	}

	.ring-fill {
		fill: none;
		stroke-width: 8;
		stroke-linecap: round;
		transition: stroke-dasharray 0.25s linear;
	}

	/* ── Time display ── */
	.time-num {
		font-size: 80px;
		font-weight: 800;
		color: #fff;
		line-height: 1;
		font-variant-numeric: tabular-nums;
		letter-spacing: -1px;
	}

	.time-prep {
		font-size: 96px;
		font-weight: 900;
	}

	.time-paused {
		opacity: 0.35;
		font-size: 72px;
	}

	/* ── State badge ── */
	.state-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 20px;
		border-radius: 12px;
		border: 1px solid;
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 2px;
	}

	.paused-badge {
		color: rgba(255,255,255,0.4);
		border-color: rgba(255,255,255,0.1);
		background: rgba(255,255,255,0.05);
	}

	.pip {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* ── Meta info ── */
	.matchup-info {
		font-size: 20px;
		font-weight: 700;
		color: rgba(255,255,255,0.75);
		font-style: italic;
	}

	.vs { font-style: normal; font-weight: 900; }

	.sub-info {
		font-size: 14px;
		color: inherit;
		opacity: 0.5;
		margin: 0;
	}

	.tap-hint {
		font-size: 12px;
		color: inherit;
		opacity: 0.25;
		letter-spacing: 0.5px;
		position: absolute;
		bottom: 36px;
		margin: 0;
	}

	/* ── Buttons ── */
	.btn-resume {
		background: #2ecc71;
		color: #000;
		border: none;
		padding: 18px 56px;
		font-size: 16px;
		font-weight: 800;
		border-radius: 14px;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		transition: all 0.2s;
	}
	.btn-resume:hover  { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(46,204,113,0.3); }
	.btn-resume:active { transform: scale(0.97); }

	.btn-action {
		background: #2ecc71;
		color: #000;
		border: none;
		padding: 16px 48px;
		font-size: 15px;
		font-weight: 800;
		border-radius: 14px;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1.2px;
		transition: all 0.2s;
	}
	.btn-action:hover  { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(46,204,113,0.25); }
	.btn-action:active { transform: scale(0.97); }

	.btn-ghost {
		background: rgba(255,255,255,0.05);
		color: rgba(255,255,255,0.55);
		border: 1px solid rgba(255,255,255,0.12);
	}
	.btn-ghost:hover { background: rgba(255,255,255,0.09); color: #fff; box-shadow: none; }

	/* ── Responsive ── */
	@media (min-width: 769px) {
		.ring-wrap { width: 360px; height: 360px; }
		.time-num  { font-size: 100px; }
		.time-prep { font-size: 116px; }
	}

	@media (max-width: 480px) {
		.ring-wrap { width: 260px; height: 260px; }
		.time-num  { font-size: 68px; }
		.time-prep { font-size: 84px; }
		.center-view { gap: 18px; }
	}
</style>
