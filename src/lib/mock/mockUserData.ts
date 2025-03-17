import { Metrics } from '@/app/metrics/page';

// Realistic names for the mock data
const names = [
  "אורי כהן", "יובל לוי", "איתי ישראלי", "עומר אביב",
  "נעם ברק", "רועי אדם", "דניאל שלום", "עידו מור",
  "גיא דרור", "אסף גולן", "אלון שגיא", "טל רון",
  "יונתן דוד", "רז אמיר", "אריאל נוי", "ליאור עוז"
];

// Generate realistic range of metrics
const generateMetrics = (): Omit<Metrics, 'id' | 'userId'> => {
  // Generate realistic 3000m run time (between 11:30 and 18:00)
  const min3000 = Math.floor(Math.random() * (18 - 11) + 11);
  const sec3000 = Math.floor(Math.random() * 60);
  const run3000m = `${min3000}:${sec3000.toString().padStart(2, '0')}`;
  
  // Generate realistic 400m run time (between 0:50 and 1:50)
  const min400 = Math.floor(Math.random() * 2);
  const sec400 = Math.floor(Math.random() * 60) + (min400 === 0 ? 50 : 0);
  const run400m = `${min400}:${sec400.toString().padStart(2, '0')}`;
  
  // Generate reps data
  const pullUps = Math.floor(Math.random() * 20 + 5).toString();
  const pushUps = Math.floor(Math.random() * 40 + 15).toString();
  const sitUps2min = Math.floor(Math.random() * 45 + 20).toString();
  
  // Randomize date within last 30 days
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  
  return {
    run3000m,
    run400m,
    pullUps,
    pushUps,
    sitUps2min,
    createdAt: date.toISOString()
  };
};

// Generate a user with metrics
const generateUser = (index: number): { 
  id: string; 
  name: string; 
  photoURL: string | null;
  group: string;
  metrics: Metrics
} => {
  const userId = `mock-user-${index}`;
  const name = names[index % names.length];
  
  // Use realistic avatar URLs or null for some users
  const hasPhoto = Math.random() > 0.3;
  const photoURL = hasPhoto ? `https://i.pravatar.cc/150?u=${userId}` : null;
  
  // Assign to groups - either "כיתה א", "כיתה ב", or "כיתה ג"
  const groups = ["כיתה א", "כיתה ב", "כיתה ג"];
  const group = groups[index % groups.length];
  
  const metricsData = generateMetrics();
  
  return {
    id: userId,
    name,
    photoURL,
    group,
    metrics: {
      ...metricsData,
      id: `mock-metrics-${index}`,
      userId
    }
  };
};

// Generate array of mock users
export const generateMockUsers = (count: number = 15) => {
  return Array.from({ length: count }, (_, i) => generateUser(i));
};

// Get mock user by ID
export const getMockUserById = (id: string) => {
  const allUsers = generateMockUsers();
  return allUsers.find(user => user.id === id);
};

// Get all mock metrics for comparison
export const getAllMockMetrics = () => {
  return generateMockUsers().map(user => ({
    ...user.metrics,
    userName: user.name,
    userGroup: user.group,
    photoURL: user.photoURL
  }));
};

export default generateMockUsers; 