import React from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Organ Transplant System' }) => {
  return (
    <nav className="bg-white bg-opacity-70 backdrop-blur-lg shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-semibold text-apple-dark">{title}</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-apple-blue hover:text-apple-blue/80">Dashboard</Link>
            <Link to="/donors" className="text-apple-dark hover:text-apple-blue">Donors</Link>
            <Link to="/recipients" className="text-apple-dark hover:text-apple-blue">Recipients</Link>
            <Link to="/matching" className="text-apple-dark hover:text-apple-blue">Matching</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;