import { FC, memo } from "react";
import ReactMarkdown, { Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock } from "./codeblock";



const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);

interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  return (
    <MemoizedReactMarkdown
      className="prose !max-w-full flex-grow w-full dark:prose-invert prose-p:leading-normal prose-pre:p-0 break- text-gray-900 prose-ul:marker:text-gray-800 prose-p:mb-2 prose-p:last:mb-0"
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        code({ node, inline, className, children, ...props }) {
          if (children.length) {
            if (children[0] == "▍") {
              return <span className="mt-1 animate-pulse cursor-default">▍</span>;
            }
      
            children[0] = (children[0] as string).replace("`▍`", "▍");
          }
      
          const match = /language-(\w+)/.exec(className || "");
      
          if (String(children).trim() === "/doc") {
            return (
              <code className="font-semibold bg-gray-300 rounded-md px-2 py-1">
                /doc
              </code>
            );
          }
          if (inline) {
            return (
              <code className={className} {...props}>
                {children}
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
      }}
    >
      {content}
    </MemoizedReactMarkdown>
  );
}
