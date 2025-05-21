import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { XCircle, Info } from 'lucide-react-native';
import { createCharge } from '../../services/firebase';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import theme from '../../config/theme';
import Card from '../../components/Card';
import OptionSelector from '../../components/OptionSelector';

interface ChargeFormData {
  amount: number;
  description: string;
  customer: string;
  merchantName: string;
  merchantId: string;
  maxInstallments: number;
  installmentsWithoutFee: number;
  installmentFeeRate: number;
}

interface ChargeResponse {
  id: string;
  accessToken: string;
  [key: string]: any;
}

export default function CreateChargeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ChargeFormData>({
    amount: 0,
    description: '',
    customer: '',
    merchantName: 'Empresa X',
    merchantId: 'MID' + Math.floor(Math.random() * 10000),
    maxInstallments: 12,
    installmentsWithoutFee: 3,
    installmentFeeRate: 1.99,
  });
  
  const updateField = (field: keyof ChargeFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'amount' || field === 'maxInstallments' || field === 'installmentsWithoutFee' || field === 'installmentFeeRate'
        ? parseFloat(value as string) || 0 
        : value
    }));
  };

  // Opções para o número máximo de parcelas
  const maxInstallmentOptions = [
    { id: '1', label: '1x', value: 1 },
    { id: '2', label: '2x', value: 2 },
    { id: '3', label: '3x', value: 3 },
    { id: '6', label: '6x', value: 6 },
    { id: '12', label: '12x', value: 12 },
  ];

  // Opções para o número de parcelas sem juros - agrupadas para melhor visualização
  const installmentsWithoutFeeOptions = () => {
    const maxInstall = formData.maxInstallments || 12;
    
    // Agrupar opções em linhas de 5 para economizar espaço
    const options = [];
    for (let i = 1; i <= maxInstall; i++) {
      options.push({
        id: String(i),
        label: i + 'x',
        value: i,
      });
    }
    return options;
  };

  const handleSubmit = async () => {
    // Validação básica
    if (formData.amount <= 0) {
      alert('Valor deve ser maior que zero');
      return;
    }
    if (!formData.description) {
      alert('Descrição é obrigatória');
      return;
    }
    if (formData.installmentsWithoutFee > formData.maxInstallments) {
      alert('O número de parcelas sem juros não pode ser maior que o número máximo de parcelas');
      return;
    }
    
    try {
      setLoading(true);
      
      // Adicionar data atual formatada
      const date = new Date().toLocaleDateString('pt-BR');
      const chargeWithDate = {
        ...formData,
        date
      };
      
      // Criar cobrança no Firebase
      const charge = await createCharge(chargeWithDate) as unknown as ChargeResponse;
      
      // Navegar para tela de compartilhamento
      router.push({
        pathname: '/(sender)/share-payment',
        params: { 
          chargeId: charge.id,
          token: charge.accessToken
        }
      });
    } catch (error) {
      console.error('Erro ao criar cobrança:', error);
      alert('Não foi possível criar a cobrança. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{
        headerShown: false
      }} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nova Cobrança</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <XCircle size={24} color="#999999" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Detalhes da Cobrança</Text>
            
            <TextField
              label="Valor (R$)"
              value={formData.amount.toString()}
              onChangeText={(value) => updateField('amount', value)}
              keyboardType="numeric"
              placeholder="0,00"
              style={styles.input}
            />
            
            <TextField
              label="Descrição"
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="Ex: Pagamento de serviço"
              style={styles.input}
            />
            
            <TextField
              label="Cliente"
              value={formData.customer}
              onChangeText={(value) => updateField('customer', value)}
              placeholder="Nome do cliente (opcional)"
              style={styles.input}
            />
            
            <Card variant="outlined" style={styles.configCard}>
              <Text style={styles.configTitle}>Configurações de Parcelamento</Text>
              
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Número máximo de parcelas:</Text>
                <OptionSelector
                  options={maxInstallmentOptions}
                  selectedOption={formData.maxInstallments}
                  onSelect={(option) => {
                    updateField('maxInstallments', option.value);
                    if (formData.installmentsWithoutFee > option.value) {
                      updateField('installmentsWithoutFee', option.value);
                    }
                  }}
                  style={styles.optionSelector}
                />
              </View>
              
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Parcelas sem juros:</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScroll}
                >
                  <OptionSelector
                    options={installmentsWithoutFeeOptions()}
                    selectedOption={formData.installmentsWithoutFee}
                    onSelect={(option) => updateField('installmentsWithoutFee', option.value)}
                    style={styles.optionScrollSelector}
                    layout="horizontal"
                  />
                </ScrollView>
              </View>
              
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Taxa de juros (% ao mês):</Text>
                <TextField
                  value={formData.installmentFeeRate.toString()}
                  onChangeText={(value) => updateField('installmentFeeRate', value)}
                  keyboardType="numeric"
                  placeholder="1.99"
                  style={styles.feeInput}
                />
              </View>
              
              <View style={styles.infoContainer}>
                <Info size={16} color={theme.colors.primary} />
                <Text style={styles.infoText}>
                  A taxa de juros será aplicada a partir da {formData.installmentsWithoutFee + 1}ª parcela.
                </Text>
              </View>
            </Card>
            
            <View style={styles.buttonContainer}>
              {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
              ) : (
                <Button
                  title="CRIAR COBRANÇA"
                  onPress={handleSubmit}
                  variant="primary"
                  size="lg"
                  fullWidth
                />
              )}
            </View>
            
            <Text style={styles.helperText}>
              Ao criar uma cobrança, você poderá enviá-la para seu cliente por meio de um link ou QR code.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  configCard: {
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  configTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: 16,
  },
  configItem: {
    marginBottom: 16,
  },
  configLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  optionSelector: {
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  horizontalScroll: {
    maxHeight: 44,
    marginBottom: 8,
  },
  optionScrollSelector: {
    flexDirection: 'row',
  },
  feeInput: {
    marginBottom: 0,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  helperText: {
    marginTop: 16,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: 24,
  },
}); 