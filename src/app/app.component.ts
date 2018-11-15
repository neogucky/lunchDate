import { Component } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { AuthService } from '../services/auth.service';
import { Network } from '@ionic-native/network';

import { Global } from '../services/global';

import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  	rootPage:any = LoginPage;
	noInternetAlert:any;

  constructor( private platform: Platform,
				private statusBar: StatusBar,
				private splashScreen: SplashScreen,
			   	private network: Network,
			   	public alertCtrl: AlertController,
			   	private auth: AuthService,
				public global: Global) {
    platform.ready().then(() => {
		// Okay, so the platform is ready and our plugins are available.
		// Here you can do any higher level native things you might need.
		statusBar.styleDefault();
		let self = this;
		if(platform.is('core') || platform.is('mobileweb')) {
			console.log("Platform is core or is mobile web");
		} else {

			/*
			 * prevent users using the app without internet (not because we hate them but because it will not work)
			*/
			global.offline = false;
			// watch network for a disconnect
			let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
				console.log('internet lost');
				self.global.offline = true;
				self.showInternetWarning();
			});

			// watch network for a connection
			let connectSubscription = self.network.onConnect().subscribe(() => {
				if (self.global.offline){
					//dismiss dialog
					self.global.offline = false;
					console.log('internet reclaimed');

					if (self.noInternetAlert !== undefined) {
						self.noInternetAlert.dismiss();
					}
				}
			});

			let changeSubscription = self.network.onchange().subscribe(() => {
				console.log(self.network);
			});
		}
	});
  }
	showInternetWarning(){
		let self = this;
		if (self.global.offline) {
			self.noInternetAlert = this.alertCtrl.create({
				title: 'No Internet',
				message: 'You need a connection to the internet for this app to work. Restart the app if you belief you have internet.',
				buttons: [
					{
						text: 'Retry',
						handler: () => {
							this.showInternetWarning();
						}
					}
				]
			});
			self.noInternetAlert.present();
		}
	}

	initializeApp() {
		this.platform.ready().then(() => {
			this.statusBar.styleDefault();
		});

		this.auth.afAuth.authState
		.subscribe(
		  user => {
			if (user) {
			  this.rootPage = HomePage;
			} else {
			  this.rootPage = LoginPage;
			}
		  },
		  () => {
			this.rootPage = LoginPage;
		  }
		);
	}


}

