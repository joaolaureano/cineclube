import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import { HomeWrapper } from "./pages/HomeWrapper/HomeWrapper";
import { MovieLists } from "./pages/MovieLists";
import Login from "./pages/Login";
import Filter from "./pages/Filter";
import { LoginSignupPreferences } from "./pages/Login/SignupPreferences/SignupPreferences";
import { AchievementList } from "./pages/AchievementList";
import Profile from "./pages/Profile";
import Credits from "./pages/Credits";

const Router = (): JSX.Element => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Login} />
        <Route path="/credits" exact component={Credits} />
        <ProtectedRoute path="/home" exact component={HomeWrapper} />
        <ProtectedRoute path="/filter" exact component={Filter} />
        <ProtectedRoute path="/user/profile" exact component={Profile} />
        <ProtectedRoute
          path="/user/movies/:list"
          exact
          component={MovieLists}
        />
        <ProtectedRoute
          path="/signupPreferences"
          exact
          component={LoginSignupPreferences}
        />
        <ProtectedRoute
          path="/user/achievements"
          exact
          component={AchievementList}
        />
      </Switch>
    </BrowserRouter>
  );
};

export default Router;
