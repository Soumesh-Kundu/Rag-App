import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock } from "./codeblock";

interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  const components: Components = {
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");

      if (String(children).trim() === "/doc") {
        return (
          <code className="font-semibold bg-gray-300 rounded-md px-2 py-1">
            /doc
          </code>
        );
      }
      return (
        <CodeBlock
          key={Math.random()}
          language={(match && match[1]) || ""}
          value={String(children).replace(/\n$/, "")}
          {...props}
        />
      );
    },
  };

  return (
    <div className="prose !max-w-full flex-grow w-full dark:prose-invert prose-p:leading-normal prose-pre:p-0 break-words text-gray-900 prose-ul:marker:text-gray-800 prose-p:mb-2 prose-p:last:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
