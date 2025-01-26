export const fadeIn = (direction: string, delay = 0) => {

    return {
        
            hidden: {
                opacity: 0,
                x: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
                y: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
            },
            show: {
                x: 0,
                y: 0,
                opacity: 1,
                transition: {
                    type: 'tween',
                    delay: delay,
                    duration: 1.2,
                    ease : [0.25, 0.25, 0.25, 0.75]
                },
            
        }
    }
}