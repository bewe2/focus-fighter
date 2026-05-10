<script>
	import { goto } from '$app/navigation';

	let { data } = $props();

	let workoutTypes = [
		{ id: 'bag', name: 'Sandsack', description: 'Kraft und Genauigkeit', icon: '🥊' },
		{ id: 'shadowboxing', name: 'Schattenboxen', description: 'Technik und Koordination', icon: '👤' },
		{ id: 'hiit', name: 'HIIT', description: 'Intervalltraining', icon: '⚡' },
		{ id: 'sparring', name: 'Sparring', description: 'Kampfsimulation', icon: '🥋' }
	];

	function selectWorkout(type) {
		goto(`/setup/${type}`);
	}

	function formatDate(isoString) {
		const date = new Date(isoString);
		return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	function getTypeName(id) {
		return workoutTypes.find(t => t.id === id)?.name || id;
	}
</script>

<div class="dashboard">
	<header class="header">
		<h1>FocusFighter</h1>
		<p class="subtitle">Dein digitaler Trainer für maximale Performance</p>
	</header>

	<main class="content-area">
		<section class="workout-section">
			<h2>Neues Training</h2>
			<div class="workout-grid">
				{#each workoutTypes as workout (workout.id)}
					<button
						class="workout-card"
						onclick={() => selectWorkout(workout.id)}
					>
						<div class="card-icon">{workout.icon}</div>
						<div class="card-name">{workout.name}</div>
						<div class="card-description">{workout.description}</div>
					</button>
				{/each}
			</div>
		</section>

		{#if data.history && data.history.length > 0}
			<section class="history-section">
				<h2>Letzte Einheiten</h2>
				<div class="history-list">
					{#each data.history as entry}
						<div class="history-item">
							<div class="history-info">
								<span class="history-type">{getTypeName(entry.type)}</span>
								<span class="history-date">{formatDate(entry.timestamp)}</span>
							</div>
							<div class="history-details">
								{entry.rounds} Runden • {entry.workTime || entry.workDuration}s Arbeit
							</div>
							{#if entry.trainerNotes}
								<p class="history-notes">{entry.trainerNotes}</p>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</main>

	<footer class="footer">
		<p>Version 0.0.1 • FocusFighter 💪</p>
	</footer>
</div>

<style>
	:root {
		--primary-green: #2ecc71;
		--bg-dark: #0a0e27;
		--bg-darker: #050810;
		--text-light: #ecf0f1;
		--text-muted: #95a5a6;
		--card-bg: #1a1f3a;
	}

	.dashboard {
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
		max-width: 1000px;
		margin: 0 auto;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 60px;
		flex: 1;
	}

	h2 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 24px;
		color: var(--text-light);
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.workout-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 20px;
	}

	.workout-card {
		background: var(--card-bg);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 20px;
		padding: 30px 20px;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.workout-card:hover {
		transform: translateY(-5px);
		border-color: var(--primary-green);
		background: rgba(46, 204, 113, 0.05);
	}

	.card-icon { font-size: 48px; }
	.card-name { font-size: 20px; font-weight: 700; }
	.card-description { font-size: 14px; color: var(--text-muted); text-align: center; }

	.history-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.history-item {
		background: rgba(255, 255, 255, 0.03);
		border-radius: 16px;
		padding: 20px;
		border-left: 4px solid var(--primary-green);
	}

	.history-info {
		display: flex;
		justify-content: space-between;
		margin-bottom: 4px;
	}

	.history-type { font-weight: 700; font-size: 18px; color: var(--primary-green); }
	.history-date { font-size: 14px; color: var(--text-muted); }
	.history-details { font-size: 14px; color: var(--text-light); margin-bottom: 8px; }
	.history-notes { font-size: 14px; font-style: italic; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; }

	.footer {
		text-align: center;
		padding: 40px 20px;
		color: var(--text-muted);
		font-size: 12px;
	}

	@media (max-width: 600px) {
		.header h1 { font-size: 42px; }
		.workout-grid { grid-template-columns: 1fr; }
	}
</style>
