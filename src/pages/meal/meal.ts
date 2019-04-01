import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import '../../services/date.extension';
import {FirebaseService} from '../../services/firebase.service';

@Component({
  selector: 'page-meal',
  templateUrl: 'meal.html'
})

export class MealPage {

  week: number;
  mealMenus: any;

  constructor(public navCtrl: NavController, private backend: FirebaseService) {
    //needed to offer pdf menu for cafeteria
    this.week = new Date().getWeekNumber();
    let self = this;
    let today = new Date();

    backend.getMenu(today).subscribe(data => {
      console.log(data);
      self.mealMenus = [];
      data.forEach(function (menu) {
        if (!(menu.cantineID in self.mealMenus)){
          self.mealMenus[menu.cantineID] = [];
        }
        self.mealMenus[menu.cantineID].push(menu);
      });
    });
  }

  getFoodImage(meal) {
    if (meal.foodDescription.includes("Pizza") ||
        meal.foodDescription.includes("pizza")) {
      return "pizza";
    } else  if (meal.foodDescription.includes("Pasta") ||
                meal.foodDescription.includes("Nudel") ||
                meal.foodDescription.includes("nudel") ||
                meal.foodDescription.includes("Spaghetti") ||
                meal.foodDescription.includes("Gnocchi")) {
      return "pasta";
    } else  if (meal.foodDescription.includes("Suppe") ||
      meal.foodDescription.includes("suppe") ||
      meal.foodDescription.includes("Eintopf") ||
      meal.foodDescription.includes("eintopf")) {
      return "soup";
    } else  if (meal.foodDescription.includes("Burger") ||
      meal.foodDescription.includes("burger")) {
      return "burger";
    } else {
      let random = meal.foodDescription.length % 13 +1;
      return "generic" + random;
    }
  }

}
