import React from "react";
import "./Card.css";
import { useNavigate } from "react-router";
const Card = (props) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (props.title !== "Sorting Excel") {
      navigate("/excel-naming", { state: { title: props.title } });
    } else {
      navigate("/excel-sorting", { state: { title: props.title } });
    }
  };

  return (
    /* From Uiverse.io by eslam-hany */
    <div
      className="custom-card"
      data-description={props.description}
      onClick={handleClick}
    >
      {props.title}
    </div>
  );
};

export default Card;
