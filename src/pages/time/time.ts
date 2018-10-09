import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Global } from '../../services/global';
import { FirebaseService } from '../../services/firebase.service';
import { ToastController } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Platform } from 'ionic-angular';
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
	

	@ViewChild('datePicker') datePicker;
	
  constructor(
	public navCtrl: NavController, 
	public global: Global, 
	private backend: FirebaseService,
	private toastCtrl: ToastController, 
	private localNotifications: LocalNotifications,
	private platform: Platform) {

	this.participantMap = {};

	let today = new Date();
	backend.getTodaysSuggestions().subscribe(data=>{
        this.suggestionList = data;
    });

	var self = this;
	backend.getParticipants().subscribe(data=>{
        self.participants = data;

		if (self.suggestionList == undefined ){
			return;
		}
		self.participantMap = {};

		self.suggestionList.forEach(function(suggestion) {
			self.participants.forEach(function(participant) {
				if (suggestion.id == participant.suggestionID){
					if (self.participantMap[suggestion.id] === undefined) {
						self.participantMap[suggestion.id] = [];
					}
					self.participantMap[suggestion.id].push(participant.name);
				}
			});
		});
    });

	//this.suggestionList = [ {time: '11:30', participants: ['Marcel', 'Tim', "Torben", "Henrik", "Daniel", "Jan", "Marcus", "Michael"]}, {time: '11:35', participants: ["Thomas"]}, {time: '11:25', participants: []} ];

	//TODO: sort by time (problem: string
	//this.suggestionList.sort(function(a, b){return b.time-a.time});

  }

   getParticipants(id){

	if (this.participantMap[id] === undefined || this.participantMap[id].length == 0){
		return "No participants";
	}

	let participanList = this.participantMap[id].slice();

	if (participanList.length == 1){
		return participanList[0] + " is going";;
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
		if (!this.platform.is('core') && !this.platform.is('mobileweb')){
			//this.localNotifications.schedule({
			//   text: 'Your Lunch Date will happen soon!',
			//   trigger: {at: (this.suggestionList[id].time - 300)},
			//   id: id
			//});
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
		this.suggestionList.forEach( function (suggestion){
			let suggestionDate = suggestion.time.toDate();
			if (suggestionDate.getMinutes() == selectedTime.getMinutes()
				&& suggestionDate.getHours() == selectedTime.getHours()) {
					//date already exists
					self.switchParticipation(suggestion.id);
					error = true;
				}
		});
        if (!error){
			var id = this.backend.addSuggestion(selectedTime);
            self.switchParticipation(id);			
        }
		
  }
}
