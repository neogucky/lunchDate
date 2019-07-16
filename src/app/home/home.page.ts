import {Component, ViewChild} from '@angular/core';
import {AuthService} from '../auth.service';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {Global} from '../global';
import {Events, NavController} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
      public events: Events,
      public global: Global,
      public splashScreen: SplashScreen,
      private auth: AuthService,
      private  navCtrl: NavController) {
    events.subscribe('navigate:loginpage', () => {
      // we use this so the ion tab controller page (home.ts) will navigate to login page if a tab triggers this.
      this.navCtrl.navigateRoot('/login');
    });
  }

  ionViewDidLoad() {
    if (this.auth.authenticated) {
      console.log(this.global);
      if (this.global !== undefined
          && this.global.user !== undefined
          && this.global.user.name !== undefined
          && this.global.user.name !== '') {
        console.log('Go directly to time page');
        // FIXME: select tab 1
      } else {
        console.log('Go to settings first');
        // FIXME: select tab 2

      }
    }
  }
}
