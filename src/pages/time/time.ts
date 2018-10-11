import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Global } from '../../services/global';
import { FirebaseService } from '../../services/firebase.service';
import { ToastController } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Platform } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import * as moment from 'moment';

@Component({
  selector: 'page-time',
  templateUrl: 'time.html'
})
export class TimePage {

	suggestionList: any;
	participantMap: any;
	participants: any;
	selectedTime: String = "11:00";
	suggestionSubscription: any;
	dayStamp: number;

	@ViewChild('datePicker') datePicker;
	
  constructor(
	public navCtrl: NavController, 
	public global: Global, 
	private backend: FirebaseService,
	private toastCtrl: ToastController, 
	private localNotifications: LocalNotifications,
	public alertCtrl: AlertController,
	private platform: Platform) {

	this.participantMap = {};

	let today = new Date();

  	this.suggestionSubscription  = backend.getSuggestions(today).subscribe(data=>{
        this.suggestionList = data;
    });

	var self = this;
  	this.dayStamp = today.getDay();

	document.addEventListener("resume", this.onResume.bind(this), false);

	backend.getParticipants().subscribe(data=>{
        self.participants = data;

		if (self.suggestionList == undefined ){
			return;
		}
		self.participantMap = {};

		self.participants.forEach(function(participant) {
			if (self.participantMap[participant.suggestionID] === undefined) {
				self.participantMap[participant.suggestionID] = [];
			}
			self.participantMap[participant.suggestionID].push(participant.name);
		});
    });

  }

   getParticipants(id){

	if (this.participantMap[id] === undefined || this.participantMap[id].length == 0){
		return "No participants";
	}

	let participanList = this.participantMap[id].slice();

	if (participanList.length == 1){
		return participanList[0] + " is going";
	} else if (participanList.length <= 4) {
		let firstParticipant = participanList.splice(0,1);
		return participanList.join(', ') + " and " + firstParticipant + " are going";
	} else {
		let participantCount = participanList.length;
		participanList = participanList.splice(0,3);
		return participanList.join(', ') + " and " + (participantCount -3) + " others are going";
	}
  }

  getParticipationString(id){
	if (this.participantMap[id] != undefined && this.participantMap[id].includes(this.global.participantName)){
		return "Cancel"
	} else {
		return "Join"
	}
  }

  switchParticipation(id){
	  
	if(!this.platform.is('core') && !this.platform.is('mobileweb')){
		this.localNotifications.clearAll();
	}

	if (this.participantMap[id] != undefined && this.participantMap[id].includes(this.global.participantName)){
		this.backend.unparticipate();
	} else {
		if (!this.platform.is('core') && !this.platform.is('mobileweb') && this.global.allowReminder){
			let suggestion = this.suggestionList.find( suggestion => suggestion.id == id);
			//noinspection TypeScriptValidateTypes
			this.localNotifications.schedule({
			   text: 'Meetup for lunch in 5 minutes!',
			   trigger: {at: new Date(suggestion.time.toDate().getTime() - 300000)}
			});
		}
		this.backend.participate(id);
	}
  }

    onInputChange(){
        setTimeout(this.suggestDate.bind(this), 500);
    }

	suggestDate(){

        //FIXME: remove unsexy js workarround due to not binding Date object
        var selectedTime = new Date();
        selectedTime.setHours(Number(this.selectedTime.substring(0,2)));
        selectedTime.setMinutes(Number(this.selectedTime.substring(3,5)));

        var error = false;
        var self = this;
		if (this.suggestionList !== undefined){
			this.suggestionList.forEach( function (suggestion){
				let suggestionDate = suggestion.time.toDate();
				if (suggestionDate.getMinutes() == selectedTime.getMinutes()
					&& suggestionDate.getHours() == selectedTime.getHours()) {
					//date already exists
					self.switchParticipation(suggestion.id);
					error = true;
				}
			});
		}

        if (!error){
			var id = this.backend.addSuggestion(selectedTime);
            self.switchParticipation(id);			
        }
		
  }

	goNow(){
		const confirm = this.alertCtrl.create({
			title: 'Alert your collegues',
			message: 'Do you want to ask your collegues to go for lunch in 5 minutes?',
			buttons: [
				{
					text: 'Cancel'
				},
				{
					text: 'Ask collegues',
					handler: () => {
						this.backend.goNow();
					}
				}
			]
		});
		confirm.present();
	}

	/*
	*	After the app was in standby we will reset the subscription so the data of the correct day is displayed
	*
	*/
	onResume(){
		let today = new Date();
		if (this.dayStamp != today.getDay()){
			this.dayStamp = today.getDay();
			this.suggestionSubscription.unsubscribe();
			this.suggestionSubscription  = this.backend.getSuggestions(today).subscribe(data=>{
				this.suggestionList = data;
			});
		}
	}
}
