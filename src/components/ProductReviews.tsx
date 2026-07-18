"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/authContext";
import { FaStar } from "react-icons/fa";

interface Review {
  id: number;
  product_id: number;
  user_id: number;
  username: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
}

interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  distribution: Record<number, number>;
}

export default function ProductReviews({ productId }: { productId: number }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchReviews = () => { // eslint-disable-line react-hooks/exhaustive-deps
    setLoading(true);
    Promise.all([
      api.get<Review[]>(`/reviews/product/${productId}`),
      api.get<ReviewStats>(`/reviews/product/${productId}/stats`),
    ])
      .then(([reviewsData, statsData]) => {
        setReviews(reviewsData);
        setStats(statsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, [productId, fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post<Review>("/reviews", {
        product_id: productId,
        rating: formRating,
        title: formTitle || undefined,
        comment: formComment || undefined,
      });
      setShowForm(false);
      setFormTitle("");
      setFormComment("");
      fetchReviews();
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex text-yellow-400 text-sm">
      {[...Array(5)].map((_, i) => (
        <FaStar key={i} className={i < rating ? "text-yellow-400" : "text-gray-200"} />
      ))}
    </div>
  );

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-8">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {/* Stats Summary */}
      {stats && stats.total_reviews > 0 && (
        <div className="flex items-center gap-4 mb-6 bg-gray-50 rounded-xl p-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.average_rating}</div>
            {renderStars(Math.round(stats.average_rating))}
            <div className="text-sm text-gray-500">{stats.total_reviews} reviews</div>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3">{star}</span>
                <FaStar className="text-yellow-400 text-xs" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${stats.total_reviews ? ((stats.distribution[star] || 0) / stats.total_reviews) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-gray-400 text-xs">{stats.distribution[star] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Review Button */}
      {user && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 mb-6"
        >
          Write a Review
        </button>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
          <h3 className="font-semibold">Write Your Review</h3>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label className="text-sm text-gray-600 block mb-1">Rating</label>
            <div className="flex gap-1 text-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setFormRating(star)}>
                  <FaStar className={star <= formRating ? "text-yellow-400" : "text-gray-300"} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Title (optional)</label>
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-sm"
              placeholder="Great product!"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Review (optional)</label>
            <textarea
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-sm h-24"
              placeholder="Share your experience..."
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-black"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No reviews yet. Be the first one!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                    {review.username[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium text-sm">{review.username}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {renderStars(review.rating)}
              {review.title && <p className="font-semibold mt-1">{review.title}</p>}
              {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
