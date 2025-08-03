/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import MicrophonePreview from '../view/DataPreview/MicrophonePreview';

// Mock the Web Audio API
class MockAudioContext {
  createAnalyser() {
    return new MockAnalyser();
  }
  createMediaStreamSource() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
  }
  close() {}
  get state() { return 'running'; }
}

class MockAnalyser {
  fftSize = 256;
  getByteFrequencyData() {}
  get frequencyBinCount() {
    return 1024;
  }
}

// Mock requestAnimationFrame
const mockRequestAnimationFrame = (global as any).requestAnimationFrame = 
  (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(performance.now()), 0);
  };

// Mock cancelAnimationFrame
const mockCancelAnimationFrame = (global as any).cancelAnimationFrame = 
  (id: number) => {
    clearTimeout(id);
  };

describe('MicrophonePreview Component', () => {
  let mockStream: MediaStream;
  let mockOnStop: jest.Mock;

  beforeEach(() => {
    // Create a mock MediaStream
    mockStream = new MediaStream();
    mockOnStop = jest.fn();
    
    // Mock the AudioContext
    (global as any).AudioContext = MockAudioContext;
    (global as any).webkitAudioContext = MockAudioContext;
    
    // Mock the MediaStream
    global.MediaStream = jest.fn().mockImplementation(() => ({
      getTracks: () => [{
        stop: jest.fn(),
        getSettings: () => ({}),
      }],
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('renders with initial state', () => {
    render(<MicrophonePreview stream={mockStream} onStop={mockOnStop} />);
    
    expect(screen.getByText('Microphone Preview')).toBeInTheDocument();
    expect(screen.getByLabelText('Mute')).toBeInTheDocument();
    expect(screen.getByLabelText('Stop')).toBeInTheDocument();
  });

  it('toggles mute state when mute button is clicked', () => {
    render(<MicrophonePreview stream={mockStream} onStop={mockOnStop} />);
    
    const muteButton = screen.getByLabelText('Mute');
    fireEvent.click(muteButton);
    
    expect(screen.getByLabelText('Unmute')).toBeInTheDocument();
    
    fireEvent.click(muteButton);
    expect(screen.getByLabelText('Mute')).toBeInTheDocument();
  });

  it('calls onStop when stop button is clicked', () => {
    render(<MicrophonePreview stream={mockStream} onStop={mockOnStop} />);
    
    const stopButton = screen.getByLabelText('Stop');
    fireEvent.click(stopButton);
    
    expect(mockOnStop).toHaveBeenCalledTimes(1);
  });

  it('displays error message when audio initialization fails', () => {
    // Mock a failing AudioContext
    const FailingAudioContext = class extends MockAudioContext {
      createAnalyser(): MockAnalyser {
        throw new Error('Audio initialization failed');
      }
    };
    (global as any).AudioContext = FailingAudioContext;
    
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<MicrophonePreview stream={mockStream} onStop={mockOnStop} />);
    
    expect(consoleError).toHaveBeenCalledWith(
      'Error initializing audio:',
      expect.any(Error)
    );
    
    consoleError.mockRestore();
  });

  it('cleans up resources on unmount', () => {
    const { unmount } = render(
      <MicrophonePreview stream={mockStream} onStop={mockOnStop} />
    );
    
    unmount();
    
    // Verify that cleanup functions were called
    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });

  it('updates audio level visualization', async () => {
    // Use fake timers to control requestAnimationFrame
    jest.useFakeTimers();
    
    // Mock getByteFrequencyData to return test data
    const mockGetByteFrequencyData = jest.fn((array: Uint8Array) => {
      // Fill the array with test data
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    });
    
    // Create a test analyser with proper typing
    class TestAnalyser extends MockAnalyser {
      getByteFrequencyData() {
        // Call the mock function with a dummy array since we can't access the real one
        const dummyArray = new Uint8Array(1024);
        mockGetByteFrequencyData(dummyArray);
      }
    }
    
    (global as any).AudioContext = class extends MockAudioContext {
      createAnalyser() {
        const analyser = new MockAnalyser();
        (analyser as any).getByteFrequencyData = mockGetByteFrequencyData;
        return analyser;
      }
    };
    
    render(<MicrophonePreview stream={mockStream} onStop={mockOnStop} />);
    
    // Fast-forward time to trigger animation frame
    act(() => {
      jest.runAllTimers();
    });
    
    // Verify that getByteFrequencyData was called
    expect(mockGetByteFrequencyData).toHaveBeenCalled();
  });
});
