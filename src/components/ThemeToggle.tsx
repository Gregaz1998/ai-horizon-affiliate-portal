
import React from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";

type ThemeToggleProps = {
  variant?: "switch" | "button" | "toggleGroup";
  className?: string;
};

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = "switch", 
  className = ""
}) => {
  const { theme, toggleTheme } = useTheme();
  
  switch (variant) {
    case "button":
      return (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className={className}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      );
      
    case "toggleGroup":
      return (
        <ToggleGroup type="single" value={theme} onValueChange={(value) => {
          if (value) toggleTheme();
        }} className={className}>
          <ToggleGroupItem value="light" aria-label="Toggle light mode">
            <Sun className="h-4 w-4 mr-2" />
            Clair
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Toggle dark mode">
            <Moon className="h-4 w-4 mr-2" />
            Sombre
          </ToggleGroupItem>
        </ToggleGroup>
      );
      
    case "switch":
    default:
      return (
        <div className={`flex items-center space-x-2 ${className}`}>
          <Sun className="h-4 w-4" />
          <Switch 
            checked={theme === "dark"}
            onCheckedChange={toggleTheme}
            aria-label="Toggle dark mode"
          />
          <Moon className="h-4 w-4" />
        </div>
      );
  }
};

export default ThemeToggle;
