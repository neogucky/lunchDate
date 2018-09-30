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

	onEditTimer: any;
	
	constructor(public navCtrl: NavController, private toastCtrl: ToastController, public global: Global, private auth: AuthService,  private backend: FirebaseService) {
	}
  
	//update name when 1 second no input
	onInput(){
		if (this.onEditTimer !== undefined){
			clearTimeout(this.onEditTimer);
		}
		
		this.onEditTimer = setTimeout(this.changeName, 1000)
	}
	
	private changeName = () => {
								
		this.backend.updateUser(global.participantName);
		
		this.toastCtrl.create({
			message: 'Name was changed to: "'+global.participantName+'"',
			duration: 3000,
			position: 'bottom'
		}).present();
	}
	
	logout() {
		this.auth.signOut();
		this.navCtrl.setRoot(LoginPage);
	}
  

}
