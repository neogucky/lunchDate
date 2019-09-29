import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Platform, ToastController} from '@ionic/angular';
import {AuthService} from '../auth.service';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {Global} from '../global';
import * as firebase from 'firebase';
import {FirebaseService} from '../firebase.service';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {ActivatedRoute, Router} from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

    loginForm: FormGroup;
    loginError = '';
    staySignedin: boolean;
    hiddenCounter = 0;
    username: string;
    password: string;
    versionNumber: string;

    constructor(
        private auth: AuthService,
        private toastCtrl: ToastController,
        private splashScreen: SplashScreen,
        private fb: FormBuilder,
        private platform: Platform,
        private backend: FirebaseService,
        public global: Global,
        private appVersion: AppVersion,
        private router: Router,
        private storage: Storage,
        private route: ActivatedRoute
    ) {
        console.log(this.platform);
        this.loginForm = fb.group({
            email: ['', Validators.compose([Validators.required, Validators.email])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
        });

        this.route.queryParams.subscribe(params => {
          if (params && params.user) {
              this.username = params.user.username;
              this.password = params.user.password;
          }
        });
    }

    ngOnInit() {
        this.storage.get('username').then((username) => {
            this.username = username;
        });

        // this will be set false if set false in storage
        this.staySignedin = true;
        this.storage.get('staySignedin').then((staySignedin) => {
            if (staySignedin !== false && !this.global.offline) {

                const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                    if (user) {
                        console.log('splash  user');

                        // Homepage handles splash screen hiding
                        this.loadApp();
                    } else {
                        console.log('splash no user');
                        this.splashScreen.hide();
                    }
                    unsubscribe();
                });
            } else {
                console.log('splash no staySignedin');

                this.staySignedin = false;
                this.splashScreen.hide();
            }
        });

        const dummyVersion = '~1.0.0';
        this.versionNumber = 'version ' + dummyVersion;
        if (this.platform.is('cordova')) {
            this.appVersion.getVersionNumber().then((s) => {
                this.versionNumber = 'version ' + s;
            }).catch((error) => {
                console.log(error);
            });
        }
    }

    async login() {
        const data = this.loginForm.value;

        // store username
        this.storage.set('username', data.email);

        if (!data.email || !data.password) {
            const alert = await this.toastCtrl.create({
                message: 'Please enter mail address and password.',
                duration: 3000,
                position: 'bottom'
            });
            await alert.present();
            return;
        }

        const credentials = {
            email: data.email,
            password: data.password
        };

        this.auth.signInWithEmail(credentials)
            .then(
                () => this.loadApp(),
                error => this.loginError = error.message
            );
    }

    loadApp() {

        if (this.auth === undefined || this.auth.user === undefined || this.auth.user === null) {
            console.log('Failure while logging in. Logging in again');
            this.login();
            return;
        }

        let initFinished = false;
        this.backend.getUser().subscribe(data => {
            if (data !== undefined) {

                // activate push & reminder by default
                if (data.allowPush === undefined) {
                    data.allowPush = true;
                }
                if (data.allowReminder === undefined) {
                    data.allowReminder = true;
                }
                this.global.user = data;
            } else if (data.name !== undefined) {
                this.global.user = data;
            } else {
                this.global.user = {name: ''};
            }

            // get group
            if (this.global.user.group !== undefined && this.global.user.group !== '' ) {
              this.backend.getGroup().subscribe((group) => {
                if (group !== undefined && group.name !== undefined) {
                  this.global.group = group;
                } else {
                  this.global.group = {name: 'none', roles: []};
                }

                // run this only once
                if (!initFinished) {
                  setTimeout(() => {
                    this.splashScreen.hide();
                    console.log('end splash autologin');
                  }, 1000);

                  // FIXME: this should be done only once when first setting the language
                  this.backend.setLanguage(this.global.language);

                  initFinished = true;
                  this.router.navigateByUrl('/home');
                }
              });
            }
        });
    }

    signup() {
      this.router.navigate(['signup']);
    }

    goToPrivacy() {
      this.router.navigate(['privacy']);
    }

    onStaySignedin() {
          this.storage.set('staySignedin', this.staySignedin);
    }

    async hiddenLogin() {
        if (this.hiddenCounter++ === 5) {
            const alert = await this.toastCtrl.create({
                message: 'Developer login enabled',
                duration: 1000,
                position: 'bottom'
            });
            await alert.present();
            this.username = 'neo_gucky@gmx.de';
            this.password = 'testtest';
        }
    }

    hiddenDebugJump() {
        if (this.hiddenCounter++ === 5) {
            this.loadApp();
        }
    }

}
