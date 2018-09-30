import { Component } from '@angular/core';

import { MealPage } from '../meal/meal';
import { TimePage } from '../time/time';
import { SettingsPage } from '../settings/settings';

import { Global } from '../../services/global';
import { FirebaseService } from '../../services/firebase.service';

import { Storage } from '@ionic/storage';

import { App } from "ionic-angular"


@Component({
  templateUrl: 'home.html'
})
export class HomePage {

  tab1Root = MealPage;
  tab2Root = TimePage;
  tab3Root = SettingsPage;

  constructor( private backend: FirebaseService, public global: Global, private storage: Storage, private app: App ) {
  }
  
    ionViewDidLoad() {
		this.backend.getUser().subscribe(data=>{
			if (data !== undefined && data.name !== undefined){
				this.global.participantName = data.name;
				this.app.getRootNav().getActiveChildNav().select(1);
			} else {
				this.app.getRootNav().getActiveChildNav().select(2);
			}
		});
	}
}
