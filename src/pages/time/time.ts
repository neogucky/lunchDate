import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Global } from '../../services/global';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'page-time',
  templateUrl: 'time.html'
})
export class TimePage {

	suggestionList: any;
	participantMap: any;
	participants: any;

  constructor(public navCtrl: NavController, public global: Global, private backend: FirebaseService) {

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
		self.suggestionList.forEach(function(suggestion) {
			console.log(suggestion);
			self.participants.forEach(function(participant) {
				console.log(participant);
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
	 
	console.log(this.participantMap);
	console.log(id);
	 
	if (this.participantMap[id] === undefined || this.participantMap[id].length == 0){
		return "No participants yet";
	}  
	 
	let participanList = this.participantMap[id].slice();
	  
	if (participanList.length == 1){
		return participanList[0] + " is participating";;
	} else {
		let firstParticipant = participanList.splice(0,1);
		return participanList.join(', ') + " and " + firstParticipant + " are participating";
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
	if (this.participantMap[id] != undefined && this.participantMap[id].includes(this.global.participantName)){
		this.backend.unparticipate();
	} else {
		this.backend.participate(id);
	}
  }
}