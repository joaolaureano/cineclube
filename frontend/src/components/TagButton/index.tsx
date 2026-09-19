import { AvatarTypeMap, Chip } from "@material-ui/core";
import { DefaultComponentProps } from "@material-ui/core/OverridableComponent";
import React from "react";

interface TagButtonProps extends DefaultComponentProps<AvatarTypeMap> {
  title: string;
  selected: boolean;
}

export const TagButton: React.FC<TagButtonProps> = (props) => {
  const { title, onClick, selected } = props;

  return (
    <Chip
      variant={selected ? "default" : "outlined"}
      size="medium"
      color="primary"
      label={title}
      onClick={onClick}
    />
  );
};
