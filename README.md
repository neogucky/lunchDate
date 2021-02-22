# lunchDate
An App to find a time and location to go to lunch with your colleagues 

## Setup

1. install all dependencies 

packages:
```
npm install
```

2. install ionic CLI globally

```
npm install -g @ionic/cli
```

3. create config.ts with firebase config, for security reasons this should never be checked in to a public repository

```
export const firebaseConfig = {
  fire: {
    apiKey: 'YOUR-API-KEY',
    authDomain: 'YOUR-AUTH-DOMAIN',
    databaseURL: 'YOUR-DATABASE-URL',
    projectId: 'YOUR-PROJECT-ID',
    storageBucket: 'YOUR-STORAGE-BUCKET',
    messagingSenderId: 'YOUR-SENDER-ID'
  }
};
```

*Note to self:* copy config.ts from onedrive

4. serve app

```
ionic serve
```

## Roadmap

Sorry, since I don't use this app anymore myself at the moment I don't actively work on this repo. If you have interest in adapting your own version or want to improve this one feel free to contact me. Also the app is currently not available on the App Stores anymore, as I haven't maintained it there. If there is honest interest in having it back (and maybe some help with paying for the Apple Dev Account) I will gladly make it available again. 


