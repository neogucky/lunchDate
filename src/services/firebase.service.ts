import { Injectable } from "@angular/core";
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';

@Injectable()
export class FirebaseService {

  constructor(
    public afs: AngularFirestore,
	private auth: AuthService){

	}

    updateUser(value){
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
	
	getUser() : String {
		return this.afs.collection<any>('participants/'+this.auth.uid)
			.valueChanges();
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
			  .set({suggestionID: ' '});
	}
	
	participate(id) {
		this.afs.doc('participants/'+this.auth.uid)
			  .set({suggestionID: id});
	}
}