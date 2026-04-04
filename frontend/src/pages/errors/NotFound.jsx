import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        {/* Large 404 text */}
        <h1 className="text-9xl font-bold text-indigo-200">404</h1>

        <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
          Page Not Found
        </h2>

        <p className="text-gray-500 mb-8 max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>

        {/* Link component creates a clickable link that uses React Router */}
        {/* Unlike <a href="/">, Link doesn't reload the page */}
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;