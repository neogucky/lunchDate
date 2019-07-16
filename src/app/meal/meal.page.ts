import { Component, OnInit } from '@angular/core';
import {NavController} from '@ionic/angular';
import {FirebaseService} from '../firebase.service';
import '../date.extension';
import {Global} from '../global';

@Component({
  selector: 'app-meal',
  templateUrl: './meal.page.html',
  styleUrls: ['./meal.page.scss'],
})
export class MealPage implements OnInit {

  week: number;
  restaurants: any;
  restaurantList: Array<any> = new Array<any>();

  constructor(public navCtrl: NavController, private backend: FirebaseService, public global: Global) {
    // needed to offer pdf menu for cafeteria
    this.week = new Date().getWeekNumber();
    this.restaurants = {};
  }

  ngOnInit() {
    const self = this;
    const today = new Date();
    console.log('meal', 'ionViewDidLoad');

    if (self.global.group !== undefined && self.global.group.restaurants !== undefined) {
      self.global.group.restaurants.forEach((restaurantID) => {
        self.restaurants[restaurantID] = {
          menu: [],
          details: {}
        };
        self.backend.getMenu(restaurantID, today).subscribe(data => {
          self.restaurants[restaurantID].menu = [];
          data.forEach( (meal) => {
            meal.image = self.getFoodImage(meal);
            self.restaurants[restaurantID].menu.push(meal);
          });
          self.updateRestaurantList();
        });
        self.backend.getRestaurant(restaurantID).subscribe(restaurant => {
          self.restaurants[restaurantID].details = restaurant;
          self.updateRestaurantList();
        });
      });
    }
  }

  updateRestaurantList() {
    this.restaurantList = Object.keys(this.restaurants).map(key => this.restaurants[key]);
  }

  getFoodImage(meal) {
    if (meal.foodDescription.includes('Lahmacun') ||
        meal.foodDescription.includes('lahmacun') ||
        meal.foodDescription.includes('Türkische "Pizza"')) {
      return 'lahmacun';
    } else if (meal.foodDescription.includes('Pizza') ||
        meal.foodDescription.includes('pizza')) {
      return 'pizza';
    } else if (meal.foodDescription.includes('Pasta') ||
        meal.foodDescription.includes('Nudel') ||
        meal.foodDescription.includes('nudel') ||
        meal.foodDescription.includes('Spaghetti') ||
        meal.foodDescription.includes('Gnocchi')) {
      return 'pasta';
    } else if (meal.foodDescription.includes('Bockwurst') ||
        meal.foodDescription.includes('Wurst') ||
        meal.foodDescription.includes('Bratwurst') ||
        meal.foodDescription.includes('Bratwürste') ||
        meal.foodDescription.includes('Würste') ||
        meal.foodDescription.includes('Sausage')) {
      return 'sausage';
    } else if (meal.foodDescription.includes('Ramen') ||
        meal.foodDescription.includes('Asia Suppe') ||
        meal.foodDescription.includes('asiatische Suppe') ||
        meal.foodDescription.includes('Asiasuppe')) {
      return 'ramen';
    } else if (meal.foodDescription.includes('Suppe') ||
        meal.foodDescription.includes('suppe') ||
        meal.foodDescription.includes('Eintopf') ||
        meal.foodDescription.includes('eintopf')) {
      return 'soup';
    } else if (meal.foodDescription.includes('Burger') ||
        meal.foodDescription.includes('burger')) {
      return 'burger';
    } else if (meal.foodDescription.includes('Falafel') ||
        meal.foodDescription.includes('Falaffel')) {
      return 'falafel';
    } else if (meal.foodDescription.includes('Schnitzel') ||
        meal.foodDescription.includes('schnitzel')) {
      return 'schnitzel';
    } else if (meal.foodDescription.includes('Currywurst') ||
        meal.foodDescription.includes('Curry-Wurst') ||
        meal.foodDescription.includes('Curry Wurst')) {
      return 'currywurst';
    } else if (meal.foodDescription.includes('Kaiserschmarrn') ||
        meal.foodDescription.includes('Kaiser Schmarrn')) {
      return 'kaiserschmarrn';
    } else if (meal.foodDescription.includes('Pfannkuchen') ||
        meal.foodDescription.includes('Eierkuchen') ||
        meal.foodDescription.includes('Pfankuchen') ||
        meal.foodDescription.includes('Pancake')) {
      return 'pancake';
    } else if (meal.foodDescription.includes('Frikadelle') ||
        meal.foodDescription.includes('frikadelle') ||
        meal.foodDescription.includes('Hackbraten') ||
        meal.foodDescription.includes('hacksteak') ||
        meal.foodDescription.includes('Hacksteak')) {
      return 'meatball';
    } else if (meal.foodDescription.includes('Geschnetzeltes') ||
        meal.foodDescription.includes('geschnetzeltes')) {
      return 'dicedmeat';
    } else if (meal.foodDescription.includes('Fisch') ||
        meal.foodDescription.includes('lachs') ||
        meal.foodDescription.includes('Lachs') ||
        meal.foodDescription.includes('Forelle') ||
        meal.foodDescription.includes('forelle') ||
        meal.foodDescription.includes('fisch')) {
      return 'fish';
    } else if (meal.foodDescription.includes('Chicken Crossies') ||
        meal.foodDescription.includes('Chicken Nuggets') ||
        meal.foodDescription.includes('Chicken-Crossies') ||
        meal.foodDescription.includes('Chicken-Nuggets')) {
      return 'nuggets';
    } else if (meal.foodDescription.includes('Apfelstrudel')) {
      return 'strudel';
    } else if (meal.foodDescription.includes('Curry') ||
        meal.foodDescription.includes('curry')) {
      return 'curry';
    } else if (meal.foodDescription.includes('Süßkartoffel') ||
        meal.foodDescription.includes('Sweet Potato') ||
        meal.foodDescription.includes('Sweet-Potato') ||
        meal.foodDescription.includes('Sweetpotato') ||
        meal.foodDescription.includes('sweet potato')) {
      return 'sweet-potato';
    } else if (meal.foodDescription.includes('Sandwich') ||
        meal.foodDescription.includes('Baguette') ||
        meal.foodDescription.includes('baguette')) {
      return 'sandwich';
    } else if (meal.foodDescription.includes('Tortilia') ||
        meal.foodDescription.includes('Tortilla') ||
        meal.foodDescription.includes('Wrap') ||
        meal.foodDescription.includes('Burrito') ||
        meal.foodDescription.includes('Fajita')) {
      return 'tortilla';
    } else if (meal.foodDescription.includes('Schweinesteak') ||
        meal.foodDescription.includes('Schweinerückensteak') ||
        meal.foodDescription.includes('Schweinefkleisch') ||
        meal.foodDescription.includes('Schweinebraten')) {
      return 'pork';
    } else if (meal.foodDescription.includes('Börek') ||
        meal.foodDescription.includes('Baklava') ||
        meal.foodDescription.includes('Blätterteig')) {
      return 'baklava';
    } else if (meal.foodDescription.includes('Steak') ||
        meal.foodDescription.includes('steak') ||
        meal.foodDescription.includes('Rinderbraten')) {
      return 'steak';
    } else if (meal.foodDescription.includes('Gyros') ||
        meal.foodDescription.includes('gyros')) {
      return 'gyros';
    } else {
      const random = meal.foodDescription.length % 13 + 1;
      return 'generic' + random;
    }
  }

}
