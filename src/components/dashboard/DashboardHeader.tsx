import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardHeaderProps {
  title?: string;
  userName?: string;
  showGreeting?: boolean;
}


const DashboardHeader = ({ title = "DASHBOARD", showGreeting = true }: DashboardHeaderProps) => {
  const [userName, setUserName] = useState("Usuário");
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Priority: Auth Metadata -> Profile Table -> Email
        let nameToDisplay = "Usuário";
        let avatarToDisplay = null;

        // 1. Check Auth Metadata (Most up-to-date for "Display Name")
        if (user.user_metadata?.full_name) {
          nameToDisplay = user.user_metadata.full_name;
        }

        // 2. Check Profile Table (Fallback or for Avatar)
        const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single();

        if (profile) {
          if (!nameToDisplay || nameToDisplay === "Usuário") {
            if (profile.full_name) nameToDisplay = profile.full_name;
          }
          if (profile.avatar_url) avatarToDisplay = profile.avatar_url;
        }

        // 3. Fallback to Email
        if (nameToDisplay === "Usuário") {
          nameToDisplay = user.email?.split('@')[0] || "Usuário";
        }

        // Format: First Name Only
        const firstName = nameToDisplay.split(' ')[0];
        setUserName(firstName);

        if (avatarToDisplay) setAvatarUrl(avatarToDisplay);
        setUserEmail(user.email || "");
      }
    };
    getUser();
  }, []);



  const today = useMemo(() => {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  return (
    <header className="flex items-center justify-between py-2 px-8 bg-transparent mb-6">
      <div>
        <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase block mb-1">
          {title}
        </span>
        <AnimatePresence mode="wait">
          {showGreeting ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h1 className="text-3xl font-bold text-foreground capitalize">
                Olá, {userName}
              </h1>
              <p className="text-muted-foreground capitalize text-sm mt-1">{today}</p>
            </motion.div>
          ) : (
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-foreground capitalize"
            >
              {title === "DASHBOARD" ? "" : title}
            </motion.h1>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default DashboardHeader;

