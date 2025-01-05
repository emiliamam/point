import React from "react";
import "../styles/CustomButton.css";

const CustomButton = ({ children, onClick }) => {
  return (
    <button className="custom-button" onClick={onClick}>
      {children}
    </button>
  );
};

export default CustomButton;
