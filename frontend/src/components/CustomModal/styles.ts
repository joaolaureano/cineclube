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
    },
    modalBorder: {
      backgroundColor: theme.palette.background.paper,
      width: "clamp(200px, 80%, 600px)",
      padding: "20px 10px",
      borderRadius: "10px",
    },
  })
);

export default useStyles;
