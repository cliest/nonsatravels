import React from "react";
import PropTypes from "prop-types";

const Title = ({ title, subTitle, align, font }) => {
  return (
    <div
      className={`flex flex-col justify-center items-center text-center mt-20 ${
        align === "left" ? "md:items-start md:text-left" : ""
      }`}
    >
      <h1
        className={`font-bold text-4xl md:text-[40px] text-primary ${
          font || "font-montserrat"
        }`}
      >
        {title}
      </h1>
      <p className="text-sm md:text-base text-black mt-2 max-w-174">
        {subTitle}
      </p>
    </div>
  );
};

Title.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string,
  align: PropTypes.oneOf(["left", "center"]),
  font: PropTypes.string,
};

Title.defaultProps = {
  subTitle: "",
  align: "center",
  font: "font-montserrat",
};

export default Title;
