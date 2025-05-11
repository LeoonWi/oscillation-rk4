import StartStatus from "../../assets/status/Start.svg";
import PauseStatus from "../../assets/status/Pause.svg";
import StopStatus from "../../assets/status/Stop.svg";

type Props = {
  status: string;
};

const statusbar = (props: Props) => {
  const getIcon = (status: String) => {
    if (status === "Run") {
      return StartStatus;
    }
    if (status === "Pause") {
      return PauseStatus;
    } else {
      return StopStatus;
    }
  };

  return (
    <footer className="flex justify-center items-center space-x-[5px] select-none h-5 bg-secondary dark:bg-secondary">
      <img src={getIcon(props.status)} className="w-[10px] h-[10px]" />
      <div className="text-text-nocontent dark:text-text-nocontent font-medium">
        {props.status}
      </div>
    </footer>
  );
};

export default statusbar;
