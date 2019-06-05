import { ActivityType, StationType } from "../assets/enums";

export const waitReasons: string[] = ["Waiting for vehicle", "Break", "Admin", "Site issue", "Other"];
export const stationTypes: string[] = [StationType.ATF, StationType.GVTS, StationType.HQ];
export const activitiesTypes: string[] = [ActivityType.VISIT, ActivityType.WAIT, ActivityType.UNACCOUNTABLE_TIME];


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
    startTime?: string;
    endTime?: string;
    waitReason?: [string];
    notes?: string;
}
