"use strict";
//const rp = require('request-promise');
//const cheerio = require('cheerio');
//const request = require('request');
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
exports.newLunchDate = functions.firestore
    .document('suggestions/{suggestionId}')
    .onCreate((change, context) => {
    const data = change.data();
    let payload;
    if (data.type === undefined || data.type != 'now') {
        //assuming datatype 'time' with fallback to earlier versions without type
        const time = data.time.toDate();
        const timeFormatted = (time.getHours() + 2) + ":" + time.getMinutes();
        payload = {
            notification: {
                title: 'Lunch at ' + timeFormatted,
                body: 'New lunch date available at ' + timeFormatted,
                icon: 'https://goo.gl/Fz9nrQ',
                sound: 'default'
            }
        };
    }
    else {
        payload = {
            notification: {
                title: 'Hungry?',
                body: data.creator + ' wants to go for lunch in 5 minutes',
                icon: 'https://goo.gl/Fz9nrQ',
                sound: 'default'
            }
        };
    }
    const options = {
        priority: "high",
        timeToLive: 60 * 60 * 2
    };
    return admin.messaging().sendToTopic("IMIS", payload, options);
});
/*
exports.loadMenus = functions.https.onRequest((req, res) => {

    //FIXME: I would like a dynamic parser with which I create a database entry on how to parse listed websites
    
    //Get Mensa Lübeck
    const url = 'https://www.studentenwerk.sh/de/essen/standorte/luebeck/mensa-luebeck/speiseplan.html';
    const options = {
        uri: url,
        headers: { 'User-Agent': 'test' },
        transform: (body) => cheerio.load(body)
    }
    
    rp(options)
        .then(($) => {
            const scrapedDays = $('#days').find('div.day>table');
            
            for (let day in scrapedDays){
                admin.firestore().collection('menu').add({
                  'cantineID': 'mensa',
                  'name': day,
                  'price': '80 Cent'
                }).catch(err => console.log(err));
            }
            res.status(200).end();
        })
        .catch((err) => res.status(400).send(err));
});
*/
//# sourceMappingURL=index.js.map