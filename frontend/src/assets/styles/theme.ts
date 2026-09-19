import { createMuiTheme } from "@material-ui/core";

const primary = "#e08314";
const secondary = "#cccccc";
const textPrimary = "#4d4d4d";
const background = "#f2f2f2";
const theme = createMuiTheme({
  palette: {
    primary: {
      main: primary,
      contrastText: "#fff",
    },
    secondary: {
      main: secondary,
      contrastText: textPrimary,
    },
    text: {
      primary: textPrimary,
    },
    background: {
      default: background,
    },
  },
  typography: {
    button: {
      textTransform: "none",
    },
    fontFamily: "Barlow",
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
});

export default theme;
