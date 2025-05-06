import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Role = 'sender' | 'receiver' | null;

type RoleContextType = {
  role: Role;
  setRole: (role: Role) => Promise<void>;
  clearRole: () => Promise<void>;
  isLoading: boolean;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar papel salvo na inicialização
  useEffect(() => {
    const loadRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem('user_role');
        if (savedRole) {
          setRoleState(savedRole as Role);
        }
      } catch (error) {
        console.error('Erro ao carregar papel do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRole();
  }, []);

  // Salvar papel
  const setRole = async (newRole: Role) => {
    try {
      setIsLoading(true);
      if (newRole) {
        await AsyncStorage.setItem('user_role', newRole);
      } else {
        await AsyncStorage.removeItem('user_role');
      }
      setRoleState(newRole);
    } catch (error) {
      console.error('Erro ao salvar papel do usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Limpar papel
  const clearRole = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem('user_role');
      setRoleState(null);
    } catch (error) {
      console.error('Erro ao limpar papel do usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole, clearRole, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
};

// Hook para usar o contexto
export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole deve ser usado dentro de um RoleProvider');
  }
  return context;
}; 