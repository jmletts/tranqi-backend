export const Theme = {
  colors: {
    primary: {
      yellow: '#ffd900', // Tranqi Yellow
      blue: '#0120ca',   // Tranqi Blue
      pink: '#e300b6',   // Tranqi Pink
    },
    background: {
      dark: '#010100',   // Dark Black (Headers, Bottom Tab)
      white: '#ffffff',  // Pure White (Main Content)
      lightGray: '#f2f2f2' // Light Gray (Operations Content)
    },
    status: {
      expense: '#b31222', // Red Expense
      income: '#00a650'   // Green Income
    },
    ui: {
      inputBorder: '#e5e5e5', // Light gray for inputs
      textSecondary: '#666666'
    }
  },
  typography: {
    family: {
      regular: 'Montserrat_400Regular',
      medium: 'Montserrat_500Medium',
      bold: 'Montserrat_700Bold',
      extraBold: 'Montserrat_800ExtraBold',
      black: 'Montserrat_900Black',
    }
  },
  borderRadius: {
    pill: 30,
    bottomTab: 40,
    cardSmall: 12,
    cardMedium: 16,
    cardLarge: 24,
    asymmetricContainer: 40 // For borderTopLeftRadius
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  }
};
