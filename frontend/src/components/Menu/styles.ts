import { createStyles, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      margin: 0,
      padding: 0,
      height: "26.5rem",
      width: "10rem",
      maxWidth: "900px",
      maxHeight: "900px",
      overflow: "hidden",
      borderRadius: "0 0 0 2rem",
      background: `linear-gradient(45deg, rgba(206,124,44,1) 0%, rgba(247, 155, 51, 1) 50%, rgba(206,124,44,1) 100%)`,
    },
    menuContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      alignItems: "flex-end",
    },

    icon: {
      color: theme.palette.primary.main,
      width: "2.5rem",
    },

    profileIcon: {
      width: "3rem",
    },

    icon2: {
      justifyContent: "flex-end",
      padding: 0,
    },

    iconButtonMenu: {
      margin: "1.6875rem 1rem 0.5rem 0.5rem",
    },

    iconImg: {
      fontSize: "3rem",
    },

    iconMenuImg: {
      fontSize: "3rem",
    },

    menuOpenIconContainer: {
      marginRight: "-1rem",
    },

    text: {
      fontFamily: "Barlow Condensed, sans-serif",
      fontSize: "1rem",
      fontWeight: 600,
      textAlign: "right",
      fontStyle: "italic",
      textTransform: "uppercase",
      color: theme.palette.text.primary,
    },

    borderIcon: {
      padding: 0,
      justifyContent: "center",
      alignItems: "center",
      width: 25,
      height: 35,
      display: "flex",
      borderRadius: "15px 15px 15px 15px",
    },

    textIcon: {
      width: 170,
      paddingLeft: 0,
      paddingRight: 0,
      marginTop: "0.5rem",
    },

    test: {},
  })
);

export default useStyles;
