import { useEffect, useState } from "react";
import { EventsOn } from "../wailsjs/runtime/runtime";
import { GetStatus } from "../wailsjs/go/main/App";

import Sidebar from "./components/Sidebar/sidebar";
import Statusbar from "./components/Statusbar/statusbar";
import Content from "./components/Content/content";
import Home from "./pages/Home/home";
import History from "./pages/History/history";
import Docs from "./pages/Docs/docs";

export type SimulationData = {
  t: number;
  x: number;
  y: number;
};

export type ListSimulation = {
  data: SimulationData[],
  input: string[],
};

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [status, setStatus] = useState("Stop");
  const [simulationData, setSimulationData] = useState<SimulationData[]>([]);
  const [listSimulation, setListSimulation] = useState<ListSimulation[]>([]);

  const getStatus = async () => {
    try {
      await GetStatus();
    } catch (error) {
      console.error("Error getting status:", error);
    }
  };

  EventsOn("status", (newStatus: { status: string }) => {
    setStatus(newStatus.status);
  });
  EventsOn("update", (data: SimulationData) => {
    setSimulationData(prev => [...prev, data]);
    setListSimulation(prev => {
      const updatedList = [...prev];
      if (updatedList.length > 0) {
        updatedList[updatedList.length - 1].data = [...updatedList[updatedList.length - 1].data, data];
      }
      return updatedList;
    })
  });

  useEffect(() => {
    getStatus();

    return () => {}; // Очистка подписок
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-primary dark:bg-primary">
      <div className="flex-1 flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <Content>
          {activeTab === "home" ? (
            <Home
              data={simulationData}
              setData={setSimulationData}
              status={status}
              setStatus={setStatus}
              listSimulation={listSimulation}
              setListSimulation={setListSimulation}
            />
          ) : activeTab === "history" ? (
            <History status={status} listSimulation={listSimulation} setListSimulation={setListSimulation} />
          ) : (
            <Docs />
          )}
        </Content>
      </div>
      <Statusbar status={status} />
    </div>
  );
}

export default App;
