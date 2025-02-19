import { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

export default function Auth() {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="row flex flex-center">
      <div className="col-6 form-widget">
        {isRegistering ? (
          <Register />
        ) : (
          <Login />
        )}

        {/* Toggle between Login and Register */}
        <p>
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <span
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ cursor: 'pointer', color: 'blue', marginLeft: '5px' }}
          >
            {isRegistering ? 'Log In' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
}
