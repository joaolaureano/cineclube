import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: "100%",
      minHeight: "100vh",
      width: "100%",

      position: "fixed",
      top: "0",
      zIndex: 50,

      background: theme.palette.background.default,
    },

    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
    },

    header: {
      display: "flex",
      alignItems: "center",

      width: "100%",
      height: "3rem",

      padding: "8px 0",
      marginLeft: "-1rem",
    },

    backIcon: {},

    content: {
      height: "calc(100vh - 2.5rem)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },

    achievementTitle: {
      marginTop: "2rem",

      textTransform: "uppercase",
      fontFamily: "Barlow Condensed, sans-serif",
      textAlign: "center",
      fontSize: "2.5rem",
      fontStyle: "italic",
    },

    achievementDescription: {
      marginTop: "3rem",
      fontSize: "1.25rem",
      textAlign: "center",
      color: theme.palette.text.primary,
    },

    imageWrapper: {
      background: "white",
      width: "18.75rem",
      height: "18.75rem",

      marginTop: "7rem",
      overflow: "hidden",
      borderRadius: "50%",
    },

    image: {
      display: "block",
      width: "18.75rem",

      objectFit: "contain",
    },

    achievementList: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",

      margin: "24px 0",
    },
  })
);

export default useStyles;
