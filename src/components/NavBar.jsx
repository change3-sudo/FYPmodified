import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { navLinks } from "../constants";

import { ReactSVG } from 'react-svg';

const Navbar = () => {
    const[active, setActive] = useState("");
    const[toggle, setToggle] = useState(false);
    return(
        <nav
        className ={`sm:px-16 px-6 w-full flex items-center py-5 fixed top-0 z-20 bg-primary`}>
          <div className="w-full flex justify-between items-center max-w-7x1 mx-auto">
            <Link 
              to="/"
              className="flex items-center gap-2" onClick={() => {
                setActive("");
                window.scrollTo(0, 0);
              }}
            >
<ReactSVG src= "react.svg"/>
              <p className=" text-[18px] font-bold flex">Ming &nbsp;<span className="sm:block hidden">| Lighting Simulator</span></p>
            </Link>
            <ul className="list-none hidden sm:flex flex-row gap-10">
          {navLinks.map((link) => (
            <li
              key={link.id}
              className={`${
                active === link.title
                ? "text-white"
                : "text-secondary"
                } hover:text-white text-[18px]
                font-medium cursor-pointer`}
                onClick = {() => setActive(link.title)}
            >
                
              <a href={`#${link.id}`}>{link.title}</a>
            </li>
        ))}
        </ul>
        <div className='sm:hidden flex flex-1 justify-end items-center'>
        <ReactSVG src= "react.svg"/>
           <div className = {`${!toggle ? 'hidden':'flex'} p-6 black-gradient absolut top-20 right-0 mx-4 my-2 min-w-[140px] z-10 rounded-xl`}>
            <ul className="list-none flex justify-end items-start flex: 1 flex-col gap-4">
            {navLinks.map((nav) => (
              <li
                key={nav.id}
                className={`${
                  active === nav.title
                  ? "text-white"
                  : "text-secondary"
                  } font-poppins font-medium
                  font-medium cursor-pointer text-[16px]`}
                  onClick = {() => {
                    setToggle(!toggle);
                    setActive(nav.title)
                  }}
              >
                <a href={`#${nav.id}`}>{nav.title}</a>
              </li>
            ))}
            </ul>
           </div>
          </div>
            </div>
            </nav>

    );
}

export default Navbar;