import { cn } from "@/lib/utils";

interface AvatarProps {
  imageUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  isOnline?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-lg",
  lg: "w-14 h-14 text-xl",
};

const colors = [
  "from-violet-500 to-violet-700",
"from-green-400 to-green-600",
"from-violet-600 to-violet-800",
"from-green-500 to-green-700",
"from-violet-400 to-violet-600",
"from-green-400 to-emerald-600",
"from-violet-700 to-violet-900",
"from-green-300 to-green-500",
];

function getColor(name: string) {
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function Avatar({ imageUrl, name, size = "md", isOnline }: AvatarProps) {
  return (
    <div className={cn("relative", sizeClasses[size])}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className={cn("rounded-full object-cover w-full h-full border-gray-400")}
        />
      ) : (
        <div
          className={cn(
            "rounded-full bg-gradient-to-br flex items-center justify-center font-semibold text-white w-full h-full border-gray-500",
            getColor(name)
          )}
        >
          {name[0]?.toUpperCase() ?? "?"}
        </div>
      )}
      {isOnline !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 border-2 border-white rounded-full",
            size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3",
            isOnline ? "bg-green-500" : "bg-gray-300"
          )}
        />
      )}
    </div>
  );
}
