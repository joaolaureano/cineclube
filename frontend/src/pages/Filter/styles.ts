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
      marginBottom: "5%",
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
      fontSize: "1rem",
      fontWeight: 500,
      marginBottom: "10px",
    },
    platformIcon: {
      display: "flex",
      marginRight: "3px",
      position: "relative",
    },
    listPlatform: {
      display: "flex",
    },
    contentWrapper: {
      paddingLeft: "20px",
      paddingRight: "20px",
      height: "78%",
    },
    divider: {
      marginBottom: "20px",
      marginTop: "25px",
      height: "2px",
    },
    listTag: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
    },

    expandIconContainer: {
      marginLeft: "auto",
    },
    tagListHeader: {
      display: "flex",
      alignItems: "center",
    },
    checkIcon: {
      display: "flex",
      position: "absolute",
      bottom: "0px",
      right: "0px",
      strokeWidth: "3px",
      stroke: `${theme.palette.primary.light}`,
    },
    sendButton: {
      background: theme.palette.text.secondary,
      color: "#fff",
      width: "calc(100% - 6rem)",
      margin: "3rem 3rem 0",

      "&:hover": {
        background: theme.palette.text.primary,
      },
    },
    atBottom: {},
  })
);

export default useStyles;
