import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUturnLeftIcon,
  AtSymbolIcon,
  ClockIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { SimulationData, ListSimulation } from "../../App";
import SwitchButton from "../../components/Button/switchButton";
import StopButton from "../../components/Button/stopButton";
import SimInput from "../../components/Input/SimInput";
import { useState } from "react";

type Props = {
  data: SimulationData[];
  setData: React.Dispatch<React.SetStateAction<SimulationData[]>>;
  status: string;
  setStatus: (status: string) => void;
  listSimulation: ListSimulation[];
  setListSimulation: React.Dispatch<React.SetStateAction<ListSimulation[]>>;
};

const home = (props: Props) => {
  const [a, setA] = useState<number>(1.0);
  const [b, setB] = useState<number>(0.1);
  const [d, setD] = useState<number>(0.075);
  const [g, setG] = useState<number>(1.5);
  const [x, setX] = useState<number>(10.0);
  const [y, setY] = useState<number>(5.0);
  const [max, setMax] = useState<number>(10.0);
  const [step, setStep] = useState<number>(1.0);

  const chartData = props.data.map((data) => ({
    time: data.t,
    x: data.x,
    y: data.y,
  }));

  return (
    <div className="flex flex-col select-none">
      <h1 className="font-semibold text-2xl text-center text-black dark:text-white mb-5">
        Simulation
      </h1>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 5,
          }}
          key={props.status}
        >
          <CartesianGrid strokeDasharray="2 3" />
          <XAxis
            dataKey="time"
            type="number"
            tick={false}
            domain={["0", max + ""]}
            label={{
              value: `${max} секунд`,
              position: "insideLeft",
              offset: 0,
            }}
          />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="y"
            stroke="#8884d8"
            strokeDasharray="10 5"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex space-x-[5px] justify-center">
        <button
          className={`w-[30px] h-[30px] flex items-center justify-center rounded-[3px] bg-icon-active dark:bg-icon-active dark:text-icon hover:cursor-pointer`}
          onClick={() => {
            setA(1.0);
            setB(0.1);
            setD(0.075);
            setG(1.5);
            setX(10.0);
            setY(5.0);
            setMax(10.0);
            setStep(1.0);
          }}
        >
          <ArrowUturnLeftIcon className="w-6" />
        </button>
        <StopButton status={props.status} />
        <SwitchButton
          status={props.status}
          simulationData={props.data}
          setSimulationData={props.setData}
          setListSimulation={props.setListSimulation}
          data={{ a, b, d, g, x, y, max, step }}
          setData={{ setA, setB, setD, setG, setX, setY, setMax, setStep }}
        />
      </div>
      <div className="flex justify-evenly w-auto mt-5 text-icon dark:text-icon">
        <div className="flex flex-col">
          <span className="flex items-center">
            <AtSymbolIcon className="w-4 h-4" />
            Constants
          </span>
          <SimInput text="a" value={a} onChange={setA} />
          <SimInput text="b" value={b} onChange={setB} />
          <SimInput text="d" value={d} onChange={setD} />
          <SimInput text="g" value={g} onChange={setG} />
        </div>
        <div className="flex flex-col">
          <span className="flex items-center">
            <CubeIcon className="w-4 h-4" />
            Object
          </span>
          <SimInput text="x" value={x} onChange={setX} />
          <SimInput text="y" value={y} onChange={setY} />
        </div>
        <div className="flex flex-col">
          <span className="flex items-center">
            <ClockIcon className="w-4 h-4" />
            Time
          </span>
          <SimInput text="max" value={max} onChange={setMax} />
          <SimInput text="step" value={step} onChange={setStep} />
        </div>
      </div>
    </div>
  );
};

export default home;
