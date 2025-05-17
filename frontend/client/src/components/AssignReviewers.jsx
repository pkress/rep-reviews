import { React, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import { getLastFriday, dateFormatters } from '../utils/dateUtils';

function AssignReviewers({ session }) {
  // Define constants
  const { user } = session; 
  
  // Define hooks 
  const [loading, setLoading] = useState(false);
  const [noSubmissions, setNoSubmissions] = useState(false); 
    
  // Check if there are submissions to assign
  useEffect(() => {
    const checkSubmissions = async () => {
      const last_friday = getLastFriday();
      const { data, error } = await supabase
        .from('release_submissions')
        .select('release_id')
        .eq('release_week', dateFormatters.toISOString(last_friday))
        .order('release_id');
      
      if (error) {
        console.error('Error checking submissions:', error);
        setNoSubmissions(true);
        return;
      }
      
      setNoSubmissions(!data || data.length === 0);
    };
    
    checkSubmissions();
  }, []);

  // Function to submit a release to the database for the week
  async function assignReviewer(event) {
    setLoading(true); 

    try {
      const last_friday = getLastFriday();
      // Get Submissions 
      let { data, error } = await supabase
        .from('release_submissions')
        .select(`release_id`)
        .eq('release_week', dateFormatters.toISOString(last_friday))
        .order('release_id');

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        setNoSubmissions(true);
        throw new Error('No submissions available for this week');
      }

      // Randomly assign a release to user
      // set seed to current time
      const seed = new Date().getTime();
      // Randomly select a release from the list
      const rand = Math.floor(Math.random() * data.length); 
      const assigned_release = data[rand]['release_id'];  
       
      // Submit that assignment 
      const assignment = {
        user_id: user.id,
        created_at: new Date(),
        release_id: assigned_release, 
        release_week: last_friday
      };

      // Submit submission
      let { error: eassign } = await supabase
        .from('release_assignments')
        .insert(assignment);

      if (eassign) {
        throw eassign;
      } else {
        alert("You've been assigned! Reloading to show your submission."); 
        window.location.reload();
      } 
    } catch (error) {
      console.error('Error assigning reviewer:', error);
      alert(error.message || 'There was an error assigning you a review. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  // RETURN FORM
  return (
    <div>
      {noSubmissions ? (
        <div className="text-center p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-300 mb-4">
            There are no album submissions available for this week. Check back later or be the first to submit an album!
          </p>
          <a 
            href="/dashboard" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Go to Dashboard
          </a>
        </div>
      ) : (
        <button
          onClick={assignReviewer}  
          className="button block primary"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Assign Me!'}
        </button>
      )}
    </div>
  );
}

export default AssignReviewers;