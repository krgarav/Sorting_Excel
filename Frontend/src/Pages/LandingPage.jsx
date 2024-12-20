import React from "react";
import classes from "./LandingPage.module.css";
import Card from "../Component/Card/Card";

const LandingPage = () => {
  return (
    <div className={classes.wrapper}>
      <div className={classes.container}>
        <div>
          <Card
            title="Sorting Excel"
            description="Generate Excel file for printing"
          />
        </div>
        <div>
          <Card
            title="Naming Excel"
            description="Generate Excel/Pdf file with status"
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
