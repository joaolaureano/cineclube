import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      background: theme.palette.primary.main,
      opacity: 1,
    },

    tutorialImg: {
      maxWidth: "100vw",
      position: "absolute",
      bottom: 0,
      left: 0,
    },
  })
);

export default useStyles;
