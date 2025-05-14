type Props = {}

const docs = (props: Props) => {
  return (
    <div className="flex flex-col gap-8 select-none text-black dark:text-white overflow-y-auto" style={{
        maxHeight: "calc(100vh - 125px)",
        scrollbarWidth: "none",
        }}>
      <h1 className="font-semibold text-2xl text-center mb-5">
        Help for use
      </h1>
      <nav aria-label="Основная навигация">
        <ul className="list-decimal ml-4 flex flex-col gap-1">
          <li><a href="#introduction">Introduction</a></li>
          <li><a href="#simulation-parameters">Simulation parameters</a></li>
          <li><a href="#simulation-control">Simulation control</a></li>
          <li><a href="#history">History</a></li>
          <li><a href="#support">Support</a></li>
        </ul>
      </nav>
      <section id="introduction" className="flex flex-col gap-4">
        <h2 className="font-semibold text-[20px]">Introduction</h2>
        <p>The <strong>Oscillation RK4</strong> application is designed to calculate and visualize 
          the oscillations of a physical system using the 4th-order Runge–Kutta method. 
          It allows you to enter the parameters of the problem, run the simulation, and observe 
          the result on a graph or in a table.</p>
      </section>
      <section id="simulation-parameters" className="flex flex-col gap-4">
        <h2 className="font-semibold text-[20px]">Simulation parameters</h2>
        <ul className="list-decimal ml-4 flex flex-col gap-1">
          <li>On the "Home" page, enter the <strong>initial conditions</strong>: initial displacement, 
            initial velocity, damping coefficient, etc.</li>
          <li>Set the <strong>simulation time</strong> and <strong>time step</strong> (if provided).</li>
          <li>Click the blue <strong>"Start"</strong> button to begin the calculation.</li>
        </ul>
      </section>
      <section id="simulation-control" className="flex flex-col gap-4">
        <h2 className="font-semibold text-[20px]">Simulation control</h2>
        <ul className="list-disc ml-4 flex flex-col gap-1">
          <li>The <strong>"Pause"</strong> button pauses the calculation (can be continued later).</li>
          <li>The <strong>"Stop"</strong> button completely stops the simulation.</li>
          <li>The status indicator (green/red "traffic light") on the statusbar shows whether the 
            calculation is in progress.</li>
          <li>The graph or numerical data is updated after launch.</li>
        </ul>
      </section>
      <section id="history" className="flex flex-col gap-4">
        <h2 className="font-semibold text-[20px]">History</h2>
        <p>The <strong>History</strong> section shows information about previous simulations (entered 
          parameters and key results). Here you can view or compare multiple runs without re-entering data.</p>
      </section>
      <section id="support" className="flex flex-col gap-4">
        <h2 className="font-semibold text-[20px]">Support</h2>
        <p>The <strong>History</strong> section shows information about previous simulations (entered 
          parameters and key results). Here you can view or compare multiple runs without re-entering data.</p>
      </section>
    </div>
  )
}

export default docs