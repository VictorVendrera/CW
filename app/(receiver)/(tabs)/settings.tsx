import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User, CreditCard, Bell, HelpCircle, ChevronRight, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useRole } from '../../../hooks/useRole';

export default function SettingsScreen() {
  const router = useRouter();
  const { clearRole } = useRole();

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await clearRole();
            router.replace('/role-selection');
          } 
        },
      ]
    );
  };

  const handleSwitchRole = async () => {
    Alert.alert(
      'Mudar Papel',
      'Tem certeza que deseja mudar para o papel de Cobrador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Mudar', 
          onPress: async () => {
            router.replace('/role-selection');
          } 
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <View style={styles.avatarPlaceholder}>
            <User size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.username}>Usuário</Text>
          <Text style={styles.email}>usuario@exemplo.com</Text>
        </View>

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Configurações</Text>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <User size={20} color="#0066CC" />
            </View>
            <Text style={styles.menuText}>Meu Perfil</Text>
            <ChevronRight size={18} color="#999999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <CreditCard size={20} color="#0066CC" />
            </View>
            <Text style={styles.menuText}>Métodos de Pagamento</Text>
            <ChevronRight size={18} color="#999999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Bell size={20} color="#0066CC" />
            </View>
            <Text style={styles.menuText}>Notificações</Text>
            <ChevronRight size={18} color="#999999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Lock size={20} color="#0066CC" />
            </View>
            <Text style={styles.menuText}>Segurança</Text>
            <ChevronRight size={18} color="#999999" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Outros</Text>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleSwitchRole}
          >
            <View style={styles.menuIconContainer}>
              <User size={20} color="#0066CC" />
            </View>
            <Text style={styles.menuText}>Mudar para Cobrador</Text>
            <ChevronRight size={18} color="#999999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <HelpCircle size={20} color="#0066CC" />
            </View>
            <Text style={styles.menuText}>Ajuda e Suporte</Text>
            <ChevronRight size={18} color="#999999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <View style={[styles.menuIconContainer, styles.logoutIcon]}>
              <LogOut size={20} color="#FF3B30" />
            </View>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666666',
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutIcon: {
    backgroundColor: '#FFEEEE',
  },
  logoutText: {
    flex: 1,
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
}); 