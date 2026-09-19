import React from "react";
import { CircularProgress, Typography } from "@material-ui/core";

import useStyles from "./styles";

export const Spinner = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <CircularProgress size={"5rem"} className={classes.spinner} />
        <Typography className={classes.text} variant="h4" color="textPrimary">
          Carregando
        </Typography>
      </div>
    </div>
  );
};
