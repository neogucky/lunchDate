import { Component } from '@angular/core';
import {ViewController, NavParams} from "ionic-angular";


@Component({
  selector: 'new-time',
  templateUrl: 'new.html'
})
export class ModalNew {

  restaurantList: Array<String>;
  restaurantMap: {};
  restaurant: String = "none";
  selectedTime: String = "11:30";

  constructor(public viewCtrl: ViewController, params: NavParams) {
    // componentProps can also be accessed at construction time using NavParams
    this.restaurantList = params.get('restaurtantList');
    this.restaurantMap = params.get('restaurantMap');

  }

  createNewDate() {
    let data = { 'restaurant': this.restaurant, 'selectedTime': this.selectedTime };
    this.viewCtrl.dismiss(data);
  }

  dismissDate() {
    this.viewCtrl.dismiss();
  }

  }
