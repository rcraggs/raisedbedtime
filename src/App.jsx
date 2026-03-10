import React, { useState } from 'react';
import { useGarden } from './hooks/useGarden';
import { Calendar, Sprout, ClipboardList, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'plant'
  const [currentMonth, setCurrentMonth] = useState("March");
  const [selectedPlant, setSelectedPlant] = useState("");

  const { monthlyActions, bedState, months, plants, plantActionsMap } = useGarden(currentMonth);

  // Initialize selected plant if empty
  if (!selectedPlant && plants && plants.length > 0) {
    setSelectedPlant(plants[0]);
  }

  const navigateToPlant = (plantName) => {
    setSelectedPlant(plantName);
    setViewMode('plant');
  };

  const navigateToMonth = (monthName) => {
    setCurrentMonth(monthName);
    setViewMode('month');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:px-12 md:py-20 lg:px-16 min-h-screen font-inter">
      {/* View Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-white/40 backdrop-blur-md border border-white/40 p-1.5 rounded-[2rem] flex gap-2 shadow-sm">
          <button
            onClick={() => setViewMode('month')}
            className={`px-10 py-3.5 rounded-[1.75rem] font-bold transition-all duration-500 text-sm ${viewMode === 'month'
              ? 'bg-forest-950 text-white shadow-xl shadow-forest-950/20 active:scale-95'
              : 'text-forest-950/60 hover:text-forest-950 hover:bg-white/50'
              }`}
          >
            Temporal Flow
          </button>
          <button
            onClick={() => setViewMode('plant')}
            className={`px-10 py-3.5 rounded-[1.75rem] font-bold transition-all duration-500 text-sm ${viewMode === 'plant'
              ? 'bg-forest-950 text-white shadow-xl shadow-forest-950/20 active:scale-95'
              : 'text-forest-950/60 hover:text-forest-950 hover:bg-white/50'
              }`}
          >
            Botanical View
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="glass-card mb-16 sticky top-6 z-20 bg-white/60">
        <div className="month-selector">
          {viewMode === 'month' ? (
            months.map(month => (
              <button
                key={month}
                onClick={() => setCurrentMonth(month)}
                className={`month-tab ${currentMonth === month ? 'active' : ''}`}
              >
                {month}
              </button>
            ))
          ) : (
            plants.map(p => (
              <button
                key={p}
                onClick={() => setSelectedPlant(p)}
                className={`month-tab ${selectedPlant === p ? 'active' : ''}`}
              >
                {p}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Col: Visualization */}
        <div className="lg:col-span-7 h-full">
          <section className="glass-card p-10 h-full border-t-white/60 bg-white/50">
            {viewMode === 'month' ? (
              <>
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-4xl font-bold flex items-center gap-4 text-forest-950">
                    <Calendar size={36} className="text-sage-600" />
                    {currentMonth}
                  </h2>
                  <div className="px-5 py-2 bg-sage-100/50 rounded-full text-sage-800 text-sm font-bold border border-sage-200">
                    Bed Occupancy
                  </div>
                </div>

                <div className="bg-gray-200 p-8 rounded-[3rem] border-[12px] border-gray-300 shadow-2xl relative">
                  <div className="grid grid-cols-1 gap-4 w-full max-w-[240px] mx-auto">
                    {bedState.map((section, idx) => (
                      <motion.div
                        key={`${currentMonth}-${idx}`}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: idx * 0.04 }}
                        onClick={() => section && navigateToPlant(section.name)}
                        className={`bed-section h-14 cursor-pointer group will-change-transform ${section
                          ? section.isPlanting
                            ? 'planting'
                            : section.isHarvesting
                              ? 'harvesting'
                              : 'occupied'
                          : ''
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          {section?.isPlanting && <Sprout size={16} className="text-white animate-bounce" />}
                          {section?.isHarvesting && <Check size={16} className="text-white" />}
                          <span className="text-sm tracking-wide font-bold">
                            {section?.name || `Section ${idx + 1}`}
                          </span>
                          {section && <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-32 h-32 bg-sage-100 rounded-full flex items-center justify-center mb-8 border border-white/60"
                >
                  <Sprout size={64} className="text-sage-600" />
                </motion.div>
                <h2 className="text-5xl font-bold mb-6 text-forest-950 underline decoration-sage-300 underline-offset-8 transition-all">
                  {selectedPlant}
                </h2>
                <p className="text-forest-950/50 max-w-md text-lg leading-relaxed">
                  Scheduled lifecycle and maintenance events for this cultivar across the seasonal timeline.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right Col: Timeline/Timeline */}
        <div className="lg:col-span-5 h-full">
          <section className="glass-card p-10 h-full border-t-white/60 bg-white/50">
            <h2 className="text-4xl font-bold mb-12 flex items-center gap-4 text-forest-950">
              <ClipboardList size={36} className="text-terracotta-500" />
              {viewMode === 'month' ? 'Tasks' : 'Lifecycle'}
            </h2>

            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {viewMode === 'month' ? (
                  <motion.div
                    key={`month-${currentMonth}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid gap-4"
                  >
                    {monthlyActions.length > 0 ? (
                      monthlyActions.map((action, idx) => (
                        <div key={idx} className="group p-6 rounded-3xl bg-white/40 border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                          <div className="flex justify-between items-start mb-3">
                            <span className="font-bold text-xl text-forest-950">{action.plantName}:</span>
                            <span className="text-[10px] bg-terracotta-500/10 text-terracotta-500 px-3 py-1.5 rounded-full font-black uppercase tracking-[0.1em] border border-terracotta-500/20">
                              {action.taskName}
                            </span>
                          </div>
                          {action.sections && (
                            <div className="flex items-center gap-2 text-forest-950/40 text-xs font-bold uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-sage-400"></span>
                              Grid Areas: {action.sections.join(', ')}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 text-forest-950/30 font-medium italic">
                        Nature is dormant. No actions required.
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`plant-${selectedPlant}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid gap-4"
                  >
                    {plantActionsMap[selectedPlant]?.map((task, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigateToMonth(task.month)}
                        className="p-6 rounded-3xl bg-white/40 border border-white/60 shadow-sm border-l-[6px] border-l-terracotta-500 transition-all hover:-translate-y-1 cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xl text-forest-950">{task.month}:</span>
                            <ArrowRight size={16} className="text-terracotta-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-[10px] bg-forest-950/10 text-forest-950 px-3 py-1.5 rounded-full font-black uppercase tracking-[0.1em] border border-forest-950/20">
                            {task.name}
                          </span>
                        </div>
                        {task.sections && (
                          <div className="flex items-center gap-2 text-forest-950/40 text-xs font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-forest-950/40"></span>
                            Target Grid: {task.sections.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
