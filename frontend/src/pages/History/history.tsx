import { ListSimulation } from "@/App";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  status: string;
  listSimulation: ListSimulation[];
  setListSimulation: React.Dispatch<React.SetStateAction<ListSimulation[]>>;
};

const history = (props: Props) => {
  return (
    <div className="flex flex-col select-none">
      <h1 className="font-semibold text-2xl text-center text-black dark:text-white mb-5">
        History
      </h1>
      <div className="flex flex-col select-none overflow-y-auto" style={{
        maxHeight: "calc(100vh - 125px)",
        scrollbarWidth: "none",
        }}>
      {props.listSimulation.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-screen mt-[-150px] text-[16px] text-black dark:text-white m-auto">
          <InformationCircleIcon className="w-8" />
          Oops. There's nothing here yet.
        </div>
      ) : (
        props.listSimulation.slice().reverse().map((simulation, index) => {
          return (
            <div className="flex flex-col text-center select-none h-[175px] min-h-[175px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={simulation.data}
                  margin={{
                    top: 5,
                    right: 0,
                    left: -30,
                    bottom: 5,
                  }}
                  key={index}
                >
                  <XAxis
                    dataKey="t"
                    type="number"
                    tick={false}
                    domain={["0", simulation.input.length-1 + ""]}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="stepAfter"
                    dataKey="y"
                    stroke="#8884d8"
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-[-20px] mb-5 flex justify-around">
                <span className="text-black dark:text-white font-semibold">{props.listSimulation.length - index}.</span>
                { simulation.input.map((item) => {
                    return <span className="text-black dark:text-white">{item}</span>
                  })}
              </div>
              <hr className="border-t border-gray-300 dark:border-gray-600 mb-4 mt-[-10px]" />
            </div>
          );
        })
      )}
      </div>
    </div>
  );
};

export default history;
