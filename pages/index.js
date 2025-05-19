import React from 'react';
import { useRouter } from 'next/router';
import { getTools, getAllCategories, categories as toolCategories } from '../src/tools'; // Adjusted import path
import ToolCard from '../src/components/landing/ToolCard'; // Adjusted import path
import Head from 'next/head';

// Helper to get a consistent icon for a category
const getCategoryIcon = (categoryName) => {
  const categoryDetails = toolCategories[categoryName];
  return categoryDetails ? categoryDetails.icon : null;
};

export default function HomePage() {
  const router = useRouter();
  const allTools = getTools();

  return (
    <>
      <Head>
        <title>MyDebugger - Ultimate Debugging & Developer Toolkit</title>
        <meta
          name="description"
          content="Explore a comprehensive suite of debugging and developer tools. Base64, encoders, decoders, formatters, and more. WE CAN DO IT!"
        />
        <meta name="keywords" content="developer tools, debugging, encoder, decoder, formatter, base64, json, online tools, web development, security, testing" />
        <meta property="og:title" content="MyDebugger - Ultimate Debugging & Developer Toolkit" />
        <meta property="og:description" content="Showcasing a wide array of powerful tools for developers. Your go-to platform for technical solutions." />
        <meta property="og:type" content="website" />
        {/* Add og:image and other relevant Open Graph tags */}
      </Head>
      <div className="container mx-auto px-4 py-8">
        <section className="text-center py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            The Ultimate Developer & Debugging Toolkit
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
            Powerful, reliable, and easy-to-use tools designed to streamline your workflow. <br />
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">If you can think it, WE CAN DO IT.</span>
          </p>
        </section>

        <section className="py-8">
          <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6">All Tools</h2>
          {allTools.length > 0 ? (
            <div className="tool-cards-container"> {/* Existing class for grid layout */}
              {allTools.map((tool) => (
                <ToolCard key={tool.id || tool.title} tool={tool} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No tools available at the moment. Check back soon!</p>
          )}
        </section>
      </div>
    </>
  );
}
