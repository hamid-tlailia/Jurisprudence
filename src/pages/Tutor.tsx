import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { History, MessageSquarePlus, Sparkles, Trash2 } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { useStore, type Chat } from "../lib/store";
import { ChatThread } from "../components/ChatThread";
import { Sheet } from "../components/Sheet";
import { dateMedium, num } from "../lib/format";

const SUGGESTIONS = [
  "ما الفرق بين الفرض والواجب عند الحنفية والجمهور؟",
  "اشرح لي شروط الحديث الصحيح بمثال.",
  "ما الحكمة من مشروعية التيمم؟",
  "كيف أبدأ طلب علم الفقه؟ ضع لي خطة متدرجة.",
  "ما معنى قاعدة «المشقة تجلب التيسير» وما أمثلتها؟",
  "اختبرني في أقسام الحديث الضعيف.",
];

const newId = () => Math.random().toString(36).slice(2, 10);

export default function TutorPage() {
  const chats = useStore((s) => s.chats);
  const saveChat = useStore((s) => s.saveChat);
  const deleteChat = useStore((s) => s.deleteChat);
  const [activeId, setActiveId] = useState<string>(() => newId());
  const chat = useChat([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  // حفظ المحادثة بعد انتهاء كل رد
  useEffect(() => {
    if (chat.streaming || chat.messages.length < 2) return;
    const last = chat.messages[chat.messages.length - 1];
    if (last.role !== "assistant" || !last.content) return;
    const existing = useStore.getState().chats.find((c) => c.id === activeId);
    const c: Chat = {
      id: activeId,
      title: existing?.title ?? chat.messages[0].content.slice(0, 60),
      messages: chat.messages,
      updatedAt: Date.now(),
    };
    saveChat(c);
  }, [chat.streaming, chat.messages, activeId, saveChat]);

  const openChat = (c: Chat) => {
    setActiveId(c.id);
    chat.reset(c.messages);
  };

  const fresh = () => {
    setActiveId(newId());
    chat.reset([]);
  };

  const removeChat = (id: string) => {
    deleteChat(id);
    if (id === activeId) fresh();
  };

  return (
    <div className="page" style={{ paddingBottom: 90 }}>
      <div className="grid" style={{ gridTemplateColumns: "minmax(0, 1fr)", gap: 20 }}>
        <div className="tutor-layout">
          <aside className="tutor-history card" aria-label="المحادثات السابقة">
            <button className="btn btn-primary" onClick={fresh} style={{ width: "100%" }}>
              <MessageSquarePlus size={17} /> محادثة جديدة
            </button>
            <ChatHistory chats={chats} activeId={activeId} onOpen={openChat} onDelete={removeChat} />
          </aside>

          <section className="card tutor-main">
            <div className="ai-head">
              <div className={`ai-orb ${chat.streaming ? "thinking" : ""}`}>
                <Sparkles size={18} />
              </div>
              <div>
                <h1 className="title-md">المُعين</h1>
                <p className="tiny muted">مساعدك في الفقه وأصوله والحديث وعلومه</p>
              </div>
              <div className="row" style={{ marginInlineStart: "auto", gap: 2 }}>
                <button className="icon-btn hide-lg" onClick={() => setHistoryOpen(true)} aria-label="المحادثات السابقة" title="المحادثات السابقة">
                  <History size={19} />
                  {chats.length > 0 && <span className="badge-dot">{num(chats.length)}</span>}
                </button>
                <button className="icon-btn" onClick={fresh} aria-label="محادثة جديدة" title="محادثة جديدة">
                  <MessageSquarePlus size={19} />
                </button>
              </div>
            </div>
            <ChatThread
              messages={chat.messages}
              streaming={chat.streaming}
              error={chat.error}
              onSend={(t) => chat.send(t)}
              onStop={chat.stop}
              empty={
                <div className="stack" style={{ alignItems: "center", textAlign: "center", padding: "24px 8px" }}>
                  <motion.div
                    className="ai-orb"
                    style={{ width: 64, height: 64, borderRadius: 20 }}
                    animate={{ rotate: [0, 6, -6, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles size={28} />
                  </motion.div>
                  <h2 className="title-lg" style={{ fontFamily: "var(--font-classic)", fontSize: "1.7rem" }}>
                    سَلْ تَعْلَمْ
                  </h2>
                  <p className="muted small" style={{ maxWidth: 420 }}>
                    اسأل عن مسألة فقهية أو قاعدة أصولية أو مصطلح حديثي، وسيجيبك المُعين بشرح منهجي مع ذكر الأدلة والأقوال.
                  </p>
                  <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8, width: "100%", marginTop: 8 }}>
                    {SUGGESTIONS.map((q) => (
                      <button key={q} className="suggestion" onClick={() => chat.send(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              }
            />
            <p className="tiny muted" style={{ padding: "0 16px 12px", textAlign: "center" }}>
              المُعين أداة تعليمية مولَّدة بالذكاء الاصطناعي، وقد يخطئ؛ فتحقق من المسائل المهمة عند أهل العلم.
            </p>
          </section>
        </div>
      </div>
      <Sheet open={historyOpen} onClose={() => setHistoryOpen(false)} title="المحادثات السابقة">
        <button
          className="btn btn-primary"
          style={{ width: "100%", marginBottom: 8 }}
          onClick={() => {
            fresh();
            setHistoryOpen(false);
          }}
        >
          <MessageSquarePlus size={17} /> محادثة جديدة
        </button>
        <ChatHistory
          chats={chats}
          activeId={activeId}
          onOpen={(c) => {
            openChat(c);
            setHistoryOpen(false);
          }}
          onDelete={removeChat}
        />
      </Sheet>
    </div>
  );
}

function ChatHistory({ chats, activeId, onOpen, onDelete }: { chats: Chat[]; activeId: string; onOpen: (c: Chat) => void; onDelete: (id: string) => void }) {
  return (
    <div className="stack-sm" style={{ marginTop: 12, gap: 2 }}>
      {chats.length === 0 && (
        <p className="small muted" style={{ padding: 8 }}>
          لا محادثات محفوظة بعد. تُحفظ كل محادثة تلقائياً بعد أول إجابة.
        </p>
      )}
      <AnimatePresence initial={false}>
        {chats.map((c) => (
          <motion.div key={c.id} layout initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className={`history-item ${c.id === activeId ? "on" : ""}`}>
            <button onClick={() => onOpen(c)} className="history-title">
              <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
              <span className="tiny muted">{dateMedium(new Date(c.updatedAt))}</span>
            </button>
            <button className="icon-btn" style={{ width: 32, height: 32 }} aria-label="حذف المحادثة" onClick={() => onDelete(c.id)}>
              <Trash2 size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
