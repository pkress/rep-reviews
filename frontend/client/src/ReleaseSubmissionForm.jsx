
import { React, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Buffer } from 'buffer';

function ReleaseSubmissionForm({ session }) {
  // Define constants
  const { user } = session; 
  const { spClientId } = "595ff6d980974507a79c38d8b9fac153";
  const { spClientSecret } = "01d94dbb161e4868ab1fa3cca4302f23";
  
  const { spApiAlbumBaseUrl } = "https://api.spotify.com/v1/albums/"; 
  const { spReleaseID } = "4aawyAB9vmqN3uQ7FjRGTy"
  
  // Define hooks
  const [spAccessToken, setSpAccessToken] = useState(null);
  const [spData, setSpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [release, setRelease] = useState("");
  const [submissionCount, setSubmissionCount] = useState(0);
  const [spUrl, setSpUrl] = useState("");
  const [spReleaseDate, setSpReleaseDate] = useState(0);
  
  // Retrieve Spotify bearer token
    
  // var authOptions = {
  //   url: 'https://accounts.spotify.com/api/token',
  //   headers: {
  //     'Authorization': 'Basic ' + (new Buffer.from(spClientId + ':' + spClientSecret).toString('base64'))
  //   },
  //   form: {
  //     grant_type: 'client_credentials'
  //   },
  //   json: true
  // };

  // request.post(authOptions, function(error, response, body) {
  //   if (!error && response.statusCode === 200) {
  //     var token = body.access_token;
  //   }
  // });

  // Function to get bounds for submissions for this round
  function getLastFriday() {
    var d = new Date(),
        day = d.getDay(),
        diff = (day <= 5) ? (7 - 5 + day ) : (day - 5);

    d.setDate(d.getDate() - diff);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);

    return d.toISOString();
  }

  // Get last Friday and the Friday before that
  const last_friday = getLastFriday(); 
  const last_last_friday = new Date(Date.parse(last_friday) - 604800000).toISOString(); 

  // Get submission count for this round
  useEffect(() => {
    async function getSubmissionCount() {
      setLoading(true);
     
      // Pull submissions for this user for this round
      let { data, error } = await supabase
        .from('ReleaseSubmissions')
        .select(`created_at`)
        .eq('user_id', user.id)
        .gte('created_at', last_friday);
       
      // Set submission count
      if (error) {
        console.warn(error);
      } else if (data) {
        setSubmissionCount(data.length);
        console.log(data.length)
      }
      setLoading(false);
    }
    getSubmissionCount();
  }, [user]);
  
  async function submitRelease(event) {
    
    event.preventDefault();
    setLoading(true); 

    function getAccessToken() {
      console.log('getting access token')

      // Get output from node backend 
      fetch("http://localhost:3001/api")
        .then((res) => {
          console.log(res)
          // res.json()
        })
        // .then((data) => setSpAccessToken(data.message));
 
      console.log('Sp access token: ' + spAccessToken)
    }

    // Function to get release date from Spotify URL
    function getReleaseDate() {
      // const params = new URLSearchParams();
      // params.append("client_id", spClientId);

      // const spApiRelaseUrl=spApiBaseUrl + '/albums/'+spReleaseID
      console.log('cow')

      let urlencoded = new URLSearchParams();
      urlencoded.append("grant_type", "client_credentials");

      let myHeaders = new Headers();
      myHeaders.append("Authorization", `Basic ${Buffer.from(spClientId+":"+spClientSecret).toString('base64')}`);
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
      console.log(`Basic ${Buffer.from(spClientId+":"+spClientSecret).toString('base64')}`)
      setSpData({'test': 'test'})
      // fetch('https://accounts.spotify.com/api/token', {
      //   method: 'POST', 
      //   redirect: "follow",
      //   body: urlencoded,
      //   headers: myHeaders}
      //   )
      //   .then(response => response.json())
      //   .then((usefulData) => {
      //     console.log(usefulData);
      //     setLoading(false);
      //     setSpData(usefulData);
      //   })
      //   .catch((e) => {
      //     console.error(`An error occurred: ${e}`)
      //   });
      // fetch()
      //   .then(response => response.json())
      //   .then(json => setSpReleaseDate(json))
      //   .catch(error => console.error(error));
      } 
    getAccessToken();
    getReleaseDate();
    console.log(spData);
    // console.log(spData[0]);

    // Check if release date is valid (between last last friday and most recent friday)
    // const release_date = getReleaseDate(url)

    // if (release_date > last_last_friday && date <= last_friday) {
    //   const insert_values = {
    //     user_id: user.id,
    //     sp_url: spUrl
    //   };  
      
    //   let { error } = await supabase
    //     .from('profiles')
    //     .insert(insert_values);
      
    //   if (error) {
    //     alert(error.message);
    //   }
    // } else {
    //   alert("Invalid release date. Please check your Spotify URL and try again.");
    // }   

    console.log(spUrl);

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