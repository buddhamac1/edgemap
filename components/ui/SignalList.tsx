"use client";

interface SignalListProps {
  signals: string[];
}

export function SignalList({ signals }: SignalListProps) {
  return (
    <div className="space-y-2">
      {signals.map((signal, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
          <span className="text-sm text-zinc-300">{signal}</span>
        </div>
      ))}
    </div>
  );
}
