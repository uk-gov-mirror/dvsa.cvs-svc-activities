import { ActivityType, StationType } from '../assets/enums';

export const waitReasons: string[] = [
  'Waiting for vehicle',
  'Break',
  'Admin',
  'Site issue',
  'Other'
];
export const stationTypes: string[] = [
  StationType.ATF,
  StationType.GVTS,
  StationType.HQ,
  StationType.POTF
];
export const activitiesTypes: string[] = [
  ActivityType.VISIT,
  ActivityType.WAIT,
  ActivityType.UNACCOUNTABLE_TIME
];

export interface IActivity {
  id?: string;
  parentId?: string;
  activityType: ActivityType;
  testStationName: string;
  testStationPNumber: string;
  testStationEmail: string;
  testStationType: StationType;
  testerName: string;
  testerStaffId: string;
  testerEmail?: string;
  startTime?: string;
  endTime?: null | string;
  waitReason?: [string];
  notes?: string;
  activityDay?: string;
}

export interface IActivityParams {
  fromStartTime: string;
  toStartTime: string;
  activityType?: string;
  testStationPNumber?: string;
  testerStaffId?: string;
  isOpen?: boolean;
}
