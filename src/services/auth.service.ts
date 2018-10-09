import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';

@Injectable()
export class AuthService {
	private user: firebase.User;
	private verifyUserWhenReady: boolean;

	constructor(public afAuth: AngularFireAuth) {
		afAuth.authState.subscribe(user => {
			if (this.verifyUserWhenReady && !user.emailVerified){
				this.verifyUserWhenReady = false;
				user.sendEmailVerification();
			}
			this.user = user;
		});
	}

	signInWithEmail(credentials) {
		console.log('Sign in with email');
		return this.afAuth.auth.signInWithEmailAndPassword(credentials.email,
			 credentials.password);
	}
	
	signUp(credentials) {
		return this.afAuth.auth.createUserWithEmailAndPassword(credentials.email, credentials.password);
	}

	sendEmailVerification() {
		this.verifyUserWhenReady = true;
	}
	
	get authenticated(): boolean {
		return this.user !== null;
	}
	
	get uid(): String {
		return this.user.uid;
	}
	
	getEmail() {
		return this.user && this.user.email;
	}
	
	signOut(): Promise<void> {
		return this.afAuth.auth.signOut();
	}
}
