import React from "react";
import Navigation from "./Navigation";
import "../styles/NavigationLayout.css";
import "../styles/TestPage.css";
import "../styles/Navigation.css";

const NavigationLayout = ({ children }) => {
  return (
    <div className="layout">
      <Navigation />
      <div className="content">{children}</div>
    </div>
  );
};

export default NavigationLayout;
