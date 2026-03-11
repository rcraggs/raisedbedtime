import { useMemo } from 'react';
import actionMetaData from '../data/action_metadata.json';
import gardenData from '../data/garden_data.json';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const useGarden = (currentMonth) => {
  const monthIdx = MONTHS.indexOf(currentMonth);

  // 1. Action Metadata Map
  const actionMetaMap = useMemo(() => {
    const map = {};
    actionMetaData.actions.forEach((a) => {
      map[a.name] = a;
    });
    return map;
  }, []);

  const plants = useMemo(() => gardenData.plants.map((p) => p.name), []);

  // 2. Map of plant tasks sorted by month
  const plantActionsMap = useMemo(() => {
    const map = {};
    gardenData.plants.forEach((plant) => {
      map[plant.name] = [...plant.tasks].sort(
        (a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month)
      );
    });
    return map;
  }, []);

  // 3. Current month's specific tasks
  const monthlyActions = useMemo(() => {
    const actions = [];
    gardenData.plants.forEach((plant) => {
      plant.tasks.forEach((task) => {
        if (task.month === currentMonth) {
          actions.push({
            plantName: plant.name,
            taskName: task.name,
            sections: task.sections,
          });
        }
      });
    });
    return actions;
  }, [currentMonth]);

  // 4. Current Bed State (Grid View)
  const bedState = useMemo(() => {
    const sections = Array.from({ length: 10 }, () => []);
    gardenData.plants.forEach((plant) => {
      let inBed = false;
      let occupiedSections = [];
      let isPlanting = false;
      let isHarvesting = false;
      let isRemoving = false;

      const sortedTasks = plantActionsMap[plant.name];
      sortedTasks.forEach((task) => {
        const taskMonthIdx = MONTHS.indexOf(task.month);
        if (taskMonthIdx <= monthIdx) {
          const meta = actionMetaMap[task.name];
          if (meta?.addsToBed) {
            inBed = true;
            occupiedSections = task.sections || [];
            if (taskMonthIdx === monthIdx) isPlanting = true;
          }
          if (task.name.toLowerCase().includes('harvest')) {
            if (taskMonthIdx === monthIdx) isHarvesting = true;
          }
          if (meta?.removesFromBed) {
            if (taskMonthIdx === monthIdx) {
              isRemoving = true;
              inBed = true; 
            } else {
              inBed = false;
              occupiedSections = [];
            }
          }
        }
      });

      if (inBed) {
        occupiedSections.forEach((sectionNum) => {
          if (sectionNum >= 1 && sectionNum <= 10) {
            sections[sectionNum - 1].push({
              name: plant.name,
              isPlanting,
              isHarvesting,
              isRemoving,
            });
          }
        });
      }
    });

    sections.forEach((sectionArray) => {
      sectionArray.sort((a, b) => {
        if (a.isRemoving && !b.isRemoving) return -1;
        if (!a.isRemoving && b.isRemoving) return 1;
        if (a.isPlanting && !b.isPlanting) return 1;
        if (!a.isPlanting && b.isPlanting) return -1;
        return 0;
      });
    });
    return sections;
  }, [monthIdx, plantActionsMap, actionMetaMap]);

  // 5. Indoor/Hardening State
  const indoorPlants = useMemo(() => {
    const sownInside = [];
    const hardeningOff = [];
    gardenData.plants.forEach((plant) => {
      const sortedTasks = plantActionsMap[plant.name];
      let prevailingState = null;
      for (const task of sortedTasks) {
        if (MONTHS.indexOf(task.month) <= monthIdx) {
          prevailingState = task.name.toLowerCase();
        }
      }
      if (prevailingState) {
        if (prevailingState.includes('sow inside')) sownInside.push(plant.name);
        else if (prevailingState.includes('harden off')) hardeningOff.push(plant.name);
      }
    });
    return { sownInside, hardeningOff };
  }, [monthIdx, plantActionsMap]);

  // 6. Yearly Bed Matrix (Section x Month)
  const yearlyBedState = useMemo(() => {
    const matrix = Array.from({ length: 10 }, () =>
      Array.from({ length: 12 }, () => [])
    );
    gardenData.plants.forEach((plant) => {
      const sortedTasks = plantActionsMap[plant.name];
      let inBed = false;
      let currentOccupiedSections = [];
      MONTHS.forEach((_, mIdx) => {
        let isPlantThisMonth = false;
        let isHarvestThisMonth = false;
        let isRemoveThisMonth = false;

        sortedTasks.forEach((task) => {
          if (MONTHS.indexOf(task.month) === mIdx) {
            const meta = actionMetaMap[task.name];
            if (meta?.addsToBed) {
              inBed = true;
              currentOccupiedSections = task.sections || [];
              isPlantThisMonth = true;
            }
            if (task.name.toLowerCase().includes('harvest')) {
              isHarvestThisMonth = true;
            }
            if (meta?.removesFromBed) {
              isRemoveThisMonth = true;
              inBed = true;
            }
          }
        });

        if (inBed) {
          currentOccupiedSections.forEach((secNum) => {
            if (secNum >= 1 && secNum <= 10) {
              matrix[secNum - 1][mIdx].push({
                name: plant.name,
                isPlanting: isPlantThisMonth,
                isHarvesting: isHarvestThisMonth,
                isRemoving: isRemoveThisMonth,
              });
            }
          });
        }

        if (isRemoveThisMonth) {
          inBed = false;
          currentOccupiedSections = [];
        }
      });
    });

    for (let secIdx = 0; secIdx < matrix.length; secIdx++) {
      for (let m = 0; m < 12; m++) {
        matrix[secIdx][m].sort((a, b) => {
          if (a.isRemoving && !b.isRemoving) return -1;
          if (!a.isRemoving && b.isRemoving) return 1;
          if (a.isPlanting && !b.isPlanting) return 1;
          if (!a.isPlanting && b.isPlanting) return -1;
          return 0;
        });
      }
    }
    return matrix;
  }, [plantActionsMap, actionMetaMap]);

  // 7. Yearly Plant Timeline
  const yearlyPlantState = useMemo(() => {
    const states = [];
    const monthlyTotals = Array(12).fill(0);

    gardenData.plants.forEach((plant) => {
      const timeline = Array(12).fill(null);
      const sortedTasks = plantActionsMap[plant.name];
      let currentState = null;
      let currentSections = [];

      MONTHS.forEach((_, mIdx) => {
        let newStateThisMonth = null;
        let isRemovedThisMonth = false;

        sortedTasks.forEach((task) => {
          if (MONTHS.indexOf(task.month) === mIdx) {
            const tName = task.name.toLowerCase();
            if (tName.includes('sow inside')) {
              newStateThisMonth = 'indoor';
              currentSections = [];
            }
            if (tName.includes('harden off')) {
              newStateThisMonth = 'hardening';
              currentSections = [];
            }
            const meta = actionMetaMap[task.name];
            if (meta?.addsToBed) {
              newStateThisMonth = 'bed';
              currentSections = task.sections || [];
            }
            if (meta?.removesFromBed) {
              isRemovedThisMonth = true;
            }
          }
        });

        if (newStateThisMonth) currentState = newStateThisMonth;
        if (currentState) {
          const sectionCount = currentState === 'bed' ? currentSections.length : 0;
          timeline[mIdx] = { state: currentState, sectionCount };
          if (currentState === 'bed') monthlyTotals[mIdx] += sectionCount;
        }

        if (isRemovedThisMonth) {
          currentState = null;
          currentSections = [];
        }
      });
      states.push({ name: plant.name, timeline });
    });
    return { rows: states, monthlyTotals };
  }, [plantActionsMap, actionMetaMap]);

  return {
    monthlyActions,
    bedState,
    indoorPlants,
    yearlyBedState,
    yearlyPlantState,
    months: MONTHS,
    plants,
    plantActionsMap,
  };
};