import {useState} from 'react';

export const useOnOffSwitch = () => {
  const [isOn, setIsOn] = useState(false);

  const setOn = () => setIsOn(true);
  const setOff = () => setIsOn(false);
  const toggleSwitch = () => setIsOn(prev => !prev);

  return {isOn, setOn, setOff, toggleSwitch};
};

