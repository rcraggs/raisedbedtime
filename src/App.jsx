import React, { useState } from 'react';
import { useGarden } from './hooks/useGarden';
import { Calendar, Sprout, ClipboardList, Hand, Shovel, ArrowRight, Home, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'plant'
  const [currentMonth, setCurrentMonth] = useState("March");
  const [selectedPlant, setSelectedPlant] = useState("");

  const { monthlyActions, bedState, indoorPlants, yearlyBedState, yearlyPlantState, months, plants, plantActionsMap } = useGarden(currentMonth);

  // Initialize selected plant if empty
  if (!selectedPlant && plants && plants.length > 0) {
    setSelectedPlant(plants[0]);
  }

  // Calculate active months (months with at least one plant in the bed)
  const activeMonthIndices = months.map((_, mIdx) => mIdx).filter(mIdx => {
    return yearlyBedState.some(row => row[mIdx].length > 0);
  });

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
          <button
            onClick={() => setViewMode('yearly')}
            className={`px-10 py-3.5 rounded-[1.75rem] font-bold transition-all duration-500 text-sm ${viewMode === 'yearly'
              ? 'bg-forest-950 text-white shadow-xl shadow-forest-950/20 active:scale-95'
              : 'text-forest-950/60 hover:text-forest-950 hover:bg-white/50'
              }`}
          >
            Yearly Overview
          </button>
        </div>
      </div>

      {/* Selectors */}
      {/* Selectors */}
      {viewMode !== 'yearly' && (
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
      )}

      {viewMode === 'yearly' ? (
        <div className="w-full">
          <div className="bg-white/40 backdrop-blur-md rounded-[3rem] p-8 border border-white/60 shadow-lg overflow-x-auto w-full">
            <h3 className="text-3xl font-bold text-forest-950 mb-8 flex items-center gap-3">
              <Calendar size={28} className="text-sage-600" />
              Yearly Bed Overview
            </h3>
            <div className="min-w-[800px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left font-bold text-forest-950/60 sticky left-0 bg-white/80 backdrop-blur-md z-10 w-24">Section</th>
                    {activeMonthIndices.map(mIdx => (
                      <th key={months[mIdx]} className="p-3 text-center font-bold text-forest-950 border-b border-forest-950/10">
                        {months[mIdx].substring(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {yearlyBedState.map((row, rowIdx) => (
                    <tr key={`row-${rowIdx}`} className="border-b border-forest-950/5 hover:bg-white/30 transition-colors">
                      <td className="p-3 font-bold text-forest-950/80 sticky left-0 bg-white/80 backdrop-blur-md z-10 w-24">
                        #{rowIdx + 1}
                      </td>
                      {activeMonthIndices.map(mIdx => {
                        const cellArr = row[mIdx];
                        const isOccupied = cellArr.length > 0;
                        const primaryPlant = isOccupied ? cellArr[cellArr.length - 1] : null;

                        return (
                          <td key={`cell-${rowIdx}-${mIdx}`} className="p-2 text-center align-middle">
                            {isOccupied ? (
                              <div
                                className={`text-xs font-bold px-2 py-1.5 rounded-lg flex flex-col items-center justify-center gap-0.5 min-h-[50px] transition-all hover:scale-110 cursor-pointer ${primaryPlant.isPlanting ? 'bg-sage-400 text-white shadow-md border border-white/40' :
                                  primaryPlant.isHarvesting ? 'bg-sage-800 text-white border border-forest-950/40' :
                                    primaryPlant.isRemoving ? 'bg-sage-900 text-white border border-forest-950/60 shadow-lg' :
                                      'bg-sage-600 text-white border border-forest-950/20 shadow-inner'
                                  }`}
                                onClick={() => navigateToPlant(primaryPlant.name)}
                                title={cellArr.map(p => p.name).join(' -> ')}
                              >
                                {cellArr.map((p, pIdx) => (
                                  <React.Fragment key={pIdx}>
                                    {pIdx > 0 && <div className="text-white/60 text-[10px] my-0.5 leading-none">↓</div>}
                                    <div className="flex flex-col items-center">
                                      <div className="flex items-center gap-1 mb-0.5">
                                        {p.isPlanting && <Sprout size={12} className={pIdx === cellArr.length - 1 ? "animate-bounce" : ""} />}
                                        {p.isHarvesting && <Hand size={12} />}
                                        {p.isRemoving && <Shovel size={12} />}
                                      </div>
                                      <span className="truncate max-w-[55px] block leading-none text-[10px]">
                                        {p.name.split(' ')[0]}
                                      </span>
                                    </div>
                                  </React.Fragment>
                                ))}
                              </div>
                            ) : (
                              <div className="h-full w-full min-h-[50px] rounded-lg bg-stone-200/50 border border-stone-300/30"></div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-md rounded-[3rem] p-8 border border-white/60 shadow-lg overflow-x-auto w-full mt-10">
            <h3 className="text-3xl font-bold text-forest-950 mb-8 flex items-center gap-3">
              <Sprout size={28} className="text-sage-600" />
              Plant Timeline
            </h3>
            <div className="min-w-[800px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left font-bold text-forest-950/60 sticky left-0 bg-white/80 backdrop-blur-md z-10 w-40 border-b border-forest-950/10">Cultivar</th>
                    {months.map((m, mIdx) => (
                      <th key={`pt-${m}`} className="p-3 text-center border-b border-forest-950/10">
                        <div className="font-bold text-forest-950/80 text-sm">{m.substring(0, 3)}</div>
                        <div className={`text-xs font-semibold mt-0.5 ${yearlyPlantState.monthlyTotals[mIdx] > 0 ? 'text-sage-600' : 'text-forest-950/20'}`}>
                          {yearlyPlantState.monthlyTotals[mIdx] > 0 ? `${yearlyPlantState.monthlyTotals[mIdx]} sec` : '—'}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {yearlyPlantState.rows.map((plantRow, pIdx) => (
                    <tr key={`prow-${pIdx}`} className="border-b border-forest-950/5 hover:bg-white/30 transition-colors group">
                      <td className="p-3 font-bold text-forest-950/80 sticky left-0 bg-white/80 backdrop-blur-md z-10 w-40 group-hover:bg-white/90 cursor-pointer transition-colors"
                        onClick={() => navigateToPlant(plantRow.name)}>
                        {plantRow.name}
                      </td>
                      {plantRow.timeline.map((cell, mIdx) => (
                        <td key={`pcell-${pIdx}-${mIdx}`} className="p-1 text-center align-middle">
                          {cell && (
                            <div
                              className={`h-8 rounded-md w-full transition-all flex items-center justify-center text-xs font-bold ${cell.state === 'indoor' ? 'bg-amber-300 text-amber-900 shadow-inner border border-amber-400/50' :
                                  cell.state === 'hardening' ? 'bg-sky-300 text-sky-900 shadow-inner border border-sky-400/50' :
                                    'bg-sage-500 text-white shadow-md border border-sage-600/50'
                                }`}
                              title={`${plantRow.name} in ${months[mIdx]}: ${cell.state === 'indoor' ? 'Sown Inside' :
                                  cell.state === 'hardening' ? 'Hardening Off' :
                                    `In Bed (${cell.sectionCount} section${cell.sectionCount !== 1 ? 's' : ''})`
                                }`}
                            >
                              {cell.state === 'bed' && cell.sectionCount > 0 && cell.sectionCount}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-8 flex items-center gap-6 justify-center text-xs font-bold text-forest-950/60 uppercase tracking-widest">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-300 border border-amber-400"></span> Indoor</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-sky-300 border border-sky-400"></span> Hardening</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-sage-500 border border-sage-600"></span> In Bed</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
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
                      {bedState.map((sectionArr, idx) => {
                        const isOccupied = sectionArr.length > 0;
                        const primaryPlant = isOccupied ? sectionArr[sectionArr.length - 1] : null;

                        return (
                          <motion.div
                            key={`${currentMonth}-${idx}`}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: idx * 0.04 }}
                            onClick={() => primaryPlant && navigateToPlant(primaryPlant.name)}
                            className={`bed-section h-auto min-h-[3.5rem] py-2 cursor-pointer group will-change-transform flex flex-col justify-center ${!isOccupied ? ''
                              : primaryPlant.isPlanting ? 'planting'
                                : primaryPlant.isHarvesting ? 'harvesting'
                                  : primaryPlant.isRemoving ? 'removing'
                                    : 'occupied'
                              }`}
                          >
                            <div className="flex flex-wrap items-center justify-center gap-y-1 gap-x-2 px-2 w-full">
                              {!isOccupied && (
                                <span className="text-sm tracking-wide font-bold text-forest-950/40">
                                  Section {idx + 1}
                                </span>
                              )}

                              {isOccupied && sectionArr.map((p, pIdx) => (
                                <React.Fragment key={pIdx}>
                                  {pIdx > 0 && <span className="text-white/50 text-xs font-bold">/</span>}
                                  <div className="flex items-center gap-1.5">
                                    {p.isPlanting && <Sprout size={16} className={`text-white ${pIdx === sectionArr.length - 1 ? 'animate-bounce' : ''}`} />}
                                    {p.isHarvesting && <Hand size={16} className="text-white" />}
                                    {p.isRemoving && <Shovel size={16} className="text-white" />}
                                    <span className="text-sm tracking-wide font-bold text-white truncate max-w-[80px]">
                                      {p.name.split(' ')[0]}
                                    </span>
                                  </div>
                                </React.Fragment>
                              ))}
                              {isOccupied && <ArrowRight size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity ml-1" />}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Off-bed Statuses */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Sown Inside */}
                    <div className="bg-amber-50/50 border border-amber-200/50 rounded-3xl p-6 shadow-sm">
                      <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-4">
                        <Home size={20} className="text-amber-500" />
                        Sown Inside
                      </h3>
                      {indoorPlants.sownInside.length > 0 ? (
                        <ul className="space-y-2">
                          {indoorPlants.sownInside.map(plant => (
                            <li
                              key={plant}
                              onClick={() => navigateToPlant(plant)}
                              className="bg-white rounded-xl py-2 px-4 shadow-sm text-sm font-semibold text-amber-950 cursor-pointer hover:bg-amber-100 hover:scale-105 transition-all flex items-center justify-between group"
                            >
                              {plant}
                              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-amber-600 transition-opacity" />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-amber-900/40 italic">None</p>
                      )}
                    </div>

                    {/* Hardening Off */}
                    <div className="bg-sky-50/50 border border-sky-200/50 rounded-3xl p-6 shadow-sm">
                      <h3 className="font-bold text-sky-900 flex items-center gap-2 mb-4">
                        <Wind size={20} className="text-sky-500" />
                        Hardening Off
                      </h3>
                      {indoorPlants.hardeningOff.length > 0 ? (
                        <ul className="space-y-2">
                          {indoorPlants.hardeningOff.map(plant => (
                            <li
                              key={plant}
                              onClick={() => navigateToPlant(plant)}
                              className="bg-white rounded-xl py-2 px-4 shadow-sm text-sm font-semibold text-sky-950 cursor-pointer hover:bg-sky-100 hover:scale-105 transition-all flex items-center justify-between group"
                            >
                              {plant}
                              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-sky-600 transition-opacity" />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-sky-900/40 italic">None</p>
                      )}
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
      )}
    </div>
  );
}

export default App;
