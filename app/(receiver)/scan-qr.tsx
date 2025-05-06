import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput, 
  Modal,
  Alert,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, QrCode, Camera, X, ShieldCheck } from 'lucide-react-native';
import theme from '../../config/theme';
import Button from '../../components/Button';
import Card from '../../components/Card';
import TextField from '../../components/TextField';
import Section from '../../components/Section';

export default function ScanQRScreen() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');

  useEffect(() => {
    // Simular solicitação de permissão da câmera
    const requestCameraPermission = async () => {
      // No ambiente real, implementaríamos a solicitação de permissão
      setTimeout(() => {
        setCameraPermission(true);
        setScanning(true);
      }, 1000);
    };

    requestCameraPermission();
  }, []);

  const handleCodeScanned = () => {
    // Simular um QR code escaneado
    setScanning(false);
    
    // Dados mockados da cobrança
    const chargeData = {
      id: '12345',
      amount: 150.50,
      description: 'Serviço de consultoria',
      customer: 'Maria Silva',
      merchant: 'João Comerciante',
      merchantId: 'M123456',
      date: new Date().toLocaleDateString('pt-BR'),
    };
    
    // Navegar para a tela de confirmação de pagamento
    router.push({
      pathname: '/(receiver)/payment-details',
      params: { chargeData: JSON.stringify(chargeData) }
    });
  };

  const toggleScanner = () => {
    if (cameraPermission) {
      setScanning(!scanning);
    } else {
      Alert.alert(
        'Permissão Necessária',
        'É necessário permitir o uso da câmera para escanear o QR code.'
      );
    }
  };

  const handleManualLinkSubmit = () => {
    if (!paymentLink) {
      Alert.alert('Erro', 'Por favor, insira um link de pagamento válido');
      return;
    }

    // Extrair ID do link
    let paymentId;
    
    try {
      // Tentar extrair do formato https://nfcpayflow.app/pay/ID ou nfcpayflow://pay/ID
      if (paymentLink.includes('/pay/')) {
        paymentId = paymentLink.split('/pay/')[1];
      } else {
        // Se não conseguir extrair, usar o próprio link como ID
        paymentId = paymentLink;
      }

      // Fechar o modal
      setModalVisible(false);
      setPaymentLink('');

      // Simular dados de cobrança
      const chargeData = {
        id: paymentId,
        amount: 50.00,
        description: 'Pagamento via link manual',
        customer: 'Cliente',
        merchant: 'Loja do João',
        merchantId: 'M123456',
        date: new Date().toLocaleDateString('pt-BR'),
      };

      // Navegar para a tela de confirmação de pagamento
      router.push({
        pathname: '/(receiver)/payment-details',
        params: { chargeData: JSON.stringify(chargeData) }
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível processar o link de pagamento');
    }
  };

  // Simular o escaneamento após um tempo
  useEffect(() => {
    if (scanning) {
      const timer = setTimeout(() => {
        handleCodeScanned();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [scanning]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escanear QR Code</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.scannerContainer}>
        {cameraPermission === null ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : cameraPermission === false ? (
          <View style={styles.permissionError}>
            <Camera size={48} color={theme.colors.textTertiary} />
            <Text style={styles.permissionErrorText}>
              Não foi possível acessar a câmera
            </Text>
            <Button
              title="Conceder permissão"
              onPress={() => {}}
              variant="primary"
              size="sm"
              style={styles.permissionButton}
            />
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            {/* No ambiente real, aqui ficaria o componente da câmera */}
            <View style={styles.scanFrame}>
              <QrCode size={200} color={theme.colors.primary} strokeWidth={1} />
            </View>
            
            {scanning ? (
              <View style={styles.scanningIndicator}>
                <ActivityIndicator size="small" color={theme.colors.white} />
                <Text style={styles.scanningText}>Escaneando...</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>

      <Section
        title="Como escanear"
        contentStyle={styles.instructions}
        titleStyle={styles.instructionsTitle}
      >
        <Text style={styles.instructionsText}>
          Posicione o QR code da cobrança dentro da área de escaneamento e aguarde a leitura automática.
        </Text>
      </Section>

      <View style={styles.securityNotice}>
        <ShieldCheck size={20} color={theme.colors.primary} />
        <Text style={styles.securityText}>
          Verifique os detalhes do pagamento antes de confirmar
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title={scanning ? "Parar escaneamento" : "Iniciar escaneamento"}
          onPress={toggleScanner}
          disabled={cameraPermission === null}
          variant="primary"
          size="lg"
          fullWidth
          style={styles.scanButton}
        />
        
        <Button
          title="Inserir link de pagamento manualmente"
          onPress={() => setModalVisible(true)}
          variant="outline"
          size="md"
          fullWidth
          style={styles.manualLinkButton}
        />
      </View>

      {/* Modal para inserção manual de link */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Card variant="elevated" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Inserir Link de Pagamento</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalInput}>
              Cole ou digite o link de pagamento recebido
            </Text>

            <TextField
              value={paymentLink}
              onChangeText={setPaymentLink}
              placeholder="https://nfcpayflow.app/pay/123456"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.modalInput}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Processar pagamento"
                onPress={handleManualLinkSubmit}
                variant="primary"
                size="lg"
                fullWidth
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionError: {
    alignItems: 'center',
    padding: 24,
  },
  permissionErrorText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  permissionButton: {
    marginTop: 16,
  },
  cameraContainer: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 8,
    overflow: 'hidden',
  },
  scanFrame: {
    width: '80%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 8,
  },
  scanningIndicator: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  scanningText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    marginLeft: 8,
  },
  instructions: {
    padding: 24,
  },
  instructionsTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    marginBottom: 16,
  },
  instructionsText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.colors.backgroundLight,
    marginTop: 'auto',
  },
  securityText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    marginLeft: 8,
  },
  footer: {
    padding: 24,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  scanButton: {
    marginBottom: 12,
  },
  manualLinkButton: {
    marginBottom: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalInput: {
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
}); 