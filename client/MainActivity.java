package io.limochat.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.*;
import android.widget.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

/** Separate LimoTools session; no JavaScript bridge or file access. */
public class MainActivity extends Activity {
 private static final String HOME="https://81-90-31-167.sslip.io/";
 private WebView web; private ValueCallback<Uri[]> picker; private PermissionRequest media;
 private String enhancement="";
 private boolean trusted(String value){try{Uri u=Uri.parse(value);return "https".equals(u.getScheme())&&"81-90-31-167.sslip.io".equals(u.getHost())&&(u.getPort()==-1||u.getPort()==443)&&u.getUserInfo()==null;}catch(Exception e){return false;}}
 private void outside(String url){try{Uri u=Uri.parse(url);if("https".equals(u.getScheme())||"http".equals(u.getScheme())||"mailto".equals(u.getScheme()))startActivity(new Intent(Intent.ACTION_VIEW,u));}catch(Exception e){Toast.makeText(this,"Не удалось открыть ссылку",Toast.LENGTH_SHORT).show();}}
 @Override public void onCreate(Bundle state){
  super.onCreate(state);
  try(java.io.InputStream input=getAssets().open("enhancements.js");java.io.ByteArrayOutputStream bytes=new java.io.ByteArrayOutputStream()){byte[] buffer=new byte[4096];int n;while((n=input.read(buffer))!=-1)bytes.write(buffer,0,n);enhancement=new String(bytes.toByteArray(),StandardCharsets.UTF_8);}catch(Exception e){Toast.makeText(this,"Настройки клиента недоступны",Toast.LENGTH_LONG).show();}
  LinearLayout layout=new LinearLayout(this);layout.setOrientation(LinearLayout.VERTICAL);layout.setBackgroundColor(0xff171522);
  LinearLayout bar=new LinearLayout(this);
  Button reload=new Button(this);reload.setText("↻");reload.setContentDescription("Перезагрузить");reload.setOnClickListener(v->web.loadUrl(HOME));bar.addView(reload);
  TextView title=new TextView(this);title.setText("LimoTools");title.setTextColor(0xffe3ddff);title.setTextSize(18);title.setPadding(16,12,8,12);bar.addView(title,new LinearLayout.LayoutParams(0,-2,1));
  Button browser=new Button(this);browser.setText("Браузер");browser.setOnClickListener(v->new AlertDialog.Builder(this).setTitle("Открыть Limochat в браузере?").setMessage("Вход через Google доступен в браузере. Его сессия отдельна от LimoTools. Здесь используйте доступный на сайте вход по логину и паролю.").setPositiveButton("Открыть",(d,w)->outside(HOME)).setNegativeButton("Отмена",null).show());bar.addView(browser);layout.addView(bar);
  web=new WebView(this);layout.addView(web,new LinearLayout.LayoutParams(-1,0,1));setContentView(layout);
  WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);s.setMediaPlaybackRequiresUserGesture(true);s.setSafeBrowsingEnabled(true);
  CookieManager.getInstance().setAcceptCookie(true);CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){String url=request.getUrl().toString();if(trusted(url)&&!"/desktop-login.html".equals(request.getUrl().getPath()))return false;if(request.isForMainFrame())outside(url);return true;}
   @Override public void onPageFinished(WebView view,String url){if(trusted(url)){view.evaluateJavascript(enhancement,null);CookieManager.getInstance().flush();}}
   @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){if(request.isForMainFrame())Toast.makeText(MainActivity.this,"Ошибка сети. Нажмите ↻ для повтора.",Toast.LENGTH_LONG).show();}
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){if(picker!=null)picker.onReceiveValue(null);picker=callback;try{Intent intent=params.createIntent();intent.addCategory(Intent.CATEGORY_OPENABLE);startActivityForResult(intent,10);return true;}catch(Exception e){picker=null;return false;}}
   @Override public void onPermissionRequest(PermissionRequest request){runOnUiThread(()->{
    if(!trusted(request.getOrigin().toString())||media!=null){request.deny();return;}
    for(String resource:request.getResources())if(!PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)&&!PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)){request.deny();return;}
    media=request;
    new AlertDialog.Builder(MainActivity.this).setTitle("Звонок Limochat").setMessage("Разрешить сайту камеру и микрофон для звонка?").setNegativeButton("Нет",(d,w)->denyMedia()).setOnCancelListener(d->denyMedia()).setPositiveButton("Разрешить",(d,w)->{
     ArrayList<String> needed=new ArrayList<>();for(String resource:request.getResources()){String permission=PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)?Manifest.permission.RECORD_AUDIO:Manifest.permission.CAMERA;if(checkSelfPermission(permission)!=PackageManager.PERMISSION_GRANTED)needed.add(permission);}
     if(needed.isEmpty())grantMedia();else requestPermissions(needed.toArray(new String[0]),11);
    }).show();
   });}
   @Override public void onPermissionRequestCanceled(PermissionRequest request){if(media==request)media=null;}
  });
  web.setDownloadListener((url,ua,disposition,mime,length)->{if(trusted(url))new AlertDialog.Builder(this).setMessage("Открыть файл в браузере? Для закрытых файлов может понадобиться вход в браузере.").setPositiveButton("Открыть",(d,w)->outside(url)).setNegativeButton("Отмена",null).show();});
  web.loadUrl(HOME);
 }
 private void denyMedia(){if(media!=null){media.deny();media=null;}}
 private void grantMedia(){if(media!=null){if(trusted(web.getUrl()))media.grant(media.getResources());else media.deny();media=null;}}
 @Override public void onRequestPermissionsResult(int code,String[] permissions,int[] grants){super.onRequestPermissionsResult(code,permissions,grants);if(code==11){boolean allowed=grants.length>0;for(int grant:grants)allowed&=grant==PackageManager.PERMISSION_GRANTED;if(allowed)grantMedia();else denyMedia();}}
 @Override protected void onActivityResult(int code,int result,Intent data){super.onActivityResult(code,result,data);if(code==10&&picker!=null){picker.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result,data));picker=null;}}
 @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
 @Override protected void onDestroy(){if(picker!=null)picker.onReceiveValue(null);denyMedia();if(web!=null){web.stopLoading();web.destroy();}super.onDestroy();}
}
