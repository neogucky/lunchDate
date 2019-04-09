import {Component, ViewChild} from '@angular/core';
import {Tabs, NavController, App, Events} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';

import {Global} from '../../services/global';

import {MealPage} from '../meal/meal';
import {TimePage} from '../time/time';
import {SettingsPage} from '../settings/settings';
import {LoginPage} from '../../pages/login/login';
import {AuthService} from "../../services/auth.service";

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
    public splashScreen: SplashScreen,
    private auth: AuthService,
    public navCtrl: NavController) {
    events.subscribe('navigate:loginpage', () => {
      //we use this so the ion tab controller page (home.ts) will navigate to login page if a tab triggers this.
      this.navCtrl.setRoot(LoginPage);
    });
  }

  ionViewDidLoad() {
    if (this.auth.authenticated) {
      if (this.global !== undefined && this.global.user !== undefined && this.global.user.name !== undefined && this.global.user.name !== "") {
        console.log('Go directly to time page');
        this.tabs.select(1);
      } else {
        console.log('Go to settings first');
        this.tabs.select(2);
      }
    }
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
