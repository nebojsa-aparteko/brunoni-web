import brunoniLogo from '../assets/logo.brunoni.svg';
import allmarineLogo from '../assets/logo.allmarine.png';
import React, { ImgHTMLAttributes } from 'react';

const LogoImage: React.FC<ImgHTMLAttributes<any>> = ({ ...props }) => {
  return (
    <img
      src={import.meta.env.VITE_BRAND === 'brunoni' ? brunoniLogo : allmarineLogo}
      alt=""
      {...props}
    />
  );
};

export default LogoImage;
