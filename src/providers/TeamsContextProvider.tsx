import React, { createContext, useContext, useState } from 'react';
import { GroupType, TeamType } from '../model/Teams';

interface TeamsState {
  teamType: TeamType;
  groupType: GroupType;
}

interface TeamsContextI {
  teamContextState?: TeamsState;
  setTeamContextState?: React.Dispatch<React.SetStateAction<TeamsState>>;
}

export const TeamsContext = createContext<TeamsContextI>({});

const TeamsContextProvider: React.FC<{ initialState: TeamsState }> = ({ children, initialState }) => {
  const [teamContextState, setTeamContextState] = useState<TeamsState>(initialState);

  return <TeamsContext.Provider value={{ teamContextState, setTeamContextState }}>{children}</TeamsContext.Provider>;
};

export const useTeamsContext = () => {
  const { teamContextState, setTeamContextState } = useContext(TeamsContext);
  if (!teamContextState || !setTeamContextState)
    throw new Error('useTeamsContext must be used within a TeamsContextProvider');
  return { teamContextState, setTeamContextState };
};

export default TeamsContextProvider;
