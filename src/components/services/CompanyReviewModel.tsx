import { useState, useRef } from 'react';
import { Star } from 'lucide-react';
import { createCompanyReview } from '../../api/apiMethods';

interface ReviewModalProps {
  // showReviewModal: boolean;
  // setShowReviewModal: (show: boolean) => void;
  user: AuthenticatedUser | null;
  selectedRating: number;
  comment: string;
  setSelectedRating: (val: number) => void;
  setComment: (val: string) => void;
  setShowReviewModal: (val: boolean) => void;

}

interface ReviewData {
  [key: string]: string | number; 
  role: string;
  rating: number;
  comment: string;
}

// interface ReviewData {
//   userId?: string;
//   technicianId?: string;
//   role: 'user' | 'technician';
//   rating: number;
//   comment: string;
// }

interface AuthenticatedUser {
  id: string;
  role: 'user' | 'technician';
  name?: string;
}

const CompanyReviewModal: React.FC<ReviewModalProps> = ({ showReviewModal, setShowReviewModal }) => {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const reviewModalRef = useRef<HTMLDivElement>(null);

  const user: User | null = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user') as string)
    : null;

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowReviewModal(false);
      setSelectedRating(0); 
      setComment(''); 
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || !user.id || !user.role) {
      alert('User information is missing. Please log in.');
      return;
    }

    const reviewData: ReviewData = {
      [user.role === 'user' ? 'userId' : 'technicianId']: user.id,
      role: user.role,
      rating: selectedRating,
      comment: comment,
    };

    console.log(reviewData);

    try {
      const response = await createCompanyReview(reviewData);
      if (response) {
        console.log('Review submitted successfully!');
        setShowReviewModal(false); 
        setSelectedRating(0); 
        setComment('');
      } else {
        console.error('Failed to submit review:', response.statusText);
        alert('Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('An error occurred. Please try again later.');
    }
  };

//   const handleReviewSubmit = async (
//   e: React.FormEvent<HTMLFormElement>,
//   {
//     user,
//     selectedRating,
//     comment,
//     setSelectedRating,
//     setComment,
//     setShowReviewModal,
//   }: ReviewModalProps
// ) => {
//   e.preventDefault();

//   if (!user?.id || !user.role) {
//     alert('User information is missing. Please log in.');
//     return;
//   }

//   if (!selectedRating || !comment.trim()) {
//     alert('Please provide both a rating and a comment.');
//     return;
//   }

//   const reviewData: ReviewData = {
//     role: user.role,
//     rating: selectedRating,
//     comment: comment.trim(),
//     ...(user.role === 'user' ? { userId: user.id } : { technicianId: user.id }),
//   };

//   try {
//     const response = await createCompanyReview(reviewData);

//     if (response?.status === 201 || response?.status === 200) {
//       console.log('Review submitted successfully!');
//       alert('Thank you for your review!');
//       // Step 5: Reset state
//       setSelectedRating(0);
//       setComment('');
//       setShowReviewModal(false);
//     } else {
//       console.error('Review submission failed:', response);
//       alert(response?.data?.errors?.[0] || 'Failed to submit review. Try again.');
//     }
//   } catch (err: any) {
//     console.error('Error submitting review:', err);
//     const errorMessage = err?.response?.data?.errors?.[0] || 'An unexpected error occurred.';
//     alert(errorMessage);
//   }
// };

  if (!showReviewModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center"
      onClick={handleBackgroundClick}
      onTouchStart={handleBackgroundClick}
    >
      <div
        ref={reviewModalRef}
        className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fade-in"
      >
        <h2 className="text-lg font-medium mb-4 text-gray-700 text-center">💥 Boom! Review Time!</h2>
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
          />
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyReviewModal;

// import { useState, useRef } from 'react';
// import { Star } from 'lucide-react'; // Assuming lucide-react for Star icon

// // Define props interface
// interface ReviewModalProps {
//   showReviewModal: boolean;
//   setShowReviewModal: (show: boolean) => void;
// }

// // Define user interface for localStorage user object
// interface User {
//   id: string;
//   role: 'user' | 'technician';
//   username: string;
// }

// // Define review data interface
// interface ReviewData {
//   [key: string]: string | number; // Allow dynamic key (userID or technicianID)
//   role: string;
//   rating: number;
//   comment: string;
// }

// const CompanyReviewModal: React.FC<ReviewModalProps> = ({ showReviewModal, setShowReviewModal }) => {
//   const [selectedRating, setSelectedRating] = useState<number>(0);
//   const [comment, setComment] = useState<string>('');
//   const reviewModalRef = useRef<HTMLDivElement>(null);

//   // Parse user from localStorage
//   const user: User | null = localStorage.getItem('user')
//     ? JSON.parse(localStorage.getItem('user') as string)
//     : null;

//   const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!user || !user.id || !user.role) {
//       alert('User information is missing. Please log in.');
//       return;
//     }

//     const reviewData: ReviewData = {
//       [user.role === 'user' ? 'userID' : 'technicianID']: user.id,
//       role: user.role,
//       rating: selectedRating,
//       comment: comment,
//     };

//     console.log(reviewData)

//     try {
//       const response = await fetch('http://localhost:5000/api/companyReview/createReview', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(reviewData),
//       });

//       if (response.ok) {
//         console.log('Review submitted successfully!');
//         setShowReviewModal(false); // Close modal on success
//         setSelectedRating(0); // Reset rating
//         setComment(''); // Reset comment
//       } else {
//         console.error('Failed to submit review:', response.statusText);
//         alert('Failed to submit review. Please try again.');
//       }
//     } catch (error) {
//       console.error('Error submitting review:', error);
//       alert('An error occurred. Please try again later.');
//     }
//   };

//   if (!showReviewModal) return null;

//   return (
//     <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
//       <div
//         ref={reviewModalRef}
//         className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fade-in"
//       >
//         <h2 className="text-lg font-medium mb-4 text-gray-700 text-center">💥 Boom! Review Time!</h2>
//         <form onSubmit={handleReviewSubmit} className="flex flex-col">
//           <p className="text-sm font-medium mb-2 text-gray-700">Name</p>
//           <input
//             type="text"
//             className="p-2 border border-gray-300 rounded-lg mb-4"
//             value={user?.username || 'Anonymous'}
//             readOnly
//           />
//           <p className="text-sm font-medium mb-2 text-gray-700">Rating</p>
//           <div className="flex justify-center space-x-2 mb-8">
//             {[1, 2, 3, 4, 5].map((star) => (
//               <Star
//                 key={star}
//                 className={`w-12 h-12 cursor-pointer transition-colors ${
//                   star <= selectedRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
//                 }`}
//                 onClick={() => setSelectedRating(star)}
//               />
//             ))}
//           </div>
//           <p className="text-sm font-medium mb-2 text-gray-700">Comment</p>
//           <textarea
//             className="w-full p-2 border border-gray-300 rounded-lg mb-4"
//             rows={4}
//             placeholder="Write your review here..."
//             value={comment}
//             onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
//             required
//           />
//           <div className="flex justify-end space-x-2">
//             <button
//               type="submit"
//               className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
//             >
//               Submit
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CompanyReviewModal;