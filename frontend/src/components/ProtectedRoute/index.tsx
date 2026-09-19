import React, { useContext } from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";

import { AuthContext } from "../../contexts/AuthContext";
import { Spinner } from "../Spinner";

const ProtectedRoute: React.FC<RouteProps> = (props) => {
  const auth = useContext(AuthContext);
  if (auth.isLoadingUser) return <Spinner />;
  if (auth.authUser === null) return <Redirect to="/" exact />;
  return <Route {...props} />;
};

export default ProtectedRoute;
