import React, { createContext, useState } from "react";

import SharedSnackbar from "./Snackbar";
export const SharedSnackbarContext = createContext({
  isOpen: false,
  message: "",
  severity: "success",
  openSnackbar: (message: string, severity: string) => {},
  closeSnackbar: () => {},
});

export const SharedSnackbarProvider = (props: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("");

  const openSnackbar = (message: any, severity: any) => {
    setMessage(message);
    setSeverity(severity);
    setIsOpen(true);
  };

  const closeSnackbar = () => {
    setIsOpen(false);
  };

  const { children } = props;

  return (
    <SharedSnackbarContext.Provider
      value={{
        isOpen,
        message,
        severity,
        openSnackbar,
        closeSnackbar,
      }}
    >
      <SharedSnackbar />
      {children}
    </SharedSnackbarContext.Provider>
  );
};
export const SharedSnackbarConsumer = SharedSnackbarContext.Consumer;
