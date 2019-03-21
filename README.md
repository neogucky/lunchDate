# lunchDate
An App to find a time and location to go to lunch with your colleagues 

This is currently in a pre-development phase. The aim of this project is to help coworkers to find a date to go to lunch together. I intend the app to offer tinder-like cards with meals from nearby restaurants in order to find a location that will offer a satisfying choice to all participants of the dinner. 

Planed stages:

0. Startup ionic project 
1. Offer the possibility to anyone using the app to ask all others to go at a choosen time 
2. Enable push notifications for lunch dates 
3. Adding groups / group admins to manage different groups to use the app *(current stage)*
4. 3. Show meals from hard coded cantines near my current work location at the University of Lübeck (since I do this app primarily for me and my coworkers)
5. Finding generic solution to allow other groups to add their own cantines / restaurants 


How import project:

1. install npm, node and ionic
2. clone this repository
3. add config.ts with secret keys:
export let api: any = {
	SERVER_URL: 'http://localhost:5000/',
	countriesApi: 'https://restcountries.eu/rest/v2/all'
}


export const firebaseConfig = {
	fire: {
	apiKey: "ADD_API_KEY_HERE",
    authDomain: "ADD_AUTH_DOMAIN",
    databaseURL: "ADD_DATABASE_URL",
    projectId: "ADD_PROJECT_ID",
    storageBucket: "ADD_STORAGE_BUCKET",
    messagingSenderId: "ADD_MNESSING_ID"
	}
};
