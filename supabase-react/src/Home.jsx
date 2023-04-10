import { useEffect, useState } from 'react';
import { Routes ,Route, Router } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Account from './Account';

export default function Home({ session } ) {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState(null); 
  
    useEffect(() => {
      async function getProfile() {
        setLoading(true);
        const { user } = session;
  
        let { data, error } = await supabase
          .from('profiles')
          .select(`username`)
          .eq('id', user.id)
          .single();
  
        if (error) {
          console.warn(error);
        } else if (data) {
          setUsername(data.username); 
        }
  
        setLoading(false);
      }
  
      getProfile();
    }, [session]);

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
        <div style={{ width: 450 }}>
            <label className="welcome sign" >
                {"Welcome to the home page, " + username + "!" }
            </label>
        </div> 
        <Router>
            <Routes> {/* The Switch decides which component to show based on the current URL.*/}
                <Route  path='/Account' component={<Account key={session.user.id} session={session} />}></Route >
            </Routes>
        </Router>
    </div>
  );
}
