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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
  const { isLoading, error } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Extract token from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const inviteToken = params.get("token");
    
    if (inviteToken) {
      setToken(inviteToken);
      validateToken(inviteToken);
    }
  }, [location]);

  // Validate the invitation token
  const validateToken = async (inviteToken: string) => {
    setIsValidatingToken(true);
    try {
      const response = await axios.post(`${API_URL}/auth/validate-token`, { token: inviteToken });
      
      // If token is valid, pre-fill the form with user data
      if (response.data) {
        setName(response.data.name || "");
        setEmail(response.data.email || "");
        setRole(response.data.role || "client");
        setIsTokenValid(true);
      }
    } catch (err) {
      console.error("Token validation error:", err);
      setIsTokenValid(false);
      // Redirect to unauthorized page if token is invalid
      navigate("/unauthorized");
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
      console.log("Attempting registration for:", email);

      // Call the backend API for registration with token if available
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role,
        token: token || undefined
      });

      console.log("Registration successful");

      toast({
        title: "Registration successful",
        description: "You can now log in to your account",
        duration: 3000,
      });

      // Redirect to login page after successful registration
      navigate("/login");
    } catch (err: any) {
      console.error("Registration error:", err);
      toast({
        title: "Registration failed",
        description:
          err.response?.data?.error ||
          err.message ||
          "An error occurred during registration",
        variant: "destructive",
        duration: 3000,
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
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
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;