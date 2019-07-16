import { Component } from '@angular/core';
import {NavParams, ModalController} from '@ionic/angular';

@Component({
  selector: 'new-time',
  templateUrl: 'new.page.html',
  styleUrls: ['./new.page.scss'],

})
export class ModalNewPage {

  restaurantList: Array<string>;
  restaurantMap: {};
  restaurant = 'none';
  selectedTime = '11:30';

  constructor(public modalController: ModalController, params: NavParams) {
    // componentProps can also be accessed at construction time using NavParams
    this.restaurantList = params.get('restaurtantList');
    this.restaurantMap = params.get('restaurantMap');

  }

  createNewDate() {
    const data = { restaurant: this.restaurant, selectedTime: this.selectedTime };
    this.modalController.dismiss(data);
  }

  dismissDate() {
    this.modalController.dismiss();
  }

  }
