export enum ActivityType {
    visit = "visit",
    wait = "wait"
}

export enum StationType {
    atf = "atf",
    gvts = "gvts",
    hq = "hq"
}

export interface IActivity {
    id?: string;
    activityType: ActivityType;
    testStationName: string;
    testStationPNumber: string;
    testStationEmail: string;
    testStationType: StationType;
    testerName: string;
    testerStaffId: string;
    startTime?: string;
    endTime?: string;
}
