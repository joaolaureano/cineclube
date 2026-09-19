import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      textAlign: "center",
      color: "blue",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    modalParent: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
    },
    buttons: {
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
    },
    buttonIcon: {
      fontSize: "60px",
    },
    buttonMargin: {
      marginTop: "24.5px",
    },
  })
);

export default useStyles;
