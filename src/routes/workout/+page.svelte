<script>
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Timer from '$lib/components/Timer.svelte';
	import { Save, LayoutDashboard } from 'lucide-svelte';
	import { settings } from '$lib/settingsStore';
	import { fade } from 'svelte/transition';

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
		de: { bag: 'Sandsack', shadowboxing: 'Schattenboxen', hiit: 'HIIT', sparring: 'Sparring' },
		en: { bag: 'Heavy Bag', shadowboxing: 'Shadow Boxing', hiit: 'HIIT', sparring: 'Sparring' }
	};

	const t = {
		de: {
			title: 'Einheit beendet! 🎉',
			subtitle: 'Starke Leistung! Halte hier deine Notizen für das Journal fest.',
			notesLabel: 'Trainer Notizen (Journal)',
			notesPlaceholder: 'Wie war die Form? Was muss verbessert werden?',
			save: 'Journal speichern',
			saving: 'Speichert...',
			skip: 'Ohne Notizen beenden',
			rounds: 'Runden',
			workout: 'Training',
			error: 'Fehler beim Speichern'
		},
		en: {
			title: 'Workout Complete! 🎉',
			subtitle: 'Great job! Record your notes for the journal here.',
			notesLabel: 'Trainer Notes (Journal)',
			notesPlaceholder: 'How was the form? What needs improvement?',
			save: 'Save Journal',
			saving: 'Saving...',
			skip: 'Finish without notes',
			rounds: 'Rounds',
			workout: 'Workout',
			error: 'Error saving session'
		}
	};

	let currentT = $derived(t[$settings.language]);
	let currentWorkoutNames = $derived(workoutNames[$settings.language]);
	let workoutName = $derived(currentWorkoutNames[workoutConfig.type] || workoutConfig.name || currentT.workout);
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
			<h1>{currentT.title}</h1>
			<p class="completion-text">{currentT.subtitle}</p>

			<div class="stats-compact">
				<span class="badge">{workoutName}</span>
				{#if workoutConfig.fighter1 && workoutConfig.fighter2}
					<span class="badge">{workoutConfig.fighter1} vs {workoutConfig.fighter2}</span>
				{/if}
				<span class="badge">{workoutConfig.rounds} {currentT.rounds}</span>
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
							errorMessage = result.data?.message || currentT.error;
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
					<label for="notes">{currentT.notesLabel}</label>
					<textarea
						id="notes"
						name="trainerNotes"
						placeholder={currentT.notesPlaceholder}
						rows="4"
					></textarea>
				</div>

				<div class="action-grid">
					<button type="submit" class="btn-save" disabled={isSaving}>
						{#if isSaving}
							{currentT.saving}
						{:else}
							<Save size={20} /> {currentT.save}
						{/if}
					</button>
					<button type="button" class="btn-skip" onclick={goToDashboard}>
						<LayoutDashboard size={20} /> {currentT.skip}
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
