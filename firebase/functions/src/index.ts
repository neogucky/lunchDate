import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
admin.initializeApp();


exports.newLunchDate = functions.firestore
    .document('suggestions/{suggestionId}')
    .onCreate((change, context) => {
   
    const data = change.data();

    const id = data.id
	
	const time = data.time.toDate();
		
    const timeFormatted = (time.getHours() + 2) + ":" + time.getMinutes();

	
    // Notification content
    const payload = {
      notification: {
          title: 'Lunch at ' + timeFormatted,
          body: 'New lunch date available at ' + timeFormatted,
          icon: 'https://goo.gl/Fz9nrQ'
      }
    }

	const options = {
        priority: "high",
        timeToLive: 60*60*2
    };

	return admin.messaging().sendToTopic("IMIS", payload, options);

});