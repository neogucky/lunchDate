import {Component, ViewChild} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Global} from '../../services/global';
import {FirebaseService} from '../../services/firebase.service';
import {ToastController} from 'ionic-angular';
import {LocalNotifications} from '@ionic-native/local-notifications';
import {Platform} from 'ionic-angular';
import {AlertController} from 'ionic-angular';
import * as moment from 'moment';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'page-time',
  templateUrl: 'time.html'
})
export class TimePage {

  suggestionList: any;
  participantMap: any;
  participants: any;
  selectedTime: String = "11:30";
  suggestionSubscription: any;
  dayStamp: number;

  @ViewChild('datePicker') datePicker;

  //language (async loading)
  LANGUAGE: any = {
    PARTICIPANTS_TITLE: "TIME.PARTICIPANTS_TITLE",
    LIST_CONCAT: "TIME.LIST_CONCAT",
    LIST_END_SINGULAR: "TIME.LIST_END_SINGULAR",
    LIST_END_PLURAL: "TIME.LIST_END_PLURAL",
    LIST_END_COUNT: "TIME.LIST_END_COUNT",
    CLOSE: "GLOBAL.CLOSE",
    LUNCHER_NOBODY: "TIME.LUNCHER_NOBODY",
    BUSY_NOBODY: "TIME.BUSY_NOBODY",
    BUSY: "TIME.BUSY",
    GOING: "TIME.GOING",
    CANCEL: "TIME.CANCEL",
    JOIN: "TIME.JOIN",
    SHOUT_TITLE: "TIME.SHOUT_TITLE",
    SHOUT_TEXT: "TIME.SHOUT_TEXT",
    SHOUT_CONFIRM: "TIME.SHOUT_CONFIRM",
    SHOUT_CANCEL: "TIME.SHOUT_CANCEL",
    MEET_REMINDER: "TIME.MEET_REMINDER"
  }


  constructor(
    public navCtrl: NavController,
    public global: Global,
    private backend: FirebaseService,
    private toastCtrl: ToastController,
    private localNotifications: LocalNotifications,
    public alertCtrl: AlertController,
    private platform: Platform,
    private translate: TranslateService) {

    this.participantMap = {};

    let today = new Date();

    var self = this;
    this.dayStamp = today.getDay();

    //Load language
    for (var key in self.LANGUAGE) {
      translate.get(self.LANGUAGE[key]).subscribe(
        value => {
          // value is our translated string
          self.LANGUAGE[key] = value;
        }
      )
    }

    document.addEventListener("resume", this.onResume.bind(this), false);

    // FIXME: What to do if no group? Call function later again!
    // FIXME: What to do if group deleted?
    if (this.global.user.group !== undefined) {
      this.suggestionSubscription = backend.getSuggestions(today).subscribe(data => {
        this.suggestionList = data;
      });
      backend.getParticipants().subscribe(data => {
        self.participants = data;
        self.participantMap = {};

        self.participants.forEach(function (participant) {
          if (self.participantMap[participant.suggestionID] === undefined) {
            self.participantMap[participant.suggestionID] = [];
          }
          self.participantMap[participant.suggestionID].push(participant.name);
        });
      });
    }

  }

  showParticipants(id) {
    let participanList = this.participantMap[id].slice();
    let lastParticipant = participanList[participanList.length - 1];
    participanList = participanList.splice(0, participanList.length - 1);

    let suggestionTime = this.suggestionList.find((el) => el.id == id).time.toDate();
    //FIXME: show this in a dedicated view with better formatting
    const confirm = this.alertCtrl.create({
      title: this.LANGUAGE['PARTICIPANTS_TITLE'] + " " + suggestionTime.toLocaleTimeString(),
      message: '<span style="color:black!important;">' +
        participanList.join(', ') + " " + this.LANGUAGE['LIST_CONCAT'] + " " + lastParticipant +
        '</span>',
      buttons: [
        {
          text: this.LANGUAGE['CLOSE']
        }
      ]
    });
    confirm.present();
  }

