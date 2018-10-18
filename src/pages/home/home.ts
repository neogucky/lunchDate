import { Component, ViewChild } from '@angular/core';
import { Tabs } from 'ionic-angular';

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
  
  @ViewChild('tabs') tabs: Tabs;


  constructor( private backend: FirebaseService, public global: Global, private storage: Storage, private app: App ) {
  }
  
    ionViewDidLoad() {	
				
		var initFinished = false; 
		this.backend.getUser().subscribe(data=>{
			if (data !== undefined && data.name !== undefined){
				this.global.participantName = data.name;
				this.global.allowPush = data.allowPush;
				this.global.allowReminder = data.allowReminder;
			}

			//run this only once
			if (!initFinished){
				initFinished = true;
				if (data !== undefined && data.name !== undefined){
					this.tabs.select(1);
				} else {
					this.tabs.select(2);
				}
			}
		});
	}
	
	//FIXME: Workarround for bug where ion-tabs sometimes forgets to highlight correct tab
	switchedTab(){
		let tab = this.tabs.getSelected().index; 
		
		//unselect all
		Array.from(document.querySelectorAll('.tab-button')).forEach( element => element.removeAttribute('aria-selected'));
		//select correct tab
		document.getElementById("tab-t0-"+tab).setAttribute('aria-selected', 'true');
		
	}
	
}
