import {Component} from '@angular/core';

import {AlertController, Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Global} from './global';
import {TranslateService} from '@ngx-translate/core';
import {Network} from '@ionic-native/network/ngx';
import { Storage } from '@ionic/storage';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    noInternetAlert: any;
    // language (async loading)
    LANGUAGE: any = {
        INTERNET_TITLE: 'No Internet',
        INTERNET_TEXT: '',
        INTERNET_RETRY: 'Retry'
    };

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private network: Network,
        public alertCtrl: AlertController,
        public global: Global,
        private storage: Storage,
        private translate: TranslateService
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.loadLanguage();

            // load global object
            this.storage.get('language').then((language) => {
                if (language !== undefined && language !== null && language !== '') {
                    this.global.language = language;
                    this.translate.use(language);
                } else {
                    this.global.language = this.translate.getDefaultLang();
                }
            });


            if (this.platform.is('pwa') || this.platform.is('mobileweb')) {
                console.log('Platform is core or is mobile web');
            } else {
                console.log('Platform is ' + this.platform);
                /*
                 * prevent users using the app without internet (not because we hate them but because it will not work)
                 */
                this.global.offline = this.network.type === 'none';
                if (this.global.offline) {
                    setTimeout(this.showInternetWarning, 500);
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
                        // dismiss dialog
                        this.global.offline = false;
                        console.log('internet reclaimed');

                        if (this.noInternetAlert !== undefined) {
                            this.noInternetAlert.dismiss();
                        }
                    }
                    this.splashScreen.hide();
                });
            }
        });
    }

    loadLanguage() {
        for (const key of Object.keys(this.LANGUAGE)) {
            this.translate.get('GLOBAL.' + key).subscribe(
                value => {
                    this.LANGUAGE[key] = value;
                }
            );
        }
        console.log('System language is: ' + navigator.language);
        // substring in order to convert "en-US" to "en" etc.
        this.translate.setDefaultLang(navigator.language.substring(0, 2));
    }

    showInternetWarning() {
        this.loadLanguage();
        const self = this;
        if (self.global.offline) {
            self.noInternetAlert = this.alertCtrl.create({
                header: self.LANGUAGE.INTERNET_TITLE,
                message: self.LANGUAGE.INTERNET_TEXT,
                buttons: [
                    {
                        text: self.LANGUAGE.INTERNET_RETRY,
                    }
                ]
            });
            self.noInternetAlert.onDidDismiss(() => self.showInternetWarning());
            self.noInternetAlert.present();
        }
    }

}
