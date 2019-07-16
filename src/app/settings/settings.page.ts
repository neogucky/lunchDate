import { Component, OnInit } from '@angular/core';
import {AlertController, Events, Platform, ToastController} from '@ionic/angular';
import {AuthService} from '../auth.service';
import {FirebaseService} from '../firebase.service';
import {Global} from '../global';
import {FCM} from '@ionic-native/fcm/ngx';
import {TranslateService} from '@ngx-translate/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  onEditTimer: any;

  // language (async loading)
  LANGUAGE: any = {
    ABOUT: 'SETTINGS.ABOUT',
    ABOUT_TITLE: 'SETTINGS.ABOUT_TITLE',
    ABOUT_TEXT: 'SETTINGS.ABOUT_TEXT',
    NAME_CHANGED: 'SETTINGS.NAME_CHANGED'
  };

  constructor(
      public events: Events,
      private toastCtrl: ToastController,
      public global: Global,
      private auth: AuthService,
      private backend: FirebaseService,
      private platform: Platform,
      public alertCtrl: AlertController,
      public fcm: FCM,
      private translate: TranslateService,
      private storage: Storage) {

    // Load language
    for (const key of Object.keys(this.LANGUAGE)) {
      translate.get(this.LANGUAGE[key]).subscribe(
          value => {
            // value is our translated string
            this.LANGUAGE[key] = value;
          }
      );
    }
  }

  ngOnInit() {
    if (this.global.user.allowPush) {
      setTimeout(() => {
        this.global.user.allowPush = true;
      }, 100);
    }
    if (this.global.user.allowReminder) {
      setTimeout(() => {
        this.global.user.allowReminder = true;
      }, 100);
    }
  }

  // update name when 1 second no input
  onInput() {
    if (this.onEditTimer !== undefined) {
      clearTimeout(this.onEditTimer);
    }

    this.onEditTimer = setTimeout(this.changeName, 3000);
  }

  onAllowPush() {

    if (this.global.user.group === undefined) {
      return;
    }

    this.backend.updateUserAllowPush(this.global.user.allowPush);

    if (this.platform.is('pwa') || this.platform.is('mobileweb')) {
      return;
    }

    if (this.global.user.allowPush) {
      this.fcm.subscribeToTopic(this.global.user.group);
    } else {
      this.fcm.unsubscribeFromTopic(this.global.user.group);
    }
  }

  onAllowReminder() {
    this.backend.updateUserAllowReminder(this.global.user.allowReminder);
  }

  onLanguageChange() {
    this.storage.set('language', this.global.language);
    this.translate.use(this.global.language);
  }

  async onAbout() {
    // FIXME: show this in a dedicated view with better formatting
    const confirm = await this.alertCtrl.create({
      header: this.LANGUAGE.ABOUT,
      message: '<span style="color:black">' +
          this.LANGUAGE.ABOUT_TITLE +
          this.LANGUAGE.ABOUT_TEXT +
          '</span>',
      buttons: [
        {
          text: 'Close'
        }
      ]
    });
    confirm.present();
  }

  private async changeName() {

    if (this.global.user.name === undefined || this.global.user.name === '') {
      return;
    }

    this.backend.updateUserName(this.global.user.name);

    /* always show toast in top as not to overlap the navigation bar */
    const alert = await this.toastCtrl.create({
      message: this.LANGUAGE.NAME_CHANGED + ' "' + this.global.user.name + '"',
      duration: 3000,
      position: 'top'
    });
    alert.present();
  }

  logout() {
    this.auth.signOut().then( () => {
          location.reload();
        }
    ).catch(e => {
      console.log(e);
    });
  }

}
