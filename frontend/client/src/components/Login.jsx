import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [token, setToken] = useState('');

  // Magic Link login with OTP option
  const handleLoginWithMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
      
      alert('Check your email for the login link or enter the code below!');
      setShowOTPInput(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) throw error;
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-widget">
      <h1>Log In</h1>

      <form onSubmit={handleLoginWithMagicLink}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="button block" disabled={loading || showOTPInput}>
          {loading ? 'Loading...' : 'Send Magic Link'}
        </button>
      </form>

      {showOTPInput && (
        <form onSubmit={handleVerifyOTP} className="mt-4">
          <p className="text-sm mb-2">
            You can either click the link in your email or enter the code here:
          </p>
          <input
            type="text"
            placeholder="Enter verification code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <button className="button block" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      )}
    </div>
  );
}