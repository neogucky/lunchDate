import { Component } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { LoginPage } from '../pages/login/login';
import { Network } from '@ionic-native/network';

import { TranslateService } from '@ngx-translate/core';

import { Global } from '../services/global';
import {Storage} from "@ionic/storage";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  	rootPage:any = LoginPage;
	noInternetAlert:any;

  constructor( private platform: Platform,
				private statusBar: StatusBar,
			   	private network: Network,
			   	public alertCtrl: AlertController,
				public global: Global,
        private storage: Storage,
				private translate: TranslateService) {
    platform.ready().then(() => {
		// Okay, so the platform is ready and our plugins are available.
		// Here you can do any higher level native things you might need.
		let self = this;
		if(platform.is('core') || platform.is('mobileweb')) {
			console.log("Platform is core or is mobile web");
		} else {

			/*
			 * prevent users using the app without internet (not because we hate them but because it will not work)
			*/
			global.offline = false;
			// watch network for a disconnect
			this.network.onDisconnect().subscribe(() => {
				console.log('internet lost');
				self.global.offline = true;
				self.showInternetWarning();
			});

			// watch network for a connection
			self.network.onConnect().subscribe(() => {
				if (self.global.offline){
					//dismiss dialog
					self.global.offline = false;
					console.log('internet reclaimed');

					if (self.noInternetAlert !== undefined) {
						self.noInternetAlert.dismiss();
					}
				}
			});
		}

		//load global object
    storage.get('language').then( (language) => {
      if (language !== undefined && language !== null && language !== ''){
        global.language = language;
        translate.use(language);
      } else {
        global.language = translate.getDefaultLang();
      }
    });

		console.log("System language is: " + navigator.language);
    //substring in order to convert "en-US" to "en" etc.
    translate.setDefaultLang(navigator.language.substring(0,2));

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
	}


}

