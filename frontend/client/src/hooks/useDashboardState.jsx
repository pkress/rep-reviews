import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useDashboardState = (session) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);

  useEffect(() => {
    if (session) {
      const fetchProfileAndAssignment = async () => {
        setLoading(true);
        try {
          // Get profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .single();

          if (profileError) throw profileError;
          setUsername(profile.username);

          // Get last Friday
          const lastFriday = getLastFriday();
 
          // Get assignments
          const { data: assignmentData, error: assignmentError } = await supabase
            .from('release_assignments')
            .select('release_id, is_completed, release_week, user_id')

          const userAssignments = assignmentData
            .filter(assignment => assignment.user_id === session.user.id)
            .filter(assignment => assignment.release_week === lastFriday);
          
          if (userAssignments.length === 0) {
            setAssignment(null);
          } else {
            setAssignment(userAssignments[0].is_completed ? 'completed' : userAssignments[0].release_id);
          }

        } catch (error) {
          console.error('Error fetching profile and assignment:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchProfileAndAssignment();
    }
  }, [session]);

  return {
    loading,
    username,
    assignment,
    submissionCount
  };
};

// Helper function
const getLastFriday = () => {
  const d = new Date();
  const diff = d.getDay() < 5 ? d.getDay() + 2 : d.getDay() - 5;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
};