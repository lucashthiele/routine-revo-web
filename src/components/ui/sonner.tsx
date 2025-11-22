import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#333333] group-[.toaster]:border-[#333333]/10 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[#333333]/70",
          actionButton: "group-[.toast]:bg-[#FA1768] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-[#333333]/10 group-[.toast]:text-[#333333]",
          error: "group-[.toast]:bg-red-50 group-[.toast]:border-red-200",
          success: "group-[.toast]:bg-green-50 group-[.toast]:border-green-200",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
