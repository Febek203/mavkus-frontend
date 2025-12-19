export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 text-textMuted animate-pulse">
      <span>Mavkus sta elaborando</span>
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-primaryLight rounded-full animate-bounce-dot" />
        <span className="w-2 h-2 bg-primaryLight rounded-full animate-bounce-dot delay-150" />
        <span className="w-2 h-2 bg-primaryLight rounded-full animate-bounce-dot delay-300" />
      </div>
    </div>
  );
}
