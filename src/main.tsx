import { createRoot } from "react-dom/client";
import Clarity from "@microsoft/clarity";
import App from "./App.tsx";
import "./index.css";

// Initialize Microsoft Clarity
Clarity.init("xemklukqoy");

createRoot(document.getElementById("root")!).render(<App />);
