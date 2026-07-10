import React from "react";
import { motion } from "framer-motion";

const Card = ({
  children,
  className = "",
  hover = false,
  padding = "p-6",
  shadow = "md",
  ...props
}) => {
  const shadowClasses = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    none: "",
  };

  return (
    <motion.div
      className={`
        bg-white rounded-xl
        ${shadowClasses[shadow]}
        ${padding}
        ${hover ? "hover:shadow-xl transition-shadow duration-200" : ""}
        ${className}
      `}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