  /*
     *	FIXME: cleanup this function (multiple cases + busy/going is too complicated)
     */
  getParticipants(id) {

    var result = {simple: "", extended: ""}

    if (this.participantMap[id] === undefined || this.participantMap[id].length == 0) {
      if (id !== 'busy') {
        result.simple = this.LANGUAGE['LUNCHER_NOBODY'];
      } else {
        result.simple = this.LANGUAGE['BUSY_NOBODY'];
      }

      return result;
    }

    var word;
    if (id !== 'busy') {
      word = this.LANGUAGE['GOING'];
    } else {
      word = this.LANGUAGE['BUSY'];
    }

    let participanList = this.participantMap[id].slice();

    if (participanList.length == 1) {
      result.simple = participanList[0] + " " + this.LANGUAGE['LIST_END_SINGULAR'] + " " + word;
    } else if (participanList.length <= 4) {
      let firstParticipant = participanList.splice(0, 1);
      result.simple = participanList.join(', ') + " " + this.LANGUAGE['LIST_CONCAT'] + " " + firstParticipant + " " + this.LANGUAGE['LIST_END_PLURAL'] + " " + word;
    } else {
      let participantCount = participanList.length;
      participanList = participanList.splice(0, 3);
      result.simple = participanList.join(', ');
      result.extended = " " + this.LANGUAGE['LIST_CONCAT'] + " " + (participantCount - 3) + " " + this.LANGUAGE['LIST_END_COUNT'] + " " + word;
    }
    return result;
  }

  getParticipationString(id) {
    if (this.participantMap[id] != undefined && this.participantMap[id].includes(this.global.user.name)) {
      return this.LANGUAGE['CANCEL'];
    } else {
      return this.LANGUAGE['JOIN'];
    }
  }

  switchParticipation(id) {

    if (!this.platform.is('core') && !this.platform.is('mobileweb')) {
      this.localNotifications.clearAll();
    }

    if (this.participantMap[id] != undefined && this.participantMap[id].includes(this.global.user.name)) {
      this.backend.unparticipate();
    } else {
      if (!this.platform.is('core') && !this.platform.is('mobileweb') && this.global.user.allowReminder && id != 'busy') {
        let suggestion = this.suggestionList.find(item => item.id == id);
        if (suggestion == undefined) {
          console.log("Too fast error! Suggestion with ID: " + id + " not ready yet. (or it doesn't exist at all...)");
        }
        //noinspection TypeScriptValidateTypes
        this.localNotifications.schedule({
          text: 'Meetup for lunch in 5 minutes!',
          trigger: {at: new Date(suggestion.time.toDate().getTime() - 300000)}
        });
      }
      this.backend.participate(id);
    }
  }

  onInputChange() {
    setTimeout(this.suggestDate.bind(this), 500);
  }

  suggestDate() {

    //FIXME: remove unsexy js workarround due to not binding Date object
    var selectedTime = new Date();
    selectedTime.setHours(Number(this.selectedTime.substring(0, 2)));
    selectedTime.setMinutes(Number(this.selectedTime.substring(3, 5)));

    var error = false;
    var self = this;
    if (this.suggestionList !== undefined) {
      this.suggestionList.forEach(
        function (suggestion) {
          let suggestionDate = suggestion.time.toDate();
          if (suggestionDate.getMinutes() == selectedTime.getMinutes()
            && suggestionDate.getHours() == selectedTime.getHours()) {
            //date already exists
            self.switchParticipation(suggestion.id);
            error = true;
          }
        }
      );
    }

    if (!error) {
      var id = this.backend.addSuggestion(selectedTime);
      setTimeout(function () {
        self.switchParticipation(id);
      }, 500);
    }

  }

  addSuggestionNow() {
    const confirm = this.alertCtrl.create({
      title: this.LANGUAGE['SHOUT_TITLE'],
      message: this.LANGUAGE['SHOUT_TEXT'],
      buttons: [
        {
          text: this.LANGUAGE['SHOUT_CANCEL']
        },
        {
          text: this.LANGUAGE['SHOUT_CONFIRM'],
          handler: () => {
            this.backend.addSuggestionNow();
          }
        }
      ]
    });
    confirm.present();
  }

  /*
    *	After the app was in standby we will reset the subscription so the data of the correct day is displayed
    *
    */
  onResume() {
    let today = new Date();
    if (this.dayStamp != today.getDay()) {
      this.dayStamp = today.getDay();
      this.suggestionSubscription.unsubscribe();
      this.suggestionSubscription = this.backend.getSuggestions(today).subscribe(data => {
        this.suggestionList = data;
      });
    }
  }
}
