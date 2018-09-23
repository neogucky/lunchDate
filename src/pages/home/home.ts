import { Component } from '@angular/core';

import { MealPage } from '../meal/meal';
import { TimePage } from '../time/time';
import { SettingsPage } from '../settings/settings';

@Component({
  templateUrl: 'home.html'
})
export class HomePage {

  tab1Root = MealPage;
  tab2Root = TimePage;
  tab3Root = SettingsPage;

  constructor() {

  }
}
