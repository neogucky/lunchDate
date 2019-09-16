import {Component, OnInit, ViewChild} from '@angular/core';
import {AlertController, ModalController, Platform, ToastController} from '@ionic/angular';
import {Global} from '../global';
import {ModalNewPage} from './modal/new.page';
import {FirebaseService} from '../firebase.service';
import {TranslateService} from '@ngx-translate/core';
import {LocalNotifications} from '@ionic-native/local-notifications/ngx';
import {ModalParticipantsPage} from './modal/participants.page';

@Component({
  selector: 'app-time',
  templateUrl: './time.page.html',
  styleUrls: ['./time.page.scss'],
})
export class TimePage {

  suggestionList: any;
  participantMap: any;
  participants: any;
  suggestionSubscription: any;
  dayStamp: number;
  restaurantMap: any = {};

  // FIXME: check if {static: true} works or dynamic is needed
  @ViewChild('datePicker') datePicker;

  // language (async loading)
  LANGUAGE: any = {
    PARTICIPANTS_TITLE: 'TIME.PARTICIPANTS_TITLE',
    LIST_CONCAT: 'TIME.LIST_CONCAT',
    LIST_END_SINGULAR: 'TIME.LIST_END_SINGULAR',
    LIST_END_PLURAL: 'TIME.LIST_END_PLURAL',
    LIST_END_COUNT: 'TIME.LIST_END_COUNT',
    CLOSE: 'GLOBAL.CLOSE',
    LUNCHER_NOBODY: 'TIME.LUNCHER_NOBODY',
    BUSY_NOBODY: 'TIME.BUSY_NOBODY',
    BUSY: 'TIME.BUSY',
    GOING: 'TIME.GOING',
    CANCEL: 'TIME.CANCEL',
    JOIN: 'TIME.JOIN',
    SHOUT_TITLE: 'TIME.SHOUT_TITLE',
    SHOUT_TEXT: 'TIME.SHOUT_TEXT',
    SHOUT_CONFIRM: 'TIME.SHOUT_CONFIRM',
    SHOUT_CANCEL: 'TIME.SHOUT_CANCEL',
    MEET_REMINDER: 'TIME.MEET_REMINDER'
  };


  constructor(
    public global: Global,
    private backend: FirebaseService,
    private toastCtrl: ToastController,
    private localNotifications: LocalNotifications,
    public alertCtrl: AlertController,
    private platform: Platform,
    private translate: TranslateService,
    public modalController: ModalController) {

    this.participantMap = {};

    const today = new Date();

    const self = this;
    this.dayStamp = today.getDay();

    // Load language
    for (const key of Object.keys(self.LANGUAGE)) {
      translate.get(self.LANGUAGE[key]).subscribe(
        value => {
          // value is our translated string
          self.LANGUAGE[key] = value;
        }
      );
    }

    self.backend.getRestaurantList().subscribe(data => {
      data.forEach((restaurant) => {
        self.restaurantMap[restaurant.uid] = restaurant;
      });
    });

    document.addEventListener('resume', this.onResume.bind(this), false);

    // FIXME: What to do if no group? Call function later again!
    // FIXME: What to do if group deleted?
    if (this.global.user.group !== undefined) {
      this.suggestionSubscription = backend.getSuggestions(today).subscribe(data => {
        this.suggestionList = data;
      });
      backend.getParticipants().subscribe(data => {
        self.participants = data;
        self.participantMap = {};

        self.participants.forEach((participant) => {
          if (self.participantMap[participant.suggestionID] === undefined) {
            self.participantMap[participant.suggestionID] = [];
          }
          self.participantMap[participant.suggestionID].push({name: participant.name, uid: participant.uid, avatar: participant.avatar});
        });
      });
    }

  }

  async showParticipants(id) {
    const modal = await this.modalController.create(
      {
        component: ModalParticipantsPage,
        componentProps: {participantMap: this.participantMap[id]}
      });
    modal.present();
  }

