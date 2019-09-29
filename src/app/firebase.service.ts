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

    updateUserAllowPush(allowPush) {
        this.afs.doc('participants/' + this.auth.uid)
            .update({allowPush})
            .then(() => {
                // update successful (document exists)
            })
            .catch((error) => {
                // console.log('Error updating user', error); // (document does not exists)
                this.afs.doc('participants/' + this.auth.uid)
                    .set({allowPush}).catch(e => {
                    console.log(e);
                });
            });

        this.global.user.allowPush(allowPush);
    }

    updateUserAllowReminder(allowReminder) {
        this.afs.doc('participants/' + this.auth.uid)
            .update({allowReminder})
            .then(() => {
                // update successful (document exists)
            })
            .catch((error) => {
                // console.log('Error updating user', error); // (document does not exists)
                this.afs.doc('participants/' + this.auth.uid)
                    .set({allowReminder}).catch(e => {
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
        }).then(() => {
          this.managePushSubscription(this.global.user.allowPush);
        });
    }

    leaveGroup() {
      if (this.global.user.allowPush) {
        this.managePushSubscription(false);
      }
      return this.afs.doc('participants/' + this.auth.uid)
        .update({group: 'leave_G5x9'})
        .catch((error) => {
          console.log('Error updating user', error);
        }).then(() => {
          if (this.global.user.allowPush) {
            this.managePushSubscription(true);
          }
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
        if (this.global.user.suggestionID === 'busy') {
          if (this.global.user.allowPush) {
            this.managePushSubscription(true);
          }
        }
        this.afs.doc('participants/' + this.auth.uid)
            .update({suggestionID: ' '}).catch(e => {
            console.log(e);
        });
    }

    participate(id) {
      if (this.global.user.suggestionID === 'busy') {
        // user was busy
        if (this.global.user.allowPush) {
          this.managePushSubscription(true);
        }
      }
      this.afs.doc('participants/' + this.auth.uid)
          .update({suggestionID: id}).catch(e => {
          console.log(e);
      });

      if (id === 'busy') {
        // user has become busy
        if (this.global.user.allowPush) {
          this.managePushSubscription(false);
        }
      }
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

  initializeFirebasePush() {
    console.log('called initializeFirebasePush');
    this.managePushSubscription(this.global.user.allowPush && this.global.user.suggestionID !== 'busy');
  }

  /*
   *  Manages which topic is subscribed by the user. This must be updated if the lunch group, the users availability
   *  or his desire to receive push notifications changes
   */
  managePushSubscription(allowPush) {
    if (allowPush) {
      try {
        if (this.global.user !== undefined && this.global.user.group !== undefined && this.global.user.allowPush) {
          this.firebasePush.subscribe(this.global.user.group);
        }
      } catch (error) {
        console.error('error subscribing group', error);
      }
    } else {
      try {
        if (this.global.user !== undefined && this.global.user.group !== undefined) {
          this.firebasePush.unsubscribe(this.global.user.group);
        }
      } catch (error) {
        console.error('error unsubscribing group', error);
      }

    }
  }
}
