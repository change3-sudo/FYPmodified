import Stage from './Stage';
import React from 'react'
const Console = () => {
    return ( // Added return statement here
        // <div className='grid-cols-2 h-full'>
        //     <div className="relative w-full h-full min-h-screen flex flex-row">
        //         <Cuelist/>
        //         <Stage/>
        //         <div className="relative right-0 top-7 z-0 bg-slate-500 opacity-75">
        //             <Buttons/>
        //         </div>
        //     </div>

        //     <div className="relative text-center text-top grid grid-cols-4 w-screen grid grid-flow-col auto-cols-max">
        //         <div>01</div>
        //         <div>02</div>
        //         <div>03</div>
        //         <div>04</div>
        //     </div>
        // </div>
    <div className= "fixed w-full h-full">
            <Stage/>
        </div>
    );
}

export default Console;