<script>
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Timer from '$lib/components/Timer.svelte';
	import { Save, LayoutDashboard } from 'lucide-svelte';

	let workoutConfig = $state({});
	let workoutComplete = $state(false);
	let isSaving = $state(false);

	// Beim Load die Config aus SessionStorage holen
	$effect.pre(() => {
		if (typeof window !== 'undefined') {
			const saved = sessionStorage.getItem('workoutConfig');
			if (saved) {
				workoutConfig = JSON.parse(saved);
			} else {
				// Falls keine Config vorhanden, zurück zum Setup
				goto('/');
			}
		}
	});

	const workoutNames = {
		bag: 'Sandsack',
		shadowboxing: 'Schattenboxen',
		hiit: 'HIIT',
		sparring: 'Sparring'
	};

	let workoutName = $derived(workoutNames[workoutConfig.type] || 'Training');
	let errorMessage = $state('');

	function handleWorkoutComplete() {
		workoutComplete = true;
	}

	function goToDashboard() {
		sessionStorage.removeItem('workoutConfig');
		goto('/dashboard');
	}
</script>

{#if !workoutComplete}
	<Timer
		rounds={workoutConfig.rounds || 3}
		workDuration={workoutConfig.workDuration || 180}
		restDuration={workoutConfig.restDuration || 60}
		workoutName={workoutName}
		fighter1={workoutConfig.fighter1}
		fighter2={workoutConfig.fighter2}
		onComplete={handleWorkoutComplete}
	/>
{:else}
	<div class="completion-screen">
		<div class="completion-content">
			<div class="completion-icon">✓</div>
			<h1>Einheit beendet! 🎉</h1>
			<p class="completion-text">
				Starke Leistung! Halte hier deine Notizen für das Journal fest.
			</p>

			<div class="stats-compact">
				<span class="badge">{workoutName}</span>
				{#if workoutConfig.fighter1 && workoutConfig.fighter2}
					<span class="badge">{workoutConfig.fighter1} vs {workoutConfig.fighter2}</span>
				{/if}
				<span class="badge">{workoutConfig.rounds} Runden</span>
			</div>

			<form
				method="POST"
				action="?/saveSession"
				use:enhance={() => {
					isSaving = true;
					errorMessage = '';
					return async ({ result }) => {
						if (result.type === 'redirect') {
							sessionStorage.removeItem('workoutConfig');
							goto(result.location);
						} else if (result.type === 'failure') {
							isSaving = false;
							errorMessage = result.data?.message || 'Fehler beim Speichern';
						} else {
							isSaving = false;
						}
					};
				}}
				class="journal-form"
			>
				{#if errorMessage}
					<div class="error-msg" in:fade>
						⚠️ {errorMessage}
					</div>
				{/if}
				<input type="hidden" name="type" value={workoutConfig.type} />
				<input type="hidden" name="rounds" value={workoutConfig.rounds} />
				<input type="hidden" name="workDuration" value={workoutConfig.workDuration} />
				<input type="hidden" name="restDuration" value={workoutConfig.restDuration} />
				<input type="hidden" name="fighter1" value={workoutConfig.fighter1 || ''} />
				<input type="hidden" name="fighter2" value={workoutConfig.fighter2 || ''} />

				<div class="input-group">
					<label for="notes">Trainer Notizen (Journal)</label>
					<textarea
						id="notes"
						name="trainerNotes"
						placeholder="Wie war die Form? Was muss verbessert werden?"
						rows="4"
					></textarea>
				</div>

				<div class="action-grid">
					<button type="submit" class="btn-save" disabled={isSaving}>
						{#if isSaving}
							Speichert...
						{:else}
							<Save size={20} /> Journal speichern
						{/if}
					</button>
					<button type="button" class="btn-skip" onclick={goToDashboard}>
						<LayoutDashboard size={20} /> Ohne Notizen beenden
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	:root {
		--primary-color: #2ecc71;
		--bg-dark: #0a0e27;
		--bg-darker: #050810;
		--text-light: #ecf0f1;
		--text-muted: #95a5a6;
		--glass-bg: rgba(255, 255, 255, 0.03);
	}

	.completion-screen {
		width: 100%;
		min-height: 100vh;
		background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-darker) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-light);
		padding: 40px 20px;
	}

	.completion-content {
		text-align: center;
		max-width: 600px;
		width: 100%;
	}

	.completion-icon {
		font-size: 80px;
		margin-bottom: 10px;
		color: var(--primary-color);
	}

	.completion-content h1 {
		font-size: 42px;
		font-weight: 800;
		margin-bottom: 8px;
	}

	.completion-text {
		color: var(--text-muted);
		margin-bottom: 30px;
	}

	.stats-compact {
		display: flex;
		justify-content: center;
		gap: 12px;
		margin-bottom: 32px;
	}

	.badge {
		background: rgba(46, 204, 113, 0.1);
		color: var(--primary-color);
		padding: 6px 16px;
		border-radius: 50px;
		font-weight: 700;
		font-size: 14px;
		border: 1px solid rgba(46, 204, 113, 0.2);
	}

	.journal-form {
		background: var(--glass-bg);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 24px;
		padding: 32px;
		text-align: left;
	}

	.error-msg {
		background: rgba(231, 76, 60, 0.15);
		color: #e74c3c;
		padding: 12px;
		border-radius: 12px;
		margin-bottom: 20px;
		font-size: 14px;
		font-weight: 600;
		text-align: center;
		border: 1px solid rgba(231, 76, 60, 0.3);
	}

	.input-group {
		margin-bottom: 24px;
	}

	.input-group label {
		display: block;
		font-size: 14px;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--text-muted);
		margin-bottom: 12px;
		letter-spacing: 1px;
	}

	textarea {
		width: 100%;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 16px;
		color: white;
		font-family: inherit;
		font-size: 16px;
		resize: none;
		transition: border-color 0.2s;
	}

	textarea:focus {
		outline: none;
		border-color: var(--primary-color);
	}

	.action-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}

	.btn-save {
		background: var(--primary-color);
		color: #000;
		border: none;
		padding: 18px;
		border-radius: 16px;
		font-size: 16px;
		font-weight: 800;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		transition: all 0.2s;
	}

	.btn-save:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 10px 20px rgba(46, 204, 113, 0.2);
	}

	.btn-save:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-skip {
		background: transparent;
		color: var(--text-muted);
		border: 1px solid rgba(255, 255, 255, 0.1);
		padding: 16px;
		border-radius: 16px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		transition: all 0.2s;
	}

	.btn-skip:hover {
		color: white;
		background: rgba(255, 255, 255, 0.05);
	}

	@media (max-width: 480px) {
		.completion-content h1 { font-size: 32px; }
		.journal-form { padding: 20px; }
	}
</style>
