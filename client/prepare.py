"""Prepare distinct LimoTools installers without changing upstream sources in git."""
import json
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
desktop = root / 'native/desktop'
android = root / 'native/android/app'
enhancement = (root / 'client/enhancements.js').read_text(encoding='utf-8').replace('.msg-text{font-size:', '.bubble{font-size:')
(desktop / 'enhancements.js').write_text(enhancement, encoding='utf-8')
package = json.loads((desktop / 'package.json').read_text(encoding='utf-8'))
package.update(name='limotools-desktop', version='0.1.0', description='LimoTools — alternative Limochat client', author='LimoTools')
package['build'].update(appId='io.limotools.desktop', productName='LimoTools')
package['build']['win']['artifactName'] = 'LimoTools-Setup-${version}-${arch}.exe'
package['build']['files'].append('enhancements.js')
(desktop / 'package.json').write_text(json.dumps(package, indent=2)+'\n', encoding='utf-8')
main = (desktop / 'main.cjs').read_text(encoding='utf-8').replace('io.limochat.desktop','io.limotools.desktop').replace('Limochat','LimoTools')
needle = "  if(process.argv.includes('--smoke'))"
assert needle in main
main = main.replace(needle, "  win.webContents.on('did-finish-load',()=>{if(trusted(win.webContents.getURL()))win.webContents.executeJavaScript(fs.readFileSync(path.join(__dirname,'enhancements.js'),'utf8')).catch(()=>{});});\n"+needle)
(desktop / 'main.cjs').write_text(main, encoding='utf-8')
gradle = (android / 'build.gradle').read_text(encoding='utf-8').replace("applicationId 'io.limochat.app'", "applicationId 'io.limotools.app'").replace("versionCode 2; versionName '1.1.0-test'", "versionCode 1; versionName '0.1.0'").replace("applicationIdSuffix '.browser'; ", '')
(android / 'build.gradle').write_text(gradle, encoding='utf-8')
shutil.copy(root / 'client/MainActivity.java', android / 'src/main/java/io/limochat/app/MainActivity.java')
assets = android / 'src/main/assets'
assets.mkdir(parents=True, exist_ok=True)
(assets / 'enhancements.js').write_text(enhancement, encoding='utf-8')
(android / 'src/main/AndroidManifest.xml').write_text('''<manifest xmlns:android="http://schemas.android.com/apk/res/android">
 <uses-permission android:name="android.permission.INTERNET"/>
 <uses-permission android:name="android.permission.CAMERA"/>
 <uses-permission android:name="android.permission.RECORD_AUDIO"/>
 <uses-feature android:name="android.hardware.camera" android:required="false"/>
 <uses-feature android:name="android.hardware.microphone" android:required="false"/>
 <application android:allowBackup="false" android:usesCleartextTraffic="false" android:label="LimoTools" android:icon="@drawable/app_icon" android:theme="@style/AppTheme">
  <activity android:name="io.limochat.app.MainActivity" android:exported="true" android:windowSoftInputMode="adjustResize">
   <intent-filter><action android:name="android.intent.action.MAIN"/><category android:name="android.intent.category.LAUNCHER"/></intent-filter>
  </activity>
 </application>
</manifest>''', encoding='utf-8')
print('Prepared LimoTools 0.1.0')
