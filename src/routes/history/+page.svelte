<script>
	import { fade, fly } from 'svelte/transition';
	import { History, Sword, Zap, User, Target, Calendar, Clock } from 'lucide-svelte';
	import { settings } from '$lib/settingsStore';

	let { data } = $props();

	const t = {
		de: {
			title: 'Trainings-Journal',
			subtitle: 'Alle vergangenen Einheiten und Notizen',
			empty: 'Noch keine Trainingseinheiten absolviert.',
			rounds: 'Runden',
			work: 'Arbeitszeit',
			seconds: 's',
			workoutTypes: {
				sparring: 'Sparring',
				hiit: 'HIIT',
				shadowboxing: 'Schattenboxen',
				bag: 'Sandsack'
			}
		},
		en: {
			title: 'Workout Journal',
			subtitle: 'All past sessions and notes',
			empty: 'No training sessions completed yet.',
			rounds: 'Rounds',
			work: 'Work time',
			seconds: 's',
			workoutTypes: {
				sparring: 'Sparring',
				hiit: 'HIIT',
				shadowboxing: 'Shadow Boxing',
				bag: 'Heavy Bag'
			}
		}
	};

	let currentT = $derived(t[$settings.language]);

	const workoutConfig = $derived({
		sparring: { name: currentT.workoutTypes.sparring, icon: Sword, color: '#e74c3c' },
		hiit: { name: currentT.workoutTypes.hiit, icon: Zap, color: '#f1c40f' },
		shadowboxing: { name: currentT.workoutTypes.shadowboxing, icon: User, color: '#3498db' },
		bag: { name: currentT.workoutTypes.bag, icon: Target, color: '#2ecc71' }
	});

	function formatDate(iso) {
		const lang = $settings.language === 'de' ? 'de-DE' : 'en-US';
		return new Date(iso).toLocaleDateString(lang, {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function formatTime(iso) {
		const lang = $settings.language === 'de' ? 'de-DE' : 'en-US';
		return new Date(iso).toLocaleTimeString(lang, {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Group history by date
	let groupedHistory = $derived(
		data.history.reduce((groups, session) => {
			const date = formatDate(session.timestamp);
			if (!groups[date]) groups[date] = [];
			groups[date].push(session);
			return groups;
		}, {})
	);
</script>

<div class="history-container">
	<header class="page-header" in:fade>
		<div class="header-icon">
			<History size={32} />
		</div>
		<div>
			<h1>{currentT.title}</h1>
			<p>{currentT.subtitle}</p>
		</div>
	</header>

	{#if data.history.length === 0}
		<div class="empty-state" in:fade={{ delay: 200 }}>
			<p>{currentT.empty}</p>
		</div>
	{:else}
		<div class="timeline">
			{#each Object.entries(groupedHistory) as [date, sessions], i}
				<div class="date-group" in:fly={{ y: 20, delay: i * 50 }}>
					<div class="date-sticky">
						<Calendar size={16} />
						<span>{date}</span>
					</div>

					<div class="sessions-list">
						{#each sessions as session}
							{@const config = workoutConfig[session.type] || workoutConfig.bag}
							<div class="session-card glass">
								<div class="card-left" style="background: {config.color}15; color: {config.color}">
									<config.icon size={24} />
								</div>
								
								<div class="card-body">
									<div class="session-header">
										<h3>{config.name}</h3>
										<span class="session-time"><Clock size={12} /> {formatTime(session.timestamp)}</span>
									</div>

									{#if session.fighter1 && session.fighter2}
										<div class="matchup">{session.fighter1} <span class="vs">vs</span> {session.fighter2}</div>
									{/if}

									<div class="meta">
										{session.rounds} {currentT.rounds} • {session.workDuration || session.workTime}{currentT.seconds} {currentT.work}
									</div>

									{#if session.trainerNotes}
										<div class="notes-box">
											<p>{session.trainerNotes}</p>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.history-container {
		padding: 40px 20px;
		max-width: 800px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 40px;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.header-icon {
		width: 64px;
		height: 64px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #2ecc71;
	}

	.page-header h1 {
		font-size: 32px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: -0.5px;
	}

	.page-header p {
		color: #95a5a6;
		font-size: 16px;
	}

	.timeline {
		display: flex;
		flex-direction: column;
		gap: 40px;
	}

	.date-group {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.date-sticky {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #2ecc71;
		font-weight: 800;
		text-transform: uppercase;
		font-size: 14px;
		letter-spacing: 1px;
	}

	.sessions-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		border-left: 2px solid rgba(255, 255, 255, 0.05);
		margin-left: 8px;
		padding-left: 20px;
	}

	.session-card {
		display: flex;
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 20px;
		overflow: hidden;
		transition: transform 0.2s;
	}

	.session-card:hover {
		transform: translateX(4px);
		background: rgba(255, 255, 255, 0.05);
	}

	.card-left {
		width: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.card-body {
		flex: 1;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.session-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.session-header h3 {
		font-size: 18px;
		font-weight: 700;
	}

	.session-time {
		font-size: 12px;
		color: #95a5a6;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.matchup {
		font-size: 16px;
		font-weight: 700;
		color: #ecf0f1;
		font-style: italic;
	}

	.vs {
		color: #2ecc71;
		font-size: 14px;
		padding: 0 4px;
	}

	.meta {
		font-size: 13px;
		color: #95a5a6;
	}

	.notes-box {
		margin-top: 8px;
		padding-top: 12px;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		font-size: 14px;
		color: #bdc3c7;
		font-style: italic;
		line-height: 1.5;
	}

	.empty-state {
		text-align: center;
		padding: 60px;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 24px;
		color: #95a5a6;
	}
</style>
