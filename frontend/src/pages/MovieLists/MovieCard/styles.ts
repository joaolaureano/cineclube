import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    movieItem: {
      display: "flex",
      width: "100%",
      height: "120px",
      border: "none",

      "&:not(:first-child)": {
        marginTop: "8px",
      },
    },

    movieCover: {
      height: "auto",
      width: "84px",
    },

    content: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: "100%",
      padding: "4px 8px 4px 8px",
    },

    topContent: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: "36px",
    },

    movieTitle: {
      fontFamily: "Barlow Condensed, sans-serif",
      fontSize: "1.8rem",
      fontStyle: "italic",
      fontWeight: 600,
      textTransform: "uppercase",
      lineHeight: "1.5rem",
    },

    bottomContent: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },

    platforms: {},

    platformIcons: {
      display: "flex",
    },
    platformIcon: {
      width: "32px",
      height: "32px",
      "&:not(:first-child)": {
        marginLeft: "4px",
      },
    },

    bottomIcons: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
    },

    icon: {
      padding: "4px 2px",
    },
  })
);

export default useStyles;
