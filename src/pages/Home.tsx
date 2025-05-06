import React from 'react';
import { Link } from 'react-router-dom';
import { getAllTools, getAllCategories, getToolsByCategory, ToolCategory } from '../tools';

const Home: React.FC = () => {
  const categories = getAllCategories();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Developer Tool Hub | MyDebugger</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Platform for debugging, encoding, decoding & demonstrating your technical work
        </p>
      </div>
      
      {categories.map((category) => (
        <CategorySection key={category} category={category} />
      ))}
    </div>
  );
};

interface CategorySectionProps {
  category: ToolCategory;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category }) => {
  const tools = getToolsByCategory(category);
  
  return (
    <section className="mb-12">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold">{category}</h2>
        <div className="ml-4 h-px bg-gray-300 flex-grow"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link 
            key={tool.route} 
            to={tool.route}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border border-gray-200"
          >
            <h3 className="text-xl font-semibold mb-2">{tool.title}</h3>
            <p className="text-gray-600 mb-4">{tool.description}</p>
            <div className="text-blue-500 font-medium">
              Try now →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Home;