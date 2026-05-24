import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';

export default function NotFoundPage() {
  return (
    <PageContainer>
      <div className="text-center py-16">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-md"
        >
          Go Back Home
        </Link>
      </div>
    </PageContainer>
  );
}
