
import { React, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';


function ReleaseSubmissionForm({ session }) {
  const { user } = session; 
  const [loading, setLoading] = useState(true);
  const [release, setRelease] = useState("");
  const [submissionCount, setSubmissionCount] = useState(0);
  const [spUrl, setSpUrl] = useState("");

// Function to get bounds for submissions for this round
function getLastFriday() {
  var d = new Date(),
      day = d.getDay(),
      diff = (day <= 5) ? (7 - 5 + day ) : (day - 5);

  d.setDate(d.getDate() - diff);
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);

  return d.getTime();
}
const last_friday = getLastFriday();
const last_last_friday = last_friday - 604800000;
  // console.log(last_friday.toString() + "-" + last_last_friday.toString());

  useEffect(() => {
    async function getSubmissionCount() {
      setLoading(true);
     
      // Pull submissions for this user for this round
      let { data, error } = await supabase
        .from('ReleaseSubmissions')
        .select(`created_at`)
        .eq('user_id', user.id)
        .geq('created_at', last_friday);

      // Set submission count
      if (error) {
        console.warn(error);
      } else if (data) {
        setSubmissionCount(data.length);
      }

      setLoading(false);
    }

    getSubmissionCount();
  }, [user]);

  async function submitRelease(event) {
    event.preventDefault();
    setLoading(true); 


    // Function to get release date from Spotify URL
    function getReleaseDate(url) {
    }

    // Check if release date is valid (between last last friday and most recent friday)
    function isValidReleaseDate(date) {
      return date > last_last_friday && date <= last_friday;
    }

    if (isValidReleaseDate(getReleaseDate(spUrl))) {
      const insert_values = {
        user_id: user.id,
        sp_url: spUrl
      };  
      
      let { error } = await supabase
        .from('profiles')
        .insert(insert_values);
      
      if (error) {
        alert(error.message);
      }
    } else {
      alert("Invalid release date. Please check your Spotify URL and try again.");
    }   

    setLoading(false);
  }

  return (
    <form onSubmit={submitRelease} className="form-widget">
      <div>
        <label htmlFor="spUrl">Spotify URL</label>
        <input 
        id="spUrl" 
        type="text"
        required
        value={spUrl || ''}
        onChange={(e) => setSpUrl(e.target.value)}
        />
      </div>

      <div>
        <button
          className="button block primary"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

    </form>
  );
}

export default ReleaseSubmissionForm;