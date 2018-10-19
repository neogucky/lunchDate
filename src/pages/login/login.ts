import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NavController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { ToastController } from 'ionic-angular';
import { AuthService } from '../../services/auth.service';
import { SignupPage } from '../signup/signup';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Platform } from 'ionic-angular';
import firebase from 'firebase/app';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
	loginForm: FormGroup;
	loginError: string;
    staySignedin: boolean;
	hiddenCounter: number = 0;
	username: string;
	password: string;

	constructor(
		private navCtrl: NavController,
		private auth: AuthService,
		private toastCtrl: ToastController,
		private splashScreen: SplashScreen,
		private fb: FormBuilder,
		private platform: Platform,
        private storage: Storage
	) {
		this.loginForm = fb.group({
			email: ['', Validators.compose([Validators.required, Validators.email])],
			password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
		});
		var self = this;

	}
	
    ionViewDidLoad() {	
		this.storage.get('username').then( (username) => {
			this.username = username;
		});
		
		//this will be set false if set false in storage
		this.staySignedin = true;
		let self = this;
		this.storage.get('staySignedin').then( (staySignedin) => {
			if (staySignedin !== false){

				const unsubscribe = firebase.auth().onAuthStateChanged(function(user) {
					if (user) {
						self.navCtrl.setRoot(HomePage);
					} 
					unsubscribe();
				});		
			} else {
				this.staySignedin = false;
			}
		});
	}
	
	login() {
		let data = this.loginForm.value;

		//store username
		this.storage.set('username', data.email);
		
		if (!data.email || !data.password) {
			this.toastCtrl.create({
				message: 'Please enter mail address and password.',
				duration: 3000,
				position: 'bottom'
			}).present();
			return;
		}

		let credentials = {
			email: data.email,
			password: data.password
		};
		this.auth.signInWithEmail(credentials)
			.then(
				() => this.navCtrl.setRoot(HomePage),
				error => this.loginError = error.message
			);
	}
	
	signup() {
	  this.navCtrl.push(SignupPage);
	}
    
    onStaySignedin() {
        this.storage.set('staySignedin', this.staySignedin);
    }
	
	hiddenLogin() {
		if (this.hiddenCounter++ == 5){
			this.toastCtrl.create({
				message: 'Developer login enabled',
				duration: 1000,
				position: 'bottom'
			}).present();
			this.username = "neo_gucky@gmx.de";
			this.password = "testtest";
		}
	}

}