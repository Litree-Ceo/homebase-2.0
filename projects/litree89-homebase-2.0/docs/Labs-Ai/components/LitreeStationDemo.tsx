import * as React from "react";
import { HoneycombGrid } from "./HoneycombGrid";
import styles from "./styles/LitreeStationDemo.module.css";

export default function LitreeStationDemo() {
  return (
    <div className={styles.litreeDemoContainer}>
      <HoneycombGrid
        pods={[
          {
            color1: "#000",
            color2: "#FFD700",
            color3: "#FF0000",
            children: <span className={styles.litreeDemoPod}>Black Gold Red</span>,
          },
          {
            color1: "#FFD700",
            color2: "#FF0000",
            color3: "#111",
            children: <span className={styles.litreeDemoPod}>Gold Red Black</span>,
          },
          {
            color1: "#FF0000",
            color2: "#FFD700",
            color3: "#FFF200",
            children: <span className={styles.litreeDemoPod}>Red Gold Yellow</span>,
          },
          {
            color1: "#111",
            color2: "#FFD700",
            color3: "#FFF200",
            children: <span className={styles.litreeDemoPod}>Black Gold Yellow</span>,
          },
        ]}
      />
    </div>
  );
}
