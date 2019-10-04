import { Component, OnInit, Input } from '@angular/core';
import {FirebaseService} from '../../firebase.service';
import {NavController} from '@ionic/angular';
import {Global} from '../../global';

@Component({
  selector: 'app-join-group',
  templateUrl: './join-group.page.html',
  styleUrls: ['./join-group.page.scss'],
})
export class JoinGroupPage implements OnInit {

  errorMessage: string;
  groupKey: string;
  successMessage: string;
  loading = false;

  constructor(
    private backend: FirebaseService,
    private navCtrl: NavController,
    private global: Global,
  ) { }

  ngOnInit() {
  }

  async joinGroup() {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.groupKey !== undefined) {
      this.loading = true;
      this.backend.joinGroup(this.groupKey.toUpperCase()).then((response) => {
        this.waitForServer();
      });
    }
  }

  waitForServer() {
    if (this.global.user.groupKey === undefined || this.global.user.groupKey === '' ) {
      this.loading = false;
      this.navCtrl.navigateRoot('home/settings');
    } else {
      setTimeout(this.waitForServer.bind(this), 500);
    }
  }
}
