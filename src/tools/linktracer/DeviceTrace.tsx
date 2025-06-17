/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useDeviceTrace from '../../../viewmodel/useDeviceTrace';
import DeviceTraceView from '../../../view/DeviceTraceView';

const DeviceTracePage: React.FC = () => {
  const vm = useDeviceTrace();
  React.useEffect(() => {
    document.title = 'Device Trace | MyDebugger';
  }, []);
  return <DeviceTraceView {...vm} />;
};

export default DeviceTracePage;
