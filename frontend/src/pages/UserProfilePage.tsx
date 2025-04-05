import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/auth-context-provider";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MessageSquare, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  email: string;
  created_at: string;
}

const UserProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
        setError('Username is required');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch profile from profiles table
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();
        
        if (profileError) throw profileError;
        
        if (!data) {
          setError('User not found');
          return;
        }
        
        setProfile(data as UserProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [username]);

  const handleStartChat = () => {
    if (!profile) return;
    // Navigate to chat with the user
    navigate(`/chat/${profile.id}`);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
        <div className="max-w-2xl mx-auto">
          <Card className={`${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/30' : 'bg-white border-gray-200'}`}>
            <CardContent className="flex items-center justify-center p-8">
              <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Loading profile...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
        <div className="max-w-2xl mx-auto">
          <Card className={`${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/30' : 'bg-white border-gray-200'}`}>
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
              <div className={`text-center ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                {error || 'Profile not found'}
              </div>
              <Button
                onClick={() => navigate(-1)}
                className={theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
      <div className="max-w-2xl mx-auto">
        <Card className={`${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/30' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className={theme === 'dark' ? 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {profile.username}
                </CardTitle>
                <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  User Profile
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                <AvatarFallback className={`text-xl ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* User Info Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Username
                </div>
                <div className={`p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700/30 text-gray-200' : 'bg-gray-100 text-gray-900'}`}>
                  {profile.username}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Email
                </div>
                <div className={`p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700/30 text-gray-200' : 'bg-gray-100 text-gray-900'}`}>
                  {profile.email}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Member Since
                </div>
                <div className={`p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700/30 text-gray-200' : 'bg-gray-100 text-gray-900'}`}>
                  {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            {currentUser?.id !== profile.id && (
              <Button
                onClick={handleStartChat}
                className={theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage; 