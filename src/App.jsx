import React, { useState } from 'react';
import { useGarden } from './hooks/useGarden';
import { Calendar, Sprout, ClipboardList } from 'lucide-react';
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:px-12 md:py-20 lg:px-16 min-h-screen">
      <header className="mb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-primary mb-2 flex items-center justify-center gap-4"
        >
          <Sprout size={48} className="text-primary-light" />
          Garden Planner
        </motion.h1>
        <p className="text-gray-600 font-medium">Manage your 3x1m raised bed lifecycle</p>
      </header>

      {/* View Toggle */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setViewMode('month')}
          className={`px-8 py-3 rounded-2xl font-bold transition-all ${viewMode === 'month' ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white/50 text-gray-500 hover:bg-white'}`}
        >
          By Month
        </button>
        <button
          onClick={() => setViewMode('plant')}
          className={`px-8 py-3 rounded-2xl font-bold transition-all ${viewMode === 'plant' ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white/50 text-gray-500 hover:bg-white'}`}
        >
          By Plant
        </button>
      </div>

      {/* Selectors */}
      <div className="glass-card p-4 mb-16 sticky top-4 z-10 transition-all">
        {viewMode === 'month' ? (
          <div className="month-selector">
            {months.map(month => (
              <button
                key={month}
                onClick={() => setCurrentMonth(month)}
                className={`month-tab ${currentMonth === month ? 'active' : 'hover:bg-gray-100'}`}
              >
                {month}
              </button>
            ))}
          </div>
        ) : (
          <div className="month-selector">
            {plants.map(p => (
              <button
                key={p}
                onClick={() => setSelectedPlant(p)}
                className={`month-tab ${selectedPlant === p ? 'active' : 'hover:bg-gray-100'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="main-grid">
        {/* Left Col: Contextual Visualization */}
        <div className="bed-container">
          <section className="glass-card h-full">
            {viewMode === 'month' ? (
              <>
                <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
                  <Calendar size={32} className="text-primary" />
                  Raised Bed Status - {currentMonth}
                </h2>

                <div className="bg-[#8d6e63] p-6 rounded-2xl border-8 border-[#5d4037] shadow-inner">
                  <div className="section-grid text-center">
                    {bedState.map((plant, idx) => (
                      <motion.div
                        key={`${currentMonth}-${idx}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`bed-section ${plant ? 'occupied' : ''}`}
                      >
                        <span className="leading-tight px-2">
                          {plant || `${idx + 1}`}
                        </span>
                        {plant && (
                          <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 bg-white rounded-full opacity-50"></div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 px-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Sprout size={48} className="text-primary" />
                </div>
                <h2 className="text-4xl font-bold mb-4 text-primary">{selectedPlant}</h2>
                <p className="text-gray-500 max-w-sm">
                  Complete lifecycle and scheduled tasks for this plant throughout the gardening year.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right Col: Actions (Contextual) */}
        <div className="actions-container">
          <section className="glass-card h-full">
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
              <ClipboardList size={32} className="text-secondary" />
              {viewMode === 'month' ? 'Actions' : 'Lifecycle'}
            </h2>

            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {viewMode === 'month' ? (
                  <motion.div
                    key={`month-${currentMonth}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {monthlyActions.length > 0 ? (
                      monthlyActions.map((action, idx) => (
                        <div key={idx} className="p-5 rounded-xl bg-white/50 border border-white/20 mb-3 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-xl text-primary">{action.plantName}:&nbsp;</span>
                            <span className="text-xs bg-secondary/20 text-secondary px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                              {action.taskName}
                            </span>
                          </div>
                          {action.sections && (
                            <p className="text-sm text-gray-500 font-medium">
                              Sections: {action.sections.join(', ')}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-400 italic">No actions required.</div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`plant-${selectedPlant}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {plantActionsMap[selectedPlant]?.map((task, idx) => (
                      <div key={idx} className="p-5 rounded-xl bg-white/50 border border-white/20 mb-3 hover:shadow-md transition-shadow border-l-4 border-l-secondary">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-xl text-primary">{task.month}:&nbsp;</span>
                          <span className="text-xs bg-secondary/20 text-secondary px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                            {task.name}
                          </span>
                        </div>
                        {task.sections && (
                          <p className="text-sm text-gray-500 font-medium">
                            Sections: {task.sections.join(', ')}
                          </p>
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
