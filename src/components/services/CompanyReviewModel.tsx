import { useState, useRef } from 'react';
import { Star } from 'lucide-react';
import { createCompanyReview } from '../../api/apiMethods';

interface ReviewModalProps {
  showReviewModal: boolean;
  setShowReviewModal: (show: boolean) => void;
}

interface AuthenticatedUser {
  id: string;
  role: 'user' | 'technician';
  username?: string;
}

interface ReviewData {
  [key: string]: string | number;
  role: string;
  rating: number;
  comment: string;
}

const CompanyReviewModal: React.FC<ReviewModalProps> = ({ showReviewModal, setShowReviewModal }) => {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const reviewModalRef = useRef<HTMLDivElement>(null);

  const user: AuthenticatedUser | null = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user') as string)
    : null;

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowReviewModal(false);
      setSelectedRating(0);
      setComment('');
    }
  };

  const validateInputs = (): string | null => {
    if (!selectedRating) {
      return 'Please select a rating (1-5 stars).';
    }
    if (!comment.trim()) {
      return 'Please provide a comment.';
    }
    if (comment.length > 500) {
      return 'Comment cannot exceed 500 characters.';
    }
    return null;
  };

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!user || !user.id || user.role !== 'franchise') {
      setError('You must be logged in as a franchise user to submit a review.');
      setLoading(false);
      return;
    }

    const inputError = validateInputs();
    if (inputError) {
      setError(inputError);
      setLoading(false);
      return;
    }

    const reviewData: ReviewData = {
      franchiseId: user.id,
      role: 'franchise',
      rating: selectedRating,
      comment: comment.trim(),
    };

    try {
      const response = await createCompanyReview(reviewData);
      if (response) {
        alert('Thank you for your review!');
        setShowReviewModal(false);
        setSelectedRating(0);
        setComment('');
      } else {
        alert('Failed to submit review. Please try again.');
      }
    } catch (error) {
      alert('Something went wrong while submitting the review.');
      console.error('Review submission error:', error);
    }
  };

  if (!showReviewModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackgroundClick}
      onTouchStart={handleBackgroundClick}
    >
      <div
        ref={reviewModalRef}
        className="bg-white p-6 rounded-lg shadow-lg w-96 border border-gray-200 animate-fade-in"
      >
        <h2 className="text-lg font-medium mb-4 text-gray-700 text-center">💥 Franchise Review</h2>
        {error && (
          <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded mb-4">{error}</p>
        )}
        <form onSubmit={handleReviewSubmit} className="flex flex-col">
          <p className="text-sm font-medium mb-2 text-gray-700">Name</p>
          <input
            type="text"
            className="p-2 border border-gray-300 rounded-lg mb-4"
            value={user?.username || 'Anonymous'}
            readOnly
          />

          <p className="text-sm font-medium mb-2 text-gray-700">Rating</p>
          <div className="flex justify-center space-x-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-12 h-12 cursor-pointer transition-colors ${
                  star <= selectedRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
                onClick={() => setSelectedRating(star)}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              />
            ))}
          </div>

          <p className="text-sm font-medium mb-2 text-gray-700">Comment</p>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg mb-4"
            rows={4}
            placeholder="Write your review here..."
            value={comment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
            required
            maxLength={500}
          />

          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyReviewModal;
