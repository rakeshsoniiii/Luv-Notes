import React from 'react';
import './HeartLogo.css';

const HeartLogo = ({ size = 'medium', animated = true, color = 'primary' }) => {
  const sizeClass = `heart-logo--${size}`;
  const colorClass = `heart-logo--${color}`;
  const animatedClass = animated ? 'heart-logo--animated' : '';

  return (
    <div className={`heart-logo ${sizeClass} ${colorClass} ${animatedClass}`}>
      <div className="heart-shape">
        <div className="heart-left"></div>
        <div className="heart-right"></div>
      </div>
    </div>
  );
};

export default HeartLogo;