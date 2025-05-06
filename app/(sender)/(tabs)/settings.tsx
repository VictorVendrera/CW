import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User, CreditCard, Bell, HelpCircle, ChevronRight, Lock, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useRole } from '../../../hooks/useRole';

export default function SenderSettingsScreen() {
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
      'Tem certeza que deseja mudar para o papel de Devedor?',
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
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Meu Perfil</Text>
        </View>
        
        <View style={styles.profileCard}>
          <View style={styles.profilePicture}>
            <User size={40} color="#FFFFFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>João da Silva</Text>
            <Text style={styles.profileEmail}>joao.silva@exemplo.com</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Conta</Text>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <User size={20} color="#0066CC" />
            </View>
            <Text style={styles.menuText}>Dados Pessoais</Text>
            <ChevronRight size={18} color="#999999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <CreditCard size={20} color="#0066CC" />
            </View>
            <Text style={styles.menuText}>Dados Bancários</Text>
            <ChevronRight size={18} color="#999999" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Preferências</Text>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Bell size={20} color="#0066CC" />
            </View>
            <Text style={styles.menuText}>Notificações</Text>
            <ChevronRight size={18} color="#999999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Shield size={20} color="#0066CC" />
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
            <Text style={styles.menuText}>Mudar para Devedor</Text>
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
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
  },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutIcon: {
    backgroundColor: '#FFE5E5',
  },
  logoutText: {
    color: '#FF3B30',
  }
}); 