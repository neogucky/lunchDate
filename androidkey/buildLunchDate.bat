call ionic cordova build --release android 
call "C:\Program Files\Java\jdk1.8.0_181\bin\jarsigner.exe"  -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore androidkey\lunchdatekey.jks  platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk  lunchdatekey 
call "C:\Users\neogu\AppData\Local\Android\Sdk\build-tools\28.0.2\zipalign.exe" -f -v 4 platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk build\LunchDate.apk