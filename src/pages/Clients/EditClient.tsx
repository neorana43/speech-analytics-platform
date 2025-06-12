import { useParams } from "react-router-dom";

import ClientForm from "./ClientForm";

const EditClient = () => {
  const { id } = useParams();

  return <ClientForm clientId={id ? parseInt(id) : undefined} mode="edit" />;
};

export default EditClient;
