<script>
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { Sword, Zap, User, Target, ChevronRight, Plus, Trash2, Dumbbell, X, Pencil, RotateCcw } from 'lucide-svelte';
	import { settings } from '$lib/settingsStore';

	const PRESET_COLORS = ['#e74c3c', '#f59e0b', '#2ecc71', '#3b82f6', '#a855f7', '#ec4899'];

	// Hardcoded original defaults (never changes)
	const PRESET_DEFAULTS = {
		sparring:     { rounds: 10, work: 180, rest: 60 },
		hiit:         { rounds: 8,  work: 45,  rest: 15 },
		shadowboxing: { rounds: 3,  work: 120, rest: 30 },
		bag:          { rounds: 6,  work: 180, rest: 60 }
	};

	const t = {
		de: {
			title: 'Wähle dein Training',
			subtitle: 'Bereit für die nächste Einheit? Wähle deinen Modus.',
			addWorkout: 'Eigenes Training erstellen',
			formTitle: 'Neues Training',
			nameLabel: 'Name',
			namePlaceholder: 'z.B. Ausdauer',
			editTitle: 'Defaults anpassen',
			saveDefaults: 'Als Standard speichern',
			resetDefaults: 'Zurücksetzen',
			roundsLabel: 'Runden',
			workLabel: 'Arbeitszeit',
			restLabel: 'Pausenzeit',
			colorLabel: 'Farbe',
			save: 'Speichern',
			cancel: 'Abbrechen',
			workSuffix: 'Arbeit',
			restSuffix: 'Pause',
			workouts: [
				{ id: 'sparring',      name: 'Sparring Einheit',  details: 'Simulation realer Kampfsituationen zur Verbesserung von Timing und Distanzgefühl.', icon: Sword,  color: '#e74c3c' },
				{ id: 'hiit',          name: 'HIIT Workout',      details: 'Hochintensives Intervalltraining für maximale Fettverbrennung und Ausdauer.',         icon: Zap,    color: '#f59e0b' },
				{ id: 'shadowboxing',  name: 'Schattenboxen',     details: 'Fokus auf Technik, Beinarbeit und Visualisierung des Gegners.',                       icon: User,   color: '#3b82f6' },
				{ id: 'bag',           name: 'Sandsack Training', details: 'Kraftentwicklung und Schlagschule am schweren Sandsack.',                             icon: Target, color: '#2ecc71' }
			]
		},
		en: {
			title: 'Choose your Workout',
			subtitle: 'Ready for the next session? Pick your mode.',
			addWorkout: 'Create custom workout',
			formTitle: 'New Workout',
			nameLabel: 'Name',
			namePlaceholder: 'e.g. Endurance',
			editTitle: 'Edit defaults',
			saveDefaults: 'Save as default',
			resetDefaults: 'Reset',
			roundsLabel: 'Rounds',
			workLabel: 'Work Time',
			restLabel: 'Rest Time',
			colorLabel: 'Color',
			save: 'Save',
			cancel: 'Cancel',
			workSuffix: 'Work',
			restSuffix: 'Rest',
			workouts: [
				{ id: 'sparring',      name: 'Sparring Session',   details: 'Simulation of real fight situations to improve timing and distance control.', icon: Sword,  color: '#e74c3c' },
				{ id: 'hiit',          name: 'HIIT Workout',       details: 'High-intensity interval training for maximum fat burning and endurance.',     icon: Zap,    color: '#f59e0b' },
				{ id: 'shadowboxing',  name: 'Shadow Boxing',      details: 'Focus on technique, footwork, and opponent visualization.',                  icon: User,   color: '#3b82f6' },
				{ id: 'bag',           name: 'Heavy Bag Training', details: 'Power development and punch technique on the heavy bag.',                   icon: Target, color: '#2ecc71' }
			]
		}
	};

	let currentT = $derived(t[$settings.language]);

	function formatTime(s) {
		return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
	}

	// Returns the effective config for a preset (saved override or original default)
	function getPresetCfg(id) {
		return $settings.presetDefaults?.[id] ?? PRESET_DEFAULTS[id];
	}

	function presetDescription(id) {
		const cfg = getPresetCfg(id);
		const lang = $settings.language;
		return lang === 'de'
			? `${cfg.rounds} Runden · ${formatTime(cfg.work)} Arbeit · ${formatTime(cfg.rest)} Pause`
			: `${cfg.rounds} Rounds · ${formatTime(cfg.work)} Work · ${formatTime(cfg.rest)} Rest`;
	}

	function hasCustomDefaults(id) {
		return !!$settings.presetDefaults?.[id];
	}

	// ── Preset edit ──────────────────────────────────────────────────
	let editingId  = $state(null);
	let editRounds = $state(0);
	let editWork   = $state(0);
	let editRest   = $state(0);

	function openEdit(e, id) {
		e.stopPropagation();
		if (editingId === id) { editingId = null; return; }
		const cfg = getPresetCfg(id);
		editRounds = cfg.rounds;
		editWork   = cfg.work;
		editRest   = cfg.rest;
		editingId  = id;
	}

	function closeEdit() { editingId = null; }

	function saveEdit() {
		settings.update(s => ({
			...s,
			presetDefaults: { ...(s.presetDefaults ?? {}), [editingId]: { rounds: editRounds, work: editWork, rest: editRest } }
		}));
		closeEdit();
	}

	function resetEdit(id) {
		settings.update(s => {
			const pd = { ...(s.presetDefaults ?? {}) };
			delete pd[id];
			return { ...s, presetDefaults: pd };
		});
		closeEdit();
	}

	// ── Custom workout form ──────────────────────────────────────────
	let showForm  = $state(false);
	let newName   = $state('');
	let newRounds = $state(5);
	let newWork   = $state(120);
	let newRest   = $state(30);
	let newColor  = $state(PRESET_COLORS[0]);

	function openForm() {
		newName = ''; newRounds = 5; newWork = 120; newRest = 30; newColor = PRESET_COLORS[0];
		showForm = true;
	}

	function closeForm() { showForm = false; }

	function saveCustomWorkout() {
		if (!newName.trim()) return;
		const w = {
			id: `custom-${Date.now()}`,
			name: newName.trim(),
			rounds: newRounds,
			workDuration: newWork,
			restDuration: newRest,
			color: newColor
		};
		settings.update(s => ({ ...s, customWorkouts: [...(s.customWorkouts || []), w] }));
		closeForm();
	}

	function deleteCustomWorkout(id) {
		settings.update(s => ({ ...s, customWorkouts: (s.customWorkouts || []).filter(w => w.id !== id) }));
	}

	function selectPreset(id) { goto(`/setup/${id}`); }

	function selectCustom(workout) {
		sessionStorage.setItem('customWorkoutBase', JSON.stringify(workout));
		goto('/setup/custom');
	}
