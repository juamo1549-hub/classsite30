import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/* shadcn/ui 표준 버튼. 색은 app/globals.css 의 디자인 토큰을 따릅니다.
   사용 예) <Button>기본</Button>  <Button variant="outline" size="lg">테두리</Button>
   링크로 쓰기) <Button asChild><a href="#contact">연락하기</a></Button> */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  {
    variants: {
      /* 네오브루탈리즘: 2px 검정 선 + 단단한 그림자, 누르면 그림자 쪽으로 쏙 들어감 */
      variant: {
        default:
          "border-2 bg-primary text-primary-foreground shadow-hard-sm hover:brightness-105 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        destructive:
          "border-2 bg-destructive text-white shadow-hard-sm hover:brightness-105 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        outline:
          "border-2 bg-card text-card-foreground shadow-hard-sm hover:bg-accent active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        secondary:
          "border-2 bg-secondary text-secondary-foreground shadow-hard-sm hover:brightness-110 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        accent:
          "border-2 bg-accent text-accent-foreground shadow-hard-sm hover:brightness-105 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3.5 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
