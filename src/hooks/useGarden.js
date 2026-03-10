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
    // Array of 10 sections
    const sections = Array(10).fill(null);

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
            sections[sectionNum - 1] = {
              name: plant.name,
              isPlanting,
              isHarvesting,
              isRemoving
            };
          }
        });
      }
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

  return { monthlyActions, bedState, indoorPlants, months: MONTHS, plants, plantActionsMap };
};
