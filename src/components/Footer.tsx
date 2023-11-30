import React from "react";
import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-200 bg-white/75 backdrop-blur-lg transition-all p-4 text-center">
      <div className="flex justify-center items-center space-x-4 border-zinc-200">
        <a
          href="https://www.linkedin.com/in/omar-el-nemr-0b046017a/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-blue-500"
        >
          <FaLinkedin size={24} />
        </a>
        <a
          href="https://github.com/omar99elnemr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-black"
        >
          <FaGithub size={24} />
        </a>
        <a
          href="mailto:o.elnemr1999@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-red-500"
        >
          <FaEnvelope size={24} />
        </a>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        © 2023 Docubot™. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
