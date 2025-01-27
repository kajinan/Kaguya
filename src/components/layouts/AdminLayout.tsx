import NavItem from "@/components/shared/NavItem";
import Logo from "@/components/shared/Logo";
import Head from "@/components/shared/Head";
import classNames from "classnames";
import Link from "next/link";
import React, { useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { BiLogOutCircle } from "react-icons/bi";
import { CgGhostCharacter } from "react-icons/cg";
import { GiCrownedSkull, GiHamburgerMenu } from "react-icons/gi";
import { AnimatePresence, motion, Variants } from "framer-motion";
import useDevice from "@/hooks/useDevice";
import { getScrollbarSize } from "@/utils";

const routes = [
  {
    title: "Trang chủ",
    href: "/admin",
    icon: AiOutlineHome,
  },
  {
    title: "Anime",
    href: "/admin/anime",
    icon: GiCrownedSkull,
  },
  {
    title: "Manga",
    href: "/admin/manga",
    icon: CgGhostCharacter,
  },
];

const variants: Variants = {
  animate: {
    x: 0,
  },
  initial: {
    x: "-100%",
  },
};

const AdminLayout: React.FC = ({ children }) => {
  const { isMobile } = useDevice();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="w-full min-h-screen flex justify-end">
      <Head title="Admin - Kaguya" />

      {isMobile && isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      <AnimatePresence initial={isMobile}>
        <motion.div
          variants={variants}
          transition={{ ease: "linear" }}
          animate={!isMobile || isMenuOpen ? "animate" : ""}
          initial="initial"
          className="h-full w-[70vw] md:w-[20vw] fixed top-0 left-0 bottom-0 z-50 flex flex-col justify-between bg-background-900 p-4"
        >
          <div>
            <Logo />

            <ul className="space-y-2">
              {routes.map((route) => (
                <NavItem className="block" href={route.href} key={route.href}>
                  {({ isActive }) => (
                    <li
                      className={classNames(
                        "flex items-center space-x-2 transition duration-300 font-semibold px-3 py-2 cursor-pointer rounded-md",
                        isActive ? "bg-primary-600" : "hover:bg-white/20"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <route.icon className="w-6 h-6" />

                      <p>{route.title}</p>
                    </li>
                  )}
                </NavItem>
              ))}
            </ul>
          </div>

          <Link href="/">
            <a className="w-full">
              <li
                className={classNames(
                  "flex items-center space-x-2 hover:bg-white/20 transition duration-300 font-semibold px-3 py-2 cursor-pointer rounded-md"
                )}
              >
                <BiLogOutCircle className="w-6 h-6" />

                <p>Quay về trang chủ</p>
              </li>
            </a>
          </Link>
        </motion.div>
      </AnimatePresence>

      <div className="w-full md:w-4/5 pt-16 pb-4 md:py-12">
        {isMobile && (
          <GiHamburgerMenu
            className="absolute top-4 left-4 w-8 h-8"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
            }}
          />
        )}

        <div className="relative w-full h-full">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
