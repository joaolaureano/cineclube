import React from "react";
import Router from "./router";
import { ThemeProvider } from "@material-ui/core";

import { SharedSnackbarProvider } from "./components/SnackBar/SnackContext";
import { AuthContextProvider } from "./contexts/AuthContext";
import theme from "./assets/styles/theme";

import "./assets/styles/reset.css";
import "./assets/styles/global.css";

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <AuthContextProvider>
          <SharedSnackbarProvider>
            <Router />
          </SharedSnackbarProvider>
        </AuthContextProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
