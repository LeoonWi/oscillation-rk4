import { useState } from "react";
import Button from "../Button/sidebarButton";
import {
  BugAntIcon,
  ClipboardIcon,
  LifebuoyIcon,
  MoonIcon,
  Square3Stack3DIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSidebar: boolean;
  // setOpenSidebar: (status: boolean) => void;
};

const sidebar = (props: Props) => {
  const [theme, setTheme] = useState("light");

  const toggleDarkTheme = () => {
    setTheme(() => {
      const newTheme = theme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      return newTheme;
    });
  };

  return (
    <nav className="flex flex-col py-[25px] px-2 w-20 bg-secondary dark:bg-secondary">
      {/* <div className="sidebar-btn mb-[25px]">
        <button
          className={`bg-icon-hover dark:bg-icon-hover text-icon dark:text-icon
        hover:cursor-pointer w-16 h-[30px] flex items-center justify-center rounded-[3px]`}
          onClick={() => props.setOpenSidebar(!props.openSidebar)}
        >
          {props.openSidebar ? (
            <ChevronLeftIcon className="w-6" />
          ) : (
            <ChevronRightIcon className="w-6" />
          )}
        </button>
      </div> */}
      <div className="flex flex-col h-full justify-between">
        <div className="buttom-top">
          <Button
            active={props.activeTab === "home" ? true : false}
            onClick={() => props.setActiveTab("home")}
          >
            <Square3Stack3DIcon className="w-6" />
          </Button>
          <Button
            active={props.activeTab === "history" ? true : false}
            onClick={() => props.setActiveTab("history")}
          >
            <ClipboardIcon className="w-6" />
          </Button>
          <Button
            active={props.activeTab === "documentation" ? true : false}
            onClick={() => props.setActiveTab("documentation")}
          >
            <LifebuoyIcon className="w-6" />
          </Button>
        </div>
        <div className="buttom-bottom">
          <Button onClick={toggleDarkTheme}>
            {theme === "light" ? (
              <MoonIcon className="w-6" />
            ) : (
              <SunIcon className="w-6" />
            )}
          </Button>
          <Button
            active={props.activeTab === "report" ? true : false}
            // TODO сделать переход на создание иссью в гитхабе
            onClick={() => {}}
          >
            <BugAntIcon className="w-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default sidebar;
