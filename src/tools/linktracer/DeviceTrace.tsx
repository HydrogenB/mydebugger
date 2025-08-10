/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useDeviceTrace from './hooks/useDeviceTrace';
import DeviceTraceView from './components/DeviceTracePanel';

const DeviceTracePage: React.FC = () => {
  const vm = useDeviceTrace();
  React.useEffect(() => {
    document.title = 'Device Trace | MyDebugger';
  }, []);
  return <DeviceTraceView {...vm} />;
};

export default DeviceTracePage;
