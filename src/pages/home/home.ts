import {Component, ViewChild} from '@angular/core';
import {Tabs, NavController, App, Events} from 'ionic-angular';
import {FCM} from '@ionic-native/fcm';
import {Platform} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';


import {Global} from '../../services/global';
import {FirebaseService} from '../../services/firebase.service';

import {MealPage} from '../meal/meal';
import {TimePage} from '../time/time';
import {SettingsPage} from '../settings/settings';
import {LoginPage} from '../../pages/login/login';

@Component({
  templateUrl: 'home.html'
})
export class HomePage {

  tab1Root = MealPage;
  tab2Root = TimePage;
  tab3Root = SettingsPage;

  @ViewChild('tabs') tabs: Tabs;


  constructor(
    public events: Events,
    public global: Global,
    private app: App,
    private backend: FirebaseService,
    private platform: Platform,
    public fcm: FCM,
    public splashScreen: SplashScreen,
    public navCtrl: NavController) {
    events.subscribe('navigate:loginpage', () => {
      //we use this so the ion tab controller page (home.ts) will navigate to login page if a tab triggers this.
      this.navCtrl.setRoot(LoginPage);
    });
  }

  ionViewDidLoad() {

    //get push token
    if (!this.platform.is('core') && !this.platform.is('mobileweb')) {
      this.fcm.getToken().then(token => {
        this.backend.updateFCMToken(token);
      });
    }

    var initFinished = false;
    this.backend.getUser().subscribe(data => {
      if (data !== undefined && data.name !== undefined) {

        //activate push & reminder by default
        if (data.allowPush === undefined) {
          data.allowPush = true;
        }
        if (data.allowReminder === undefined) {
          data.allowReminder = true;
        }
        this.global.user = data;
      } else {
        this.global.user = {};
      }

      //run this only once
      if (!initFinished) {
        setTimeout(() => {
          this.splashScreen.hide();
          console.log('end splash autologin');
        }, 1000);

        //FIXME: this should be done only once when first setting the language
        this.backend.setLanguage(this.global.language);

        initFinished = true;
        if (data !== undefined && data.name !== undefined) {
          this.tabs.select(1);
        } else {
          this.tabs.select(2);
        }
      }

      //get group
      this.backend.getGroup().subscribe(data => {
        this.global.group = data;
      });

      console.log(this.global.user);
    });

  }

  //FIXME: Workarround for bug where ion-tabs sometimes forgets to highlight correct tab
  switchedTab() {
    let id: string;
    Array.from(document.querySelectorAll('.tab-button')).forEach(element => {
      id = element.id;
      if (id[id.length - 1] == String(this.tabs.getSelected().index)) {
        element.setAttribute('aria-selected', 'true');
      } else {
        element.removeAttribute('aria-selected')
      }
    });
  }

}
