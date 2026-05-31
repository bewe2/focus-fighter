import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Default values
const defaultSettings = {
	theme: 'dark',
	language: 'de',
	weeklyGoal: 5,
	voiceControl: false,
	voiceStopCommand: '',
	voiceGoCommand: '',
	customWorkouts: []
};

// Initialize from localStorage if available
const initialSettings = browser 
	? JSON.parse(localStorage.getItem('user-settings') || JSON.stringify(defaultSettings))
	: defaultSettings;

export const settings = writable(initialSettings);

// Subscribe to changes and save to localStorage
if (browser) {
	settings.subscribe((value) => {
		localStorage.setItem('user-settings', JSON.stringify(value));
		
		// Update document theme
		if (value.theme === 'light') {
			document.documentElement.classList.add('light-theme');
		} else {
			document.documentElement.classList.remove('light-theme');
		}
		
		// Update document language
		document.documentElement.lang = value.language;
	});
}
