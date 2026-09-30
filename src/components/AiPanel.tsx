import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, X } from "lucide-react";
import { useAiPanel, AI_ACTIONS } from "../lib/aiPanel";
import { useChat } from "../hooks/useChat";
import { ChatThread } from "./ChatThread";

/** لوحة المُعين الجانبية: تفتح من أي درس أو مسألة لتوسيع الشرح */
export function AiPanel() {
  const { open, req, nonce, close } = useAiPanel();
  const chat = useChat([], { context: req?.context, mode: req?.mode });

  useEffect(() => {
    if (!open || !req) return;
    chat.reset([]);
    if (req.prompt) {
      // نرسل على قاعدة فارغة لتجنّب بقايا جلسة سابقة
      void chat.send(req.prompt, { context: req.context, mode: req.mode, base: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            className="ai-panel"
            role="dialog"
            aria-label="المُعين"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="ai-head">
              <div className={`ai-orb ${chat.streaming ? "thinking" : ""}`}>
                <Sparkles size={18} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="title-md">المُعين</div>
                <div className="tiny muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {req?.title}
                </div>
              </div>
              <button className="icon-btn" onClick={close} aria-label="إغلاق">
                <X size={20} />
              </button>
            </div>
            <ChatThread
              messages={chat.messages}
              streaming={chat.streaming}
              error={chat.error}
              onSend={(t) => chat.send(t)}
              onStop={chat.stop}
              placeholder="اسأل عن هذا الموضع…"
              empty={
                <div className="stack" style={{ paddingTop: 8 }}>
                  <p className="muted small">اختر ما تريد، أو اكتب سؤالك بحرية:</p>
                  <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {AI_ACTIONS.map((a) => (
                      <button
                        key={a.mode}
                        className="suggestion"
                        onClick={() => chat.send(a.prompt, { context: req?.context, mode: a.mode })}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              }
            />
            <p className="tiny muted" style={{ padding: "0 16px 10px", textAlign: "center" }}>
              إجابات المُعين مولَّدة آلياً للتعليم؛ راجع أهل العلم فيما يُشكل.
            </p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
