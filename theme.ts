"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",

    background: {
      default: "#020617", // tüm sayfaların arka planı
      paper: "#020617",
    },

    primary: {
      main: "#2563eb", // Giriş Yap butonu
    },

    text: {
      primary: "#f9fafb",
      secondary: "#94a3b8",
    },
  },

  components: {
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#e5edff",
          borderRadius: 10,
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          background:
            "linear-gradient(180deg, #020617 0%, #020617 100%)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        },
      },
    },
  },
});

export default theme;
