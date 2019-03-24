jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore lunchdatekey.jks  ../platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk  lunchdatekey
zipalign -v 4 ../platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk build/LunchDate.apk
