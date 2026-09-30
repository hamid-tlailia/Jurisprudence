import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{ table: ({ node: _n, ...props }) => <div className="table-wrap"><table {...props} /></div> }}
      >{children}</ReactMarkdown>
    </div>
  );
}
