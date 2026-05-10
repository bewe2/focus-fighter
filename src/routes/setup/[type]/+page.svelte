<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ArrowLeft } from 'lucide-svelte';

	const workoutTypes = {
		sparring: { name: 'Sparring', defaultRounds: 10, defaultWork: 180, defaultRest: 60 },
		shadowboxing: { name: 'Schattenboxen', defaultRounds: 3, defaultWork: 120, defaultRest: 30 },
		hiit: { name: 'HIIT', defaultRounds: 8, defaultWork: 45, defaultRest: 15 },
		bag: { name: 'Sandsack', defaultRounds: 6, defaultWork: 180, defaultRest: 60 }
	};

	let workoutType = $page.params.type;
	let config = workoutTypes[workoutType] || workoutTypes.bag;

	let rounds = $state(config.defaultRounds);
	let workDuration = $state(config.defaultWork);
	let restDuration = $state(config.defaultRest);

	// Fighter names for sparring
	let fighter1 = $state('');
	let fighter2 = $state('');

	function formatTime(seconds) {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function startWorkout() {
		const workoutData = {
			type: workoutType,
			rounds,
			workDuration,
			restDuration,
			fighter1,
			fighter2,
			timestamp: new Date().toISOString()
		};
		sessionStorage.setItem('workoutConfig', JSON.stringify(workoutData));
		goto('/workout');
	}

	function goBack() {
		goto('/workouts');
	}
</script>

<div class="setup-container">
	<button class="btn-nav btn-back" onclick={goBack} title="Zurück">
		<ArrowLeft size={24} />
	</button>
	<button class="btn-nav btn-exit" onclick={() => goto('/')} title="Abbrechen">✕</button>

	<div class="setup-content">
		<header class="setup-header">
			<h1>{config.name}</h1>
			<p>Konfiguriere deine Einheit</p>
		</header>

		<form class="setup-form" onsubmit={(e) => {
			e.preventDefault();
			startWorkout();
		}}>
			{#if workoutType === 'sparring'}
				<div class="config-block fighter-inputs">
					<label>Kämpfer Matchup</label>
					<div class="fighter-grid">
						<input
							type="text"
							bind:value={fighter1}
							placeholder="Kämpfer 1"
							class="fighter-input"
						/>
						<span class="vs">VS</span>
						<input
							type="text"
							bind:value={fighter2}
							placeholder="Kämpfer 2"
							class="fighter-input"
						/>
					</div>
				</div>
			{/if}

			<div class="config-block">
				<label>Runden</label>
				<div class="control-group">
					<button
						type="button"
						class="btn-adjust"
						onclick={() => rounds > 1 && (rounds -= 1)}
					>
						−
					</button>
					<span class="display-value">{rounds}</span>
					<button
						type="button"
						class="btn-adjust"
						onclick={() => rounds < 20 && (rounds += 1)}
					>
						+
					</button>
				</div>
			</div>

			<div class="config-block">
				<label>Arbeitszeit</label>
				<div class="control-group">
					<button
						type="button"
						class="btn-adjust"
						onclick={() => workDuration > 15 && (workDuration -= 15)}
					>
						−
					</button>
					<span class="display-value">{formatTime(workDuration)}</span>
					<button
						type="button"
						class="btn-adjust"
						onclick={() => workDuration < 600 && (workDuration += 15)}
					>
						+
					</button>
				</div>
			</div>

			<div class="config-block">
				<label>Pausenzeit</label>
				<div class="control-group">
					<button
						type="button"
						class="btn-adjust"
						onclick={() => restDuration > 5 && (restDuration -= 5)}
					>
						−
					</button>
					<span class="display-value">{formatTime(restDuration)}</span>
					<button
						type="button"
						class="btn-adjust"
						onclick={() => restDuration < 300 && (restDuration += 5)}
					>
						+
					</button>
				</div>
			</div>

			<div class="setup-summary">
				<div class="summary-label">Gesamtdauer (ca.)</div>
				<div class="summary-time">
					{formatTime(rounds * (workDuration + restDuration))}
				</div>
			</div>

			<button type="submit" class="btn-start">
				Training Starten
			</button>
		</form>
	</div>
</div>

<style>
	:root {
		--primary-green: #2ecc71;
		--bg-dark: #0a0e27;
		--bg-darker: #050810;
		--text-light: #ecf0f1;
		--text-muted: #95a5a6;
		--accent-color: #3498db;
	}

	.setup-container {
		min-height: 100vh;
		background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-darker) 100%);
		padding: 40px 20px;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.btn-nav {
		position: absolute;
		top: 20px;
		background: rgba(255, 255, 255, 0.1);
		border: none;
		color: var(--text-muted);
		width: 44px;
		height: 44px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		z-index: 10;
	}

	.btn-back {
		left: 20px;
	}

	.btn-exit {
		right: 20px;
		font-size: 20px;
	}

	.btn-nav:hover {
		background: rgba(255, 255, 255, 0.15);
		color: white;
	}

	.btn-exit:hover {
		background: rgba(231, 76, 60, 0.2);
		color: #e74c3c;
	}

	.setup-content {
		flex: 1;
		max-width: 500px;
		margin: 0 auto;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.setup-header {
		text-align: center;
		margin-bottom: 40px;
	}

	.setup-header h1 {
		font-size: 48px;
		font-weight: 800;
		color: var(--primary-green);
		text-transform: uppercase;
		letter-spacing: -1px;
	}

	.setup-header p {
		color: var(--text-muted);
		font-size: 18px;
	}

	.setup-form {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.fighter-grid {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 12px;
	}

	.fighter-input {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 16px;
		color: white;
		font-size: 16px;
		width: 100%;
		text-align: center;
	}

	.fighter-input:focus {
		outline: none;
		border-color: var(--primary-green);
		background: rgba(255, 255, 255, 0.08);
	}

	.vs {
		font-weight: 900;
		color: var(--primary-green);
		font-style: italic;
	}

	.config-block {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.config-block label {
		font-weight: 700;
		font-size: 14px;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: var(--text-muted);
		text-align: center;
	}

	.control-group {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: rgba(255, 255, 255, 0.05);
		padding: 10px;
		border-radius: 20px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.btn-adjust {
		width: 64px;
		height: 64px;
		border: none;
		border-radius: 16px;
		background: var(--primary-green);
		color: var(--bg-darker);
		font-size: 32px;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.1s;
		box-shadow: 0 4px 0 #27ae60;
	}

	.btn-adjust:active {
		transform: translateY(2px);
		box-shadow: 0 2px 0 #27ae60;
	}

	.display-value {
		font-size: 42px;
		font-weight: 800;
		color: var(--text-light);
		font-variant-numeric: tabular-nums;
	}

	.setup-summary {
		text-align: center;
		padding: 20px;
		background: rgba(46, 204, 113, 0.05);
		border-radius: 16px;
		border: 1px dashed rgba(46, 204, 113, 0.3);
	}

	.summary-label {
		font-size: 12px;
		color: var(--text-muted);
		text-transform: uppercase;
		margin-bottom: 4px;
	}

	.summary-time {
		font-size: 28px;
		font-weight: 700;
		color: var(--primary-green);
	}

	.btn-start {
		background: var(--primary-green);
		color: var(--bg-darker);
		border: none;
		padding: 24px;
		font-size: 20px;
		font-weight: 800;
		border-radius: 20px;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1px;
		box-shadow: 0 6px 0 #27ae60;
		transition: all 0.1s;
		margin-top: 10px;
	}

	.btn-start:active {
		transform: translateY(3px);
		box-shadow: 0 3px 0 #27ae60;
	}

	@media (max-width: 480px) {
		.setup-header h1 { font-size: 36px; }
		.btn-adjust { width: 56px; height: 56px; }
		.display-value { font-size: 32px; }
	}
</style>
