import { useMemo } from 'react';
import gardenData from '../data/garden_data.json';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const useGarden = (currentMonth) => {
  const monthIdx = MONTHS.indexOf(currentMonth);

  const plants = useMemo(() => gardenData.plants.map(p => p.name), []);

  const plantActionsMap = useMemo(() => {
    const map = {};
    gardenData.plants.forEach(plant => {
      map[plant.name] = [...plant.tasks].sort((a, b) =>
        MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month)
      );
    });
    return map;
  }, []);

  const monthlyActions = useMemo(() => {
    const actions = [];
    gardenData.plants.forEach(plant => {
      plant.tasks.forEach(task => {
        if (task.month === currentMonth) {
          actions.push({
            plantName: plant.name,
            taskName: task.name,
            sections: task.sections
          });
        }
      });
    });
    return actions;
  }, [currentMonth]);

  const bedState = useMemo(() => {
    // Array of 10 sections, each containing an array of plants
    const sections = Array.from({ length: 10 }, () => []);

    gardenData.plants.forEach(plant => {
      let inBed = false;
      let occupiedSections = [];
      let isPlanting = false;
      let isHarvesting = false;
      let isRemoving = false;

      // Sort tasks by month index to process in order
      const sortedTasks = plantActionsMap[plant.name];

      sortedTasks.forEach(task => {
        const taskMonthIdx = MONTHS.indexOf(task.month);

        // If task happened in or before current month
        if (taskMonthIdx <= monthIdx) {
          if (task.name.toLowerCase().includes('transfer') || task.name.toLowerCase().includes('sow outside')) {
            inBed = true;
            occupiedSections = task.sections || [];
            if (taskMonthIdx === monthIdx) {
              isPlanting = true;
            }
          }
          if (task.name.toLowerCase().includes('harvest')) {
            if (taskMonthIdx === monthIdx) {
              isHarvesting = true;
            }
          }
          if (task.name.toLowerCase().includes('remove')) {
            // Special case: plant is still visible in the removal month
            if (taskMonthIdx === monthIdx) {
              isRemoving = true;
              inBed = true; // Keep it visible for the removal month
            } else {
              inBed = false;
              occupiedSections = [];
            }
          }
        }
      });

      if (inBed) {
        occupiedSections.forEach(sectionNum => {
          if (sectionNum >= 1 && sectionNum <= 10) {
            sections[sectionNum - 1].push({
              name: plant.name,
              isPlanting,
              isHarvesting,
              isRemoving
            });
          }
        });
      }
    });

    // Sort arrays in each section: removing plants first, planting plants last
    sections.forEach(sectionArray => {
      sectionArray.sort((a, b) => {
        if (a.isRemoving && !b.isRemoving) return -1;
        if (!a.isRemoving && b.isRemoving) return 1;
        if (a.isPlanting && !b.isPlanting) return 1;
        if (!a.isPlanting && b.isPlanting) return -1;
        return 0;
      });
    });

    return sections;
  }, [monthIdx, plantActionsMap]);

  const indoorPlants = useMemo(() => {
    const sownInside = [];
    const hardeningOff = [];

    gardenData.plants.forEach(plant => {
      const sortedTasks = plantActionsMap[plant.name];
      let prevailingState = null;

      // Find the most recent task that happened up to the current month
      for (const task of sortedTasks) {
        if (MONTHS.indexOf(task.month) <= monthIdx) {
          prevailingState = task.name.toLowerCase();
        }
      }

      // If the prevailing state is sown inside or harden off, add to respective list
      if (prevailingState) {
        if (prevailingState.includes('sow inside')) {
          sownInside.push(plant.name);
        } else if (prevailingState.includes('harden off')) {
          hardeningOff.push(plant.name);
        }
      }
    });

    return { sownInside, hardeningOff };
  }, [monthIdx, plantActionsMap]);

  const yearlyBedState = useMemo(() => {
    // 10 sections, each has 12 months, each cell is an array of plants
    const matrix = Array.from({ length: 10 }, () =>
      Array.from({ length: 12 }, () => [])
    );

    gardenData.plants.forEach(plant => {
      const sortedTasks = plantActionsMap[plant.name];

      // We need to track the plant's state across the year to fill the matrix
      let currentOccupiedSections = [];
      let inBed = false;

      MONTHS.forEach((monthName, mIdx) => {
        let isPlantThisMonth = false;
        let isHarvestThisMonth = false;
        let isRemoveThisMonth = false;

        // Check if any tasks happen this month
        sortedTasks.forEach(task => {
          if (MONTHS.indexOf(task.month) === mIdx) {
            if (task.name.toLowerCase().includes('transfer') || task.name.toLowerCase().includes('sow outside')) {
              inBed = true;
              currentOccupiedSections = task.sections || [];
              isPlantThisMonth = true;
            }
            if (task.name.toLowerCase().includes('harvest')) {
              isHarvestThisMonth = true;
            }
            if (task.name.toLowerCase().includes('remove')) {
              isRemoveThisMonth = true;
              inBed = true; // Still visible in removal month
            }
          }
        });

        // Apply state to sections if in bed
        if (inBed) {
          currentOccupiedSections.forEach(secNum => {
            if (secNum >= 1 && secNum <= 10) {
              matrix[secNum - 1][mIdx].push({
                name: plant.name,
                isPlanting: isPlantThisMonth,
                isHarvesting: isHarvestThisMonth,
                isRemoving: isRemoveThisMonth
              });
            }
          });
        }

        // If it was removed this month, it won't be in bed next month
        if (isRemoveThisMonth) {
          inBed = false;
          currentOccupiedSections = [];
        }
      });
    });

    // Sort arrays in each cell of the matrix
    for (let secIdx = 0; secIdx < matrix.length; secIdx++) {
      for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
        matrix[secIdx][monthIdx].sort((a, b) => {
          if (a.isRemoving && !b.isRemoving) return -1;
          if (!a.isRemoving && b.isRemoving) return 1;
          if (a.isPlanting && !b.isPlanting) return 1;
          if (!a.isPlanting && b.isPlanting) return -1;
          return 0;
        });
      }
    }

    return matrix;
  }, [plantActionsMap]);

  const yearlyPlantState = useMemo(() => {
    // Array where each item is { name: string, timeline: Array<{ state, sectionCount } | null> }
    const states = [];
    // 12-month totals: sum of bed sections used across all plants per month
    const monthlyTotals = Array(12).fill(0);

    gardenData.plants.forEach(plant => {
      const timeline = Array(12).fill(null);
      const sortedTasks = plantActionsMap[plant.name];

      let currentState = null;
      let currentSections = []; // sections being used in the bed

      MONTHS.forEach((month, mIdx) => {
        let newStateThisMonth = null;
        let isRemovedThisMonth = false;

        sortedTasks.forEach(task => {
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
            if (tName.includes('transfer') || tName.includes('sow outside')) {
              newStateThisMonth = 'bed';
              currentSections = task.sections || [];
            }
            if (tName.includes('remove')) {
              isRemovedThisMonth = true;
            }
          }
        });

        if (newStateThisMonth) {
          currentState = newStateThisMonth;
        }

        if (currentState) {
          const sectionCount = currentState === 'bed' ? currentSections.length : 0;
          timeline[mIdx] = { state: currentState, sectionCount };
          if (currentState === 'bed') {
            monthlyTotals[mIdx] += sectionCount;
          }
        } else {
          timeline[mIdx] = null;
        }

        if (isRemovedThisMonth) {
          currentState = null;
          currentSections = [];
        }
      });

      states.push({ name: plant.name, timeline });
    });

    return { rows: states, monthlyTotals };
  }, [plantActionsMap]);

  return { monthlyActions, bedState, indoorPlants, yearlyBedState, yearlyPlantState, months: MONTHS, plants, plantActionsMap };
};
