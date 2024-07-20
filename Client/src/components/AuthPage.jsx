import {useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Register from "./Register";
import { TypewriterEffect } from "../components/ui/typewriter-effect";
import { AuroraBackground } from "./ui/aurora-background";

export default function AuthPage() {

  const navigate = useNavigate();
  const { isLoaded, userId } = useAuth(); 
  const words = [
    {
      text: "Task",
    },
    {
      text: "management",
    },
    {
      text: "system",
    },
    {
      text: "by",
    },
    {
      text: "PRAHARSH",
      className: "text-blue-500 dark:text-blue-500",
    },
    {
      text: "SHARMA",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  useEffect(() => {
    if (isLoaded && userId) {
      navigate("/dashboard");
    }
  }, [isLoaded, userId, navigate]); // Add navigate to the dependency array

    return (
      <AuroraBackground>
        <div className="flex flex-col items-center justify-center h-[40rem] ">
          <TypewriterEffect words={words} />
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-10">
            <button className="w-40 h-10 cursor-pointer rounded-xl bg-white text-black border border-black text-sm">
              <Register/>
            </button>
          </div>
        </div>
      </AuroraBackground>
     

    )
  }