import { AuthContext } from "../../../contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import { TutorialModal } from "../../../components/TutorialModal";

export const Tutorial: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const auth = useContext(AuthContext);
  useEffect(() => {
    setIsOpen(auth.isFirstLogin);
  }, []);

  const onClose = (): void => {
    setIsOpen(false);
  };

  return (
    <>
      {auth.isFirstLogin ? (
        <TutorialModal open={isOpen} onClose={onClose} />
      ) : (
        <></>
      )}
    </>
  );
};
