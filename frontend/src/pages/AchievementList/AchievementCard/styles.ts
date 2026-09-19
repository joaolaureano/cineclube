import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      width: "100%",
      "&:not(:first-child)": {
        marginTop: "0.5rem",
      },
    },

    cardContent: {
      display: "flex",
      alignItems: "center",
      padding: "0.75rem !important",
      width: "100%",
    },

    imageWrapper: {
      width: "5rem",
      height: "5rem",
      overflow: "hidden",
      borderRadius: "50%",
    },

    image: {
      display: "block",
      width: "5rem",

      objectFit: "contain",
    },

    cardText: {
      width: "69%",
      marginLeft: "1rem",
    },

    cardTitle: {
      fontFamily: "Barlow Condensed, sans-serif",
      fontSize: "1.8rem",
      fontStyle: "italic",
      fontWeight: 600,
      textTransform: "uppercase",
      lineHeight: "1.5rem",

      marginBottom: "0.5rem",
    },

    cardDescription: {},
  })
);

export default useStyles;
