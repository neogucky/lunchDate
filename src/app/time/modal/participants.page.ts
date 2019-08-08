import { Component } from '@angular/core';
import {NavParams, ModalController} from '@ionic/angular';

@Component({
  selector: 'participants',
  templateUrl: './participants.page.html',
  styleUrls: ['./participants.page.scss'],

})
export class ModalParticipantsPage {

  participantMap: {};

  constructor(public modalController: ModalController, params: NavParams) {
    // componentProps can also be accessed at construction time using NavParams
    this.participantMap = params.get('participantMap');

  }

  dismiss() {
    this.modalController.dismiss();
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

  getAvatar(participant) {
      return 'background-image: https://firebasestorage.googleapis.com/v0/b/lunchdate-18cb9.appspot.com/o/'
        + participant.uid + '.jpg?alt=media';
  }
}
