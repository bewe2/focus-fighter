<script>
	import { enhance } from '$app/forms';
	import { settings } from '$lib/settingsStore';

	let { form } = $props();

	let mode = $state('login');
	$effect(() => { if (form?.mode) mode = form.mode; });

	const t = {
		de: {
			loginTitle: 'Willkommen zurück',
			registerTitle: 'Account erstellen',
			loginSubtitle: 'Melde dich an, um dein Training fortzusetzen',
			registerSubtitle: 'Erstelle deinen Account, um dein Training zu speichern',
			name: 'Name',
			email: 'E-Mail Adresse',
			password: 'Passwort',
			confirmPassword: 'Passwort bestätigen',
			login: 'Anmelden',
			register: 'Account erstellen',
			switchToRegister: 'Noch kein Account? Registrieren',
			switchToLogin: 'Bereits registriert? Anmelden',
			errors: {
				invalid_credentials: 'E-Mail oder Passwort falsch',
				email_taken: 'Diese E-Mail ist bereits registriert',
				passwords_mismatch: 'Passwörter stimmen nicht überein',
				password_too_short: 'Passwort muss mindestens 8 Zeichen haben',
				missing_fields: 'Bitte alle Felder ausfüllen'
			}
		},
		en: {
			loginTitle: 'Welcome back',
			registerTitle: 'Create account',
			loginSubtitle: 'Sign in to continue your training',
			registerSubtitle: 'Create your account to save your workouts',
			name: 'Name',
			email: 'Email Address',
			password: 'Password',
			confirmPassword: 'Confirm Password',
			login: 'Sign In',
			register: 'Create Account',
			switchToRegister: "Don't have an account? Register",
			switchToLogin: 'Already registered? Sign in',
			errors: {
				invalid_credentials: 'Invalid email or password',
				email_taken: 'This email is already registered',
				passwords_mismatch: 'Passwords do not match',
				password_too_short: 'Password must be at least 8 characters',
				missing_fields: 'Please fill in all fields'
			}
		}
	};

	let currentT = $derived(t[$settings.language]);
	let errorMsg = $derived(form?.error ? currentT.errors[form.error] ?? form.error : null);
</script>

<div class="login-page">
	<div class="login-container">
		<header class="header">
			<div class="logo">FF</div>
			<h1>{mode === 'login' ? currentT.loginTitle : currentT.registerTitle}</h1>
			<p>{mode === 'login' ? currentT.loginSubtitle : currentT.registerSubtitle}</p>
		</header>

		<form method="POST" use:enhance class="login-form">
			<input type="hidden" name="action" value={mode} />

			{#if mode === 'register'}
				<div class="input-group">
					<label for="name">{currentT.name}</label>
					<input
						type="text"
						id="name"
						name="name"
						placeholder="Max Mustermann"
						value={form?.name ?? ''}
						required
					/>
				</div>
			{/if}

			<div class="input-group">
				<label for="email">{currentT.email}</label>
				<input
					type="email"
					id="email"
					name="email"
					placeholder="trainer@focusfighter.de"
					value={form?.email ?? ''}
					required
				/>
			</div>

			<div class="input-group">
				<label for="password">{currentT.password}</label>
				<input type="password" id="password" name="password" placeholder="••••••••" required />
			</div>

			{#if mode === 'register'}
				<div class="input-group">
					<label for="confirmPassword">{currentT.confirmPassword}</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						placeholder="••••••••"
						required
					/>
				</div>
			{/if}

			{#if errorMsg}
				<p class="error-msg">{errorMsg}</p>
			{/if}

			<div class="actions">
				<button type="submit" class="primary-btn">
					{mode === 'login' ? currentT.login : currentT.register}
				</button>
				<button
					type="button"
					class="switch-btn"
					onclick={() => (mode = mode === 'login' ? 'register' : 'login')}
				>
					{mode === 'login' ? currentT.switchToRegister : currentT.switchToLogin}
				</button>
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
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
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

	h1 {
		font-size: 28px;
		color: #fff;
		margin-bottom: 8px;
	}
	p {
		color: #95a5a6;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	label {
		color: #fff;
		font-weight: 600;
		font-size: 14px;
	}

	input {
		background: #0a0e27;
		border: 1px solid rgba(255, 255, 255, 0.1);
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
		background: rgba(231, 76, 60, 0.1);
		border-radius: 8px;
		padding: 10px;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-top: 8px;
	}

	.primary-btn {
		background: #2ecc71;
		color: #000;
		border: none;
		border-radius: 12px;
		padding: 16px;
		font-size: 16px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.primary-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
	}

	.primary-btn:active {
		transform: scale(0.98);
	}

	.switch-btn {
		background: transparent;
		color: #95a5a6;
		border: none;
		padding: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: color 0.2s ease;
	}

	.switch-btn:hover {
		color: #fff;
	}
</style>
