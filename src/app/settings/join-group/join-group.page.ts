import { Component, OnInit, Input } from '@angular/core';
import {FirebaseService} from '../../firebase.service';
import {NavController} from "@ionic/angular";

@Component({
  selector: 'app-join-group',
  templateUrl: './join-group.page.html',
  styleUrls: ['./join-group.page.scss'],
})
export class JoinGroupPage implements OnInit {

  errorMessage: string;
  groupKey: string;
  successMessage: string;

  constructor(
    private backend: FirebaseService,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {
  }


  async joinGroup() {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.groupKey !== undefined) {
      this.backend.joinGroup(this.groupKey).then((response) => {
        const groupName = '???'
        console.log(response);
        if (groupName === undefined) {
          this.errorMessage = 'Unknown group key. Please check the spelling';
        } else {
          // FIXME: not visible - use toast instead
          this.successMessage = 'Joined group: ' + groupName;
          this.navCtrl.navigateRoot('/settings');
        }
      });
    }

  }
}
