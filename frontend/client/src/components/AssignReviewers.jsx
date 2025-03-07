
import { React, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import { getLastFriday, dateFormatters } from '../utils/dateUtils';

function AssignReviewers({ session }) {
  // Define constants
  const { user } = session; 
   
  const secsInDay = 86400000; 
  
  // Define hooks 
  const [loading, setLoading] = useState(false); 
    
  // DEFINE FUNCTIONS 
  // KEY FUNCTION

  // Function to submit a release to the database for the week
  async function assignReviewer(event) {
    
    setLoading(true); 

    const last_friday = getLastFriday() 
    // Get Submissions 
    let { data, error } = await supabase
      .from('release_submissions')
      .select(`release_id`)
      .eq('release_week', dateFormatters.toISOString(last_friday))
      .order('release_id')

    // Randomly assign a release to user
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
    let { eassign } = await supabase
      .from('release_assignments')
      .insert(assignment);
    if (eassign) {
      console.warn(eassign)
    } else {
      alert("You've been assigned! Reloading to show your submission."); 
      window.location.reload()
    } 
         
    setLoading(false);
  }

  // RETURN FORM
  return (
        <button
          onClick={assignReviewer}  
          className="button block primary"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Assign Me!'}
        </button> )
}

export default AssignReviewers;