import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NavController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { ToastController } from 'ionic-angular';
import { AuthService } from '../../services/auth.service';
import { SignupPage } from '../signup/signup';
import { Global } from '../../services/global';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Platform } from 'ionic-angular';
import firebase from 'firebase/app';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
	loginForm: FormGroup;
	loginError: string;

	constructor(
		private navCtrl: NavController,
		private auth: AuthService,
		private toastCtrl: ToastController,
		private splashScreen: SplashScreen,
		private fb: FormBuilder,
		private global: Global,
		private platform: Platform, 
	) {
		this.loginForm = fb.group({
			email: ['', Validators.compose([Validators.required, Validators.email])],
			password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
		});
		var self = this;
		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				if (global.registeredNewUser){
					global.registeredNewUser = false;
					user.sendEmailVerification();
				}
				//FIXME this is ignored at the moment
				if(!platform.is('core') && !platform.is('mobileweb')) {
					//self.splashScreen.show();
					setTimeout(self.splashScreen.hide, 500);
				}
				navCtrl.setRoot(HomePage);
			} 
		});
	}
			
	login() {
		let data = this.loginForm.value;

		if (!data.email || !data.password) {
			this.toastCtrl.create({
				message: 'Please enter mail adress and password.',
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
	
	signup(){
	  this.navCtrl.push(SignupPage);
	}

}