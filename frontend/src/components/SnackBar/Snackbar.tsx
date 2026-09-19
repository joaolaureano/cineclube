import React from "react";
import { IconButton, Snackbar } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import MuiAlert from "@material-ui/lab/Alert";

import { SharedSnackbarConsumer } from "./SnackContext";

function Alert(props: any) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const SharedSnackbar = () => (
  <SharedSnackbarConsumer>
    {({ isOpen, message, severity, closeSnackbar }) => (
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        open={isOpen}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        message={message}
        action={[
          <IconButton key="close" color="inherit" onClick={closeSnackbar}>
            <Close />
          </IconButton>,
        ]}
      >
        <Alert severity={severity}>{message}</Alert>
      </Snackbar>
    )}
  </SharedSnackbarConsumer>
);

export default SharedSnackbar;
