import React, { useState, useEffect, useRef } from 'react';

const Timer: React.FC = () => {
    const [count, setCount] = useState(0);
    const [running, setRunning] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setCount(prev => prev + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [running]);

    return (
        <div>
            <p>Timer: {count}</p>
            <button onClick={() => setRunning(prev => !prev)}>
                {running ? 'Stop' : 'Start'}
            </button>
        </div>
    );
};

export default Timer;
