import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, CloudOff, Square, TriangleAlert } from "lucide-react";
import type { ChatMessage } from "../lib/store";
import { Markdown } from "./Markdown";
import { useOnline } from "../lib/online";

type Props = {
  messages: ChatMessage[];
  streaming: boolean;
  error: string | null;
  onSend: (text: string) => void;
  onStop: () => void;
  empty?: React.ReactNode;
  placeholder?: string;
};

export function ChatThread({ messages, streaming, error, onSend, onStop, empty, placeholder }: Props) {
  const [draft, setDraft] = useState("");
  const online = useOnline();
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: streaming ? "auto" : "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [draft]);

  const submit = () => {
    if (!draft.trim() || streaming || !online) return;
    onSend(draft);
    setDraft("");
  };

  return (
    <>
      <div className="chat-scroll" ref={scrollRef} aria-live="polite">
        {messages.length === 0 && empty}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              className={`bubble ${m.role}`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {m.role === "assistant" ? (
                m.content ? (
                  <Markdown>{m.content}</Markdown>
                ) : (
                  <span className="typing" aria-label="يكتب">
                    <span />
                    <span />
                    <span />
                  </span>
                )
              ) : (
                <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="row small"
            style={{ color: "var(--danger)", background: "var(--danger-soft)", padding: "10px 14px", borderRadius: 12, alignItems: "flex-start" }}
          >
            <TriangleAlert size={18} style={{ flexShrink: 0, marginTop: 4 }} />
            <span>{error}</span>
          </motion.div>
        )}
      </div>
      {!online && (
        <div className="row small muted" style={{ justifyContent: "center", gap: 6, padding: "8px 16px 0" }}>
          <CloudOff size={16} /> أنت غير متصل — المُعين يحتاج إلى الإنترنت، وبقية التطبيق تعمل كالمعتاد.
        </div>
      )}
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          ref={taRef}
          rows={1}
          value={draft}
          placeholder={placeholder ?? "اكتب سؤالك…"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          aria-label="سؤالك"
        />
        {streaming ? (
          <button type="button" className="btn btn-ghost" onClick={onStop} aria-label="إيقاف" style={{ height: 46, width: 46, padding: 0 }}>
            <Square size={16} fill="currentColor" />
          </button>
        ) : (
          <button type="submit" className="btn btn-primary" disabled={!draft.trim() || !online} aria-label="إرسال" style={{ height: 46, width: 46, padding: 0 }}>
            <ArrowUp size={20} />
          </button>
        )}
      </form>
    </>
  );
}
