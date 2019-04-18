const rp = require('request-promise');
const cheerio = require('cheerio');

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);

/*
 * 	this tries to re-add all users depending on mail adresses. Propably a bad idea to use this when the app is live
 */
exports.autoAddUsers = functions.https.onRequest((req, res) => {

  const roles = [];
  let groupID;

  admin.auth().listUsers().then(function (listUsersResult) {

    listUsersResult.users.forEach(function (user) {
      const mailMatch = user.email.split("@")[1];
      console.log("Trying to find: " + mailMatch);

      db.collection('group').where('mailMatch', '==', mailMatch).get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            //every group that automatically adds the users mail
            const group = doc.data();
            groupID = doc.id;
            roles.push({UID: user.uid, role: "moderator"});

            db.collection('participants').doc(user.uid).set({group: doc.id}, {merge: true}).catch(err => {
              console.error('Error setting users group', err);
            });
          });
        }).catch(err => {
        console.error('Error getting documents', err);
      });
    });
  }).then(() => {
    setTimeout(() => {
      db.collection('group').doc(groupID).set({roles: roles}, {merge: true}).catch(err => {
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

  let foundMail = false;
  return new Promise((resolve, reject) => {
    db.collection('group').where('mailMatch', '==', mailMatch).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          //every group that automatically adds the users mail
          foundMail = true;
          const group = doc.data();
          const roles = group.roles;
          roles.push({UID: user.uid, role: "member"});
          db.collection('group').doc(doc.id).set({roles: roles}, {merge: true}).catch(err => {
            console.error('Error setting group roles', err);
          }).then(() => {
            db.collection('participants').doc(user.uid).set({group: doc.id}).then(() => {
              resolve();
            }).catch(err => {
              console.error('Error setting users group', err);
            });
          }).catch(err => console.log(err));
        });
        if (!foundMail) {
          console.log('Mail address not matching existing addresses');
          const blockedDomains = ["gmx.de", "gmx.net", "web.de", "t-online.de", "outlook.de", "outlook.com", "aol.de", "aol.com", "freenet.de", "gmail.com", "gmail.de", "googlemail.de", "googlemail.com", "yahoo.de", "yahoo.com", "icloud.de", "icloud.com"];
          //don't create groups for common mail-domains
          if (!blockedDomains.includes(mailMatch)) {
            //create new group
            console.log("creating new group for domain: " + mailMatch);
            const roles = [];
            roles.push({UID: user.uid, role: "administrator"});
            db.collection('group').doc(mailMatch).set({
              'roles': roles,
              'name': mailMatch,
              'mailMatch': mailMatch,
              'restaurants': [],
              'creator': user.uid,
              'info': '',
              'createdAt': admin.firestore.Timestamp.now()
            }).catch(err => console.log(err))
              .then(() => {
                db.collection('participants').doc(user.uid).set({group: mailMatch, name: ''}).then(() => {
                  resolve();
                }).catch(err => {
                  console.error('Error setting users group', err);
                });
              }).catch(err => console.log(err));
          } else {
            console.log('Mail adress not valid (common domain)');
          }
        }
      }).catch(err => {
      console.error('Error getting documents', err);
    });
  });
});

exports.newLunchDate = functions.firestore
  .document('group/{groupId}/suggestion/{suggestionId}')
  .onCreate((change, context) => {

      const data = change.data();
      const payload = {};

      const options = {
        priority: "high",
        timeToLive: 60 * 60 * 2
      };

      if (data.type === undefined || data.type !== 'now') {

        //assuming datatype 'time' with fallback to earlier versions without type
        let time = data.time.toDate();
        const timezoneTime = time.toLocaleString("en-US", {timeZone: "Europe/Berlin"});
        time = new Date(timezoneTime);
        const timeFormatted = padZero(time.getHours()) + ":" + padZero(time.getMinutes());

        if (data.restaurantID === undefined || data.restaurantID === 'none') {
          payload['en'] = {
            notification: {
              title: 'Lunch at ' + timeFormatted,
              body: 'A colleague wants to go for lunch',
              icon: 'icon',
              badge: '1',
              sound: 'default'
            }
          };

          payload['de'] = {
            notification: {
              title: 'Mittagessen um ' + timeFormatted,
              body: 'Gib deinen Kollegen bescheid, ob dir ' + timeFormatted + ' passt',
              icon: 'icon',
              badge: '1',
              sound: 'default'
            }
          };
        } else {
            payload['en'] = {
              notification: {
                title: 'Lunch at ' + timeFormatted,
                body: 'New lunch date available at restaurant: "' + data.restaurantName + '"',
                icon: 'icon',
                badge: '1',
                sound: 'default'
              }
            };

            payload['de'] = {
              notification: {
                title: 'Mittagessen um ' + timeFormatted,
                body: 'Gib deinen Kollegen bescheid, ob dir ' + timeFormatted + ' im Restaurant: "' + data.restaurantName + '" passt',
                icon: 'icon',
                badge: '1',
                sound: 'default'
              }
          };
        }
      } else {
        //don't show this for a long time
        options.timeToLive = 60 * 15;
        payload['en'] = {
          notification: {
            title: 'Hungry?',
            body: data.creator + ' wants to go for lunch in 5 minutes',
            icon: 'icon',
            badge: '1',
            sound: 'default'
          }
        };

        payload['de'] = {
          notification: {
            title: 'Hungrig?',
            body: data.creator + ' möchte in 5 Minutes zum Essen gehen',
            icon: 'icon',
            badge: '1',
            sound: 'default'
          }
        }
      }

      pushToGroup(payload['de'], context.params.groupId, 'de').then(
        () => {
          return pushToGroup(payload['en'], context.params.groupId, 'en');
        }
      ).catch(err => {
        console.log('Error in pushToGroup', err);
      });

  });

