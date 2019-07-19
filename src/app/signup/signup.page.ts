import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NavController, NavParams} from '@ionic/angular';
import {AuthService} from '../auth.service';
import {Global} from '../global';
import {NavigationExtras} from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {

  signupError = '';
  form: FormGroup;

  constructor(
      fb: FormBuilder,
      private navCtrl: NavController,
      private auth: AuthService,
      private global: Global
  ) {
    this.form = fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  signup() {
    const data = this.form.value;
    const self = this;

    const credentials = {
      email: data.email,
      password: data.password
    };

    if (data.email === '' || data.password === '') {
      this.signupError = 'Please enter your mail address and password!';
      return;
    }

    this.global.registeredNewUser = true;

    this.auth.signUp(credentials).then(
        () => {
          self.auth.sendEmailVerification();
          const navigationExtras: NavigationExtras = {
            queryParams: {
              user: credentials
            }
          };
          this.navCtrl.navigateBack(['login'], navigationExtras);
        },
        error => this.signupError = error.message
    );
  }
}
