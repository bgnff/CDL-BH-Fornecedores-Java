import React from "react";
import styles from "./bubble.module.css";

export const BubbleText = ({ text = "Fundação CDL-BH", className = "" }) => {
  return (
    <h2
      className={`text-center text-2xl sm:text-3xl font-light text-primary/85 dark:text-blue-300 tracking-tight select-none transition-colors ${className}`}
    >
      {text.split("").map((child, idx) => {
        if (child === " ") {
          return (
            <span key={idx} className="inline-block w-2 sm:w-2.5">
              &nbsp;
            </span>
          );
        }
        return (
          <span className={styles.hoverText} key={idx}>
            {child}
          </span>
        );
      })}
    </h2>
  );
};

export default BubbleText;