function padZero(value) {
  let s = value + '';
  return s.length >= 2 ? s : new Array(2 - s.length + 1).join('0') + s;
}

function loadUsers(group, language) {

  const defaultLanguage = 'en';
  const participantsRef = db.collection('participants');
  return new Promise((resolve, reject) => {
    const users = [];
    participantsRef.where('allowPush', '==', true).where('group', '==', group).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const participant = doc.data();
          //FIXME: (participant.busyUntil === undefined || participant.busyUntil.seconds < now.getSeconds())
          if (participant.FCMtoken !== undefined && (participant.suggestionID !== -1) && (participant.language === language || (participant.language === undefined && language === defaultLanguage))) {
            users.push(participant);
          }
        });
        resolve(users);
      }).catch(err => {
      console.log('Error getting documents', err);
      reject();
    });
  }).catch(err => {
    console.log('Error getting documents', err);
  });
}

//sends a push notifications to all users that have not opted out
function pushToGroup(payload, group, language) {

  console.log('Push to group with: ' + language);

  return new Promise((resolve, reject) => {
    loadUsers(group, language).then((users: any) => {
      const tokens = [];
      for (let it in users) {
        tokens.push(users[it].FCMtoken);
      }

      if (tokens === undefined || tokens.length === 0) {
        console.error('No users selcted to send push to');
        reject();
      }
      console.log('sending push to users with language: ' + language);
      admin.messaging().sendToDevice(tokens, payload).then(() => {
        resolve();
      }).catch(err => {
        console.log('Error sending push ', err);
        reject();
      });
    }).catch(err => {
      console.log('Error loading users ', err);
      reject();
    });
  });
}

exports.loadMenus = functions.https.onRequest((req, res) => {

  //FIXME: I would like a dynamic parser with which I create a database entry on how to parse listed websites
  const morning:Date = new Date();
  morning.setHours(0,0,0,0);
  const ts = new admin.firestore.Timestamp(morning.getSeconds(),0);
  db.collection('menu').where('date', '>', ts).get().then(snapshot => {
    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    return batch.commit();
  }).catch(function(err) {
    console.log(err);
  });

  console.log("Loading menu from: 'Mensa Lübeck'");
  //Get Mensa Lübeck
  const url = 'https://www.studentenwerk.sh/de/essen/standorte/luebeck/mensa-luebeck/speiseplan.html';
  const options = {
    uri: url,
    headers: { 'User-Agent': 'test' },
    transform: (body) => cheerio.load(body)
  };

  rp(options)
    .then(($) => {
      const todaysMenu = $('#days').find('.today').find('tr');
      todaysMenu.each(function(i, foodItem) {
        $(foodItem).find('br').replaceWith(' ');
        //skipping first row (header)
        if (i > 0){
          console.log('try adding food item: ' + $(foodItem).find('strong').text());
          admin.firestore().collection('menu').add({
            'cantineID': 'mensa',
            'foodTitle': $(foodItem).find('strong').text().split(' ')[0],
            'foodDescription': $(foodItem).find('strong').text().replace(/\n/g, " "),
            'price':  $(foodItem).find('td').last().text(),
            'date': admin.firestore.Timestamp.now()
          }).catch(err => console.log(err));
        }
      });
      setTimeout(() => res.status(200).end(), 1000);

    })
    .catch(function(err) {
      console.log(err);
      res.status(400).send(err);
    });
});

