<script>
	import { page } from '$app/stores';
	import { LayoutGrid, History, Settings, Dumbbell } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import { settings } from '$lib/settingsStore';
	import logo from '$lib/assets/FF_Logo.png';

	let isWorkoutMode = $derived($page.url.pathname === '/workout');

	const t = {
		de: { dashboard: 'Dashboard', workouts: 'Workouts', history: 'Historie', settings: 'Settings' },
		en: { dashboard: 'Dashboard', workouts: 'Workouts', history: 'History', settings: 'Settings' }
	};

	let labels = $derived(t[$settings.language]);

	const navItems = $derived([
		{ name: labels.dashboard, path: '/dashboard', icon: LayoutGrid },
		{ name: labels.workouts, path: '/workouts', icon: Dumbbell },
		{ name: labels.history, path: '/history', icon: History },
		{ name: labels.settings, path: '/settings', icon: Settings }
	]);
</script>

{#if !isWorkoutMode}
	<nav class="nav-container" transition:fade={{ duration: 200 }}>
		<div class="desktop-nav">
			<div class="logo">
				<img src={logo} alt="FocusFighter Logo" class="logo-img" />
				<span class="logo-text">FocusFighter</span>
			</div>
			<div class="nav-links">
				{#each navItems as item}
					<a
						href={item.path}
						class="nav-item"
						class:active={$page.url.pathname === item.path}
					>
						<item.icon size={20} />
						<span>{item.name}</span>
					</a>
				{/each}
			</div>
		</div>

		<div class="mobile-nav">
			{#each navItems as item}
				<a
					href={item.path}
					class="mobile-item"
					class:active={$page.url.pathname === item.path}
				>
					<div class="icon-wrapper">
						<item.icon size={24} />
					</div>
					<span class="mobile-label">{item.name}</span>
				</a>
			{/each}
		</div>
	</nav>
{/if}

<style>
	.nav-container {
		position: fixed;
		z-index: 9999;
		pointer-events: auto;
	}

	@media (min-width: 769px) {
		.nav-container {
			top: 0;
			left: 0;
			height: 100vh;
			width: 240px;
			background: var(--nav-bg);
			backdrop-filter: blur(12px);
			-webkit-backdrop-filter: blur(12px);
			border-right: 1px solid var(--nav-border);
			display: flex;
			flex-direction: column;
			padding: 40px 20px;
		}

		.mobile-nav { display: none; }

		.logo {
			display: flex;
			align-items: center;
			gap: 12px;
			margin-bottom: 60px;
			padding-left: 10px;
		}

		.logo-img {
			width: 32px;
			height: 32px;
			object-fit: cover;
			border-radius: 6px;
		}

		.logo-text {
			font-size: 20px;
			font-weight: 800;
			letter-spacing: -0.5px;
			color: var(--text-light);
		}

		.nav-links {
			display: flex;
			flex-direction: column;
			gap: 8px;
		}

		.nav-item {
			display: flex;
			align-items: center;
			gap: 16px;
			padding: 14px 20px;
			border-radius: 12px;
			color: var(--text-muted);
			text-decoration: none;
			font-weight: 600;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		}

		.nav-item:hover {
			color: var(--text-light);
			background: rgba(255, 255, 255, 0.05);
		}

		.nav-item.active {
			color: var(--primary-green);
			background: rgba(46, 204, 113, 0.1);
			box-shadow: inset 0 0 0 1px rgba(46, 204, 113, 0.2);
		}
	}

	@media (max-width: 768px) {
		.desktop-nav { display: none; }

		.nav-container {
			bottom: 20px;
			left: 50%;
			transform: translateX(-50%);
			width: calc(100% - 40px);
			max-width: 400px;
			height: 72px;
			background: var(--nav-bg);
			backdrop-filter: blur(20px);
			-webkit-backdrop-filter: blur(20px);
			border: 1px solid var(--nav-border);
			border-radius: 24px;
			box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
		}

		.mobile-nav {
			display: flex;
			height: 100%;
			align-items: center;
			justify-content: space-around;
			padding: 0 10px;
		}

		.mobile-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 4px;
			text-decoration: none;
			color: var(--text-muted);
			transition: all 0.3s ease;
			flex: 1;
		}

		.icon-wrapper {
			width: 40px;
			height: 40px;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 12px;
			transition: all 0.3s ease;
		}

		.mobile-label {
			font-size: 10px;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}

		.mobile-item.active {
			color: var(--primary-green);
		}

		.mobile-item.active .icon-wrapper {
			background: rgba(46, 204, 113, 0.15);
			box-shadow: 0 0 15px rgba(46, 204, 113, 0.4);
		}
	}
</style>
