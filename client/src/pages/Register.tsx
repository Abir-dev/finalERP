import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Building2, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import axios from "axios";
import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "https://test-board-ag1d.vercel.app/api";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [role, setRole] = useState("client"); // Default role
  const [token, setToken] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading, error } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast(); // Extract token from URL query parameters and validate it
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const inviteToken = params.get("token");

    if (inviteToken) {
      setToken(inviteToken);
      validateToken(inviteToken);
    } else {
      // No token, reset validation states
      setIsTokenValid(false);
      setIsValidatingToken(false);
    }
  }, [location]);
  // Validate the invitation token
  const validateToken = async (inviteToken: string) => {
    setIsValidatingToken(true);
    try {
      // First validate token format
      if (!inviteToken.match(/^[a-zA-Z0-9]{32}$/)) {
        throw new Error("Invalid token format");
      }

      // Query Supabase for the invitation with this token
      const { data: invitation, error } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("token", inviteToken)
        .eq("used", false)
        .single();

      if (error || !invitation) {
        throw new Error("Invalid or already used invitation token");
      }

      // Check if the invitation has expired
      const expiryDate = new Date(invitation.expires_at);
      const now = new Date();
      if (expiryDate < now) {
        const hoursDiff = Math.round(
          (now.getTime() - expiryDate.getTime()) / (1000 * 60 * 60)
        );
        throw new Error(`Invitation expired ${hoursDiff} hours ago`);
      }

      // Decrypt the data (replace with actual decryption)
      // In a real implementation, use a proper decryption method
      const decryptedData = atob(invitation.encrypted_data); // Replace with actual decryption
      const userData = JSON.parse(decryptedData); // Pre-fill the form with user data from invitation
      if (invitation.name && invitation.email && invitation.role) {
        setName(invitation.name);
        setEmail(invitation.email);
        setRole(invitation.role);
        setIsTokenValid(true);
      } else {
        throw new Error("Invalid invitation data");
      }
    } catch (err: any) {
      console.error("Token validation error:", err);
      setIsTokenValid(false);

      const errorMessage =
        err instanceof Error ? err.message : "Invalid invitation token";
      toast({
        title: "Invalid Invitation",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });

      // Redirect to unauthorized page after showing the error
      setTimeout(() => {
        navigate("/unauthorized", {
          state: { error: errorMessage },
        });
      }, 2000);
    } finally {
      setIsValidatingToken(false);
    }
  };

  // Validate passwords match in real-time
  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Registration failed",
        description: "Passwords do not match",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    try {
      setIsSubmitting(true);
      console.log("Attempting registration for:", email);

      // Additional validation when using invitation token
      if (token) {
        if (!isTokenValid) {
          throw new Error("Invalid or expired invitation token");
        }

        const { data: invitation } = await supabase
          .from("user_invitations")
          .select("*")
          .eq("token", token)
          .eq("used", false)
          .single();

        if (!invitation) {
          throw new Error("Invitation has already been used or is invalid");
        }
      } // Call the backend API for registration
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role,
        invitationToken: token, // Pass token to backend for verification
      });
      console.log("Registration successful");
       const { data: invitation, error: updateError } = await supabase
          .from("user_invitations")
          .update({
            used: true,
            expires_at: new Date().toISOString(),
          })
          .eq("token",token)
          .select("*");
        console.log("Invitation data:", invitation);

        if (updateError) {
          console.error("Error marking invitation as used:", updateError);
          throw new Error("Failed to complete registration. Please try again.");
        }
      
      console.log("used state update successful");
      toast({
        title: "Registration successful",
        description: "You can now log in to your account",
        duration: 3000,
      });

      // Redirect to login page after successful registration
      navigate("/login", {
        state: {
          email, // Pass email to pre-fill login form
          message:
            "Registration successful! Please log in with your credentials.",
        },
      });
    } catch (err: any) {
      console.error("Registration error:", err);

      let errorMessage = "An error occurred during registration";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Show loading state while validating token
  if (token && isValidatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
        <Card className="w-full max-w-md text-center p-6">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Validating your invitation...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Building2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">ConstructFlow ERP</CardTitle>
          <CardDescription>
            {token ? "Complete your account setup" : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  readOnly={!!token}
                  className={token ? "bg-muted cursor-not-allowed" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@constructflow.com"
                  required
                  readOnly={!!token}
                  className={token ? "bg-muted cursor-not-allowed" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={passwordError ? "border-destructive" : ""}
                />
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  type="text"
                  value={role}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !!passwordError}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                    account...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        {/* <CardFooter className="flex flex-col items-center">
          <div className="text-sm text-muted-foreground mt-4 text-center">
            <p>
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate("/login")}
              >
                Sign in
              </Button>
            </p>
          </div>
        </CardFooter> */}
      </Card>
    </div>
  );
};

export default Register;
