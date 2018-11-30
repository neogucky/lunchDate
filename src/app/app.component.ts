import {Component} from '@angular/core';
import {Platform, AlertController} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {LoginPage} from '../pages/login/login';
import {Network} from '@ionic-native/network';

import {TranslateService} from '@ngx-translate/core';

import {Global} from '../services/global';
import {Storage} from "@ionic/storage";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = LoginPage;
  noInternetAlert: any;

  //language (async loading)
  LANGUAGE: any = {
    INTERNET_TITLE: "No Internet",
    INTERNET_TEXT: "",
    INTERNET_RETRY: "Retry"
  }

  constructor(private platform: Platform,
              private statusBar: StatusBar,
              private network: Network,
              public alertCtrl: AlertController,
              public global: Global,
              private storage: Storage,
              private translate: TranslateService,
  ) {
    platform.ready().then(() => {
      let self = this;

      //load global object
      storage.get('language').then((language) => {
        if (language !== undefined && language !== null && language !== '') {
          global.language = language;
          translate.use(language);
        } else {
          global.language = translate.getDefaultLang();
        }
      });


      if (this.platform.is('core') || this.platform.is('mobileweb')) {
        console.log("Platform is core or is mobile web");
      } else {
        /*
         * prevent users using the app without internet (not because we hate them but because it will not work)
         */
        this.global.offline = this.network.type === 'none';
        if (this.global.offline) {
           setTimeout(this.showInternetWarning(), 500);
        }
        // watch network for a disconnect
        this.network.onDisconnect().subscribe(() => {
          console.log('internet lost');
          this.global.offline = true;
          this.showInternetWarning();
        });

        // watch network for a connection
        this.network.onConnect().subscribe(() => {
          if (this.global.offline) {
            //dismiss dialog
            this.global.offline = false;
            console.log('internet reclaimed');

            if (this.noInternetAlert !== undefined) {
              this.noInternetAlert.dismiss();
            }
          }
        });
      }

      console.log("System language is: " + navigator.language);
      //substring in order to convert "en-US" to "en" etc.
      translate.setDefaultLang(navigator.language.substring(0, 2));
    });
  }

  loadLanguage() {
    for (var key in this.LANGUAGE) {
      this.translate.get('GLOBAL.'+key).subscribe(
        value => {
          console.log(value);
          this.LANGUAGE[key] = value;
        }
      )
    }
  }

  showInternetWarning() {
    this.loadLanguage();
    let self = this;
    if (self.global.offline) {
      self.noInternetAlert = this.alertCtrl.create({
        title: self.LANGUAGE['INTERNET_TITLE'],
        message: self.LANGUAGE['INTERNET_TEXT'],
        buttons: [
          {
            text: self.LANGUAGE['INTERNET_RETRY'],
          }
        ]
      });
      self.noInternetAlert.onDidDismiss(() => self.showInternetWarning());
      self.noInternetAlert.present();
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.loadLanguage();
    });
  }

}
