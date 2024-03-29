import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import PlayButton from './PlayButton';
import PauseButton from './PauseButton';
import SettingsButton from './SettingsButton';
import {useContext, useState, useEffect, useRef} from 'react';
import SettingsContext from './SettingsContext';
import sound from "./assets/chocobo_wark.mp3";


const red = '#f54e4e';
const green = '#4aec8c';

function Timer() {
    const settingsInfo = useContext(SettingsContext);

    const [isPaused, setIsPaused] = useState(true);
    const [mode, setMode] = useState('Work'); //Work/Break/null
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [cycleCount, setCycleCount] = useState(0);

    const secondsLeftRef = useRef(secondsLeft);
    const isPausedRef = useRef(isPaused);
    const modeRef = useRef(mode);
    const audioRef = useRef(new Audio(sound));

    function switchMode () {
        const nextMode = modeRef.current === 'Work' ? 'Break' : 'Work';
        const nextSeconds = (nextMode ==='Work' ? settingsInfo.workMinutes  : settingsInfo.breakMinutes) * 60;
        setMode(nextMode);
        modeRef.current = nextMode;

        setSecondsLeft(nextSeconds);
        secondsLeftRef.current = nextSeconds;
        //increment cycle count when both work and break timers complete
         if (nextMode === 'Work') {
        setCycleCount(prevCount => prevCount + 1);
         }
    }


    function tick() {
        secondsLeftRef.current--;
        setSecondsLeft(secondsLeftRef.current);
    }

    function initTimer() {
        secondsLeftRef.current = settingsInfo.workMinutes * 60;
        setSecondsLeft(secondsLeftRef.current);
    }

    useEffect(() => {
        initTimer();

        const interval = setInterval(() => {
            if (isPausedRef.current) {
                return;
            }
            if (secondsLeftRef.current === 0) {
                audioRef.current.play();
                 return switchMode();
            }
        
            tick();
        }, 1000);
        return () => clearInterval(interval);
    }, [settingsInfo]);

   
    const totalSeconds = mode === 'Work' 
    ? settingsInfo.workMinutes * 60 
    : settingsInfo.breakMinutes * 60;
    const percentage = Math.round(secondsLeft / totalSeconds * 100);

    const minutes = Math.floor(secondsLeft/ 60);
    let seconds = secondsLeft % 60;
    if(seconds < 10) seconds = '0' + seconds;

    return (
        
        <div>
            <div style={{ marginTop: '20px', fontSize: 32 }}>
                <p>{mode}</p>
            </div>
            <CircularProgressbar 
            value={percentage} 
            text={minutes + ':' + seconds} 
            styles = {buildStyles({
                textColor: '#fff',
                pathColor: mode === 'Work' ?red : green,
                tailColor: 'rgb(255,255,255,.2)',
            })} />
            <div style={{marginTop:'20px'}}>
                {isPaused 
                ? <PlayButton onClick = {() => {setIsPaused(false); isPausedRef.current = false;}} /> 
                : <PauseButton onClick = {() => { setIsPaused(true); isPausedRef.current = true;}} />}
            </div>
            <div style={{marginTop:'20px'}}>
                <SettingsButton onClick={() => settingsInfo.setShowSettings(true)} />
            </div>
            <p>Cycles completed: {cycleCount}</p>
            
        </div>
    )
}

export default Timer;