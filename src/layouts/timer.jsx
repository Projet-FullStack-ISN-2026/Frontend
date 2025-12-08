import { useState, useEffect } from 'react';

function Timer(){
    const [timeLeft, setTimeLeft] = useState(20);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);
    return(
        <p className="timer">{timeLeft}s</p>
    )
}
export default Timer;