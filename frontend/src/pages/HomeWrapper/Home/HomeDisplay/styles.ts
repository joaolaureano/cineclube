import { makeStyles, createStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => {
  return createStyles({
    root: {
      maxWidth: "700px",
      height: "100%",
      background: theme.palette.background.default,
    },

    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: "100%",
      paddingBottom: "5.2rem",

      background: theme.palette.background.default,
    },

    topMenu: {
      position: "fixed",
      top: 0,
      zIndex: 5,

      width: "100%",
      padding: "1.7rem 2rem 1.5rem 2rem",

      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      background: "inherit",
      boxShadow: "none",
    },

    logo: {
      height: "2.75rem",
      alignSelf: "flex-start",
    },
    sideIcon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      marginLeft: "auto",
      gap: "10px",
    },
    content: {
      marginTop: "6.25rem",
    },

    cover: {
      width: "100%",
    },

    movieInfo: {
      marginTop: "1rem",
    },

    movieTitle: {
      fontSize: "1.8rem",
      fontWeight: 700,
      fontStyle: "italic",
      fontFamily: "Barlow Condensed, sans-serif",
      textTransform: "uppercase",
      marginBottom: "-0.1rem",
    },

    original_title: {
      fontSize: "0.93rem",
      fontWeight: 400,
      fontFamily: "Barlow Condensed, sans-serif",
      textTransform: "uppercase",
      marginBottom: "-0.1rem",
    },

    year: {
      fontSize: "0.93rem",
      color: theme.palette.primary.main,
      fontWeight: 600,
      fontStyle: "italic",
      marginBottom: "-0.05rem",
    },

    duration: {
      marginBottom: "1rem",
    },

    synopsis: {
      lineHeight: "1.4rem",
    },

    synopsis2: {
      lineHeight: "1.4rem",
      display: "inline",
      fontWeight: 700,
    },

    platforms: { padding: "1rem 0" },

    cast: {
      display: "inline",
    },

    synopsisContainer: {
      padding: "1rem 0 0 0",
    },

    castNames: {
      fontWeight: 700,
      textTransform: "uppercase",
    },

    platform: {
      width: theme.spacing(7),
      height: theme.spacing(7),
    },

    tags: {
      padding: "1rem 0 0 0",
    },

    tag: {
      marginBottom: "8px",
      marginRight: "8px",
    },

    listEndContainer: {
      height: "calc(100vh - 5.5rem)",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: theme.palette.background.default,
    },

    listEndMessage: {
      color: theme.palette.text.primary,
      textTransform: "uppercase",
      textAlign: "center",
      fontFamily: "Barlow Condensed, sans-serif",
      marginTop: "5.5rem",
    },

    appBar: {
      top: "auto",
      bottom: 0,
      background: theme.palette.primary.main,
      zIndex: 5,
    },

    bottomMenu: {
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      maxWidth: "700px",
      background: theme.palette.background.default,
      marginBottom: "0.5rem",
      borderRadius: "0 0 2rem 2rem",
    },

    menuDivider: {
      height: "3rem",
      alignSelf: "center",
    },
  });
});

export default useStyles;
