package com.anonymous.novoprojeto
import expo.modules.splashscreen.SplashScreenManager

import android.os.Build
import android.os.Bundle
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.IsoDep
import android.content.Intent
import android.app.PendingIntent
import android.content.IntentFilter
import android.util.Log

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity(), NfcAdapter.ReaderCallback {
  private val TAG = "MainActivity"
  private var nfcAdapter: NfcAdapter? = null
  
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    // setTheme(R.style.AppTheme);
    // @generated begin expo-splashscreen - expo prebuild (DO NOT MODIFY) sync-f3ff59a738c56c9a6119210cb55f0b613eb8b6af
    SplashScreenManager.registerOnActivity(this)
    // @generated end expo-splashscreen
    super.onCreate(null)
    
    // Inicializar NFC Adapter
    nfcAdapter = NfcAdapter.getDefaultAdapter(this)
    if (nfcAdapter == null) {
      Log.d(TAG, "Este dispositivo não suporta NFC")
    } else if (!nfcAdapter!!.isEnabled) {
      Log.d(TAG, "NFC está desativado")
    } else {
      Log.d(TAG, "NFC está disponível e ativado")
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          com.anonymous.novoprojeto.BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
  
  override fun onResume() {
    super.onResume()
    // Configurar o leitor NFC em modo de foreground dispatch
    if (nfcAdapter != null && nfcAdapter!!.isEnabled) {
      try {
        val intent = Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        val pendingIntent = PendingIntent.getActivity(this, 0, intent, if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) PendingIntent.FLAG_MUTABLE else 0)
        
        val techDetected = IntentFilter(NfcAdapter.ACTION_TECH_DISCOVERED)
        val tagDetected = IntentFilter(NfcAdapter.ACTION_TAG_DISCOVERED)
        val ndefDetected = IntentFilter(NfcAdapter.ACTION_NDEF_DISCOVERED)
        
        val filters = arrayOf(techDetected, tagDetected, ndefDetected)
        val techLists = arrayOf(
          arrayOf(IsoDep::class.java.name)
        )
        
        nfcAdapter!!.enableForegroundDispatch(this, pendingIntent, filters, techLists)
        Log.d(TAG, "NFC foreground dispatch habilitado")
      } catch (e: Exception) {
        Log.e(TAG, "Erro ao configurar NFC: ${e.message}")
      }
    }
  }
  
  override fun onPause() {
    super.onPause()
    // Desabilitar o foreground dispatch
    if (nfcAdapter != null) {
      nfcAdapter!!.disableForegroundDispatch(this)
    }
  }
  
  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    Log.d(TAG, "Nova intent recebida: ${intent.action}")
    
    // Processar intent de NFC
    if (NfcAdapter.ACTION_TECH_DISCOVERED == intent.action || 
        NfcAdapter.ACTION_TAG_DISCOVERED == intent.action || 
        NfcAdapter.ACTION_NDEF_DISCOVERED == intent.action) {
      
      val tag = intent.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG)
      if (tag != null) {
        Log.d(TAG, "Tag NFC detectada! Tecnologias: ${tag.techList.joinToString()}")
        onTagDiscovered(tag)
      }
    }
  }
  
  override fun onTagDiscovered(tag: Tag) {
    Log.d(TAG, "onTagDiscovered chamado com tag: ${tag.id.joinToString("") { "%02X".format(it) }}")
    
    // Verificar se a tag suporta IsoDep (ISO 14443-4)
    if (!tag.techList.contains(IsoDep::class.java.name)) {
      Log.d(TAG, "Tag não suporta IsoDep")
      return
    }
    
    // Este método apenas registra a detecção da tag.
    // O processamento real do cartão EMV é feito no módulo NfcReaderModule
    
    // Emitir um evento React Native para informar que uma tag foi detectada
    try {
      val params = Arguments.createMap()
      params.putString("tagId", tag.id.joinToString("") { "%02X".format(it) })
      params.putString("technologies", tag.techList.joinToString())
      
      // Verificar se temos um ReactContext válido antes de tentar usar
      val reactContext = reactInstanceManager?.currentReactContext
      if (reactContext != null && reactContext.hasActiveReactInstance()) {
        reactContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          ?.emit("nfcTagDetected", params)
        Log.d(TAG, "Evento nfcTagDetected emitido para React Native")
      } else {
        Log.d(TAG, "Não foi possível emitir evento: ReactContext nulo ou sem instância ativa")
      }
    } catch (e: Exception) {
      Log.e(TAG, "Erro ao emitir evento para React Native: ${e.message}")
      // Apenas registrar o erro sem quebrar o aplicativo
    }
  }
}
