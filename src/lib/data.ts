// src/lib/data.ts
import mockData from "@/data/projects.json";

export const getProjects = () => mockData.projects;

export const getProjectById = (id: number) => {
  return mockData.projects.find((p) => p.id === id);
};

export const getProjectInteractions = (id: number) => {
  const project = getProjectById(id);

  return project?.interactions || [];
};
