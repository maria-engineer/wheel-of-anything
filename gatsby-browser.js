import React from 'react';
import { WheelProvider } from './src/context/WheelContext';

export const wrapRootElement = ({ element }) => (
  <WheelProvider>{element}</WheelProvider>
);