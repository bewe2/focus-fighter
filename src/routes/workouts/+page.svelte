<script>
	import { goto } from '$app/navigation';
	import { fade, fly, scale } from 'svelte/transition';
	import { Sword, Zap, User, Target, ChevronRight } from 'lucide-svelte';

	const workouts = [
		{
			id: 'sparring',
			name: 'Sparring Einheit',
			description: '10 Runden • 3:00 Min Arbeit • 1:00 Min Pause',
			details: 'Simulation realer Kampfsituationen zur Verbesserung von Timing und Distanzgefühl.',
			icon: Sword,
			color: '#e74c3c'
		},
		{
			id: 'hiit',
			name: 'HIIT Workout',
			description: '8 Runden • 0:45 Min Arbeit • 0:15 Min Pause',
			details: 'Hochintensives Intervalltraining für maximale Fettverbrennung und Ausdauer.',
			icon: Zap,
			color: '#f1c40f'
		},
		{
			id: 'shadowboxing',
			name: 'Schattenboxen',
			description: '3 Runden • 2:00 Min Arbeit • 0:30 Min Pause',
			details: 'Fokus auf Technik, Beinarbeit und Visualisierung des Gegners.',
			icon: User,
			color: '#3498db'
		},
		{
			id: 'bag',
			name: 'Sandsack Training',
			description: '6 Runden • 3:00 Min Arbeit • 1:00 Min Pause',
			details: 'Kraftentwicklung und Schlagschule am schweren Sandsack.',
			icon: Target,
			color: '#2ecc71'
		}
	];

	function selectWorkout(id) {
		goto(`/setup/${id}`);
	}
</script>

<div class="menu-container">
	<header class="menu-header" in:fade={{ duration: 400 }}>
		<h1>Wähle dein Training</h1>
		<p>Bereit für die nächste Einheit? Wähle deinen Modus.</p>
	</header>

	<div class="workout-menu">
		{#each workouts as workout, i (workout.id)}
			<button
				class="menu-card"
				onclick={() => selectWorkout(workout.id)}
				in:fly={{ y: 50, duration: 500, delay: i * 100 }}
			>
				<div class="card-glow" style="--card-color: {workout.color}"></div>
				<div class="card-content">
					<div class="icon-section" style="background: {workout.color}20; color: {workout.color}">
						<workout.icon size={32} strokeWidth={2.5} />
					</div>
					<div class="info-section">
						<h3>{workout.name}</h3>
						<span class="preset-tag">{workout.description}</span>
						<p>{workout.details}</p>
					</div>
					<div class="action-section">
						<ChevronRight size={24} />
					</div>
				</div>
			</button>
		{/each}
	</div>
</div>

<style>
	.menu-container {
		min-height: 100vh;
		padding: 60px 20px;
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 50px;
	}

	.menu-header {
		text-align: center;
	}

	.menu-header h1 {
		font-size: 48px;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: -1px;
		margin-bottom: 12px;
		background: linear-gradient(to bottom, #fff, #95a5a6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.menu-header p {
		color: #95a5a6;
		font-size: 18px;
	}

	.workout-menu {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.menu-card {
		background: #1a1f3a;
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 24px;
		padding: 24px;
		text-align: left;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		color: white;
	}

	.card-glow {
		position: absolute;
		top: 0;
		left: 0;
		width: 4px;
		height: 100%;
		background: var(--card-color);
		opacity: 0.5;
		transition: width 0.3s ease;
	}

	.menu-card:hover {
		transform: scale(1.02) translateX(10px);
		background: #242a4a;
		border-color: rgba(255, 255, 255, 0.1);
	}

	.menu-card:hover .card-glow {
		width: 8px;
		opacity: 1;
	}

	.card-content {
		display: flex;
		align-items: center;
		gap: 24px;
		width: 100%;
		z-index: 1;
	}

	.icon-section {
		width: 72px;
		height: 72px;
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.info-section {
		flex: 1;
	}

	.info-section h3 {
		font-size: 24px;
		font-weight: 800;
		margin-bottom: 4px;
	}

	.preset-tag {
		display: inline-block;
		font-size: 12px;
		font-weight: 700;
		color: #ecf0f1;
		background: rgba(255, 255, 255, 0.1);
		padding: 4px 12px;
		border-radius: 50px;
		margin-bottom: 10px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.info-section p {
		font-size: 14px;
		color: #95a5a6;
		line-height: 1.5;
	}

	.action-section {
		color: rgba(255, 255, 255, 0.2);
		transition: transform 0.3s ease, color 0.3s ease;
	}

	.menu-card:hover .action-section {
		transform: translateX(5px);
		color: white;
	}

	@media (max-width: 600px) {
		.menu-header h1 { font-size: 32px; }
		.card-content { flex-direction: column; align-items: flex-start; gap: 16px; }
		.action-section { display: none; }
		.icon-section { width: 56px; height: 56px; }
	}
</style>
