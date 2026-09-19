import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "70%",
      maxWidth: "900px",

      background: theme.palette.background.default,
      borderRadius: "50px 50px 0 0",

      marginTop: "-50px",
    },

    header: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "50%",

      marginTop: "-50px",

      background: `linear-gradient(45deg, rgba(206,124,44,1) 0%, rgba(247, 155, 51, 1) 50%, rgba(206,124,44,1) 100%)`,
    },

    logo: {
      width: "300px",
    },

    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "stretch",
      height: "100vh",

      background: theme.palette.primary.main,
    },

    loginWrapper: {
      maxWidth: "600px",
    },

    text: {
      fontSize: 45,
      color: theme.palette.primary.dark,
    },

    subTitle: {
      margin: "0 28px 16px 28px",
    },
  })
);

export default useStyles;
