import React from "react";

const HeroBackground = ({ imageUrl, overlay = "dark" }) => {
  return (
    <div className="absolute inset-0">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      />

      {/* Overlay */}
      {overlay === "dark" && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      )}

      {overlay === "light" && (
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />
      )}
    </div>
  );
};

export default HeroBackground;
