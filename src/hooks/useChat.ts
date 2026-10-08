import { useCallback, useRef, useState } from "react";
import { streamAi, type AiMode } from "../lib/ai";
import { useStore, type ChatMessage } from "../lib/store";

/** محادثة متدفقة مع المُعين */
export function useChat(initial: ChatMessage[] = [], opts: { context?: string; mode?: AiMode } = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const logAi = useStore((s) => s.logAi);

  const send = useCallback(
    async (text: string, override?: { context?: string; mode?: AiMode; base?: ChatMessage[] }) => {
      const content = text.trim();
      if (!content || streaming) return;
      const history = [...(override?.base ?? messages), { role: "user" as const, content }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setStreaming(true);
      setError(null);
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      let acc = "";
      try {
        await streamAi(
          { messages: history, context: override?.context ?? opts.context, mode: override?.mode ?? opts.mode ?? "chat" },
          (chunk) => {
            acc += chunk;
            setMessages([...history, { role: "assistant", content: acc }]);
          },
          ctrl.signal,
        );
        if (acc) logAi();
        else {
          setMessages(history.slice(0, -1));
          if (!ctrl.signal.aborted) setError("لم يصل ردّ من المُعين هذه المرة، أعد إرسال سؤالك.");
        }
      } catch (e) {
        setError((e as Error).message);
        setMessages(history.slice(0, -1));
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
      return acc;
    },
    [messages, streaming, opts.context, opts.mode, logAi],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);
  const reset = useCallback((m: ChatMessage[] = []) => {
    abortRef.current?.abort();
    setMessages(m);
    setError(null);
  }, []);

  return { messages, setMessages, send, stop, reset, streaming, error };
}
