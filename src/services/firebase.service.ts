import { Injectable } from "@angular/core";
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';

@Injectable()
export class FirebaseService {

  constructor(
    public afs: AngularFirestore,
	private auth: AuthService){

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

	goNow() {
		let currentTime = new Date();
		currentTime = new Date( currentTime.getDate() + 300000);
		var uniqueID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
		this.afs.collection('suggestions/')
			.add({time: currentTime,
				id: uniqueID});
		return uniqueID;
	}
	
	getUser() : any {
		return this.afs.doc<any>('participants/'+this.auth.uid)
			.valueChanges();
	}
	
	addSuggestion(time) {
		var uniqueID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
		this.afs.collection('suggestions/')
			  .add({time: time,
					id: uniqueID});
		return uniqueID;
	}
	
	getTodaysSuggestions() : any {

		var start = new Date();
		start.setHours(0,0,0,0);

		var end = new Date();
		end.setHours(23,59,59,999);
	
		return this.afs.collection<any>('suggestions', ref => ref.where('time', '>', start).where('time', '<', end))
			.valueChanges();
			
	}
	
	getParticipants() : any {
		return this.afs.collection<any>('participants')
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
}