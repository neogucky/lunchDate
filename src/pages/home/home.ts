import { Component } from '@angular/core';

import { MealPage } from '../meal/meal';
import { TimePage } from '../time/time';
import { SettingsPage } from '../settings/settings';

import { Global } from '../../services/global';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  templateUrl: 'home.html'
})
export class HomePage {

  tab1Root = MealPage;
  tab2Root = TimePage;
  tab3Root = SettingsPage;

  constructor( private backend: FirebaseService, public global: Global ) {
  }
  
    ionViewDidLoad() {
		this.backend.getParticipants().subscribe(data=>{
			this.global.participantName = data.name;
		});
	}
}
