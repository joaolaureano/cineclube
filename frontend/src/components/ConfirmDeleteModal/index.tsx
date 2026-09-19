import React from "react";
import { CustomModal } from "../CustomModal/";
import useStyles from "./styles";
import { IconButton } from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";

interface ModalProps {
  open: boolean;
  confirm: () => void;
  deny: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ModalProps> = (props: ModalProps) => {
  const classes = useStyles();

  return (
    <CustomModal open={props.open} onClose={props.onClose}>
      <div className={classes.modalParent}>
        <Typography variant="h5" color="textPrimary">
          Você quer mesmo remover da lista ?
        </Typography>

        <div className={classes.buttons}>
          <IconButton
            onClick={props.confirm}
            aria-label="remove"
            color="primary"
          >
            <CheckIcon fontSize="large" className={classes.buttonIcon} />
          </IconButton>
          <IconButton onClick={props.deny} aria-label="cancel" color="primary">
            <CloseIcon fontSize="large" className={classes.buttonIcon} />
          </IconButton>
        </div>
      </div>
    </CustomModal>
  );
};
