import { useQuery } from "@tanstack/react-query";

const fetchProjects = async () => {
  return [
    { id: "project-1", name: "Rubenstein Law" },
    { id: "project-2", name: "XYZ Telecom" },
  ];
};

export const useProjects = () => {
  return useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
};
