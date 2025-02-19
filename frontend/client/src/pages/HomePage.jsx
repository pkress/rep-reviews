import { useSession } from '../context/SessionProvider'; // Adjust the path as needed
import { Link } from 'react-router-dom';

export default function Home() { 
  
  const session = useSession(); 
  return (
    <div className="home">
      <h1>Welcome to Review App</h1>
      {session ? (
        <div>
          <p>Welcome back!!</p> 
        </div>
      ) : (
        <div>
          <p>Please log in to get started!</p>
          <Link to="/auth">Log In</Link>
        </div>
      )}
    </div>
  );
}
