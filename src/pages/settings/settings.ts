import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { Global } from '../../services/global';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { LoginPage } from '../../pages/login/login';
import { AlertController } from 'ionic-angular';
import { FCM } from '@ionic-native/fcm';


@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

	onEditTimer: any;

	constructor(public navCtrl: NavController, 
		private toastCtrl: ToastController, 
		public global: Global, 
		private auth: AuthService,  
		private backend: FirebaseService,
		public alertCtrl: AlertController,
		public fcm: FCM)		{
	}

	ionViewDidLoad() {
		if (this.global.allowPush){
			setTimeout(() => {this.global.allowPush = true;}, 100);
		}
		if (this.global.allowReminder){
			setTimeout(() => {this.global.allowReminder = true;}, 100);
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
		this.backend.updateUserAllowPush(this.global.allowPush);

		if (this.global.allowPush){
			this.fcm.subscribeToTopic(this.global.datePool);
		} else {
			this.fcm.unsubscribeFromTopic(this.global.datePool);
		}
	}

	onAllowReminder(){
		this.backend.updateUserAllowReminder(this.global.allowReminder);
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
        
        if (this.global.participantName === undefined || this.global.participantName == ''){
            return;
        }
        
		this.backend.updateUserName(this.global.participantName);

		/* always show toast in top as not to overlap the navigation bar */
		this.toastCtrl.create({
			message: 'Name was changed to: "'+this.global.participantName+'"',
			duration: 3000,
			position: 'top'
		}).present();
	}

	logout() {
		this.auth.signOut();
		this.navCtrl.setRoot(LoginPage);
	}


}
