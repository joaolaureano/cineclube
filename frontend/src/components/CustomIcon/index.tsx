import React from "react";

import watched from "../../assets/images/icons/actions-watched.svg";
import wantToWatch from "../../assets/images/icons/actions-want-to-watch.svg";
import dontWantToWatch from "../../assets/images/icons/actions-dont-want-to-watch.svg";
import undo from "../../assets/images/icons/actions-undo.svg";
import menuWatched from "../../assets/images/icons/menu-watched.svg";
import menuWantToWatch from "../../assets/images/icons/menu-want-to-watch.svg";
import menusettings from "../../assets/images/icons/menu-settings.svg";
import menuProfile from "../../assets/images/icons/menu-profile.svg";
import menuAchievements from "../../assets/images/icons/menu-achievements.svg";
import menuFilters from "../../assets/images/icons/menu-filters.svg";

interface CustomIconProps {
  type:
    | "watched"
    | "wantToWatch"
    | "dontWantToWatch"
    | "undo"
    | "menuWatched"
    | "menuWantToWatch"
    | "menusettings"
    | "menuProfile"
    | "menuAchievements"
    | "menuFilters";
  className?: string;
}

const getIcon = (type: string) => {
  switch (type) {
    case "watched":
      return watched;
    case "wantToWatch":
      return wantToWatch;
    case "dontWantToWatch":
      return dontWantToWatch;
    case "undo":
      return undo;
    case "menuWatched":
      return menuWatched;
    case "menuProfile":
      return menuProfile;
    case "menuWantToWatch":
      return menuWantToWatch;
    case "menusettings":
      return menusettings;
    case "menuAchievements":
      return menuAchievements;
    case "menuFilters":
      return menuFilters;
  }
};

export const CustomIcon: React.FC<CustomIconProps> = ({ type, className }) => {
  return (
    <img
      width={50}
      src={getIcon(type)}
      alt={`${type}-button`}
      className={className}
    />
  );
};
