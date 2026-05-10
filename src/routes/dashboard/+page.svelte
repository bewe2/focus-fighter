<script>
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { History, Play, Trophy, Clock, Target } from 'lucide-svelte';
	import { settings } from '$lib/settingsStore';

	let { data } = $props();

	const workoutNames = {
		bag: 'Sandsack',
		shadowboxing: 'Schattenboxen',
		hiit: 'HIIT',
		sparring: 'Sparring'
	};

	function formatDate(iso) {
		return new Date(iso).toLocaleDateString('de-DE', {
			weekday: 'short',
			day: '2-digit',
			month: '2-digit'
		});
	}

	function repeatWorkout(session) {
		const config = {
			type: session.type,
			rounds: session.rounds,
			workDuration: session.workDuration || session.workTime,
			restDuration: session.restDuration || session.restTime
		};
		sessionStorage.setItem('workoutConfig', JSON.stringify(config));
		goto('/workout');
	}

	let progressPercent = $derived(Math.min((data.stats.weeklyCount / data.stats.goalCount) * 100, 100));

	const greeting = $derived($settings.language === 'de' ? `Hallo ${data.trainerName}` : `Hello ${data.trainerName}`);
</script>

<div class="dashboard-wrapper">
	<header class="dashboard-header" in:fade>
		<div class="header-greeting">{greeting} 👋</div>
		<h1>Trainer Zentrale</h1>
		<p>{$settings.language === 'de' ? 'Deine Performance der Woche im Überblick' : 'Your weekly performance overview'}</p>
	</header>

	<div class="stats-grid">
		<!-- Weekly Time Card -->
		<div class="stat-card glass" in:fly={{ y: 20, delay: 100 }}>
			<div class="stat-icon green"><Clock size={24} /></div>
			<div class="stat-content">
				<span class="stat-label">{$settings.language === 'de' ? 'Trainingszeit' : 'Workout Time'}</span>
				<span class="stat-value">{data.stats.totalMinutes} <small>Min</small></span>
			</div>
		</div>

		<!-- Weekly Progress Card -->
		<div class="stat-card glass" in:fly={{ y: 20, delay: 200 }}>
			<div class="stat-icon yellow"><Trophy size={24} /></div>
			<div class="stat-content">
				<span class="stat-label">{$settings.language === 'de' ? 'Einheiten diese Woche' : 'Sessions this week'}</span>
				<span class="stat-value">{data.stats.weeklyCount} <small>/ {data.stats.goalCount}</small></span>
				<div class="goal-bar">
					<div class="goal-fill" style="width: {progressPercent}%"></div>
				</div>
				<span class="reset-info">{$settings.language === 'de' ? 'Reset jeden Montag' : 'Resets every Monday'}</span>
			</div>
		</div>
	</div>

	{#if data.lastSessions.length > 0}
		<section class="quick-action" in:fade={{ delay: 300 }}>
			<button class="btn-repeat glass" onclick={() => repeatWorkout(data.lastSessions[0])}>
				<div class="btn-info">
					<span class="btn-label">{$settings.language === 'de' ? 'Zuletzt trainiert' : 'Last workout'}</span>
					<span class="btn-workout">{workoutNames[data.lastSessions[0].type] || 'Training'}</span>
				</div>
				<div class="btn-play">
					<Play size={24} fill="currentColor" />
				</div>
			</button>
		</section>

		<section class="history-section" in:fade={{ delay: 400 }}>
			<div class="section-header">
				<h2><History size={20} /> {$settings.language === 'de' ? 'Letzte Einheiten' : 'Recent sessions'}</h2>
			</div>

			<div class="history-list">
				{#each data.lastSessions as session}
					<div class="history-card glass">
						<div class="history-main">
							<div class="history-type">
								<span class="type-name">{workoutNames[session.type] || 'Workout'}</span>
								{#if session.fighter1 && session.fighter2}
									<span class="matchup-tag">{session.fighter1} vs {session.fighter2}</span>
								{/if}
								<span class="history-date">{formatDate(session.timestamp)}</span>
							</div>
							<div class="history-meta">
								{session.rounds} Runden • {Math.round((session.rounds * ((session.workDuration || session.workTime) + (session.restDuration || session.restTime))) / 60)} Min
							</div>
						</div>
						{#if session.trainerNotes}
							<p class="history-notes">{session.trainerNotes}</p>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.dashboard-wrapper {
		padding: 40px 20px;
		max-width: 800px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.header-greeting {
		color: #2ecc71;
		font-weight: 700;
		font-size: 18px;
		margin-bottom: 4px;
	}

	.dashboard-header h1 {
		font-size: 32px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: -0.5px;
		color: #fff;
	}

	.dashboard-header p {
		color: #95a5a6;
		font-size: 16px;
	}

	/* --- Glassmorphism --- */
	.glass {
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 20px;
	}

	/* --- Stats --- */
	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.stat-card {
		padding: 24px;
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stat-icon.green { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
	.stat-icon.yellow { background: rgba(241, 196, 15, 0.1); color: #f1c40f; }

	.stat-label { font-size: 12px; color: #95a5a6; text-transform: uppercase; font-weight: 700; display: block; }
	.stat-value { font-size: 24px; font-weight: 800; color: #fff; }
	.stat-value small { font-size: 14px; color: #95a5a6; font-weight: 400; }

	.reset-info {
		font-size: 10px;
		color: #95a5a6;
		margin-top: 4px;
		display: block;
		font-style: italic;
	}

	.goal-bar {
		width: 100%;
		height: 4px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
		margin-top: 8px;
		overflow: hidden;
	}

	.goal-fill {
		height: 100%;
		background: #f1c40f;
		border-radius: 2px;
		transition: width 1s ease-out;
	}

	/* --- Quick Action --- */
	.btn-repeat {
		width: 100%;
		padding: 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border: 1px solid rgba(46, 204, 113, 0.2);
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
	}

	.btn-repeat:hover {
		background: rgba(46, 204, 113, 0.05);
		border-color: #2ecc71;
		transform: translateY(-2px);
	}

	.btn-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #2ecc71; display: block; }
	.btn-workout { font-size: 20px; font-weight: 800; color: #fff; }
	.btn-play { color: #2ecc71; }

	/* --- History --- */
	.section-header h2 {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 18px;
		color: #ecf0f1;
		margin-bottom: 20px;
	}

	.history-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.history-card {
		padding: 20px;
	}

	.history-main {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 8px;
	}

	.type-name { font-weight: 700; font-size: 16px; color: #fff; display: block; }
	.matchup-tag { font-size: 14px; font-weight: 600; color: #2ecc71; font-style: italic; display: block; margin: 4px 0; }
	.history-date { font-size: 12px; color: #95a5a6; }
	.history-meta { font-size: 13px; color: #2ecc71; font-weight: 600; }
	.history-notes { font-size: 14px; font-style: italic; color: #95a5a6; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.05); }

	@media (max-width: 600px) {
		.stats-grid { grid-template-columns: 1fr; }
	}
</style>
