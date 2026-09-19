import React from "react";
import { Typography } from "@material-ui/core";
import { FcGoogle } from "react-icons/fc";

import useStyles from "./styles";

export interface ButtonProps {
  onClick: any;
  children: React.ReactNode;
}

export const GoogleButton = (props: ButtonProps): JSX.Element => {
  const styles = useStyles();

  return (
    <div className={styles.button} onClick={props.onClick}>
      <FcGoogle className={styles.icon} size={30} />

      <Typography className={styles.text} variant="body1">
        {props.children}
      </Typography>
    </div>
  );
};
