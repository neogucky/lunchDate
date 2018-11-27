import { Component } from '@angular/core';
import { ToastController, Events } from 'ionic-angular';
import { Global } from '../../services/global';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { AlertController } from 'ionic-angular';
import { FCM } from '@ionic-native/fcm';
import { Platform } from 'ionic-angular';
import {TranslateService} from "@ngx-translate/core";
import {Storage} from "@ionic/storage";

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

	onEditTimer: any;

  //language (async loading)
  LANGUAGE: any = {
    ABOUT: "SETTINGS.ABOUT",
    ABOUT_TITLE: "SETTINGS.ABOUT_TITLE",
    ABOUT_TEXT: "SETTINGS.ABOUT_TEXT"
  }


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
   private storage: Storage)		{

    console.log(this.global.language);
    //Load language
      for (var key in this.LANGUAGE) {
        translate.get(this.LANGUAGE[key]).subscribe(
          value => {
            // value is our translated string
            this.LANGUAGE[key] = value;
          }
        )
      }
	}

	ionViewDidLoad() {
		if (this.global.user.allowPush){
			setTimeout(() => {this.global.user.allowPush = true;}, 100);
		}
		if (this.global.user.allowReminder){
			setTimeout(() => {this.global.user.allowReminder = true;}, 100);
		}
	}

	//update name when 1 second no input
	onInput(){
		if (this.onEditTimer !== undefined){
			clearTimeout(this.onEditTimer);
		}

		this.onEditTimer = setTimeout(this.changeName, 3000)
	}

	onAllowPush(){

		if (this.global.user.group === undefined){
			return;
		}

		this.backend.updateUserAllowPush(this.global.user.allowPush);

		if(this.platform.is('core') || this.platform.is('mobileweb')){
			return;
		}

		if (this.global.user.allowPush){
			this.fcm.subscribeToTopic(this.global.user.group);
		} else {
			this.fcm.unsubscribeFromTopic(this.global.user.group);
		}
	}

	onAllowReminder(){
		this.backend.updateUserAllowReminder(this.global.user.allowReminder);
	}

  onLanguageChange() {
    this.storage.set('language', this.global.language);
    this.translate.use(this.global.language);
  }

	onAbout(){
    //FIXME: show this in a dedicated view with better formatting
		const confirm = this.alertCtrl.create({
			title: this.LANGUAGE['ABOUT'],
			message: '<span style="color:black">' +
        this.LANGUAGE['ABOUT_TITLE'] +
        this.LANGUAGE['ABOUT_TEXT'] +
			'</span>',
			buttons: [
				{
					text: 'Close'
				}
			]
		});
		confirm.present();
	}

	private changeName = () => {

        if (this.global.user.name === undefined || this.global.user.name == ''){
            return;
        }

		this.backend.updateUserName(this.global.user.name);

		/* always show toast in top as not to overlap the navigation bar */
		this.toastCtrl.create({
			message: 'Name was changed to: "'+this.global.user.name+'"',
			duration: 3000,
			position: 'top'
		}).present();
	}

	logout() {
		this.auth.signOut();
		this.events.publish('navigate:loginpage');
	}


}
