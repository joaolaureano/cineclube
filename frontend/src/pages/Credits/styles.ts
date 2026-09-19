import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

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
      /*marginBottom: "5%",*/
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
    paragraph: {
      fontSize: "0.9rem",
      fontWeight: 500,
      marginBottom: "8px",
      textAlign: "center",
    },

    coontentHeader: {
      fontSize: "0.9rem",
      fontWeight: 500,
      marginBottom: "8px",
      textAlign: "center",
    },

    listHeader: {
      fontSize: "1.2rem",
      fontWeight: 500,
      marginBottom: "10px",
      marginTop: "5px",
      textAlign: "center",
    },
    contentWrapper: {
      paddingLeft: "20px",
      paddingRight: "20px",
      height: "78%",
    },
    divider: {
      marginBottom: "10px",
      marginTop: "15px",
      height: "2px",
    },
  })
);

export default useStyles;
