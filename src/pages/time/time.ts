import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Global } from '../../services/global';


@Component({
  selector: 'page-time',
  templateUrl: 'time.html'
})
export class TimePage {

	suggestionList: any;

  constructor(public navCtrl: NavController, public global: Global) {

	this.suggestionList = [ {time: '11:30', participants: ['Marcel', 'Tim', "Torben", "Henrik", "Daniel", "Jan", "Marcus", "Michael"]}, {time: '11:35', participants: ["Thomas"]}, {time: '11:25', participants: []} ];
	
	//TODO: sort by time (problem: string
	//this.suggestionList.sort(function(a, b){return b.time-a.time});
  
  }
  
  formatNames(names){
	 
	let participanList = names.slice();
	  
	if (participanList === undefined || participanList.length == 0){
		return "No participants yet";
	} else if (participanList.length == 1){
		return participanList[0] + " is participating";;
	} else {
		let firstParticipant = participanList.splice(0,1);
		return participanList.join(', ') + " and " + firstParticipant + " are participating";
	}
  } 
  
  getParticipationString(names){
	if (names.includes(this.global.participantName)){
		return "Cancel"
	} else {
		return "Join"
	}
  }
  
}
