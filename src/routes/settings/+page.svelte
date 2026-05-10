<script>
	import { settings } from '$lib/settingsStore';
	import { Sun, Moon, Languages } from 'lucide-svelte';
	import { enhance } from '$app/forms';

	const t = {
		de: {
			title: 'Einstellungen',
			subtitle: 'Personalisiere dein Trainingserlebnis',
			profile: 'Profil & Präferenzen',
			system: 'System',
			comingSoon: 'Demnächst verfügbar',
			theme: 'Erscheinungsbild',
			language: 'Sprache',
			dark: 'Dunkel',
			light: 'Hell',
			german: 'Deutsch',
			english: 'Englisch',
			logout: 'Abmelden'
		},
		en: {
			title: 'Settings',
			subtitle: 'Personalize your workout experience',
			profile: 'Profile & Preferences',
			system: 'System',
			comingSoon: 'Coming Soon',
			theme: 'Appearance',
			language: 'Language',
			dark: 'Dark',
			light: 'Light',
			german: 'German',
			english: 'English',
			logout: 'Logout'
		}
	};

	let currentT = $derived(t[$settings.language]);

	function toggleTheme() {
		settings.update(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
	}

	function setLanguage(lang) {
		settings.update(s => ({ ...s, language: lang }));
	}
</script>

<div class="settings-page">
	<header class="header">
		<h1>{currentT.title}</h1>
		<p class="subtitle">{currentT.subtitle}</p>
	</header>

	<main class="content-area">
		<section class="settings-section">
			<h2>{currentT.system}</h2>
			<div class="settings-card">
				<div class="setting-item">
					<div class="setting-info">
						<div class="icon-wrapper">
							{#if $settings.theme === 'dark'}
								<Moon size={20} />
							{:else}
								<Sun size={20} />
							{/if}
						</div>
						<span>{currentT.theme}</span>
					</div>
					<button class="toggle-btn" onclick={toggleTheme}>
						<div class="toggle-slider" class:active={$settings.theme === 'light'}></div>
						<span class="toggle-label">{$settings.theme === 'dark' ? currentT.dark : currentT.light}</span>
					</button>
				</div>

				<div class="setting-item">
					<div class="setting-info">
						<div class="icon-wrapper">
							<Languages size={20} />
						</div>
						<span>{currentT.language}</span>
					</div>
					<div class="select-group">
						<button 
							class="select-btn" 
							class:active={$settings.language === 'de'} 
							onclick={() => setLanguage('de')}
						>
							DE
						</button>
						<button 
							class="select-btn" 
							class:active={$settings.language === 'en'} 
							onclick={() => setLanguage('en')}
						>
							EN
						</button>
					</div>
				</div>
			</div>
		</section>

		<section class="settings-section">
			<h2>{currentT.profile}</h2>
			<div class="settings-card">
				<div class="placeholder-content">
					<div class="coming-soon">{currentT.comingSoon}</div>
				</div>
			</div>
		</section>

		<form method="POST" action="?/logout" use:enhance class="logout-section">
			<button type="submit" class="logout-btn">
				{currentT.logout}
			</button>
		</form>
	</main>
</div>

<style>
	.settings-page {
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
		max-width: 800px;
		margin: 0 auto;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 40px;
		flex: 1;
	}

	h2 {
		font-size: 20px;
		font-weight: 700;
		margin-bottom: 20px;
		color: var(--text-light);
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.settings-card {
		background: var(--card-bg);
		border: 1px solid var(--nav-border);
		border-radius: 24px;
		padding: 8px;
		display: flex;
		flex-direction: column;
	}

	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		border-bottom: 1px solid var(--nav-border);
	}

	.setting-item:last-child {
		border-bottom: none;
	}

	.setting-info {
		display: flex;
		align-items: center;
		gap: 16px;
		font-weight: 600;
		color: var(--text-light);
	}

	.icon-wrapper {
		width: 40px;
		height: 40px;
		background: rgba(46, 204, 113, 0.1);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--primary-green);
	}

	/* Toggle Switch */
	.toggle-btn {
		background: var(--bg-darker);
		border: 1px solid var(--nav-border);
		padding: 6px 16px;
		border-radius: 30px;
		display: flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.toggle-slider {
		width: 20px;
		height: 20px;
		background: var(--primary-green);
		border-radius: 50%;
		transition: transform 0.3s ease;
	}

	.toggle-slider.active {
		transform: translateX(0); /* Simplified for this style */
	}

	.toggle-label {
		font-size: 14px;
		font-weight: 700;
		color: var(--text-muted);
	}

	/* Select Group */
	.select-group {
		display: flex;
		background: var(--bg-darker);
		padding: 4px;
		border-radius: 14px;
		border: 1px solid var(--nav-border);
	}

	.select-btn {
		padding: 8px 16px;
		border: none;
		background: transparent;
		color: var(--text-muted);
		font-weight: 700;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.select-btn.active {
		background: var(--primary-green);
		color: #000;
	}

	.placeholder-content {
		padding: 40px;
		text-align: center;
	}

	.coming-soon {
		color: var(--text-muted);
		font-weight: 600;
		text-transform: uppercase;
		font-size: 12px;
		letter-spacing: 2px;
	}

	.logout-section {
		margin-top: 20px;
		display: flex;
		justify-content: center;
	}

	.logout-btn {
		background: rgba(231, 76, 60, 0.1);
		color: #e74c3c;
		border: 1px solid rgba(231, 76, 60, 0.2);
		padding: 14px 40px;
		border-radius: 16px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		max-width: 400px;
	}

	.logout-btn:hover {
		background: #e74c3c;
		color: #fff;
	}

	@media (max-width: 600px) {
		.header h1 { font-size: 42px; }
		.setting-item { padding: 16px; }
	}
</style>
