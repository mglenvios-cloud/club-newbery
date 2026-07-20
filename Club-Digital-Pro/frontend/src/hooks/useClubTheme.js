"use client";

import { useClub } from '../app/providers';

export function useClubTheme() {
  const { club, setClub, availableClubs } = useClub();

  return {
    club,
    setClub,
    availableClubs,
    colors: {
      primary: club.colorPrimario,
      secondary: club.colorSecundario,
      menu: club.colorMenu,
      button: club.colorBotones,
      text: club.colorTexto
    }
  };
}
