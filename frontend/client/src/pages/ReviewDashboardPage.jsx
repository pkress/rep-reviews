import React from 'react';
import { useDashboardState } from '../hooks/useDashboardState';
import DashboardWelcome from '../components/DashboardWelcome';
import ReleaseSubmissionForm from '../components/ReleaseSubmissionForm';
import AssignReviewers from '../components/AssignReviewers';
import SubmitReview from '../components/SubmitReview';
import { useSession } from '../context/SessionProvider'; 

const ReviewDashboard = () => {
  const session = useSession();
  const { loading, username, assignment, submissionCount } = useDashboardState(session);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Loading...</p>
      </div>
    );
  }

  // Determine which dashboard state to show
  const getDashboardContent = () => {
    // Check if it's submission time (Friday - Sunday)
    const dayOfWeek = new Date().getDay();  
    // const isSubmissionTime = (dayOfWeek >= 5 || dayOfWeek == 0);
    const isSubmissionTime = false;

    if (isSubmissionTime) {
      return (
        <>
          <DashboardWelcome 
            username={username} 
            message="It's Submission Time!" 
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
          />
          <AssignReviewers session={session} />
        </>
      );
    }

    if (assignment === 'completed') {
      return (
        <DashboardWelcome 
          username={username} 
          message="You've finished your assignment! Let's party!" 
        />
      );
    }

    return (
      <>
        <DashboardWelcome 
          username={username} 
          message="It's Review Time!" 
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