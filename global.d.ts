declare global {
    declare module "react" {
      namespace JSX {
        interface IntrinsicElements {
          "l-ring": React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLElement>,
            HTMLElement
          > & {
            size?: number;
            color?: string;
            stroke?: number;
            speed?: number;
          };
          "l-dot-wave": React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLElement>,
            HTMLElement
          > & {
            size?: number;
            color?: string;
            stroke?: number;
            speed?: number;
          }
        }
      }
    }
    declare module "react/jsx-runtime" {
      namespace JSX {
        interface IntrinsicElements {
        }
      }
    }
  }
  