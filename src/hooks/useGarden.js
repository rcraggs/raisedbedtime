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

      // Sort tasks by month index to process in order
      const sortedTasks = plantActionsMap[plant.name];

      sortedTasks.forEach(task => {
        const taskMonthIdx = MONTHS.indexOf(task.month);

        // If task happened in or before current month
        if (taskMonthIdx <= monthIdx) {
          if (task.name.toLowerCase().includes('transfer')) {
            inBed = true;
            occupiedSections = task.sections || [];
          }
          if (task.name.toLowerCase().includes('remove')) {
            inBed = false;
            occupiedSections = [];
          }
        }
      });

      if (inBed) {
        occupiedSections.forEach(sectionNum => {
          if (sectionNum >= 1 && sectionNum <= 10) {
            sections[sectionNum - 1] = plant.name;
          }
        });
      }
    });

    return sections;
  }, [monthIdx, plantActionsMap]);

  return { monthlyActions, bedState, months: MONTHS, plants, plantActionsMap };
};
