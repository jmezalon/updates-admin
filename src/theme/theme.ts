import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // blue for better contrast
      contrastText: '#fff',
    },
    secondary: {
      main: 'rgba(255,184,0,1)', // yellow
      contrastText: '#000',
    },
    error: {
      main: '#e53935', // red
    },
    text: {
      primary: '#000',
      secondary: '#666',
    },
    background: {
      default: '#fff',
      paper: '#fff',
    },
  },
  components: {
    // Fix Tab component contrast
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#666', // Default tab color
          '&.Mui-selected': {
            color: '#1976d2', // Selected tab color
            fontWeight: 600,
          },
          '&:hover': {
            color: '#1976d2',
          },
        },
      },
    },
    // Fix TextField input visibility
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#666', // Label color
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#1976d2', // Focused label color
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#ccc', // Default border
            },
            '&:hover fieldset': {
              borderColor: '#1976d2', // Hover border
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2', // Focused border
            },
            '& input': {
              color: '#000', // Input text color
            },
            '& textarea': {
              color: '#000', // Textarea text color
            },
          },
        },
      },
    },
    // Fix Select component visibility
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiSelect-select': {
            color: '#000', // Select text color
          },
        },
      },
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  },
});
