import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClick: () => void;
  active?: Boolean;
};

const sidebarButton = (props: Props) => {
  return (
    <button
      className={`hover:bg-icon-hover hover:dark:bg-icon-hover text-icon dark:text-icon
        hover:cursor-pointer w-16 h-[30px] flex items-center justify-center rounded-[3px] ${
          props.active && "bg-icon-active"
        }`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

export default sidebarButton;
