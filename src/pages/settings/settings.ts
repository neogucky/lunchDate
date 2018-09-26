import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { Global } from '../../services/global';


@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

	tmpParticipantName: String;

	constructor(public navCtrl: NavController, private toastCtrl: ToastController, public global: Global) {
		this.tmpParticipantName = global.participantName;
	}
  
  onNameChange(){
	  
	this.global.participantName = tmpParticipantName;
	  
	this.toastCtrl.create({
		message: 'Name was changed to: "'+tmpParticipantName+'"',
		duration: 3000,
		position: 'bottom'
	}).present();
	
  }

}
