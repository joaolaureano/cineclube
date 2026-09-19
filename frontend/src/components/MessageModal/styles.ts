import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
    },
    texts: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
    },
    platforms: {
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      marginTop: "0.5rem",
    },
    platformIcons: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "0.5rem",
    },
    button: {
      marginTop: "0.5rem",
      marginBottom: "-0.75rem",
      padding: "0.5rem 1rem",
    },
    typo: {
      fontWeight: 500,
      fontFamily: "Barlow Condensed, sans-serif",
      "& > span": {
        fontWeight: 800,
      },
    },
    typoButton: {
      fontWeight: 800,
      fontSize: "2rem",
      fontFamily: "Barlow Condensed, sans-serif",
      textTransform: "uppercase",
    },
  })
);

export default useStyles;
