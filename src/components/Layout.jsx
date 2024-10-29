// src/components/Layout.jsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, showHeaderFooter }) => {
  return (
    <div>
      {showHeaderFooter && <Header />}
      <main>{children}</main>
      {showHeaderFooter && <Footer />}
    </div>
  );
};

export default Layout;
