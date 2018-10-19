import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { AuthService } from '../services/auth.service';

import { Global } from '../services/global';

import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = LoginPage;

  constructor( private platform: Platform, 
				private statusBar: StatusBar, 
				private splashScreen: SplashScreen, 
				private auth: AuthService,
				public global: Global) {
    platform.ready().then(() => {
		// Okay, so the platform is ready and our plugins are available.
		// Here you can do any higher level native things you might need.
		statusBar.styleDefault();	  
		
		if(platform.is('core') || platform.is('mobileweb')) {
			console.log("Platform is core or is mobile web");
		} else {

			/* NOT WORKING shows blank page!
			 * prevent users using the app without internet (not because we hate them but because it will not work)

			let offline = false;
			// watch network for a disconnect
			let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
				offline = true;
				const alert = this.alertCtrl.create({
					title: 'No Internet',
					message: 'You need a connection to the internet for this app to work. Restart the app if this message is wrong.',
					buttons: [
						{
							text: 'Retry',
							handler: () => {
								if (offline) {
									//reopen this dialog
									alert.present();
								}
							}
						}
					]
				});
				alert.present();

				// watch network for a connection
				let connectSubscription = this.network.onConnect().subscribe(() => {
					//dismiss dialog
					alert.dismiss();

					connectSubscription.unsubscribe();
				});

			});
			 */

		}
	});
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

