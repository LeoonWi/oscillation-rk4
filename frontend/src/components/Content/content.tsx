import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const content = (props: Props) => {
  return <main className="flex-1 px-15 py-[25px]">{props.children}</main>;
};

export default content;
