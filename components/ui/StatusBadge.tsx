"use client";

import { EdgeStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: EdgeStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusDot = () => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "resolved":
        return "bg-blue-500";
      case "faded":
        return "bg-gray-500";
    }
  };

  const getStatusLabel = () => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
      <span className="text-xs font-medium text-zinc-300">{getStatusLabel()}</span>
    </div>
  );
}
