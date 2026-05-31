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

	const stateConfig = $derived({
		prep:   { label: currentT.prep,   color: '#818cf8', glow: 'rgba(129,140,248,0.22)', duration: 10          },
		work:   { label: currentT.work,   color: '#2ecc71', glow: 'rgba(46,204,113,0.28)',  duration: workDuration },
		rest:   { label: currentT.rest,   color: '#f59e0b', glow: 'rgba(245,158,11,0.28)',  duration: restDuration },
		paused: { label: currentT.paused, color: '#e74c3c', glow: 'rgba(231,76,60,0.18)',   duration: 0            }
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

<div class="timer-screen" style="background: radial-gradient(ellipse 130% 90% at 50% 42%, {stateConfig[state].glow} 0%, #050810 65%)">

	<!-- Skip button (top-left, only during work/rest) -->
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
		<div class="paused-view">
			<span class="paused-label">{currentT.paused}</span>

			<div class="ring-wrap ring-sm">
				<svg viewBox="0 0 220 220" class="ring-svg">
					<circle cx="110" cy="110" r="96" class="ring-track"/>
					<circle cx="110" cy="110" r="96" class="ring-fill"
						style="stroke: rgba(255,255,255,0.15); stroke-dasharray: {(C * getProgressPercent()) / 100} {C}"/>
				</svg>
				<div class="time-num time-dim">{formatTime(timeLeft)}</div>
			</div>

			<div class="paused-sub">
				{currentT.round} {currentRound + 1} / {rounds}
				&nbsp;·&nbsp;
				{formatTime(timeLeft)} {currentT.remaining}
			</div>

			<button class="btn-resume" onclick={resumeWorkout}>{currentT.resume}</button>
		</div>

	<!-- ── PREP ── -->
	{:else if state === 'prep'}
		{@const c = stateConfig.prep.color}
		<div class="center-view">
			<div class="state-bg-label" style="color:{c}">{stateConfig.prep.label}</div>

			<div class="round-line">
				{currentT.round} <strong>{currentRound + 1}</strong> / {rounds}
			</div>

			<div class="ring-wrap">
				<svg viewBox="0 0 220 220" class="ring-svg">
					<circle cx="110" cy="110" r="96" class="ring-track"/>
					<circle cx="110" cy="110" r="96" class="ring-fill"
						style="stroke:{c}; filter:drop-shadow(0 0 14px {c}); stroke-dasharray:{(C * getProgressPercent()) / 100} {C}"/>
				</svg>
				<div class="time-num time-prep" style="text-shadow: 0 0 50px {c}60">{String(timeLeft).padStart(2, '0')}</div>
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

			<div class="state-bg-label" style="color:{c}">{stateConfig[state].label}</div>

			<div class="round-line">
				{currentT.round} <strong>{currentRound + 1}</strong> / {rounds}
			</div>

			<div class="ring-wrap">
				<svg viewBox="0 0 220 220" class="ring-svg">
					<circle cx="110" cy="110" r="96" class="ring-track"/>
					<circle cx="110" cy="110" r="96" class="ring-fill"
						style="stroke:{c}; filter:drop-shadow(0 0 16px {c}); stroke-dasharray:{(C * getProgressPercent()) / 100} {C}"/>
				</svg>
				<div class="time-num" style="text-shadow: 0 0 60px {c}70">{formatTime(timeLeft)}</div>
			</div>

			<div class="meta-block">
				<div class="workout-label">{workoutName}</div>
				{#if fighter1 && fighter2}
					<div class="matchup-label">
						{fighter1} <span style="color:{c}; font-style:normal">vs</span> {fighter2}
					</div>
				{:else if state === 'rest'}
					<div class="next-label">
						{currentRound + 1 < rounds
							? `${currentT.nextRound} ${currentRound + 2} / ${rounds}`
							: currentT.lastRest}
					</div>
				{/if}
			</div>

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
		transition: background 0.6s ease;
	}

	/* Big state label — clearly visible from across the room */
	.state-bg-label {
		font-size: 13px;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 6px;
		opacity: 0.7;
	}

	/* ── Corner controls ── */
	.btn-skip-corner {
		position: absolute;
		top: 20px;
		left: 20px;
		z-index: 100;
		background: rgba(255,255,255,0.07);
		color: rgba(255,255,255,0.5);
		border: 1px solid rgba(255,255,255,0.1);
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
	.btn-skip-corner:hover  { background: rgba(255,255,255,0.13); color: #fff; }
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
		background: rgba(255,255,255,0.07);
		border: 1px solid rgba(255,255,255,0.1);
		color: rgba(255,255,255,0.5);
		border-radius: 50%;
		font-size: 16px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}
	.btn-exit:hover { background: rgba(231,76,60,0.2); color: #e74c3c; border-color: rgba(231,76,60,0.3); }

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

	/* ── Layouts ── */
	.center-view {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 28px;
		padding: 100px 24px 60px;
		width: 100%;
		height: 100%;
	}

	.fullscreen-tap { cursor: pointer; user-select: none; }

	.paused-view {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 30px;
		padding: 20px;
		width: 100%;
		height: 100%;
	}

	/* ── Round line ── */
	.round-line {
		font-size: 14px;
		font-weight: 500;
		color: rgba(255,255,255,0.3);
		letter-spacing: 0.5px;
	}
	.round-line strong {
		color: rgba(255,255,255,0.8);
		font-size: 17px;
	}

	/* ── Ring ── */
	.ring-wrap {
		position: relative;
		width: 280px;
		height: 280px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ring-sm {
		width: 200px;
		height: 200px;
	}

	.ring-svg {
		position: absolute;
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.ring-track {
		fill: none;
		stroke: rgba(255,255,255,0.06);
		stroke-width: 7;
	}

	.ring-fill {
		fill: none;
		stroke-width: 7;
		stroke-linecap: round;
		transition: stroke-dasharray 0.25s linear;
	}

	/* ── Time display ── */
	.time-num {
		font-size: 74px;
		font-weight: 700;
		letter-spacing: -3px;
		color: #fff;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	.time-prep { font-size: 90px; }

	.time-dim {
		color: rgba(255,255,255,0.25);
		font-size: 56px;
		letter-spacing: -2px;
	}

	/* ── State pill ── */
	.state-pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 7px 18px;
		border-radius: 50px;
		border: 1px solid;
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 2.5px;
	}

	.pip {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* ── Workout meta ── */
	.meta-block {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		margin-top: -6px;
	}

	.workout-label {
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 3px;
		color: rgba(255,255,255,0.25);
	}

	.matchup-label {
		font-size: 18px;
		font-weight: 700;
		color: rgba(255,255,255,0.65);
		font-style: italic;
	}

	.next-label {
		font-size: 14px;
		color: rgba(255,255,255,0.35);
	}

	.tap-hint {
		font-size: 12px;
		color: rgba(255,255,255,0.18);
		letter-spacing: 0.5px;
		position: absolute;
		bottom: 36px;
		margin: 0;
	}

	/* ── Paused state ── */
	.paused-label {
		font-size: 12px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 4px;
		color: rgba(255,255,255,0.22);
	}

	.paused-sub {
		font-size: 14px;
		color: rgba(255,255,255,0.22);
		text-align: center;
	}

	/* ── Buttons ── */
	.btn-resume {
		background: #2ecc71;
		color: #000;
		border: none;
		padding: 18px 56px;
		font-size: 16px;
		font-weight: 800;
		border-radius: 16px;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		transition: all 0.2s;
	}
	.btn-resume:hover  { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(46,204,113,0.3); }
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
		.ring-wrap  { width: 340px; height: 340px; }
		.time-num   { font-size: 96px; }
		.time-prep  { font-size: 112px; }
	}

	@media (max-width: 480px) {
		.ring-wrap  { width: 240px; height: 240px; }
		.time-num   { font-size: 62px; letter-spacing: -2px; }
		.time-prep  { font-size: 76px; }
		.center-view { gap: 20px; }
	}
</style>
