import { Pacifico } from "next/font/google";

export const pacifico_init = Pacifico({ 
    subsets: ["latin"],
    weight: "400",
    style: "normal"
 });

export const pacifico = pacifico_init.className;