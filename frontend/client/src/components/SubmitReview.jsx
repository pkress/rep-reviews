import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getLastFriday, dateFormatters } from '../utils/dateUtils';

const SubmitReview = ({ session }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [formData, setFormData] = useState({
    score: '',
    recommend: null,
    reviewText: ''
  });
  
  // Unique key for this user's current assignment
  const [storageKey, setStorageKey] = useState(null);
  
  useEffect(() => {
    if (session) {
      fetchAssignment();
    }
  }, [session]);

  // Load saved form data from localStorage when assignment is loaded
  useEffect(() => {
    if (assignment && assignment.release_id) {
      // Create a unique key for this user's current assignment
      const key = `review_draft_${session.user.id}_${assignment.release_id}`;
      setStorageKey(key);
      
      // Try to load saved form data
      const savedData = localStorage.getItem(key);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(parsedData);
        } catch (e) {
          console.error('Error parsing saved review data', e);
        }
      }
    }
  }, [assignment, session]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (storageKey && formData) {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    }
  }, [formData, storageKey]);


  const fetchAssignment = async () => {
    if (!session) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get last Friday's date
      const lastFriday = getLastFriday();
      const lastFridayISO = dateFormatters.toFullISOString(lastFriday);
      
      // Fetch assignment and release info
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('release_assignments')
        .select(`
          assignment_id,
          release_id,
          releases (
            release_id,
            release_name,
            release_artist_names,
            release_cover_url
          )
        `)
        .eq('release_week', lastFridayISO)
        .eq('user_id', session.user.id);

      if (assignmentError) throw assignmentError;
      
      // Handle case where no assignment exists
      if (!assignmentData || assignmentData.length === 0) {
        setAssignment(null);
        setError('No assignment found for this week.');
        return;
      }
      
      setAssignment(assignmentData[0]);
      
    } catch (error) {
      console.error('Error fetching assignment:', error);
      setError('Failed to load your assignment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.recommend === null) {
      alert('Please select whether you recommend this release');
      return;
    }
    
    if (formData.score < 0 || formData.score > 10) {
      alert('Score must be between 0 and 10');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Create review
      const review = {
        created_at: new Date(),
        release_id: assignment.release_id,
        assignment_id: assignment.assignment_id,
        user_id: session.user.id,
        is_recommended: formData.recommend,
        review_text: formData.reviewText,
        review_score: parseInt(formData.score)
      };

      const { error: reviewError } = await supabase
        .from('reviews')
        .insert(review);
      if (reviewError) throw reviewError;

      // Update assignment as completed
      const { error: updateError } = await supabase
        .from('release_assignments')
        .update({
          is_completed: true,
          completed_at: new Date()
        })
        .eq('assignment_id', assignment.assignment_id);
      
      if (updateError) throw updateError;
      
      // On successful submission, clear the saved draft
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }

      alert('Review submitted successfully!');
      window.location.reload();
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p>Loading assignment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative mb-6">
        <p className="font-semibold mb-2">Error</p>
        <p>{error}</p>
        {error.includes('No assignment') && (
          <div className="mt-4">
            <Link 
              to="/dashboard" 
              className="text-red-100 underline"
              onClick={() => window.location.reload()}
            >
              Refresh Dashboard
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-300 mb-4">No assignment found for this week.</p>
        <Link 
          to="/dashboard" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          onClick={() => window.location.reload()}
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { releases } = assignment;

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6">
      <div className="flex items-start gap-6 mb-6">
        <img
          src={releases.release_cover_url}
          alt={`${releases.release_name} cover`}
          className="w-40 h-40 object-cover rounded-lg"
        />
        <div>
          <h2 className="text-xl font-bold mb-2">{releases.release_name}</h2>
          <p className="text-gray-300 mb-4">{releases.release_artist_names}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center gap-4 cursor-pointer">
            <span className="text-gray-300">Would you recommend this release?</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="recommend"
                  checked={formData.recommend === true}
                  onChange={() => setFormData(prev => ({ ...prev, recommend: true }))}
                  className="w-4 h-4"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="recommend"
                  checked={formData.recommend === false}
                  onChange={() => setFormData(prev => ({ ...prev, recommend: false }))}
                  className="w-4 h-4"
                />
                <span>No</span>
              </label>
            </div>
          </label>
        </div>

        <div>
          <label className="block mb-2">
            Score (0-10):
            <input
              type="number"
              min="0"
              max="10"
              value={formData.score}
              onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
              className="w-full mt-1 p-2 rounded bg-gray-700"
              required
            />
          </label>
        </div>

        <div>
          <label className="block mb-2">
            Review:
            <textarea
              value={formData.reviewText}
              onChange={(e) => setFormData(prev => ({ ...prev, reviewText: e.target.value }))}
              className="w-full mt-1 p-2 rounded bg-gray-700 h-32"
              placeholder="Write your review here..."
              maxLength={3600}
              required
            />
            <span className="text-sm text-gray-400">
              {formData.reviewText?.length || 0}/3600 characters
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || formData.recommend === null}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default SubmitReview;