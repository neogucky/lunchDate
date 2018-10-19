import { Component, ViewChild } from '@angular/core';
import { Tabs, NavController, App, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Global } from '../../services/global';
import { FirebaseService } from '../../services/firebase.service';

import { MealPage } from '../meal/meal';
import { TimePage } from '../time/time';
import { SettingsPage } from '../settings/settings';
import { LoginPage } from '../../pages/login/login';

@Component({
  templateUrl: 'home.html'
})
export class HomePage {

  tab1Root = MealPage;
  tab2Root = TimePage;
  tab3Root = SettingsPage;
  
  @ViewChild('tabs') tabs: Tabs;


  constructor( 
	  public events: Events,
	  private backend: FirebaseService, 
	  public global: Global, 
	  private storage: Storage, 
	  private app: App, 
	  public navCtrl: NavController ) {
	  events.subscribe('navigate:loginpage', () => {
		  //we use this so the ion tab controller page (home.ts) will navigate to login page if a tab triggers this.
		  this.navCtrl.setRoot(LoginPage);
	  });
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
				console.log(this.tabs);
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
		let id: string;
		Array.from(document.querySelectorAll('.tab-button')).forEach( element => {
			id = element.id;
			if (id[id.length -1] == String(this.tabs.getSelected().index)){
				element.setAttribute('aria-selected', 'true');
			} else {
				element.removeAttribute('aria-selected')
			}
		});		
	}
	
}
