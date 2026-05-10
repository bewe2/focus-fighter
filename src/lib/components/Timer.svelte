<script>
	import { goto } from '$app/navigation';
	/**
	 * Timer-Komponente für FocusFighter
	 * Screens: Prep → Work → Rest → Loop | Paused
	 */
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

	let currentRound = $state(0);
	let timeLeft = $state(10);
	let isRunning = $state(false);
	let isPaused = $state(false);
	let state = $state('prep'); // 'prep' | 'work' | 'rest' | 'paused'
	let prevState = $state('prep');
	let intervalId = $state(null);

	const stateConfig = {
		prep: {
			label: 'Vorbereitung',
			bgColor: '#0a0e27',
			duration: 10,
			textColor: '#ecf0f1'
		},
		work: {
			label: 'Arbeit',
			bgColor: '#2ecc71',
			duration: workDuration,
			textColor: '#050810'
		},
		rest: {
			label: 'Pause',
			bgColor: '#f39c12',
			duration: restDuration,
			textColor: '#050810'
		},
		paused: {
			label: 'Pausiert',
			bgColor: '#e74c3c',
			duration: 0,
			textColor: '#ffffff'
		}
	};

	function startTimer() {
		isRunning = true;
		isPaused = false;
		if (state === 'paused') {
			state = prevState;
		}
		intervalId = setInterval(() => {
			timeLeft -= 1;
			if (timeLeft <= 0) {
				handleStateTransition();
			}
		}, 1000);
	}

	function handleStateTransition() {
		if (state === 'prep') {
			state = 'work';
			timeLeft = workDuration;
		} else if (state === 'work') {
			state = 'rest';
			timeLeft = restDuration;
		} else if (state === 'rest') {
			currentRound += 1;
			if (currentRound >= rounds) {
				stopTimer();
				onComplete();
			} else {
				state = 'work';
				timeLeft = workDuration;
			}
		}
		onStateChange({ state, currentRound, timeLeft });
	}

	function pauseWorkout() {
		isRunning = false;
		isPaused = true;
		prevState = state;
		state = 'paused';
		if (intervalId) clearInterval(intervalId);
	}

	function resumeWorkout() {
		startTimer();
	}

	function stopTimer() {
		isRunning = false;
		isPaused = false;
		if (intervalId) clearInterval(intervalId);
	}

	function resetTimer() {
		stopTimer();
		currentRound = 0;
		timeLeft = 10;
		state = 'prep';
		isPaused = false;
	}

	function skipPrep() {
		state = 'work';
		timeLeft = workDuration;
		if (!isRunning) {
			startTimer();
		}
	}

	function exitWorkout() {
		stopTimer();
		goto('/workouts');
	}

	function handleFullScreenTap() {
		if (state === 'work' || state === 'rest') {
			pauseWorkout();
		}
	}

	$effect(() => {
		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	});

	function formatTime(seconds) {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}

	function getProgressPercent() {
		const duration = stateConfig[state].duration;
		if (duration === 0) return 0;
		return ((duration - timeLeft) / duration) * 100;
	}
</script>

<div
	class="timer-screen"
	style="--bg-color: {stateConfig[state].bgColor}; --text-color: {stateConfig[state].textColor}"
