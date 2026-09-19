import React from "react";
import { Typography } from "@material-ui/core";

import useStyles from "./styles";

export interface ButtonProps {
  onClick: any;
  children: React.ReactNode;
}

export const LogoutButton = (props: ButtonProps): JSX.Element => {
  const styles = useStyles();

  return (
    <div className={styles.button} onClick={props.onClick}>
      <Typography className={styles.text} variant="body1">
        {props.children}
      </Typography>
    </div>
  );
};
