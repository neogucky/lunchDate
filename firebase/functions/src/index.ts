//const rp = require('request-promise');
//const cheerio = require('cheerio');
//const request = require('request');

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
const db = admin.firestore();

/*
 * 	this tries to re-add all users depending on mail adresses. Propably a bad idea to use this when the app is live
 */
exports.autoAddUsers = functions.https.onRequest((req, res) => {

	let roles = [];
	let groupID;

	admin.auth().listUsers().then(function(listUsersResult) {
				
		listUsersResult.users.forEach(function(user) {
			const mailMatch = user.email.split("@")[1];
			console.log("Trying to find: " + mailMatch);

			db.collection('group').where('mailMatch', '==', mailMatch).get()
				.then(snapshot => {
				  snapshot.forEach(doc => {
					//every group that automatically adds the users mail   
					const group = doc.data();
					groupID = doc.id;
					roles.push({ UID: user.uid, role: "moderator"});
					
					db.collection('participants').doc(user.uid).set({ group : doc.id }, {merge: true}).catch(err => {
					  console.error('Error setting users group', err);
					});
				  });
				}).catch(err => {
				  console.error('Error getting documents', err);
				});
		});
	}).then(() => {
		setTimeout(() => {
			db.collection('group').doc(groupID).set({ roles : roles }, {merge: true}).catch(err => {
			console.error('Error setting group roles', err);
		});
		return;
		}, 12000);
	}).catch(err => {
	  console.error('Error getting users', err);
	});
	
});


/*
 * 	try to add user to a group if the mail adress matches 
 */
exports.autoAddUser = functions.auth.user().onCreate((user) => {

	const mailMatch = user.email.split("@")[1];
	console.log("Trying to find: " + mailMatch);

	const defer = new Promise((resolve, reject) => {
		db.collection('group').where('mailMatch', '==', mailMatch).get()
			.then(snapshot => {
			  snapshot.forEach(doc => {
				//every group that automatically adds the users mail   
				const group = doc.data();
				let roles = group.roles;
				roles.push({ UID: user.uid, role: "moderator"});
				db.collection('group').doc(doc.id).set({ roles : roles }, {merge: true}).catch(err => {
				  console.error('Error setting group roles', err);
				});
				
				db.collection('participants').doc(user.uid).set({ group : doc.id }, {merge: true}).then(() => { 
					resolve();
				}).catch(err => {
				  console.error('Error setting users group', err);
				});
			  });
			}).catch(err => {
			  console.error('Error getting documents', err);
			});
	});
	
	return defer;
});

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
		//FIXME: DST needs +2 
		const timeFormatted = (time.getHours() + 1) + ":" + time.getMinutes();
		
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