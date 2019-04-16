import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NavController, NavParams} from 'ionic-angular';
import {HomePage} from '../home/home';
import {AuthService} from '../../services/auth.service';
import {Global} from '../../services/global';

@Component({
  selector: 'page-signup',
  templateUrl: './signup.html'
})
export class SignupPage {
  signupError: string = '';
  form: FormGroup;
  callback: any;

  constructor(
    fb: FormBuilder,
    private navCtrl: NavController,
    private auth: AuthService,
    private global: Global,
    private navParams: NavParams
  ) {
    this.form = fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });
    this.callback = this.navParams.get("callback");
  }

  signup() {
    let data = this.form.value;
    let self = this;

    let credentials = {
      email: data.email,
      password: data.password
    };

    if (data.email === '' || data.password === '') {
      this.signupError = "Please enter your mail address and password!";
      return;
    }

    this.global.registeredNewUser = true;

    this.auth.signUp(credentials).then(
      () => {
        self.auth.sendEmailVerification();
        this.callback(credentials.email, credentials.password).then( () => {
          this.navCtrl.pop();
        });
      },
      error => this.signupError = error.message
    );
  }
}
