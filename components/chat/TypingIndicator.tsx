export function TypingIndicator({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <div className="flex items-center gap-1 bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm border border-gray-100">
        <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
        <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
        <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
      </div>
      <span className="text-xs text-gray-400">{text}</span>
    </div>
  );
}
