import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import HumanTrackerView from '../view/HumanTrackerView';

test('toggles call handlers', () => {
  const setPose = jest.fn();
  const setHands = jest.fn();
  const setPeople = jest.fn();
  const { getByLabelText } = render(
    <HumanTrackerView
      videoRef={{ current: null }}
      canvasRef={{ current: null }}
      showPose={true}
      setShowPose={setPose}
      showHands={false}
      setShowHands={setHands}
      showPeople={true}
      setShowPeople={setPeople}
      status="Ready"
    />,
  );
  fireEvent.click(getByLabelText('Pose'));
  expect(setPose).toHaveBeenCalledWith(false);
  fireEvent.click(getByLabelText('Hands'));
  expect(setHands).toHaveBeenCalledWith(true);
  fireEvent.click(getByLabelText('People'));
  expect(setPeople).toHaveBeenCalledWith(false);
});
