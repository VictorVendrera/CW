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

// Adicionar as bibliotecas EMV
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
        
        // Registrar para ouvir eventos do MainActivity
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
                
                // Enviar evento indicando que a leitura começou
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
            
            // Enviar evento indicando que a leitura foi interrompida
            WritableMap stopParams = Arguments.createMap();
            stopParams.putString("status", "stopped");
            sendEvent("nfcReadingStopped", stopParams);
        }
    }

    private void sendEvent(String eventName, WritableMap params) {
        try {
            Log.d(TAG, "Enviando evento: " + eventName + " com params: " + params.toString());
            // Verificar se o contexto é válido
            if (reactContext != null && reactContext.hasActiveReactInstance()) {
                // Criar uma cópia do objeto para evitar ObjectAlreadyConsumedException
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
        Log.d(TAG, "Tag descoberta: " + tag);
        
        // Enviar evento informando que o cartão foi detectado ANTES da vibração
        WritableMap cardDetectedParams = Arguments.createMap();
        cardDetectedParams.putString("status", "detected");
        sendEvent("nfcCardDetected", cardDetectedParams);
        
        // Vibrar quando o cartão é detectado
        vibrate();
        
        // Verificar se temos um callback pendente
        if (readPromise == null) {
            Log.e(TAG, "Nenhuma Promise pendente para resolver");
            return;
        }
        
        // Limpar dados anteriores
        clearData();
        Log.d(TAG, "NFC tag descoberta");
        writeToLog("NFC tag descoberta");
        
        byte[] tagId = tag.getId();
        writeToLog("TagId: " + bytesToHexNpe(tagId));
        
        // Verificar tecnologias disponíveis na tag
        String[] techList = tag.getTechList();
        writeToLog("TechList encontrada com estas entradas:");
        boolean isoDepInTechList = false;
        for (String s : techList) {
            writeToLog(s);
            if (s.equals("android.nfc.tech.IsoDep")) isoDepInTechList = true;
        }
        
        // Prosseguir apenas se a tag tiver IsoDep na lista de tecnologias
        if (isoDepInTechList) {
            IsoDep isoDep = IsoDep.get(tag);
            if (isoDep == null) {
                Log.e(TAG, "Cartão não suporta IsoDep");
                WritableMap errorParams = Arguments.createMap();
                errorParams.putString("status", "error");
                errorParams.putString("error", "Card does not support IsoDep");
                sendEvent("nfcReadingError", errorParams);
                rejectPromise("NFC_CARD_ERROR", "Card does not support IsoDep");
                return;
            }

            try {
                Log.d(TAG, "Conectando com IsoDep");
                isoDep.connect();
                isoDep.setTimeout(5000); // 5 segundos timeout
                Log.d(TAG, "Conexão com cartão bem-sucedida");
                writeToLog("Conexão com cartão bem-sucedida");
                
                // Variáveis para armazenar os dados do cartão
                String pan = null;
                String expiryDate = null;
                String cardType = null;

                // Nossa jornada através do cartão começa aqui
                printStepHeader(0, "nossa jornada começa");
                writeToLog("00 leitura do cartão iniciada");
                
                // Aumentar o timeout para permitir leitura mais longa
                writeToLog("Aumentando o timeout do IsoDep para leitura prolongada");
                writeToLog("timeout antigo: " + isoDep.getTimeout() + " ms");
                isoDep.setTimeout(10000);
                writeToLog("timeout novo: " + isoDep.getTimeout() + " ms");

                /**
                 * PASSO 1: Selecionar PPSE
                 */
                printStepHeader(1, "selecionar PPSE");
                byte[] PPSE = "2PAY.SYS.DDF01".getBytes("UTF-8"); // PPSE
                byte[] selectPpseCommand = selectApdu(PPSE);
                byte[] selectPpseResponse = isoDep.transceive(selectPpseCommand);
                writeToLog("01 comando select PPSE com tamanho " + selectPpseCommand.length + " dados: " + bytesToHexNpe(selectPpseCommand));
                writeToLog("01 resposta select PPSE com tamanho " + selectPpseResponse.length + " dados: " + bytesToHexNpe(selectPpseResponse));
                writeToLog("01 select PPSE concluído");
                writeToLog(prettyPrintDataToString(selectPpseResponse));

                byte[] selectPpseResponseOk = checkResponse(selectPpseResponse);
                // Prosseguir apenas quando tivermos um resultado positivo de leitura = 0x'9000' no final dos dados de resposta
                if (selectPpseResponseOk != null) {
                    /**
                     * PASSO 2: Analisar resposta PPSE e buscar aplicações no cartão
                     */
                    printStepHeader(2, "buscar aplicações no cartão");
                    writeToLog("02 analisar resposta do select PPSE e buscar tag 0x4F (aplicações no cartão)");

                    BerTlvParser parser = new BerTlvParser();
                    BerTlvs tlv4Fs = parser.parse(selectPpseResponseOk);
                    // Buscar todas as entradas para tag 0x4F
                    List<BerTlv> tag4fList = tlv4Fs.findAll(new BerTag(0x4F));
                    if (tag4fList.size() < 1) {
                        writeToLog("Não há tag 0x4F disponível, parando aqui");
                        startEndSequence(isoDep);
                        return;
                    }
                    writeToLog("Encontrada tag 0x4F " + tag4fList.size() + (tag4fList.size() == 1 ? " vez:" : " vezes:"));
                    ArrayList<byte[]> aidList = new ArrayList<>();
                    for (int i4f = 0; i4f < tag4fList.size(); i4f++) {
                        BerTlv tlv4f = tag4fList.get(i4f);
                        byte[] tlv4fBytes = tlv4f.getBytesValue();
                        aidList.add(tlv4fBytes);
                        writeToLog("ID da aplicação (AID): " + bytesToHexNpe(tlv4fBytes));
                    }
                    writeToLog("02 análise da resposta select PPSE concluída");

                    /**
                     * PASSO 3: Iterar através da lista de AIDs selecionando cada um
                     */
                    for (int aidNumber = 0; aidNumber < tag4fList.size(); aidNumber++) {
                        byte[] aidSelected = aidList.get(aidNumber);
                        writeToLog("");
                        printStepHeader(3, "selecionar aplicação por AID");
                        writeToLog("03 selecionar aplicação por AID " + bytesToHexNpe(aidSelected) + " (número " + (aidNumber + 1) + ")");
                        byte[] selectAidCommand = selectApdu(aidSelected);
                        byte[] selectAidResponse = isoDep.transceive(selectAidCommand);
                        writeToLog("");
                        writeToLog("03 comando select AID com tamanho " + selectAidCommand.length + " dados: " + bytesToHexNpe(selectAidCommand));
                        writeToLog("03 resposta select AID com tamanho " + selectAidResponse.length + " dados: " + bytesToHexNpe(selectAidResponse));
                        writeToLog(prettyPrintDataToString(selectAidResponse));
                        writeToLog("03 select AID concluído");

                        /**
                         * PASSO 4: Buscar PDOL e preparar GPO
                         */
                        byte[] selectAidResponseOk = checkResponse(selectAidResponse);
                        if (selectAidResponseOk != null) {
                            printStepHeader(4, "buscar tag 0x9F38");
                            writeToLog("04 buscar tag 0x9F38 na resposta selectAid");
                            
                            /**
                             * Nota: comportamento diferente entre cartões Visa, Mastercard e cartões alemães Giro
                             * Mastercard não tem PDOL, Visa fornece PDOL na tag 9F38
                             * Próximo passo: buscar a tag 9F38 Processing Options Data Object List (PDOL)
                             */
                            
                            BerTlv tag9f38;
                            try {
                                BerTlvs tlvsAid = parser.parse(selectAidResponseOk);
                                tag9f38 = tlvsAid.find(new BerTag(0x9F, 0x38));
                                writeToLog("04 busca pela tag 0x9F38 na resposta selectAid concluída");
                            } catch (IllegalStateException e) {
                                tag9f38 = null;
                                Log.e(TAG, "Parsing dados inválidos: " + e.getMessage());
                            }
                            
                            byte[] gpoRequestCommand;
                            
                            // Mostrar valores predefinidos disponíveis
                            DolValues dolValues = new DolValues();
                            writeToLog("Valores predefinidos disponíveis para PDOL e CDOL");
                            writeToLog(dolValues.dump());
                            
                            if (tag9f38 != null) {
                                /**
                                 * O código a seguir é para cartões Visa e (alemães) GiroCards, pois encontramos um PDOL
                                 */
                                writeToLog("");
                                writeToLog("### processando o caminho American Express, VisaCard e GiroCard ###");
                                writeToLog("");
                                byte[] pdolValue = tag9f38.getBytesValue();
                                
                                writeToLog("encontrada tag 0x9F38 (PDOL) no selectAid com este tamanho: " + pdolValue.length + " dados: " + bytesToHexNpe(pdolValue));
                                byte[][] gpoRequestCommandArray = getGpoFromPdolExtended(pdolValue, new byte[]{(byte) 0x00}); // 00 = padrão, máximo 03
                                
                                gpoRequestCommand = gpoRequestCommandArray[0];
                                String pdolRequestString = new String(gpoRequestCommandArray[1], "UTF-8");
                                writeToLog("");
                                writeToLog(pdolRequestString);
                            } else {
                                /**
                                 * Código para MasterCard
                                 */
                                writeToLog("");
                                writeToLog("### processando o caminho MasterCard ###");
                                writeToLog("");
                                
                                writeToLog("Nenhum PDOL encontrado na resposta selectAid, gerando um PDOL 'nulo'");
                                byte[][] gpoRequestCommandArray = getGpoFromPdolExtended(new byte[0], new byte[]{(byte) 0x00});
                                gpoRequestCommand = gpoRequestCommandArray[0];
                                String pdolRequestString = new String(gpoRequestCommandArray[1], "UTF-8");
                                writeToLog("");
                                writeToLog(pdolRequestString);
                            }
                            
                            /**
                             * PASSO 5: Obter as opções de processamento
                             */
                            printStepHeader(5, "obter as opções de processamento");
                            writeToLog("05 obter as opções de processamento, comando com tamanho: " + gpoRequestCommand.length + " dados: " + bytesToHexNpe(gpoRequestCommand));
                            
                            /**
                             * AVISO: cada requisição de obtenção de opções de processamento aumenta o contador interno 'application transaction counter' do ICC.
                             * Se o contador de 2 bytes atingir o máximo de '65535' (0xFFFF), o cartão não aceitará mais comandos de leitura
                             * e o cartão estará irrecuperavelmente danificado.
                             * NÃO EXECUTE ESTE COMANDO EM LOOP!
                             */
                            
                            byte[] gpoRequestResponse = isoDep.transceive(gpoRequestCommand);
                            byte[] gpoRequestResponseOk;
                            writeToLog("05 obtenção das opções de processamento concluída");
                            if (gpoRequestResponse != null) {
                                writeToLog("05 resposta da obtenção das opções de processamento com tamanho: " + gpoRequestResponse.length + " dados: " + bytesToHexNpe(gpoRequestResponse));
                                gpoRequestResponseOk = checkResponse(gpoRequestResponse);
                                if (gpoRequestResponseOk != null) {
                                    writeToLog(prettyPrintDataToString(gpoRequestResponse));
                                }
                            } else {
                                writeToLog("05 falha na obtenção das opções de processamento");
                                writeToLog("O comando para obter opções de processamento falhou. Pode ser uma boa ideia usar uma tag 0x9966 Terminal Transaction Qualifiers alternativa");
                                startEndSequence(isoDep);
                                return;
                            }
                            
                            /**
                             * PASSO 6: Analisar conteúdo da resposta GPO para obter Track 2 ou AFL
                             */
                            
                            /**
                             * Temos 3 cenários para trabalhar:
                             * a) a resposta contém uma tag de Dados Equivalentes da Track 2 (tag 0x57)
                             * b) a resposta é do tipo 'Response Message Template Format 1' (tag 0x80)
                             * c) a resposta é do tipo 'Response Message Template Format 2' (tag 0x77)
                             */
                            BerTlvs tlvsGpo = parser.parse(gpoRequestResponse);
                            byte[] aflBytes = null;
                            
                            /**
                             * fluxo a)
                             * A resposta contém uma tag de Dados Equivalentes da Track 2 e a partir disso podemos
                             * recuperar diretamente o Número de Aplicação Principal (PAN, aqui o Número do Cartão de Crédito)
                             * encontrado usando um cartão Visa
                             */
                            
                            BerTlv tag57 = tlvsGpo.find(new BerTag(0x57));
                            if (tag57 != null) {
                                writeToLog("fluxo a)");
                                writeToLog("");
                                printStepHeader(6, "ler arquivos e buscar PAN");
                                writeToLog("06 leitura dos arquivos do cartão ignorada");
                                writeToLog("06 leitura dos arquivos do cartão ignorada");
                                
                                writeToLog("a resposta contém uma tag de Dados Equivalentes da Track 2 [tag 0x57]");
                                
                                /**
                                 * PASSO 7: Obter PAN e data de expiração da Track 2
                                 */
                                
                                writeToLog("a resposta contém uma tag de Dados Equivalentes da Track 2 [tag 0x57]");
                                byte[] gpoResponseTag57 = tag57.getBytesValue();
                                writeToLog("encontrada tag 0x57 na resposta GPO com tamanho: " + gpoResponseTag57.length + " dados: " + bytesToHexNpe(gpoResponseTag57));
                                pan = getPanFromTrack2EquivalentData(gpoResponseTag57);
                                expiryDate = getExpirationDateFromTrack2EquivalentData(gpoResponseTag57);
                                writeToLog("encontrado um PAN " + pan + " com data de expiração: " + expiryDate);
                                writeToLog("");
                                printStepHeader(7, "exibir PAN e data de expiração");
                                writeToLog("07 obter PAN e data de expiração da tag 0x57 (Dados Equivalentes da Track 2)");
                                writeToLog("07 obtenção do PAN e data de expiração da tag 0x57 (Dados Equivalentes da Track 2) concluída");
                                writeToLog("dados para AID " + bytesToHexNpe(aidSelected));
                                writeToLog("PAN: " + pan);
                                String expirationDateString = "Data de expiração (" + (expiryDate.length() == 4 ? "AAMM): " : "AAMMDD): ") + expiryDate;
                                writeToLog(expirationDateString);
                                writeToLog("dados para AID " + bytesToHexNpe(aidSelected));
                                writeToLog("PAN: " + pan);
                                writeToLog(expirationDateString);
                                writeToLog("");
                                
                                // Determinar o tipo de cartão com base no AID selecionado
                                String aidHex = bytesToHexNpe(aidSelected);
                                if (aidHex.startsWith("A0000000041010")) {
                                    cardType = "Mastercard";
                                } else if (aidHex.startsWith("A0000000031010")) {
                                    cardType = "Visa";
                                } else if (aidHex.startsWith("A0000000032010")) {
                                    cardType = "Visa Electron";
                                } else if (aidHex.startsWith("A0000000043060")) {
                                    cardType = "Maestro";
                                } else {
                                    cardType = "Desconhecido";
                                }
                            }
                            
                            /**
                             * fluxo b)
                             * A resposta é do tipo 'Response Message Template Format 1' e precisamos conhecer
                             * o significado de cada byte, então precisamos analisar o conteúdo para obter os dados para o
                             * 'Application File Locator' (AFL).
                             * encontrado usando um cartão American Express
                             */
                            
                            BerTlv tag80 = tlvsGpo.find(new BerTag(0x80));
                            if (tag80 != null) {
                                writeToLog("fluxo b)");
                                writeToLog("a resposta é do tipo 'Response Message Template Format 1' [tag 0x80]");
                                byte[] gpoResponseTag80 = tag80.getBytesValue();
                                writeToLog("encontrada tag 0x80 na resposta GPO com tamanho: " + gpoResponseTag80.length + " dados: " + bytesToHexNpe(gpoResponseTag80));
                                aflBytes = Arrays.copyOfRange(gpoResponseTag80, 2, gpoResponseTag80.length);
                            }
                            
                            /**
                             * fluxo c)
                             * A resposta é do tipo 'Response Message Template Format 2' e precisamos encontrar
                             * a tag 0x94; o conteúdo é o 'Application File Locator' (AFL)
                             * encontrado usando um cartão MasterCard
                             */
                            
                            BerTlv tag77 = tlvsGpo.find(new BerTag(0x77));
                            if (tag77 != null) {
                                writeToLog("fluxo c)");
                                writeToLog("a resposta é do tipo 'Response Message Template Format 2' [tag 0x77]");
                                writeToLog("encontrada tag 0x77 na resposta GPO");
                            }
                            
                            BerTlv tag94 = tlvsGpo.find(new BerTag(0x94));
                            if (tag94 != null) {
                                writeToLog("encontrado 'AFL' [tag 0x94] na resposta do tipo 'Response Message Template Format 2' [tag 0x77]");
                                byte[] gpoResponseTag94 = tag94.getBytesValue();
                                writeToLog("encontrada tag 0x94 na resposta GPO com tamanho: " + gpoResponseTag94.length + " dados: " + bytesToHexNpe(gpoResponseTag94));
                                aflBytes = gpoResponseTag94;
                            }
                            
                            // Se ainda não encontramos o PAN, precisamos ler os registros com base no AFL
                            if (pan == null && aflBytes != null) {
                                writeToLog("");
                                printStepHeader(6, "ler arquivos e buscar PAN");
                                writeToLog("06 ler os arquivos do cartão e buscar PAN e data de expiração");
                                writeToLog("06 leitura dos arquivos do cartão e busca por PAN e data de expiração");
                                
                                List<byte[]> tag94BytesList = divideArray(aflBytes, 4);
                                int tag94BytesListLength = tag94BytesList.size();
                                writeToLog("");
                                writeToLog("O AFL contém " + tag94BytesListLength + (tag94BytesListLength == 1 ? " entrada para ler" : " entradas para ler"));
                                
                                // O AFL é um array de bytes de 4 bytes de comprimento, então se seu array aflBytes tem 12 bytes de comprimento, há três conjuntos para ler.
                                
                                /**
                                 * agora vamos ler os arquivos especificados do cartão. O sistema é o seguinte:
                                 * O primeiro byte é o SFI, o segundo byte é o primeiro registro a ser lido,
                                 * o terceiro byte é o último registro a ser lido e o quarto byte indica o número
                                 * de setores envolvidos na autorização offline.
                                 * Aqui um exemplo: 10 01 03 00
                                 * SFI:             10
                                 * primeiro registro:  01
                                 * último registro:       03
                                 * offline:                  00
                                 * significa que somos solicitados a ler 3 registros (números 1, 2 e 3) do SFI 10
                                 */
                                
                                for (int i = 0; i < tag94BytesListLength; i++) {
                                    byte[] tag94BytesListEntry = tag94BytesList.get(i);
                                    byte sfiOrg = tag94BytesListEntry[0];
                                    byte rec1 = tag94BytesListEntry[1];
                                    byte recL = tag94BytesListEntry[2];
                                    byte offl = tag94BytesListEntry[3]; // autorização offline
                                    int sfiNew = (byte) sfiOrg | 0x04; // adicionar 4 = definir bit 3
                                    int numberOfRecordsToRead = (byteToInt(recL) - byteToInt(rec1) + 1);
                                    writeToLog("para SFI " + byteToHex(sfiOrg) + " leremos " + numberOfRecordsToRead + (numberOfRecordsToRead == 1 ? " registro" : " registros"));
                                    
                                    // ler registros
                                    byte[] readRecordResponse = new byte[0];
                                    for (int iRecord = (int) rec1; iRecord <= (int) recL; iRecord++) {
                                        byte[] cmd = hexToBytes("00B2000400");
                                        cmd[2] = (byte) (iRecord & 0x0FF);
                                        cmd[3] |= (byte) (sfiNew & 0x0FF);
                                        writeToLog("comando readRecord SFI " + byteToHex(sfiOrg) + " arquivo " + (int) recL + " com tamanho: " + cmd.length + " dados: " + bytesToHexNpe(cmd));
                                        readRecordResponse = isoDep.transceive(cmd);
                                        byte[] readRecordResponseTag5a = null;
                                        byte[] readRecordResponseTag5f24 = null;
                                        
                                        if (readRecordResponse != null) {
                                            writeToLog("resposta readRecord com tamanho: " + readRecordResponse.length + " dados: " + bytesToHexNpe(readRecordResponse));
                                            writeToLog(prettyPrintDataToString(readRecordResponse));
                                            
                                            // verificando PAN e Data de Expiração
                                            try {
                                                BerTlvs tlvsReadRecord = parser.parse(readRecordResponse);
                                                BerTlv tag5a = tlvsReadRecord.find(new BerTag(0x5A));
                                                if (tag5a != null) {
                                                    readRecordResponseTag5a = tag5a.getBytesValue();
                                                    writeToLog("encontrada tag 0x5a na resposta readRecord com tamanho: " + readRecordResponseTag5a.length + " dados: " + bytesToHexNpe(readRecordResponseTag5a));
                                                }
                                                BerTlv tag5f24 = tlvsReadRecord.find(new BerTag(0x5F, 0x24));
                                                if (tag5f24 != null) {
                                                    readRecordResponseTag5f24 = tag5f24.getBytesValue();
                                                    writeToLog("encontrada tag 0x5f24 na resposta readRecord com tamanho: " + readRecordResponseTag5f24.length + " dados: " + bytesToHexNpe(readRecordResponseTag5f24));
                                                }
                                                
                                                if (readRecordResponseTag5a != null) {
                                                    String readRecordPanString = removeTrailingF(bytesToHexNpe(readRecordResponseTag5a));
                                                    String readRecordExpirationDateString = bytesToHexNpe(readRecordResponseTag5f24);
                                                    
                                                    // Agora temos o PAN e a data de expiração
                                                    pan = readRecordPanString;
                                                    expiryDate = readRecordExpirationDateString;
                                                    
                                                    if (readRecordExpirationDateString.length() == 6) {
                                                        // Se for AAMMDD, converter para MM/AA
                                                        expiryDate = readRecordExpirationDateString.substring(2, 4) + "/" + readRecordExpirationDateString.substring(0, 2);
                                                    } else if (readRecordExpirationDateString.length() == 4) {
                                                        // Se for AAMM, converter para MM/AA
                                                        expiryDate = readRecordExpirationDateString.substring(2, 4) + "/" + readRecordExpirationDateString.substring(0, 2);
                                                    }
                                                    
                                                    writeToLog("");
                                                    printStepHeader(7, "exibir PAN e data de expiração");
                                                    writeToLog("07 obter PAN e data de expiração das tags 0x5a e 0x5f24");
                                                    writeToLog("07 obtenção do PAN e data de expiração das tags 0x5a e 0x5f24 concluída");
                                                    writeToLog("dados para AID " + bytesToHexNpe(aidSelected));
                                                    writeToLog("PAN: " + pan);
                                                    String expirationDateString = "Data de expiração (" + (readRecordExpirationDateString.length() == 4 ? "AAMM): " : "AAMMDD): ") + expiryDate;
                                                    writeToLog(expirationDateString);
                                                    writeToLog("dados para AID " + bytesToHexNpe(aidSelected));
                                                    writeToLog("PAN: " + pan);
                                                    writeToLog(expirationDateString);
                                                    writeToLog("");
                                                    
                                                    // Determinar o tipo de cartão com base no AID selecionado
                                                    String aidHex = bytesToHexNpe(aidSelected);
                                                    if (aidHex.startsWith("A0000000041010")) {
                                                        cardType = "Mastercard";
                                                    } else if (aidHex.startsWith("A0000000031010")) {
                                                        cardType = "Visa";
                                                    } else if (aidHex.startsWith("A0000000032010")) {
                                                        cardType = "Visa Electron";
                                                    } else if (aidHex.startsWith("A0000000043060")) {
                                                        cardType = "Maestro";
                                                    } else {
                                                        cardType = "Desconhecido";
                                                    }
                                                }
                                            } catch (RuntimeException e) {
                                                Log.e(TAG, "Exceção de Runtime: " + e.getMessage());
                                            }
                                        } else {
                                            writeToLog("a resposta readRecord foi NULA");
                                        }
                                    }
                                }
                            }
                        } else {
                            writeToLog("o comando de seleção de AID falhou");
                        }
                    }
                } else {
                    writeToLog("A tag NFC descoberta não tem uma interface IsoDep.");
                }
                
                printStepHeader(99, "nossa jornada termina");
                writeToLog("99 leitura do cartão concluída");
                
                // MODIFICAÇÃO IMPORTANTE: Criar e resolver o objeto Card com os dados lidos
                if (pan != null && expiryDate != null) {
                    Log.d(TAG, "Criando objeto Card com dados: PAN=" + pan + ", expiryDate=" + expiryDate + ", cardType=" + cardType);
                    Card card = new Card(pan, cardType, expiryDate, true, false);
                    resolvePromise(card);
                } else {
                    Log.e(TAG, "Dados do cartão incompletos. PAN ou data de expiração não encontrados.");
                    rejectPromise("INCOMPLETE_CARD_DATA", "Não foi possível obter dados completos do cartão");
                }
                
                vibrate();
                
            } catch (IOException e) {
                Log.e(TAG, "Erro de comunicação com cartão", e);
                WritableMap errorParams = Arguments.createMap();
                errorParams.putString("status", "error");
                errorParams.putString("error", e.getMessage());
                sendEvent("nfcReadingError", errorParams);
                rejectPromise("COMMUNICATION_ERROR", e.getMessage());
                return;
            } catch (Exception e) {
                Log.e(TAG, "Erro geral na leitura do cartão", e);
                WritableMap errorParams = Arguments.createMap();
                errorParams.putString("status", "error");
                errorParams.putString("error", e.getMessage());
                sendEvent("nfcReadingError", errorParams);
                rejectPromise("GENERAL_ERROR", e.getMessage());
                return;
            } finally {
                try {
                    if (isoDep != null && isoDep.isConnected()) {
                        isoDep.close();
                    }
                } catch (IOException e) {
                    Log.e(TAG, "Erro ao fechar IsoDep", e);
                }
                stopCardReading();
            }
        } else {
            // Se não encontrar tecnologia IsoDep
            Log.e(TAG, "A tag descoberta não tem uma interface IsoDep");
            WritableMap errorParams = Arguments.createMap();
            errorParams.putString("status", "error");
            errorParams.putString("error", "Card does not support IsoDep");
            sendEvent("nfcReadingError", errorParams);
            rejectPromise("NFC_CARD_ERROR", "Card does not support IsoDep");
        }
    }
    
    private void startEndSequence(IsoDep isoDep) {
        try {
            if (isoDep != null && isoDep.isConnected()) {
                isoDep.close();
            }
        } catch (IOException e) {
            Log.e(TAG, "Erro ao fechar IsoDep", e);
        }
        stopCardReading();
    }
    
    /**
     * Adiciona métodos de suporte para compatibilidade com o código original
     */
    
    private String outputString = ""; // usado para a saída de log
    
    private void clearData() {
        outputString = "";
    }
    
    private void writeToLog(String message) {
        Log.d(TAG, message);
        outputString = outputString + message + "\n";
    }
    
    private void printStepHeader(int step, String message) {
        String stepSeparatorString = "*********************************";
        // a mensagem não deve exceder 29 caracteres, mensagens mais longas serão truncadas
        String emptyMessage = "                                 ";
        StringBuilder sb = new StringBuilder();
        sb.append(outputString); // já tem uma quebra de linha no final
        sb.append("").append("\n");
        sb.append(stepSeparatorString).append("\n");
        sb.append("************ passo ").append(String.format("%02d", step)).append(" ************").append("\n");
        sb.append("* ").append((message + emptyMessage).substring(0, 29)).append(" *").append("\n");
        sb.append(stepSeparatorString).append("\n");
        outputString = sb.toString();
    }
    
    private String prettyPrintDataToString(byte[] responseData) {
        StringBuilder sb = new StringBuilder();
        sb.append("------------------------------------").append("\n");
        // Usar TlvUtil do código original para formatação de TLV
        sb.append(trimLeadingLineFeeds(TlvUtil.prettyPrintAPDUResponse(responseData))).append("\n");
        sb.append("------------------------------------").append("\n");
        return sb.toString();
    }
    
    public static String trimLeadingLineFeeds(String input) {
        String[] output = input.split("^\\n+", 2);
        return output.length > 1 ? output[1] : output[0];
    }
    
    /**
     * constrói um comando select apdu
     */
    private byte[] selectApdu(@NonNull byte[] data) {
        byte[] commandApdu = new byte[6 + data.length];
        commandApdu[0] = (byte) 0x00;  // CLA
        commandApdu[1] = (byte) 0xA4;  // INS
        commandApdu[2] = (byte) 0x04;  // P1
        commandApdu[3] = (byte) 0x00;  // P2
        commandApdu[4] = (byte) (data.length & 0x0FF);       // Lc
        System.arraycopy(data, 0, commandApdu, 5, data.length);
        commandApdu[commandApdu.length - 1] = (byte) 0x00;  // Le
        return commandApdu;
    }
    
    /**
     * converte um byte para int
     */
    public static int byteToInt(byte b) {
        return (int) b & 0xFF;
    }
    
    /**
     * converte um byte para sua representação hex
     */
    public static String byteToHex(byte data) {
        int hex = data & 0xFF;
        return Integer.toHexString(hex);
    }
    
    /**
     * divide um array de bytes em partes
     */
    private static List<byte[]> divideArray(byte[] source, int chunksize) {
        List<byte[]> result = new ArrayList<byte[]>();
        int start = 0;
        while (start < source.length) {
            int end = Math.min(source.length, start + chunksize);
            result.add(Arrays.copyOfRange(source, start, end));
            start += chunksize;
        }
        return result;
    }
    
    private byte[] checkResponse(@NonNull byte[] data) {
        if (data.length < 2) {
            return null;
        }
        
        int status = ((data[data.length - 2] & 0xff) << 8) | (data[data.length - 1] & 0xff);
        if (status == 0x9000) {
            byte[] response = new byte[data.length - 2];
            System.arraycopy(data, 0, response, 0, data.length - 2);
            return response;
        }
        return null;
    }
    
    private List<byte[]> parseAfl(byte[] aflData) {
        List<byte[]> records = new ArrayList<>();
        
        if (aflData == null || aflData.length % 4 != 0) {
            return records;
        }
        
        for (int i = 0; i < aflData.length; i += 4) {
            byte[] record = new byte[4];
            System.arraycopy(aflData, i, record, 0, 4);
            records.add(record);
        }
        
        return records;
    }
    
    private byte[] getPdolData(byte[] selectResponse) {
        return findValueForTag(selectResponse, (byte) 0x9F, (byte) 0x38);
    }

    private byte[] findValueForTag(byte[] data, byte tag) {
        if (data == null || data.length < 3) {
            return null;
        }
        
        int index = 0;
        while (index < data.length - 2) {
            if (data[index] == tag) {
                // Encontramos a tag
                int length = data[index + 1] & 0xFF;
                if (index + 2 + length <= data.length) {
                    byte[] value = new byte[length];
                    System.arraycopy(data, index + 2, value, 0, length);
                    return value;
                }
            }
            index++;
        }
        return null;
    }
    
    private byte[] findValueForTag(byte[] data, byte tagFirstByte, byte tagSecondByte) {
        if (data == null || data.length < 4) {
            return null;
        }
        
        int index = 0;
        while (index < data.length - 3) {
            if (data[index] == tagFirstByte && data[index + 1] == tagSecondByte) {
                // Encontramos a tag
                int length = data[index + 2] & 0xFF;
                if (index + 3 + length <= data.length) {
                    byte[] value = new byte[length];
                    System.arraycopy(data, index + 3, value, 0, length);
                    return value;
                }
            }
            index++;
        }
        return null;
    }
    
    private byte[][] getGpoFromPdolExtended(@NonNull byte[] pdol, byte[] alternativeTtq) {
        List<Pair<Integer, Integer>> entries = new ArrayList<>();
        int pDolLength = 0;
        int position = 0;
        
        while (position < pdol.length) {
            int tag;
            int tagLength = 1;
            
            // Determinar o tamanho da tag
            if ((pdol[position] & 0x1F) == 0x1F) {
                tag = ((pdol[position] & 0xFF) << 8) | (pdol[position + 1] & 0xFF);
                tagLength = 2;
            } else {
                tag = pdol[position] & 0xFF;
            }
            
            // Obter o comprimento do valor
            int valueLength = pdol[position + tagLength] & 0xFF;
            pDolLength += valueLength;
            
            // Armazenar a tag e seu comprimento requerido
            entries.add(new Pair<>(tag, valueLength));
            
            // Avançar para a próxima tag
            position += tagLength + 1;
        }
        
        // Predefinição de valores baseados no MainActivity.java original
        byte[] result = new byte[pDolLength];
        int index = 0;
        
        // Preencher os valores do PDOL
        for (Pair<Integer, Integer> entry : entries) {
            int tag = entry.first;
            int length = entry.second;
            
            switch (tag) {
                case 0x9F66: // Terminal Transaction Qualifiers (TTQ)
                    if (alternativeTtq != null && length == alternativeTtq.length) {
                        System.arraycopy(alternativeTtq, 0, result, index, length);
                    } else {
                        Arrays.fill(result, index, index + length, (byte) 0x00);
                    }
                    break;
                case 0x9F02: // Amount, Authorized
                    Arrays.fill(result, index, index + length, (byte) 0x00);
                    break;
                case 0x9F03: // Amount, Other
                    Arrays.fill(result, index, index + length, (byte) 0x00);
                    break;
                case 0x9F1A: // Terminal Country Code
                    if (length == 2) {
                        result[index] = (byte) 0x08; // Brazil
                        result[index + 1] = (byte) 0x26;
                    } else {
                        Arrays.fill(result, index, index + length, (byte) 0x00);
                    }
                    break;
                case 0x5F2A: // Transaction Currency Code
                    if (length == 2) {
                        result[index] = (byte) 0x09; // BRL
                        result[index + 1] = (byte) 0x86;
                    } else {
                        Arrays.fill(result, index, index + length, (byte) 0x00);
                    }
                    break;
                case 0x9F37: // Unpredictable Number
                    for (int i = 0; i < length; i++) {
                        result[index + i] = (byte) (Math.random() * 256);
                    }
                    break;
                default:
                    Arrays.fill(result, index, index + length, (byte) 0x00);
            }
            
            index += length;
        }
        
        // Construir o comando GPO completo
        ByteArrayOutputStream gpoCommand = new ByteArrayOutputStream();
        try {
            gpoCommand.write(new byte[]{(byte) 0x80, (byte) 0xA8, (byte) 0x00, (byte) 0x00});
            gpoCommand.write(pDolLength + 2); // Lc: comprimento do PDOL + 2 bytes
            gpoCommand.write(new byte[]{(byte) 0x83, (byte) pDolLength}); // Tag 83 e comprimento
            gpoCommand.write(result); // Dados do PDOL
            gpoCommand.write(0x00); // Le
        } catch (IOException e) {
            Log.e(TAG, "Error building GPO command", e);
        }
        
        // Retornar tanto o comando GPO completo quanto os dados do PDOL
        return new byte[][]{gpoCommand.toByteArray(), result};
    }

    private String getPanFromTrack2EquivalentData(byte[] track2Data) {
        if (track2Data != null) {
            String track2DataString = bytesToHexNpe(track2Data);
            int posSeparator = track2DataString.toUpperCase().indexOf("D");
            if (posSeparator > 0) {
                return removeTrailingF(track2DataString.substring(0, posSeparator));
            }
            
            // Se não encontrar o separador, tenta outra abordagem
            posSeparator = track2DataString.indexOf("=");
            if (posSeparator > 0) {
                return track2DataString.substring(0, posSeparator);
            }
            
            // Se ainda não encontrou, retorna os primeiros 16 dígitos (típico PAN)
            return track2DataString.length() > 16 ? track2DataString.substring(0, 16) : track2DataString;
        } else {
            return "";
        }
    }

    private String getExpirationDateFromTrack2EquivalentData(byte[] track2Data) {
        if (track2Data != null) {
            String track2DataString = bytesToHexNpe(track2Data);
            int posSeparator = track2DataString.toUpperCase().indexOf("D");
            if (posSeparator > 0 && posSeparator + 4 <= track2DataString.length()) {
                // A data de validade vem após o separador, e é YYMM
                String yymm = track2DataString.substring(posSeparator + 1, posSeparator + 5);
                if (yymm.length() == 4) {
                    // Converter para MM/YY
                    return yymm.substring(2, 4) + "/" + yymm.substring(0, 2);
                }
            }
            
            // Se não encontrar o separador D, tentar o separador =
            posSeparator = track2DataString.indexOf("=");
            if (posSeparator > 0 && posSeparator + 4 <= track2DataString.length()) {
                String yymm = track2DataString.substring(posSeparator + 1, posSeparator + 5);
                if (yymm.length() == 4) {
                    return yymm.substring(2, 4) + "/" + yymm.substring(0, 2);
                }
            }
            
            return "";
        } else {
            return "";
        }
    }

    private static String bytesToHexNpe(byte[] bytes) {
        if (bytes != null) {
            StringBuffer result = new StringBuffer();
            for (byte b : bytes)
                result.append(Integer.toString((b & 0xff) + 0x100, 16).substring(1));
            return result.toString();
        } else {
            return "";
        }
    }
    
    private void vibrate() {
        try {
            Vibrator vibrator = (Vibrator) reactContext.getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(150, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    vibrator.vibrate(150);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error vibrating", e);
        }
    }

    private void resolvePromise(final Card card) {
        if (card != null) {
            isProcessingTag = false;
            String cardNumber = card.getCardNumber();
            String cardType = card.getCardType();
            String expiryDate = card.getExpiryDate();
            boolean isReady = card.isReady();
            boolean isTagId = card.isTagId();

            try {
                // Criar uma nova WritableMap para cada destino (eventos e promessa)
                WritableMap eventData = Arguments.createMap();
                eventData.putString("cardType", cardType != null ? cardType : "");
                eventData.putString("cardNumber", cardNumber != null ? cardNumber : "");
                eventData.putString("expiryDate", expiryDate != null ? expiryDate : "");
                eventData.putBoolean("isReady", isReady);
                eventData.putBoolean("isTagId", isTagId);

                // Enviar evento para React Native
                sendEvent("onCardRead", eventData);

                // Criar um novo WritableMap para a promessa
                WritableMap promiseData = Arguments.createMap();
                promiseData.putString("cardType", cardType != null ? cardType : "");
                promiseData.putString("cardNumber", cardNumber != null ? cardNumber : "");
                promiseData.putString("expiryDate", expiryDate != null ? expiryDate : "");
                promiseData.putBoolean("isReady", isReady);
                promiseData.putBoolean("isTagId", isTagId);

                if (readPromise != null) {
                    readPromise.resolve(promiseData);
                    readPromise = null;
                } else {
                    Log.d(TAG, "Promise é nula em resolvePromise");
                }
            } catch (Exception e) {
                Log.e(TAG, "Erro ao processar resolvePromise", e);
                if (readPromise != null) {
                    readPromise.reject("PROCESSING_ERROR", e.getMessage());
                    readPromise = null;
                }
            }
        } else {
            Log.d(TAG, "Card é nulo em resolvePromise");
        }
    }

    private void rejectPromise(String code, String message) {
        if (readPromise != null) {
            Log.d(TAG, "Rejeitando promise com código: " + code + ", mensagem: " + message);
            readPromise.reject(code, message);
            readPromise = null;
        } else {
            Log.e(TAG, "Tentativa de rejeitar promise nula");
        }
    }

    // Evento quando a Activity é pausada
    @Override
    public void onHostPause() {
        stopCardReading();
    }

    // Evento quando a Activity é retomada
    @Override
    public void onHostResume() {
        // Nada a fazer aqui
    }

    // Evento quando a Activity é destruída
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
    
    // Classe auxiliar para armazenar pares de valores
    private static class Pair<F, S> {
        public final F first;
        public final S second;

        public Pair(F first, S second) {
            this.first = first;
            this.second = second;
        }
    }

    // Função auxiliar para remover caracteres F ao final do PAN
    private String removeTrailingF(String input) {
        int index;
        for (index = input.length() - 1; index >= 0; index--) {
            if (input.charAt(index) != 'f') {
                break;
            }
        }
        return input.substring(0, index + 1);
    }

    // Definindo a classe Card que faltava
    private static class Card {
        private String cardNumber;
        private String cardType;
        private String expiryDate;
        private boolean isReady;
        private boolean isTagId;

        public Card(String cardNumber, String cardType, String expiryDate, boolean isReady, boolean isTagId) {
            this.cardNumber = cardNumber;
            this.cardType = cardType;
            this.expiryDate = expiryDate;
            this.isReady = isReady;
            this.isTagId = isTagId;
        }

        public String getCardNumber() {
            return cardNumber;
        }

        public String getCardType() {
            return cardType;
        }

        public String getExpiryDate() {
            return expiryDate;
        }

        public boolean isReady() {
            return isReady;
        }

        public boolean isTagId() {
            return isTagId;
        }
    }

    /**
     * converte uma string codificada em hexadecimal para um array de bytes
     */
    public static byte[] hexToBytes(String str) {
        byte[] bytes = new byte[str.length() / 2];
        for (int i = 0; i < bytes.length; i++) {
            bytes[i] = (byte) Integer.parseInt(str.substring(2 * i, 2 * i + 2),
                    16);
        }
        return bytes;
    }
} 