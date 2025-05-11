import { PauseIcon, PlayIcon } from "@heroicons/react/24/outline";
import { SimulationData, ListSimulation } from "../../App";
import { Pause, Start } from "../../../wailsjs/go/main/App";
import { EventsEmit } from "../../../wailsjs/runtime/runtime";

type SimulationParams = {
  a: number;
  b: number;
  d: number;
  g: number;
  x: number;
  y: number;
  max: number;
  step: number;
};

type Props = {
  status: string;
  data: SimulationParams;
  setData: {
    setA: React.Dispatch<React.SetStateAction<number>>;
    setB: React.Dispatch<React.SetStateAction<number>>;
    setD: React.Dispatch<React.SetStateAction<number>>;
    setG: React.Dispatch<React.SetStateAction<number>>;
    setX: React.Dispatch<React.SetStateAction<number>>;
    setY: React.Dispatch<React.SetStateAction<number>>;
    setMax: React.Dispatch<React.SetStateAction<number>>;
    setStep: React.Dispatch<React.SetStateAction<number>>;
  };
  simulationData: SimulationData[];
  setSimulationData: React.Dispatch<React.SetStateAction<SimulationData[]>>;
  setListSimulation: React.Dispatch<React.SetStateAction<ListSimulation[]>>;
};

const switchButton = (props: Props) => {
  const getStatus = () => {
    if (props.status === "Run") return <PauseIcon className="w-6" />;
    if (props.status !== "Run") return <PlayIcon className="w-6" />;
  };

  function isValidSimulationData(data: SimulationParams): boolean {
    const requiredFields: (keyof SimulationParams)[] = [
      "a",
      "b",
      "d",
      "g",
      "x",
      "y",
      "max",
      "step",
    ];
    return requiredFields.every((field) => {
      const value = data[field];
      return (
        value !== undefined &&
        value !== null &&
        typeof value === "number" &&
        !isNaN(value) &&
        (field === "step" ? value > 0 : true) &&
        (field === "max" ? value > 0 : true)
      );
    });
  }

  const getColor = () => {
    if (props.status === "Run")
      return "bg-[#ED7D17] hover:bg-[#F99133] text-black";
    if (props.status === "Pause")
      return "bg-[#1150CE] text-white dark:bg-[#032062] hover:bg-[#2863D8] hover:dark:bg-[#1150CE]";
    return "bg-[#1150CE] text-white dark:bg-[#032062] hover:bg-[#2863D8] hover:dark:bg-[#1150CE]";
  };

  const changeStatus = async () => {
    if (props.status === "Run") {
      await Pause();
      return;
    } else if (props.status === "Pause") {
      await Start();
      return;
    }
    if (!isValidSimulationData(props.data)) {
      props.setData.setA(1.0);
      props.setData.setB(0.1);
      props.setData.setD(0.075);
      props.setData.setG(1.5);
      props.setData.setX(10.0);
      props.setData.setY(5.0);
      props.setData.setMax(10.0);
      props.setData.setStep(1.0);
    }
    console.log(props.data);
    
    // отправка переменных на сервер
    EventsEmit("Send", props.data);
    await Start();
    props.setSimulationData([]);
    const result = {
      data: [],
      input: [
        "Alpha: " + props.data.a,        
        "Beta: " + props.data.b,
        "Delta: " + props.data.d,
        "Gamma: " + props.data.g,
        "X: " + props.data.x,
        "Y: " + props.data.y,
        "Time: " + props.data.max,
      ]
    }
    props.setListSimulation((prev) => [...prev, result])
  };

  return (
    <button
      className={`w-[100px] h-[30px] flex items-center justify-center rounded-[3px] hover:cursor-pointer ${getColor()}`}
      onClick={changeStatus}
    >
      {getStatus()}
    </button>
  );
};

export default switchButton;
