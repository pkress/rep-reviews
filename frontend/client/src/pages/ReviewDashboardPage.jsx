import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import DashboardWelcome from '../components/DashboardWelcome';
import ReleaseSubmissionForm from '../components/ReleaseSubmissionForm';
import AssignReviewers from '../components/AssignReviewers';
import SubmitReview from '../components/SubmitReview';
import { getLastFriday, dateFormatters } from '../utils/dateUtils';
import { useSession } from '../context/SessionProvider'; 

const ReviewDashboard = () => {
  const session = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    username: null,
    assignment: null,
    submissionCount: 0,
    phase: null // 'submission', 'review', or null if we can't determine
  });

  useEffect(() => {
    if (!session) return;
    
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      
      try {
        // Get profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        // Determine current phase
        const today = new Date();
        const dayOfWeek = today.getDay();  
        const isSubmissionTime = (dayOfWeek >= 5 || dayOfWeek === 0);
        
        // Get submission count for current week
        const lastFriday = getLastFriday();
        const lastFridayISO = dateFormatters.toISOString(lastFriday);
        
        const { data: submissionData, error: submissionError } = await supabase
          .from('release_submissions')
          .select('created_at')
          .eq('user_id', session.user.id)
          .gte('created_at', lastFridayISO);
          
        if (submissionError) {
          console.warn('Error fetching submissions:', submissionError);
          // Continue execution - this isn't critical
        }
        
        // Check assignment
        let assignmentStatus = null;
        
        if (!isSubmissionTime) {
          const { data: assignmentData, error: assignmentError } = await supabase
            .from('release_assignments')
            .select('release_id, is_completed')
            .eq('user_id', session.user.id)
            .eq('release_week', lastFridayISO);
            
          if (assignmentError) {
            console.warn('Error fetching assignment:', assignmentError);
            // Continue execution - this isn't critical
          } else if (assignmentData && assignmentData.length > 0) {
            assignmentStatus = assignmentData[0].is_completed ? 'completed' : assignmentData[0].release_id;
          }
        }
        
        setDashboardData({
          username: profileData.username,
          assignment: assignmentStatus,
          submissionCount: submissionData?.length || 0,
          phase: isSubmissionTime ? 'submission' : 'review'
        });
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [session]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-600 text-red-200 px-4 py-3 rounded relative m-4">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <p className="mt-2">
          <Link to="/" className="text-red-100 underline">Return to homepage</Link>
        </p>
      </div>
    );
  }

  const { username, assignment, submissionCount, phase } = dashboardData;

  // Determine which dashboard state to show
  const getDashboardContent = () => {
    if (phase === 'submission') {
      return (
        <>
          <DashboardWelcome 
            username={username} 
            message="It's Submission Time!"
            phase={phase}

          />
          <ReleaseSubmissionForm session={session} />
        </>
      );
    }

    if (assignment === null) {
      return (
        <>
          <DashboardWelcome 
            username={username} 
            message="It's Review Time!" 
            phase={phase}
          />
          <AssignReviewers session={session} />
        </>
      );
    }

    if (assignment === 'completed') {
      return (
        <>
          <DashboardWelcome 
            username={username} 
            message="You've finished your assignment! Let's party!" 
            phase={null}
          />
          <div className="text-center mt-8">
            <Link 
              to="/reports" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Check Out Weekly Reports
            </Link>
          </div>
        </>
      );
    }

    return (
      <>
        <DashboardWelcome 
          username={username} 
          message="It's Review Time!" 
          phase={phase}
        />
        <SubmitReview session={session} />
      </>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {getDashboardContent()} 
      </div>
    </div>
  );
};

export default ReviewDashboard;