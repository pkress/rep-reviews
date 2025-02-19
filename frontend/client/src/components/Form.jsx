
import { React, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Form() {
    
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);
  const [album, setAlbum] = useState('album_name');

  useEffect(() => {
    async function getAlbum() {
      setLoading(true);

      let { data, error } = await supabase
        .from('albums')
        .select(`id, album_name`)
        .eq('id', 1)
        .single();   

      if (error) {
        console.warn(error);
      } else if (data) {
        setAlbum(data.album_name);
      }

      setLoading(false);
    }

    // getAlbum();
  });

  return (
    <div className="wrapper">
      <h1>Initial Form</h1>
      <form>
      <fieldset>
         <label>
           <p>{'Album name: ' + album}</p>
           <input review="review..." />
         </label> 
       </fieldset>
       <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default Form;