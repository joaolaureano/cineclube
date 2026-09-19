import { makeStyles, Theme, createStyles } from "@material-ui/core";
import theme from "../../assets/styles/theme";

const useStyles = makeStyles({
  buttons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  snackSuccess: {
    backgroundColor: theme.palette.success.main,
    textAlign: "center",
    justifyContent: "center",
    margin: "auto",
  },
  snackFailure: {
    backgroundColor: theme.palette.error.main,
    textAlign: "center",
    justifyContent: "center",
    margin: "auto",
  },
});

export default useStyles;
