export enum ActivityType {
    visit = "visit",
    wait = "wait",
    unaccountableTime = "unaccountable time"
}

export enum StationType {
    atf = "atf",
    gvts = "gvts",
    hq = "hq"
}

export const waitReasons: string[] = ["Waiting for vehicle", "Break", "Admin", "Site issue", "Other"];

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
