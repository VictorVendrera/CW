import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import TextField from './TextField';
import MaskedInput from './MaskedInput';
import Button from './Button';
import { formatCurrency, parseCurrencyString } from '../utils/format';
import { maskPhone } from '../utils/masks';
import { unmaskPhone } from '../utils/unmasks';

interface ChargeFormValues {
  amount: number;
  description: string;
  customer: string;
  phone?: string;
}

interface ChargeFormProps {
  initialValues?: Partial<ChargeFormValues>;
  onSubmit: (values: ChargeFormValues) => Promise<void> | void;
  loading?: boolean;
  submitLabel?: string;
  requireCustomer?: boolean; // se o nome do cliente é obrigatório
}

const ChargeForm: React.FC<ChargeFormProps> = ({
  initialValues = {},
  onSubmit,
  loading = false,
  submitLabel = 'Criar Cobrança',
  requireCustomer = true,
}) => {
  const [amount, setAmount] = useState(initialValues.amount ? formatCurrency(initialValues.amount) : '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [customer, setCustomer] = useState(initialValues.customer || '');
  const [phone, setPhone] = useState(initialValues.phone || '');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const numericAmount = parseCurrencyString(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      newErrors.amount = 'Informe um valor válido';
    }
    if (!description) {
      newErrors.description = 'Informe a descrição';
    }
    if (requireCustomer && !customer) {
      newErrors.customer = 'Informe o nome do cliente';
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    try {
      await onSubmit({
        amount: parseCurrencyString(amount),
        description: description.trim(),
        customer: customer.trim(),
        phone: phone ? unmaskPhone(phone) : undefined,
      });
    } catch (err) {
      Alert.alert('Erro', 'Ocorreu um erro ao criar a cobrança. Tente novamente.');
    }
  };

  return (
    <View style={styles.form}>
      <MaskedInput
        mask="custom"
        customMask={(v) => formatCurrency(Number(v.replace(/\D/g, '')) / 100)}
        label="Valor da Cobrança"
        placeholder="R$ 0,00"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        error={errors.amount}
        returnUnmasked={false}
      />
      <TextField
        label="Descrição"
        placeholder="Ex: Serviço de manutenção"
        value={description}
        onChangeText={setDescription}
        error={errors.description}
      />
      <TextField
        label="Nome do Cliente"
        placeholder="Ex: João Silva"
        value={customer}
        onChangeText={setCustomer}
        error={errors.customer}
      />
      <MaskedInput
        mask="phone"
        label="Telefone (opcional)"
        placeholder="(00) 00000-0000"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        error={errors.phone}
        returnUnmasked={false}
      />
      <Button
        title={submitLabel}
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  button: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: '#0066FF',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#0066FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChargeForm;
export type { ChargeFormValues }; 