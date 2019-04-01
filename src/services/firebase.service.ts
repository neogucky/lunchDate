import { Injectable } from "@angular/core";
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { Global } from '../services/global';

@Injectable()
export class FirebaseService {

  constructor(
    public afs: AngularFirestore,
	private auth: AuthService,
	public global: Global){

	}

    updateUserName(value){
		this.afs.doc('participants/'+this.auth.uid)
		.update({name: value})
		.then(() => {
			// update successful (document exists)
		})
		.catch((error) => {
			// console.log('Error updating user', error); // (document does not exists)
			this.afs.doc('participants/'+this.auth.uid)
			  .set({name: value});
		});
    }

	updateUserAllowPush(value){
		this.afs.doc('participants/'+this.auth.uid)
			.update({allowPush: value})
			.then(() => {
				// update successful (document exists)
			})
			.catch((error) => {
				// console.log('Error updating user', error); // (document does not exists)
				this.afs.doc('participants/'+this.auth.uid)
					.set({allowPush: value});
			});
	}

	updateUserAllowReminder(value){
		this.afs.doc('participants/'+this.auth.uid)
			.update({allowReminder: value})
			.then(() => {
				// update successful (document exists)
			})
			.catch((error) => {
				// console.log('Error updating user', error); // (document does not exists)
				this.afs.doc('participants/'+this.auth.uid)
					.set({allowReminder: value});
			});
	}

  getUser() : any {
    return this.afs.doc<any>('participants/'+this.auth.uid)
      .valueChanges();
  }

  getGroup() : any {
    return this.afs.doc<any>('group/'+this.global.user.group)
      .valueChanges();
  }

	updateFCMToken(value){
		this.afs.doc('participants/'+this.auth.uid)
		.update({FCMtoken: value})
		.then(() => {
			// update successful (document exists)
		})
		.catch((error) => {
			// console.log('Error updating user', error); // (document does not exists)
			this.afs.doc('participants/'+this.auth.uid)
			  .set({FCMtoken: value});
		});
	}

	addSuggestionNow() {
		let currentTime = new Date();
		currentTime = new Date( currentTime.getDate() + 300000);
		var uniqueID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
		this.afs.collection('group/'+ this.global.user.group +'/suggestion/')
			.add({time: currentTime,
				id: uniqueID,
				type: 'now',
				creator: this.global.user.name});
		return uniqueID;
	}

	addSuggestion(time) {
		var uniqueID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
		this.afs.collection('group/'+ this.global.user.group +'/suggestion/')
			  .add({time: time,
					id: uniqueID,
			  		type: 'time',
				  	creator: this.global.user.name
			  });
		return uniqueID;
	}

  getMenu(day) : any {
    var start = new Date(day.getTime());
    start.setHours(0,0,0,0);

    var end = new Date(day.getTime());
    end.setHours(23,59,59,999);

    if (this.global.user.group === undefined){
      console.error('Invalid group! Please don\'t do that to me...');
    }

    return this.afs.collection<any>('menu', ref => ref.where('date', '>', start).where('date', '<', end))
      .valueChanges();
  }

	getSuggestions(day) : any {

		var start = new Date(day.getTime());
		start.setHours(0,0,0,0);

		var end = new Date(day.getTime());
		end.setHours(23,59,59,999);

		if (this.global.user.group === undefined){
			console.error('Invalid group! Please don\'t do that to me...');
		}

		return this.afs.collection<any>('group/'+ this.global.user.group +'/suggestion', ref => ref.where('time', '>', start).where('time', '<', end))
			.valueChanges();

	}

	getParticipants() : any {
		if (this.global.user.group === undefined) {
			console.error('user.group is undefined! No participants can be loaded.');
		}
		return this.afs.collection<any>('participants', ref => ref.where('group', '==', this.global.user.group))
			.valueChanges();
	}

	unparticipate() {
		this.afs.doc('participants/'+this.auth.uid)
			  .update({suggestionID: ' '});
	}

	participate(id) {
		this.afs.doc('participants/'+this.auth.uid)
			  .update({suggestionID: id});
	}

	setLanguage(language: string) {
    this.afs.doc('participants/'+this.auth.uid)
      .update({language: language});
  }
}
