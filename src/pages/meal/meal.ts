import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import '../../services/date.extension';
import {FirebaseService} from '../../services/firebase.service';
import {Global} from '../../services/global';

@Component({
  selector: 'page-meal',
  templateUrl: 'meal.html'
})

export class MealPage {

    week: number;
    restaurants: any;

    constructor(public navCtrl: NavController, private backend: FirebaseService, public global: Global) {
        //needed to offer pdf menu for cafeteria
        this.week = new Date().getWeekNumber();
        this.restaurants = {};
    }

    ionViewDidLoad() {
        let self = this;
        let today = new Date();

        //FIXME: after the timeout group should be loaded
        setTimeout(() => {
            self.global.group.restaurants.forEach(function(restaurantID) {
                self.restaurants[restaurantID] = {
                    menu: [],
                    details: {}
                };
                self.backend.getMenu(restaurantID, today).subscribe(data => {
                    self.restaurants[restaurantID].menu = [];
                    data.forEach(function(menu) {
                        self.restaurants[restaurantID].menu.push(menu);
                    });
                });
                self.backend.getRestaurant(restaurantID).subscribe(restaurant => {
                    self.restaurants[restaurantID].details = restaurant;
                    console.log(self.restaurants);
                });
            });
        }, 2000)
    }

    getRestaurants() {
        return Object.keys(this.restaurants).map(key => this.restaurants[key]);
    }

    getFoodImage(meal) {
        if (meal.foodDescription.includes("Pizza") ||
            meal.foodDescription.includes("pizza")) {
            return "pizza";
        } else if (meal.foodDescription.includes("Pasta") ||
            meal.foodDescription.includes("Nudel") ||
            meal.foodDescription.includes("nudel") ||
            meal.foodDescription.includes("Spaghetti") ||
            meal.foodDescription.includes("Gnocchi")) {
            return "pasta";
        } else if (meal.foodDescription.includes("Suppe") ||
            meal.foodDescription.includes("suppe") ||
            meal.foodDescription.includes("Eintopf") ||
            meal.foodDescription.includes("eintopf")) {
            return "soup";
        } else if (meal.foodDescription.includes("Burger") ||
            meal.foodDescription.includes("burger")) {
            return "burger";
        } else if (meal.foodDescription.includes("Schnitzel") ||
            meal.foodDescription.includes("schnitzel")) {
            return "schnitzel";
        } else if (meal.foodDescription.includes("Currywurst") ||
            meal.foodDescription.includes("Curry-Wurst") ||
            meal.foodDescription.includes("Curry Wurst")) {
            return "currywurst";
        } else if (meal.foodDescription.includes("Kaiserschmarrn") ||
            meal.foodDescription.includes("Kaiser Schmarrn")) {
            return "kaiserschmarrn";
        } else if (meal.foodDescription.includes("Frikadelle") ||
            meal.foodDescription.includes("frikadelle") ||
            meal.foodDescription.includes("Hackbraten")) {
            return "meatball";
        } else if (meal.foodDescription.includes("Fisch") ||
            meal.foodDescription.includes("lachs") ||
            meal.foodDescription.includes("Lachs") ||
            meal.foodDescription.includes("Forelle") ||
            meal.foodDescription.includes("forelle") ||
            meal.foodDescription.includes("fisch")) {
            return "fish";
        } else {
            let random = meal.foodDescription.length % 13 + 1;
            return "generic" + random;
        }
    }
}