</script>

<div class="menu-container">
	<header class="menu-header" in:fade={{ duration: 400 }}>
		<h1>{currentT.title}</h1>
		<p>{currentT.subtitle}</p>
	</header>

	<div class="workout-menu">
		<!-- Preset workouts -->
		{#each currentT.workouts as workout, i (workout.id)}
			<div
				class="menu-card"
				class:editing={editingId === workout.id}
				in:fly={{ y: 40, duration: 450, delay: i * 80 }}
			>
				<div class="card-glow" style="--card-color:{workout.color}"></div>
				<button class="card-content" onclick={() => selectPreset(workout.id)}>
					<div class="icon-section" style="background:{workout.color}18; color:{workout.color}">
						<workout.icon size={28} strokeWidth={2.5} />
					</div>
					<div class="info-section">
						<h3>{workout.name}</h3>
						<span class="preset-tag" class:tag-custom={hasCustomDefaults(workout.id)}>
							{presetDescription(workout.id)}
						</span>
						<p>{workout.details}</p>
					</div>
					<div class="action-section"><ChevronRight size={22} /></div>
				</button>
				<button
					class="btn-edit-preset"
					class:active={editingId === workout.id}
					onclick={(e) => openEdit(e, workout.id)}
					title={currentT.editTitle}
				>
					<Pencil size={13} />
				</button>
			</div>

			{#if editingId === workout.id}
				<div class="edit-panel" in:fly={{ y: -8, duration: 220 }} out:fly={{ y: -8, duration: 180 }}>
					<div class="form-header">
						<h3>{currentT.editTitle} — {workout.name}</h3>
						<button class="btn-close" onclick={closeEdit}><X size={18} /></button>
					</div>

					<div class="form-row">
						<div class="form-field">
							<label>{currentT.roundsLabel}</label>
							<div class="mini-stepper">
								<button onclick={() => editRounds = Math.max(1, editRounds - 1)}>−</button>
								<span>{editRounds}</span>
								<button onclick={() => editRounds = Math.min(20, editRounds + 1)}>+</button>
							</div>
						</div>
						<div class="form-field">
							<label>{currentT.workLabel}</label>
							<div class="mini-stepper">
								<button onclick={() => editWork = Math.max(15, editWork - 15)}>−</button>
								<span>{formatTime(editWork)}</span>
								<button onclick={() => editWork = Math.min(600, editWork + 15)}>+</button>
							</div>
						</div>
						<div class="form-field">
							<label>{currentT.restLabel}</label>
							<div class="mini-stepper">
								<button onclick={() => editRest = Math.max(5, editRest - 5)}>−</button>
								<span>{formatTime(editRest)}</span>
								<button onclick={() => editRest = Math.min(300, editRest + 5)}>+</button>
							</div>
						</div>
					</div>

					<div class="form-actions">
						<button class="btn-save" onclick={saveEdit}>{currentT.saveDefaults}</button>
						{#if hasCustomDefaults(workout.id)}
							<button class="btn-reset" onclick={() => resetEdit(workout.id)} title={currentT.resetDefaults}>
								<RotateCcw size={15} />
							</button>
						{/if}
						<button class="btn-cancel" onclick={closeEdit}>{currentT.cancel}</button>
					</div>
				</div>
			{/if}
		{/each}

		<!-- Custom workouts -->
		{#each ($settings.customWorkouts || []) as workout, i (workout.id)}
			<div
				class="menu-card custom-card"
				in:fly={{ y: 40, duration: 450, delay: (currentT.workouts.length + i) * 80 }}
			>
				<div class="card-glow" style="--card-color:{workout.color}"></div>
				<button class="card-content" onclick={() => selectCustom(workout)}>
					<div class="icon-section" style="background:{workout.color}18; color:{workout.color}">
						<Dumbbell size={28} strokeWidth={2.5} />
					</div>
					<div class="info-section">
						<h3>{workout.name}</h3>
						<span class="preset-tag">{workout.rounds} Runden · {formatTime(workout.workDuration)} / {formatTime(workout.restDuration)}</span>
					</div>
					<div class="action-section"><ChevronRight size={22} /></div>
				</button>
				<button class="btn-delete" onclick={() => deleteCustomWorkout(workout.id)} title="Löschen">
					<Trash2 size={16} />
				</button>
			</div>
		{/each}

		<!-- Add button -->
		{#if !showForm}
			<button class="btn-add" onclick={openForm} in:fade={{ duration: 300 }}>
				<Plus size={20} />
				{currentT.addWorkout}
			</button>
		{/if}

		<!-- Add form -->
		{#if showForm}
			<div class="add-form" in:fly={{ y: 30, duration: 350 }}>
				<div class="form-header">
					<h3>{currentT.formTitle}</h3>
					<button class="btn-close" onclick={closeForm}><X size={18} /></button>
				</div>

				<div class="form-field">
					<label>{currentT.nameLabel}</label>
					<input
						type="text"
						bind:value={newName}
						placeholder={currentT.namePlaceholder}
						class="form-input"
					/>
				</div>

				<div class="form-row">
					<div class="form-field">
						<label>{currentT.roundsLabel}</label>
						<div class="mini-stepper">
							<button onclick={() => newRounds = Math.max(1, newRounds - 1)}>−</button>
							<span>{newRounds}</span>
							<button onclick={() => newRounds = Math.min(20, newRounds + 1)}>+</button>
						</div>
					</div>
					<div class="form-field">
						<label>{currentT.workLabel}</label>
						<div class="mini-stepper">
							<button onclick={() => newWork = Math.max(15, newWork - 15)}>−</button>
							<span>{formatTime(newWork)}</span>
							<button onclick={() => newWork = Math.min(600, newWork + 15)}>+</button>
						</div>
					</div>
					<div class="form-field">
						<label>{currentT.restLabel}</label>
						<div class="mini-stepper">
							<button onclick={() => newRest = Math.max(5, newRest - 5)}>−</button>
							<span>{formatTime(newRest)}</span>
							<button onclick={() => newRest = Math.min(300, newRest + 5)}>+</button>
						</div>
					</div>
				</div>

				<div class="form-field">
					<label>{currentT.colorLabel}</label>
					<div class="color-picker">
						{#each PRESET_COLORS as color}
							<button
								class="color-swatch"
								class:selected={newColor === color}
								style="background:{color}"
								onclick={() => newColor = color}
							></button>
						{/each}
					</div>
				</div>

				<div class="form-actions">
					<button class="btn-save" onclick={saveCustomWorkout} disabled={!newName.trim()}>
						{currentT.save}
					</button>
					<button class="btn-cancel" onclick={closeForm}>{currentT.cancel}</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.menu-container {
		min-height: 100vh;
		padding: 60px 20px 100px;
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 40px;
	}

	.menu-header { text-align: center; }

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

	.menu-header p { color: #95a5a6; font-size: 18px; }

	/* ── Cards ── */
	.workout-menu {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.menu-card {
		background: #1a1f3a;
		border: 1px solid rgba(255,255,255,0.05);
		border-radius: 20px;
		text-align: left;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
		display: flex;
		color: white;
	}

	.menu-card:not(.custom-card) { padding: 0; position: relative; }

	.menu-card:hover { transform: scale(1.01) translateX(6px); background: #212845; border-color: rgba(255,255,255,0.09); }
	.menu-card:hover .card-glow { width: 6px; opacity: 1; }

	.custom-card {
		flex-direction: row;
		align-items: stretch;
		padding: 0;
	}

	.custom-card .card-content {
		flex: 1;
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		color: white;
		padding: 0;
	}

	.card-glow {
		position: absolute;
		top: 0; left: 0;
		width: 4px;
		height: 100%;
		background: var(--card-color);
		opacity: 0.6;
		transition: width 0.3s, opacity 0.3s;
		flex-shrink: 0;
	}

	.card-content {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 22px 22px 22px 26px;
		width: 100%;
		z-index: 1;
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		color: inherit;
	}

	.icon-section {
		width: 64px;
		height: 64px;
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.info-section { flex: 1; }

	.info-section h3 {
		font-size: 20px;
		font-weight: 800;
		margin-bottom: 4px;
	}

	.preset-tag {
		display: inline-block;
		font-size: 11px;
		font-weight: 700;
		color: rgba(255,255,255,0.55);
		background: rgba(255,255,255,0.07);
		padding: 3px 10px;
		border-radius: 50px;
		margin-bottom: 8px;
		text-transform: uppercase;
		letter-spacing: 0.4px;
	}

	.info-section p {
		font-size: 13px;
		color: #95a5a6;
		line-height: 1.5;
	}

	.action-section {
		color: rgba(255,255,255,0.2);
		transition: transform 0.3s, color 0.3s;
		flex-shrink: 0;
	}
	.menu-card:hover .action-section { transform: translateX(4px); color: white; }

	/* Pencil edit button (preset cards) */
	.btn-edit-preset {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 28px;
		height: 28px;
		background: rgba(255,255,255,0.06);
		border: 1px solid rgba(255,255,255,0.1);
		border-radius: 8px;
		color: rgba(255,255,255,0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		z-index: 2;
		flex-shrink: 0;
	}
	.btn-edit-preset:hover,
	.btn-edit-preset.active {
		background: rgba(46,204,113,0.15);
		border-color: rgba(46,204,113,0.4);
		color: #2ecc71;
	}

	/* Highlighted description when preset has saved custom defaults */
	.tag-custom {
		background: rgba(46,204,113,0.12) !important;
		color: rgba(46,204,113,0.85) !important;
	}

	/* Edit panel */
	.edit-panel {
		background: #131830;
		border: 1px solid rgba(46,204,113,0.2);
		border-top: none;
		border-radius: 0 0 20px 20px;
		padding: 22px 24px 24px;
		margin-top: -16px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.btn-reset {
		background: rgba(255,255,255,0.05);
		border: 1px solid rgba(255,255,255,0.1);
		color: rgba(255,255,255,0.4);
		width: 44px;
		height: 44px;
		border-radius: 12px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		flex-shrink: 0;
	}
	.btn-reset:hover { color: #e74c3c; border-color: rgba(231,76,60,0.3); background: rgba(231,76,60,0.08); }

	/* Delete button */
	.btn-delete {
		background: transparent;
		border: none;
		color: rgba(255,255,255,0.2);
		padding: 0 18px;
		cursor: pointer;
		display: flex;
		align-items: center;
		transition: color 0.2s;
		flex-shrink: 0;
		z-index: 1;
	}
	.btn-delete:hover { color: #e74c3c; }

	/* Add button */
	.btn-add {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		background: transparent;
		border: 1px dashed rgba(46,204,113,0.3);
		border-radius: 20px;
		padding: 20px;
		color: rgba(46,204,113,0.7);
		font-size: 15px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-add:hover { background: rgba(46,204,113,0.06); border-color: #2ecc71; color: #2ecc71; }

	/* ── Add Form ── */
	.add-form {
		background: #1a1f3a;
		border: 1px solid rgba(255,255,255,0.08);
		border-radius: 20px;
		padding: 28px;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.form-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.form-header h3 {
		font-size: 18px;
		font-weight: 800;
		color: #fff;
	}

	.btn-close {
		background: rgba(255,255,255,0.06);
		border: none;
		color: rgba(255,255,255,0.5);
		width: 32px;
		height: 32px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}
	.btn-close:hover { background: rgba(231,76,60,0.2); color: #e74c3c; }

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 10px;
		flex: 1;
	}

	.form-field label {
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		color: rgba(255,255,255,0.4);
	}

	.form-input {
		background: rgba(255,255,255,0.05);
		border: 1px solid rgba(255,255,255,0.1);
		border-radius: 12px;
		padding: 12px 16px;
		color: #fff;
		font-size: 16px;
		transition: border-color 0.2s;
		width: 100%;
	}
	.form-input:focus { outline: none; border-color: #2ecc71; }
	.form-input::placeholder { color: rgba(255,255,255,0.25); }

	.form-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}

	.mini-stepper {
		display: flex;
		align-items: center;
		background: rgba(255,255,255,0.05);
		border: 1px solid rgba(255,255,255,0.1);
		border-radius: 12px;
		overflow: hidden;
	}

	.mini-stepper button {
		background: transparent;
		border: none;
		color: rgba(255,255,255,0.6);
		font-size: 18px;
		font-weight: 700;
		width: 36px;
		height: 44px;
		cursor: pointer;
		transition: background 0.15s;
		flex-shrink: 0;
	}
	.mini-stepper button:hover { background: rgba(255,255,255,0.08); color: #fff; }

	.mini-stepper span {
		flex: 1;
		text-align: center;
		font-size: 14px;
		font-weight: 700;
		color: #fff;
		font-variant-numeric: tabular-nums;
	}

	.color-picker {
		display: flex;
		gap: 10px;
	}

	.color-swatch {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 2px solid transparent;
		cursor: pointer;
		transition: transform 0.15s, border-color 0.15s;
	}
	.color-swatch:hover   { transform: scale(1.15); }
	.color-swatch.selected { border-color: #fff; transform: scale(1.15); }

	.form-actions {
		display: flex;
		gap: 12px;
	}

	.btn-save {
		flex: 1;
		background: #2ecc71;
		color: #000;
		border: none;
		border-radius: 12px;
		padding: 14px;
		font-size: 15px;
		font-weight: 800;
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(46,204,113,0.25); }
	.btn-save:disabled { opacity: 0.35; cursor: not-allowed; }

	.btn-cancel {
		background: rgba(255,255,255,0.05);
		color: rgba(255,255,255,0.5);
		border: 1px solid rgba(255,255,255,0.1);
		border-radius: 12px;
		padding: 14px 24px;
		font-size: 14px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-cancel:hover { color: #fff; background: rgba(255,255,255,0.08); }

	@media (max-width: 600px) {
		.menu-header h1 { font-size: 32px; }
		.form-row { grid-template-columns: 1fr; }
		.icon-section { width: 52px; height: 52px; }
		.info-section h3 { font-size: 17px; }
	}
</style>
