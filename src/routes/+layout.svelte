<script>
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';
	import { page } from '$app/stores';
	import { settings } from '$lib/settingsStore';

	let { children } = $props();

	// Check if we are in workout mode to remove layout padding
	let isWorkoutMode = $derived($page.url.pathname === '/workout');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content={$settings.theme === 'dark' ? '#0a0e27' : '#f4f7f6'} />
</svelte:head>

<div class="app-shell" class:isWorkoutMode class:light-theme={$settings.theme === 'light'}>
	<Navbar />

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
	}

	:global(.light-theme) {
		--bg-dark: #f4f7f6;
		--bg-darker: #e9ecef;
		--text-light: #2c3e50;
		--text-muted: #7f8c8d;
		--card-bg: #ffffff;
		--nav-bg: rgba(255, 255, 255, 0.9);
		--nav-border: rgba(0, 0, 0, 0.1);
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
		.app-shell:not(.isWorkoutMode) .main-content {
			margin-left: 240px;
		}
	}

	/* Mobile adjustment for Bottom Bar */
	@media (max-width: 768px) {
		.app-shell:not(.isWorkoutMode) .main-content {
			padding-bottom: 100px;
		}
	}
</style>
