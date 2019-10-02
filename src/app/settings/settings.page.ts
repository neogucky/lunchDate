import { Component, OnInit } from '@angular/core';
import { AlertController, Events, NavController, Platform, ToastController} from '@ionic/angular';
import { AuthService } from '../auth.service';
import { FirebaseService } from '../firebase.service';
import { Global } from '../global';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';


let self;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  onEditTimer: any;
  userImage;
  imageUpload = '';

  // language (async loading)
  LANGUAGE: any = {
    ABOUT: 'SETTINGS.ABOUT',
    ABOUT_TITLE: 'SETTINGS.ABOUT_TITLE',
    ABOUT_TEXT: 'SETTINGS.ABOUT_TEXT',
    NAME_CHANGED: 'SETTINGS.NAME_CHANGED'
  };

  constructor(
      public events: Events,
      private toastCtrl: ToastController,
      public global: Global,
      public auth: AuthService,
      private backend: FirebaseService,
      private platform: Platform,
      public alertCtrl: AlertController,
      private translate: TranslateService,
      private storage: Storage,
      private navCtrl: NavController,
      private crop: Crop,
      private imagePicker: ImagePicker,
      private base64: Base64,
      private imageResizer: ImageResizer,
      private webView: WebView) {

    self = this;

    // Load language
    for (const key of Object.keys(this.LANGUAGE)) {
      translate.get(this.LANGUAGE[key]).subscribe(
          value => {
            // value is our translated string
            this.LANGUAGE[key] = value;
          }
      );
    }
  }

  ngOnInit() {
    console.log('user', this.global.user);
  }

  // update name when 1 second no input
  onInput() {
    if (this.onEditTimer !== undefined) {
      clearTimeout(this.onEditTimer);
    }

    this.onEditTimer = setTimeout(this.changeName, 3000);
  }

  onAllowPush() {

    if (this.global.user.group === undefined) {
      return;
    }

    this.backend.updateUserAllowPush(this.global.user.allowPush);

    if (this.platform.is('pwa') || this.platform.is('mobileweb')) {
      return;
    }
  }

  onAllowReminder() {
    this.backend.updateUserAllowReminder(this.global.user.allowReminder);
  }

  onLanguageChange() {
    this.storage.set('language', this.global.language);
    this.translate.use(this.global.language);
  }

  async onAbout() {
    // FIXME: show this in a dedicated view with better formatting
    const confirm = await this.alertCtrl.create({
      header: this.LANGUAGE.ABOUT,
      message: '<span style="color:black">' +
          this.LANGUAGE.ABOUT_TITLE +
          this.LANGUAGE.ABOUT_TEXT +
          '</span>',
      buttons: [
        {
          text: 'Close'
        }
      ]
    });
    confirm.present();
  }

  showGroups() {
  }

  showGroupCreate() {
  }

  private async changeName() {

    if (self.global.user.name === undefined || self.global.user.name === '') {
      return;
    }

    self.backend.updateUserName(self.global.user.name);

    /* always show toast in top as not to overlap the navigation bar */
    const alert = await self.toastCtrl.create({
      message: self.LANGUAGE.NAME_CHANGED + ' "' + self.global.user.name + '"',
      duration: 3000,
      position: 'top'
    });
    alert.present();
  }

  logout() {
    this.auth.signOut().then( () => {
      this.navCtrl.navigateRoot('/login');
        }
    ).catch(e => {
      console.log(e);
    });
  }

  selectImage() {
    self.imageUpload = 'selecting';
    this.imagePicker.hasReadPermission().then(
      (hasReadPermission) => {
        if (!hasReadPermission) {
          // no callbacks required as this opens a popup which returns async
          this.imagePicker.requestReadPermission();
        } else {
          this.imagePicker.getPictures({
            maximumImagesCount: 1
          }).then(
            (images) => {
              self.imageUpload = '';
              if (images.length !== 0) {
                this.crop.crop(images[0], {quality: 100})
                  .then(
                    newImage => this.uploadImageToFirebase(newImage),
                    err => {
                      console.error('Error cropping image', err);
                    }
                  );
              }
              }, (err) => {
                console.log('Error opening gallery', err);
                self.imageUpload = '';
              }
          ).catch((err) => {
            console.log(err);
            self.imageUpload = '';
          });
        }
      }, (err) => {
        console.log(err);
        self.imageUpload = '';
      });
  }

  uploadImageToFirebase(image) {
    self.imageUpload = 'uploading';

    const options = {
      uri: image,
      folderName: 'upload',
      fileName: 'avatar.jpg',
      quality: 100,
      width: 70,
      height: 70
    } as ImageResizerOptions;

    self.imageResizer
      .resize(options)
      .then((filePath: string) => {
        self.base64.encodeFile(self.webView.convertFileSrc(filePath)).then((base64File: string) => {
          self.backend.uploadFile(base64File, (url) => {
            self.userImage = url;
            self.imageUpload = '';
          });
        }).catch( (error) => {
          console.error(error);
          self.imageUpload = '';
        });
      }).catch(error => {
        console.error(error);
        self.imageUpload = '';
      });
  }

  async leaveGroup() {
      this.backend.leaveGroup().then(async (response) => {
        const alert = await self.toastCtrl.create({
          message: 'left group',
          duration: 3000,
          position: 'top'
        });
        alert.present();
      });
  }
}
