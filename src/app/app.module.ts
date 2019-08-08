import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { ModalNewPage } from './time/modal/new.page';
import { ModalParticipantsPage } from './time/modal/participants.page';

import {SignupPageModule} from './signup/signup.module';
import {LoginPageModule} from './login/login.module';
import {SettingsPageModule} from './settings/settings.module';
import {TimePageModule} from './time/time.module';
import {MealPageModule} from './meal/meal.module';
import {HomePageModule} from './home/home.module';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {Network} from '@ionic-native/network/ngx';
import {LocalNotifications} from '@ionic-native/local-notifications/ngx';
import {FirebaseService} from './firebase.service';
import {AuthService} from './auth.service';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import {Global} from './global';
import { firebaseConfig } from './config';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { Firebase } from '@ionic-native/firebase/ngx';

import {WebView} from '@ionic-native/ionic-webview/ngx';
import { ImageResizer } from '@ionic-native/image-resizer/ngx';


export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

@NgModule({
  declarations: [
      AppComponent,
      ModalNewPage,
      ModalParticipantsPage
  ],
  entryComponents: [ModalNewPage, ModalParticipantsPage],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseConfig.fire),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: (HttpLoaderFactory),
            deps: [HttpClient]
        }
    }),
      HomePageModule,
      MealPageModule,
      TimePageModule,
      SettingsPageModule,
      LoginPageModule,
      SignupPageModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Global,
    AuthService,
    FirebaseService,
    Base64,
    Firebase,
    ImagePicker,
    ImageResizer,
    WebView,
    Crop,
    LocalNotifications,
    Network,
    AppVersion,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
