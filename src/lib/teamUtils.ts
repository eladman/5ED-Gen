interface Team {
  id: string;
  name: string;
  age: string; // Team age category: נוער/נערים/ילדים
}

// List of all teams with their IDs
export const teams: Team[] = [
  { id: '85074', name: 'הוד השרון נוער בנים (יא-יב)', age: 'נוער' },
  { id: '85083', name: 'עמק חפר מערב נערים (ט-י)', age: 'נערים' },
  { id: '83457', name: 'רעננה נערות (ט-י)', age: 'נערים' },
  { id: '83458', name: 'רעננה ילדים (ו-ז)', age: 'ילדים' },
  { id: '83490', name: 'קרית אונו ילדים (ז-ט)', age: 'ילדים' },
  { id: '83485', name: 'כפר יונה נערים (ח-ט)', age: 'נערים' },
  { id: '85086', name: 'כוכב יאיר ילדים ( ז-ח)', age: 'ילדים' },
  { id: '83471', name: 'זכרון יעקב ילדים (ז-ט)', age: 'ילדים' },
  { id: '85079', name: 'כפר יונה ילדים (ו-ז)', age: 'ילדים' },
  { id: '85093', name: 'עמק חפר מזרח ילדים (ז-ט)', age: 'ילדים' },
  { id: '83456', name: 'רעננה נערים (ט-י)', age: 'נערים' },
  { id: '85084', name: 'עמק חפר מערב ילדים (ז-ח)', age: 'ילדים' },
  { id: '83496', name: 'כוכב יאיר נערים (ט-י)', age: 'נערים' },
  { id: '83493', name: 'עמק מערב נוער בנים (יא-יב)', age: 'נוער' },
  { id: '83494', name: 'עמק מערב נוער בנות (יא-יב)', age: 'נוער' },
  { id: '83499', name: 'עמק חפר מזרח נוער בנים (יא-יב)', age: 'נוער' },
  { id: '83483', name: 'כפר יונה נוער בנים (יא-יב)', age: 'נוער' },
  { id: '83455', name: 'רעננה נוער בנות (יא-יב)', age: 'נוער' },
  { id: '83468', name: 'קריית טבעון נוער בנים (יא-יב)', age: 'נוער' },
  { id: '83489', name: 'קרית אונו נוער בנים (יא-יב)', age: 'נוער' },
  { id: '85085', name: 'כוכב יאיר בנות (יא-יב)', age: 'נוער' },
  { id: '83454', name: 'רעננה נוער בנים (יא-יב)', age: 'נוער' },
  { id: '83469', name: 'זכרון יעקב נוער בנים (יא-יב)', age: 'נוער' },
  { id: '83495', name: 'כוכב יאיר נוער בנים (יא-יב)', age: 'נוער' },
  { id: '85078', name: 'כפר יונה נוער בנות (יא-יב)', age: 'נוער' },
  { id: '83470', name: 'זכרון יעקב נוער בנות (יא-יב)', age: 'נוער' },
  { id: '83467', name: 'עמק יזרעאל נערים (ט-י)', age: 'נערים' },
  { id: '85076', name: 'הוד השרון נערים (ט-י)', age: 'נערים' },
  { id: '85077', name: 'הוד השרון ילדים (ז-ח)', age: 'ילדים' },
  { id: '85082', name: 'הרצליה ילדים (ו-ז)', age: 'ילדים' },
  { id: '83498', name: 'כפר סבא נערים (י)', age: 'נערים' },
  { id: '85087', name: 'כפר סבא נערים (ח-ט)', age: 'נערים' },
  { id: '83460', name: 'אבן יהודה נערים (ט-י)', age: 'נערים' },
  { id: '83461', name: 'אבן יהודה ילדים (ז-ח)', age: 'ילדים' },
  { id: '83488', name: 'הרצליה נערים (ח-ט)', age: 'נערים' },
  { id: '83464', name: 'תל מונד ילדים (ז-ט)', age: 'ילדים' },
  { id: '85089', name: 'כפר סבא ילדים (ו-ז)', age: 'ילדים' },
  { id: '85069', name: 'עמק יזרעאל ילדים (ז-ח)', age: 'ילדים' },
  { id: '85095', name: 'תל אביב ילדים (ז-ט)', age: 'ילדים' },
  { id: '85091', name: 'גבעת שמואל נוער בנים (יא-יב)', age: 'נוער' },
  { id: '85096', name: 'כפר סבא נוער בנים (יא-יב)', age: 'נוער' },
  { id: '83465', name: 'עמק יזרעאל נוער בנים (יא-יב)', age: 'נוער' },
  { id: '85075', name: 'הוד השרון נוער בנות (יא-יב)', age: 'נוער' },
  { id: '83487', name: 'הרצליה נוער בנים (יא-יב)', age: 'נוער' },
  { id: '83497', name: 'כפר סבא נוער בנות (יא-יב)', age: 'נוער' },
  { id: '83459', name: 'אבן יהודה נוער בנים (יא-יב)', age: 'נוער' },
  { id: '85067', name: 'אבן יהודה נוער בנות (יא-יב)', age: 'נוער' },
  { id: '83462', name: 'תל מונד נוער בנים (י-יב)', age: 'נוער' },
  { id: '83466', name: 'עמק יזרעאל נוער בנות (יא-יב)', age: 'נוער' },
  { id: '83491', name: 'תל אביב נוער בנים (יא-יב)', age: 'נוער' },
  { id: '83492', name: 'תל אביב נוער בנות (יא-יב)', age: 'נוער' },
  { id: '83463', name: 'תל מונד נוער בנות (יא-יב)', age: 'נוער' },
  { id: '85080', name: 'הרצליה נוער בנות (יא-יב)', age: 'נוער' },
  { id: '92064', name: 'קרית אונו בנות (י\'-יב\')', age: 'נוער' },
  { id: '91389', name: 'גבעת שמואל חטיבות', age: 'ילדים' },
  { id: '87625', name: 'קריית טבעון בנות', age: 'נוער' },
  // New teams added - all of type "נוער" for score comparison
  { id: '93001', name: 'צוות - מאמנים', age: 'נוער' },
  { id: '93002', name: 'צוות - מאמנות', age: 'נוער' },
  { id: '93003', name: 'כרמל בנים', age: 'נוער' },
  { id: '93004', name: 'כרמל בנות', age: 'נוער' },
  { id: '93005', name: 'מכינה בנים', age: 'נוער' },
  { id: '93006', name: 'מכינה בנות', age: 'נוער' },
];

