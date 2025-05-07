package com.nfcreader;

import android.app.Activity;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.IsoDep;
import android.os.Build;
import android.util.Log;
import android.os.Vibrator;
import android.content.Context;
import android.os.VibrationEffect;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.github.devnied.emvnfccard.utils.TlvUtil;
import com.payneteasy.tlv.BerTag;
import com.payneteasy.tlv.BerTlv;
import com.payneteasy.tlv.BerTlvParser;
import com.payneteasy.tlv.BerTlvs;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.math.BigInteger;

public class NfcReaderModule extends ReactContextBaseJavaModule implements NfcAdapter.ReaderCallback, ActivityEventListener, LifecycleEventListener {

    private static final String TAG = "NfcReaderModule";
    private final ReactApplicationContext reactContext;
    private NfcAdapter nfcAdapter;
    private Promise readPromise;
    private boolean isReading = false;
    private boolean isProcessingTag = false;

    public NfcReaderModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        reactContext.addActivityEventListener(this);
        reactContext.addLifecycleEventListener(this);
        
        nfcAdapter = NfcAdapter.getDefaultAdapter(reactContext);
        
        reactContext.addActivityEventListener(new ActivityEventListener() {
            @Override
            public void onActivityResult(Activity activity, int requestCode, int resultCode, android.content.Intent data) {
                // Nada a fazer aqui
            }

            @Override
            public void onNewIntent(android.content.Intent intent) {
                Log.d(TAG, "NfcReaderModule recebeu nova intent: " + intent.getAction());
                if (NfcAdapter.ACTION_TECH_DISCOVERED.equals(intent.getAction()) || 
                    NfcAdapter.ACTION_TAG_DISCOVERED.equals(intent.getAction()) ||
                    NfcAdapter.ACTION_NDEF_DISCOVERED.equals(intent.getAction())) {
                    
                    Tag tag = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
                    if (tag != null && isReading) {
                        Log.d(TAG, "Processando tag do intent onNewIntent");
                        onTagDiscovered(tag);
                    }
                }
            }
        });
    }

    @Override
    public String getName() {
        return "NfcReader";
    }

    @ReactMethod
    public void isSupported(final Promise promise) {
        if (nfcAdapter != null) {
            promise.resolve(true);
        } else {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void isEnabled(final Promise promise) {
        if (nfcAdapter != null && nfcAdapter.isEnabled()) {
            promise.resolve(true);
        } else {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void startCardReading(final Promise promise) {
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            promise.reject("NO_ACTIVITY", "No activity found");
            return;
        }

        if (nfcAdapter == null) {
            promise.reject("NO_NFC", "NFC is not supported on this device");
            return;
        }

        if (!nfcAdapter.isEnabled()) {
            promise.reject("NFC_DISABLED", "NFC is disabled");
            return;
        }

        if (isReading) {
            promise.reject("ALREADY_READING", "NFC card reading already in progress");
            return;
        }

        try {
            this.readPromise = promise;
            isReading = true;
            
            Log.d(TAG, "Iniciando leitura do cartão NFC");
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                nfcAdapter.enableReaderMode(currentActivity, this, 
                        NfcAdapter.FLAG_READER_NFC_A | 
                        NfcAdapter.FLAG_READER_NFC_B | 
                        NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK | 
                        NfcAdapter.FLAG_READER_NO_PLATFORM_SOUNDS, null);
                
                WritableMap startParams = Arguments.createMap();
                startParams.putString("status", "waiting");
                sendEvent("nfcReadingStarted", startParams);
            } else {
                promise.reject("SDK_TOO_OLD", "Reader mode not supported on this device");
            }
        } catch (Exception ex) {
            Log.e(TAG, "Erro ao iniciar leitura NFC", ex);
            promise.reject("START_FAILED", ex.getMessage());
            stopCardReading();
        }
    }

    @ReactMethod
    public void stopCardReading() {
        if (isReading && nfcAdapter != null) {
            Activity currentActivity = getCurrentActivity();
            if (currentActivity != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                nfcAdapter.disableReaderMode(currentActivity);
                Log.d(TAG, "Leitura NFC interrompida");
            }
            isReading = false;
            
            WritableMap stopParams = Arguments.createMap();
            stopParams.putString("status", "stopped");
            sendEvent("nfcReadingStopped", stopParams);
        }
    }

    private void sendEvent(String eventName, WritableMap params) {
        try {
            Log.d(TAG, "Enviando evento: " + eventName + " com params: " + params.toString());
            if (reactContext != null && reactContext.hasActiveReactInstance()) {
                WritableMap paramsCopy = Arguments.createMap();
                paramsCopy.merge(params);
                reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit(eventName, paramsCopy);
            } else {
                Log.w(TAG, "Não foi possível enviar evento: " + eventName + " - contexto inválido ou sem instância React ativa");
            }
        } catch (Exception e) {
            Log.e(TAG, "Erro ao enviar evento: " + eventName, e);
        }
    }

    @Override
    public void onTagDiscovered(Tag tag) {
        if (isProcessingTag) {
            Log.d(TAG, "Já está processando uma tag, ignorando nova tag");
            return;
        }

        isProcessingTag = true;
        Log.d(TAG, "Tag NFC descoberta: " + tag.toString());

        try {
            IsoDep isoDep = IsoDep.get(tag);
            if (isoDep == null) {
                Log.e(TAG, "Tag não suporta IsoDep");
                sendError("TAG_NOT_SUPPORTED", "Tag não suporta IsoDep");
                return;
            }

            isoDep.connect();
            Log.d(TAG, "Conexão IsoDep estabelecida");

            // Vibrar para feedback
            vibrate();

            // Enviar evento de tag descoberta
            WritableMap tagParams = Arguments.createMap();
            tagParams.putString("status", "tag_discovered");
            sendEvent("nfcTagDiscovered", tagParams);

            // Ler dados do cartão
            byte[] response = readCardData(isoDep);
            if (response != null) {
                processCardData(response);
            }

            isoDep.close();
        } catch (IOException e) {
            Log.e(TAG, "Erro ao ler cartão", e);
            sendError("READ_ERROR", e.getMessage());
        } finally {
            isProcessingTag = false;
        }
    }

    private byte[] readCardData(IsoDep isoDep) throws IOException {
        try {
            // Selecionar aplicativo
            byte[] selectCommand = new byte[] {
                (byte) 0x00, // CLA
                (byte) 0xA4, // INS: SELECT
                (byte) 0x04, // P1: Select by name
                (byte) 0x00, // P2: First or only occurrence
                (byte) 0x07, // Lc: Length of AID
                (byte) 0xA0, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x03, (byte) 0x10, (byte) 0x10 // AID
            };

            byte[] response = isoDep.transceive(selectCommand);
            if (response == null || response.length < 2) {
                Log.e(TAG, "Resposta inválida ao selecionar aplicativo");
                return null;
            }

            // Verificar status
            int sw1 = response[response.length - 2] & 0xFF;
            int sw2 = response[response.length - 1] & 0xFF;
            if (sw1 != 0x90 || sw2 != 0x00) {
                Log.e(TAG, "Erro ao selecionar aplicativo: " + String.format("%02X %02X", sw1, sw2));
                return null;
            }

            // Ler dados do cartão
            byte[] readCommand = new byte[] {
                (byte) 0x00, // CLA
                (byte) 0xB0, // INS: READ BINARY
                (byte) 0x00, // P1: Offset high byte
                (byte) 0x00, // P2: Offset low byte
                (byte) 0xFF  // Le: Read all available data
            };

            response = isoDep.transceive(readCommand);
            if (response == null || response.length < 2) {
                Log.e(TAG, "Resposta inválida ao ler dados");
                return null;
            }

            // Verificar status
            sw1 = response[response.length - 2] & 0xFF;
            sw2 = response[response.length - 1] & 0xFF;
            if (sw1 != 0x90 || sw2 != 0x00) {
                Log.e(TAG, "Erro ao ler dados: " + String.format("%02X %02X", sw1, sw2));
                return null;
            }

            // Retornar dados sem o status
            byte[] data = new byte[response.length - 2];
            System.arraycopy(response, 0, data, 0, data.length);
            return data;

        } catch (IOException e) {
            Log.e(TAG, "Erro na comunicação com o cartão", e);
            throw e;
        }
    }

    private void processCardData(byte[] data) {
        try {
            BerTlvParser parser = new BerTlvParser();
            BerTlvs tlvs = parser.parse(data);
            
            WritableMap cardData = Arguments.createMap();
            
            for (BerTlv tlv : tlvs.getList()) {
                // Obter o tag ID convertendo para String hexadecimal
                String tag = tlv.getTag().toString();
                byte[] value = tlv.getBytesValue();
                
                if (value != null) {
                    String hexValue = bytesToHex(value);
                    
                    // Adicionar dados ao mapa
                    cardData.putString("tag_" + tag, hexValue);
                    
                    // Processar tags específicas
                    switch (tag) {
                        case "5A": // PAN
                            cardData.putString("pan", hexValue);
                            break;
                        case "5F20": // Cardholder Name
                            cardData.putString("cardholderName", new String(value));
                            break;
                        case "5F24": // Application Expiration Date
                            cardData.putString("expiryDate", hexValue);
                            break;
                        case "5F25": // Application Effective Date
                            cardData.putString("effectiveDate", hexValue);
                            break;
                        case "5F28": // Issuer Country Code
                            cardData.putString("issuerCountryCode", hexValue);
                            break;
                        case "5F34": // Application PAN Sequence Number
                            cardData.putString("panSequenceNumber", hexValue);
                            break;
                    }
                }
            }
            
            if (readPromise != null) {
                readPromise.resolve(cardData);
                readPromise = null;
            }
            
            WritableMap successParams = Arguments.createMap();
            successParams.putString("status", "success");
            successParams.putMap("data", cardData);
            sendEvent("nfcCardRead", successParams);
            
        } catch (Exception e) {
            Log.e(TAG, "Erro ao processar dados do cartão", e);
            sendError("PROCESS_ERROR", e.getMessage());
        }
    }

    private void sendError(String code, String message) {
        WritableMap errorParams = Arguments.createMap();
        errorParams.putString("code", code);
        errorParams.putString("message", message);
        sendEvent("nfcError", errorParams);
        
        if (readPromise != null) {
            readPromise.reject(code, message);
            readPromise = null;
        }
    }

    private void vibrate() {
        try {
            Vibrator vibrator = (Vibrator) reactContext.getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(100, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    vibrator.vibrate(100);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Erro ao vibrar", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }

    @Override
    public void onHostResume() {
        // Nada a fazer aqui
    }

    @Override
    public void onHostPause() {
        stopCardReading();
    }

    @Override
    public void onHostDestroy() {
        stopCardReading();
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, android.content.Intent data) {
        // Nada a fazer aqui
    }

    @Override
    public void onNewIntent(android.content.Intent intent) {
        // Nada a fazer aqui
    }
} 