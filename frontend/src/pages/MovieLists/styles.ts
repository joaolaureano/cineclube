import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: "100%",
      minHeight: "100vh",

      background: `linear-gradient(45deg, rgba(206,124,44,1) 0%, rgba(247, 155, 51, 1) 50%, rgba(206,124,44,1) 100%)`,
    },

    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
    },

    header: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",

      padding: "8px 0",
    },

    backIcon: {
      position: "absolute",
      left: "0",
    },

    pageTitle: {
      textTransform: "uppercase",
      color: theme.palette.text.primary,
    },

    tabsContainer: {
      margin: "8px 5%",
    },

    tabs: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      justifySelf: "center",
      width: "100%",
    },

    tab: {
      color: theme.palette.text.primary,
      width: "50%",
    },

    movieList: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",

      margin: "24px 0",
    },
  })
);

export default useStyles;
