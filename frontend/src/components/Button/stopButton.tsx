import { StopIcon } from "@heroicons/react/24/outline";
import { Stop } from "../../../wailsjs/go/main/App";

type Props = {
  status: string;
};

const stopButton = (props: Props) => {
  const stopStatus = async () => {
    if (props.status !== "Stop") {
      await Stop();
    }
  };

  return (
    <button
      className={`w-[30px] h-[30px] flex items-center justify-center rounded-[3px]
            ${
              props.status === "Stop"
                ? "bg-icon-active dark:bg-icon-active dark:text-icon"
                : "bg-[#D52536] hover:bg-[#F53F51] text-white hover:cursor-pointer"
            }`}
      onClick={() => stopStatus()}
    >
      <StopIcon className="w-6" />
    </button>
  );
};

export default stopButton;
