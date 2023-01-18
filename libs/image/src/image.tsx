import { FunctionComponent } from "react";

export const Image: FunctionComponent<{ src: string }> = ({ src }) => {
  return <img src={src} />;
};
