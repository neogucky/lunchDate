import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Network } from '@ionic-native/network';
import { AppVersion } from '@ionic-native/app-version';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { MealPage } from '../pages/meal/meal';
import { TimePage } from '../pages/time/time';
import { ModalNew } from '../pages/time/modal/new';

import { SettingsPage } from '../pages/settings/settings';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';

import { Global } from '../services/global';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuth } from '@angular/fire/auth';
import { firebaseConfig } from '../services/config';
import { AuthService } from '../services/auth.service';
import { SignupPage } from '../pages/signup/signup';

import { AngularFirestoreModule } from '@angular/fire/firestore';
import { FirebaseService } from '../services/firebase.service';

import { LocalNotifications } from '@ionic-native/local-notifications';

import { IonicStorageModule } from '@ionic/storage';

import { FCM } from '@ionic-native/fcm';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

@NgModule({
	declarations: [
		MyApp,
		HomePage,
		MealPage,
		TimePage,
		SettingsPage,
		LoginPage,
		SignupPage,
    ModalNew
	],
	imports: [
		BrowserModule,
		IonicModule.forRoot(MyApp),
		AngularFireModule.initializeApp(firebaseConfig.fire),
		AngularFirestoreModule,
		IonicStorageModule.forRoot(),
		HttpClientModule,
		TranslateModule.forRoot({
		  loader: {
			provide: TranslateLoader,
			useFactory: (HttpLoaderFactory),
			deps: [HttpClient]
		  }
		})
	],
	bootstrap: [IonicApp],
	entryComponents: [
		MyApp,
		HomePage,
		MealPage,
		TimePage,
		SettingsPage,
		LoginPage,
		SignupPage,
    ModalNew
	],
	providers: [
		StatusBar,
		SplashScreen,
		Global,
		AngularFireAuth,
		AuthService,
		FirebaseService,
		FCM,
		LocalNotifications,
		Network,
		AppVersion,
		{provide: ErrorHandler, useClass: IonicErrorHandler}
	]
})

export class AppModule {}
