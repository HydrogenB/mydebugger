/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import useWebsocketSimulator from '../../../viewmodel/useWebsocketSimulator';
import WebsocketSimulatorView from '../../../view/WebsocketSimulatorView';

const WebsocketSimulatorPage: React.FC = () => {
  const vm = useWebsocketSimulator();
  return <WebsocketSimulatorView {...vm} />;
};

export default WebsocketSimulatorPage;
