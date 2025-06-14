import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";

import styles from "./Welcome.module.scss";

interface Client {
  id: number;
  name: string;
}

const Welcome = () => {
  const navigate = useNavigate();

  // const { token } = useAuth();

  // useEffect(() => {
  //   if (token) testAllApis(token);
  // }, [token]);

  const handleTranscriptionClick = () => {
    const selectedClientStr = localStorage.getItem("selectedClient");

    if (selectedClientStr) {
      const selectedClient: Client = JSON.parse(selectedClientStr);

      navigate(`/transcription/${selectedClient.id}`);
    }
  };

  return (
    <div className={styles.welcomeContainer}>
      <div className="flex flex-col  m-auto max-w-[25rem] text-center gap-16">
        <h1 className="font-roboto text-midnight text-4xl font-bold">
          Your Speech Analytics Platform
        </h1>
        <div className="flex gap-8 lg:flex-row flex-col items-center justify-center">
          <Button
            className="px-7 py-3 text-sm font-medium font-roboto w-full"
            color="primary"
            radius="full"
            onPress={handleTranscriptionClick}
          >
            Transcription Training
          </Button>
          <Button
            className="px-7 py-3 text-sm font-medium font-roboto w-full"
            color="primary"
            radius="full"
            onPress={() => navigate("/prompt-designer")}
          >
            Prompt Designer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
