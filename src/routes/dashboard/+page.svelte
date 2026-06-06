<script>
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { History, Play, Trophy, Clock, Target } from 'lucide-svelte';
	import { settings } from '$lib/settingsStore';

	let { data } = $props();

	const workoutNames = {
		de: {
			bag: 'Sandsack',
			shadowboxing: 'Schattenboxen',
			hiit: 'HIIT',
			sparring: 'Sparring'
		},
		en: {
			bag: 'Heavy Bag',
			shadowboxing: 'Shadow Boxing',
			hiit: 'HIIT',
			sparring: 'Sparring'
		}
	};

	const t = {
		de: {
			greeting: 'Hallo',
			title: 'Trainer Zentrale',
			subtitle: 'Deine Performance der Woche im Überblick',
			workoutTime: 'Gesamte Trainingszeit',
			sessionsThisWeek: 'Einheiten diese Woche',
			resetInfo: 'Reset jeden Montag',
			lastWorkout: 'Zuletzt trainiert',
			recentSessions: 'Letzte Einheiten',
			minutes: 'Min',
			workout: 'Training',
			rounds: 'Runden',
			noWorkouts: 'Noch keine Trainings absolviert',
			noWorkoutsHint: 'Starte hier dein erstes Training',
			startWorkout: 'Training starten'
		},
		en: {
			greeting: 'Hello',
			title: 'Trainer Central',
			subtitle: 'Your weekly performance overview',
			workoutTime: 'Total Workout Time',
			sessionsThisWeek: 'Sessions this week',
			resetInfo: 'Resets every Monday',
			lastWorkout: 'Last workout',
			recentSessions: 'Recent sessions',
			minutes: 'Min',
			workout: 'Workout',
			rounds: 'Rounds',
			noWorkouts: 'No workouts completed yet',
			noWorkoutsHint: 'Start your first workout here',
			startWorkout: 'Start Workout'
		}
	};

	let currentT = $derived(t[$settings.language]);
	let currentWorkoutNames = $derived(workoutNames[$settings.language]);

	function formatDate(iso) {
		const lang = $settings.language === 'de' ? 'de-DE' : 'en-US';
		return new Date(iso).toLocaleDateString(lang, {
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

	function formatTotalTime(minutes) {
		if (minutes < 60) return `${minutes} ${currentT.minutes}`;
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;
		return m > 0 ? `${h}h ${m}m` : `${h}h`;
	}

	let weeklyGoal = $derived($settings.weeklyGoal ?? 5);
	let progressPercent = $derived(Math.min((data.stats.weeklyCount / weeklyGoal) * 100, 100));

	const greeting = $derived(`${currentT.greeting} ${data.trainerName}`);
</script>

<div class="dashboard-wrapper">
	<header class="dashboard-header" in:fade>
		<div class="header-greeting">{greeting} 👋</div>
		<h1>{currentT.title}</h1>
		<p>{currentT.subtitle}</p>
	</header>

	<div class="stats-grid">
		<!-- Weekly Time Card -->
		<div class="stat-card glass" in:fly={{ y: 20, delay: 100 }}>
			<div class="stat-icon green"><Clock size={24} /></div>
			<div class="stat-content">
				<span class="stat-label">{currentT.workoutTime}</span>
				<span class="stat-value">{formatTotalTime(data.stats.totalMinutes)}</span>
			</div>
		</div>

		<!-- Weekly Progress Card -->
		<div class="stat-card glass" in:fly={{ y: 20, delay: 200 }}>
			<div class="stat-icon yellow"><Trophy size={24} /></div>
			<div class="stat-content">
				<span class="stat-label">{currentT.sessionsThisWeek}</span>
				<span class="stat-value">{data.stats.weeklyCount} <small>/ {weeklyGoal}</small></span>
				<div class="goal-bar">
					<div class="goal-fill" style="width: {progressPercent}%"></div>
				</div>
				<span class="reset-info">{currentT.resetInfo}</span>
			</div>
		</div>
	</div>

	{#if data.lastSessions.length > 0}
		<section class="quick-action" in:fade={{ delay: 300 }}>
			<button class="btn-repeat glass" onclick={() => repeatWorkout(data.lastSessions[0])}>
				<div class="btn-info">
					<span class="btn-label">{currentT.lastWorkout}</span>
					<span class="btn-workout">{currentWorkoutNames[data.lastSessions[0].type] || currentT.workout}</span>
				</div>
				<div class="btn-play">
					<Play size={24} fill="currentColor" />
				</div>
			</button>
		</section>

		<section class="history-section" in:fade={{ delay: 400 }}>
			<div class="section-header">
				<h2><History size={20} /> {currentT.recentSessions}</h2>
			</div>

			<div class="history-list">
				{#each data.lastSessions as session}
					<div class="history-card glass">
						<div class="history-main">
							<div class="history-type">
								<span class="type-name">{currentWorkoutNames[session.type] || currentT.workout}</span>
								{#if session.fighter1 && session.fighter2}
									<span class="matchup-tag">{session.fighter1} vs {session.fighter2}</span>
								{/if}
								<span class="history-date">{formatDate(session.timestamp)}</span>
							</div>
							<div class="history-meta">
								{session.rounds} {currentT.rounds} • {Math.round((session.rounds * ((session.workDuration || session.workTime) + (session.restDuration || session.restTime))) / 60)} {currentT.minutes}
							</div>
						</div>
						{#if session.trainerNotes}
							<p class="history-notes">{session.trainerNotes}</p>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{:else}
		<section class="empty-state" in:fade={{ delay: 300 }}>
			<div class="empty-icon">🥊</div>
			<h2>{currentT.noWorkouts}</h2>
			<p>{currentT.noWorkoutsHint}</p>
			<button class="btn-start-first" onclick={() => goto('/workouts')}>
				<Play size={20} fill="currentColor" />
				{currentT.startWorkout}
			</button>
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

	/* --- Empty State --- */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 60px 20px;
		text-align: center;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 24px;
	}

	.empty-icon {
		font-size: 56px;
		line-height: 1;
	}

	.empty-state h2 {
		font-size: 22px;
		font-weight: 800;
		color: #fff;
		margin: 0;
	}

	.empty-state p {
		font-size: 15px;
		color: #95a5a6;
		margin: 0;
	}

	.btn-start-first {
		display: flex;
		align-items: center;
		gap: 10px;
		background: #2ecc71;
		color: #000;
		border: none;
		border-radius: 14px;
		padding: 16px 32px;
		font-size: 16px;
		font-weight: 700;
		cursor: pointer;
		margin-top: 8px;
		transition: all 0.2s ease;
	}

	.btn-start-first:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(46, 204, 113, 0.35);
	}

	.btn-start-first:active {
		transform: scale(0.97);
	}

	@media (max-width: 600px) {
		.stats-grid { grid-template-columns: 1fr; }
	}
</style>
