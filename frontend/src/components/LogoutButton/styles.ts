import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      height: "3.2rem",

      marginTop: "38px",
      padding: "8px 16px",
      borderRadius: "32px",

      boxShadow: "0px 1px 4px rgb(0 0 0 / 5%), 0px 4px 16px rgb(0 0 0 / 6%)",
      backgroundColor: theme.palette.secondary.main,

      "&:hover": {
        background: "rgba(0, 0, 0, 0.07)",
        cursor: "pointer",
      },
    },
    icon: {
      position: "absolute",
    },

    text: {
      fontSize: "1.2rem",
      color: theme.palette.text.primary,
      textAlign: "center",
      width: "100%",
    },
  })
);

export default useStyles;