>
	<button class="btn-exit-global" onclick={exitWorkout} title="Abbrechen">✕</button>

	<!-- PREP SCREEN: Dark bg + circular progress -->
	{#if state === 'prep'}
		<div class="prep-container">
			<div class="round-badge">
				Runde <span>{currentRound + 1}</span> / {rounds}
			</div>

			<div class="state-title">Vorbereitung</div>

			<div class="circular-progress-wrapper">
				<svg class="circular-progress" viewBox="0 0 200 200">
					<circle cx="100" cy="100" r="90" class="progress-bg" />
					<circle
						cx="100"
						cy="100"
						r="90"
						class="progress-fill"
						style="stroke-dasharray: {(565 * getProgressPercent()) / 100} 565"
					/>
				</svg>
				<div class="time-in-circle">{String(timeLeft).padStart(2, '0')}</div>
			</div>

			{#if !isRunning}
				<button class="btn-large btn-green" onclick={startTimer}>Start</button>
			{:else}
				<button class="btn-large btn-skip" onclick={skipPrep}>Sofort starten</button>
			{/if}
		</div>
	{/if}

	<!-- WORK SCREEN: Green bg, full-screen tap area, tap anywhere text -->
	{#if state === 'work'}
		<div class="work-container" onclick={handleFullScreenTap}>
			

			<div class="workout-title-overlay">{workoutName}</div>
			{#if fighter1 && fighter2}
				<div class="fighter-matchup">{fighter1} vs {fighter2}</div>
			{/if}

			<div class="round-info-work">
				Runde {currentRound + 1} / {rounds}
			</div>

			<div class="circular-progress-wrapper-huge">
				<svg class="circular-progress" viewBox="0 0 200 200">
					<circle cx="100" cy="100" r="92" class="progress-bg-dark" />
					<circle
						cx="100"
						cy="100"
						r="92"
						class="progress-fill-dark"
						style="stroke-dasharray: {(578 * getProgressPercent()) / 100} 578"
					/>
				</svg>
				<div class="time-display-huge">{formatTime(timeLeft)}</div>
			</div>

			<div class="tap-hint">Tippe um zu pausieren</div>
		</div>
	{/if}

	<!-- REST SCREEN: Orange bg, shows next round -->
	{#if state === 'rest'}
		<div class="rest-container" onclick={handleFullScreenTap}>
			

			<div class="workout-title-overlay">{workoutName}</div>
			{#if fighter1 && fighter2}
				<div class="fighter-matchup">{fighter1} vs {fighter2}</div>
			{/if}

			<div class="round-info-rest">
				{#if currentRound + 1 < rounds}
					Nächste Runde {currentRound + 2} / {rounds}
				{:else}
					Letzte Pause!
				{/if}
			</div>

			<div class="circular-progress-wrapper-huge">
				<svg class="circular-progress" viewBox="0 0 200 200">
					<circle cx="100" cy="100" r="92" class="progress-bg-dark" />
					<circle
						cx="100"
						cy="100"
						r="92"
						class="progress-fill-dark"
						style="stroke-dasharray: {(578 * getProgressPercent()) / 100} 578"
					/>
				</svg>
				<div class="time-display-huge">{formatTime(timeLeft)}</div>
			</div>

			<div class="tap-hint">Tippe um zu pausieren</div>
		</div>
	{/if}

	<!-- PAUSED SCREEN: Red bg, resume button -->
	{#if state === 'paused'}
		<div class="paused-container">
			<div class="paused-title">Pausiert</div>

			<div class="paused-info">
				Runde {currentRound + 1} / {rounds}
				<br />
				{#if isPaused}
					{formatTime(timeLeft)} verbleibend
				{/if}
			</div>

			<button class="btn-resume" onclick={resumeWorkout}>Fortsetzen</button>
		</div>
	{/if}
</div>

<style>
	:root {
		--primary-green: #2ecc71;
		--rest-orange: #f39c12;
		--warning-red: #e74c3c;
		--bg-dark: #0a0e27;
		--text-light: #ecf0f1;
	}

	.timer-screen {
		width: 100%;
		height: 100vh;
		background-color: var(--bg-color);
		color: var(--text-color);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	/* ===== PREP SCREEN ===== */
	.prep-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 40px;
		padding: 40px 20px;
	}

	.round-badge {
		font-size: 18px;
		font-weight: 600;
		opacity: 0.9;
		letter-spacing: 1px;
	}

	.round-badge span {
		font-size: 24px;
		font-weight: 700;
		color: var(--primary-green);
	}

	.state-title {
		font-size: 32px;
		font-weight: 700;
		letter-spacing: 2px;
	}

	.circular-progress-wrapper,
	.circular-progress-wrapper-huge {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.circular-progress-wrapper {
		width: 240px;
		height: 240px;
	}

	.circular-progress-wrapper-huge {
		width: 380px;
		height: 380px;
	}

	.circular-progress {
		position: absolute;
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.progress-bg {
		fill: none;
		stroke: rgba(255, 255, 255, 0.2);
		stroke-width: 8;
	}

	.progress-fill {
		fill: none;
		stroke: var(--primary-green);
		stroke-width: 8;
		stroke-linecap: round;
		transition: stroke-dasharray 0.1s linear;
	}

	.progress-bg-dark {
		fill: none;
		stroke: rgba(0, 0, 0, 0.1);
		stroke-width: 10;
	}

	.progress-fill-dark {
		fill: none;
		stroke: rgba(0, 0, 0, 0.8);
		stroke-width: 10;
		stroke-linecap: round;
		transition: stroke-dasharray 0.1s linear;
	}

	.time-in-circle {
		font-size: 72px;
		font-weight: 700;
		font-family: 'Courier New', monospace;
		text-align: center;
	}

	/* ===== WORK SCREEN ===== */
	.work-container,
	.rest-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
		cursor: pointer;
		user-select: none;
		position: relative;
		gap: 30px;
	}

	.workout-title-overlay {
		font-size: 42px;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 2px;
		color: rgba(0, 0, 0, 0.9);
		line-height: 1;
		text-align: center;
	}

	.fighter-matchup {
		font-size: 24px;
		font-weight: 700;
		color: rgba(0, 0, 0, 0.6);
		font-style: italic;
		margin-top: -15px;
	}

	.round-info-work,
	.round-info-rest {
		font-size: 18px;
		font-weight: 700;
		letter-spacing: 1px;
		color: rgba(0, 0, 0, 0.7);
		margin-top: -10px;
	}

	@media (max-width: 600px) {
		.workout-title-overlay {
			font-size: 28px;
		}
	}

	.time-display-huge {
		font-size: 100px;
		font-weight: 700;
		font-family: 'Courier New', monospace;
		line-height: 1;
		letter-spacing: -2px;
	}

	@media (max-width: 600px) {
		.time-display-huge {
			font-size: 80px;
		}

		.circular-progress-wrapper-huge {
			width: 280px;
			height: 280px;
		}
	}

	.tap-hint {
		font-size: 16px;
		font-weight: 500;
		opacity: 0.85;
		letter-spacing: 0.5px;
	}

	/* ===== PAUSED SCREEN ===== */
	.paused-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
		gap: 50px;
		position: relative;
	}

	.paused-title {
		font-size: 48px;
		font-weight: 700;
		letter-spacing: 2px;
	}

	.paused-info {
		font-size: 20px;
		font-weight: 600;
		text-align: center;
		line-height: 1.6;
		opacity: 0.95;
	}

	.btn-resume {
		background: linear-gradient(135deg, var(--primary-green), #27ae60);
		color: var(--bg-dark);
		border: none;
		padding: 28px 48px;
		font-size: 20px;
		font-weight: 700;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		touch-action: manipulation;
	}

	.btn-resume:active {
		transform: scale(0.96);
		box-shadow: 0 10px 30px rgba(46, 204, 113, 0.5);
	}

	.btn-exit-global {
		position: absolute;
		top: 20px;
		right: 20px;
		width: 44px;
		height: 44px;
		background: rgba(0, 0, 0, 0.2);
		color: white;
		border: none;
		border-radius: 50%;
		font-size: 20px;
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		touch-action: manipulation;
		z-index: 1000;
	}

	.btn-exit-global:active {
		background: rgba(0, 0, 0, 0.4);
		transform: scale(0.9);
	}

	/* ===== LARGE BUTTONS ===== */
	.btn-large {
		padding: 24px 48px;
		font-size: 18px;
		font-weight: 700;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		text-transform: uppercase;
		letter-spacing: 1.2px;
		touch-action: manipulation;
		min-width: 200px;
	}

	.btn-green {
		background: var(--primary-green);
		color: var(--bg-dark);
	}

	.btn-skip {
		background: transparent;
		color: var(--text-light);
		border: 2px solid var(--primary-green);
	}

	.btn-green:active, .btn-skip:active {
		transform: scale(0.95);
		box-shadow: 0 0 20px rgba(46, 204, 113, 0.5);
	}

	@media (max-width: 600px) {
		.prep-container,
		.work-container,
		.rest-container,
		.paused-container {
			gap: 20px;
			padding: 20px;
		}

		.circular-progress-wrapper {
			width: 180px;
			height: 180px;
		}

		.time-in-circle {
			font-size: 56px;
		}

		.state-title,
		.paused-title {
			font-size: 28px;
		}

		.round-badge,
		.round-info-work,
		.round-info-rest {
			font-size: 16px;
		}

		.paused-info {
			font-size: 18px;
		}

		.btn-large {
			min-width: 160px;
			padding: 18px 36px;
			font-size: 16px;
		}

		.btn-resume {
			padding: 20px 36px;
			font-size: 18px;
		}

		.btn-exit {
			width: 45px;
			height: 45px;
			font-size: 24px;
		}
	}
</style>
