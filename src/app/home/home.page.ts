import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../auth.service';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {Global} from '../global';
import {Events, NavController, Platform} from '@ionic/angular';
import {Router} from '@angular/router';
import {FirebaseService} from "../firebase.service";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  constructor(
      public events: Events,
      public global: Global,
      private router: Router,
      private auth: AuthService,
      private navCtrl: NavController,
      private platform: Platform,
      private backend: FirebaseService) {
    events.subscribe('navigate:loginpage', () => {
      // we use this so the ion tab controller page (home.ts) will navigate to login page if a tab triggers this.
      this.navCtrl.navigateRoot('/login');
    });
  }

  ngOnInit(): void {
    if (this.auth.authenticated) {
      if (this.global !== undefined
        && this.global.user !== undefined
        && this.global.user.name !== undefined
        && this.global.user.name !== '') {
        console.log('Go directly to time page');
        this.router.navigate(['/home/time']);

        if (!this.platform.is('pwa') && !this.platform.is('mobileweb')) {
          this.backend.initializeFirebasePush();
        }
      } else {
        console.log('Go to settings first');
        this.router.navigate(['/home/settings']);
      }
    }
  }
}
