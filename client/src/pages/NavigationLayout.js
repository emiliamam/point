import React from "react";
import Navigation from "./Navigation";
import "../styles/NavigationLayout.css";

const NavigationLayout = ({ children }) => {
  return (
    <div className="layout">
      <Navigation />
      <div className="content">{children}</div>
    </div>
  );
};

export default NavigationLayout;
