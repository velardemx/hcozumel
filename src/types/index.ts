export interface User {
  id: string;
  email: string;
  role: 'superadmin' | 'president' | 'worker';
  name: string;
  area?: string;
}

export interface WorkReport {
  id: string;
  userId: string;
  area: string;
  startTime: Date;
  endTime?: Date;
  status: 'in-progress' | 'completed';
  startImage: string;
  endImage?: string;
  location: {
    lat: number;
    lng: number;
  };
  description: string;
}