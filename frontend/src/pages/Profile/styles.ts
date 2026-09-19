import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import { isPartiallyEmittedExpression } from "typescript";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.default,
      height: "100vh",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      width: "100vw",
      height: "10%",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingLeft: "10px",
      marginBottom: "5%",
    },
    backIconContainer: {
      position: "absolute",
    },
    title: {
      textTransform: "uppercase",
      color: theme.palette.text.primary,
    },
    textContainer: {
      display: "flex",
      margin: "auto",
    },
    photoWrapper: {
      height: "45%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      "& img": {
        height: "180px",
        width: "180px",
      },
    },
    contentWrapper: {
      height: "78%",
      padding: "0",
      backgroundColor: theme.palette.background.paper,
    },
    profileInfo: {
      padding: "10px 16px",
    },
    divider: {
      height: "1px",
      width: "100vw",
      margin: "0",
    },
    logoutButton: {
      marginTop: "50px",
    },
  })
);

export default useStyles;
