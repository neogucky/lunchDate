import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../auth.service';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {Global} from '../global';
import {Events, NavController} from '@ionic/angular';
import {Router} from '@angular/router';

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
      private  navCtrl: NavController) {
    events.subscribe('navigate:loginpage', () => {
      // we use this so the ion tab controller page (home.ts) will navigate to login page if a tab triggers this.
      this.navCtrl.navigateRoot('/login');
    });
  }

  ngOnInit(): void {
    if (this.auth.authenticated) {
      console.log(this.global);
      if (this.global !== undefined
        && this.global.user !== undefined
        && this.global.user.name !== undefined
        && this.global.user.name !== '') {
        console.log('Go directly to time page');
        this.router.navigate(['/home/time']);

      } else {
        console.log('Go to settings first');
        this.router.navigate(['/home/settings']);
      }
    }
  }
}
