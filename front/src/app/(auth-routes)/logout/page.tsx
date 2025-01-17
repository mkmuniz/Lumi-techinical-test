"use client"

import React from "react";
import Link from "next/link";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import LogoutIcon from "@/../public/assets/icons/logout.svg";
import Image from "next/image";

export default function LogoutButton() {
    const router = useRouter();

    async function logout() {
        await signOut({
            redirect: false
        });

        router.replace('/');
    };

    return <>
        <li className="list-none">
            <Link onClick={logout} href="/logout" className="flex items-center p-2 text-white rounded-lg group">
                <Image src={LogoutIcon} alt="BrightFlow Logout Icon" />
            </Link>
        </li>
    </>;
};