/**
 * Get a team by its ID
 * @param teamId The team ID to look up
 * @returns The team object if found, or undefined if not found
 */
export const getTeamById = (teamId: string): Team | undefined => {
  return teams.find(team => team.id === teamId);
};

/**
 * Get a team name by its ID
 * @param teamId The team ID to look up
 * @returns The team name if found, or an empty string if not found
 */
export const getTeamNameById = (teamId: string): string => {
  const team = getTeamById(teamId);
  return team ? team.name : '';
};

/**
 * Get the team type (נוער/נערים/ילדים) based on the team name
 * @param teamName The team name to analyze
 * @returns The team type as a string
 */
export const getTeamType = (teamName: string): string => {
  // First try to find the team in our list and use its age field
  const team = teams.find(t => t.name === teamName);
  if (team) {
    return team.age;
  }
  
  // Fallback to the original logic for any teams not in our list
  if (teamName.includes('נוער')) return 'נוער';
  if (teamName.includes('נערים') || teamName.includes('נערות')) return 'נערים';
  if (teamName.includes('ילדים') || teamName.includes('חטיבות')) return 'ילדים';
  
  // Explicitly handle the special teams as "נוער" type
  const specialTeams = [
    'צוות - מאמנים', 
    'צוות - מאמנות', 
    'כרמל בנים', 
    'כרמל בנות', 
    'מכינה בנים', 
    'מכינה בנות'
  ];
  
  if (specialTeams.includes(teamName)) return 'נוער';
  
  return '';
};

/**
 * Get a team's age category by its ID
 * @param teamId The team ID to look up
 * @returns The team age category if found, or an empty string if not found
 */
export const getTeamAge = (teamId: string): string => {
  const team = getTeamById(teamId);
  return team ? team.age : '';
};

const teamUtils = {
  teams,
  getTeamById,
  getTeamNameById,
  getTeamType,
  getTeamAge,
};

export default teamUtils; 