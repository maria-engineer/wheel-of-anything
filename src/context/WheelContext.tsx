import React, { createContext, useState } from "react";

// Define the Task type
export type Task = {
  name: string;
  status: "DONE" | "IN_PROGRESS" | "PLANNED" | "BLOCKED";
};

// Define the Slice type
type Slice = {
  name: string;
  currentRating?: number;
  desiredRating?: number;
  reasonForCurrentRating?: string;
  whatToChange?: string;
  tasks: Task[]; // Array of Task
};

// Define the Wheel type
type Wheel = {
  name: string; // Wheel of _____
  timestamp: number;
  slice1?: Slice; // Array of 8 Slice objects
  slice2?: Slice;
  slice3?: Slice;
  slice4?: Slice;
  slice5?: Slice;
  slice6?: Slice;
  slice7?: Slice;
  slice8?: Slice;
};

export type AppContext = Map<number, Wheel>;
// Create the context
export const WheelContext = createContext<AppContext>(new Map());

const getStoredWheels = (): AppContext => {
  const wheelsData = localStorage.getItem("wheels");
  return wheelsData ? JSON.parse(wheelsData) : new Map();
};

const storeWheels = (wheels: AppContext): void => {
  localStorage.setItem("wheels", JSON.stringify(wheels));
};

// Define the provider
export const WheelProvider = ({
  children,
}: {
  children: string | JSX.Element | JSX.Element[];
}) => {
  // Set up the state you want to manage globally (e.g., user ratings)
  const [wheels, setWheels] = useState<AppContext>(getStoredWheels());
  const [currentWheel, setCurrentWheel] = useState<Wheel | null>(null);

  // You can define any additional state management or utility functions
  const updateWheel = (category, value) => {
    wheels.set(currentWheel!.timestamp, currentWheel);
    setWheels(wheels);
    storeWheels(wheels);
  };

  return (
    <WheelContext.Provider value={{ ratings, updateRating }}>
      {children}
    </WheelContext.Provider>
  );
};
