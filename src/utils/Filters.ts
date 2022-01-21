import { IActivity } from '../models/Activity';

export class ActivityFilters {
  // tslint:disable-next-line: no-empty
  public constructor() {}

  /**
   * Order Activities desc by Start Time
   * @param activities Array of activities
   * @returns Array of Activities ordered desc
   */
  public returnOrderedActivities(activities: IActivity[]): IActivity[] {
    const sortDateDesc = (activity1: IActivity, activity2: IActivity) => {
      const date = new Date(activity1.startTime as string).toISOString();
      const dateToCompare = new Date(activity2.startTime as string).toISOString();
      if (date > dateToCompare) {
        return -1;
      }
      if (date < dateToCompare) {
        return 1;
      }
      return 0;
    };
    activities.sort(sortDateDesc);
    return activities;
  }
}