  /*
     *	FIXME: cleanup this function (multiple cases + busy/going is too complicated)
     */
  getParticipants(id) {

    let result = '';

    if (this.participantMap[id] === undefined || this.participantMap[id].length === 0) {
      if (id !== 'busy') {
        result = this.LANGUAGE.LUNCHER_NOBODY;
      } else {
        result = this.LANGUAGE.BUSY_NOBODY;
      }
    } else {
      for (const participant of this.participantMap[id]) {
        result += '<span>' + this.getInitials(participant) + '</span>';
      }
    }

    return result;
  }

  getInitials(participant) {
    let initials = '';
    const names = participant.name.split(' ');
    for (const name of names) {
      if (initials.length <= 1) {
        initials += name.charAt(0);
      }
    }
    if (initials.length === 1) {
      initials += participant.name.charAt(1);
    }
    return initials;
  }

  getParticipationString(id) {
    if (this.participantMap[id] !== undefined &&
      this.participantMap[id].find(participant => participant.name === this.global.user.name) !== undefined) {
      return this.LANGUAGE.CANCEL;
    } else {
      return this.LANGUAGE.JOIN;
    }
  }

  switchParticipation(id) {

    if (!this.platform.is('pwa') && !this.platform.is('mobileweb')) {
      this.localNotifications.clearAll();
    }

    if (this.participantMap[id] !== undefined && this.participantMap[id].find(participant => participant.name === this.global.user.name) !== undefined ) {
      this.backend.unparticipate();
    } else {
      if (!this.platform.is('pwa') && !this.platform.is('mobileweb') && this.global.user.allowReminder && id !== 'busy') {
        const suggestion = this.suggestionList.find(item => item.id === id);
        if (suggestion === undefined) {
          console.log('Too fast error! Suggestion with ID: ' + id + ' not ready yet. (or it doesn\'t exist at all...)');
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

  suggestDate(time, locationID) {

    // FIXME: remove unsexy js workarround due to not binding Date object
    const selectedTime = new Date();
    selectedTime.setHours(Number(time.substring(0, 2)));
    selectedTime.setMinutes(Number(time.substring(3, 5)));

    let error = false;
    const self = this;
    if (this.suggestionList !== undefined) {
      this.suggestionList.forEach(
        (suggestion) => {
          const suggestionDate = suggestion.time.toDate();
          if (suggestionDate.getMinutes() === selectedTime.getMinutes()
            && suggestionDate.getHours() === selectedTime.getHours()
            && suggestion.restaurantID === locationID) {
            // date already exists
            self.switchParticipation(suggestion.id);
            error = true;
          }
        }
      );
    }

    if (!error) {
      let locationName = '';
      if (locationID !== 'none') {
        locationName = self.restaurantMap[locationID].name;
      }
      const id = self.backend.addSuggestion(selectedTime, locationID, locationName);
      setTimeout(() => {
        self.switchParticipation(id);
      }, 500);
    }

  }

  async addSuggestionNow() {
    const confirm = await this.alertCtrl.create({
      header: this.LANGUAGE.SHOUT_TITLE,
      message: this.LANGUAGE.SHOUT_TEXT,
      buttons: [
        {
          text: this.LANGUAGE.SHOUT_CANCEL
        },
        {
          text: this.LANGUAGE.SHOUT_CONFIRM,
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
    const today = new Date();
    if (this.dayStamp !== today.getDay()) {
      this.dayStamp = today.getDay();
      this.suggestionSubscription.unsubscribe();
      this.suggestionSubscription = this.backend.getSuggestions(today).subscribe(data => {
        this.suggestionList = data;
      });
    }
  }

  async presentModal() {
    const modal = await this.modalController.create(
      {
        component: ModalNewPage,
        componentProps: {restaurtantList: this.global.group.restaurants, restaurantMap: this.restaurantMap}
      });
    modal.present();
    const result = await modal.onDidDismiss();
    this.suggestDate(result.data.selectedTime, result.data.restaurant);
  }

}
