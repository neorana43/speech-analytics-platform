import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import styles from "./Welcome.module.scss";
import Topbar from "@/components/Topbar";

const Welcome = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.welcomeContainer}>
      <Topbar />

      <div className="welcome-content">
        <h2>Your Speech Analytics Platform</h2>
        <div className="cta-buttons">
          <Button onClick={() => navigate("/transcription-training")}>
            Transcription Training
          </Button>
          <Button onClick={() => navigate("/prompt-designer")}>
            Prompt Designer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
