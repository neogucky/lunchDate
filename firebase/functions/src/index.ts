//const rp = require('request-promise');
//const cheerio = require('cheerio');
//const request = require('request');

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
const db = admin.firestore();

exports.newLunchDate = functions.firestore
    .document('suggestions/{suggestionId}')
    .onCreate((change, context) => {
   
    const data = change.data();
	let payload;
	
	const options = {
        priority: "high",
        timeToLive: 60*60*2
    };
	
	if (data.type === undefined || data.type !== 'now'){
				
		//assuming datatype 'time' with fallback to earlier versions without type
		const time = data.time.toDate();
		const timeFormatted = (time.getHours() + 2) + ":" + time.getMinutes();
		
		payload = {
		  notification: {
			  title: 'Lunch at ' + timeFormatted,
			  body: 'New lunch date available at ' + timeFormatted,
			  icon: 'icon',
			  badge: '1',
			  sound: 'default'
		  }
		}
	} else {
		//don't show this for a long time
		options.timeToLive = 60*15;
		payload = {
		  notification: {
			  title: 'Hungry?',
			  body: data.creator + ' wants to go for lunch in 5 minutes',
			  icon: 'icon',
			  badge: '1',
			  sound: 'default'
		  }
		}
	}

	return pushToAll(payload);
});

function loadUsers() {
	console.log('send push to:');
	const participantsRef = db.collection('participants');
	const defer = new Promise((resolve, reject) => {
		const users = [];
		participantsRef.where('allowPush', '==', true).get()
		.then(snapshot => {
		  snapshot.forEach(doc => {
			const participant = doc.data();
			//FIXME: (participant.busyUntil === undefined || participant.busyUntil.seconds < now.getSeconds())
			if (participant.FCMtoken !== undefined && (participant.suggestionID !== -1)){
				console.log(participant.name);
				users.push(participant);
			}
		  });
		  resolve(users);
		}).catch(err => {
		  console.log('Error getting documents', err);
		});
	}).catch(err => {
		  console.log('Error getting documents', err);
		});
	return defer;
}

//sends a push notifications to all users that have not opted out
function pushToAll(payload){
	
	return loadUsers().then((users : any) => {
        const tokens = [];
        for (let it in users) {
            tokens.push(users[it].FCMtoken);
        }
		
		if (tokens === undefined || tokens.length === 0){
			console.error('No users selcted to send push to');
			return new Promise((resolve, reject) => {resolve()});
		} 
		
        return admin.messaging().sendToDevice(tokens, payload);
    });

}