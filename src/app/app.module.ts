import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { OneSignal } from '@ionic-native/onesignal';

import { MealPage } from '../pages/meal/meal';
import { TimePage } from '../pages/time/time';
import { SettingsPage } from '../pages/settings/settings';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';

import { Global } from '../services/global';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { firebaseConfig } from '../services/config';
import { AuthService } from '../services/auth.service';
import { SignupPage } from '../pages/signup/signup';
import { NgxErrorsModule } from '@ultimate/ngxerrors';

import { AngularFirestoreModule } from 'angularfire2/firestore';


@NgModule({
  declarations: [
    MyApp,
    HomePage,
	MealPage,
	TimePage,
	SettingsPage,
	LoginPage,
	SignupPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
	AngularFireModule.initializeApp(firebaseConfig.fire),
	NgxErrorsModule,
	AngularFirestoreModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
	MealPage,
	TimePage,
	SettingsPage,
	LoginPage,
	SignupPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
	OneSignal, 
	Global,
	AngularFireAuth,
	AuthService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
