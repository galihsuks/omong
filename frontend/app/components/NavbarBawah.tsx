import Link from "next/link";
import React from "react";

interface NavbarBawahProps {
    path: string;
}
const NavbarBawah: React.FC<NavbarBawahProps> = ({ path }) => {
    return (
        <div className="px-5 py-1 navbar-bawah">
            <Link
                href={"/room"}
                className={"item p-4" + (path == "/room" ? " active" : "")}
            >
                <i className="material-icons">chat</i>
            </Link>
            <Link
                href={"/account"}
                className={"item p-4" + (path == "/account" ? " active" : "")}
            >
                <i className="material-icons">perm_identity</i>
            </Link>
        </div>
    );
};
export default NavbarBawah;
