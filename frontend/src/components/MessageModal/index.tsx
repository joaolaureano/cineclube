import React from "react";
import { CustomModal } from "../CustomModal/";
import useStyles from "./styles";
import Typography from "@material-ui/core/Typography";
import { PlatformIcon } from "../PlatformIcon";
import { RecommendedMovieMessage } from "../../types/movie";

interface ModalProps {
  open: boolean;
  movie: RecommendedMovieMessage;
  onClose: () => void;
}

export const MessageModal: React.FC<ModalProps> = (props: ModalProps) => {
  const classes = useStyles();

  return (
    <CustomModal open={props.open} onClose={props.onClose}>
      <div className={classes.modal}>
        <div className={classes.texts}>
          <Typography variant="h6" color="textPrimary" className={classes.typo}>
            Você já tem <span>{props.movie.size_list}</span> filmes na lista
            "Quero Assistir".
          </Typography>
          <Typography variant="h6" color="textPrimary" className={classes.typo}>
            Que tal ver <span>"{props.movie.title}"</span>?
          </Typography>
          <div className={classes.platforms}>
            <Typography
              variant="h6"
              color="textPrimary"
              className={classes.typo}
            >
              Disponível em:
            </Typography>
            <div className={classes.platformIcons}>
              {props.movie.platform.map((platform, index) => {
                return <PlatformIcon platform={platform} key={index} />;
              })}
            </div>
          </div>
        </div>
        <div className={classes.button} onClick={props.onClose}>
          <Typography
            variant="body1"
            color="textPrimary"
            className={classes.typoButton}
          >
            Fechar
          </Typography>
        </div>
      </div>
    </CustomModal>
  );
};
