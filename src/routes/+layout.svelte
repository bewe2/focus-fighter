<script>
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';
	import { page } from '$app/stores';
	import { settings } from '$lib/settingsStore';

	let { children } = $props();

	// Check if we are in workout mode to remove layout padding
	let isWorkoutMode = $derived($page.url.pathname === '/workout');
	let isLoginPage = $derived($page.url.pathname === '/login');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content={$settings.theme === 'dark' ? '#0a0e27' : '#f4f7f6'} />
</svelte:head>

<div class="app-shell" class:isWorkoutMode class:isLoginPage class:light-theme={$settings.theme === 'light'}>
	{#if !isLoginPage}
		<Navbar />
	{/if}

	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	:global(:root) {
		--primary-green: #2ecc71;
		--bg-dark: #0a0e27;
		--bg-darker: #050810;
		--text-light: #ecf0f1;
		--text-muted: #95a5a6;
		--card-bg: #1a1f3a;
		--nav-bg: rgba(18, 18, 18, 0.8);
		--nav-border: rgba(255, 255, 255, 0.1);
		--glass-bg: rgba(255, 255, 255, 0.03);
		--glass-border: rgba(255, 255, 255, 0.07);
		--input-bg: rgba(255, 255, 255, 0.05);
		--input-border: rgba(255, 255, 255, 0.1);
		--overlay-btn: rgba(255, 255, 255, 0.1);
	}

	/* Light theme — applied to <html> by settingsStore */
	:global(html.light-theme) {
		--bg-dark: #f0ede8;
		--bg-darker: #e8e4de;
		--text-light: #1c1c2e;
		--text-muted: #6b7280;
		--card-bg: #faf8f5;
		--nav-bg: rgba(240, 237, 232, 0.96);
		--nav-border: rgba(0, 0, 0, 0.09);
		--glass-bg: rgba(250, 248, 245, 0.9);
		--glass-border: rgba(0, 0, 0, 0.08);
		--input-bg: rgba(0, 0, 0, 0.05);
		--input-border: rgba(0, 0, 0, 0.13);
		--overlay-btn: rgba(0, 0, 0, 0.08);
	}

	/* ── Global light-theme overrides ── */

	/* Alle Karten & Glass-Elemente */
	:global(html.light-theme .glass),
	:global(html.light-theme .session-card),
	:global(html.light-theme .history-card),
	:global(html.light-theme .stat-card) {
		background: var(--glass-bg) !important;
		border-color: var(--glass-border) !important;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
	}

	:global(html.light-theme .session-card:hover) {
		background: #fff !important;
	}

	/* Dashboard: Stat-Werte und Labels */
	:global(html.light-theme .stat-value) {
		color: var(--text-light) !important;
	}

	:global(html.light-theme .stat-value small),
	:global(html.light-theme .stat-label),
	:global(html.light-theme .reset-info),
	:global(html.light-theme .dashboard-header p),
	:global(html.light-theme .history-meta),
	:global(html.light-theme .history-date),
	:global(html.light-theme .history-notes),
	:global(html.light-theme .session-time),
	:global(html.light-theme .meta),
	:global(html.light-theme .page-header p) {
		color: var(--text-muted) !important;
	}

	:global(html.light-theme .dashboard-header h1),
	:global(html.light-theme .page-header h1),
	:global(html.light-theme .type-name),
	:global(html.light-theme .session-header h3),
	:global(html.light-theme .btn-workout),
	:global(html.light-theme .btn-label),
	:global(html.light-theme .matchup) {
		color: var(--text-light) !important;
	}

	/* Dashboard: leerer Zustand */
	:global(html.light-theme .empty-state) {
		background: var(--glass-bg) !important;
		border-color: var(--glass-border) !important;
	}

	:global(html.light-theme .empty-state h2) {
		color: var(--text-light) !important;
	}

	:global(html.light-theme .empty-state p) {
		color: var(--text-muted) !important;
	}

	/* Quick-Action Button */
	:global(html.light-theme .btn-repeat) {
		background: var(--glass-bg) !important;
		border-color: rgba(46, 204, 113, 0.3) !important;
		color: var(--text-light) !important;
	}

	/* Workout-Auswahl-Karten */
	:global(html.light-theme .menu-card) {
		background: var(--card-bg) !important;
		border-color: var(--glass-border) !important;
		color: var(--text-light) !important;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
	}

	:global(html.light-theme .menu-card:hover) {
		background: #fff !important;
	}

	:global(html.light-theme .info-section h3) {
		color: var(--text-light) !important;
	}

	:global(html.light-theme .info-section p) {
		color: var(--text-muted) !important;
	}

	:global(html.light-theme .preset-tag) {
		background: rgba(0, 0, 0, 0.07) !important;
		color: var(--text-muted) !important;
	}

	:global(html.light-theme .menu-header p) {
		color: var(--text-muted) !important;
	}

	:global(html.light-theme .menu-header h1) {
		background: linear-gradient(to bottom, #1c1c2e, #6b7280) !important;
		-webkit-background-clip: text !important;
		-webkit-text-fill-color: transparent !important;
	}

	/* Setup-Seite */
	:global(html.light-theme .setup-container) {
		background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-darker) 100%) !important;
	}

	:global(html.light-theme .setup-header p) {
		color: var(--text-muted) !important;
	}

	:global(html.light-theme .control-group) {
		background: var(--input-bg) !important;
		border-color: var(--input-border) !important;
	}

	:global(html.light-theme .fighter-input) {
		background: var(--input-bg) !important;
		border-color: var(--input-border) !important;
		color: var(--text-light) !important;
	}

	:global(html.light-theme .fighter-input::placeholder) {
		color: var(--text-muted) !important;
	}

	:global(html.light-theme .display-value),
	:global(html.light-theme .config-block label) {
		color: var(--text-light) !important;
	}

	:global(html.light-theme .btn-nav) {
		background: var(--overlay-btn) !important;
		color: var(--text-muted) !important;
	}

	:global(html.light-theme .btn-nav:hover) {
		background: rgba(0, 0, 0, 0.14) !important;
		color: var(--text-light) !important;
	}

	/* History-Seite */
	:global(html.light-theme .sessions-list) {
		border-left-color: rgba(0, 0, 0, 0.1) !important;
	}

	:global(html.light-theme .header-icon) {
		background: rgba(46, 204, 113, 0.12) !important;
	}

	:global(html.light-theme .notes-box) {
		border-top-color: var(--glass-border) !important;
	}

	/* Navbar Desktop */
	:global(html.light-theme .nav-item:hover) {
		background: rgba(0, 0, 0, 0.05) !important;
		color: var(--text-light) !important;
	}

	:global(html.light-theme .logo-text) {
		color: var(--text-light) !important;
	}

	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		background-color: var(--bg-darker);
		color: var(--text-light);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
			Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		transition: background-color 0.3s ease, color 0.3s ease;
		overflow-x: hidden;
	}

	:global(html) {
		scroll-behavior: smooth;
	}

	.app-shell {
		display: flex;
		width: 100%;
		min-height: 100vh;
	}

	.main-content {
		flex: 1;
		width: 100%;
		min-height: 100vh;
	}

	/* Desktop adjustment for Sidebar */
	@media (min-width: 769px) {
		.app-shell:not(.isWorkoutMode):not(.isLoginPage) .main-content {
			margin-left: 240px;
		}
	}

	/* Mobile adjustment for Bottom Bar */
	@media (max-width: 768px) {
		.app-shell:not(.isWorkoutMode):not(.isLoginPage) .main-content {
			padding-bottom: 100px;
		}
	}
</style>
