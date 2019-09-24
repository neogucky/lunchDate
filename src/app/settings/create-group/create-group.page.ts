import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NavigationExtras} from '@angular/router';
import {FirebaseService} from '../../firebase.service';
import {NavController} from '@ionic/angular';

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

  constructor(
    private backend: FirebaseService,
    private navCtrl: NavController,
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

    this.backend.createGroup({
      group_name: data.group_name,
      group_key: data.group_key,
      mail_match: data.mail_match,
      mailMatchDomain: this.mailMatchDomain
    }).then( () => {
      self.backend.joinGroup(data.group_key).then((response) => {
          this.navCtrl.navigateRoot('/settings');
      });
    });

  }
}
