import { useNavigate } from "react-router-dom";
import { useGetTeams } from "@/hooks/use-get-teams";
import { useCreateTeamModal } from "@/hooks/use-create-team-modal";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth-context-provider";

const TeamCheckPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [_, setIsCreateModalOpen] = useCreateTeamModal();

  useEffect(() => {
    const checkTeams = async () => {
      // If user has teams, redirect to dashboard
      const response = await fetch('/api/teams', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
      });
      const data = await response.json();
      if(data.length > 0) {
        navigate(`/dashboard/${data[0].id}`);
      } else {
        setIsCreateModalOpen(true);
      }
    };
    
    checkTeams();
    
    // // If user doesn't have teams and we're done loading, open modal
    // if (!isLoading && !hasTeams) {
    //   setIsCreateModalOpen(true);
    // }
  }, []);

  return (
  <div>
    <h1>Team Check</h1>
  </div>
  );
};

export default TeamCheckPage; 