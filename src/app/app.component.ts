import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
		// Okay, so the platform is ready and our plugins are available.
		// Here you can do any higher level native things you might need.
		statusBar.styleDefault();
		splashScreen.hide();
	  
		// OneSignal Code start:
		// Enable to debug issues:
		// window["plugins"].OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});

		var notificationOpenedCallback = function(jsonData) {
		  console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
		};

		var notificationReceivedCallback = function(jsonData) {
		  console.log('notificationReceivedCallback: ' + JSON.stringify(jsonData));
		};

		if(platform.is('core') || platform.is('mobileweb')) {
			console.log("Platform is core or is mobile web");
		} else {
			window["plugins"].OneSignal
			  .startInit("ab65daee-f5e9-407d-89b8-01fe3cfe63f6", "415277590824")
			  .handleNotificationOpened(notificationOpenedCallback)
			  .handleNotificationReceived(notificationReceivedCallback)
			  .endInit();
		}
	});
  }
}

