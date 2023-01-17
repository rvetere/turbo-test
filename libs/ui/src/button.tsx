import { FunctionComponent, ReactNode } from "react";

export const Button: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  return <button>{children}</button>;
};
