import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NavigationExtras} from '@angular/router';
import {FirebaseService} from '../../firebase.service';
import {NavController} from '@ionic/angular';
import {Global} from "../../global";

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.page.html',
  styleUrls: ['./create-group.page.scss'],
})
export class CreateGroupPage implements OnInit {

  mailMatch = false;
  mailMatchDomain;
  errorMessage: string;
  successMessage: string;
  form: FormGroup;
  loading = false;

  constructor(
    private backend: FirebaseService,
    private navCtrl: NavController,
    private global: Global,
    fb: FormBuilder
  ) {
    this.form = fb.group({
      group_name: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      group_key: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      mail_match: []
    });
  }

  ngOnInit() {
    this.mailMatchDomain = this.backend.getUserMail().replace(/.*@/, '');
  }

  createGroup() {
    const data = this.form.value;
    const self = this;

    if (data.group_name === '' || data.group_key === '') {
      this.errorMessage = 'Please enter a group name and key.';
      return;
    }

    this.loading = true;
    this.backend.createGroup({
      group_name: data.group_name,
      group_key: data.group_key.toUpperCase(),
      mail_match: data.mail_match,
      mailMatchDomain: this.mailMatchDomain
    }).then( () => {
      self.backend.joinGroup(data.group_key.toUpperCase()).then((response) => {
          this.waitForServer();
      });
    });

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
