import React from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../tools';

const Header: React.FC = () => {
  const categories = getAllCategories();
  
  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold hover:text-blue-400 transition">
            MyDebugger
          </Link>
          
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {categories.map((category) => (
                <li key={category}>
                  <Link 
                    to={`/category/${category.toLowerCase()}`}
                    className="hover:text-blue-400 transition"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="md:hidden">
            {/* Mobile menu button would go here - simplified for now */}
            <button className="text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;