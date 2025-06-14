import {
  createContext,
  useContext,
  useState,
} from "react";
import type { ReactNode } from "react";

import {
  useGoogleLogin,
  googleLogout,
} from "@react-oauth/google";
import type { TokenResponse } from "@react-oauth/google";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  LogIn,
  LogOut,
  Settings,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import UserProfile from "./UserProfile";
import UserSettings from "./UserSettings";
import { showError } from "./ErrorBanner"; 

/* ------------------------------------------------------------------ */
/* Types & context                                                    */
/* ------------------------------------------------------------------ */

interface Profile {
  name: string;
  email: string;
  picture: string;
}

interface AuthCtx {
  user: Profile | null;
  accessToken: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthContainer />");
  return ctx;
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function AuthContainer({ children }: { children?: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* --- Sign‑in helper -------------------------------------------- */
  const login = useGoogleLogin({
    scope: "profile email",
    onSuccess: async (resp: TokenResponse) => {
      setToken(resp.access_token);

      // Basic profile (no extra APIs needed)
      try {
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${resp.access_token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch Google profile");
        const data = await res.json();
        setUser({
          name: data.name ?? data.email.split("@")[0],
          email: data.email,
          picture: data.picture,
        });
      } catch (err: any) {
        showError(err.message ?? "Could not fetch user info");
        return;
      }

      // simple client‑side “refresh” – silently logs in 1 min pre‑expiry
      if (resp.expires_in) {
        setTimeout(() => login(), (resp.expires_in - 60) * 1000);
      }
    },
    onError: () => showError("Google login failed"),
  });

  /* --- Sign‑out --------------------------------------------------- */
  const logout = () => {
    googleLogout();
    setUser(null);
    setToken(null);
    setProfileOpen(false);
    setSettingsOpen(false);
  };

  /* --------------------------------------------------------------- */
  return (
    <AuthContext.Provider value={{ user, accessToken: token, logout }}>
      <div className="flex justify-end">
        {!user ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => login()}
            className="gap-2"
          >
            <LogIn className="size-4" />
            Sign in with Google
          </Button>
        ) : (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted transition-colors"
                >
                  <Avatar className="size-6">
                    <AvatarImage src={user.picture} />
                    <AvatarFallback>
                      {user.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium max-w-[8rem] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="size-4" />
                </motion.button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  className="gap-2"
                  onSelect={() => setProfileOpen(true)}    // ← open profile dialog
                >
                  <UserIcon className="size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2"
                  onSelect={() => setSettingsOpen(true)}   // ← open settings dialog
                >
                  <Settings className="size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="gap-2 text-red-600"
                >
                  <LogOut className="size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* render dialogs */}
            <UserProfile
              open={profileOpen}
              onOpenChange={setProfileOpen}
            />
            <UserSettings
              open={settingsOpen}
              onOpenChange={setSettingsOpen}
            />
          </>
        )}
      </div>

      {children}
    </AuthContext.Provider>
  );
}