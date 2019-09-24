import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from './auth.service';
import {Global} from './global';
import {AngularFireStorage} from '@angular/fire/storage';
import { Firebase } from '@ionic-native/firebase/ngx';

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {

    constructor(
        public afs: AngularFirestore,
        private storage: AngularFireStorage,
        private auth: AuthService,
        private firebasePush: Firebase,
        public global: Global) {

    }

   FIREBASE_URL: string;

    getUserMail() {
      return this.auth.getEmail();
    }

    updateUserName(value) {
        this.afs.doc('participants/' + this.auth.uid)
            .update({name: value})
            .then(() => {
                // update successful (document exists)
            })
            .catch((error) => {
                // console.log('Error updating user', error); // (document does not exists)
                this.afs.doc('participants/' + this.auth.uid)
                    .set({name: value}).catch(e => {
                    console.log(e);
                });
            });
    }

    updateUserAllowPush(value) {
        this.afs.doc('participants/' + this.auth.uid)
            .update({allowPush: value})
            .then(() => {
                // update successful (document exists)
            })
            .catch((error) => {
                // console.log('Error updating user', error); // (document does not exists)
                this.afs.doc('participants/' + this.auth.uid)
                    .set({allowPush: value}).catch(e => {
                    console.log(e);
                });
            });
    }

    updateUserAllowReminder(value) {
        this.afs.doc('participants/' + this.auth.uid)
            .update({allowReminder: value})
            .then(() => {
                // update successful (document exists)
            })
            .catch((error) => {
                // console.log('Error updating user', error); // (document does not exists)
                this.afs.doc('participants/' + this.auth.uid)
                    .set({allowReminder: value}).catch(e => {
                    console.log(e);
                });
            });
    }

    getUser(): any {
        return this.afs.doc<any>('participants/' + this.auth.uid)
            .valueChanges();
    }

    getGroup(): any {
        return this.afs.doc<any>('group/' + this.global.user.group)
            .valueChanges();
    }

    updateFCMToken(value) {
        this.afs.doc('participants/' + this.auth.uid)
            .update({FCMtoken: value})
            .catch((error) => {
                // FCMtoken needs to be created since it did not exist
                this.afs.doc('participants/' + this.auth.uid)
                    .set({FCMtoken: value}).catch(e => {
                    console.log(e);
                });
            });
    }

    createGroup(group: {
      group_name: any;
      group_key: any;
      mail_match: boolean;
      mailMatchDomain: string;
    }): any {
      if (!group.mail_match) {
        group.mailMatchDomain = '';
      }

      // FIXME: check if mailMatch doesn't exist
      // FIXME: set or check mailMatch serverside to prevent cheating

      return this.afs.collection('group/')
        .add({
          name: group.group_name,
          groupKey: group.group_key,
          creator: this.global.user.name,
          mailMatch: group.mailMatchDomain
        }).catch(e => {
        console.log(e);
      });
    }

    joinGroup(groupKey: string) {
      return this.afs.doc('participants/' + this.auth.uid)
        .update({groupKey})
        .catch((error) => {
          console.log('Error updating user', error);
        });
    }

    addSuggestionNow() {
        let currentTime = new Date();
        currentTime = new Date(currentTime.getDate() + 300000);
        const uniqueID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
        this.afs.collection('group/' + this.global.user.group + '/suggestion/')
            .add({
                time: currentTime,
                id: uniqueID,
                type: 'now',
                creator: this.global.user.name
            }).catch(e => {
            console.log(e);
        });
        return uniqueID;
    }

    addSuggestion(time, restaurantID, restaurantName) {
        const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
        this.afs.collection('group/' + this.global.user.group + '/suggestion/')
            .add({
                time,
                id,
                type: 'time',
                restaurantID,
                restaurantName,
                creator: this.global.user.name
            }).catch(e => {
            console.log(e);
        });
        return id;
    }

    getRestaurant(restaurantID): any {
        return this.afs.doc('restaurants/' + restaurantID)
            .valueChanges();
    }

    getRestaurantList(): any {
        return this.afs.collection<any>('restaurants/')
            .valueChanges();
    }

    getMenu(restaurantID, day): any {
        const start = new Date(day.getTime());
        start.setHours(0, 0, 0, 0);

        const end = new Date(day.getTime());
        end.setHours(23, 59, 59, 999);

        return this.afs.collection<any>('restaurants/' + restaurantID + '/menu/',
                ref => ref.where('date', '>', start)
                    .where('date', '<', end))
            .valueChanges();
    }

    getSuggestions(day): any {

        const start = new Date(day.getTime());
        start.setHours(0, 0, 0, 0);

        const end = new Date(day.getTime());
        end.setHours(23, 59, 59, 999);

        if (this.global.user.group === undefined) {
            console.error('Invalid group! Please don\'t do that to me...');
        }

        return this.afs.collection<any>('group/' + this.global.user.group + '/suggestion',
                ref => ref.where('time', '>', start)
                    .where('time', '<', end))
            .valueChanges();

    }

    getParticipants(): any {
        if (this.global.user.group === undefined) {
            console.error('user.group is undefined! No participants can be loaded.');
        }
        return this.afs.collection<any>('participants', ref => ref.where('group', '==', this.global.user.group))
            .valueChanges();
    }

    unparticipate() {
        this.afs.doc('participants/' + this.auth.uid)
            .update({suggestionID: ' '}).catch(e => {
            console.log(e);
        });
    }

    participate(id) {
        this.afs.doc('participants/' + this.auth.uid)
            .update({suggestionID: id}).catch(e => {
            console.log(e);
        });
    }

    setLanguage(language: string) {
        this.afs.doc('participants/' + this.auth.uid)
            .update({language}).catch(e => {
            console.log(e);
        });
    }


  uploadFile(image, uploadComplete) {

    this.afs.doc('participants/' + this.auth.uid)
      .update({avatar: image})
      .then(() => {
        uploadComplete(image);
      })
      .catch((error) => {
        // console.log('Error updating user', error); // (document does not exists)
        this.afs.doc('participants/' + this.auth.uid)
          .set({avatar: image})
          .catch(e => {
          console.error(e);
        });
      });
  }

  initializeFirebasePush(platform) {
    try {
      if (this.global.user !== undefined && this.global.user.group !== undefined) {
        this.firebasePush.subscribe(this.global.user.group);
      }
      console.log('platform', platform);
      platform.is('android') ? this.initializeFirebaseAndroid() : this.initializeFirebaseIOS();
    } catch (error) {
     console.error(error);
    }
  }

  initializeFirebaseAndroid() {
    console.log('initializeFirebasePush for android');
    this.firebasePush.getToken().then(token => this.updateFCMToken(token));
    this.firebasePush.onTokenRefresh().subscribe(token => this.updateFCMToken(token));
    this.subscribeToPushNotifications();
  }
  initializeFirebaseIOS() {
    console.log('initializeFirebasePush for iOS');
    this.firebasePush.grantPermission()
      .then(() => {
       this.firebasePush.getToken().then(token => this.updateFCMToken(token));
       this.firebasePush.onTokenRefresh().subscribe(token => this.updateFCMToken(token));
       this.subscribeToPushNotifications();
      })
      .catch((error) => {
       this.firebasePush.logError(error);
      });
  }
  subscribeToPushNotifications() {
   this.firebasePush.onNotificationOpen().subscribe((response) => {
      if (response.tap) {
        // app was opened by clicking on push notification
      } else {
        // app was already open when receiving push
      }
    });
  }
}
