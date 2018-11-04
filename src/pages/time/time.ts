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

	var self = this;
  	this.dayStamp = today.getDay();

	document.addEventListener("resume", this.onResume.bind(this), false);

	// FIXME: What to do if no group? Call function later again!
	// FIXME: What to do if group deleted?
	if (this.global.user.group !== undefined) {
		this.suggestionSubscription  = backend.getSuggestions(today).subscribe(data=>{
			this.suggestionList = data;
		});
		backend.getParticipants().subscribe(data=> {
			self.participants = data;

			if (self.suggestionList == undefined) {
				return;
			}
			self.participantMap = {};

			self.participants.forEach(function (participant) {
				if (self.participantMap[participant.suggestionID] === undefined) {
					self.participantMap[participant.suggestionID] = [];
				}
				self.participantMap[participant.suggestionID].push(participant.name);
			});
		});
	}

  }

	showParticipants(id){
		let participanList = this.participantMap[id].slice();
		let lastParticipant = participanList[participanList.length -1];
		participanList = participanList.splice(0, participanList.length -1);

		let suggestionTime = this.suggestionList.find( (el) => el.id == id).time.toDate();
		//FIXME: show this in a dedicated view with better formatting
		const confirm = this.alertCtrl.create({
			title: 'Participants for ' +  suggestionTime.toLocaleTimeString(),
			message: '<span style="color:black!important;">' +
				participanList.join(', ') + " and " + lastParticipant +
 			'</span>',
			buttons: [
				{
					text: 'Close'
				}
			]
		});
		confirm.present();
	}

	/*
	 *	FIXME: cleanup this function (multiple cases + busy/going is too complicated)
	 */
	getParticipants(id){

		var result = { simple : "", extended : ""}

		if (this.participantMap[id] === undefined || this.participantMap[id].length == 0){
			if (id !== 'busy'){
				result.simple = "No participants";
			} else {
				result.simple = "Nobody is busy";
			}

			return result;
		}

		var word;
		if (id !== 'busy'){
				word = "going";
			} else {
				word = "busy";
			}

		let participanList = this.participantMap[id].slice();

		if (participanList.length == 1){
			result.simple = participanList[0] + " is " + word;
		} else if (participanList.length <= 4) {
			let firstParticipant = participanList.splice(0,1);
			result.simple = participanList.join(', ') + " and " + firstParticipant + " are " + word;
		} else {
			let participantCount = participanList.length;
			participanList = participanList.splice(0,3);
			result.simple = participanList.join(', ');
			result.extended = " and " + (participantCount -3) + " others are " + word;
		}
		return result;
	}

  getParticipationString(id){
	if (this.participantMap[id] != undefined && this.participantMap[id].includes(this.global.user.name)){
		return "Cancel"
	} else {
		return "Join"
	}
  }

  switchParticipation(id){

	if(!this.platform.is('core') && !this.platform.is('mobileweb')){
		this.localNotifications.clearAll();
	}

	if (this.participantMap[id] != undefined && this.participantMap[id].includes(this.global.user.name)){
		this.backend.unparticipate();
	} else {
		if (!this.platform.is('core') && !this.platform.is('mobileweb') && this.global.user.allowReminder && id != 'busy'){
			let suggestion = this.suggestionList.find( item => item.id == id);
			if (suggestion == undefined){
				console.log("Too fast error! Suggestion with ID: " + id + " not ready yet. (or it doesn't exist at all...)");
			}
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
			this.suggestionList.forEach(
				function (suggestion){
					let suggestionDate = suggestion.time.toDate();
					if (suggestionDate.getMinutes() == selectedTime.getMinutes()
						&& suggestionDate.getHours() == selectedTime.getHours()) {
						//date already exists
						self.switchParticipation(suggestion.id);
						error = true;
					}
				}
			);
		}

        if (!error){
			var id = this.backend.addSuggestion(selectedTime);
            setTimeout(function () {self.switchParticipation(id);}, 500);
        }

  }

	addSuggestionNow(){
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
						this.backend.addSuggestionNow();
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
