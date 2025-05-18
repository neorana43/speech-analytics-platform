import { useParams } from "react-router-dom";

const TranscriptionProject = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="page-title ">Project ID: {id}</h1>
      {/* Render project-specific data here */}
    </div>
  );
};

export default TranscriptionProject;
