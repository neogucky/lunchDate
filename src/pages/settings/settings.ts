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

		this.onEditTimer = setTimeout(this.changeName, 3000)
	}

	private changeName = () => {
        
        if (this.global.participantName === undefined || this.global.participantName == ''){
            return;
        }
        
		this.backend.updateUser(this.global.participantName);

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
