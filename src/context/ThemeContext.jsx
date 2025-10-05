import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [companyColor, setCompanyColor] = useState('#f97316'); 

  useEffect(() => {
    // Vérifier d'abord si une entreprise est sélectionnée dans localStorage (pour super admin)
    const selectedCompany = localStorage.getItem('selectedCompany');
    if (selectedCompany) {
      try {
        const companyData = JSON.parse(selectedCompany);
        if (companyData.color) {
          setCompanyColor(companyData.color);
          return;
        }
      } catch (error) {
        console.error('Erreur lors de la lecture de l\'entreprise sélectionnée:', error);
      }
    }

    // Sinon utiliser la couleur de l'entreprise de l'utilisateur
    if (user?.company?.color) {
      setCompanyColor(user.company.color);
    }
  }, [user]);

  const generateColorVariants = (baseColor) => {
    
    const colorMap = {
      '#f97316': {
        primary: 'orange',
        primary50: 'orange-50',
        primary100: 'orange-100',
        primary500: 'orange-500',
        primary600: 'orange-600',
        primary700: 'orange-700',
      },
      '#3b82f6': {
        primary: 'blue',
        primary50: 'blue-50',
        primary100: 'blue-100',
        primary500: 'blue-500',
        primary600: 'blue-600',
        primary700: 'blue-700',
      },
      '#10b981': {
        primary: 'green',
        primary50: 'green-50',
        primary100: 'green-100',
        primary500: 'green-500',
        primary600: 'green-600',
        primary700: 'green-700',
      },
      '#ef4444': {
        primary: 'red',
        primary50: 'red-50',
        primary100: 'red-100',
        primary500: 'red-500',
        primary600: 'red-600',
        primary700: 'red-700',
      },
      '#8b5cf6': {
        primary: 'purple',
        primary50: 'purple-50',
        primary100: 'purple-100',
        primary500: 'purple-500',
        primary600: 'purple-600',
        primary700: 'purple-700',
      },
      '#f59e0b': {
        primary: 'yellow',
        primary50: 'yellow-50',
        primary100: 'yellow-100',
        primary500: 'yellow-500',
        primary600: 'yellow-600',
        primary700: 'yellow-700',
      },
      '#ec4899': {
        primary: 'pink',
        primary50: 'pink-50',
        primary100: 'pink-100',
        primary500: 'pink-500',
        primary600: 'pink-600',
        primary700: 'pink-700',
      },
      '#6b7280': {
        primary: 'gray',
        primary50: 'gray-50',
        primary100: 'gray-100',
        primary500: 'gray-500',
        primary600: 'gray-600',
        primary700: 'gray-700',
      },
    };

    return colorMap[baseColor] || colorMap['#f97316'];
  };

  const theme = generateColorVariants(companyColor);

  const value = {
    companyColor,
    setCompanyColor,
    theme,
    colors: {
      primary: theme.primary,
      primary50: theme.primary50,
      primary100: theme.primary100,
      primary500: theme.primary500,
      primary600: theme.primary600,
      primary700: theme.primary700,
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};