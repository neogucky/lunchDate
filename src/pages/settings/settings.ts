import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { Global } from '../../services/global';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { LoginPage } from '../../pages/login/login';


@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

	participantName: String;
	onEditTimer: any;
	
	constructor(public navCtrl: NavController, private toastCtrl: ToastController, public global: Global, private auth: AuthService,  private backend: FirebaseService) {
		this.participantName = global.participantName;
	}
  
	//update name when 1 second no input
	onInput(){
		if (this.onEditTimer !== undefined){
			clearTimeout(this.onEditTimer);
		}
		
		this.onEditTimer = setTimeout(this.changeName, 1000)
	}
	
	private changeName = () => {
		
		if (this.global.participantName == this.participantName){
			return;
		}
						
		this.backend.updateUser(this.participantName);
		
		this.toastCtrl.create({
			message: 'Name was changed to: "'+this.participantName+'"',
			duration: 3000,
			position: 'bottom'
		}).present();
	}
	
	logout() {
		this.auth.signOut();
		this.navCtrl.setRoot(LoginPage);
	}
  

}
