import { Component } from '@angular/core';
import { ToastController, Events } from 'ionic-angular';
import { Global } from '../../services/global';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { AlertController } from 'ionic-angular';
import { FCM } from '@ionic-native/fcm';
import { Platform } from 'ionic-angular';



@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

	onEditTimer: any;

	constructor(
		public events: Events,
		private toastCtrl: ToastController,
		public global: Global,
		private auth: AuthService,
		private backend: FirebaseService,
		private platform: Platform,
		public alertCtrl: AlertController,
		public fcm: FCM)		{
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

	onAbout(){
		//FIXME: show this in a dedicated view with better formatting
		const confirm = this.alertCtrl.create({
			title: 'About Lunch Date',
			message: '<span style="color:black">' +
			'<b>Lunch Date</b> <span style="color:grey">[luhnch deyt]</span><br>' +
			'noun<br>' +
			'1. A fruit that is traditionally shared with coworkers at lunchtime.<br>' +
			'2. A set time to meet people for lunch.' +
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
