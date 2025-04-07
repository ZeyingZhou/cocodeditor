import { useNavigate } from "react-router-dom";
import { useGetTeams } from "@/hooks/use-get-teams";
import { useCreateTeamModal } from "@/hooks/use-create-team-modal";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth-context-provider";

const TeamCheckPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [_, setIsCreateTeamModalOpen] = useCreateTeamModal();

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/test', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        console.log('Server test response:', data);
      } catch (error) {
        console.error('Server test error:', error);
      }
    };

    const checkTeams = async () => {
      try {
        // If user has teams, redirect to dashboard
        const response = await fetch('http://localhost:3000/api/teams', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if(data.length > 0) {
          navigate(`/dashboard/${data[0].id}`);
        } else {
          setIsCreateTeamModalOpen(true);
        }
      } catch (error) {
        console.error('Error checking teams:', error);
        // Handle error appropriately
      }
    };
    
    // Test server connection first
    testConnection();
    
    if (session?.access_token) {
      checkTeams();
    }
  }, [session?.access_token]);

  return (
    <div>
      <h1>Team Check</h1>
    </div>
  );
};

export default TeamCheckPage; 