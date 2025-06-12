import { useParams } from "react-router-dom";

import UserForm from "./UserForm";

const EditUser = () => {
  const { id } = useParams();

  return <UserForm mode="edit" userId={id ? parseInt(id) : undefined} />;
};

export default EditUser;
