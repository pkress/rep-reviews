
import { React, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 

function AssignReviewers({ session }) {
  // Define constants
  const { user } = session; 
   
  const secsInDay = 86400000; 
  
  // Define hooks 
  const [loading, setLoading] = useState(false); 
    
  // DEFINE FUNCTIONS
  // Function to get week of releases
  function getLastFriday() {
    const d = new Date(); 
    const dayOfWeek = d.getDay();   
    const diff = (dayOfWeek < 5) ? (7 - 5 + dayOfWeek ) : (dayOfWeek - 5);

    var friday = d; 
    friday.setDate(friday.getDate()-diff);   
 
    return friday.toDateString();
  } 

  // GET KEY VALUES  

  // KEY FUNCTION

  // Function to submit a release to the database for the week
  async function assignReviewer(event) {
    
    setLoading(true); 

    const last_friday = getLastFriday()
    console.log("week: "+last_friday)
    // Get Submissions 
    let { data, error } = await supabase
      .from('release_submissions')
      .select(`release_id`)
      .eq('release_week', new Date(Date.parse(last_friday)).toISOString())
      .order('release_id')

    // Randomly assign a release to user
    const rand = Math.floor(Math.random() * data.length); 
    const assigned_release = data[rand]['release_id']; 
    console.log("random assignment: release "+rand+" -- "+assigned_release)
     
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