import React from "react";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { useHistory } from "react-router-dom";
import { Container, IconButton, Typography } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import useStyles from "./styles";
import { CustomIcon } from "../CustomIcon";
type Anchor = "right";

export default function TemporaryDrawer() {
  const classes = useStyles();
  const history = useHistory();
  const [state, setState] = React.useState({
    right: false,
  });

  const toggleDrawer = (anchor: Anchor, open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const handleOpenList = (listName: string) => {
    history.push(`user/movies/${listName}`);
  };

  const handleOpenAchievementList = () => {
    history.push("user/achievements");
  };

  const handleOpenCredits = () => {
    history.push("/credits");
  };

  const handleOpenProfile = () => {
    history.push("user/profile");
  };

  const list = (anchor: Anchor) => (
    <div
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
      className={classes.menuContainer}
    >
      <IconButton
        className={[classes.icon2, classes.iconButtonMenu].join(" ")}
        onClick={toggleDrawer("right", false)}
      >
        <MoreVertIcon fontSize="large" className={classes.iconMenuImg} />
      </IconButton>
      <List className={classes.test}>
        <ListItem
          className={classes.textIcon}
          button
          key="profile"
          onClick={() => handleOpenProfile()}
        >
          <ListItemText
            primary={<Typography className={classes.text}>Perfil</Typography>}
          />
          <ListItemIcon>
            <Container className={classes.borderIcon}>
              <CustomIcon
                type="menuProfile"
                className={[classes.icon, classes.profileIcon].join(" ")}
              />
            </Container>
          </ListItemIcon>
        </ListItem>
        <ListItem
          className={classes.textIcon}
          button
          key="wantToWatchList"
          onClick={() => handleOpenList("wantToWatch")}
        >
          <ListItemText
            primary={
              <Typography className={classes.text}>Quero Ver!</Typography>
            }
          />
          <ListItemIcon>
            <Container className={classes.borderIcon}>
              <CustomIcon type="menuWantToWatch" className={classes.icon} />
            </Container>
          </ListItemIcon>
        </ListItem>
        <ListItem
          className={classes.textIcon}
          button
          key="watchedList"
          onClick={() => handleOpenList("watched")}
        >
          <ListItemText
            primary={<Typography className={classes.text}>Já vi!</Typography>}
          />
          <ListItemIcon>
            <Container className={classes.borderIcon}>
              <CustomIcon type="menuWatched" className={classes.icon} />
            </Container>
          </ListItemIcon>
        </ListItem>
        <ListItem
          className={classes.textIcon}
          button
          key="achievements"
          onClick={() => handleOpenAchievementList()}
        >
          <ListItemText
            primary={
              <Typography className={classes.text}>Conquistas!</Typography>
            }
          />
          <ListItemIcon>
            <Container className={classes.borderIcon}>
              <CustomIcon type="menuAchievements" className={classes.icon} />
            </Container>
          </ListItemIcon>
        </ListItem>
        <ListItem
          className={classes.textIcon}
          button
          key="settings"
          onClick={() => handleOpenCredits()}
        >
          <ListItemText
            primary={<Typography className={classes.text}>Créditos</Typography>}
          />
          <ListItemIcon className={classes.icon}>
            <Container className={classes.borderIcon}>
              <CustomIcon type="menusettings" className={classes.icon} />
            </Container>
          </ListItemIcon>
        </ListItem>
      </List>
    </div>
  );

  return (
    <div className={classes.menuOpenIconContainer}>
      <React.Fragment key="drawer">
        <IconButton
          className={classes.icon2}
          onClick={toggleDrawer("right", true)}
        >
          <MoreVertIcon fontSize="large" className={classes.iconImg} />
        </IconButton>
        <Drawer
          anchor="right"
          open={state["right"]}
          onClose={toggleDrawer("right", false)}
          classes={{
            paper: classes.paper,
          }}
        >
          {list("right")}
        </Drawer>
      </React.Fragment>
    </div>
  );
}
