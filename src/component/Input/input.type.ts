import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
    label: string;
    icon?: ReactNode;
    rightElement?: ReactNode;
}

export type { InputProps };
