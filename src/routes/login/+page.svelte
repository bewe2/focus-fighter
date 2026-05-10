<script>
	import { enhance } from '$app/forms';
	import { settings } from '$lib/settingsStore';

	let { form } = $props();

	const t = {
		de: {
			title: 'Trainer Login',
			subtitle: 'Melde dich an, um dein Training zu starten',
			email: 'E-Mail Adresse',
			password: 'Passwort',
			login: 'Anmelden',
			register: 'Registrieren (Beta)',
			error: 'Ungültige Anmeldedaten',
			quick: 'Schnell-Login (Test)'
		},
		en: {
			title: 'Trainer Login',
			subtitle: 'Sign in to start your workout',
			email: 'Email Address',
			password: 'Password',
			login: 'Login',
			register: 'Register (Beta)',
			error: 'Invalid credentials',
			quick: 'Quick Login (Test)'
		}
	};

	let currentT = $derived(t[$settings.language]);
</script>

<div class="login-page">
	<div class="login-container">
		<header class="header">
			<div class="logo">FF</div>
			<h1>{currentT.title}</h1>
			<p>{currentT.subtitle}</p>
		</header>

		<form method="POST" use:enhance class="login-form">
			<div class="input-group">
				<label for="email">{currentT.email}</label>
				<input type="email" id="email" name="email" placeholder="trainer@focusfighter.de" />
			</div>

			<div class="input-group">
				<label for="password">{currentT.password}</label>
				<input type="password" id="password" name="password" placeholder="••••••••" />
			</div>

			{#if form?.error}
				<p class="error-msg">{currentT.error}</p>
			{/if}

			<div class="actions">
				<button type="submit" name="action" value="test-login" class="test-btn">
					{currentT.quick}
				</button>
				<button type="submit" name="action" value="login" class="primary-btn">{currentT.login}</button>
				<button type="submit" name="action" value="register" class="secondary-btn">{currentT.register}</button>
			</div>
		</form>
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		background: #050810;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}

	.login-container {
		width: 100%;
		max-width: 440px;
		background: #1a1f3a;
		border-radius: 32px;
		padding: 40px;
		box-shadow: 0 20px 50px rgba(0,0,0,0.5);
	}

	.header {
		text-align: center;
		margin-bottom: 40px;
	}

	.logo {
		width: 60px;
		height: 60px;
		background: #2ecc71;
		color: #000;
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		font-weight: 900;
		margin: 0 auto 20px;
	}

	h1 { font-size: 28px; color: #fff; margin-bottom: 8px; }
	p { color: #95a5a6; }

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	label { color: #fff; font-weight: 600; font-size: 14px; }

	input {
		background: #0a0e27;
		border: 1px solid rgba(255,255,255,0.1);
		border-radius: 12px;
		padding: 14px 16px;
		color: #fff;
		font-size: 16px;
		transition: all 0.2s ease;
	}

	input:focus {
		outline: none;
		border-color: #2ecc71;
		box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.1);
	}

	.error-msg {
		color: #e74c3c;
		font-size: 14px;
		font-weight: 600;
		text-align: center;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-top: 8px;
	}

	.primary-btn {
		background: transparent;
		color: #fff;
		border: 1px solid rgba(255,255,255,0.1);
		border-radius: 12px;
		padding: 14px;
		font-size: 16px;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	.test-btn {
		background: #2ecc71;
		color: #000;
		border: none;
		border-radius: 12px;
		padding: 14px;
		font-size: 16px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.test-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
	}

	.primary-btn:active, .test-btn:active { transform: scale(0.98); }

	.secondary-btn {
		background: transparent;
		color: #95a5a6;
		border: none;
		padding: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
	}
</style>
