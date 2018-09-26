import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { Global } from '../../services/global';
import { AuthService } from '../../services/auth.service';
import { LoginPage } from '../../pages/login/login';


@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

	tmpParticipantName: String;
	onEditTimer: any;
	
	constructor(public navCtrl: NavController, private toastCtrl: ToastController, public global: Global, private auth: AuthService) {
		this.tmpParticipantName = global.participantName;
	}
  
	//update name when 1 second no input
	onInput(){
		if (this.onEditTimer !== undefined){
			clearTimeout(this.onEditTimer);
		}
		
		this.onEditTimer = setTimeout(this.changeName, 1000)
	}
	
	private changeName = () => {
		
		if (this.global.participantName == this.tmpParticipantName){
			return;
		}
				
		this.global.participantName = this.tmpParticipantName;
		this.toastCtrl.create({
			message: 'Name was changed to: "'+this.tmpParticipantName+'"',
			duration: 3000,
			position: 'bottom'
		}).present();
	}
	
	logout() {
		this.auth.signOut();
		this.navCtrl.setRoot(LoginPage);
	}
  

}
