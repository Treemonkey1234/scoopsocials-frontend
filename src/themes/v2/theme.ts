import { createTheme } from '@mui/material/styles';

export const themeV2 = createTheme({
  palette: {
    primary: {
      main: '#00B6FF',
      light: '#33C4FF',
      dark: '#0080B3',
    },
    secondary: {
      main: '#FFFFFF',
      light: '#F5F5F5',
      dark: '#EEEEEE',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: (factor: number) => `${4 * factor}px`,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0px 4px 12px rgba(0, 182, 255, 0.3)',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0, 182, 255, 0.4)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#F5F5F5',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00B6FF',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00B6FF',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Design tokens for use in components
export const designTokens = {
  colors: {
    primary: '#00B6FF',
    primaryLight: '#33C4FF',
    primaryDark: '#0080B3',
    secondary: '#FFFFFF',
    secondaryLight: '#F5F5F5',
    secondaryDark: '#EEEEEE',
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    background: '#F5F5F5',
    backgroundPaper: '#FFFFFF',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '25px',
  },
  shadows: {
    sm: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    md: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0px 8px 16px rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: '2rem',
    h2: '1.5rem',
    h3: '1.25rem',
    body1: '1rem',
    body2: '0.875rem',
  },
}; 