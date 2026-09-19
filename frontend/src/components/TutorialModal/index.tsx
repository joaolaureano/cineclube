import React from "react";
import Modal from "@material-ui/core/Modal";

import tutorialImg from "../../assets/images/tutorial.png";

import useStyles from "./styles";

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<ModalProps> = (props: ModalProps) => {
  const classes = useStyles();

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <img className={classes.tutorialImg} src={tutorialImg} alt="" />
    </Modal>
  );
};