function loadRestaurants() {

  const restaurantsRef = db.collection('restaurants');
  return new Promise((resolve, reject) => {
    const restaurants = [];
    restaurantsRef.get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          let restaurant = doc.data();
          restaurants.push(restaurant);
        });
        resolve(restaurants);
      }).catch(err => {
      console.log('Error getting documents', err);
      reject();
    });
  }).catch(err => {
    console.log('Error getting documents', err);
  });
}


exports.loadMenus2 = functions.https.onRequest((req, res) => {

  //First look for all restaurants
  loadRestaurants().then((restaurants: any) => {
    restaurants.forEach(restaurant => {
      console.log("Loading menu from: '"+ restaurant.uid +"'");

      if (restaurant.type === "scrape") {
        let morning:Date = new Date();
        morning.setHours(0,0,0,0);
        let ts = new admin.firestore.Timestamp(morning.getSeconds(),0);
        db.collection('restaurants/' + restaurant.uid + '/menu').where('date', '>', ts).get().then(snapshot => {
          // Delete documents in a batch
          let batch = db.batch();
          snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });
          return batch.commit();
        }).catch(function(err) {
          console.log(err);
        });

        const options = {
          uri: restaurant.url,
          headers: {'User-Agent': 'lunchDate App'},
          transform: (body) => cheerio.load(body)
        };

        if (restaurant.uid === "mensa_luebeck") {
          rp(options)
            .then(($) => {
              const todaysMenu = $('#days').find('.today').find('tr');
              todaysMenu.each(function (i, foodItem) {
                $(foodItem).find('br').replaceWith(' ');
                //skipping first row (header)
                if (i > 0) {
                  console.log('try adding food item: ' + $(foodItem).find('strong').text());
                  db.collection('restaurants/' + restaurant.uid + '/menu').add({
                    'cantineID': restaurant.uid,
                    'foodTitle': $(foodItem).find('strong').text().split(' ')[0],
                    'foodDescription': $(foodItem).find('strong').text(),
                    'price': $(foodItem).find('td').last().text(),
                    'date': admin.firestore.Timestamp.now()
                  }).catch(err => console.log(err));
                }
              });
            })
            .catch(function (err) {
              console.log(err);
            });
        } else if (restaurant.uid === "bistro_luebeck_uksh") {
          let title, description, price;
          rp(options)
            .then(($) => {
              const todaysMenu = $($('tr').find('td')[3]).find('p');
              todaysMenu.each(function (i, foodSegment) {
                /*  Structure:
                  * <p>Title</p>
                  * <p>Description</p>
                  * <p>calories</p>
                  * <p>price</p>
                  */
                $(foodSegment).find('br').replaceWith(' ');
                switch (i % 4) {
                  case 0:
                      title = $(foodSegment).text();
                      break;
                  case 1:
                      description = title + "\n" + $(foodSegment).text();
                      break;
                  case 2:
                      break;
                  case 3:
                      price = $(foodSegment).text();
                      console.log('try adding food item: ' + title);
                      db.collection('restaurants/' + restaurant.uid + '/menu').add({
                        'cantineID': restaurant.uid,
                        'foodTitle': title,
                        'foodDescription': description,
                        'price': price,
                        'date': admin.firestore.Timestamp.now()
                      }).catch(err => console.log(err));
                      break;
                }
              });
            })
            .catch(function (err) {
              console.log(err);
            });
        } else if (restaurant.uid === "cafeteria_luebeck_uksh") {
          let title, description, price;
          rp(options)
            .then(($) => {
              const todaysMenu = $($('tr').find('td')[1]).find('p');
              todaysMenu.each(function (i, foodSegment) {
                /*  Structure:
                  * <p>Title</p>
                  * <p>Description</p>
                  * <p>calories</p>
                  * <p>price</p>
                  */
                $(foodSegment).find('br').replaceWith(' ');
                switch (i % 4) {
                  case 0:
                    title = $(foodSegment).text();
                    break;
                  case 1:
                    description = title + "\n" + $(foodSegment).text();
                    break;
                  case 2:
                    break;
                  case 3:
                    price = $(foodSegment).text();
                    console.log('try adding food item: ' + title);
                    db.collection('restaurants/' + restaurant.uid + '/menu').add({
                      'cantineID': restaurant.uid,
                      'foodTitle': title,
                      'foodDescription': description,
                      'price': price,
                      'date': admin.firestore.Timestamp.now()
                    }).catch(err => console.log(err));
                    break;
                }
              });
            })
            .catch(function (err) {
              console.log(err);
            });
        }
      }
    });
    setTimeout(() => res.status(200).end(), 2000);
  }).catch(err => {
    console.log('Error loading restaurants while scraping ', err);
  });


});
